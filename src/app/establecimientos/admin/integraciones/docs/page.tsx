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
        <code className="text-gray-800 dark:text-gray-300 font-mono whitespace-pre-wrap">{code}</code>
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
    { id: 'get-courts', title: 'Obtener Canchas' },
    { id: 'availability', title: 'Consultar Disponibilidad' },
    { id: 'errors', title: 'Códigos de Error' },
    { id: 'rate-limit', title: 'Rate Limiting' },
    { id: 'examples', title: 'Ejemplos de Código' },
    { id: 'support', title: 'Soporte' },
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
                La API de Mis Canchas te permite integrar tu establecimiento con sistemas externos como bots de WhatsApp,
                aplicaciones móviles, o cualquier otro servicio que necesite crear y gestionar reservas automáticamente.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-900 dark:text-blue-400 font-medium mb-2">URL Base</h3>
                <code className="text-sm text-blue-700 dark:text-blue-300 break-all">https://sports-booking-backend-production.up.railway.app</code>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-2">Versión actual</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">API v1 - Todas las rutas usan el prefijo <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-sm">/api/v1</code></p>
              </div>
            </div>
          )}

          {activeSection === 'auth' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Autenticación</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Todas las peticiones a la API requieren una API Key que debes incluir en el header <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-emerald-600 dark:text-emerald-400 text-sm">X-API-Key</code>.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Cómo obtener tu API Key</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                  <li>Ingresa al panel de administración de tu establecimiento</li>
                  <li>Ve a la sección de <strong>Integraciones</strong></li>
                  <li>En la sección &quot;API Key para Bot de WhatsApp&quot;, haz clic en <strong>Generar API Key</strong></li>
                  <li>Copia la API Key generada y guárdala en un lugar seguro</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Header requerido en todas las peticiones:</h3>
                <CodeBlock code="X-API-Key: mc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-yellow-900 dark:text-yellow-400 font-medium mb-2">Importante</h3>
                <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                  <li>• La API Key es única por establecimiento</li>
                  <li>• No compartas tu API Key públicamente</li>
                  <li>• Si sospechas que fue comprometida, regenera una nueva</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'create-booking' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Reserva</h2>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded font-medium">POST</span>
                <span className="text-gray-700 dark:text-gray-300">/api/v1/bookings</span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Crea una nueva reserva en una cancha específica de tu establecimiento.</p>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Headers requeridos:</h3>
                <CodeBlock code={`X-API-Key: tu-api-key
Content-Type: application/json`} />
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Body (JSON):</h3>
                <CodeBlock code={`{
  "cancha_id": "uuid-de-la-cancha",
  "fecha": "2025-12-23",
  "hora_inicio": "19:00",
  "duracion": 60,
  "cliente": {
    "nombre": "Juan Pérez",
    "telefono": "5493794123456",
    "email": "juan@email.com"
  },
  "origen": "whatsapp"
}`} />
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Parámetros:</h3>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Campo</th>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Tipo</th>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Requerido</th>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300">
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">cancha_id</td>
                        <td className="p-3">UUID</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">ID único de la cancha (obtenido de /api/v1/courts)</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">fecha</td>
                        <td className="p-3">String</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Fecha en formato YYYY-MM-DD</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">hora_inicio</td>
                        <td className="p-3">String</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Hora en formato HH:MM (24 horas)</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">duracion</td>
                        <td className="p-3">Number</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Duración en minutos (60, 90, 120)</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">cliente.nombre</td>
                        <td className="p-3">String</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Nombre completo del cliente</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">cliente.telefono</td>
                        <td className="p-3">String</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Teléfono con código de país (ej: 5493794123456)</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">cliente.email</td>
                        <td className="p-3">String</td>
                        <td className="p-3">No</td>
                        <td className="p-3">Email del cliente (opcional)</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">origen</td>
                        <td className="p-3">String</td>
                        <td className="p-3">No</td>
                        <td className="p-3">Origen de la reserva: whatsapp, web, app</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Respuesta exitosa (201 Created):</h3>
                <CodeBlock code={`{
  "success": true,
  "data": {
    "id": "uuid-de-la-reserva",
    "courtId": "uuid-de-la-cancha",
    "date": "2025-12-23",
    "startTime": "19:00",
    "endTime": "20:00",
    "duration": 60,
    "status": "confirmed",
    "clientName": "Juan Pérez",
    "clientPhone": "5493794123456",
    "clientEmail": "juan@email.com",
    "origin": "whatsapp",
    "totalPrice": 5000,
    "createdAt": "2025-12-22T23:00:00.000Z"
  }
}`} />
              </div>
            </div>
          )}

          {activeSection === 'get-courts' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Obtener Canchas</h2>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded font-medium">GET</span>
                <span className="text-gray-700 dark:text-gray-300">/api/v1/courts</span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Obtiene la lista de todas las canchas activas de tu establecimiento. Usa los IDs de las canchas para crear reservas.</p>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Headers requeridos:</h3>
                <CodeBlock code="X-API-Key: tu-api-key" />
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Respuesta exitosa (200 OK):</h3>
                <CodeBlock code={`{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Cancha 1",
      "sport": "Fútbol 5",
      "isActive": true,
      "pricePerHour": 5000,
      "description": "Cancha de césped sintético"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Cancha 2",
      "sport": "Padel",
      "isActive": true,
      "pricePerHour": 4000,
      "description": "Cancha de padel profesional"
    }
  ]
}`} />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-900 dark:text-blue-400 font-medium mb-2">Tip</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Guarda los IDs de las canchas en tu sistema para usarlos al crear reservas. Los IDs son UUIDs únicos que no cambian.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'availability' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Consultar Disponibilidad</h2>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded font-medium">GET</span>
                <span className="text-gray-700 dark:text-gray-300">/api/v1/courts/:courtId/availability</span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Consulta los horarios disponibles de una cancha específica para una fecha determinada.</p>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Headers requeridos:</h3>
                <CodeBlock code="X-API-Key: tu-api-key" />
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Parámetros de URL:</h3>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                    <li><code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-emerald-600 dark:text-emerald-400">:courtId</code> - UUID de la cancha</li>
                    <li><code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-emerald-600 dark:text-emerald-400">?date=YYYY-MM-DD</code> - Fecha a consultar (query param)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Ejemplo de petición:</h3>
                <CodeBlock code="GET /api/v1/courts/550e8400-e29b-41d4-a716-446655440001/availability?date=2025-12-23" />
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Respuesta exitosa (200 OK):</h3>
                <CodeBlock code={`{
  "success": true,
  "data": {
    "courtId": "550e8400-e29b-41d4-a716-446655440001",
    "date": "2025-12-23",
    "availableSlots": [
      { "start": "08:00", "end": "09:00", "available": true },
      { "start": "09:00", "end": "10:00", "available": true },
      { "start": "10:00", "end": "11:00", "available": false },
      { "start": "11:00", "end": "12:00", "available": true },
      { "start": "18:00", "end": "19:00", "available": true },
      { "start": "19:00", "end": "20:00", "available": false },
      { "start": "20:00", "end": "21:00", "available": true }
    ]
  }
}`} />
              </div>
            </div>
          )}

          {activeSection === 'errors' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Códigos de Error</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">La API utiliza códigos de estado HTTP estándar para indicar el resultado de las peticiones.</p>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Código</th>
                      <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Nombre</th>
                      <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 dark:text-gray-300">
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">200</td>
                      <td className="p-3">OK</td>
                      <td className="p-3">La petición fue exitosa</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">201</td>
                      <td className="p-3">Created</td>
                      <td className="p-3">Recurso creado exitosamente (ej: nueva reserva)</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-yellow-600 dark:text-yellow-400">400</td>
                      <td className="p-3">Bad Request</td>
                      <td className="p-3">Datos faltantes o formato incorrecto en la petición</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600 dark:text-red-400">401</td>
                      <td className="p-3">Unauthorized</td>
                      <td className="p-3">API Key incorrecta, faltante o expirada</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600 dark:text-red-400">403</td>
                      <td className="p-3">Forbidden</td>
                      <td className="p-3">No tienes permisos para acceder a este recurso</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600 dark:text-red-400">404</td>
                      <td className="p-3">Not Found</td>
                      <td className="p-3">El recurso solicitado no existe</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600 dark:text-red-400">409</td>
                      <td className="p-3">Conflict</td>
                      <td className="p-3">Conflicto: la cancha ya está reservada en ese horario</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-orange-600 dark:text-orange-400">429</td>
                      <td className="p-3">Too Many Requests</td>
                      <td className="p-3">Has excedido el límite de peticiones (rate limit)</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600 dark:text-red-400">500</td>
                      <td className="p-3">Internal Server Error</td>
                      <td className="p-3">Error interno del servidor</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Formato de respuesta de error:</h3>
                <CodeBlock code={`{
  "success": false,
  "error": "Validation Error",
  "message": "El campo 'cancha_id' es requerido",
  "details": {
    "field": "cancha_id",
    "issue": "required"
  }
}`} />
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Ejemplo de error 409 (Conflicto de horario):</h3>
                <CodeBlock code={`{
  "success": false,
  "error": "Booking Conflict",
  "message": "La cancha ya está reservada para el horario 19:00 - 20:00 del 2025-12-23"
}`} />
              </div>
            </div>
          )}

          {activeSection === 'rate-limit' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Rate Limiting</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Para garantizar la estabilidad del servicio, la API tiene límites de peticiones por API Key.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Límites actuales</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                  <li>• <strong>100 peticiones</strong> cada 15 minutos por API Key</li>
                  <li>• El contador se reinicia automáticamente cada 15 minutos</li>
                  <li>• Las peticiones que excedan el límite recibirán error 429</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Headers de respuesta:</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">Cada respuesta incluye headers con información del rate limit:</p>
                <CodeBlock code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703307600`} />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-yellow-900 dark:text-yellow-400 font-medium mb-2">Recomendaciones</h3>
                <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                  <li>• Implementa caché local para reducir peticiones repetidas</li>
                  <li>• Usa el header X-RateLimit-Remaining para monitorear tu uso</li>
                  <li>• Si recibes 429, espera hasta el tiempo indicado en X-RateLimit-Reset</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'examples' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ejemplos de Código</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Ejemplos prácticos de cómo integrar la API en diferentes lenguajes de programación.
              </p>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">cURL</h3>
                <CodeBlock code={`# Crear una reserva
curl -X POST https://sports-booking-backend-production.up.railway.app/api/v1/bookings \\
  -H "X-API-Key: tu-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cancha_id": "uuid-de-la-cancha",
    "fecha": "2025-12-23",
    "hora_inicio": "19:00",
    "duracion": 60,
    "cliente": {
      "nombre": "Juan Pérez",
      "telefono": "5493794123456"
    },
    "origen": "whatsapp"
  }'`} />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">JavaScript / Node.js</h3>
                <CodeBlock code={`const axios = require('axios');

const API_KEY = 'tu-api-key';
const BASE_URL = 'https://sports-booking-backend-production.up.railway.app';

// Obtener canchas
async function getCourts() {
  const response = await axios.get(BASE_URL + '/api/v1/courts', {
    headers: { 'X-API-Key': API_KEY }
  });
  return response.data;
}

// Crear reserva
async function createBooking(canchaId, fecha, horaInicio, duracion, cliente) {
  const response = await axios.post(
    BASE_URL + '/api/v1/bookings',
    {
      cancha_id: canchaId,
      fecha: fecha,
      hora_inicio: horaInicio,
      duracion: duracion,
      cliente: cliente,
      origen: 'whatsapp'
    },
    {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

// Ejemplo de uso
createBooking(
  'uuid-cancha-1',
  '2025-12-23',
  '19:00',
  60,
  { nombre: 'Juan Pérez', telefono: '5493794123456' }
).then(console.log).catch(console.error);`} />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Python</h3>
                <CodeBlock code={`import requests

API_KEY = 'tu-api-key'
BASE_URL = 'https://sports-booking-backend-production.up.railway.app'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Obtener canchas
def get_courts():
    response = requests.get(f'{BASE_URL}/api/v1/courts', headers=headers)
    return response.json()

# Consultar disponibilidad
def get_availability(court_id, date):
    response = requests.get(
        f'{BASE_URL}/api/v1/courts/{court_id}/availability',
        params={'date': date},
        headers=headers
    )
    return response.json()

# Crear reserva
def create_booking(cancha_id, fecha, hora_inicio, duracion, cliente):
    data = {
        'cancha_id': cancha_id,
        'fecha': fecha,
        'hora_inicio': hora_inicio,
        'duracion': duracion,
        'cliente': cliente,
        'origen': 'whatsapp'
    }
    response = requests.post(f'{BASE_URL}/api/v1/bookings', json=data, headers=headers)
    return response.json()

# Ejemplo de uso
result = create_booking(
    'uuid-cancha-1',
    '2025-12-23',
    '19:00',
    60,
    {'nombre': 'Juan Pérez', 'telefono': '5493794123456'}
)
print(result)`} />
              </div>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Soporte</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Si tienes problemas o preguntas sobre la API, estamos aquí para ayudarte.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Canales de soporte</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>Email:</strong> soporte@miscanchas.com</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>WhatsApp:</strong> +54 9 379 4123456</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>Horario:</strong> Lunes a Viernes de 9:00 a 18:00 (Argentina)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-900 dark:text-blue-400 font-medium mb-2">Información de la API</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• <strong>Versión:</strong> 1.0</li>
                  <li>• <strong>Última actualización:</strong> Diciembre 2025</li>
                  <li>• <strong>Estado:</strong> Producción</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-yellow-900 dark:text-yellow-400 font-medium mb-2">Antes de contactar soporte</h3>
                <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                  <li>• Verifica que tu API Key sea correcta</li>
                  <li>• Revisa los códigos de error en esta documentación</li>
                  <li>• Incluye el código de error y mensaje en tu consulta</li>
                  <li>• Proporciona ejemplos de las peticiones que estás haciendo</li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
