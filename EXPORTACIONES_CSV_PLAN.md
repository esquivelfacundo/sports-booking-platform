# 📊 Plan de Acción - Sistema de Exportación a CSV

## Estado General
- **Fecha de inicio**: 26 de Enero, 2026
- **Estado**: En Desarrollo - Fase 1
- **Progreso**: 1/52 reportes implementados (1.9%)

---

## 🏟️ 1. RESERVAS (Bookings)

### 1.1 Reporte General de Reservas ✅
- [x] Backend: Endpoint `/api/bookings/export`
- [x] Frontend: Botón de exportación en página de reservas
- [x] Campos: Fecha, Hora inicio, Hora fin, Cancha, Cliente, Teléfono, Email, Estado, Tipo de pago, Monto total, Seña, Saldo pendiente, Método de pago, Notas
- [x] Filtros: Rango de fechas, cancha, estado, cliente, método de pago
- **Completado**: 26/01/2026

### 1.2 Reservas Recurrentes
- [ ] Backend: Endpoint `/api/recurring-bookings/export`
- [ ] Frontend: Botón de exportación en página de reservas recurrentes
- [ ] Campos: Grupo, Frecuencia, Día de la semana, Hora, Cancha, Cliente, Fecha inicio, Fecha fin, Total reservas, Reservas completadas, Estado
- [ ] Filtros: Rango de fechas, cancha, cliente, estado

### 1.3 Reservas No-Show
- [ ] Backend: Endpoint `/api/bookings/no-show/export`
- [ ] Frontend: Botón de exportación en sección de no-shows
- [ ] Campos: Fecha, Hora, Cancha, Cliente, Teléfono, Monto perdido, Seña perdida, Motivo
- [ ] Filtros: Rango de fechas, cancha

---

## 💰 2. FINANZAS

### 2.1 Resumen Financiero General
- [ ] Backend: Endpoint `/api/finance/summary/export`
- [ ] Frontend: Botón de exportación en página de finanzas
- [ ] Campos: Fecha, Ingresos totales, Depósitos, Saldo pendiente, Cantidad de reservas, Ticket promedio
- [ ] Filtros: Período (día/semana/mes/trimestre/año)

### 2.2 Ingresos por Método de Pago
- [ ] Backend: Endpoint `/api/finance/by-payment-method/export`
- [ ] Frontend: Botón de exportación en sección de métodos de pago
- [ ] Campos: Método de pago, Cantidad de transacciones, Monto total, Porcentaje del total
- [ ] Filtros: Rango de fechas

### 2.3 Ingresos por Cancha
- [ ] Backend: Endpoint `/api/finance/by-court/export`
- [ ] Frontend: Botón de exportación en sección de canchas
- [ ] Campos: Cancha, Cantidad de reservas, Ingresos totales, Ticket promedio, Porcentaje del total
- [ ] Filtros: Rango de fechas

### 2.4 Pagos Pendientes
- [ ] Backend: Endpoint `/api/finance/pending-payments/export`
- [ ] Frontend: Botón de exportación en sección de pagos pendientes
- [ ] Campos: Cliente, Teléfono, Fecha reserva, Cancha, Monto total, Pagado, Pendiente, Días de atraso
- [ ] Filtros: Rango de fechas, cliente

---

## 💵 3. CAJA (Cash Registers)

### 3.1 Resumen de Turnos de Caja
- [ ] Backend: Endpoint `/api/cash-registers/export`
- [ ] Frontend: Botón de exportación en página de cajas
- [ ] Campos: Fecha apertura, Fecha cierre, Usuario, Monto inicial, Efectivo esperado, Efectivo real, Tarjeta, Transferencia, Total ventas, Total gastos, Diferencia, Estado
- [ ] Filtros: Rango de fechas, usuario, estado

### 3.2 Movimientos de Caja Detallados
- [ ] Backend: Endpoint `/api/cash-register-movements/export`
- [ ] Frontend: Botón de exportación en detalle de caja
- [ ] Campos: Fecha/Hora, Turno, Tipo movimiento, Descripción, Método de pago, Monto, Usuario, Orden/Reserva asociada
- [ ] Filtros: Rango de fechas, turno, tipo de movimiento, método de pago

### 3.3 Cierre de Caja Diario
- [ ] Backend: Endpoint `/api/cash-registers/daily-close/export`
- [ ] Frontend: Botón de exportación en resumen diario
- [ ] Campos: Fecha, Total efectivo, Total tarjeta, Total transferencia, Total ventas, Total gastos, Diferencias, Observaciones
- [ ] Filtros: Rango de fechas

---

## 💸 4. GASTOS (Expenses)

