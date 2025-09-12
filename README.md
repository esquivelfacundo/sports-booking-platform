# SportBNB - Sports Booking Platform 🏟️

Una plataforma completa de reservas deportivas inspirada en Airbnb, construida con Next.js, React y TypeScript.

## 🚀 Características

### Para Jugadores
- **Búsqueda inteligente** con detección automática de ubicación
- **Mapa interactivo** con marcadores de precios en tiempo real
- **Filtros avanzados** por deporte, fecha, ubicación y jugadores
- **Reservas fáciles** con selección de horarios y duración
- **Diseño responsive** optimizado para móviles y desktop

### Para Establecimientos
- **Dashboard completo** con analytics y métricas
- **Gestión de reservas** en tiempo real
- **Control de empleados** y horarios
- **Reportes financieros** y estadísticas

## 🛠️ Tecnologías

- **Framework:** Next.js 15.5.3 con App Router
- **Frontend:** React 19.1.0 + TypeScript
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Mapas:** Leaflet con tiles de CartoDB
- **Iconos:** Lucide React
- **Geolocalización:** Browser Geolocation API + BigDataCloud

## 🏃‍♂️ Inicio Rápido

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar servidor de desarrollo:**
```bash
npm run dev
```

3. **Abrir en el navegador:**
```
http://localhost:4555
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── page.tsx           # Homepage
│   ├── buscar/            # Página de búsqueda con mapa
│   ├── reservar/[id]/     # Sistema de reservas
│   └── establecimientos/  # Dashboard para establecimientos
├── components/            # Componentes reutilizables
│   ├── Header.tsx         # Navegación principal
│   ├── HeaderSearchBar.tsx # Barra de búsqueda funcional
│   ├── HomePage.tsx       # Página principal
│   ├── FacilityCard.tsx   # Card de establecimiento (vista lista)
│   ├── CompactFacilityCard.tsx # Card compacta (vista grid)
│   └── MapView.tsx        # Mapa interactivo con Leaflet
└── ...
```

## 🎯 Funcionalidades Principales

### 🏠 Homepage
- Detección automática de ciudad usando geolocalización
- Tarjetas de deportes con conteo de establecimientos
- Diseño limpio inspirado en Airbnb
- Animaciones suaves con Framer Motion

### 🔍 Búsqueda (/buscar)
- **Mapa por defecto** ocupando 50% de la pantalla
- **Layout adaptativo:** 2 columnas con mapa, hasta 5 sin mapa
- **Filtros en tiempo real** por deporte, ubicación, fecha
- **Marcadores interactivos** con precios y detalles

### 📅 Reservas (/reservar/[id])
- **Proceso de 2 pasos:** selección → confirmación
- **Calendario integrado** con disponibilidad
- **Selección de duración** y cantidad de jugadores
- **Información completa** del establecimiento

### 🏢 Dashboard Establecimientos
- **Métricas en tiempo real:** reservas, ingresos, ocupación
- **Gestión de empleados** y horarios
- **Reportes detallados** y analytics

## 🎨 Diseño y UX

### Inspiración Airbnb
- **Paleta de colores:** Blanco, grises y rojo Airbnb (#FF385C)
- **Tipografía:** Clean y moderna
- **Espaciado:** Generoso y respirado
- **Componentes:** Cards, botones y formularios consistentes

### Responsive Design
- **Mobile First:** Optimizado para dispositivos móviles
- **Breakpoints:** sm, md, lg, xl, 2xl
- **Grid adaptativo:** 1-5 columnas según pantalla
- **Navegación móvil** con menú hamburguesa

## 🗺️ Integración de Mapas

### Leaflet + CartoDB
- **Carga dinámica** para evitar errores de SSR
- **Tiles minimalistas** de CartoDB Light
- **Marcadores personalizados** con precios
- **Popups informativos** con detalles del establecimiento
- **Auto-zoom** para mostrar todos los resultados

## 📱 Características Técnicas

### Performance
- **Dynamic imports** para componentes pesados
- **Lazy loading** de mapas y imágenes
- **Code splitting** automático de Next.js
- **Optimización de fuentes** con next/font

### SEO y Accesibilidad
- **Meta tags** optimizados
- **Estructura semántica** HTML5
- **Alt texts** en imágenes
- **Navegación por teclado**

## ✅ Funcionalidades Implementadas

- [x] **Sistema de autenticación completo** - Login/registro obligatorio para reservas
- [x] **Red social deportiva** - Conecta con jugadores, forma equipos, únete a partidos
- [x] **Sistema de favoritos** - Guarda canchas favoritas con autenticación
- [x] **Perfiles de usuario** - Gestión completa de perfiles y estadísticas
- [x] **Modal de login obligatorio** - Autenticación requerida para todas las reservas
- [x] **Sistema de calificaciones** - Califica jugadores y establecimientos
- [x] **Búsqueda de jugadores** - Encuentra compañeros de juego por deporte y nivel

## 🌐 Deployment en Vercel

### Configuración completada:
- ✅ Build exitoso sin errores
- ✅ Variables de entorno configuradas (`.env.example`)
- ✅ Next.js optimizado para production
- ✅ Suspense boundaries para SSR
- ✅ Turbopack configurado correctamente

### Pasos para deployar:

1. **Conecta a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

2. **Configura variables de entorno:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
   NEXT_PUBLIC_APP_NAME="Sports Booking Platform"
   ```

3. **Deploy automático** en cada push a main

## 🚀 Próximas Funcionalidades

- [ ] Pagos integrados con Stripe/MercadoPago
- [ ] Notificaciones push y email
- [ ] Chat en tiempo real
- [ ] API REST completa
- [ ] Integración con redes sociales

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ usando Next.js y TypeScript**
