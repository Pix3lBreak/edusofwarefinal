# EduControl - Sistema Integral de Gestión Educativa

Plataforma integral para colegios, institutos y centros educativos con gestión de calificaciones, asistencias, horarios, pensiones, control de roles (Superadmin exclusivo, Directores, Docentes, Alumnos y Padres), y personalización de marca institucional.

---

## 🚀 Despliegue en Vercel

Este proyecto está 100% preparado y optimizado para **Vercel** (`vite` + React SPA con archivo `vercel.json` configurado).

### Opción 1: Despliegue con GitHub y Vercel Dashboard (Recomendado)

1. **Crear repositorio en GitHub:**
   - Descomprime este proyecto o clónalo.
   - Sube los archivos a un nuevo repositorio en tu cuenta de GitHub:
     ```bash
     git init
     git add .
     git commit -m "Initial commit - EduControl para Vercel"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/educontrol.git
     git push -u origin main
     ```

2. **Importar en Vercel:**
   - Entra a [https://vercel.com/new](https://vercel.com/new).
   - Conecta tu cuenta de GitHub y selecciona el repositorio `educontrol`.
   - Vercel detectará automáticamente el preset **Vite**.
   - Parámetros predeterminados (ya incluidos en `vercel.json`):
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`
   - Haz clic en **Deploy**.

---

### Opción 2: Despliegue directo mediante Vercel CLI

Si tienes Node.js instalado, puedes desplegar en 1 minuto desde tu terminal:

```bash
# 1. Instala Vercel CLI globalmente (si no lo tienes)
npm install -g vercel

# 2. Inicia sesión en Vercel
vercel login

# 3. Despliega a producción directamente desde la carpeta del proyecto
vercel --prod
```

Sigue las preguntas interactivas (Enter para aceptar los valores predeterminados de Vite).

---

## 🔐 Configuración Crítica de Firebase Auth para Vercel

Para que el **Inicio de Sesión con Google** funcione en tu dominio de Vercel:

1. Ve a la consola de Firebase: [https://console.firebase.google.com](https://console.firebase.google.com).
2. Selecciona el proyecto: `modified-metric-snm9t`.
3. Ve a **Authentication** > pestaña **Settings** (Configuración) > sección **Authorized domains** (Dominios autorizados).
4. Haz clic en **Add domain** (Agregar dominio) y añade tu dominio asignado por Vercel (por ejemplo, `educontrol.vercel.app` o tu dominio personalizado `colegio.edu.pe`).
5. ¡Listo! El botón de Google Identity funcionará perfectamente en producción.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:3000
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

---

## 🛡️ Credenciales de Superadmin

- **Super Administrador Principal:** `pixelglez1988@gmail.com`
- Rol permanente con control total para activar/desactivar cuentas de docentes y alumnos, personalizar la marca del colegio, colores institucionales y configurar el portal de login.
