# 📊 Plan de Acción - Sistema de Exportación a CSV

## Estado General
- **Fecha de inicio**: 26 de Enero, 2026
- **Última actualización**: 27 de Enero, 2026
- **Estado**: ✅ Fases 1-5 Completadas (30/36 reportes core)
- **Progreso**: 83% de reportes principales implementados

---

## 🏟️ 1. RESERVAS (Bookings)

### 1.1 Reporte General de Reservas ✅
- [x] Backend: Endpoint `/api/bookings/export`
- [x] Frontend: Botón de exportación en página de reservas
- [x] Campos: Fecha, Hora inicio, Hora fin, Cancha, Cliente, Teléfono, Email, Estado, Tipo de pago, Monto total, Seña, Saldo pendiente, Método de pago, Notas
- [x] Filtros: Rango de fechas, cancha, estado, cliente, método de pago
- **Completado**: 26/01/2026

### 1.2 Reservas Recurrentes ✅
- [x] Backend: Endpoint `/api/recurring-bookings/export`
- [x] Frontend: Dropdown en página de turnos-fijos `exportRecurringBookingsToCSV`
- [x] Campos: Grupo, Frecuencia, Día de la semana, Hora, Cancha, Cliente, Fecha inicio, Fecha fin, Total reservas, Reservas completadas, Estado
- [x] Filtros: Rango de fechas, cancha, cliente, estado
- **Completado**: 27/01/2026

### 1.3 Reservas No-Show ✅
- [x] Backend: Endpoint `/api/bookings/no-show/export`
- [x] Frontend: Dropdown en página de reservas `exportNoShowBookingsToCSV`
- [x] Campos: Fecha, Hora, Cancha, Cliente, Teléfono, Monto perdido, Seña perdida, Motivo
- [x] Filtros: Rango de fechas, cancha
- **Completado**: 27/01/2026

---

## 💰 2. FINANZAS

### 2.1 Resumen Financiero General ✅
- [x] Backend: Endpoint `/api/finance/summary/export`
- [x] Frontend: Dropdown en página de analytics `exportFinancialSummaryToCSV`
- [x] Campos: Fecha, Ingresos totales, Depósitos, Saldo pendiente, Cantidad de reservas, Ticket promedio
- [x] Filtros: Período (día/semana/mes/trimestre/año)
- **Completado**: 27/01/2026

### 2.2 Ingresos por Método de Pago ✅
- [x] Backend: Endpoint `/api/cash-register-movements/income-by-method/export`
- [x] Frontend: Método API client `exportIncomeByMethodToCSV`
- [x] Campos: Método de pago, Cantidad de operaciones, Monto total, Porcentaje del total
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

### 2.3 Ingresos por Cancha ✅
- [x] Backend: Endpoint `/api/analytics/revenue-by-court/export`
- [x] Frontend: Dropdown en página de analytics `exportRevenueByCourtToCSV`
- [x] Campos: Cancha, Deporte, Cantidad reservas, Ingresos totales, Depósitos, Ticket promedio, Porcentaje
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

### 2.4 Pagos Pendientes ✅
- [x] Backend: Endpoint `/api/finance/pending-payments/export`
- [x] Frontend: Dropdown en página de analytics `exportPendingPaymentsToCSV`
- [x] Campos: Cliente, Teléfono, Fecha reserva, Cancha, Monto total, Pagado, Pendiente, Días de atraso
- [x] Filtros: Rango de fechas, cliente
- **Completado**: 27/01/2026

---

## 💵 3. CAJA (Cash Registers)

### 3.1 Resumen de Turnos de Caja ✅
- [x] Backend: Endpoint `/api/cash-registers/export`
- [x] Frontend: Botón de exportación en página de cajas
- [x] Campos: Fecha apertura, Fecha cierre, Usuario, Monto inicial, Efectivo esperado, Efectivo real, Tarjeta, Transferencia, Total ventas, Total gastos, Diferencia, Estado
- [x] Filtros: Rango de fechas, usuario, estado
- **Completado**: 26/01/2026

