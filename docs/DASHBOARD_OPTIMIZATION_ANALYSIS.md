# Análisis de Optimización del Dashboard de Establecimientos

**Fecha:** 24 de Diciembre 2025  
**Autor:** Análisis Técnico  
**Alcance:** `/establecimientos/admin/*`

---

## Resumen Ejecutivo

Este documento presenta un análisis exhaustivo del dashboard de establecimientos, identificando oportunidades de optimización en consumo de recursos, llamadas API, re-renders y gestión de estado.

---

## 1. Arquitectura Actual

### 1.1 Estructura de Contextos

```
App
├── AuthProvider
├── EstablishmentProvider          ← Carga datos del establecimiento
│   └── EstablishmentAdminProvider ← Carga reservas, canchas, stats, notificaciones
│       └── AdminLayout
│           └── Dashboard (page.tsx)
```

### 1.2 Flujo de Datos al Cargar el Dashboard

1. **AuthContext** verifica autenticación
2. **EstablishmentContext** carga datos del establecimiento (1 API call)
3. **EstablishmentAdminContext** se inicializa y:
   - Carga `establishmentId` desde API (1 API call)
   - Carga `courts` (1 API call)
   - Carga `stats` (1 API call con limit: 1000)
   - Carga `notifications` (1 API call)
4. **Dashboard page.tsx**:
   - Carga `reservations` del día (1 API call)
   - Carga `totalBookings` para banner de marketing (1 API call)
5. **Layout**:
   - Verifica PIN del usuario (1 API call)

**Total al cargar dashboard: ~8 llamadas API**

---

## 2. Problemas Identificados

### 2.1 🔴 CRÍTICO: Carga de Stats Ineficiente

**Archivo:** `EstablishmentAdminContext.tsx` líneas 248-303

```typescript
const loadStats = useCallback(async () => {
  // ...
  const response = await apiClient.getEstablishmentBookings(establishmentId, { limit: 1000 });
  // Procesa 1000 bookings en el cliente para calcular stats
});
```

**Problema:** 
- Descarga TODAS las reservas (hasta 1000) solo para calcular estadísticas
- El procesamiento se hace en el cliente (filtros, sumas, conteos)
- Esto debería ser un endpoint dedicado en el backend

**Impacto:**
- Transferencia de datos excesiva (~50-200KB por carga)
- Procesamiento pesado en el navegador
- Tiempo de carga aumentado

---

### 2.2 🔴 CRÍTICO: Llamadas API Duplicadas

**Problema:** El `EstablishmentContext` y `EstablishmentAdminContext` hacen llamadas similares:

| Contexto | Endpoint | Datos |
|----------|----------|-------|
| EstablishmentContext | `/api/establishments/me` | Establishment completo |
| EstablishmentAdminContext | `apiClient.getMyEstablishments()` | Establishment ID |

**Impacto:** 2 llamadas donde 1 sería suficiente

---

### 2.3 🟡 MEDIO: Timer de Reloj Cada Segundo

**Archivo:** `page.tsx` líneas 103-108

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

**Problema:**
- Actualiza el estado cada segundo
- Causa re-render de todo el componente cada segundo
- Solo se usa para el saludo ("Buenos días/tardes/noches")

**Impacto:** ~60 re-renders por minuto innecesarios

---

### 2.4 🟡 MEDIO: Cálculos en Cada Render

**Archivo:** `page.tsx` líneas 186-248

```typescript
// Se recalcula en CADA render
const upcomingReservations = reservations
  .filter(r => r.date === today && r.time >= currentTimeStr)
  .sort((a, b) => a.time.localeCompare(b.time))
  .slice(0, 5)
  .map(r => ({...}));

const courtStatus = courts.length > 0 
  ? courts.map((court) => {
      const currentBooking = reservations.find(...);
      // ...
    })
  : [...];
```

**Problema:** 
- Filtros, sorts y maps se ejecutan en cada render
- No están memoizados con `useMemo`

**Impacto:** Procesamiento repetitivo innecesario

---

### 2.5 🟡 MEDIO: Dependencias de useEffect Problemáticas

**Archivo:** `page.tsx` líneas 78-101