### 4.1 Reporte de Gastos
- [ ] Backend: Endpoint `/api/expenses/export`
- [ ] Frontend: Botón de exportación en página de gastos
- [ ] Campos: Fecha, Categoría, Descripción, Proveedor, Monto, Método de pago, Factura, Origen (Caja/Administración), Usuario, Notas
- [ ] Filtros: Rango de fechas, categoría, proveedor, origen, usuario

### 4.2 Gastos por Categoría
- [ ] Backend: Endpoint `/api/expenses/by-category/export`
- [ ] Frontend: Botón de exportación en sección de categorías
- [ ] Campos: Categoría, Cantidad de gastos, Monto total, Porcentaje del total, Promedio por gasto
- [ ] Filtros: Rango de fechas

### 4.3 Gastos por Proveedor
- [ ] Backend: Endpoint `/api/expenses/by-supplier/export`
- [ ] Frontend: Botón de exportación en sección de proveedores
- [ ] Campos: Proveedor, Cantidad de gastos, Monto total, Última compra, Categorías principales
- [ ] Filtros: Rango de fechas

---

## 🛒 5. VENTAS DIRECTAS (Orders)

### 5.1 Reporte de Ventas
- [ ] Backend: Endpoint `/api/orders/export`
- [ ] Frontend: Botón de exportación en página de ventas
- [ ] Campos: Fecha/Hora, Número de orden, Tipo (Venta directa/Consumo), Cliente, Productos, Cantidad, Subtotal, Descuento, Total, Método de pago, Estado de pago, Usuario
- [ ] Filtros: Rango de fechas, tipo, cliente, estado de pago, método de pago

### 5.2 Ventas por Producto
- [ ] Backend: Endpoint `/api/orders/by-product/export`
- [ ] Frontend: Botón de exportación en sección de productos
- [ ] Campos: Producto, Categoría, Cantidad vendida, Ingresos totales, Precio promedio, Última venta
- [ ] Filtros: Rango de fechas, categoría

### 5.3 Ventas por Método de Pago
- [ ] Backend: Endpoint `/api/orders/by-payment-method/export`
- [ ] Frontend: Botón de exportación en sección de métodos de pago
- [ ] Campos: Método de pago, Cantidad de ventas, Monto total, Porcentaje del total
- [ ] Filtros: Rango de fechas

---

## 📦 6. STOCK E INVENTARIO

### 6.1 Inventario Actual
- [ ] Backend: Endpoint `/api/products/inventory/export`
- [ ] Frontend: Botón de exportación en página de stock
- [ ] Campos: Producto, Categoría, SKU, Stock actual, Stock mínimo, Stock máximo, Costo unitario, Valor total, Estado (Normal/Bajo/Crítico)
- [ ] Filtros: Categoría, estado de stock

### 6.2 Movimientos de Stock
- [ ] Backend: Endpoint `/api/stock-movements/export`
- [ ] Frontend: Botón de exportación en movimientos de stock
- [ ] Campos: Fecha/Hora, Producto, Tipo movimiento (Entrada/Salida/Ajuste/Venta/Merma), Cantidad, Costo unitario, Costo total, Usuario, Notas
- [ ] Filtros: Rango de fechas, producto, tipo de movimiento

### 6.3 Compras a Proveedores
- [ ] Backend: Endpoint `/api/stock-movements/purchases/export`
- [ ] Frontend: Botón de exportación en tab de compras
- [ ] Campos: Fecha, Proveedor, Producto, Cantidad, Costo unitario, Costo total, Usuario, Notas
- [ ] Filtros: Rango de fechas, proveedor, producto

### 6.4 Productos con Stock Bajo
- [ ] Backend: Endpoint `/api/products/low-stock/export`
- [ ] Frontend: Botón de exportación en alertas de stock
- [ ] Campos: Producto, Categoría, Stock actual, Stock mínimo, Diferencia, Última entrada, Proveedor habitual
- [ ] Filtros: Ninguno (siempre muestra productos bajo stock)

### 6.5 Historial de Mermas
- [ ] Backend: Endpoint `/api/stock-movements/waste/export`
- [ ] Frontend: Botón de exportación en sección de mermas
- [ ] Campos: Fecha, Producto, Cantidad, Costo, Motivo, Usuario
- [ ] Filtros: Rango de fechas, producto

---

## 👥 7. CLIENTES

### 7.1 Base de Datos de Clientes
- [ ] Backend: Endpoint `/api/clients/export`
- [ ] Frontend: Botón de exportación en página de clientes
- [ ] Campos: Nombre, Teléfono, Email, Total reservas, Total gastado, Última reserva, Fecha registro, Estado cuenta corriente
- [ ] Filtros: Estado de cuenta, actividad reciente