### 3.2 Movimientos de Caja Detallados ✅
- [x] Backend: Endpoint `/api/cash-register-movements/export`
- [x] Frontend: Método API client `exportCashMovementsToCSV`
- [x] Campos: Fecha/Hora, Tipo, Descripción, Método de pago, Monto, Categoría, Orden/Reserva, Usuario, Notas
- [x] Filtros: Rango de fechas, turno, tipo de movimiento, método de pago
- **Completado**: 27/01/2026

### 3.3 Cierre de Caja Diario ✅
- [x] Backend: Endpoint `/api/cash-registers/daily-closing/export`
- [x] Frontend: Dropdown en página de caja `exportDailyCashClosingToCSV`
- [x] Campos: Fecha, Total efectivo, Total tarjeta, Total transferencia, Total ventas, Total gastos, Diferencias, Observaciones
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

---

## 💸 4. GASTOS (Expenses)

### 4.1 Reporte de Gastos ✅
- [x] Backend: Endpoint `/api/expenses/establishment/:id/export`
- [x] Frontend: Botón de exportación en página de gastos
- [x] Campos: Fecha, Categoría, Descripción, Proveedor, Monto, Método de pago, Factura, Origen (Caja/Administración), Usuario, Notas
- [x] Filtros: Rango de fechas, categoría, proveedor, origen, usuario
- **Completado**: 26/01/2026

### 4.2 Gastos por Categoría ✅
- [x] Backend: Endpoint `/api/expenses/by-category/export`
- [x] Frontend: Dropdown en página de gastos `exportExpensesByCategoryToCSV`
- [x] Campos: Categoría, Cantidad de gastos, Monto total, Porcentaje del total, Promedio por gasto
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

### 4.3 Gastos por Proveedor ✅
- [x] Backend: Endpoint `/api/expenses/by-supplier/export`
- [x] Frontend: Dropdown en página de gastos `exportExpensesBySupplierToCSV`
- [x] Campos: Proveedor, Cantidad de gastos, Monto total, Porcentaje, Promedio por gasto
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

---

## 🛒 5. VENTAS DIRECTAS (Orders)

### 5.1 Reporte de Ventas ✅
- [x] Backend: Endpoint `/api/orders/export`
- [x] Frontend: Botón de exportación en página de ventas
- [x] Campos: Fecha/Hora, Número de orden, Tipo (Venta directa/Consumo), Cliente, Productos, Cantidad, Subtotal, Descuento, Total, Método de pago, Estado de pago, Usuario
- [x] Filtros: Rango de fechas, tipo, cliente, estado de pago, método de pago
- **Completado**: 26/01/2026

### 5.2 Ventas por Producto ✅
- [x] Backend: Endpoint `/api/orders/sales-by-product/export`
- [x] Frontend: Método API client `exportSalesByProductToCSV`
- [x] Campos: Ranking, Producto, Cantidad vendida, Ingreso total, Porcentaje, Promedio unitario
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

### 5.3 Ventas por Método de Pago ✅
- [x] Backend: Endpoint `/api/orders/by-payment-method/export`
- [x] Frontend: Dropdown en página de ventas `exportSalesByPaymentMethodToCSV`
- [x] Campos: Método de pago, Cantidad de ventas, Monto total, Porcentaje del total, Ticket promedio
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

---

## 📦 6. STOCK E INVENTARIO

### 6.1 Inventario Actual ✅
- [x] Backend: Endpoint `/api/products/export`
- [x] Frontend: Botón de exportación en página de stock
- [x] Campos: Producto, Categoría, SKU, Stock actual, Stock mínimo, Stock máximo, Costo unitario, Valor total, Estado (Normal/Bajo/Crítico)
- [x] Filtros: Categoría, estado de stock
- **Completado**: 26/01/2026

