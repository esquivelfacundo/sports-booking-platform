# 🏟️ MisCanchas - Roadmap de Desarrollo

> Sistema completo de gestión deportiva para establecimientos
> Última actualización: 12 de Diciembre 2024

---

## 📊 Resumen de Progreso

| Módulo | Progreso | Estado |
|--------|----------|--------|
| Perfil del Club | 80% | 🟢 Avanzado |
| Reservas | 70% | 🟢 Avanzado |
| Canchas | 90% | 🟢 Avanzado |
| Clientes | 75% | 🟢 Avanzado |
| Reporte de Stock | 0% | 🔴 Pendiente |
| Reporte de Caja | 0% | 🔴 Pendiente |
| Finanzas | 10% | 🔴 Básico |
| Marketing | 0% | 🔴 Pendiente |
| Torneos | 20% | 🟡 Básico |

---

## 🏢 MÓDULO 1: Perfil del Club / Configuración

### 1.1 Información Básica ✅
- [x] Nombre del establecimiento
- [x] Logo y fotos
- [x] Dirección y ubicación (Google Maps)
- [x] Teléfono de contacto
- [x] Email de contacto
- [x] Redes sociales (Instagram, Facebook, Twitter, Sitio Web)
- [x] Descripción detallada con editor rich text (toolbar con formato)
- [x] Galería de fotos con ordenamiento (subir, eliminar, reordenar)

### 1.2 Horarios de Operación ✅
- [x] Configuración de horario de apertura por día de la semana
- [x] Configuración de horario de cierre por día de la semana
- [x] Horarios especiales (fines de semana, feriados)
- [x] Días cerrados recurrentes (ej: todos los lunes) - checkbox por día
- [x] Calendario de días cerrados específicos (agregar/eliminar fechas)
- [x] Feriados nacionales automáticos (Argentina 2024-2025)
- [ ] Horarios de verano/invierno (pendiente)

### 1.3 Gestión de Usuarios del Staff ✅
- [x] Crear usuarios del establecimiento
- [x] Roles y permisos:
  - [x] Administrador (acceso total)
  - [x] Gerente (todo excepto configuración crítica)
  - [x] Recepcionista (reservas, cobros, clientes)
  - [x] Personal (solo ver agenda)
- [x] Panel de permisos por rol
- [ ] Historial de acciones por usuario (pendiente)
- [x] Desactivar/reactivar usuarios

### 1.4 Configuración de Señas/Depósitos ✅
- [x] Habilitar/deshabilitar sistema de señas (toggle)
- [x] Porcentaje de seña requerido (ej: 30%, 50%)
- [x] Monto fijo de seña (alternativa al porcentaje)
- [x] Tiempo límite para completar pago (horas)
- [x] Política de cancelación y reembolsos (4 opciones)
- [x] Penalidades por no-show (3 tipos de penalidad)
- [x] Vista previa y resumen de política

### 1.5 Configuración de Notificaciones
- [ ] Notificaciones por email
- [ ] Notificaciones por WhatsApp
- [ ] Recordatorio de reserva (tiempo antes)
- [ ] Confirmación automática de reserva
- [ ] Notificación de cancelación
- [ ] Resumen diario para admin

### 1.6 Personalización
- [ ] Colores de marca
- [ ] Dominio personalizado
- [ ] Términos y condiciones personalizados
- [ ] Política de privacidad

---

## 📅 MÓDULO 2: Reservas

### 2.1 Crear Reservas ✅
- [x] Selección de deporte
- [x] Selección de fecha (calendario)
- [x] Selección de hora disponible
- [x] Selección de cancha
- [x] Duración variable (60, 90, 120 min)
- [x] Datos del cliente (nombre, teléfono, email)
- [x] Búsqueda de cliente existente
- [x] Crear cliente nuevo desde reserva (opción en búsqueda)
- [x] Reservas recurrentes (semanal, quincenal, mensual)
- [ ] Reservas de torneo/liga (pendiente)
- [ ] Bloqueo de horarios (mantenimiento, eventos) (pendiente)

