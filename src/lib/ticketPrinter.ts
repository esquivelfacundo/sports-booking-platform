/**
 * ESC/POS Ticket Printer Service
 * Integración con impresoras térmicas vía WebUSB
 */

// WebUSB type declarations
declare global {
  interface Navigator {
    usb: USB;
  }
  interface USB {
    requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>;
  }
  interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
  }
  interface USBDevice {
    open(): Promise<void>;
    close(): Promise<void>;
    selectConfiguration(configurationValue: number): Promise<void>;
    claimInterface(interfaceNumber: number): Promise<void>;
    transferOut(endpointNumber: number, data: Uint8Array): Promise<USBOutTransferResult>;
  }
  interface USBOutTransferResult {
    bytesWritten: number;
    status: 'ok' | 'stall' | 'babble';
  }
}

import { LOGO_RASTER_DATA, LOGO_WIDTH_BYTES, LOGO_HEIGHT } from './logoData';

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';
const NL = '\n';
const BOLD_ON = ESC + 'E' + '\x01';
const BOLD_OFF = ESC + 'E' + '\x00';
const DOUBLE_HEIGHT = ESC + '!' + '\x10';
const NORMAL_TEXT = ESC + '!' + '\x00';
const CENTER = ESC + 'a' + '\x01';
const LEFT = ESC + 'a' + '\x00';
const CUT = ESC + 'i';

// Character mapping for thermal printers (remove accents)
const charMap: Record<string, string> = {
  'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n',
  'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ñ': 'N',
  '¡': '!', '¿': '?', '“': '"', '”': '"', '–': '-', '—': '-', '…': '...',
  '´': "'", '¨': '', 'º': 'o', 'ª': 'a', '→': '->', '°': 'o'
};

function sanitizeText(text: string): string {
  let result = text;
  for (const [char, replacement] of Object.entries(charMap)) {
    result = result.replace(new RegExp(char, 'g'), replacement);
  }
  // Remove any remaining non-ASCII characters
  return result.replace(/[^\x20-\x7E]/g, '');
}

function formatPrice(amount: number): string {
  return '$' + amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function padRight(text: string, length: number): string {
  return text.substring(0, length).padEnd(length, ' ');
}

function padLeft(text: string, length: number): string {
  return text.substring(0, length).padStart(length, ' ');
}

export interface TicketItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TicketPayment {
  playerName?: string;
  method: string;
  amount: number;
}

export interface TicketData {
  // Header
  establishmentName: string;
  orderNumber?: string;
  
  // Booking info (optional)
  courtName?: string;
  sportName?: string;
  date?: string;
  time?: string;
  
  // Client
  clientName?: string;
  clientPhone?: string;
  
  // Financial
  courtPrice?: number;
  consumptionsTotal?: number;
  depositPaid?: number;
  paymentsDeclared?: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  
  // Items
  items?: TicketItem[];
  
  // Payments
  payments?: TicketPayment[];
  
  // Footer
  cashierName?: string;
  
  // QR Code URL (for establishment profile / reservation)
  establishmentUrl?: string;
  
  // Review URL (unique per booking - for rating QR)
  reviewUrl?: string;
  
  // Flag to indicate if this is a direct sale (no booking)
  isDirectSale?: boolean;
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    credit_card: 'Credito',
    debit_card: 'Debito',
    mercadopago: 'MercadoPago'
  };
  return labels[method] || method;
}

/**
 * Generate ESC/POS commands to print a QR code
 * Uses GS ( k command for QR code printing
 */
function generateQRCodeCommands(url: string): Uint8Array {
  const data = new TextEncoder().encode(url);
  const dataLen = data.length + 3; // data + pL pH cn
  
  // QR Code model selection: GS ( k pL pH cn fn n
  // cn = 49 (QR Code), fn = 65 (model), n = 50 (Model 2)
  const modelCmd = new Uint8Array([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]);
  
  // QR Code size: GS ( k pL pH cn fn n
  // cn = 49, fn = 67 (size), n = 4 (module size 4 dots)
  const sizeCmd = new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x04]);
  
  // QR Code error correction: GS ( k pL pH cn fn n
  // cn = 49, fn = 69 (error correction), n = 48 (L level)
  const errorCmd = new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]);
  
  // Store QR Code data: GS ( k pL pH cn fn m d1...dk
  // cn = 49, fn = 80 (store data), m = 48
  const pL = (dataLen) & 0xFF;
  const pH = (dataLen >> 8) & 0xFF;
  const storeCmd = new Uint8Array([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]);
  
  // Print QR Code: GS ( k pL pH cn fn m
  // cn = 49, fn = 81 (print), m = 48
  const printCmd = new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]);
  
  // Center alignment
  const centerCmd = new Uint8Array([0x1B, 0x61, 0x01]);
  
  // Combine all commands
  const totalLen = centerCmd.length + modelCmd.length + sizeCmd.length + errorCmd.length + 
                   storeCmd.length + data.length + printCmd.length;
  const result = new Uint8Array(totalLen);
  let offset = 0;
  
  result.set(centerCmd, offset); offset += centerCmd.length;
  result.set(modelCmd, offset); offset += modelCmd.length;
  result.set(sizeCmd, offset); offset += sizeCmd.length;
  result.set(errorCmd, offset); offset += errorCmd.length;
  result.set(storeCmd, offset); offset += storeCmd.length;
  result.set(data, offset); offset += data.length;
  result.set(printCmd, offset);
  
  return result;
}

