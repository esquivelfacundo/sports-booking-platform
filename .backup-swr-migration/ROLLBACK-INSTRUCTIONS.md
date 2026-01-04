# 🔄 INSTRUCCIONES DE ROLLBACK - Migración SWR

## Fecha de backup: 2026-01-04
## Estado: ✅ MIGRACIÓN COMPLETADA Y TESTEADA

## Archivos respaldados:

| Archivo Original | Backup |
|-----------------|--------|
| `src/contexts/CashRegisterContext.tsx` | `CashRegisterContext.tsx.backup` |
| `src/contexts/EstablishmentAdminContext.tsx` | `EstablishmentAdminContext.tsx.backup` |
| `src/contexts/EstablishmentContext.tsx` | `EstablishmentContext.tsx.backup` |
| `package.json` | `package.json.backup` |

---

## 🚨 CÓMO REVERTIR TODOS LOS CAMBIOS

### Opción 1: Script automático (recomendado)
```bash
cd /Users/facundoesquivel/Documents/sports-booking-platform

# Restaurar todos los archivos
cp .backup-swr-migration/CashRegisterContext.tsx.backup src/contexts/CashRegisterContext.tsx
cp .backup-swr-migration/EstablishmentAdminContext.tsx.backup src/contexts/EstablishmentAdminContext.tsx
cp .backup-swr-migration/EstablishmentContext.tsx.backup src/contexts/EstablishmentContext.tsx
cp .backup-swr-migration/package.json.backup package.json

# Eliminar archivos nuevos creados
rm -f src/lib/swr-config.tsx
rm -f src/hooks/useSWRFetch.ts

# Reinstalar dependencias sin SWR
npm install

# Reiniciar el servidor de desarrollo
npm run dev
```

### Opción 2: Manual (archivo por archivo)
1. Copiar cada `.backup` al archivo original
2. Eliminar `src/lib/swr-config.tsx` si existe
3. Eliminar `src/hooks/useSWRFetch.ts` si existe
4. Ejecutar `npm install`

---

## 📋 CAMBIOS REALIZADOS EN ESTA MIGRACIÓN

### Archivos NUEVOS creados:
- `src/lib/swr-config.tsx` - Configuración global de SWR
- `src/hooks/useSWRFetch.ts` - Hook personalizado para fetch con SWR

### Archivos MODIFICADOS:
- `package.json` - Agregado dependencia `swr`
- `src/contexts/CashRegisterContext.tsx` - Migrado a SWR
- `src/contexts/EstablishmentAdminContext.tsx` - Migrado a SWR
- `src/contexts/EstablishmentContext.tsx` - Migrado a SWR

### Dependencias agregadas:
- `swr` (versión más reciente)

---

## ✅ VERIFICACIÓN POST-ROLLBACK

Después de revertir, verificar:
1. [ ] `npm run dev` inicia sin errores
2. [ ] Login funciona correctamente
3. [ ] Dashboard carga datos
4. [ ] Reservas se muestran correctamente
5. [ ] Caja registradora funciona
6. [ ] Navegación entre secciones funciona

---

## 📞 NOTAS

Si el rollback no funciona:
1. Verificar que los archivos .backup existan
2. Verificar permisos de escritura
3. Limpiar node_modules y reinstalar: `rm -rf node_modules && npm install`
