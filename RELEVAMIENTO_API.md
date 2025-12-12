# Relevamiento de APIs y Datos Hardcodeados

**Última actualización:** 2025-12-12

## Estado Actual

### ✅ Cambios Realizados
1. **useEstablishments.ts** - Eliminado fallback a mock data
2. **buscar/page.tsx** - Eliminado fallback a mock data
3. **SocialContext.tsx** - Eliminado mock data inicial, carga matches desde API siempre

### 🔄 Backend funcionando en puerto 8001
- **3 Establecimientos** con datos de prueba (prefijo PRUEBA_)
- **7 Canchas** distribuidas en los establecimientos
- **4 Partidos disponibles** (3 abiertos, 1 lleno)
- **3 Torneos** en diferentes estados

## Estado Actual del Backend

### APIs Disponibles (Backend funcionando en puerto 8001)

| Endpoint | Método | Descripción | Estado |
|----------|--------|-------------|--------|
| `/api/auth/register` | POST | Registro de usuarios | ✅ Funcional |
| `/api/auth/login` | POST | Login de usuarios | ✅ Funcional |
| `/api/auth/logout` | POST | Logout | ✅ Funcional |
| `/api/auth/profile` | GET | Perfil del usuario | ✅ Funcional |
| `/api/establishments` | GET | Lista de establecimientos | ✅ Funcional |
| `/api/establishments/:id` | GET | Detalle de establecimiento | ✅ Funcional |
| `/api/courts` | GET | Lista de canchas | ✅ Funcional |
| `/api/courts/:id` | GET | Detalle de cancha | ✅ Funcional |
| `/api/courts/:id/availability` | GET | Disponibilidad | ✅ Funcional |
| `/api/bookings` | GET/POST | Reservas | ✅ Funcional |
| `/api/bookings/:id` | GET | Detalle reserva | ✅ Funcional |
| `/api/bookings/:id/cancel` | POST | Cancelar reserva | ✅ Funcional |
| `/api/payments` | POST | Crear pago | ✅ Funcional |
| `/api/payments/split` | POST | Pago dividido | ✅ Funcional |
| `/api/reviews` | GET/POST | Reseñas | ✅ Funcional |
| `/api/favorites` | GET/POST/DELETE | Favoritos | ✅ Funcional |
| `/api/notifications` | GET | Notificaciones | ✅ Funcional |
| `/api/matches` | GET/POST | Partidos públicos | ✅ Funcional |
| `/api/matches/:id/join` | POST | Unirse a partido | ✅ Funcional |
| `/api/matches/:id/leave` | POST | Salir de partido | ✅ Funcional |
| `/api/tournaments` | GET/POST | Torneos | ✅ Funcional |
| `/api/tournaments/:id/register` | POST | Registrarse en torneo | ✅ Funcional |
| `/api/admin/*` | Varios | Endpoints de admin | ✅ Funcional |

---

## Archivos con Datos Hardcodeados (Mock)

### 1. Contexts (Alta Prioridad)

| Archivo | Datos Mock | API Disponible | Acción |
|---------|------------|----------------|--------|
| `SocialContext.tsx` | friends, matches, teams, activities | `/api/matches`, `/api/users` | Conectar a API |
| `NotificationContext.tsx` | notifications | `/api/notifications` | ✅ Ya conectado (con fallback) |
| `TournamentContext.tsx` | tournaments | `/api/tournaments` | ✅ Ya conectado (con fallback) |
| `RatingContext.tsx` | ratings | `/api/reviews` | Conectar a API |
| `SuperAdminContext.tsx` | establishments, users | `/api/admin/*` | Conectar a API |

### 2. Hooks (Alta Prioridad)

| Archivo | Datos Mock | API Disponible | Acción |
|---------|------------|----------------|--------|
| `useEstablishments.ts` | mockEstablishments | `/api/establishments` | ✅ Ya conectado (eliminar fallback) |
| `useRecommendations.ts` | mockRecommendations | `/api/establishments` | Conectar a API |

### 3. Páginas (Media Prioridad)

| Archivo | Datos Mock | API Disponible | Acción |
|---------|------------|----------------|--------|
| `buscar/page.tsx` | mockEstablishments | `/api/establishments` | Usar hook existente |
| `equipos/page.tsx` | mockTeams | No hay API | Crear API o usar SocialContext |
| `favoritos/page.tsx` | mockFavorites | `/api/favorites` | Conectar a API |
| `reservar/[id]/page.tsx` | mockCourt | `/api/courts/:id` | Conectar a API |
| `confirmacion/page.tsx` | mockBooking | `/api/bookings/:id` | Conectar a API |

### 4. Componentes (Media Prioridad)

| Archivo | Datos Mock | API Disponible | Acción |
|---------|------------|----------------|--------|
| `HomePage.tsx` | featuredFacilities, sports, popularCities | `/api/establishments` | Usar datos de API |
| `FacilityCard.tsx` | N/A | N/A | Solo presentación |
| `CompactFacilityCard.tsx` | N/A | N/A | Solo presentación |

### 5. Dashboard Components (Baja Prioridad)

| Archivo | Datos Mock | API Disponible | Acción |
|---------|------------|----------------|--------|
| `ActivitySection.tsx` | Usa context | SocialContext | Actualizar context |
| `FavoritesSection.tsx` | Usa context | `/api/favorites` | Actualizar context |
| `FriendsSection.tsx` | Usa context | SocialContext | Actualizar context |
| `MatchesSection.tsx` | Usa context | SocialContext | Actualizar context |
| `RatingsSection.tsx` | Usa context | RatingContext | Actualizar context |
| `ReservationsSection.tsx` | Usa context | BookingContext | ✅ Ya conectado |
| `TeamsSection.tsx` | Usa context | SocialContext | Actualizar context |

---

## APIs Faltantes (Necesitan crearse en Backend)

| Funcionalidad | Endpoint Sugerido | Prioridad |
|---------------|-------------------|-----------|
| Amigos/Seguidores | `/api/friends` | Media |
| Equipos | `/api/teams` | Media |
| Actividad/Feed | `/api/activity` | Baja |
| Estadísticas de usuario | `/api/users/:id/stats` | Baja |
| Búsqueda de jugadores | `/api/users/search` | Media |

---

## Plan de Acción

### Fase 1: Eliminar fallbacks innecesarios
1. ✅ `useEstablishments.ts` - Ya conectado, eliminar mock fallback
2. `SocialContext.tsx` - Conectar matches a API
3. `RatingContext.tsx` - Conectar a `/api/reviews`

### Fase 2: Actualizar páginas principales
1. `buscar/page.tsx` - Usar useEstablishments
2. `favoritos/page.tsx` - Usar `/api/favorites`
3. `reservar/[id]/page.tsx` - Usar `/api/courts/:id`

### Fase 3: Dashboard
1. Actualizar contexts para usar APIs reales
2. Los componentes del dashboard ya usan contexts

### Fase 4: APIs faltantes (futuro)
1. Crear endpoints para amigos/equipos si se necesitan
