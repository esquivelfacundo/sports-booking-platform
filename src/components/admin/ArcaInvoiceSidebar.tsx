'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Receipt, Download, CheckCircle, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

type DocTipo = 96 | 80 | 99;

export interface ArcaInvoiceItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

interface ArcaInvoiceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId: string;
  orderId?: string;
  bookingId?: string;
  items: ArcaInvoiceItem[];
  total: number;
  defaultCustomerName?: string;
  onInvoiced?: (invoiceId: string) => void;
}

export default function ArcaInvoiceSidebar({
  isOpen,
  onClose,
  establishmentId,
  orderId,
  bookingId,
  items,
  total,
  defaultCustomerName,
  onInvoiced,
}: ArcaInvoiceSidebarProps) {
  const { showSuccess, showError } = useToast();
  const [mounted, setMounted] = useState(false);

  const [loadingPuntos, setLoadingPuntos] = useState(false);
  const [puntosVenta, setPuntosVenta] = useState<Array<{ id: string; numero: number; descripcion?: string; isDefault: boolean; isActive: boolean }>>([]);
  const [puntoVentaId, setPuntoVentaId] = useState<string>('');

  const [clienteNombre, setClienteNombre] = useState(defaultCustomerName || '');
  const [docTipo, setDocTipo] = useState<DocTipo>(99);
  const [docNro, setDocNro] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    id: string;
    numeroComprobante?: number;
    puntoVenta?: number;
    tipoComprobante?: number;
    tipoComprobanteNombre?: string;
    cae?: string;
    caeVencimiento?: string;
  } | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const computedTotal = useMemo(() => {
    const sum = (items || []).reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0), 0);
    return sum > 0 ? sum : total;
  }, [items, total]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setInvoiceData(null);
    setClienteNombre(defaultCustomerName || '');
    setDocTipo(99);
    setDocNro('');

    const load = async () => {
      try {
        setLoadingPuntos(true);
        const resp = await apiClient.getArcaPuntosVenta(establishmentId) as any;
        const list = Array.isArray(resp) ? resp : (resp?.data || resp?.puntosVenta || []);
        setPuntosVenta(list);
        const def = list.find((p: any) => p.isDefault) || list.find((p: any) => p.isActive) || list[0];
        setPuntoVentaId(def?.id || '');
      } catch (e: any) {
        showError(e?.message || 'Error al cargar puntos de venta');
      } finally {
        setLoadingPuntos(false);
      }
    };

    load();
  }, [isOpen, establishmentId, defaultCustomerName, showError]);

  const handleEmit = async () => {
    if (!puntoVentaId) {
      showError('Seleccioná un punto de venta');
      return;
    }

    if (docTipo !== 99 && !docNro.trim()) {
      showError('Ingresá el número de documento');
      return;
    }

    try {
      setIsSubmitting(true);
      const resp = await apiClient.emitirFacturaArca(establishmentId, {
        items,
        total: computedTotal,
        cliente: {
          nombre: clienteNombre || undefined,
          docTipo,
          docNro: docTipo === 99 ? '0' : docNro,
        },
        orderId,
        bookingId,
        puntoVentaId,
      }) as any;

      const invoice = resp?.invoice || resp?.data?.invoice || resp;
      const newInvoiceId = invoice?.id || resp?.invoiceId;
      
      if (!newInvoiceId) {
        showSuccess('Factura emitida');
        onInvoiced?.('');
        onClose();
        return;
      }

      setInvoiceData({
        id: newInvoiceId,
        numeroComprobante: invoice?.numeroComprobante,
        puntoVenta: invoice?.puntoVenta,
        tipoComprobante: invoice?.tipoComprobante,
        tipoComprobanteNombre: invoice?.tipoComprobanteNombre,
        cae: invoice?.cae,
        caeVencimiento: invoice?.caeVencimiento,
      });
      onInvoiced?.(newInvoiceId);
      showSuccess('Comprobante emitido correctamente');
    } catch (e: any) {
      showError(e?.message || 'Error al emitir factura');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoiceData?.id) return;
    try {
      setDownloadingPdf(true);
      await apiClient.openArcaInvoicePdf(establishmentId, invoiceData.id);
    } catch (e: any) {
      showError(e?.message || 'Error al descargar PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!mounted) return null;

  const sidebarContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Emitir comprobante</h3>
                  <p className="text-xs text-gray-400">AFIP (ARCA)</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Punto de venta y Total */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Punto de venta</label>
                  <select
                    value={puntoVentaId}
                    onChange={(e) => setPuntoVentaId(e.target.value)}
                    disabled={loadingPuntos || isSubmitting || !!invoiceData}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="">Seleccionar...</option>
                    {puntosVenta.filter(p => p.isActive).map((pv) => (
                      <option key={pv.id} value={pv.id}>
                        {pv.numero}{pv.isDefault ? ' (default)' : ''}{pv.descripcion ? ` - ${pv.descripcion}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Total</label>
                  <input
                    value={`$${computedTotal.toFixed(2)}`}
                    readOnly
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-lg"
                  />
                </div>
              </div>

              {/* Documento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Documento</label>
                  <select
                    value={docTipo}
                    onChange={(e) => setDocTipo(Number(e.target.value) as DocTipo)}
                    disabled={isSubmitting || !!invoiceData}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={99}>Consumidor final</option>
                    <option value={96}>DNI</option>
                    <option value={80}>CUIT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nro</label>
                  <input
                    value={docNro}
                    onChange={(e) => setDocNro(e.target.value)}
                    disabled={isSubmitting || docTipo === 99 || !!invoiceData}
                    placeholder={docTipo === 96 ? '12345678' : docTipo === 80 ? '20123456789' : '0'}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-mono"
                  />
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nombre / Razón social (opcional)</label>
                <input
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  disabled={isSubmitting || !!invoiceData}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Items */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-3 font-medium">Items</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(items || []).map((it, idx) => (
                    <div key={`${it.descripcion}-${idx}`} className="flex items-start justify-between gap-3 bg-gray-900/50 rounded-lg p-3">
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{it.descripcion}</p>
                        <p className="text-xs text-gray-400">{it.cantidad} x ${Number(it.precioUnitario).toFixed(2)}</p>
                      </div>
                      <p className="text-sm text-emerald-400 font-mono whitespace-nowrap">
                        ${(Number(it.cantidad) * Number(it.precioUnitario)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success state */}
              {invoiceData && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Comprobante emitido</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {invoiceData.tipoComprobanteNombre && (
                      <div>
                        <p className="text-gray-400 text-xs">Tipo</p>
                        <p className="text-white">{invoiceData.tipoComprobanteNombre}</p>
                      </div>
                    )}
                    {invoiceData.puntoVenta && invoiceData.numeroComprobante && (
                      <div>
                        <p className="text-gray-400 text-xs">Número</p>
                        <p className="text-white font-mono">
                          {String(invoiceData.puntoVenta).padStart(5, '0')}-{String(invoiceData.numeroComprobante).padStart(8, '0')}
                        </p>
                      </div>
                    )}
                    {invoiceData.cae && (
                      <div className="col-span-2">
                        <p className="text-gray-400 text-xs">CAE</p>
                        <p className="text-white font-mono text-xs">{invoiceData.cae}</p>
                      </div>
                    )}
                    {invoiceData.caeVencimiento && (
                      <div>
                        <p className="text-gray-400 text-xs">Vto. CAE</p>
                        <p className="text-white text-xs">
                          {new Date(invoiceData.caeVencimiento).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="w-full mt-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Descargar PDF
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
              >
                {invoiceData ? 'Cerrar' : 'Cancelar'}
              </button>
              {!invoiceData && (
                <button
                  onClick={handleEmit}
                  disabled={isSubmitting || loadingPuntos}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                  Emitir
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(sidebarContent, document.body);
}