### 2.2 Gestión de Reservas ✅
- [x] Ver calendario de reservas
- [x] Vista por día/semana/mes
- [x] Filtrar por cancha
- [x] Filtrar por estado
- [x] Confirmar reserva pendiente
- [x] Cancelar reserva
- [x] Completar reserva (marcar como jugada)
- [x] Editar reserva existente (modal completo con API)
- [x] Mover reserva a otro horario (modal dedicado)
- [x] Mover reserva a otra cancha (selector en modal)
- [x] Duplicar reserva (copia a siguiente semana)
- [x] Notas internas en reserva (modal con guardado)

### 2.3 Sistema de Pagos
- [ ] Registrar pago en efectivo
- [ ] Registrar pago con tarjeta
- [ ] Registrar transferencia bancaria
- [ ] Registrar pago con MercadoPago
- [ ] Pagos parciales (señas)
- [ ] Historial de pagos por reserva
- [ ] Comprobante/recibo de pago
- [ ] Enviar comprobante por email/WhatsApp
- [ ] Reembolsos

### 2.4 Precios Dinámicos
- [ ] Precio por horario (hora pico vs normal)
- [ ] Precio por día de semana
- [ ] Descuentos por cliente frecuente
- [ ] Promociones temporales
- [ ] Paquetes de horas (ej: 10 horas por $X)
- [ ] Precio especial para socios/miembros

### 2.5 Lista de Espera
- [ ] Agregar cliente a lista de espera
- [ ] Notificar cuando hay disponibilidad
- [ ] Prioridad en lista de espera

---

## 🏟️ MÓDULO 3: Canchas

### 3.1 Gestión de Canchas
- [x] Crear cancha con wizard paso a paso
- [x] Nombre de la cancha
- [x] Tipo de deporte
- [x] Tipo de superficie
- [x] Precio por hora (60, 90, 120 min)
- [x] Características (iluminación, techada)
- [x] Horario de iluminación con precio extra
- [x] Fotos de la cancha
- [x] Descripción
- [ ] Dimensiones de la cancha
- [ ] Capacidad de jugadores
- [ ] Equipamiento incluido (arcos, red, etc.)
- [ ] Estado de la cancha (disponible, mantenimiento, fuera de servicio)

### 3.2 Disponibilidad
- [ ] Horarios específicos por cancha (diferente al establecimiento)
- [ ] Bloquear horarios específicos
- [ ] Disponibilidad por temporada
- [ ] Integración con calendario externo

### 3.3 Mantenimiento
- [ ] Programar mantenimiento
- [ ] Historial de mantenimientos
- [ ] Alertas de mantenimiento próximo
- [ ] Costos de mantenimiento
- [ ] Proveedores de mantenimiento

### 3.4 Estadísticas por Cancha ✅
- [x] Ocupación por cancha (porcentaje de tiempo disponible)
- [x] Ingresos por cancha (mensual y promedio diario)
- [x] Horarios más populares (gráfico de barras)
- [x] Clientes frecuentes por cancha (tabla con ranking)
- [x] Distribución por día de semana (gráfico)

---

## 👥 MÓDULO 4: Clientes

### 4.1 Base de Datos de Clientes ✅
- [x] Listado de clientes
- [x] Búsqueda de clientes (nombre, email, teléfono)
- [x] Crear cliente manualmente (modal completo)
- [x] Editar datos del cliente (modal de edición)
- [x] Importar clientes desde CSV (botón + parser)
- [x] Exportar clientes a CSV (descarga automática)
- [x] Eliminar cliente (con confirmación)
- [x] Activar/desactivar cliente (toggle de estado)

### 4.2 Perfil del Cliente ✅
- [x] Nombre completo
- [x] Teléfono
- [x] Email
- [x] Fecha de nacimiento
- [ ] DNI/Documento (pendiente)
- [x] Dirección
- [ ] Foto de perfil (pendiente)
- [x] Notas internas
- [x] Etiquetas/categorías (Básico, Premium, VIP)

### 4.3 Historial del Cliente ✅
- [x] Historial de reservas (lista con estado y precio)
- [x] Historial de pagos (método, fecha, monto)
- [x] Historial de cancelaciones (motivo y reembolso)
- [x] Estadísticas de frecuencia (reservas por mes)
- [x] Gasto total histórico (suma de pagos)
- [x] Deuda pendiente (indicador visual)

### 4.4 Fidelización
- [ ] Sistema de puntos
- [ ] Niveles de membresía (bronce, plata, oro)
- [ ] Descuentos automáticos por nivel
- [ ] Beneficios por antigüedad
- [ ] Referidos y recompensas