### 6.2 Movimientos de Stock ✅
- [x] Backend: Endpoint `/api/stock-movements/export`
- [x] Frontend: Dropdown en página de stock `exportStockMovementsToCSV`
- [x] Campos: Fecha/Hora, Producto, SKU, Tipo, Cantidad, Unidad, Costo unitario, Costo total, Stock anterior, Stock nuevo, Usuario, Notas
- [x] Filtros: Rango de fechas, producto, tipo de movimiento
- **Completado**: 27/01/2026

### 6.3 Compras a Proveedores ✅
- [x] Backend: Endpoint `/api/stock-movements/purchases/export`
- [x] Frontend: Dropdown en página de stock `exportPurchasesToCSV`
- [x] Campos: Fecha, Producto, SKU, Cantidad, Unidad, Costo unitario, Costo total, Proveedor, Factura, Usuario, Notas
- [x] Filtros: Rango de fechas, proveedor
- **Completado**: 27/01/2026

### 6.4 Productos con Stock Bajo ✅
- [x] Backend: Endpoint `/api/products/alerts/low-stock/export`
- [x] Frontend: Dropdown en página de stock `exportLowStockProductsToCSV`
- [x] Campos: Producto, Categoría, SKU, Stock actual, Stock mínimo, Diferencia, Estado, Costo unitario, Valor faltante
- [x] Filtros: Ninguno (siempre muestra productos bajo stock)
- **Completado**: 27/01/2026

### 6.5 Historial de Mermas ✅
- [x] Backend: Endpoint `/api/stock-movements/waste/export`
- [x] Frontend: Dropdown en página de stock `exportWasteToCSV`
- [x] Campos: Fecha, Producto, SKU, Cantidad, Costo unitario, Costo total, Motivo, Usuario
- [x] Filtros: Rango de fechas, producto
- **Completado**: 27/01/2026

---

## 👥 7. CLIENTES

### 7.1 Base de Datos de Clientes ✅
- [x] Backend: Endpoint `/api/clients/establishment/:id/export`
- [x] Frontend: Método API client `exportClientsToCSV`
- [x] Campos: Nombre, Teléfono, Email, Reservas totales, Reservas completadas, Reservas canceladas, No show, Total gastado, Deuda, Última reserva, Estado, Notas
- [x] Filtros: Tiene deuda, Estado activo
- **Completado**: 27/01/2026

### 7.2 Clientes Frecuentes (Top Clientes) ✅
- [x] Backend: Endpoint `/api/analytics/top-clients/export`
- [x] Frontend: Dropdown en página de analytics `exportTopClientsToCSV`
- [x] Campos: Ranking, Nombre, Teléfono, Email, Reservas totales, Reservas completadas, Total gastado, Ticket promedio, Última reserva
- [x] Filtros: Límite de resultados
- **Completado**: 27/01/2026

### 7.3 Clientes Inactivos ✅
- [x] Backend: Endpoint `/api/clients/establishment/:id/inactive/export`
- [x] Frontend: Dropdown en página de clientes `exportInactiveClientsToCSV`
- [x] Campos: Nombre, Teléfono, Email, Última reserva, Días sin actividad, Reservas totales, Total gastado, Notas
- [x] Filtros: Días de inactividad mínimos (default: 30)
- **Completado**: 27/01/2026

---

## 💳 8. CUENTAS CORRIENTES

### 8.1 Estado de Cuentas Corrientes ✅
- [x] Backend: Endpoint `/api/current-accounts/establishment/:id/export`
- [x] Frontend: Método API client `exportCurrentAccountsToCSV`
- [x] Campos: Titular, Teléfono, Email, Tipo, Saldo actual, Total compras, Total pagos, Límite crédito, Descuento, Precio costo, Notas
- [x] Filtros: Tipo de cuenta, tiene saldo
- **Completado**: 27/01/2026