/**
 * Generate ESC/POS commands to print the logo using GS v 0 (raster bit image)
 * This is the standard command supported by most thermal printers
 */
function generateLogoCommands(): Uint8Array {
  // GS v 0 m xL xH yL yH d1...dk
  // m = 0 (normal mode), 1 (double width), 2 (double height), 3 (double both)
  // xL, xH = width in bytes (little-endian)
  // yL, yH = height in dots (little-endian)
  
  const xL = LOGO_WIDTH_BYTES & 0xFF;
  const xH = (LOGO_WIDTH_BYTES >> 8) & 0xFF;
  const yL = LOGO_HEIGHT & 0xFF;
  const yH = (LOGO_HEIGHT >> 8) & 0xFF;
  
  // Center alignment + GS v 0 command + raster data
  const centerCmd = new Uint8Array([0x1B, 0x61, 0x01]); // ESC a 1 (center)
  const gsv0Cmd = new Uint8Array([0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH]); // GS v 0 m xL xH yL yH
  
  // Combine: center + command + data
  const result = new Uint8Array(centerCmd.length + gsv0Cmd.length + LOGO_RASTER_DATA.length);
  result.set(centerCmd, 0);
  result.set(gsv0Cmd, centerCmd.length);
  result.set(LOGO_RASTER_DATA, centerCmd.length + gsv0Cmd.length);
  
  return result;
}

