'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Code, 
  Key, 
  ArrowLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

export default function ApiDocsPage() {
  const { showSuccess } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>(['intro']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado al portapapeles');
  };

  const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => (
    <div className="relative group">
      <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Copy className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );

  const Section = ({ 
    id, 
    title, 
    children 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode 
  }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <div className="border border-gray-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
        >
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6 bg-gray-800/50"
          >
            {children}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link 
            href="/establecimientos/admin/integraciones"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Integraciones
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Documentación API v1</h1>
              <p className="text-gray-400">Integra tu establecimiento con sistemas externos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        
        {/* Introducción */}
        <Section id="intro" title="🚀 Introducción">
          <div className="space-y-4 text-gray-300">
            <p>
              La API de Mis Canchas te permite integrar tu establecimiento con sistemas externos como bots de WhatsApp,
              aplicaciones móviles, o cualquier otro servicio que necesite crear y gestionar reservas automáticamente.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                URL Base
              </h3>
              <code className="text-sm text-blue-300">https://sports-booking-backend-production.up.railway.app</code>
            </div>
          </div>
        </Section>

        {/* Autenticación */}
        <Section id="auth" title="🔐 Autenticación">
          <div className="space-y-4">
            <p className="text-gray-300">
              Todas las peticiones a la API requieren una API Key que debes incluir en el header <code className="text-emerald-400">X-API-Key</code>.
            </p>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Obtener tu API Key</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                <li>Ve a la sección de Integraciones</li>
                <li>En "API Key para Bot de WhatsApp", genera tu clave</li>
                <li>Copia la API Key generada</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Ejemplo de Header:</h3>
              <CodeBlock code={`X-API-Key: mc_3f9580c86f9529a6f74d48bdacd1764c236bd5c449a40f6510991e6363bc268a`} />
            </div>
          </div>
        </Section>

        {/* Crear Reserva */}
        <Section id="create-booking" title="📅 Crear Reserva">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
              <span className="px-2 py-1 bg-emerald-500/20 rounded">POST</span>
              <span>/api/v1/bookings</span>
            </div>

            <p className="text-gray-300">Crea una nueva reserva en una cancha específica.</p>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Headers:</h3>
              <CodeBlock code={`X-API-Key: tu-api-key
Content-Type: application/json`} />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Body (JSON):</h3>
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
}`} language="json" />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Parámetros:</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-3 text-gray-300">Campo</th>
                      <th className="text-left p-3 text-gray-300">Tipo</th>
                      <th className="text-left p-3 text-gray-300">Requerido</th>
                      <th className="text-left p-3 text-gray-300">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-t border-gray-800">
                      <td className="p-3 font-mono text-emerald-400">cancha_id</td>
                      <td className="p-3">UUID</td>
                      <td className="p-3">✅ Sí</td>
                      <td className="p-3">ID único de la cancha</td>
                    </tr>
                    <tr className="border-t border-gray-800">
                      <td className="p-3 font-mono text-emerald-400">fecha</td>
                      <td className="p-3">String</td>
                      <td className="p-3">✅ Sí</td>
                      <td className="p-3">Fecha en formato YYYY-MM-DD</td>
                    </tr>
                    <tr className="border-t border-gray-800">
                      <td className="p-3 font-mono text-emerald-400">hora_inicio</td>
                      <td className="p-3">String</td>
                      <td className="p-3">✅ Sí</td>
                      <td className="p-3">Hora en formato HH:MM (24h)</td>
                    </tr>
                    <tr className="border-t border-gray-800">
                      <td className="p-3 font-mono text-emerald-400">duracion</td>
                      <td className="p-3">Number</td>
                      <td className="p-3">✅ Sí</td>
                      <td className="p-3">Duración en minutos (60, 90, 120)</td>
                    </tr>
                    <tr className="border-t border-gray-800">
                      <td className="p-3 font-mono text-emerald-400">cliente.nombre</td>
                      <td className="p-3">String</td>
                      <td className="p-3">✅ Sí</td>
                      <td className="p-3">Nombre completo del cliente</td>
                    </tr>
                    <tr className="border-t border-gray-800">
                      <td className="p-3 font-mono text-emerald-400">cliente.telefono</td>
                      <td className="p-3">String</td>
                      <td className="p-3">✅ Sí</td>
                      <td className="p-3">Teléfono con código de país</td>
                    </tr>
                    <tr className="border-t border-gray-800">
                      <td className="p-3 font-mono text-emerald-400">cliente.email</td>
                      <td className="p-3">String</td>
                      <td className="p-3">❌ No</td>
                      <td className="p-3">Email del cliente</td>
                    </tr>
                    <tr className="border-t border-gray-800">
                      <td className="p-3 font-mono text-emerald-400">origen</td>
                      <td className="p-3">String</td>
                      <td className="p-3">❌ No</td>
                      <td className="p-3">Origen de la reserva (whatsapp, web, etc)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Respuesta Exitosa (201):</h3>
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
    "createdAt": "2025-12-22T23:00:00.000Z"
  }
}`} language="json" />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Ejemplo con cURL:</h3>
              <CodeBlock code={`curl -X POST https://sports-booking-backend-production.up.railway.app/api/v1/bookings \\
  -H "X-API-Key: tu-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
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
  }'`} />
            </div>
          </div>
        </Section>

        {/* Obtener Canchas */}
        <Section id="get-courts" title="🏟️ Obtener Canchas">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-sm">
              <span className="px-2 py-1 bg-blue-500/20 rounded">GET</span>
              <span>/api/v1/courts</span>
            </div>

            <p className="text-gray-300">Obtiene la lista de todas las canchas de tu establecimiento.</p>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Headers:</h3>
              <CodeBlock code={`X-API-Key: tu-api-key`} />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Respuesta (200):</h3>
              <CodeBlock code={`{
  "success": true,
  "data": [
    {
      "id": "uuid-cancha-1",
      "name": "Cancha 1",
      "sport": "Fútbol 5",
      "isActive": true,
      "pricePerHour": 5000
    },
    {
      "id": "uuid-cancha-2",
      "name": "Cancha 2",
      "sport": "Padel",
      "isActive": true,
      "pricePerHour": 4000
    }
  ]
}`} language="json" />
            </div>
          </div>
        </Section>

        {/* Disponibilidad */}
        <Section id="availability" title="📊 Consultar Disponibilidad">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-sm">
              <span className="px-2 py-1 bg-blue-500/20 rounded">GET</span>
              <span>/api/v1/courts/:courtId/availability</span>
            </div>

            <p className="text-gray-300">Consulta la disponibilidad de una cancha en una fecha específica.</p>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Headers:</h3>
              <CodeBlock code={`X-API-Key: tu-api-key`} />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Query Parameters:</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><code className="text-emerald-400">date</code> (requerido): Fecha en formato YYYY-MM-DD</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Ejemplo:</h3>
              <CodeBlock code={`GET /api/v1/courts/uuid-cancha-1/availability?date=2025-12-23`} />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Respuesta (200):</h3>
              <CodeBlock code={`{
  "success": true,
  "data": {
    "courtId": "uuid-cancha-1",
    "date": "2025-12-23",
    "availableSlots": [
      { "start": "08:00", "end": "09:00", "available": true },
      { "start": "09:00", "end": "10:00", "available": true },
      { "start": "10:00", "end": "11:00", "available": false },
      { "start": "19:00", "end": "20:00", "available": true }
    ]
  }
}`} language="json" />
            </div>
          </div>
        </Section>

        {/* Códigos de Error */}
        <Section id="errors" title="⚠️ Códigos de Error">
          <div className="space-y-4">
            <p className="text-gray-300">La API utiliza códigos de estado HTTP estándar:</p>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-3 text-gray-300">Código</th>
                    <th className="text-left p-3 text-gray-300">Descripción</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-t border-gray-800">
                    <td className="p-3 font-mono text-emerald-400">200</td>
                    <td className="p-3">OK - La petición fue exitosa</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="p-3 font-mono text-emerald-400">201</td>
                    <td className="p-3">Created - Recurso creado exitosamente</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="p-3 font-mono text-yellow-400">400</td>
                    <td className="p-3">Bad Request - Datos faltantes o formato incorrecto</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="p-3 font-mono text-red-400">401</td>
                    <td className="p-3">Unauthorized - API Key incorrecta o faltante</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="p-3 font-mono text-red-400">404</td>
                    <td className="p-3">Not Found - Recurso no encontrado</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="p-3 font-mono text-red-400">409</td>
                    <td className="p-3">Conflict - La cancha ya está reservada en ese horario</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="p-3 font-mono text-red-400">500</td>
                    <td className="p-3">Internal Server Error - Error del servidor</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Formato de Error:</h3>
              <CodeBlock code={`{
  "success": false,
  "error": "Validation Error",
  "message": "El campo 'cancha_id' es requerido",
  "details": {
    "field": "cancha_id",
    "issue": "required"
  }
}`} language="json" />
            </div>
          </div>
        </Section>

        {/* Rate Limiting */}
        <Section id="rate-limit" title="⏱️ Rate Limiting">
          <div className="space-y-4 text-gray-300">
            <p>
              La API tiene límites de peticiones para prevenir abuso:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>100 peticiones</strong> por cada 15 minutos por API Key</li>
              <li>Si excedes el límite, recibirás un error <code className="text-red-400">429 Too Many Requests</code></li>
              <li>El límite se resetea automáticamente cada 15 minutos</li>
            </ul>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-yellow-400 font-medium mb-1">Recomendación</h3>
                  <p className="text-sm">
                    Implementa un sistema de caché en tu aplicación para reducir el número de peticiones a la API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Ejemplos de Código */}
        <Section id="examples" title="💻 Ejemplos de Código">
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-3">JavaScript / Node.js</h3>
              <CodeBlock code={`const axios = require('axios');

const API_KEY = 'tu-api-key';
const BASE_URL = 'https://sports-booking-backend-production.up.railway.app';

async function crearReserva(canchaId, fecha, horaInicio, duracion, cliente) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/api/v1/bookings\`,
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
    
    console.log('Reserva creada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Uso
crearReserva(
  'uuid-cancha-1',
  '2025-12-23',
  '19:00',
  60,
  {
    nombre: 'Juan Pérez',
    telefono: '5493794123456',
    email: 'juan@email.com'
  }
);`} language="javascript" />
            </div>

            <div>
              <h3 className="text-white font-medium mb-3">Python</h3>
              <CodeBlock code={`import requests

API_KEY = 'tu-api-key'
BASE_URL = 'https://sports-booking-backend-production.up.railway.app'

def crear_reserva(cancha_id, fecha, hora_inicio, duracion, cliente):
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    data = {
        'cancha_id': cancha_id,
        'fecha': fecha,
        'hora_inicio': hora_inicio,
        'duracion': duracion,
        'cliente': cliente,
        'origen': 'whatsapp'
    }
    
    response = requests.post(
        f'{BASE_URL}/api/v1/bookings',
        headers=headers,
        json=data
    )
    
    if response.status_code == 201:
        print('Reserva creada:', response.json())
        return response.json()
    else:
        print('Error:', response.status_code, response.json())
        raise Exception(response.json())

# Uso
crear_reserva(
    'uuid-cancha-1',
    '2025-12-23',
    '19:00',
    60,
    {
        'nombre': 'Juan Pérez',
        'telefono': '5493794123456',
        'email': 'juan@email.com'
    }
)`} language="python" />
            </div>
          </div>
        </Section>

        {/* Soporte */}
        <Section id="support" title="💬 Soporte">
          <div className="space-y-4 text-gray-300">
            <p>
              Si tienes problemas o preguntas sobre la API, puedes contactarnos:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Email: <a href="mailto:soporte@miscanchas.com" className="text-blue-400 hover:underline">soporte@miscanchas.com</a></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Documentación actualizada: Versión 1.0</span>
              </li>
            </ul>
          </div>
        </Section>

      </div>
    </div>
  );
}
