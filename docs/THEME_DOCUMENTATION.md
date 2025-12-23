# Documentación de Paleta Cromática - Mis Canchas

## Plataforma de Establecimientos

Este documento describe la paleta cromática actual (Dark Theme) y propone una versión Light Theme equivalente.

---

## 🌙 DARK THEME (Actual)

### Colores Base

| Elemento | Clase Tailwind | Color Hex | Uso |
|----------|---------------|-----------|-----|
| **Fondo principal** | `bg-gray-900` | `#111827` | Fondo de páginas, contenedor principal |
| **Fondo secundario** | `bg-gray-800` | `#1F2937` | Cards, sidebar, modales, contenedores |
| **Fondo terciario** | `bg-gray-700` | `#374151` | Hover states, elementos interactivos |
| **Bordes** | `border-gray-700` | `#374151` | Separadores, bordes de cards |
| **Bordes sutiles** | `border-gray-600` | `#4B5563` | Bordes secundarios |

### Colores de Texto

| Elemento | Clase Tailwind | Color Hex | Uso |
|----------|---------------|-----------|-----|
| **Texto principal** | `text-white` | `#FFFFFF` | Títulos, texto importante |
| **Texto secundario** | `text-gray-300` | `#D1D5DB` | Texto de navegación, labels |
| **Texto terciario** | `text-gray-400` | `#9CA3AF` | Texto de ayuda, subtítulos |
| **Texto deshabilitado** | `text-gray-500` | `#6B7280` | Placeholders, texto inactivo |

### Colores de Acento (Brand)

| Elemento | Clase Tailwind | Color Hex | Uso |
|----------|---------------|-----------|-----|
| **Primario** | `bg-emerald-600` | `#059669` | Botones principales, elementos activos |
| **Primario hover** | `bg-emerald-700` | `#047857` | Hover de botones primarios |
| **Primario light** | `bg-emerald-500` | `#10B981` | Badges, indicadores |
| **Primario bg** | `bg-emerald-500/20` | `rgba(16,185,129,0.2)` | Fondos sutiles, iconos |
| **Primario text** | `text-emerald-400` | `#34D399` | Texto de acento, iconos |

### Gradientes

| Elemento | Clases Tailwind | Uso |
|----------|----------------|-----|
| **Gradiente primario** | `from-emerald-500 to-cyan-500` | Botones CTA, banners de éxito |
| **Gradiente hover** | `from-emerald-600 to-cyan-600` | Hover de gradiente primario |
| **Gradiente fondo** | `from-emerald-900/50 to-gray-800` | Headers, secciones destacadas |

### Colores de Estado

| Estado | Background | Text/Icon | Uso |
|--------|-----------|-----------|-----|
| **Éxito** | `bg-emerald-500` / `bg-green-500` | `text-emerald-400` | Confirmaciones, disponible |
| **Error** | `bg-red-500` | `text-red-400` | Errores, ocupado, eliminar |
| **Advertencia** | `bg-yellow-500` | `text-yellow-400` | Alertas, mantenimiento |
| **Info** | `bg-blue-500` | `text-blue-400` | Información, pendiente |
| **Neutral** | `bg-gray-500` | `text-gray-400` | Estados desconocidos |

### Componentes Específicos

#### Sidebar
```
Fondo: bg-gray-800
Borde: border-gray-700
Item activo: bg-emerald-600 text-white
Item hover: bg-gray-700 text-white
Item normal: text-gray-300
Separadores: border-gray-700
```

#### Header
```
Fondo: bg-gray-900
Borde inferior: border-gray-700
Iconos: text-gray-400 hover:text-white
Botones: hover:bg-gray-800
```

#### Cards
```
Fondo: bg-gray-800
Borde: border-gray-700
Título: text-white
Subtítulo: text-gray-400
```

#### Inputs
```
Fondo: bg-gray-700
Borde: border-gray-600
Texto: text-white
Placeholder: text-gray-500
Focus: border-emerald-500 ring-emerald-500
```

#### Botones
```
Primario: bg-emerald-600 hover:bg-emerald-700 text-white
Secundario: bg-gray-700 hover:bg-gray-600 text-white
Outline: border-gray-600 hover:bg-gray-700 text-gray-300
Danger: bg-red-600 hover:bg-red-700 text-white
Ghost: hover:bg-gray-800 text-gray-400
```

