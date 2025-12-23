'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function LegalPage() {
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
          <FileText className="w-10 h-10 text-emerald-500" />
          <h1 className="text-3xl font-bold text-white">Términos y Condiciones</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-gray-400 text-lg mb-8">
            Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">1. Aceptación de los Términos</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Al acceder y utilizar <strong>Mis Canchas</strong> (en adelante, "la Plataforma"), 
                aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con 
                alguna parte de estos términos, no debes utilizar la Plataforma.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. Descripción del Servicio</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Mis Canchas es una plataforma que permite:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A los <strong>jugadores</strong>: buscar, reservar y pagar canchas deportivas.</li>
                <li>A los <strong>establecimientos</strong>: gestionar sus canchas, reservas, clientes y operaciones.</li>
              </ul>
              <p>
                Actuamos como intermediarios entre jugadores y establecimientos deportivos, 
                facilitando la conexión y gestión de reservas.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. Registro y Cuenta</h2>
            <div className="text-gray-300 space-y-4">
              <p>Para utilizar la Plataforma debes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ser mayor de 18 años o contar con autorización de un tutor legal.</li>
                <li>Proporcionar información veraz y actualizada.</li>
                <li>Mantener la confidencialidad de tus credenciales de acceso.</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.</li>
              </ul>
              <p>
                Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">4. Reservas y Pagos</h2>
            <div className="text-gray-300 space-y-4">
              <h3 className="text-lg font-medium text-white mt-4">4.1 Proceso de Reserva</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Las reservas están sujetas a disponibilidad.</li>
                <li>Al confirmar una reserva, aceptas los términos específicos del establecimiento.</li>
                <li>Es tu responsabilidad verificar los detalles de la reserva antes de confirmar.</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4">4.2 Pagos</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Los pagos se procesan a través de Mercado Pago de forma segura.</li>
                <li>Los precios mostrados incluyen todos los cargos aplicables.</li>
                <li>Algunos establecimientos pueden requerir una seña para confirmar la reserva.</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4">4.3 Cancelaciones y Reembolsos</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Las políticas de cancelación varían según cada establecimiento.</li>
                <li>Revisa la política de cancelación antes de confirmar tu reserva.</li>
                <li>Los reembolsos se procesarán según la política del establecimiento.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">5. Obligaciones de los Usuarios</h2>
            <div className="text-gray-300 space-y-4">
              <p>Al usar la Plataforma, te comprometes a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>No utilizar la Plataforma para fines ilegales o no autorizados.</li>
                <li>No interferir con el funcionamiento de la Plataforma.</li>
                <li>No intentar acceder a cuentas o datos de otros usuarios.</li>
                <li>Respetar las normas de los establecimientos deportivos.</li>
                <li>Asistir a las reservas confirmadas o cancelar con anticipación.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">6. Obligaciones de los Establecimientos</h2>
            <div className="text-gray-300 space-y-4">
              <p>Los establecimientos registrados se comprometen a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantener información actualizada sobre sus instalaciones y servicios.</li>
                <li>Honrar las reservas confirmadas a través de la Plataforma.</li>
                <li>Proporcionar instalaciones en condiciones adecuadas.</li>
                <li>Cumplir con todas las regulaciones locales aplicables.</li>
                <li>Gestionar de manera justa las cancelaciones y reembolsos.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">7. Propiedad Intelectual</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Todo el contenido de la Plataforma, incluyendo pero no limitado a textos, gráficos, 
                logos, iconos, imágenes, software y código, es propiedad de Mis Canchas o sus 
                licenciantes y está protegido por leyes de propiedad intelectual.
              </p>
              <p>
                No está permitido copiar, modificar, distribuir o utilizar el contenido sin 
                autorización expresa.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">8. Limitación de Responsabilidad</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Mis Canchas actúa como intermediario y no es responsable de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La calidad de las instalaciones o servicios de los establecimientos.</li>
                <li>Disputas entre usuarios y establecimientos.</li>
                <li>Lesiones o daños ocurridos en las instalaciones deportivas.</li>
                <li>Pérdidas derivadas del uso o imposibilidad de uso de la Plataforma.</li>
              </ul>
              <p>
                La Plataforma se proporciona "tal cual" sin garantías de ningún tipo.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">9. Modificaciones</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Los cambios entrarán en vigor desde su publicación en la Plataforma. 
                El uso continuado de la Plataforma después de los cambios constituye tu aceptación 
                de los nuevos términos.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">10. Ley Aplicable y Jurisdicción</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Estos términos se rigen por las leyes de la República Argentina. 
                Cualquier disputa será sometida a los tribunales ordinarios de la Ciudad de 
                Resistencia, Chaco, Argentina.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">11. Contacto</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Para consultas sobre estos términos y condiciones:
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
            <Link href="/privacidad" className="text-emerald-400 hover:underline">
              Política de Privacidad
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
