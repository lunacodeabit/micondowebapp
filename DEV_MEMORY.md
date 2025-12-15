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

### Fase 2.5: SuperAdmin Dashboard Completo (2024-12-14)

- [x] Botón "Ver Clientes" → Modal que muestra condos de cada compañía
- [x] Dashboard métricas SaaS → KPIs (MRR, activos, gracia, vencimientos)
- [x] Sistema de Tabs → Compañías, Facturación, Comunicaciones
- [x] Sistema de Facturación → Registro de pagos, historial, totales
- [x] Centro de Comunicaciones → Anuncios globales a clientes
- [x] Nuevos tipos TypeScript → SaasPayment, SaasAnnouncement, SaasMessage
- [x] Nuevas colecciones Firestore → saas_payments, saas_announcements

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
- Variables VITE\_\* para acceso en frontend

### Lección #5: Dividir tareas grandes en pasos pequeños (AI Assistant)

**Fecha**: 2024-12-14
**Problema**: Cuando el AI intenta hacer muchas ediciones grandes simultáneamente, puede:

- Perder contexto
- Generar respuestas incompletas
- Causar errores de timeout
- Confundir al usuario

**Solución - PROTOCOLO DE TAREAS GRANDES**:

1. **NUNCA** intentar hacer más de 2-3 cambios de archivo en una sola respuesta
2. **SIEMPRE** dividir tareas grandes en sub-tareas de máximo 15-20 minutos
3. **USAR** el todo list para trackear progreso visible
4. **CONFIRMAR** después de cada sub-tarea completada antes de continuar
5. **DOCUMENTAR** el progreso en cada paso

**Ejemplo de división correcta**:

```
❌ INCORRECTO: "Voy a implementar todo el SuperAdmin completo"
✅ CORRECTO:
   Paso 1: Arreglar botón "Ver Clientes" (1 archivo)
   Paso 2: Añadir Dashboard métricas (1-2 archivos)
   Paso 3: Sistema de facturación (2-3 archivos)
   Paso 4: Centro de comunicaciones (2-3 archivos)
   → Confirmar con usuario entre cada paso
```

**Regla de oro**: Si una tarea requiere editar más de 3 archivos, DIVIDIR en partes.

### Lección #6: SIEMPRE probar después de hacer cambios (AI Assistant)

**Fecha**: 2024-12-14 (Reforzada: 2024-12-15)
**Problema**: Declarar que un trabajo está "completado" sin verificar que compile/funcione
**Consecuencia**: El usuario encuentra errores que el AI debió detectar primero

**Solución - PROTOCOLO DE VERIFICACIÓN OBLIGATORIO**:
Después de cada edición de código, SIEMPRE ejecutar:

1. `npm run build` - Verificar que compila sin errores de TypeScript
2. Si hay errores → arreglarlos ANTES de reportar al usuario
3. **VERIFICAR QUE EL SERVIDOR ESTÉ CORRIENDO** antes de decir "pruébalo"
4. Solo reportar "completado" cuando TODO funcione

**Checklist post-edición**:

```
[ ] ¿Ejecuté npm run build?
[ ] ¿Hay errores de TypeScript?
[ ] ¿Hay errores de sintaxis JSX?
[ ] ¿Faltan cierres de tags/componentes?
[ ] ¿ESTÁ EL SERVIDOR CORRIENDO? (npm run dev)
[ ] ¿Puedo acceder a localhost:XXXX?
[ ] Solo entonces → reportar al usuario
```

**NUNCA decir "listo" o "pruébalo" sin verificar que el servidor esté activo.**

### Lección #7: Matar procesos node antes de reiniciar servidor

**Fecha**: 2024-12-15
**Problema**: Múltiples instancias de node corriendo causando confusión de puertos
**Consecuencia**: El usuario intenta acceder a localhost:3002 pero el servidor real está en otro puerto

**Solución - PROTOCOLO DE REINICIO LIMPIO**:
```powershell
# SIEMPRE antes de npm run dev:
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
npm run dev
```

**Regla**: Si el puerto no es 3000, hay procesos zombie. Matarlos primero.

### Lección #8: No confiar en Hot Reload para cambios de Context/Provider

