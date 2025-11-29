# 🏍️ Roncoroni Performance

Sistema de gestión de reparaciones de motos optimizado para dispositivos móviles.

## 🚀 Características

- ✅ **Autenticación segura** con Supabase
- 📱 **Diseño mobile-first** optimizado para celular
- 📝 **Gestión de reparaciones** con datos completos del cliente
- 📊 **Estadísticas en tiempo real**
- 💾 **Recordar credenciales** para acceso rápido
- 🔐 **Row Level Security** para protección de datos

## 📦 Tecnologías

- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** para estilos mobile-first
- **Supabase** para backend y autenticación
- **PostgreSQL** como base de datos

## 🛠️ Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/TomiRonco/roncoroni-performance.git
cd roncoroni-performance
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta el script `supabase-setup.sql`
4. Obtén tus credenciales en **Settings > API**

### 4. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` y agrega tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📱 Estructura de datos

### Tabla: `reparaciones`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `created_at` | TIMESTAMP | Fecha de creación |
| `nombre` | TEXT | Nombre del cliente |
| `apellido` | TEXT | Apellido del cliente |
| `celular` | TEXT | Número de celular |
| `marca` | TEXT | Marca de la moto |
| `cilindrada` | TEXT | Cilindrada de la moto |
| `observaciones` | TEXT | Notas adicionales |
| `user_id` | UUID | ID del usuario (FK) |

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado
- Los usuarios solo pueden ver/editar sus propias reparaciones
- Autenticación mediante Supabase Auth
- Políticas de seguridad a nivel de base de datos

## 📸 Capturas

### Login
- Autenticación segura
- Opción de recordar credenciales
- Registro de nuevos usuarios

### Dashboard
- Navegación entre Reparaciones y Estadísticas
- Diseño adaptativo para móvil

### Reparaciones
- Formulario completo de carga
- Lista de reparaciones realizadas
- Eliminación con confirmación

### Estadísticas
- Total de reparaciones
- Reparaciones por semana/mes
- Gráficos por marca y cilindrada
- Insights automáticos

## 🚀 Deploy

### Deploy en Vercel

```bash
npm run build
```

Luego sube el proyecto a Vercel y configura las variables de entorno.

### Deploy en Netlify

```bash
npm run build
```

Arrastra la carpeta `dist` a Netlify y configura las variables de entorno.

## 📝 Scripts disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar ESLint

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**Tomás Roncoroni**

- GitHub: [@TomiRonco](https://github.com/TomiRonco)

---

¡Hecho con ❤️ para la gestión eficiente de reparaciones de motos!