---

## ☀️ LIGHT THEME (Propuesta)

### Colores Base

| Elemento | Clase Tailwind | Color Hex | Uso |
|----------|---------------|-----------|-----|
| **Fondo principal** | `bg-gray-50` | `#F9FAFB` | Fondo de páginas, contenedor principal |
| **Fondo secundario** | `bg-white` | `#FFFFFF` | Cards, sidebar, modales, contenedores |
| **Fondo terciario** | `bg-gray-100` | `#F3F4F6` | Hover states, elementos interactivos |
| **Bordes** | `border-gray-200` | `#E5E7EB` | Separadores, bordes de cards |
| **Bordes sutiles** | `border-gray-300` | `#D1D5DB` | Bordes secundarios |

### Colores de Texto

| Elemento | Clase Tailwind | Color Hex | Uso |
|----------|---------------|-----------|-----|
| **Texto principal** | `text-gray-900` | `#111827` | Títulos, texto importante |
| **Texto secundario** | `text-gray-700` | `#374151` | Texto de navegación, labels |
| **Texto terciario** | `text-gray-500` | `#6B7280` | Texto de ayuda, subtítulos |
| **Texto deshabilitado** | `text-gray-400` | `#9CA3AF` | Placeholders, texto inactivo |

### Colores de Acento (Brand)

| Elemento | Clase Tailwind | Color Hex | Uso |
|----------|---------------|-----------|-----|
| **Primario** | `bg-emerald-600` | `#059669` | Botones principales, elementos activos |
| **Primario hover** | `bg-emerald-700` | `#047857` | Hover de botones primarios |
| **Primario light** | `bg-emerald-500` | `#10B981` | Badges, indicadores |
| **Primario bg** | `bg-emerald-50` | `#ECFDF5` | Fondos sutiles |
| **Primario text** | `text-emerald-600` | `#059669` | Texto de acento, iconos |

### Gradientes

| Elemento | Clases Tailwind | Uso |
|----------|----------------|-----|
| **Gradiente primario** | `from-emerald-500 to-cyan-500` | Botones CTA, banners de éxito |
| **Gradiente hover** | `from-emerald-600 to-cyan-600` | Hover de gradiente primario |
| **Gradiente fondo** | `from-emerald-50 to-white` | Headers, secciones destacadas |

### Colores de Estado

| Estado | Background | Text/Icon | Uso |
|--------|-----------|-----------|-----|
| **Éxito** | `bg-emerald-100` | `text-emerald-700` | Confirmaciones, disponible |
| **Error** | `bg-red-100` | `text-red-700` | Errores, ocupado, eliminar |
| **Advertencia** | `bg-yellow-100` | `text-yellow-700` | Alertas, mantenimiento |
| **Info** | `bg-blue-100` | `text-blue-700` | Información, pendiente |
| **Neutral** | `bg-gray-100` | `text-gray-600` | Estados desconocidos |

### Componentes Específicos

#### Sidebar
```
Fondo: bg-white
Borde: border-gray-200
Item activo: bg-emerald-600 text-white
Item hover: bg-gray-100 text-gray-900
Item normal: text-gray-700
Separadores: border-gray-200
```

#### Header
```
Fondo: bg-white
Borde inferior: border-gray-200
Iconos: text-gray-500 hover:text-gray-900
Botones: hover:bg-gray-100
```

#### Cards
```
Fondo: bg-white
Borde: border-gray-200
Sombra: shadow-sm
Título: text-gray-900
Subtítulo: text-gray-500
```

#### Inputs
```
Fondo: bg-white
Borde: border-gray-300
Texto: text-gray-900
Placeholder: text-gray-400
Focus: border-emerald-500 ring-emerald-500
```

#### Botones
```
Primario: bg-emerald-600 hover:bg-emerald-700 text-white
Secundario: bg-gray-100 hover:bg-gray-200 text-gray-900
Outline: border-gray-300 hover:bg-gray-50 text-gray-700
Danger: bg-red-600 hover:bg-red-700 text-white
Ghost: hover:bg-gray-100 text-gray-600
```