export function generateTicketData(data: TicketData): Uint8Array {
  let txt = '';
  const LINE_WIDTH = 42;
  const separator = '-'.repeat(LINE_WIDTH);
  
  // Header - centered
  txt += CENTER;
  txt += DOUBLE_HEIGHT + BOLD_ON + sanitizeText(data.establishmentName) + NORMAL_TEXT + BOLD_OFF + NL;
  txt += NL;
  
  // Date and time
  const now = new Date();
  txt += sanitizeText(now.toLocaleDateString('es-AR') + ' ' + now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })) + NL;
  
  if (data.cashierName) {
    txt += BOLD_ON + 'Cajero: ' + BOLD_OFF + sanitizeText(data.cashierName) + NL;
  }
  
  if (data.orderNumber) {
    txt += BOLD_ON + 'Pedido: ' + BOLD_OFF + sanitizeText(data.orderNumber) + NL;
  }
  
  txt += NL;
  txt += LEFT;
  
  // Booking info
  if (data.courtName || data.date || data.time) {
    txt += DOUBLE_HEIGHT + BOLD_ON + 'RESERVA' + NORMAL_TEXT + BOLD_OFF + NL;
    txt += separator + NL;
    
    if (data.courtName) {
      const courtLine = data.sportName 
        ? sanitizeText(data.courtName) + ' - ' + sanitizeText(data.sportName)
        : sanitizeText(data.courtName);
      txt += courtLine + NL;
    }
    if (data.date) {
      txt += 'Fecha: ' + sanitizeText(data.date) + NL;
    }
    if (data.time) {
      txt += 'Hora: ' + sanitizeText(data.time) + NL;
    }
    txt += NL;
  }
  
  // Client info
  if (data.clientName) {
    txt += BOLD_ON + 'Cliente: ' + BOLD_OFF + sanitizeText(data.clientName) + NL;
    txt += NL;
  }
  
  // Items (consumptions)
  if (data.items && data.items.length > 0) {
    txt += DOUBLE_HEIGHT + BOLD_ON + 'CONSUMOS' + NORMAL_TEXT + BOLD_OFF + NL;
    txt += separator + NL;
    
    for (const item of data.items) {
      const itemName = sanitizeText(item.name);
      const qty = item.quantity.toString();
      const price = formatPrice(item.totalPrice);
      
      txt += BOLD_ON + itemName + BOLD_OFF + NL;
      txt += '  ' + qty + ' x ' + formatPrice(item.unitPrice) + padLeft(price, LINE_WIDTH - qty.length - formatPrice(item.unitPrice).length - 6) + NL;
    }
    txt += NL;
  }
  
  // Financial summary
  txt += DOUBLE_HEIGHT + BOLD_ON + 'DETALLE DE PAGO' + NORMAL_TEXT + BOLD_OFF + NL;
  txt += separator + NL;
  
  if (data.courtPrice !== undefined && data.courtPrice > 0) {
    const label = 'Total cancha:';
    const value = formatPrice(data.courtPrice);
    txt += padRight(label, LINE_WIDTH - value.length) + value + NL;
  }
  
  if (data.consumptionsTotal !== undefined && data.consumptionsTotal > 0) {
    const label = 'Consumos:';
    const value = formatPrice(data.consumptionsTotal);
    txt += padRight(label, LINE_WIDTH - value.length) + value + NL;
  }
  
  if (data.depositPaid !== undefined && data.depositPaid > 0) {
    const label = 'Anticipo:';
    const value = '-' + formatPrice(data.depositPaid);
    txt += padRight(label, LINE_WIDTH - value.length) + value + NL;
  }
  
  if (data.paymentsDeclared !== undefined && data.paymentsDeclared > 0) {
    const label = 'Pagos declarados:';
    const value = '-' + formatPrice(data.paymentsDeclared);
    txt += padRight(label, LINE_WIDTH - value.length) + value + NL;
  }
  
  txt += separator + NL;
  
  // Totals
  const totalLabel = 'TOTAL:';
  const totalValue = formatPrice(data.totalAmount);
  txt += BOLD_ON + padRight(totalLabel, LINE_WIDTH - totalValue.length) + totalValue + BOLD_OFF + NL;
  
  const paidLabel = 'Pagado:';
  const paidValue = formatPrice(data.paidAmount);
  txt += padRight(paidLabel, LINE_WIDTH - paidValue.length) + paidValue + NL;
  
  if (data.pendingAmount > 0) {
    const pendingLabel = 'PENDIENTE:';
    const pendingValue = formatPrice(data.pendingAmount);
    txt += BOLD_ON + padRight(pendingLabel, LINE_WIDTH - pendingValue.length) + pendingValue + BOLD_OFF + NL;
  }
  
  // Payment details
  if (data.payments && data.payments.length > 0) {
    txt += NL;
    txt += BOLD_ON + 'PAGOS REALIZADOS' + BOLD_OFF + NL;
    txt += separator + NL;
    
    for (const payment of data.payments) {
      const name = sanitizeText(payment.playerName || 'Pago');
      const method = getPaymentMethodLabel(payment.method);
      const amount = formatPrice(payment.amount);
      const leftPart = name + ' (' + method + ')';
      txt += padRight(leftPart, LINE_WIDTH - amount.length) + amount + NL;
    }
  }
  
  // Footer - different content for direct sales vs bookings
  txt += NL + NL;
  txt += CENTER;
  
  if (data.isDirectSale) {
    // Direct sale: invite to book a court
    txt += BOLD_ON + 'Reserva tu proximo partido!' + BOLD_OFF + NL;
    txt += NL;
    txt += 'Escanea el QR y reserva' + NL;
    txt += 'tu cancha en segundos' + NL;
    txt += NL;
  } else {
    // Booking: ask for review
    txt += BOLD_ON + 'Como estuvo tu partido?' + BOLD_OFF + NL;
    txt += NL;
    txt += 'Tu opinion nos ayuda a crecer' + NL;
    txt += 'y darte una mejor atencion,' + NL;
    txt += 'escanea el QR y contanos' + NL;
    txt += 'como fue tu experiencia :)' + NL;
    txt += NL;
  }
  
  // Convert text to Uint8Array
  const encoder = new TextEncoder();
  const textData = encoder.encode(txt);
  
  // Generate QR code - for direct sales use establishment URL, for bookings use review URL
  const qrUrl = data.isDirectSale 
    ? (data.establishmentUrl || 'https://miscanchas.com')
    : (data.reviewUrl || data.establishmentUrl || 'https://miscanchas.com');
  const qrCode = generateQRCodeCommands(qrUrl);
  const qrSpacing = encoder.encode(NL + NL);
  const qrData = new Uint8Array(qrCode.length + qrSpacing.length);
  qrData.set(qrCode, 0);
  qrData.set(qrSpacing, qrCode.length);
  
  // Generate logo commands
  const logoData = generateLogoCommands();
  
  // Final spacing and cut (more space after logo)
  const footerData = encoder.encode(NL + NL + NL + NL + NL + NL + NL + NL + CUT);
  
  // Combine: text + QR + logo + footer
  const result = new Uint8Array(textData.length + qrData.length + logoData.length + footerData.length);
  let offset = 0;
  result.set(textData, offset); offset += textData.length;
  result.set(qrData, offset); offset += qrData.length;
  result.set(logoData, offset); offset += logoData.length;
  result.set(footerData, offset);
  
  return result;
}