### 8.2 Movimientos de Cuenta Corriente ✅
- [x] Backend: Endpoint `/api/current-accounts/movements/export`
- [x] Frontend: Dropdown en página de cuentas corrientes `exportAccountMovementsToCSV`
- [x] Campos: Fecha, Titular, Tipo, Descripción, Monto, Saldo anterior, Saldo nuevo, Orden, Usuario
- [x] Filtros: Rango de fechas, cuenta, tipo de movimiento
- **Completado**: 27/01/2026

### 8.3 Deudas Pendientes ✅
- [x] Backend: Endpoint `/api/current-accounts/debts/export`
- [x] Frontend: Dropdown en página de cuentas corrientes `exportPendingDebtsToCSV`
- [x] Campos: Titular, Teléfono, Email, Saldo deudor, Días de deuda, Última transacción, Límite crédito, Total compras, Total pagos
- [x] Filtros: Monto mínimo de deuda, días de atraso
- **Completado**: 27/01/2026

---

## 📊 9. REPORTES ANALÍTICOS

### 9.1 Ocupación de Canchas ✅
- [x] Backend: Endpoint `/api/analytics/court-occupancy/export`
- [x] Frontend: Dropdown en página de analytics `exportCourtOccupancyToCSV`
- [x] Campos: Cancha, Deporte, Reservas totales, Horas ocupadas, Ingresos totales, Ticket promedio
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

### 9.2 Horarios Pico ✅
- [x] Backend: Endpoint `/api/analytics/peak-hours/export`
- [x] Frontend: Dropdown en página de analytics `exportPeakHoursToCSV`
- [x] Campos: Hora, Día de semana, Cantidad reservas, Ingresos totales, Promedio ingreso
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

### 9.3 Rendimiento por Día de la Semana ✅
- [x] Backend: Endpoint `/api/analytics/by-weekday/export`
- [x] Frontend: Dropdown en página de analytics `exportByWeekdayToCSV`
- [x] Campos: Día, Cantidad reservas, Horas reservadas, Ingresos totales, Ticket promedio, Porcentaje
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

---

## 🎟️ 10. CUPONES Y PROMOCIONES

### 10.1 Uso de Cupones
- [ ] Backend: Endpoint `/api/coupons/export`
- [ ] Frontend: Botón de exportación en página de cupones
- [ ] Campos: Código cupón, Descripción, Tipo descuento, Valor, Cantidad de usos, Total descontado, Fecha inicio, Fecha fin, Estado
- [ ] Filtros: Rango de fechas, estado

### 10.2 Detalle de Usos por Cupón
- [ ] Backend: Endpoint `/api/coupons/usage/export`
- [ ] Frontend: Botón de exportación en detalle de cupón
- [ ] Campos: Fecha, Cupón, Cliente, Reserva/Orden, Descuento aplicado, Total final
- [ ] Filtros: Rango de fechas, cupón

---

## 👨‍💼 11. USUARIOS Y STAFF

### 11.1 Actividad de Usuarios
- [ ] Backend: Endpoint `/api/users/activity/export`
- [ ] Frontend: Botón de exportación en página de usuarios
- [ ] Campos: Usuario, Rol, Cantidad de reservas creadas, Ventas realizadas, Gastos registrados, Última actividad
- [ ] Filtros: Rango de fechas, rol

### 11.2 Rendimiento de Cajeros
- [ ] Backend: Endpoint `/api/staff/cashier-performance/export`
- [ ] Frontend: Botón de exportación en sección de staff
- [ ] Campos: Cajero, Turnos trabajados, Total ventas, Total gastos, Diferencias en caja, Promedio por turno
- [ ] Filtros: Rango de fechas

---

## 📋 12. REPORTES CONSOLIDADOS

### 12.1 Reporte Diario Completo
- [ ] Backend: Endpoint `/api/reports/daily/export`
- [ ] Frontend: Botón de exportación en dashboard
- [ ] Campos: Resumen de reservas, ventas, gastos, caja, movimientos de stock del día
- [ ] Filtros: Fecha específica

