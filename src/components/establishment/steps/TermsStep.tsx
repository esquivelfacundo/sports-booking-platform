'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, AlertTriangle, Check, Eye, Download } from 'lucide-react';
import { EstablishmentRegistration } from '@/types/establishment';

interface TermsStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const TermsStep: React.FC<TermsStepProps> = ({
  data,
  onUpdate,
  onValidation
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const termsAcceptance = data.termsAcceptance || {
    accepted: false,
    acceptedAt: undefined,
    ipAddress: undefined,
    version: '1.0'
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    onValidation(termsAcceptance.accepted && hasReadTerms);
  }, [termsAcceptance.accepted, hasReadTerms]);

  const handleAcceptanceChange = (accepted: boolean) => {
    const updatedTerms = {
      ...termsAcceptance,
      accepted,
      acceptedAt: accepted ? new Date() : undefined,
      ipAddress: accepted ? 'CLIENT_IP' : undefined // This would be filled by backend
    };

    onUpdate({
      ...data,
      termsAcceptance: updatedTerms
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    if (isAtBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
      setHasReadTerms(true);
    }
  };

  if (!isMounted) {
    return <div className="animate-pulse bg-gray-700 h-96 rounded-lg"></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FileText className="w-8 h-8 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Términos y Condiciones</h2>
        </div>
        <p className="text-gray-400">
          Lee y acepta los términos y condiciones para completar el registro
        </p>
      </div>

      {/* Terms Content */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Contrato de Prestación de Servicios - Plataforma de Reservas Deportivas
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Versión 1.0</span>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div 
          className="h-96 overflow-y-auto p-6 text-sm text-gray-300 leading-relaxed space-y-4"
          onScroll={handleScroll}
        >
          <section>
            <h4 className="text-white font-semibold mb-2">1. OBJETO DEL CONTRATO</h4>
            <p>
              El presente contrato tiene por objeto regular la prestación de servicios de la plataforma digital 
              de reservas deportivas (en adelante "la Plataforma"), que permite a establecimientos deportivos 
              (en adelante "el Establecimiento") ofrecer sus servicios de alquiler de canchas y espacios deportivos 
              a usuarios finales (en adelante "los Usuarios").
            </p>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">2. OBLIGACIONES DEL ESTABLECIMIENTO</h4>
            <div className="space-y-2">
              <p><strong>2.1 Información Veraz:</strong> El Establecimiento se compromete a proporcionar información 
              veraz, actualizada y completa sobre sus instalaciones, servicios, horarios y tarifas.</p>
              
              <p><strong>2.2 Disponibilidad:</strong> Mantener actualizada la disponibilidad de sus canchas y 
              espacios deportivos en tiempo real a través de la Plataforma.</p>
              
              <p><strong>2.3 Calidad del Servicio:</strong> Brindar servicios de calidad conforme a los estándares 
              publicitados y mantener las instalaciones en condiciones óptimas de seguridad e higiene.</p>
              
              <p><strong>2.4 Atención al Cliente:</strong> Proporcionar atención adecuada a los Usuarios, 
              respetando los horarios de reserva confirmados.</p>
              
              <p><strong>2.5 Cumplimiento Legal:</strong> Cumplir con todas las normativas locales, provinciales 
              y nacionales aplicables a su actividad comercial.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">3. OBLIGACIONES DE LA PLATAFORMA</h4>
            <div className="space-y-2">
              <p><strong>3.1 Disponibilidad del Servicio:</strong> Mantener la Plataforma operativa las 24 horas, 
              salvo por mantenimientos programados que serán notificados con anticipación.</p>
              
              <p><strong>3.2 Procesamiento de Pagos:</strong> Facilitar el procesamiento seguro de pagos entre 
              Usuarios y Establecimientos a través de medios de pago autorizados.</p>
              
              <p><strong>3.3 Soporte Técnico:</strong> Brindar soporte técnico para el uso de la Plataforma 
              durante horarios comerciales.</p>
              
              <p><strong>3.4 Protección de Datos:</strong> Proteger la información personal conforme a la 
              Ley de Protección de Datos Personales N° 25.326 y normativas aplicables.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">4. COMISIONES Y FACTURACIÓN</h4>
            <div className="space-y-2">
              <p><strong>4.1 Comisión por Transacción:</strong> La Plataforma cobrará una comisión del 8% 
              sobre el valor de cada reserva confirmada y efectivamente utilizada.</p>
              
              <p><strong>4.2 Liquidación:</strong> Las liquidaciones se realizarán semanalmente, descontando 
              las comisiones correspondientes y los impuestos aplicables.</p>
              
              <p><strong>4.3 Facturación:</strong> El Establecimiento deberá emitir la facturación correspondiente 
              a los Usuarios conforme a la legislación fiscal vigente.</p>
              
              <p><strong>4.4 Impuestos:</strong> Cada parte será responsable del pago de los impuestos que 
              le correspondan según la legislación aplicable.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">5. CANCELACIONES Y REEMBOLSOS</h4>
            <div className="space-y-2">
              <p><strong>5.1 Política de Cancelación:</strong> Las cancelaciones realizadas con más de 24 horas 
              de anticipación tendrán reembolso completo. Cancelaciones con menos de 24 horas tendrán una 
              penalidad del 50%.</p>
              
              <p><strong>5.2 Cancelación por Fuerza Mayor:</strong> En casos de fuerza mayor (condiciones 
              climáticas adversas, emergencias sanitarias, etc.), se aplicará reembolso completo.</p>
              
              <p><strong>5.3 Responsabilidad del Establecimiento:</strong> Si el Establecimiento cancela 
              una reserva confirmada, deberá reembolsar el 100% y asumir una penalidad equivalente al 20% 
              del valor de la reserva.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">6. RESPONSABILIDADES Y LIMITACIONES</h4>
            <div className="space-y-2">
              <p><strong>6.1 Responsabilidad del Establecimiento:</strong> El Establecimiento es único responsable 
              por la seguridad de las instalaciones, lesiones que puedan ocurrir en sus predios, y el cumplimiento 
              de todas las normativas de seguridad e higiene.</p>
              
              <p><strong>6.2 Seguro:</strong> El Establecimiento deberá mantener vigente un seguro de responsabilidad 
              civil que cubra daños a terceros por un monto mínimo de $5.000.000.</p>
              
              <p><strong>6.3 Limitación de Responsabilidad de la Plataforma:</strong> La Plataforma actúa como 
              intermediario y no será responsable por daños, lesiones o perjuicios que ocurran en las instalaciones 
              del Establecimiento.</p>
              
              <p><strong>6.4 Fuerza Mayor:</strong> Ninguna de las partes será responsable por incumplimientos 
              debidos a causas de fuerza mayor o caso fortuito.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">7. PROTECCIÓN DE DATOS Y PRIVACIDAD</h4>
            <div className="space-y-2">
              <p><strong>7.1 Tratamiento de Datos:</strong> Ambas partes se comprometen a tratar los datos 
              personales conforme a la Ley 25.326 de Protección de Datos Personales y normativas complementarias.</p>
              
              <p><strong>7.2 Confidencialidad:</strong> La información comercial y de usuarios será tratada 
              con estricta confidencialidad y no podrá ser utilizada para fines distintos a los del presente contrato.</p>
              
              <p><strong>7.3 Seguridad:</strong> Se implementarán medidas técnicas y organizativas apropiadas 
              para proteger los datos contra acceso no autorizado, alteración, divulgación o destrucción.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">8. PROPIEDAD INTELECTUAL</h4>
            <div className="space-y-2">
              <p><strong>8.1 Derechos de la Plataforma:</strong> Todos los derechos de propiedad intelectual 
              sobre la Plataforma, incluyendo software, diseño, marcas y contenidos, pertenecen a la empresa 
              operadora de la Plataforma.</p>
              
              <p><strong>8.2 Contenido del Establecimiento:</strong> El Establecimiento otorga licencia no exclusiva 
              para el uso de sus imágenes, descripciones y contenidos en la Plataforma.</p>
              
              <p><strong>8.3 Uso Permitido:</strong> El Establecimiento podrá utilizar la Plataforma únicamente 
              para los fines establecidos en este contrato.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">9. VIGENCIA Y RESCISIÓN</h4>
            <div className="space-y-2">
              <p><strong>9.1 Vigencia:</strong> El presente contrato tendrá vigencia indefinida desde su aceptación.</p>
              
              <p><strong>9.2 Rescisión:</strong> Cualquiera de las partes podrá rescindir el contrato con 
              un preaviso de 30 días calendario.</p>
              
              <p><strong>9.3 Rescisión por Incumplimiento:</strong> En caso de incumplimiento grave, 
              la parte afectada podrá rescindir el contrato de forma inmediata.</p>
              
              <p><strong>9.4 Efectos de la Rescisión:</strong> Las obligaciones pendientes al momento de 
              la rescisión deberán ser cumplidas conforme a los términos originales.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">10. RESOLUCIÓN DE CONFLICTOS</h4>
            <div className="space-y-2">
              <p><strong>10.1 Mediación:</strong> Las partes se comprometen a intentar resolver cualquier 
              controversia mediante mediación antes de recurrir a instancias judiciales.</p>
              
              <p><strong>10.2 Jurisdicción:</strong> Para todos los efectos legales, las partes se someten 
              a la jurisdicción de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires.</p>
              
              <p><strong>10.3 Ley Aplicable:</strong> El presente contrato se rige por las leyes de la 
              República Argentina.</p>
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-2">11. DISPOSICIONES GENERALES</h4>
            <div className="space-y-2">
              <p><strong>11.1 Modificaciones:</strong> Las modificaciones al presente contrato deberán 
              ser notificadas con 15 días de anticipación y aceptadas expresamente.</p>
              
              <p><strong>11.2 Nulidad Parcial:</strong> La nulidad de alguna cláusula no afectará la 
              validez del resto del contrato.</p>
              
              <p><strong>11.3 Notificaciones:</strong> Todas las notificaciones se realizarán a través 
              de los medios de contacto registrados en la Plataforma.</p>
              
              <p><strong>11.4 Integridad:</strong> Este contrato constituye el acuerdo completo entre 
              las partes y reemplaza cualquier acuerdo anterior.</p>
            </div>
          </section>

          <section className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <h4 className="text-yellow-300 font-semibold mb-2 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              IMPORTANTE - DECLARACIÓN DE CONFORMIDAD
            </h4>
            <p className="text-yellow-200">
              Al aceptar estos términos y condiciones, el representante legal del establecimiento 
              declara bajo juramento que:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-yellow-200">
              <li>Tiene capacidad legal para contratar en nombre del establecimiento</li>
              <li>La información proporcionada es veraz y completa</li>
              <li>El establecimiento cumple con todas las habilitaciones municipales requeridas</li>
              <li>Cuenta con los seguros de responsabilidad civil correspondientes</li>
              <li>Se compromete a cumplir con todas las obligaciones establecidas</li>
            </ul>
          </section>

          <div className="text-center py-4 text-gray-500">
            <p>--- Fin del Documento ---</p>
            <p className="text-xs mt-2">
              Documento generado el {new Date().toLocaleDateString('es-AR')} - 
              Plataforma de Reservas Deportivas
            </p>
          </div>
        </div>
      </div>

      {/* Reading Progress */}
      {!hasReadTerms && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-blue-300 font-medium">
                Debes leer completamente los términos y condiciones
              </p>
              <p className="text-blue-200 text-sm">
                Desplázate hasta el final del documento para continuar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Acceptance Checkbox */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-6 bg-gray-800 border border-gray-700 rounded-xl">
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              id="terms-acceptance"
              checked={termsAcceptance.accepted}
              onChange={(e) => handleAcceptanceChange(e.target.checked)}
              disabled={!hasReadTerms}
              className="w-5 h-5 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <label 
            htmlFor="terms-acceptance" 
            className={`text-sm leading-relaxed ${
              hasReadTerms ? 'text-white cursor-pointer' : 'text-gray-500 cursor-not-allowed'
            }`}
          >
            <strong>Acepto los términos y condiciones</strong> del contrato de prestación de servicios. 
            Declaro que he leído, entendido y acepto todas las cláusulas establecidas. 
            Confirmo que tengo autoridad legal para comprometer al establecimiento en este acuerdo 
            y que toda la información proporcionada es veraz y completa.
          </label>
        </div>

        {termsAcceptance.accepted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <Check className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-emerald-300 font-medium">
                  Términos y condiciones aceptados
                </p>
                <p className="text-emerald-200 text-sm">
                  Fecha de aceptación: {new Date().toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legal Notice */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-gray-300 font-semibold mb-2">Aviso Legal</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Este contrato constituye un acuerdo legalmente vinculante. Al aceptar estos términos, 
              el establecimiento se compromete a cumplir con todas las obligaciones establecidas. 
              Se recomienda consultar con un asesor legal antes de la aceptación si existen dudas 
              sobre alguna cláusula. La plataforma se reserva el derecho de suspender o cancelar 
              cuentas que no cumplan con los términos establecidos.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsStep;