**Fecha**: 2024-12-15
**Problema**: Cambios en AuthContext o CondoContext no se reflejan correctamente con HMR
**Consecuencia**: El estado del usuario no se actualiza, pantallas en blanco

**Solución**:
- Cambios en `*Context.tsx` → REINICIO COMPLETO del servidor
- Cambios en `App.tsx` (flujo de routing) → REINICIO COMPLETO
- Cambios en componentes normales → HMR está OK

### Lección #9: Verificar con mis propios ojos ANTES de reportar

**Fecha**: 2024-12-15
**Problema**: Decir "funciona" basándose en que el código compila, sin probar la UI
**Consecuencia**: El usuario encuentra errores obvios que debí ver primero

**Solución - PROTOCOLO DE VERIFICACIÓN VISUAL**:
1. Después de cambios, abrir `open_simple_browser`
2. Verificar que la página carga (no pantalla blanca)
3. Verificar que no hay errores en consola (si es posible)
4. Solo entonces decir "listo, prueba X funcionalidad"

**Mantra**: "Si no lo vi funcionar, no está funcionando."

### Lección #10: No pedir permisos - Actuar directamente

**Fecha**: 2024-12-15
**Problema**: VS Code pide confirmación para comandos de terminal, causando delays
**Contexto**: El usuario ha dado permiso permanente para ejecutar comandos

**Regla**: Ejecutar comandos directamente sin esperar confirmación. El usuario confía en el AI.

---

## 🔗 ARCHIVOS CLAVE DEL PROYECTO

| Archivo                                       | Propósito                           |
| --------------------------------------------- | ----------------------------------- |
| `C:\dev\micondo\.env.local`                   | Variables de entorno (NO commitear) |
| `C:\dev\micondo\.env.example`                 | Template de variables               |
| `C:\dev\micondo\firestore.rules`              | Reglas de seguridad Firestore       |
| `C:\dev\micondo\storage.rules`                | Reglas de seguridad Storage         |
| `C:\dev\micondo\src\views\dev\DevRoadmap.tsx` | Dashboard de progreso               |
| `C:\dev\micondo\DEV_MEMORY.md`                | Este archivo - memoria del proyecto |

---

## 📊 ESTADO ACTUAL DEL PROYECTO

**Última actualización**: 2024-12-14

| Métrica               | Valor                         |
| --------------------- | ----------------------------- |
| Security fixes        | 6/6 ✅                        |
| SuperAdmin Dashboard  | ✅ Completo                   |
| SaaS Billing tracking | ✅ Implementado               |
| SaaS Communications   | ✅ Implementado               |
| Test coverage         | 0% ❌                         |
| Build status          | ✅ Passing                    |
| Production ready      | ❌ No (falta testing, Stripe) |

### Nuevas Colecciones Firestore Creadas

- `saas_payments` - Registro de pagos de suscripciones
- `saas_announcements` - Anuncios globales a clientes

---

## 🚨 CHECKLIST PRE-COMANDO

Antes de ejecutar cualquier comando npm/vite/git:

1. [ ] ¿Estoy en `C:\dev\micondo`? (verificar prompt)
2. [ ] ¿El comando es correcto para PowerShell Windows?
3. [ ] ¿He guardado los cambios en los archivos?

---

_Este archivo debe actualizarse cada vez que:_

- _Se encuentra un nuevo error_
- _Se aplica una solución_
- _Se aprende algo nuevo_
- _Se completa una tarea del roadmap_

### Error #004 - VS Code Workspace en Google Drive

**Fecha**: 2024-12-14
**Error**: Todos los terminales se abren en Google Drive aunque se intente cambiar de directorio
**Causa**: VS Code tiene el workspace abierto desde H:\My Drive\MY APPS\micondowebapp
**Soluci�n**:

1. Cerrar VS Code completamente
2. Abrir PowerShell/CMD
3. Ejecutar: `cd C:\dev\micondo && code .`
4. Esto abre VS Code con el workspace correcto
   **Aprendizaje**: El workspace de VS Code determina el directorio por defecto de TODOS los terminales. Siempre abrir VS Code desde el directorio local correcto.