### 12.2 Reporte Mensual Ejecutivo
- [ ] Backend: Endpoint `/api/reports/monthly/export`
- [ ] Frontend: Botón de exportación en dashboard
- [ ] Campos: Resumen financiero, top productos, top clientes, ocupación, gastos por categoría
- [ ] Filtros: Mes y año

---

## 🎯 FASES DE IMPLEMENTACIÓN

### ✅ Fase 1 - Esenciales (Prioridad Alta) - 5/5 completado (100%) ✅
- [x] 1.1 Reporte General de Reservas ✅
- [x] 3.1 Resumen de Turnos de Caja ✅
- [x] 4.1 Reporte de Gastos ✅
- [x] 5.1 Reporte de Ventas ✅
- [x] 6.1 Inventario Actual ✅

### ✅ Fase 2 - Importantes (Prioridad Media) - 5/5 completado (100%) ✅
- [x] 2.2 Ingresos por Método de Pago ✅
- [x] 3.2 Movimientos de Caja Detallados ✅
- [x] 5.2 Ventas por Producto ✅
- [x] 7.1 Base de Datos de Clientes ✅
- [x] 8.1 Estado de Cuentas Corrientes ✅

### ✅ Fase 3 - Analíticos (Prioridad Media-Baja) - 5/5 completado (100%) ✅
- [x] 9.1 Ocupación de Canchas ✅
- [x] 7.2 Clientes Frecuentes ✅
- [x] 4.2 Gastos por Categoría ✅
- [x] 6.3 Compras a Proveedores ✅
- [x] 9.2 Horarios Pico ✅

### ✅ Fase 4 - Avanzados (Prioridad Baja) - 5/5 completado (100%) ✅
- [x] 6.2 Movimientos de Stock ✅
- [x] 9.3 Rendimiento por Día de Semana ✅
- [x] 8.2 Movimientos de Cuenta Corriente ✅
- [x] 2.3 Ingresos por Cancha ✅
- [x] 6.4 Productos con Stock Bajo ✅

### ✅ Fase 5 - Adicionales (27/01/2026) - 10/10 completado (100%) ✅
- [x] 1.2 Reservas Recurrentes ✅
- [x] 1.3 Reservas No-Show ✅
- [x] 2.1 Resumen Financiero General ✅
- [x] 2.4 Pagos Pendientes ✅
- [x] 3.3 Cierre de Caja Diario ✅
- [x] 4.3 Gastos por Proveedor ✅
- [x] 5.3 Ventas por Método de Pago ✅
- [x] 6.5 Historial de Mermas ✅
- [x] 7.3 Clientes Inactivos ✅
- [x] 8.3 Deudas Pendientes ✅

### Fase 6 - Cupones y Staff (Pendiente) - 0/4
- [ ] 10.1 Uso de Cupones
- [ ] 10.2 Detalle de Usos por Cupón
- [ ] 11.1 Actividad de Usuarios
- [ ] 11.2 Rendimiento de Cajeros

### Fase 7 - Consolidados (Pendiente) - 0/2
- [ ] 12.1 Reporte Diario Completo
- [ ] 12.2 Reporte Mensual Ejecutivo

---

## 🛠️ COMPONENTES TÉCNICOS

### Backend ✅
- [x] Utilidad de generación de CSV (`src/utils/csvGenerator.js`) ✅
- [x] Autenticación y autorización por establecimiento ✅
- [ ] Sistema de caché para reportes grandes (opcional)
- [ ] Rate limiting para exportaciones (opcional)

### Frontend ✅
- [x] Botones/dropdowns de exportación en cada página ✅
- [x] Estado de carga con `isExporting` + `animate-pulse` ✅
- [x] Sistema de descarga automática (`window.open` / blob) ✅
- [ ] Modal de configuración de exportación (opcional)
- [ ] Selección de columnas a exportar (opcional)

