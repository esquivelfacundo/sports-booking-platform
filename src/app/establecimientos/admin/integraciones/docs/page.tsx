'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
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

  const menuGroups = [
    {
      title: 'General',
      color: 'gray',
      items: [
        { id: 'intro', title: 'Introducción' },
      ]
    },
    {
      title: 'API de Reservas',
      color: 'green',
      items: [
        { id: 'auth', title: 'Autenticación' },
        { id: 'create-booking', title: 'Crear Reserva' },
        { id: 'get-courts', title: 'Obtener Canchas' },
        { id: 'availability', title: 'Consultar Disponibilidad' },
        { id: 'errors', title: 'Códigos de Error' },
        { id: 'rate-limit', title: 'Rate Limiting' },
        { id: 'examples', title: 'Ejemplos de Código' },
      ]
    },
    {
      title: 'OpenAI',
      color: 'purple',
      items: [
        { id: 'openai-intro', title: 'Configuración' },
        { id: 'openai-assistant', title: 'Asistente IA' },
        { id: 'openai-prompts', title: 'Prompts del Sistema' },
      ]
    },
    {
      title: 'MercadoPago',
      color: 'blue',
      items: [
        { id: 'mp-intro', title: 'Configuración' },
        { id: 'mp-credentials', title: 'Credenciales' },
        { id: 'mp-webhooks', title: 'Webhooks' },
        { id: 'mp-testing', title: 'Modo de Prueba' },
      ]
    },
    {
      title: 'Ayuda',
      color: 'gray',
      items: [
        { id: 'support', title: 'Soporte' },
      ]
    }
  ];

  const getBadgeClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      gray: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    };
    return colors[color] || colors.gray;
  };

  const getButtonClass = (isActive: boolean) => {
    if (isActive) {
      return 'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium';
    }
    return 'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex">
      <aside className="w-72 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Documentación</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Integraciones y APIs</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="flex items-center gap-2 mb-2 px-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBadgeClass(group.color)}`}>{group.title}</span>
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
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
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
        
          {activeSection === 'intro' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Introducción</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Bienvenido a la documentación de integraciones de Mis Canchas. Aquí encontrarás toda la información necesaria para integrar tu establecimiento con servicios externos.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="text-green-900 dark:text-green-400 font-medium mb-2">API de Reservas</h3>
                  <p className="text-sm text-green-800 dark:text-green-300">Integra bots de WhatsApp y aplicaciones externas para gestionar reservas automáticamente.</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="text-purple-900 dark:text-purple-400 font-medium mb-2">OpenAI</h3>
                  <p className="text-sm text-purple-800 dark:text-purple-300">Configura el asistente de IA para responder consultas de clientes de forma inteligente.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-blue-900 dark:text-blue-400 font-medium mb-2">MercadoPago</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">Acepta pagos online de forma segura con la integración de MercadoPago.</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-2">URL Base de la API</h3>
                <code className="text-sm text-gray-700 dark:text-gray-300 break-all">https://sports-booking-backend-production.up.railway.app</code>
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
                <h3 className="text-gray-900 dark:text-white font-medium">Header requerido:</h3>
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
                        <td className="p-3">ID único de la cancha</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">fecha</td>
                        <td className="p-3">String</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Fecha YYYY-MM-DD</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">hora_inicio</td>
                        <td className="p-3">String</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Hora HH:MM (24h)</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">duracion</td>
                        <td className="p-3">Number</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Minutos (60, 90, 120)</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">cliente.nombre</td>
                        <td className="p-3">String</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Nombre del cliente</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">cliente.telefono</td>
                        <td className="p-3">String</td>
                        <td className="p-3">Sí</td>
                        <td className="p-3">Teléfono con código país</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">cliente.email</td>
                        <td className="p-3">String</td>
                        <td className="p-3">No</td>
                        <td className="p-3">Email (opcional)</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-xs">origen</td>
                        <td className="p-3">String</td>
                        <td className="p-3">No</td>
                        <td className="p-3">whatsapp, web, app</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Respuesta exitosa (201):</h3>
                <CodeBlock code={`{
  "success": true,
  "data": {
    "id": "uuid-de-la-reserva",
    "courtId": "uuid-de-la-cancha",
    "date": "2025-12-23",
    "startTime": "19:00",
    "endTime": "20:00",
    "status": "confirmed",
    "clientName": "Juan Pérez",
    "totalPrice": 5000
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

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Obtiene la lista de todas las canchas activas de tu establecimiento.</p>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Headers:</h3>
                <CodeBlock code="X-API-Key: tu-api-key" />
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Respuesta (200):</h3>
                <CodeBlock code={`{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Cancha 1",
      "sport": "Fútbol 5",
      "isActive": true,
      "pricePerHour": 5000
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Cancha 2",
      "sport": "Padel",
      "isActive": true,
      "pricePerHour": 4000
    }
  ]
}`} />
              </div>
            </div>
          )}

          {activeSection === 'availability' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Consultar Disponibilidad</h2>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded font-medium">GET</span>
                <span className="text-gray-700 dark:text-gray-300">/api/v1/courts/:courtId/availability?date=YYYY-MM-DD</span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Consulta los horarios disponibles de una cancha para una fecha específica.</p>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Ejemplo:</h3>
                <CodeBlock code="GET /api/v1/courts/550e8400-e29b-41d4-a716-446655440001/availability?date=2025-12-23" />
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Respuesta (200):</h3>
                <CodeBlock code={`{
  "success": true,
  "data": {
    "courtId": "550e8400-e29b-41d4-a716-446655440001",
    "date": "2025-12-23",
    "availableSlots": [
      { "start": "08:00", "end": "09:00", "available": true },
      { "start": "09:00", "end": "10:00", "available": true },
      { "start": "10:00", "end": "11:00", "available": false },
      { "start": "19:00", "end": "20:00", "available": true }
    ]
  }
}`} />
              </div>
            </div>
          )}

          {activeSection === 'errors' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Códigos de Error</h2>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Código</th>
                      <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 dark:text-gray-300">
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-emerald-600">200</td>
                      <td className="p-3">OK - Petición exitosa</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-emerald-600">201</td>
                      <td className="p-3">Created - Recurso creado</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-yellow-600">400</td>
                      <td className="p-3">Bad Request - Datos inválidos</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600">401</td>
                      <td className="p-3">Unauthorized - API Key inválida</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600">404</td>
                      <td className="p-3">Not Found - Recurso no existe</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600">409</td>
                      <td className="p-3">Conflict - Horario ya reservado</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-orange-600">429</td>
                      <td className="p-3">Too Many Requests - Rate limit</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-mono text-red-600">500</td>
                      <td className="p-3">Server Error - Error interno</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Formato de error:</h3>
                <CodeBlock code={`{
  "success": false,
  "error": "Validation Error",
  "message": "El campo 'cancha_id' es requerido"
}`} />
              </div>
            </div>
          )}

          {activeSection === 'rate-limit' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Rate Limiting</h2>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Límites</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                  <li>• <strong>100 peticiones</strong> cada 15 minutos por API Key</li>
                  <li>• El contador se reinicia automáticamente</li>
                  <li>• Error 429 si se excede el límite</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Headers de respuesta:</h3>
                <CodeBlock code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703307600`} />
              </div>
            </div>
          )}

          {activeSection === 'examples' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ejemplos de Código</h2>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">cURL</h3>
                <CodeBlock code={`curl -X POST https://sports-booking-backend-production.up.railway.app/api/v1/bookings \\
  -H "X-API-Key: tu-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cancha_id": "uuid-cancha",
    "fecha": "2025-12-23",
    "hora_inicio": "19:00",
    "duracion": 60,
    "cliente": {"nombre": "Juan", "telefono": "5493794123456"},
    "origen": "whatsapp"
  }'`} />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">JavaScript</h3>
                <CodeBlock code={`const response = await fetch(
  'https://sports-booking-backend-production.up.railway.app/api/v1/bookings',
  {
    method: 'POST',
    headers: {
      'X-API-Key': 'tu-api-key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      cancha_id: 'uuid-cancha',
      fecha: '2025-12-23',
      hora_inicio: '19:00',
      duracion: 60,
      cliente: { nombre: 'Juan', telefono: '5493794123456' },
      origen: 'whatsapp'
    })
  }
);
const data = await response.json();`} />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Python</h3>
                <CodeBlock code={`import requests

response = requests.post(
    'https://sports-booking-backend-production.up.railway.app/api/v1/bookings',
    headers={
        'X-API-Key': 'tu-api-key',
        'Content-Type': 'application/json'
    },
    json={
        'cancha_id': 'uuid-cancha',
        'fecha': '2025-12-23',
        'hora_inicio': '19:00',
        'duracion': 60,
        'cliente': {'nombre': 'Juan', 'telefono': '5493794123456'},
        'origen': 'whatsapp'
    }
)
print(response.json())`} />
              </div>
            </div>
          )}

          {activeSection === 'openai-intro' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">OpenAI - Configuración</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                La integración con OpenAI permite que tu bot de WhatsApp responda de forma inteligente a las consultas de los clientes usando GPT-4.
              </p>

              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="text-purple-900 dark:text-purple-400 font-medium mb-2">Requisitos</h3>
                <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
                  <li>• Cuenta en OpenAI (platform.openai.com)</li>
                  <li>• API Key de OpenAI</li>
                  <li>• Créditos disponibles en tu cuenta</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Variables de entorno requeridas:</h3>
                <CodeBlock code={`OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=500`} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Cómo obtener tu API Key de OpenAI</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                  <li>Ve a <strong>platform.openai.com</strong></li>
                  <li>Inicia sesión o crea una cuenta</li>
                  <li>Ve a <strong>API Keys</strong> en el menú lateral</li>
                  <li>Haz clic en <strong>Create new secret key</strong></li>
                  <li>Copia la clave y guárdala de forma segura</li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === 'openai-assistant' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">OpenAI - Asistente IA</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                El asistente de IA está configurado para responder consultas sobre tu establecimiento, disponibilidad de canchas, precios y realizar reservas.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Capacidades del asistente</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                  <li>• Responder preguntas sobre horarios y disponibilidad</li>
                  <li>• Informar precios de las canchas</li>
                  <li>• Guiar al cliente en el proceso de reserva</li>
                  <li>• Responder preguntas frecuentes</li>
                  <li>• Manejar múltiples idiomas</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Ejemplo de conversación:</h3>
                <CodeBlock code={`Usuario: Hola, quiero reservar una cancha de fútbol para mañana

Asistente: ¡Hola! Con gusto te ayudo a reservar. 
Tenemos disponibles las siguientes canchas de fútbol:

- Cancha 1 (Fútbol 5): $5000/hora
- Cancha 3 (Fútbol 7): $7000/hora

¿Para qué horario te gustaría reservar?

Usuario: A las 19:00 la cancha 1

Asistente: Perfecto. La Cancha 1 está disponible mañana 
a las 19:00. ¿Por cuánto tiempo? (60, 90 o 120 minutos)

Usuario: 60 minutos

Asistente: Excelente. Para confirmar la reserva necesito:
- Tu nombre completo
- Tu número de teléfono

Usuario: Juan Pérez, 3794123456

Asistente: ¡Listo! Tu reserva ha sido confirmada:
📅 Fecha: 24/12/2025
⏰ Horario: 19:00 - 20:00
⚽ Cancha: Cancha 1 (Fútbol 5)
💰 Total: $5000

¡Te esperamos!`} />
              </div>
            </div>
          )}

          {activeSection === 'openai-prompts' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">OpenAI - Prompts del Sistema</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                El comportamiento del asistente se configura mediante prompts del sistema que definen su personalidad y conocimientos.
              </p>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Prompt base del sistema:</h3>
                <CodeBlock code={`Eres un asistente virtual para {nombre_establecimiento}, 
un complejo deportivo ubicado en {ciudad}.

Tu rol es:
- Ayudar a los clientes a hacer reservas de canchas
- Informar sobre disponibilidad, precios y horarios
- Responder preguntas frecuentes sobre el establecimiento
- Ser amable, profesional y conciso

Información del establecimiento:
- Horario: {horario_apertura} a {horario_cierre}
- Canchas disponibles: {lista_canchas}
- Métodos de pago: Efectivo, MercadoPago

Reglas:
- Solo puedes hacer reservas para fechas futuras
- Verifica disponibilidad antes de confirmar
- Solicita nombre y teléfono para confirmar reservas
- Si no sabes algo, indica que contacten al establecimiento`} />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-yellow-900 dark:text-yellow-400 font-medium mb-2">Personalización</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  El prompt se personaliza automáticamente con la información de tu establecimiento. Puedes modificar el tono y las reglas desde el panel de administración.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'mp-intro' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">MercadoPago - Configuración</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                La integración con MercadoPago permite aceptar pagos online de forma segura para las reservas de canchas.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-900 dark:text-blue-400 font-medium mb-2">Características</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Pagos con tarjeta de crédito/débito</li>
                  <li>• Pagos con dinero en cuenta de MercadoPago</li>
                  <li>• Pagos en efectivo (Rapipago, Pago Fácil)</li>
                  <li>• Transferencias bancarias</li>
                  <li>• Notificaciones automáticas de pago</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Requisitos</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                  <li>Cuenta de MercadoPago verificada</li>
                  <li>Aplicación creada en MercadoPago Developers</li>
                  <li>Credenciales de producción activadas</li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === 'mp-credentials' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">MercadoPago - Credenciales</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Necesitas configurar las credenciales de MercadoPago para procesar pagos.
              </p>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Variables de entorno:</h3>
                <CodeBlock code={`# Credenciales de producción
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Credenciales de prueba (sandbox)
MERCADOPAGO_ACCESS_TOKEN_TEST=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY_TEST=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Cómo obtener las credenciales</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                  <li>Ve a <strong>mercadopago.com.ar/developers</strong></li>
                  <li>Inicia sesión con tu cuenta de MercadoPago</li>
                  <li>Ve a <strong>Tus integraciones</strong></li>
                  <li>Crea una nueva aplicación o selecciona una existente</li>
                  <li>En <strong>Credenciales de producción</strong>, copia el Access Token y Public Key</li>
                </ol>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-yellow-900 dark:text-yellow-400 font-medium mb-2">Importante</h3>
                <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                  <li>• Nunca expongas el Access Token en el frontend</li>
                  <li>• Usa credenciales de prueba para desarrollo</li>
                  <li>• Las credenciales de producción requieren verificación</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'mp-webhooks' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">MercadoPago - Webhooks</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Los webhooks permiten recibir notificaciones automáticas cuando se procesa un pago.
              </p>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">URL del webhook:</h3>
                <CodeBlock code="https://sports-booking-backend-production.up.railway.app/api/webhooks/mercadopago" />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Configurar webhook en MercadoPago</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                  <li>Ve a tu aplicación en MercadoPago Developers</li>
                  <li>En la sección <strong>Webhooks</strong>, haz clic en configurar</li>
                  <li>Ingresa la URL del webhook</li>
                  <li>Selecciona los eventos: <strong>payment</strong></li>
                  <li>Guarda la configuración</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Eventos soportados:</h3>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Evento</th>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300 font-medium">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300">
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-sm">payment.created</td>
                        <td className="p-3">Se registra el intento de pago</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-sm">payment.approved</td>
                        <td className="p-3">Se confirma la reserva</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-sm">payment.rejected</td>
                        <td className="p-3">Se notifica al usuario</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-800">
                        <td className="p-3 font-mono text-sm">payment.refunded</td>
                        <td className="p-3">Se cancela la reserva</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'mp-testing' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">MercadoPago - Modo de Prueba</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Usa el modo de prueba para testear la integración sin procesar pagos reales.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Tarjetas de prueba</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Visa (Aprobada):</p>
                    <code className="text-gray-800 dark:text-gray-200">4509 9535 6623 3704</code>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Mastercard (Aprobada):</p>
                    <code className="text-gray-800 dark:text-gray-200">5031 7557 3453 0604</code>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">American Express (Aprobada):</p>
                    <code className="text-gray-800 dark:text-gray-200">3711 803032 57522</code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white font-medium">Datos de prueba:</h3>
                <CodeBlock code={`CVV: 123
Fecha de vencimiento: 11/25
Nombre: APRO (para aprobar) o OTHE (para rechazar)
DNI: 12345678`} />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-900 dark:text-blue-400 font-medium mb-2">Usuarios de prueba</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  MercadoPago recomienda crear usuarios de prueba separados para comprador y vendedor. 
                  Puedes crearlos desde el panel de desarrolladores.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Soporte</h2>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white font-medium mb-3">Canales de soporte</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                  <li><strong>Email:</strong> soporte@miscanchas.com</li>
                  <li><strong>WhatsApp:</strong> +54 9 379 4123456</li>
                  <li><strong>Horario:</strong> Lunes a Viernes 9:00 - 18:00 (Argentina)</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-900 dark:text-blue-400 font-medium mb-2">Información</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• <strong>Versión API:</strong> 1.0</li>
                  <li>• <strong>Última actualización:</strong> Diciembre 2025</li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
