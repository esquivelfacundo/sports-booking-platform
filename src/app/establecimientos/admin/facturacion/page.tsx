'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import { Download, Search, Loader2 } from 'lucide-react';

interface ArcaInvoice {
  id: string;
  tipoComprobante?: number;
  tipoComprobanteNombre?: string;
  status?: string;
  importeTotal?: number;
  fechaEmision?: string;
  puntoVenta?: number;
  numeroComprobante?: number;
  cae?: string;
  caeVencimiento?: string;
  clienteNombre?: string;
  clienteDocTipo?: number;
  clienteDocNro?: string;
  orderId?: string | null;
  bookingId?: string | null;
}

const TIPO_LABELS: Record<number, string> = {
  1: 'Factura A',
  6: 'Factura B',
  11: 'Factura C',
  3: 'Nota de Crédito A',
  8: 'Nota de Crédito B',
  13: 'Nota de Crédito C',
};

export default function FacturacionPage() {
  const { establishment, loading: establishmentLoading } = useEstablishment();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [invoices, setInvoices] = useState<ArcaInvoice[]>([]);
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const establishmentId = establishment?.id;

  // Get the header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);

  const parseListResponse = (resp: any) => {
    const list = resp?.invoices || resp?.data || resp?.facturas || resp?.rows || resp?.items || resp;
    const pagination = resp?.pagination || resp?.meta || resp?.pageInfo;

    const normalizedList = Array.isArray(list) ? list : (Array.isArray(list?.rows) ? list.rows : []);
    const pages = pagination?.pages || pagination?.totalPages || (pagination?.total && pagination?.limit ? Math.ceil(pagination.total / pagination.limit) : undefined);

    return {
      list: normalizedList as ArcaInvoice[],
      pages: typeof pages === 'number' && pages > 0 ? pages : 1,
      total: pagination?.total || normalizedList.length,
    };
  };

  const fetchInvoices = useCallback(async () => {
    if (!establishmentId) return;

    setLoading(true);
    setError(null);
    try {
      const resp = await apiClient.getArcaInvoices(establishmentId, {
        page,
        limit,
        search: search || undefined,
        tipo: tipo ? Number(tipo) : undefined,
        status: status || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      });

      const { list, pages, total: totalCount } = parseListResponse(resp);
      setInvoices(list);
      setTotalPages(pages);
      setTotal(totalCount);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar comprobantes');
      setInvoices([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, page, limit, search, tipo, status, fechaDesde, fechaHasta]);

  useEffect(() => {
    if (establishmentId) fetchInvoices();
  }, [establishmentId, fetchInvoices]);

  useEffect(() => {
    setPage(1);
  }, [search, tipo, status, fechaDesde, fechaHasta]);

  // Download PDF with auth token
  const handleDownloadPdf = async (invoiceId: string, invoice?: ArcaInvoice) => {
    if (!establishmentId) return;
    setDownloadingPdf(invoiceId);
    try {
      const blob = await apiClient.downloadArcaInvoicePdf(establishmentId, invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const pvNro = invoice?.puntoVenta && invoice?.numeroComprobante 
        ? `${invoice.puntoVenta.toString().padStart(4, '0')}-${invoice.numeroComprobante.toString().padStart(8, '0')}` 
        : invoiceId;
      a.download = `factura-${pvNro}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('Error downloading PDF:', e);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTipoLabel = (t?: number, nombre?: string) => {
    if (nombre) return nombre;
    if (!t) return '-';
    return TIPO_LABELS[t] || `Tipo ${t}`;
  };

  const getStatusLabel = (s?: string) => {
    if (!s) return '-';
    const map: Record<string, string> = {
      emitted: 'Emitido',
      authorized: 'Autorizado',
      rejected: 'Rechazado',
      pending: 'Pendiente',
    };
    return map[s] || s;
  };

  const getStatusColor = (s?: string) => {
    switch (s) {
      case 'authorized':
      case 'emitted':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  // Header controls to be rendered via portal
  const headerControls = (
    <div className="flex items-center w-full space-x-2 overflow-x-auto">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-36"
        />
      </div>

      {/* Tipo Filter */}
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
      >
        <option value="">Tipo</option>
        <option value="1">Factura A</option>
        <option value="6">Factura B</option>
        <option value="11">Factura C</option>
        <option value="3">NC A</option>
        <option value="8">NC B</option>
        <option value="13">NC C</option>
      </select>

      {/* Status Filter */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
      >
        <option value="">Estado</option>
        <option value="emitido">Emitido</option>
        <option value="anulado">Anulado</option>
      </select>

      {/* Date Range */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 w-32"
        />
        <span className="text-gray-500">-</span>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 w-32"
        />
      </div>
    </div>
  );

  if (establishmentLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <UnifiedLoader size="md" />
      </div>
    );
  }

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}

      <div className="flex flex-col h-full">
        {error && (
          <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 font-medium">Fecha</th>
                <th className="py-3 px-4 font-medium">Tipo</th>
                <th className="py-3 px-4 font-medium">PV/Nro</th>
                <th className="py-3 px-4 font-medium">Cliente</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Estado</th>
                <th className="py-3 px-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20">
                    <div className="flex items-center justify-center">
                      <UnifiedLoader size="sm" />
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-sm text-gray-400">
                    No hay comprobantes para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const pvNro = inv.puntoVenta && inv.numeroComprobante ? `${inv.puntoVenta.toString().padStart(4, '0')}-${inv.numeroComprobante.toString().padStart(8, '0')}` : '-';

                  return (
                    <tr key={inv.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(inv.fechaEmision)}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-200 whitespace-nowrap">{getTipoLabel(inv.tipoComprobante, inv.tipoComprobanteNombre)}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-200 font-mono whitespace-nowrap">{pvNro}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 min-w-[200px]">
                        <div className="flex flex-col">
                          <span className="text-gray-900 dark:text-gray-200">{inv.clienteNombre || '-'}</span>
                          {(inv.clienteDocTipo || inv.clienteDocNro) && (
                            <span className="text-xs text-gray-500 font-mono">{inv.clienteDocNro || ''}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">${Number(inv.importeTotal || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(inv.status)}`}>
                          {getStatusLabel(inv.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadPdf(inv.id, inv)}
                            disabled={downloadingPdf === inv.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg text-xs transition-colors disabled:opacity-50"
                            title="Descargar PDF"
                          >
                            {downloadingPdf === inv.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            PDF
                          </button>
                          <span className="text-xs text-gray-500 font-mono truncate max-w-[120px]">{inv.cae ? `CAE ${inv.cae}` : ''}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-500">
            {total > 0 ? `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} de ${total}` : '0 resultados'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