### 7.2 Clientes Frecuentes (Top Clientes)
- [ ] Backend: Endpoint `/api/clients/top/export`
- [ ] Frontend: Botón de exportación en sección de top clientes
- [ ] Campos: Nombre, Teléfono, Cantidad de reservas, Total gastado, Ticket promedio, Última visita, Frecuencia
- [ ] Filtros: Rango de fechas, cantidad mínima de reservas

### 7.3 Clientes Inactivos
- [ ] Backend: Endpoint `/api/clients/inactive/export`
- [ ] Frontend: Botón de exportación en sección de inactivos
- [ ] Campos: Nombre, Teléfono, Email, Última reserva, Días sin actividad, Total histórico de reservas
- [ ] Filtros: Días de inactividad mínimos

---

## 💳 8. CUENTAS CORRIENTES

### 8.1 Estado de Cuentas Corrientes
- [ ] Backend: Endpoint `/api/current-accounts/export`
- [ ] Frontend: Botón de exportación en página de cuentas corrientes
- [ ] Campos: Cliente, Teléfono, Saldo actual, Límite de crédito, Disponible, Última transacción, Estado
- [ ] Filtros: Estado (activa/suspendida), saldo (positivo/negativo)

### 8.2 Movimientos de Cuenta Corriente
- [ ] Backend: Endpoint `/api/current-accounts/movements/export`
- [ ] Frontend: Botón de exportación en detalle de cuenta
- [ ] Campos: Fecha, Cliente, Tipo (Cargo/Pago), Descripción, Monto, Saldo anterior, Saldo nuevo, Usuario
- [ ] Filtros: Rango de fechas, cliente, tipo de movimiento

### 8.3 Deudas Pendientes
- [ ] Backend: Endpoint `/api/current-accounts/debts/export`
- [ ] Frontend: Botón de exportación en sección de deudas
- [ ] Campos: Cliente, Teléfono, Saldo deudor, Días de deuda, Última transacción, Límite de crédito
- [ ] Filtros: Monto mínimo de deuda, días de atraso

---

## 📊 9. REPORTES ANALÍTICOS

### 9.1 Ocupación de Canchas
- [ ] Backend: Endpoint `/api/analytics/court-occupancy/export`
- [ ] Frontend: Botón de exportación en analytics
- [ ] Campos: Cancha, Total horas disponibles, Horas reservadas, Horas ocupadas, Porcentaje ocupación, Ingresos generados
- [ ] Filtros: Rango de fechas

### 9.2 Horarios Pico
- [ ] Backend: Endpoint `/api/analytics/peak-hours/export`
- [ ] Frontend: Botón de exportación en analytics
- [ ] Campos: Hora, Día de semana, Cantidad de reservas, Ingresos promedio, Ocupación promedio
- [ ] Filtros: Rango de fechas, día de semana

### 9.3 Rendimiento por Día de la Semana
- [ ] Backend: Endpoint `/api/analytics/by-weekday/export`
- [ ] Frontend: Botón de exportación en analytics
- [ ] Campos: Día, Cantidad de reservas, Ingresos totales, Ticket promedio, Ocupación promedio
- [ ] Filtros: Rango de fechas

---

## 🎟️ 10. CUPONES Y PROMOCIONES

### 10.1 Uso de Cupones
- [ ] Backend: Endpoint `/api/coupons/export`
- [ ] Frontend: Botón de exportación en página de cupones
- [ ] Campos: Código cupón, Descripción, Tipo descuento, Valor, Cantidad de usos, Total descontado, Fecha inicio, Fecha fin, Estado
- [ ] Filtros: Rango de fechas, estado

### 10.2 Detalle de Usos por Cupón
- [ ] Backend: Endpoint `/api/coupons/usage/export`
- [ ] Frontend: Botón de exportación en detalle de cupón
- [ ] Campos: Fecha, Cupón, Cliente, Reserva/Orden, Descuento aplicado, Total final
- [ ] Filtros: Rango de fechas, cupón

---

## 👨‍💼 11. USUARIOS Y STAFF

### 11.1 Actividad de Usuarios
- [ ] Backend: Endpoint `/api/users/activity/export`
- [ ] Frontend: Botón de exportación en página de usuarios
- [ ] Campos: Usuario, Rol, Cantidad de reservas creadas, Ventas realizadas, Gastos registrados, Última actividad
- [ ] Filtros: Rango de fechas, rol

### 11.2 Rendimiento de Cajeros
- [ ] Backend: Endpoint `/api/staff/cashier-performance/export`
- [ ] Frontend: Botón de exportación en sección de staff
- [ ] Campos: Cajero, Turnos trabajados, Total ventas, Total gastos, Diferencias en caja, Promedio por turno
- [ ] Filtros: Rango de fechas