---

## 📝 NOTAS Y CONSIDERACIONES

### Formato de CSV
- Encoding: UTF-8 con BOM para compatibilidad con Excel
- Separador: Coma (,)
- Delimitador de texto: Comillas dobles (")
- Formato de fechas: DD/MM/YYYY
- Formato de números: Punto decimal, sin separador de miles en CSV

### Seguridad ✅
- [x] Validar permisos de usuario antes de exportar (authenticateToken middleware)
- [x] Verificación de pertenencia al establecimiento
- [ ] Limitar tamaño de exportaciones (opcional para futuro)
- [ ] Rate limiting (opcional para futuro)

### Performance
- [x] Generación de CSV en memoria (funciona bien para volúmenes actuales)
- [ ] Streaming para archivos muy grandes (>10k registros) - opcional
- [ ] Caché de reportes frecuentes - opcional

### UX ✅
- [x] Indicador visual de carga (animate-pulse en botón)
- [x] Descarga automática del archivo
- [x] Dropdowns para múltiples opciones de exportación
- [x] Mensajes de éxito/error con toast notifications

---

## 📊 MÉTRICAS DE PROGRESO

- **Total de reportes**: 36 (sin contar cupones, staff y consolidados opcionales)
- **Reportes completados**: 30
- **Porcentaje completado**: 83% (30/36 core reports)
- **Fase actual**: ✅ Fases 1-5 Completadas
- **Próximo hito**: Fase 6 - Cupones y Staff (cuando se implemente el módulo de cupones)

### Reportes pendientes (6):
- 10.1 Uso de Cupones
- 10.2 Detalle de Usos por Cupón  
- 11.1 Actividad de Usuarios
- 11.2 Rendimiento de Cajeros
- 12.1 Reporte Diario Completo
- 12.2 Reporte Mensual Ejecutivo

---

## 🔄 HISTORIAL DE CAMBIOS

### 27/01/2026 - Exportaciones adicionales (7 reportes)
- ✅ **1.2 Reservas Recurrentes** - Backend + Frontend UI en turnos-fijos
- ✅ **1.3 Reservas No-Show** - Backend + Frontend dropdown en reservas
- ✅ **2.1 Resumen Financiero General** - Backend + Frontend dropdown en analytics
- ✅ **2.4 Pagos Pendientes** - Backend + Frontend dropdown en analytics
- ✅ **3.3 Cierre de Caja Diario** - Backend + Frontend dropdown en caja
- ✅ **4.3 Gastos por Proveedor** - Backend + Frontend dropdown en gastos
- ✅ **5.3 Ventas por Método de Pago** - Backend + Frontend dropdown en ventas

### 26/01/2026 - 23:30
- ✅ **FASE 1 COMPLETADA**
  - ✅ 1.1 Reporte General de Reservas
  - ✅ 3.1 Resumen de Turnos de Caja
  - ✅ 4.1 Reporte de Gastos
  - ✅ 5.1 Reporte de Ventas
  - ✅ 6.1 Inventario Actual
  - Backend commits: `8d2531c`, `5d41d61`
  - Frontend commits: `7aaad1bc`, `c724c42f`

### 26/01/2026 - 23:15
- ✅ **Completado Reporte 1.1 - Reporte General de Reservas**
  - Backend: Utilidad CSV generator creada
  - Backend: Endpoint `/api/bookings/export` implementado
  - Frontend: Componente ExportButton reutilizable creado
  - Frontend: Botón de exportación agregado en página de reservas
  - Commits: `8d2531c` (backend), `7aaad1bc` (frontend)

### 26/01/2026 - 22:00
- ✅ Documento de plan creado
- ✅ Definición de 52 reportes exportables
- ✅ Priorización en 4 fases
- ✅ Definición de componentes técnicos
