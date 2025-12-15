# 🧠 MI CONDO - Development Memory & Learning Log

> **IMPORTANTE**: Este archivo sirve como memoria persistente del proyecto.
> Documenta errores, soluciones, decisiones y aprendizajes para evitar repetir errores.

---

## 📍 CONFIGURACIÓN CRÍTICA - NUNCA OLVIDAR

### ⚠️ DIRECTORIO DE TRABAJO CORRECTO
```
✅ CORRECTO: C:\dev\micondo
❌ INCORRECTO: H:\My Drive\MY APPS\micondowebapp (Google Drive - NO USAR)
```

**RAZÓN**: Google Drive sincroniza archivos constantemente, lo que causa:
- `npm install` extremadamente lento (45+ minutos)
- Errores de módulos no encontrados
- Conflictos de archivos bloqueados
- El error: `Cannot find package 'vite'` cuando se ejecuta desde Drive

### 🔧 Comandos Correctos
```powershell
# SIEMPRE cambiar al directorio correcto primero
cd C:\dev\micondo

# Luego ejecutar comandos
npm run dev
npm run build
npx vite --host
```

---

## 🐛 LOG DE ERRORES Y SOLUCIONES

### Error #001 - Vite not found desde Google Drive
**Fecha**: 2024-12-14
**Error**:
```
Cannot find package 'H:\My Drive\MY APPS\micondowebapp\node_modules\vite\index.js'
```
**Causa**: Terminal ejecutando desde Google Drive en lugar de C:\dev\micondo
**Solución**: 
1. Siempre ejecutar `cd C:\dev\micondo` antes de cualquier comando npm/vite
2. Verificar el prompt del terminal muestra `C:\dev\micondo>`
**Aprendizaje**: El working directory del terminal persiste entre comandos. Siempre verificar antes de ejecutar.

### Error #002 - npm install lento en Google Drive
**Fecha**: 2024-12-14
**Error**: npm install tarda 45+ minutos, se congela
**Causa**: Google Drive sincroniza cada archivo de node_modules individualmente
**Solución**: Clonar repo a disco local (C:\dev\micondo)
**Aprendizaje**: NUNCA ejecutar npm install en carpetas sincronizadas con la nube

### Error #003 - Hardcoded credentials en código
**Fecha**: 2024-12-14
**Error**: SUPER_ADMIN_UID y defaultCompanyId hardcodeados
**Causa**: Desarrollo inicial sin pensar en seguridad
**Solución**: 
- Mover a variables de entorno (VITE_SUPER_ADMIN_UID)
- Detectar companyId dinámicamente desde AuthContext
**Aprendizaje**: Siempre usar env vars para credenciales desde el inicio

---

## ✅ FIXES COMPLETADOS

### Fase 1: Security Hardening (2024-12-14)
- [x] Hardcoded Super Admin UID → Environment variable
- [x] Hardcoded Company ID → Dynamic from AuthContext
- [x] Missing firestore.rules → Created and deployed
- [x] Missing storage.rules → Created and deployed
- [x] Missing .env configuration → Created .env.example and .env.local
- [x] Multi-tenant isolation → Admins only see their company's condos

### Fase 2: Developer Tools (2024-12-14)
- [x] Development Roadmap Dashboard → Created DevRoadmap.tsx
- [x] Integrated into SuperAdmin view
- [x] This memory/learning log file

---

## 🔄 TRABAJO EN PROGRESO

### Testing Framework
- [ ] Install Vitest
- [ ] Create test structure
- [ ] Unit tests for utils/finance.ts
- [ ] Unit tests for utils/date.ts

---

## 📋 ROADMAP FUTURO

### Fase 3: Testing & Quality
- Setup Vitest
- Unit tests for critical functions
- Integration tests for auth flow

### Fase 4: SaaS Monetization  
- Stripe integration
- Subscription plans UI
- Billing portal
- Grace period automation

### Fase 5: Communications
- Email service (SendGrid/AWS SES)
- Payment reminder emails
- Push notifications

### Fase 6: Production Launch
- Performance optimization
- Error monitoring (Sentry)
- Analytics dashboard
- Documentation

---

## 🎓 LECCIONES APRENDIDAS

### Lección #1: Siempre verificar el directorio de trabajo
Antes de ejecutar CUALQUIER comando, verificar que el terminal esté en `C:\dev\micondo`.
El prompt debe mostrar: `PS C:\dev\micondo>`

### Lección #2: Google Drive ≠ Development Environment
Google Drive es para backup/sync, NO para desarrollo activo.
- Código fuente: GitHub
- Desarrollo: Disco local (C:\dev\)
- Backup: Google Drive (solo para archivos, no node_modules)

### Lección #3: Documentar TODO
Cada error encontrado debe documentarse aquí con:
- Fecha
- Mensaje de error exacto
- Causa raíz
- Solución aplicada
- Lección aprendida

### Lección #4: Environment Variables desde el inicio
Nunca hardcodear:
- API keys
- User IDs
- Database IDs
- Secrets

Siempre usar:
- .env.local para desarrollo
- .env.example como template (sin valores reales)
- Variables VITE_* para acceso en frontend

---

## 🔗 ARCHIVOS CLAVE DEL PROYECTO

| Archivo | Propósito |
|---------|-----------|
| `C:\dev\micondo\.env.local` | Variables de entorno (NO commitear) |
| `C:\dev\micondo\.env.example` | Template de variables |
| `C:\dev\micondo\firestore.rules` | Reglas de seguridad Firestore |
| `C:\dev\micondo\storage.rules` | Reglas de seguridad Storage |
| `C:\dev\micondo\src\views\dev\DevRoadmap.tsx` | Dashboard de progreso |
| `C:\dev\micondo\DEV_MEMORY.md` | Este archivo - memoria del proyecto |

---

## 📊 ESTADO ACTUAL DEL PROYECTO

**Última actualización**: 2024-12-14

| Métrica | Valor |
|---------|-------|
| Security fixes | 6/6 ✅ |
| Test coverage | 0% ❌ |
| Build status | ✅ Passing |
| Production ready | ❌ No (falta testing, payments) |

---

## 🚨 CHECKLIST PRE-COMANDO

Antes de ejecutar cualquier comando npm/vite/git:

1. [ ] ¿Estoy en `C:\dev\micondo`? (verificar prompt)
2. [ ] ¿El comando es correcto para PowerShell Windows?
3. [ ] ¿He guardado los cambios en los archivos?

---

*Este archivo debe actualizarse cada vez que:*
- *Se encuentra un nuevo error*
- *Se aplica una solución*
- *Se aprende algo nuevo*
- *Se completa una tarea del roadmap*