---

## 📋 12. REPORTES CONSOLIDADOS

### 12.1 Reporte Diario Completo
- [ ] Backend: Endpoint `/api/reports/daily/export`
- [ ] Frontend: Botón de exportación en dashboard
- [ ] Campos: Resumen de reservas, ventas, gastos, caja, movimientos de stock del día
- [ ] Filtros: Fecha específica

### 12.2 Reporte Mensual Ejecutivo
- [ ] Backend: Endpoint `/api/reports/monthly/export`
- [ ] Frontend: Botón de exportación en dashboard
- [ ] Campos: Resumen financiero, top productos, top clientes, ocupación, gastos por categoría
- [ ] Filtros: Mes y año

---

## 🎯 FASES DE IMPLEMENTACIÓN

### ✅ Fase 1 - Esenciales (Prioridad Alta) - 1/5 completado (20%)
- [x] 1.1 Reporte General de Reservas ✅
- [ ] 3.1 Resumen de Turnos de Caja
- [ ] 4.1 Reporte de Gastos
- [ ] 5.1 Reporte de Ventas
- [ ] 6.1 Inventario Actual

### 📝 Fase 2 - Importantes (Prioridad Media)
- [ ] 2.2 Ingresos por Método de Pago
- [ ] 3.2 Movimientos de Caja Detallados
- [ ] 5.2 Ventas por Producto
- [ ] 7.1 Base de Datos de Clientes
- [ ] 8.1 Estado de Cuentas Corrientes

### 📊 Fase 3 - Analíticos (Prioridad Media-Baja)
- [ ] 9.1 Ocupación de Canchas
- [ ] 7.2 Clientes Frecuentes
- [ ] 4.2 Gastos por Categoría
- [ ] 6.3 Compras a Proveedores
- [ ] 9.2 Horarios Pico

### 🚀 Fase 4 - Avanzados (Prioridad Baja)
- [ ] Resto de reportes analíticos y consolidados

---

## 🛠️ COMPONENTES TÉCNICOS A DESARROLLAR

### Backend
- [ ] Utilidad de generación de CSV (`src/utils/csvGenerator.js`)
- [ ] Middleware de validación de exportaciones
- [ ] Sistema de caché para reportes grandes
- [ ] Rate limiting para exportaciones

### Frontend
- [ ] Componente reutilizable `ExportButton`
- [ ] Modal de configuración de exportación
- [ ] Indicador de progreso para exportaciones grandes
- [ ] Sistema de descarga automática de archivos

---

## 📝 NOTAS Y CONSIDERACIONES

### Formato de CSV
- Encoding: UTF-8 con BOM para compatibilidad con Excel
- Separador: Coma (,)
- Delimitador de texto: Comillas dobles (")
- Formato de fechas: DD/MM/YYYY
- Formato de números: Punto decimal, sin separador de miles en CSV

### Seguridad
- Validar permisos de usuario antes de exportar
- Limitar tamaño de exportaciones (máximo 10,000 registros por archivo)
- Logging de todas las exportaciones realizadas
- Rate limiting: máximo 10 exportaciones por usuario por hora

### Performance
- Implementar paginación para datasets grandes
- Usar streaming para archivos grandes
- Caché de reportes frecuentes (15 minutos)
- Procesamiento asíncrono para reportes complejos

### UX
- Mostrar preview de datos antes de exportar
- Permitir selección de columnas a exportar
- Guardar configuraciones de exportación favoritas
- Notificación cuando la exportación esté lista

---

## 📊 MÉTRICAS DE PROGRESO

- **Total de reportes**: 52
- **Reportes completados**: 1
- **Porcentaje completado**: 1.9%
- **Fase actual**: Fase 1 - En Desarrollo
- **Próximo hito**: Fase 1 - Reporte 3.1 (Resumen de Turnos de Caja)

---

## 🔄 HISTORIAL DE CAMBIOS

### 26/01/2026 - 23:15
- ✅ **Completado Reporte 1.1 - Reporte General de Reservas**
  - Backend: Utilidad CSV generator creada
  - Backend: Endpoint `/api/bookings/export` implementado
  - Frontend: Componente ExportButton reutilizable creado
  - Frontend: Botón de exportación agregado en página de reservas
  - Commits: `8d2531c` (backend), `7aaad1bc` (frontend)

### 26/01/2026 - 22:00
- ✅ Documento de plan creado
- ✅ Definición de 52 reportes exportables
- ✅ Priorización en 4 fases
- ✅ Definición de componentes técnicos