export async function printTicket(data: TicketData): Promise<boolean> {
  try {
    // Request USB device
    const device = await navigator.usb.requestDevice({ filters: [] });
    
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    
    // Generate ticket data
    const ticketData = generateTicketData(data);
    
    // Send to printer
    await device.transferOut(1, ticketData);
    
    await device.close();
    
    return true;
  } catch (error) {
    console.error('Error printing ticket:', error);
    throw error;
  }
}

export function isWebUSBSupported(): boolean {
  return 'usb' in (navigator as unknown as Record<string, unknown>);
}

// Cash Register Ticket Types
export interface CashRegisterTicketPaymentMethod {
  name: string;
  code: string;
  amount: number;
  count: number;
}

export interface CashRegisterTicketExpense {
  description: string;
  category?: string;
  method: string;
  amount: number;
}

export interface CashRegisterTicketProduct {
  productName: string;
  quantity: number;
  totalAmount: number;
}

export interface CashRegisterTicketData {
  establishmentName: string;
  cashierName: string;
  cashRegisterId: string;
  openedAt: string;
  closedAt: string;
  
  // Totals
  initialCash: number;
  totalSales: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  totalOrders: number;
  
  // By payment method
  paymentMethods: CashRegisterTicketPaymentMethod[];
  
  // Products sold
  products?: CashRegisterTicketProduct[];
  
  // Expenses
  expenses: CashRegisterTicketExpense[];
  
  // Bill counts
  billCounts?: { denomination: number; count: number }[];
  
  // QR
  establishmentUrl?: string;
}

