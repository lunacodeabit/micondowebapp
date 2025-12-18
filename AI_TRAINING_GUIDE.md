# 🤖 MI CONDO - Guía de Entrenamiento para AI

> **Propósito**: Este documento contiene TODO lo necesario para que otro AI continúe el desarrollo de MI CONDO exactamente donde lo dejamos.

---

## 📋 RESUMEN EJECUTIVO

**MI CONDO** es una plataforma SaaS de administración de condominios para República Dominicana.

- **Stack**: React 18 + TypeScript + Vite + Firebase + Tailwind CSS
- **Repositorio**: https://github.com/lunacodeabit/micondowebapp.git
- **Directorio local**: `C:\dev\micondo` (NUNCA usar Google Drive)
- **Último commit**: `8b0a351` (17 Dic 2024)

---

## 🤝 ROL DEL AI: PARTNER DE NEGOCIO

**CRÍTICO**: No eres solo un asistente. Eres un **partner** con opinión.

### Tus Responsabilidades

1. **Dar opiniones de negocio** - Si algo no conviene, DEBES decirlo
2. **Sugerir alternativas** - No solo problemas, también soluciones
3. **Pensar a largo plazo** - Escalabilidad, UX, mantenimiento
4. **Ser proactivo** - Anticipar problemas
5. **Usar formato de opinión**:

```
🤔 OPINIÓN DE PARTNER:
[Tu perspectiva]

💡 SUGERENCIA:
[Alternativa mejor]

📊 RAZÓN:
[Por qué es mejor para el negocio]
```

---

## 🎯 ESTADO ACTUAL DEL PROYECTO (17 Dic 2024)

### ✅ COMPLETADO

| Feature | Estado | Notas |
|---------|--------|-------|
| Security fixes | ✅ 6/6 | Env vars, rules |
| SuperAdmin Dashboard | ✅ | UI moderna, glassmorphism |
| Sistema de Planes | ✅ | 5 tiers (Trial→Enterprise) |
| Sistema de Addons | ✅ | SMS, Multi-user, Storage, Support |
| Auto-cálculo de precios | ✅ | Base + addons dinámico |
| Activity Panel | ✅ | Historial de cambios |
| Modal Premium | ✅ | Glassmorphism + animaciones |
| Billing Portal | ✅ | Historial, PDFs |
| Grace Period | ✅ | Estados automáticos |

### ❌ PENDIENTE (Roadmap)

| Feature | Prioridad | Descripción |
|---------|-----------|-------------|
| Testing Framework | ALTA | Vitest, unit tests |
| Stripe Integration | ALTA | Pagos automáticos |
| Email Service | MEDIA | SendGrid/AWS SES para notificaciones |
| SMS Integration | MEDIA | Twilio para WhatsApp/SMS addon |
| Push Notifications | BAJA | Web push |
| Mobile App | BAJA | React Native |

---

## 💰 MODELO DE PRECIOS IMPLEMENTADO

### Planes Base (por condo/mes)

| Plan | Condos | RD$/mes | Auto-adjust |
|------|--------|---------|-------------|
| Trial | Ilimitado | GRATIS | 14 días |
| Starter | 1 | 1,500 | min: 1 |
| Growth | 2-4 | 1,200 | min: 2 |
| Pro | 5-9 | 1,000 | min: 5 |
| Enterprise | 10+ | 800 | min: 10 |

### Addons Disponibles

| Addon | RD$/mes | Descripción |
|-------|---------|-------------|
| SMS/WhatsApp | 500 | Notificaciones automáticas |
| Multi-usuario | 500 | Usuarios adicionales |
| Almacenamiento Extra | 300 | +50GB storage |
| Soporte Prioritario | 2,000 | 24/7, respuesta rápida |

### Fórmula de Cálculo

```typescript
monthlyFee = (condoCount * pricePerCondo) + sumOfActiveAddons
```

---

## 🏗️ ARQUITECTURA

### Estructura de Carpetas

```
C:\dev\micondo/
├── src/
│   ├── App.tsx                 # Router principal
│   ├── main.tsx               # Entry point
│   ├── firebaseConfig.ts      # Config Firebase
│   │
│   ├── components/
│   │   ├── ui/                # Componentes reutilizables
│   │   │   ├── Modal.tsx      # Modal premium (glassmorphism)
│   │   │   ├── KpiCard.tsx    # Cards de métricas
│   │   │   ├── Spinner.tsx    # Loading
│   │   │   └── ...
│   │   └── forms/
│   │       └── FormCommon.tsx # Estilos comunes de forms
│   │
│   ├── context/
│   │   ├── AuthContext.tsx    # Autenticación + roles
│   │   ├── CondoContext.tsx   # Datos del condo actual
│   │   └── ToastContext.tsx   # Notificaciones
│   │
│   ├── types/
│   │   └── index.ts           # TODOS los tipos TypeScript
│   │
│   ├── utils/
│   │   ├── billing.ts         # Cálculos de facturación
│   │   ├── date.ts            # Helpers de fecha
│   │   ├── finance.ts         # Cálculos financieros
│   │   └── pdf.ts             # Generación de PDFs
│   │
│   └── views/
│       ├── admin/             # Portal de Administración
│       │   ├── SuperAdminDashboard.tsx  # ⭐ Panel SuperAdmin
│       │   ├── Dashboard.tsx            # Dashboard admin normal
│       │   └── tabs/                    # Tabs del admin
│       │
│       ├── resident/          # Portal de Residentes
│       │   └── ...
│       │
│       └── auth/              # Login/Loading
│           └── ...
│
├── DEV_MEMORY.md              # ⭐ Memoria del proyecto
├── AI_TRAINING_GUIDE.md       # ⭐ Este archivo
├── firestore.rules            # Reglas Firestore
├── storage.rules              # Reglas Storage
└── .env.local                 # Variables de entorno (NO en git)
```