---

## 🔄 Mapeo de Conversión Dark → Light

| Dark Theme | Light Theme |
|------------|-------------|
| `bg-gray-900` | `bg-gray-50` |
| `bg-gray-800` | `bg-white` |
| `bg-gray-700` | `bg-gray-100` |
| `bg-gray-600` | `bg-gray-200` |
| `border-gray-700` | `border-gray-200` |
| `border-gray-600` | `border-gray-300` |
| `text-white` | `text-gray-900` |
| `text-gray-300` | `text-gray-700` |
| `text-gray-400` | `text-gray-500` |
| `text-gray-500` | `text-gray-400` |
| `text-emerald-400` | `text-emerald-600` |
| `bg-emerald-500/20` | `bg-emerald-50` |
| `from-emerald-900/50` | `from-emerald-50` |
| `hover:bg-gray-800` | `hover:bg-gray-100` |
| `hover:bg-gray-700` | `hover:bg-gray-100` |
| `hover:text-white` | `hover:text-gray-900` |

---

## 📁 Archivos Principales que Usan el Theme

### Layout y Estructura
- `src/app/establecimientos/admin/layout.tsx` - Layout principal del admin
- `src/app/establecimientos/login/page.tsx` - Página de login

### Páginas del Admin
- `src/app/establecimientos/admin/page.tsx` - Dashboard
- `src/app/establecimientos/admin/reservas/page.tsx` - Reservas
- `src/app/establecimientos/admin/configuracion/page.tsx` - Configuración
- `src/app/establecimientos/admin/canchas/page.tsx` - Canchas
- `src/app/establecimientos/admin/caja/page.tsx` - Caja
- `src/app/establecimientos/admin/clientes/page.tsx` - Clientes
- `src/app/establecimientos/admin/personal/page.tsx` - Personal
- `src/app/establecimientos/admin/analytics/page.tsx` - Analytics
- `src/app/establecimientos/admin/finanzas/page.tsx` - Finanzas
- `src/app/establecimientos/admin/stock/page.tsx` - Stock
- `src/app/establecimientos/admin/ventas/page.tsx` - Ventas
- `src/app/establecimientos/admin/cuentas-corrientes/page.tsx` - Cuentas Corrientes
- `src/app/establecimientos/admin/integraciones/page.tsx` - Integraciones
- `src/app/establecimientos/admin/marketing/page.tsx` - Marketing
- `src/app/establecimientos/admin/torneos/page.tsx` - Torneos

### Componentes Compartidos
- `src/components/admin/SetupPinSidebar.tsx`
- `src/components/admin/UserProfileSidebar.tsx`
- `src/components/admin/CashRegisterTopbar.tsx`
- `src/components/HeaderSearchBar.tsx`

---

## 🎨 Implementación Recomendada

### Opción 1: CSS Variables (Recomendado)

Crear variables CSS en `globals.css`:

```css
:root {
  /* Light theme (default) */
  --bg-primary: #F9FAFB;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F3F4F6;
  --border-primary: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #374151;
  --text-tertiary: #6B7280;
  --accent-primary: #059669;
  --accent-light: #ECFDF5;
}

.dark {
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;
  --border-primary: #374151;
  --text-primary: #FFFFFF;
  --text-secondary: #D1D5DB;
  --text-tertiary: #9CA3AF;
  --accent-primary: #059669;
  --accent-light: rgba(16,185,129,0.2);
}
```

### Opción 2: Tailwind Dark Mode

Usar el prefijo `dark:` de Tailwind:

```tsx
<div className="bg-gray-50 dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">Texto</p>
</div>
```

Configurar en `tailwind.config.js`:
```js
module.exports = {
  darkMode: 'class', // o 'media' para seguir preferencias del sistema
  // ...
}
```

---

## 📝 Notas

1. **Consistencia**: El color de acento `emerald` se mantiene igual en ambos themes para preservar la identidad de marca.

2. **Contraste**: Los colores propuestos cumplen con WCAG 2.1 para accesibilidad.

3. **Sombras**: En light theme se recomienda agregar `shadow-sm` a las cards para dar profundidad.

4. **Transiciones**: Agregar `transition-colors duration-200` para suavizar el cambio entre themes.
