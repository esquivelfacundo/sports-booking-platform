'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-emerald-500" />
          <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-gray-400 text-lg mb-8">
            Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">1. Información que Recopilamos</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                En <strong>Mis Canchas</strong> recopilamos información para brindarte un mejor servicio. 
                Los tipos de información que podemos recopilar incluyen:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Información de cuenta:</strong> nombre, apellido, correo electrónico, número de teléfono.</li>
                <li><strong>Información de autenticación:</strong> datos proporcionados al iniciar sesión con Google.</li>
                <li><strong>Información de reservas:</strong> historial de reservas, preferencias de canchas y horarios.</li>
                <li><strong>Información de pago:</strong> procesada de forma segura a través de Mercado Pago (no almacenamos datos de tarjetas).</li>
                <li><strong>Información de uso:</strong> cómo interactúas con nuestra plataforma.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. Cómo Utilizamos tu Información</h2>
            <div className="text-gray-300 space-y-4">
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestionar tu cuenta y autenticación.</li>
                <li>Procesar y administrar tus reservas de canchas.</li>
                <li>Enviarte confirmaciones, recordatorios y notificaciones importantes.</li>
                <li>Mejorar nuestros servicios y experiencia de usuario.</li>
                <li>Comunicarnos contigo sobre actualizaciones o cambios en el servicio.</li>
                <li>Prevenir fraudes y garantizar la seguridad de la plataforma.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. Compartición de Información</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                No vendemos ni alquilamos tu información personal. Podemos compartir información con:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Establecimientos deportivos:</strong> para gestionar tus reservas.</li>
                <li><strong>Proveedores de servicios:</strong> como Mercado Pago para procesar pagos, Google para autenticación.</li>
                <li><strong>Autoridades legales:</strong> cuando sea requerido por ley.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">4. Seguridad de los Datos</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encriptación de datos en tránsito (HTTPS/TLS).</li>
                <li>Almacenamiento seguro de contraseñas con hash bcrypt.</li>
                <li>Tokens de autenticación seguros (JWT).</li>
                <li>Acceso restringido a datos personales.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">5. Tus Derechos</h2>
            <div className="text-gray-300 space-y-4">
              <p>Tienes derecho a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acceder a tu información personal.</li>
                <li>Rectificar datos incorrectos.</li>
                <li>Solicitar la eliminación de tu cuenta y datos.</li>
                <li>Oponerte al procesamiento de tus datos.</li>
                <li>Retirar tu consentimiento en cualquier momento.</li>
              </ul>
              <p>
                Para ejercer estos derechos, contáctanos a través de{' '}
                <a href="mailto:soporte@miscanchas.com" className="text-emerald-400 hover:underline">
                  soporte@miscanchas.com
                </a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">6. Cookies y Tecnologías Similares</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantener tu sesión iniciada.</li>
                <li>Recordar tus preferencias.</li>
                <li>Analizar el uso de la plataforma.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">7. Cambios en esta Política</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre 
                cambios significativos a través de la plataforma o por correo electrónico.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">8. Contacto</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:
              </p>
              <ul className="list-none space-y-2">
                <li>📧 Email: <a href="mailto:soporte@miscanchas.com" className="text-emerald-400 hover:underline">soporte@miscanchas.com</a></li>
                <li>🌐 Web: <a href="https://miscanchas.com" className="text-emerald-400 hover:underline">miscanchas.com</a></li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/legal" className="text-emerald-400 hover:underline">
              Términos y Condiciones
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/" className="text-gray-400 hover:text-white">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