### Colecciones Firestore

| Colección | Propósito |
|-----------|-----------|
| `companies` | Empresas/clientes del SaaS |
| `condos` | Condominios por compañía |
| `users` | Usuarios (vinculados a company) |
| `units` | Unidades/apartamentos |
| `transactions` | Transacciones financieras |
| `saas_payments` | Pagos de suscripción |
| `saas_announcements` | Anuncios globales |
| `activity_events` | Historial de cambios |

### Roles de Usuario

| Rol | Acceso |
|-----|--------|
| `superadmin` | TODO el sistema, gestión de clientes |
| `admin` | Dashboard de su compañía |
| `resident` | Portal de residente |

---

## 🔧 CONFIGURACIÓN DEL ENTORNO

### Requisitos

- Node.js 18+
- npm 9+
- Git
- VS Code (recomendado)

### Setup Inicial

```bash
# Clonar repo
git clone https://github.com/lunacodeabit/micondowebapp.git C:\dev\micondo
cd C:\dev\micondo

# Instalar dependencias
npm install

# Crear .env.local (copiar de .env.example)
# Llenar con valores reales de Firebase

# Iniciar servidor
npm run dev
# → http://localhost:3000
```

### Variables de Entorno (.env.local)

```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_SUPER_ADMIN_UID=xxx
```

---

## ⚠️ REGLAS CRÍTICAS

### 1. DIRECTORIO CORRECTO

```
✅ CORRECTO: C:\dev\micondo
❌ INCORRECTO: H:\My Drive\... (Google Drive)
```

### 2. ANTES DE CUALQUIER COMANDO

```powershell
cd C:\dev\micondo
```

### 3. PROTOCOLO DE VERIFICACIÓN

Después de cada cambio de código:

1. `npx tsc --noEmit` - Verificar TypeScript
2. `get_errors` - Verificar errores
3. Verificar servidor corriendo
4. Probar en browser
5. SOLO ENTONCES decir "listo"

### 4. TAREAS GRANDES

- SIEMPRE usar todo list
- Dividir en sub-tareas de 15-20 min
- Marcar completed al terminar cada una
- NO hacer más de 3 archivos a la vez

### 5. GIT COMMITS

Después de cada feature completa:

```bash
git add -A
git commit -m "feat: descripción clara"
git push origin main
```

---

## 🎨 ESTILOS Y UI

### Tema

- **Fondo**: Dark (slate-900, slate-800)
- **Acentos**: Cyan, Blue, Purple gradients
- **Efecto**: Glassmorphism con backdrop-blur
- **Bordes**: Gradient borders con opacity

### Componentes Clave

- `Modal.tsx` - Modal premium con glassmorphism
- `KpiCard.tsx` - Cards de métricas con iconos
- Todos los forms usan estilos de `FormCommon.tsx`

---

## 📞 PRÓXIMOS PASOS SUGERIDOS

### Corto Plazo (Enero 2025)

1. **Testing** - Implementar Vitest con tests para utils/
2. **Stripe** - Integrar pagos automáticos
3. **Email** - SendGrid para notificaciones de pago

### Mediano Plazo (Q1 2025)

4. **SMS Addon** - Integrar Twilio
5. **Reportes** - Más reportes financieros
6. **UI Polish** - Consistencia en todos los portales

### Largo Plazo (Q2 2025)

7. **Mobile App** - React Native
8. **Marketplace** - Proveedores de servicios
9. **IA Features** - Chatbot de soporte

---

## 📁 ARCHIVOS DE REFERENCIA

| Archivo | Propósito | Prioridad |
|---------|-----------|-----------|
| `DEV_MEMORY.md` | Memoria del proyecto, errores, lecciones | ⭐⭐⭐ |
| `AI_TRAINING_GUIDE.md` | Este archivo - visión general | ⭐⭐⭐ |
| `src/types/index.ts` | Todos los tipos TypeScript | ⭐⭐ |
| `src/views/admin/SuperAdminDashboard.tsx` | Panel principal SuperAdmin | ⭐⭐ |
| `firestore.rules` | Reglas de seguridad | ⭐ |

---

## 💬 INSTRUCCIONES PARA NUEVO AI

1. **Lee primero** `DEV_MEMORY.md` completamente
2. **Verifica** el directorio: `cd C:\dev\micondo`
3. **Ejecuta** `git pull` para tener últimos cambios
4. **Inicia** servidor: `npm run dev`
5. **Pregunta** al usuario qué feature quiere trabajar
6. **Usa** todo list para tareas multi-paso
7. **Verifica** antes de decir "listo"
8. **Commit** después de cada feature

### Frase de Inicio Sugerida

> "¡Hola! Soy tu nuevo partner para MI CONDO. He leído la documentación y estoy listo para continuar. El proyecto está en buen estado - el último commit fue el sistema de planes/addons. ¿En qué feature te gustaría trabajar hoy?"

---

**Creado**: 18 Diciembre 2024
**Autor**: AI Partner (Claude/Copilot)
**Para**: Continuidad del desarrollo de MI CONDO
