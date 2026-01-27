'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Receipt, Download } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

type DocTipo = 96 | 80 | 99;

export interface ArcaInvoiceItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

interface ArcaInvoiceModalProps {
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

export default function ArcaInvoiceModal({
  isOpen,
  onClose,
  establishmentId,
  orderId,
  bookingId,
  items,
  total,
  defaultCustomerName,
  onInvoiced,
}: ArcaInvoiceModalProps) {
  const { showSuccess, showError } = useToast();

  const [loadingPuntos, setLoadingPuntos] = useState(false);
  const [puntosVenta, setPuntosVenta] = useState<Array<{ id: string; numero: number; descripcion?: string; isDefault: boolean; isActive: boolean }>>([]);
  const [puntoVentaId, setPuntoVentaId] = useState<string>('');

  const [clienteNombre, setClienteNombre] = useState(defaultCustomerName || '');
  const [docTipo, setDocTipo] = useState<DocTipo>(99);
  const [docNro, setDocNro] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const computedTotal = useMemo(() => {
    const sum = (items || []).reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0), 0);
    return sum > 0 ? sum : total;
  }, [items, total]);

  useEffect(() => {
    if (!isOpen) return;

    setInvoiceId(null);
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

  if (!isOpen) return null;

  const pdfUrl = invoiceId ? apiClient.getArcaInvoicePdfUrl(establishmentId, invoiceId) : null;

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

      const newInvoiceId = resp?.invoice?.id || resp?.data?.invoice?.id || resp?.invoiceId || resp?.id;
      if (!newInvoiceId) {
        showSuccess('Factura emitida');
        onInvoiced?.('');
        onClose();
        return;
      }

      setInvoiceId(newInvoiceId);
      onInvoiced?.(newInvoiceId);
      showSuccess('Factura emitida');
    } catch (e: any) {
      showError(e?.message || 'Error al emitir factura');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Receipt className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Emitir comprobante</h3>
                <p className="text-xs text-gray-400">AFIP (ARCA)</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Punto de venta</label>
                <select
                  value={puntoVentaId}
                  onChange={(e) => setPuntoVentaId(e.target.value)}
                  disabled={loadingPuntos || isSubmitting}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
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
                  value={computedTotal.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Documento</label>
                <select
                  value={docTipo}
                  onChange={(e) => setDocTipo(Number(e.target.value) as DocTipo)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
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
                  disabled={isSubmitting || docTipo === 99}
                  placeholder={docTipo === 96 ? '12345678' : docTipo === 80 ? '20123456789' : '0'}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre / Razón social (opcional)</label>
              <input
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                disabled={isSubmitting}
                placeholder=""
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Items</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(items || []).map((it, idx) => (
                  <div key={`${it.descripcion}-${idx}`} className="flex items-start justify-between gap-3 bg-gray-800 rounded-lg p-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{it.descripcion}</p>
                      <p className="text-xs text-gray-400">{it.cantidad} x ${Number(it.precioUnitario).toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-emerald-400 font-mono">${(Number(it.cantidad) * Number(it.precioUnitario)).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {invoiceId && pdfUrl && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-emerald-400 font-medium text-sm">Comprobante emitido</p>
                  <p className="text-xs text-gray-400 font-mono">ID: {invoiceId}</p>
                </div>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </a>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-700 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
            >
              Cerrar
            </button>
            <button
              onClick={handleEmit}
              disabled={isSubmitting || loadingPuntos || !!invoiceId}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
              Emitir
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
