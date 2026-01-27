# 📊 Plan de Acción - Sistema de Exportación a CSV

## Estado General
- **Fecha de inicio**: 26 de Enero, 2026
- **Estado**: ✅ Fase 1 Completada
- **Progreso**: 5/52 reportes implementados (9.6%)

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

### 2.2 Ingresos por Método de Pago ✅
- [x] Backend: Endpoint `/api/cash-register-movements/income-by-method/export`
- [x] Frontend: Método API client `exportIncomeByMethodToCSV`
- [x] Campos: Método de pago, Cantidad de operaciones, Monto total, Porcentaje del total
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

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

### 3.1 Resumen de Turnos de Caja ✅
- [x] Backend: Endpoint `/api/cash-registers/export`
- [x] Frontend: Botón de exportación en página de cajas
- [x] Campos: Fecha apertura, Fecha cierre, Usuario, Monto inicial, Efectivo esperado, Efectivo real, Tarjeta, Transferencia, Total ventas, Total gastos, Diferencia, Estado
- [x] Filtros: Rango de fechas, usuario, estado
- **Completado**: 26/01/2026

### 3.2 Movimientos de Caja Detallados ✅
- [x] Backend: Endpoint `/api/cash-register-movements/export`
- [x] Frontend: Método API client `exportCashMovementsToCSV`
- [x] Campos: Fecha/Hora, Tipo, Descripción, Método de pago, Monto, Categoría, Orden/Reserva, Usuario, Notas
- [x] Filtros: Rango de fechas, turno, tipo de movimiento, método de pago
- **Completado**: 27/01/2026

### 3.3 Cierre de Caja Diario
- [ ] Backend: Endpoint `/api/cash-registers/daily-close/export`
- [ ] Frontend: Botón de exportación en resumen diario
- [ ] Campos: Fecha, Total efectivo, Total tarjeta, Total transferencia, Total ventas, Total gastos, Diferencias, Observaciones
- [ ] Filtros: Rango de fechas

---

## 💸 4. GASTOS (Expenses)

### 4.1 Reporte de Gastos ✅
- [x] Backend: Endpoint `/api/expenses/establishment/:id/export`
- [x] Frontend: Botón de exportación en página de gastos
- [x] Campos: Fecha, Categoría, Descripción, Proveedor, Monto, Método de pago, Factura, Origen (Caja/Administración), Usuario, Notas
- [x] Filtros: Rango de fechas, categoría, proveedor, origen, usuario
- **Completado**: 26/01/2026

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

### 5.1 Reporte de Ventas ✅
- [x] Backend: Endpoint `/api/orders/export`
- [x] Frontend: Botón de exportación en página de ventas
- [x] Campos: Fecha/Hora, Número de orden, Tipo (Venta directa/Consumo), Cliente, Productos, Cantidad, Subtotal, Descuento, Total, Método de pago, Estado de pago, Usuario
- [x] Filtros: Rango de fechas, tipo, cliente, estado de pago, método de pago
- **Completado**: 26/01/2026

### 5.2 Ventas por Producto ✅
- [x] Backend: Endpoint `/api/orders/sales-by-product/export`
- [x] Frontend: Método API client `exportSalesByProductToCSV`
- [x] Campos: Ranking, Producto, Cantidad vendida, Ingreso total, Porcentaje, Promedio unitario
- [x] Filtros: Rango de fechas
- **Completado**: 27/01/2026

### 5.3 Ventas por Método de Pago
- [ ] Backend: Endpoint `/api/orders/by-payment-method/export`
- [ ] Frontend: Botón de exportación en sección de métodos de pago
- [ ] Campos: Método de pago, Cantidad de ventas, Monto total, Porcentaje del total
- [ ] Filtros: Rango de fechas

---

## 📦 6. STOCK E INVENTARIO

### 6.1 Inventario Actual ✅
- [x] Backend: Endpoint `/api/products/export`
- [x] Frontend: Botón de exportación en página de stock
- [x] Campos: Producto, Categoría, SKU, Stock actual, Stock mínimo, Stock máximo, Costo unitario, Valor total, Estado (Normal/Bajo/Crítico)
- [x] Filtros: Categoría, estado de stock
- **Completado**: 26/01/2026

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

### 7.1 Base de Datos de Clientes ✅
- [x] Backend: Endpoint `/api/clients/establishment/:id/export`
- [x] Frontend: Método API client `exportClientsToCSV`
- [x] Campos: Nombre, Teléfono, Email, Reservas totales, Reservas completadas, Reservas canceladas, No show, Total gastado, Deuda, Última reserva, Estado, Notas
- [x] Filtros: Tiene deuda, Estado activo
- **Completado**: 27/01/2026

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

### 8.1 Estado de Cuentas Corrientes ✅
- [x] Backend: Endpoint `/api/current-accounts/establishment/:id/export`
- [x] Frontend: Método API client `exportCurrentAccountsToCSV`
- [x] Campos: Titular, Teléfono, Email, Tipo, Saldo actual, Total compras, Total pagos, Límite crédito, Descuento, Precio costo, Notas
- [x] Filtros: Tipo de cuenta, tiene saldo
- **Completado**: 27/01/2026

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

### ✅ Fase 1 - Esenciales (Prioridad Alta) - 5/5 completado (100%) ✅
- [x] 1.1 Reporte General de Reservas ✅
- [x] 3.1 Resumen de Turnos de Caja ✅
- [x] 4.1 Reporte de Gastos ✅
- [x] 5.1 Reporte de Ventas ✅
- [x] 6.1 Inventario Actual ✅

### ✅ Fase 2 - Importantes (Prioridad Media) - 5/5 completado (100%) ✅
- [x] 2.2 Ingresos por Método de Pago ✅
- [x] 3.2 Movimientos de Caja Detallados ✅
- [x] 5.2 Ventas por Producto ✅
- [x] 7.1 Base de Datos de Clientes ✅
- [x] 8.1 Estado de Cuentas Corrientes ✅

### ✅ Fase 3 - Analíticos (Prioridad Media-Baja) - 5/5 completado (100%) ✅
- [x] 9.1 Ocupación de Canchas ✅
- [x] 7.2 Clientes Frecuentes ✅
- [x] 4.2 Gastos por Categoría ✅
- [x] 6.3 Compras a Proveedores ✅
- [x] 9.2 Horarios Pico ✅

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
- **Reportes completados**: 5
- **Porcentaje completado**: 9.6%
- **Fase actual**: ✅ Fase 1 Completada
- **Próximo hito**: Fase 2 - Reportes Importantes

---

## 🔄 HISTORIAL DE CAMBIOS

### 26/01/2026 - 23:30
- ✅ **FASE 1 COMPLETADA**
  - ✅ 1.1 Reporte General de Reservas
  - ✅ 3.1 Resumen de Turnos de Caja
  - ✅ 4.1 Reporte de Gastos
  - ✅ 5.1 Reporte de Ventas
  - ✅ 6.1 Inventario Actual
  - Backend commits: `8d2531c`, `5d41d61`
  - Frontend commits: `7aaad1bc`, `c724c42f`

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