export function generateCashRegisterTicketData(data: CashRegisterTicketData): Uint8Array {
  let txt = '';
  const LINE_WIDTH = 42;
  const separator = '-'.repeat(LINE_WIDTH);
  const doubleSeparator = '='.repeat(LINE_WIDTH);
  
  // Header - centered
  txt += CENTER;
  txt += DOUBLE_HEIGHT + BOLD_ON + sanitizeText(data.establishmentName) + NORMAL_TEXT + BOLD_OFF + NL;
  txt += NL;
  txt += BOLD_ON + 'CIERRE DE CAJA' + BOLD_OFF + NL;
  txt += '#' + sanitizeText(data.cashRegisterId.slice(0, 8).toUpperCase()) + NL;
  txt += NL;
  
  // Cashier and dates
  txt += LEFT;
  txt += BOLD_ON + 'Cajero: ' + BOLD_OFF + sanitizeText(data.cashierName) + NL;
  txt += BOLD_ON + 'Apertura: ' + BOLD_OFF + sanitizeText(data.openedAt) + NL;
  txt += BOLD_ON + 'Cierre: ' + BOLD_OFF + sanitizeText(data.closedAt) + NL;
  txt += NL;
  
  // Sales by payment method
  txt += DOUBLE_HEIGHT + BOLD_ON + 'VENTAS POR METODO' + NORMAL_TEXT + BOLD_OFF + NL;
  txt += separator + NL;
  
  for (const pm of data.paymentMethods) {
    if (pm.amount > 0) {
      const label = sanitizeText(pm.name) + ' (' + pm.count + ')';
      const value = formatPrice(pm.amount);
      txt += padRight(label, LINE_WIDTH - value.length) + value + NL;
    }
  }
  txt += NL;
  
  // Products sold
  if (data.products && data.products.length > 0) {
    txt += DOUBLE_HEIGHT + BOLD_ON + 'PRODUCTOS VENDIDOS' + NORMAL_TEXT + BOLD_OFF + NL;
    txt += separator + NL;
    
    for (const product of data.products) {
      const name = sanitizeText(product.productName);
      const qty = 'x' + product.quantity;
      const value = formatPrice(product.totalAmount);
      // Format: ProductName (truncated) x5  $1,234.00
      const maxNameLen = LINE_WIDTH - qty.length - value.length - 2;
      txt += padRight(name.substring(0, maxNameLen), maxNameLen) + ' ' + qty + ' ' + value + NL;
    }
    txt += NL;
  }
  
  // Expenses
  if (data.expenses.length > 0) {
    txt += DOUBLE_HEIGHT + BOLD_ON + 'GASTOS' + NORMAL_TEXT + BOLD_OFF + NL;
    txt += separator + NL;
    
    for (const expense of data.expenses) {
      const label = sanitizeText(expense.description || expense.category || 'Gasto');
      const value = '-' + formatPrice(expense.amount);
      txt += padRight(label, LINE_WIDTH - value.length) + value + NL;
      txt += '  ' + sanitizeText(getPaymentMethodLabel(expense.method)) + NL;
    }
    txt += NL;
  }
  
  // Summary
  txt += DOUBLE_HEIGHT + BOLD_ON + 'RESUMEN' + NORMAL_TEXT + BOLD_OFF + NL;
  txt += doubleSeparator + NL;
  
  // Initial cash
  const initialLabel = 'Caja inicial:';
  const initialValue = formatPrice(data.initialCash);
  txt += padRight(initialLabel, LINE_WIDTH - initialValue.length) + initialValue + NL;
  
  // Total sales
  const salesLabel = 'Total ventas:';
  const salesValue = formatPrice(data.totalSales);
  txt += BOLD_ON + padRight(salesLabel, LINE_WIDTH - salesValue.length) + salesValue + BOLD_OFF + NL;
  
  // Total expenses
  const expensesLabel = 'Total gastos:';
  const expensesValue = '-' + formatPrice(data.totalExpenses);
  txt += padRight(expensesLabel, LINE_WIDTH - expensesValue.length) + expensesValue + NL;
  
  txt += separator + NL;
  
  // Expected cash
  const expectedLabel = 'Efectivo esperado:';
  const expectedValue = formatPrice(data.expectedCash);
  txt += BOLD_ON + padRight(expectedLabel, LINE_WIDTH - expectedValue.length) + expectedValue + BOLD_OFF + NL;
  
  // Actual cash
  const actualLabel = 'Efectivo real:';
  const actualValue = formatPrice(data.actualCash);
  txt += padRight(actualLabel, LINE_WIDTH - actualValue.length) + actualValue + NL;
  
  // Difference
  const diffLabel = 'Diferencia:';
  const diffValue = (data.cashDifference >= 0 ? '+' : '') + formatPrice(data.cashDifference);
  txt += BOLD_ON + padRight(diffLabel, LINE_WIDTH - diffValue.length) + diffValue + BOLD_OFF + NL;
  
  // Bill counts
  if (data.billCounts && data.billCounts.length > 0) {
    const billsWithCount = data.billCounts.filter(b => b.count > 0);
    if (billsWithCount.length > 0) {
      txt += NL;
      txt += DOUBLE_HEIGHT + BOLD_ON + 'CONTEO DE BILLETES' + NORMAL_TEXT + BOLD_OFF + NL;
      txt += separator + NL;
      
      for (const bill of billsWithCount) {
        const label = '$' + bill.denomination.toLocaleString('es-AR');
        const qty = 'x' + bill.count;
        const total = formatPrice(bill.denomination * bill.count);
        txt += padRight(label, 10) + padRight(qty, 6) + padLeft(total, LINE_WIDTH - 16) + NL;
      }
    }
  }
  
  txt += doubleSeparator + NL;
  
  // Total orders
  const ordersLabel = 'Total pedidos:';
  const ordersValue = data.totalOrders.toString();
  txt += padRight(ordersLabel, LINE_WIDTH - ordersValue.length) + ordersValue + NL;
  
  // Footer
  txt += NL + NL;
  txt += CENTER;
  txt += 'Gracias por usar Mis Canchas' + NL;
  txt += NL;
  
  // Convert text to Uint8Array
  const encoder = new TextEncoder();
  const textData = encoder.encode(txt);
  
  // Generate logo commands
  const logoData = generateLogoCommands();
  
  // Final spacing and cut
  const footerData = encoder.encode(NL + NL + NL + NL + NL + NL + NL + NL + CUT);
  
  // Combine: text + logo + footer
  const result = new Uint8Array(textData.length + logoData.length + footerData.length);
  let offset = 0;
  result.set(textData, offset); offset += textData.length;
  result.set(logoData, offset); offset += logoData.length;
  result.set(footerData, offset);
  
  return result;
}

export async function printCashRegisterTicket(data: CashRegisterTicketData): Promise<boolean> {
  try {
    // Request USB device
    const device = await navigator.usb.requestDevice({ filters: [] });
    
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    
    // Generate ticket data
    const ticketData = generateCashRegisterTicketData(data);
    
    // Send to printer
    await device.transferOut(1, ticketData);
    
    await device.close();
    
    return true;
  } catch (error) {
    console.error('Error printing cash register ticket:', error);
    throw error;
  }
}
