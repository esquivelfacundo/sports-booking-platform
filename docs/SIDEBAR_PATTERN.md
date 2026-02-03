# Patrón de Sidebar

## Solución para alto completo
Usar `createPortal(JSX, document.body)` con estado `mounted`.

## Clases del Panel
```
fixed inset-y-0 right-0 w-full max-w-md bg-gray-800 border-l border-gray-700 z-[101] flex flex-col
```

## Clases del Overlay
```
fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]
```

## Footer Botones
- Cancelar: `text-gray-300 hover:text-white` (solo texto)
- Crear: `px-6 py-2.5 bg-emerald-600 rounded-xl flex items-center gap-2` + icono Check

## Referencia
Ver implementación en: `configuracion/page.tsx` líneas 1670-1892
