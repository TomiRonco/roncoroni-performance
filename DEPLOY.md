# 🚀 Deploy en Vercel - Roncoroni Performance

## Pasos para deployar en Vercel

### 1. Preparar el repositorio (Ya hecho ✅)

El repositorio ya está configurado correctamente.

### 2. Importar el proyecto en Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **"Add New"** → **"Project"**
3. Importa tu repositorio de GitHub: `TomiRonco/roncoroni-performance`

### 3. Configurar las variables de entorno en Vercel

**¡MUY IMPORTANTE!** Antes de hacer deploy, configura estas variables:

En la sección **Environment Variables**, agrega:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 4. Configuración de Build (debería detectarse automáticamente)

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy

Haz clic en **"Deploy"** y espera a que termine el build.

## 📝 Notas importantes

- ✅ El archivo `.env` NO se sube a git (está en .gitignore)
- ✅ Debes configurar las variables de entorno directamente en Vercel
- ✅ Cada push a la rama `main` generará un nuevo deploy automáticamente
- ✅ Vercel te dará una URL como: `https://tu-proyecto.vercel.app`

## 🔧 Solución de problemas

### Error: "Build failed"
- Verifica que las variables de entorno estén configuradas
- Revisa los logs de build en Vercel

### Error: "Cannot connect to Supabase"
- Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctamente configuradas en Vercel
- Asegúrate de que tu proyecto de Supabase esté activo

### Error: "Module not found"
- Ejecuta `npm install` localmente para verificar que todas las dependencias estén en package.json
- Verifica que package-lock.json esté en el repositorio

## 🔄 Redeploy después de cambios

Cada vez que hagas push a GitHub, Vercel desplegará automáticamente:

```bash
git add .
git commit -m "tu mensaje"
git push
```

## 🌐 Configurar dominio personalizado (Opcional)

1. En el dashboard de Vercel, ve a tu proyecto
2. Settings → Domains
3. Agrega tu dominio personalizado

---

¿Necesitas ayuda? Revisa la [documentación de Vercel](https://vercel.com/docs)
