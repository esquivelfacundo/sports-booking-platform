'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import { Download, FileText, Search } from 'lucide-react';

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
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  const [invoices, setInvoices] = useState<ArcaInvoice[]>([]);

  const establishmentId = establishment?.id;

  const parseListResponse = (resp: any) => {
    const list = resp?.invoices || resp?.data || resp?.facturas || resp?.rows || resp?.items || resp;
    const pagination = resp?.pagination || resp?.meta || resp?.pageInfo;

    const normalizedList = Array.isArray(list) ? list : (Array.isArray(list?.rows) ? list.rows : []);
    const pages = pagination?.pages || pagination?.totalPages || (pagination?.total && pagination?.limit ? Math.ceil(pagination.total / pagination.limit) : undefined);

    return {
      list: normalizedList as ArcaInvoice[],
      pages: typeof pages === 'number' && pages > 0 ? pages : 1,
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

      const { list, pages } = parseListResponse(resp);
      setInvoices(list);
      setTotalPages(pages);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar comprobantes');
      setInvoices([]);
      setTotalPages(1);
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

  const filteredInvoices = useMemo(() => {
    return invoices;
  }, [invoices]);

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

  if (establishmentLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <UnifiedLoader size="md" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Facturación</h1>
          <p className="text-sm text-gray-400">Comprobantes emitidos (AFIP / ARCA)</p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <div className="xl:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Buscar</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="CAE, cliente, nro comprobante..."
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todos</option>
              <option value="1">Factura A</option>
              <option value="6">Factura B</option>
              <option value="11">Factura C</option>
              <option value="3">NC A</option>
              <option value="8">NC B</option>
              <option value="13">NC C</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todos</option>
              <option value="authorized">Autorizado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:col-span-1">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="py-3 pr-4">Fecha</th>
                <th className="py-3 pr-4">Tipo</th>
                <th className="py-3 pr-4">PV/Nro</th>
                <th className="py-3 pr-4">Cliente</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10">
                    <div className="flex items-center justify-center">
                      <UnifiedLoader size="sm" />
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                    No hay comprobantes para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const pvNro = inv.puntoVenta && inv.numeroComprobante ? `${inv.puntoVenta.toString().padStart(4, '0')}-${inv.numeroComprobante.toString().padStart(8, '0')}` : '-';
                  const pdfUrl = establishmentId ? apiClient.getArcaInvoicePdfUrl(establishmentId, inv.id) : '#';

                  return (
                    <tr key={inv.id} className="text-sm">
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{formatDate(inv.fechaEmision)}</td>
                      <td className="py-3 pr-4 text-gray-200 whitespace-nowrap">{getTipoLabel(inv.tipoComprobante, inv.tipoComprobanteNombre)}</td>
                      <td className="py-3 pr-4 text-gray-200 font-mono whitespace-nowrap">{pvNro}</td>
                      <td className="py-3 pr-4 text-gray-300 min-w-[220px]">
                        <div className="flex flex-col">
                          <span className="text-gray-200">{inv.clienteNombre || '-'}</span>
                          {(inv.clienteDocTipo || inv.clienteDocNro) && (
                            <span className="text-xs text-gray-500 font-mono">{inv.clienteDocTipo || ''} {inv.clienteDocNro || ''}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-emerald-400 font-mono whitespace-nowrap">${Number(inv.importeTotal || 0).toFixed(2)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(inv.status)}`}>
                          {getStatusLabel(inv.status)}
                        </span>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </a>
                          <span className="text-xs text-gray-500 font-mono truncate max-w-[140px]">{inv.cae ? `CAE ${inv.cae}` : ''}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">Página {page} de {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <FileText className="w-4 h-4" />
        <span>Para emitir comprobantes usá el botón de facturación desde una venta o reserva.</span>
      </div>
    </div>
  );
}
