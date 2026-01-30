'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ImportProductsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId: string;
  onImportComplete: () => void;
}

interface ImportResult {
  success: number;
  errors: { row: number; error: string }[];
  created: { id: string; name: string }[];
}

export default function ImportProductsSidebar({
  isOpen,
  onClose,
  establishmentId,
  onImportComplete
}: ImportProductsSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      await apiClient.downloadProductImportTemplate();
    } catch (err: any) {
      setError('Error al descargar la plantilla');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse header - handle both comma and semicolon delimiters
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        data.push(row);
      }
    }
    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      setParsedData(data);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError('No hay datos para importar');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.importProducts(establishmentId, parsedData) as ImportResult;
      setResult(response);
      if (response.success > 0) {
        onImportComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Error al importar productos');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-800 border-l border-gray-700 z-[101] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Importar Productos</h2>
                <p className="text-sm text-gray-400">Carga masiva desde CSV</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Download Template */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs">1</span>
              Descarga la plantilla
            </div>
            <p className="text-sm text-gray-400 ml-8">
              Usa nuestra plantilla CSV para asegurar el formato correcto de los datos.
            </p>
            <button
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              className="ml-8 flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {downloadingTemplate ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Descargar Plantilla CSV
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs">2</span>
              Sube tu archivo
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="ml-8 border-2 border-dashed border-gray-600 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">{parsedData.length} productos encontrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-gray-500 mx-auto" />
                  <p className="text-gray-400">Click para seleccionar archivo CSV</p>
                  <p className="text-xs text-gray-500">o arrastra y suelta aquí</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Campos opcionales</p>
                <p className="text-blue-400/80">
                  Solo el nombre es obligatorio. Puedes dejar vacíos los demás campos y se usarán valores por defecto.
                  Si la categoría no existe, se creará automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {parsedData.length > 0 && !result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs">3</span>
                Vista previa
              </div>
              <div className="ml-8 bg-gray-900 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-400">#</th>
                      <th className="px-3 py-2 text-left text-gray-400">Nombre</th>
                      <th className="px-3 py-2 text-left text-gray-400">Categoría</th>
                      <th className="px-3 py-2 text-right text-gray-400">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t border-gray-700">
                        <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                        <td className="px-3 py-2 text-white">{row.nombre || '-'}</td>
                        <td className="px-3 py-2 text-gray-400">{row.categoria || '-'}</td>
                        <td className="px-3 py-2 text-right text-emerald-400">
                          ${parseFloat(row.precio_venta || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <div className="px-3 py-2 text-center text-gray-500 text-xs bg-gray-800">
                    y {parsedData.length - 5} productos más...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Success */}
              {result.success > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <div>
                      <p className="font-medium text-emerald-400">
                        {result.success} producto{result.success !== 1 ? 's' : ''} importado{result.success !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-emerald-400/70">
                        Se agregaron correctamente al inventario
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-medium text-red-400">
                        {result.errors.length} error{result.errors.length !== 1 ? 'es' : ''}
                      </p>
                      <ul className="text-sm text-red-400/70 space-y-1">
                        {result.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>Fila {err.row}: {err.error}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li className="text-gray-500">y {result.errors.length - 5} errores más...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 space-y-3">
          {!result ? (
            <button
              onClick={handleImport}
              disabled={importing || parsedData.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors"
            >
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Importar {parsedData.length > 0 ? `${parsedData.length} Productos` : 'Productos'}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