### 4.5 Comunicación
- [ ] Enviar mensaje individual
- [ ] Enviar mensaje masivo
- [ ] Plantillas de mensajes
- [ ] Historial de comunicaciones

---

## 📦 MÓDULO 5: Reporte de Stock / Inventario

### 5.1 Catálogo de Productos
- [ ] Crear categorías (bebidas, snacks, equipamiento, etc.)
- [ ] Agregar productos
  - [ ] Nombre del producto
  - [ ] Código/SKU
  - [ ] Categoría
  - [ ] Precio de compra
  - [ ] Precio de venta
  - [ ] Stock mínimo
  - [ ] Foto del producto
- [ ] Editar productos
- [ ] Desactivar productos
- [ ] Importar productos desde Excel

### 5.2 Gestión de Stock
- [ ] Ver stock actual
- [ ] Registrar entrada de stock (compra)
- [ ] Registrar salida de stock (venta, pérdida, vencimiento)
- [ ] Ajuste de inventario
- [ ] Historial de movimientos
- [ ] Alertas de stock bajo
- [ ] Alertas de productos por vencer

### 5.3 Compras
- [ ] Registrar compra a proveedor
- [ ] Gestión de proveedores
- [ ] Historial de compras
- [ ] Cuentas por pagar a proveedores

### 5.4 Ventas de Productos
- [ ] Punto de venta (POS) simple
- [ ] Venta asociada a reserva
- [ ] Venta independiente
- [ ] Historial de ventas
- [ ] Ticket/comprobante de venta

### 5.5 Reportes de Stock
- [ ] Reporte de inventario actual
- [ ] Reporte de movimientos
- [ ] Reporte de productos más vendidos
- [ ] Reporte de rentabilidad por producto
- [ ] Valorización del inventario

---

## 💰 MÓDULO 6: Reporte de Caja

### 6.1 Apertura y Cierre de Caja
- [ ] Apertura de caja con monto inicial
- [ ] Cierre de caja con arqueo
- [ ] Diferencias de caja (faltante/sobrante)
- [ ] Historial de cajas
- [ ] Caja por usuario/turno

### 6.2 Registro de Movimientos
- [ ] Ingresos
  - [ ] Cobro de reservas
  - [ ] Venta de productos
  - [ ] Cobro de señas
  - [ ] Otros ingresos
- [ ] Egresos
  - [ ] Pago a proveedores
  - [ ] Gastos operativos
  - [ ] Retiros de efectivo
  - [ ] Otros egresos
- [ ] Categorización de movimientos
- [ ] Comprobantes adjuntos

### 6.3 Métodos de Pago
- [ ] Efectivo
- [ ] Tarjeta de débito
- [ ] Tarjeta de crédito
- [ ] Transferencia bancaria
- [ ] MercadoPago
- [ ] Cuenta corriente (fiado)
- [ ] Otros métodos personalizados

### 6.4 Reportes de Caja
- [ ] Resumen diario
- [ ] Resumen semanal
- [ ] Resumen mensual
- [ ] Comparativo entre períodos
- [ ] Desglose por método de pago
- [ ] Desglose por categoría
- [ ] Exportar a Excel/PDF

### 6.5 Cuentas por Cobrar
- [ ] Clientes con deuda
- [ ] Antigüedad de deuda
- [ ] Recordatorios de pago
- [ ] Historial de pagos parciales

---

## 📈 MÓDULO 7: Finanzas y Analytics

### 7.1 Dashboard Financiero
- [ ] Ingresos del día/semana/mes
- [ ] Gastos del día/semana/mes
- [ ] Ganancia neta
- [ ] Comparativo con período anterior
- [ ] Gráficos de tendencia

### 7.2 Reportes Financieros
- [ ] Estado de resultados
- [ ] Flujo de caja
- [ ] Balance de ingresos vs egresos
- [ ] Proyecciones

### 7.3 Analytics de Negocio
- [ ] Ocupación por horario
- [ ] Ocupación por día de semana
- [ ] Canchas más rentables
- [ ] Clientes más frecuentes
- [ ] Tasa de cancelación
- [ ] Ticket promedio
- [ ] Lifetime value del cliente

### 7.4 Exportación
- [ ] Exportar datos para contador
- [ ] Integración con sistemas contables
- [ ] Facturación electrónica (AFIP)

