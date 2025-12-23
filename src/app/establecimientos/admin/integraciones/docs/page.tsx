'use client';

import { useState } from 'react';
import { Copy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

export default function ApiDocsPage() {
  const { showSuccess } = useToast();
  const [activeSection, setActiveSection] = useState('intro');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado al portapapeles');
  };

  const CodeBlock = ({ code }: { code: string }) => (
    <div className="relative group">
      <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm border border-gray-200 dark:border-gray-800">
        <code className="text-gray-800 dark:text-gray-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-gray-700"
      >
        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );

  const menuItems = [
    { id: 'intro', title: 'Introducción' },
    { id: 'auth', title: 'Autenticación' },
    { id: 'create-booking', title: 'Crear Reserva' },
  ];

  const getButtonClass = (isActive: boolean) => {
    if (isActive) {
      return 'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium';
    }
    return 'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex">
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">API v1</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Documentación</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={getButtonClass(activeSection === item.id)}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/establecimientos/admin/integraciones"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la plataforma
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
        
          {activeSection === 'intro' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Introducción</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                La API de Mis Canchas te permite integrar tu establecimiento con sistemas externos.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-900 dark:text-blue-400 font-medium mb-2">URL Base</h3>
                <code className="text-sm text-blue-700 dark:text-blue-300 break-all">https://sports-booking-backend-production.up.railway.app</code>
              </div>
            </div>
          )}

          {activeSection === 'auth' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Autenticación</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Todas las peticiones requieren una API Key en el header X-API-Key.
              </p>
              <CodeBlock code="X-API-Key: tu-api-key-aqui" />
            </div>
          )}

          {activeSection === 'create-booking' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Reserva</h2>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded font-medium">POST</span>
                <span className="text-gray-700 dark:text-gray-300">/api/v1/bookings</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Crea una nueva reserva.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