```typescript
useEffect(() => {
  const fetchTotalBookings = async () => {
    // ...
  };
  fetchTotalBookings();
}, [establishment?.id, adminStats?.todayBookings, API_URL]);
```

**Problema:**
- `adminStats?.todayBookings` como dependencia causa re-fetch cuando cambian las stats
- Puede crear un loop si las stats se actualizan frecuentemente

---

### 2.6 🟢 MENOR: Console.logs en Producción

**Archivos:** `EstablishmentContext.tsx`, `api.ts`

Múltiples `console.log` que deberían eliminarse o condicionarse a desarrollo:
- Línea 114, 133, 162, 167, etc. en EstablishmentContext
- Línea 116, 117, 120, 146 en api.ts

**Impacto:** Overhead menor, pero afecta debugging en producción

---

### 2.7 🟢 MENOR: Falta de Caché de Datos

**Problema:** No hay caché de datos entre navegaciones. Cada vez que se vuelve al dashboard:
- Se recargan todas las reservas
- Se recargan las stats
- Se recargan las notificaciones

---

## 3. Recomendaciones de Mejora

### 3.1 🔴 Crear Endpoint de Stats en Backend

**Beneficio:** Reducir transferencia de datos de ~200KB a ~1KB

**Implementación:**
```javascript
// Backend: GET /api/bookings/establishment/:id/stats
router.get('/establishment/:id/stats', async (req, res) => {
  const stats = await Booking.findAll({
    where: { establishmentId: req.params.id },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN date = CURRENT_DATE THEN 1 ELSE 0 END")), 'todayBookings'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'pending' THEN 1 ELSE 0 END")), 'pending'],
      // ... más agregaciones
    ]
  });
  res.json({ success: true, stats });
});
```

**Riesgo:** Bajo - Es un nuevo endpoint, no afecta funcionalidad existente

**Sacrificio:** Ninguno

---

### 3.2 🔴 Unificar Carga de Establishment

**Beneficio:** Eliminar 1 llamada API duplicada

**Implementación:**
```typescript
// En EstablishmentAdminContext, usar el establishment del EstablishmentContext
const { establishment } = useEstablishment();

useEffect(() => {
  if (establishment?.id) {
    setEstablishmentId(establishment.id);
  }
}, [establishment?.id]);
```

**Riesgo:** Bajo - Requiere asegurar que EstablishmentContext cargue primero

**Sacrificio:** Ninguno

---

### 3.3 🟡 Optimizar Timer del Reloj

**Beneficio:** Eliminar ~60 re-renders/minuto

**Implementación:**
```typescript
// Opción A: Calcular saludo solo una vez
const [greeting] = useState(() => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
});

// Opción B: Actualizar cada minuto en vez de cada segundo
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 60000); // 1 minuto
  return () => clearInterval(timer);
}, []);
```

**Riesgo:** Muy bajo

**Sacrificio:** El saludo no cambiará instantáneamente al cambiar de franja horaria (aceptable)

---

### 3.4 🟡 Memoizar Cálculos Derivados

**Beneficio:** Evitar recálculos innecesarios

**Implementación:**
```typescript
const upcomingReservations = useMemo(() => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return reservations
    .filter(r => r.date === today && r.time >= currentTimeStr)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5)
    .map(r => ({...}));
}, [reservations]); // Solo recalcula cuando cambian las reservas

const courtStatus = useMemo(() => {
  // ... lógica de estado de canchas
}, [courts, reservations]);
```

**Riesgo:** Muy bajo

**Sacrificio:** Ninguno

---

### 3.5 🟡 Corregir Dependencias de useEffect

**Beneficio:** Evitar llamadas API innecesarias

**Implementación:**
```typescript
// Separar la carga inicial del banner de marketing
useEffect(() => {
  const fetchTotalBookings = async () => {
    if (!establishment?.id) return;
    // ... fetch
  };
  fetchTotalBookings();
}, [establishment?.id]); // Solo depende del ID, no de las stats
```

**Riesgo:** Bajo

**Sacrificio:** El contador de reservas no se actualizará automáticamente (se puede agregar un botón de refresh si es necesario)

---