---

## 📣 MÓDULO 8: Marketing

### 8.1 Promociones
- [ ] Crear promociones temporales
- [ ] Descuentos por horario
- [ ] Descuentos por cantidad
- [ ] Códigos de descuento
- [ ] Promociones para nuevos clientes
- [ ] Happy hour

### 8.2 Comunicación Masiva
- [ ] Campañas de email
- [ ] Campañas de WhatsApp
- [ ] Segmentación de clientes
- [ ] Plantillas de campañas
- [ ] Métricas de campañas

### 8.3 Redes Sociales
- [ ] Publicar disponibilidad en redes
- [ ] Integración con Instagram
- [ ] Integración con Facebook

### 8.4 Programa de Referidos
- [ ] Código de referido por cliente
- [ ] Recompensa por referido
- [ ] Tracking de referidos

---

## 🏆 MÓDULO 9: Torneos y Ligas

### 9.1 Gestión de Torneos
- [x] Crear torneo
- [x] Configuración básica (nombre, deporte, fechas)
- [ ] Formato de torneo (eliminación, liga, grupos)
- [ ] Inscripción de equipos
- [ ] Fixture automático
- [ ] Gestión de partidos
- [ ] Resultados y estadísticas
- [ ] Tabla de posiciones
- [ ] Goleadores/estadísticas individuales

### 9.2 Ligas
- [ ] Crear liga permanente
- [ ] Temporadas
- [ ] Ascensos/descensos
- [ ] Historial de temporadas

### 9.3 Inscripciones
- [ ] Formulario de inscripción online
- [ ] Pago de inscripción
- [ ] Lista de espera
- [ ] Confirmación de equipos

---

## 🔧 MÓDULO 10: Configuración Técnica

### 10.1 Integraciones
- [ ] MercadoPago (pagos online)
- [ ] WhatsApp Business API
- [ ] Google Calendar
- [ ] Google Analytics
- [ ] Facebook Pixel

### 10.2 API y Webhooks
- [ ] API pública documentada
- [ ] Webhooks para eventos
- [ ] Integración con sistemas externos

### 10.3 Seguridad
- [ ] Autenticación de dos factores
- [ ] Logs de auditoría
- [ ] Backups automáticos
- [ ] Encriptación de datos sensibles

---

## 📱 MÓDULO 11: App Móvil (Futuro)

### 11.1 App para Clientes
- [ ] Buscar establecimientos
- [ ] Ver disponibilidad
- [ ] Hacer reservas
- [ ] Pagar online
- [ ] Historial de reservas
- [ ] Notificaciones push

### 11.2 App para Establecimientos
- [ ] Ver agenda del día
- [ ] Confirmar reservas
- [ ] Registrar pagos
- [ ] Notificaciones de nuevas reservas

---

## 🚀 Prioridades de Desarrollo

### Sprint 1 (Semana 1-2): Fundamentos
1. [ ] Completar configuración de horarios del establecimiento
2. [ ] Sistema de pagos básico en reservas
3. [ ] Gestión de clientes mejorada

### Sprint 2 (Semana 3-4): Caja
1. [ ] Apertura/cierre de caja
2. [ ] Registro de movimientos
3. [ ] Reportes básicos de caja

### Sprint 3 (Semana 5-6): Stock
1. [ ] Catálogo de productos
2. [ ] Gestión de inventario
3. [ ] Ventas de productos

### Sprint 4 (Semana 7-8): Analytics
1. [ ] Dashboard financiero
2. [ ] Reportes de ocupación
3. [ ] Exportación de datos

---

## 📝 Notas y Decisiones

### Tecnologías
- **Frontend**: Next.js 14, React, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, Prisma
- **Base de datos**: PostgreSQL
- **Hosting**: Vercel (frontend), Railway (backend)
- **Pagos**: MercadoPago (futuro)

### Convenciones
- Idioma de la UI: Español
- Moneda por defecto: ARS (Peso Argentino)
- Zona horaria: America/Argentina/Buenos_Aires

---

## 📞 Contacto y Soporte

- **Repositorio Frontend**: sports-booking-platform
- **Repositorio Backend**: sports-booking-backend
- **Documentación API**: /api/docs (pendiente)

---

> Este documento se actualiza conforme avanza el desarrollo.
> Marcar con [x] las tareas completadas.