### 3.6 🟢 Implementar Caché con SWR o React Query

**Beneficio:** 
- Caché automático entre navegaciones
- Revalidación inteligente
- Deduplicación de requests

**Implementación:**
```typescript
import useSWR from 'swr';

const { data: stats, isLoading } = useSWR(
  establishmentId ? `/api/bookings/establishment/${establishmentId}/stats` : null,
  fetcher,
  { 
    revalidateOnFocus: false,
    dedupingInterval: 60000 // 1 minuto
  }
);
```

**Riesgo:** Medio - Requiere refactorización significativa de los contextos

**Sacrificio:** Complejidad adicional, nueva dependencia

---

### 3.7 🟢 Eliminar Console.logs en Producción

**Beneficio:** Código más limpio, mejor rendimiento

**Implementación:**
```typescript
// Crear helper de logging
const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  }
};
```

**Riesgo:** Muy bajo

**Sacrificio:** Pérdida de logs en producción (se pueden enviar a un servicio de logging)

---

## 4. Matriz de Priorización

| Mejora | Impacto | Esfuerzo | Riesgo | Prioridad |
|--------|---------|----------|--------|-----------|
| Endpoint de Stats | Alto | Medio | Bajo | **1** |
| Unificar Establishment | Medio | Bajo | Bajo | **2** |
| Memoizar cálculos | Medio | Bajo | Muy bajo | **3** |
| Optimizar timer | Bajo | Muy bajo | Muy bajo | **4** |
| Corregir useEffect deps | Medio | Bajo | Bajo | **5** |
| Implementar SWR/React Query | Alto | Alto | Medio | **6** |
| Eliminar console.logs | Bajo | Bajo | Muy bajo | **7** |

---

## 5. Estimación de Mejoras

### Antes de Optimización:
- **Llamadas API al cargar:** ~8
- **Datos transferidos:** ~250KB
- **Re-renders/minuto:** ~60+
- **Tiempo de carga estimado:** 2-4 segundos

### Después de Optimización (todas las mejoras):
- **Llamadas API al cargar:** ~5
- **Datos transferidos:** ~50KB
- **Re-renders/minuto:** ~1-2
- **Tiempo de carga estimado:** 0.5-1 segundo

### Mejora Estimada:
- **37% menos llamadas API**
- **80% menos datos transferidos**
- **97% menos re-renders**
- **50-75% más rápido**

---

## 6. Plan de Implementación Sugerido

### Fase 1 (Quick Wins - 1 día)
1. Memoizar cálculos derivados
2. Optimizar timer del reloj
3. Corregir dependencias de useEffect

### Fase 2 (Backend - 2-3 días)
1. Crear endpoint `/api/bookings/establishment/:id/stats`
2. Actualizar frontend para usar nuevo endpoint

### Fase 3 (Refactorización - 3-5 días)
1. Unificar carga de establishment entre contextos
2. Evaluar e implementar SWR/React Query

### Fase 4 (Cleanup - 1 día)
1. Eliminar console.logs
2. Documentar cambios

---

## 7. Métricas a Monitorear

Para validar las mejoras, se recomienda monitorear:

1. **Network:**
   - Número de requests al cargar dashboard
   - Tamaño total de respuestas
   - Tiempo hasta First Contentful Paint

2. **Performance:**
   - React DevTools Profiler (re-renders)
   - Lighthouse Performance Score
   - Core Web Vitals (LCP, FID, CLS)

3. **Backend:**
   - Requests por minuto al API
   - Tiempo de respuesta de endpoints
   - Uso de CPU/memoria en servidor

---

## 8. Conclusión

El dashboard actual funciona correctamente pero tiene oportunidades significativas de optimización. Las mejoras más impactantes son:

1. **Crear endpoint de stats en backend** - Reduce drásticamente la transferencia de datos
2. **Memoizar cálculos** - Elimina procesamiento repetitivo
3. **Optimizar timer** - Reduce re-renders innecesarios

Implementando las mejoras de Fase 1 y 2, se puede lograr una mejora del **50-60%** en rendimiento con riesgo mínimo.

---

*Documento generado para análisis interno. Revisar antes de implementar cambios.*
