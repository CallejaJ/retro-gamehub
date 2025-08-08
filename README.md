# 🎮 GameHub: Juegos retro en Línea

¡Bienvenido a **Retro-GameHub**! Una plataforma interactiva desarrollada con Next.js que te permite disfrutar de una colección de juegos clásicos directamente en tu navegador. Sin descargas, sin instalaciones, solo diversión pura.

Este proyecto está diseñado pensando en la comunidad, ofreciendo una experiencia de juego fluida y responsiva, junto con funcionalidades sociales como rankings y comentarios persistentes.

## ✨ Características Principales

- **Landing Page Atractiva**: Una página de inicio moderna y responsiva con un diseño vibrante.
- **Colección de Juegos Clásicos**: Juega versiones de Snake, Fruit Ninja, Tetris y Pong.
- **Interfaz de Usuario Intuitiva**: Diseño amigable y adaptable a dispositivos móviles y de escritorio.
- **Sistema de Puntuación Persistente**: Registra tus mejores puntuaciones con Supabase.
- **Tabla de Líderes Global**: Compite con otros jugadores y ve quién es el mejor.
- **Sección de Comentarios**: Deja tus opiniones y califica los juegos, e interactúa con otros usuarios.
- **Filtros de Contenido**: Filtra la tabla de líderes y los comentarios por juego.
- **Base de Datos en Tiempo Real**: Powered by Supabase para sincronización instantánea.

## 🕹️ Juegos Incluidos

### 🐍 Snake Classic

El eterno clásico donde controlas una serpiente que crece al comer frutas. ¡Evita chocar contigo mismo o con las paredes!

- **Controles**: Flechas del teclado.
- **Mecánica**: Crece, evita colisiones.

### 🗡️ Fruit Ninja

Demuestra tus habilidades ninja cortando frutas que vuelan por la pantalla. ¡Cuidado con las bombas!

- **Controles**: Movimiento del mouse para cortar.
- **Mecánica**: Corta frutas, evita bombas, no dejes caer frutas.

### 🧱 Tetris Classic

El icónico juego de puzzle donde debes organizar piezas que caen para formar líneas completas.

- **Controles**: Flechas del teclado (mover, caída rápida), Espacio (rotar).
- **Mecánica**: Elimina líneas, sube de nivel, evita que las piezas lleguen al tope.

### 🏓 Pong Retro

El primer videojuego de la historia. Controla tu paleta y compite contra una IA para ver quién anota 10 puntos primero.

- **Controles**: Flechas arriba/abajo para mover la paleta.
- **Mecánica**: Rebota la pelota, anota puntos, la pelota acelera con cada golpe.

## 🚀 Tecnologías Utilizadas

- **Next.js**: Framework de React para aplicaciones web de alto rendimiento.
- **React**: Biblioteca de JavaScript para construir interfaces de usuario.
- **Tailwind CSS**: Framework CSS para un desarrollo rápido y altamente personalizable.
- **Shadcn/ui**: Componentes UI reutilizables y accesibles.
- **Lucide React**: Colección de iconos.
- **Supabase**: Base de datos PostgreSQL como servicio para persistencia en tiempo real.

## ⚙️ Instalación y Uso

Sigue estos pasos para tener el proyecto funcionando en tu máquina local:

### Prerrequisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/es/) (versión 18.x o superior) y [npm](https://www.npmjs.com/) (o [Yarn](https://yarnpkg.com/)).

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/gamehub.git
cd gamehub
```

### 2. Instalar Dependencias

```bash
npm install
# o si usas yarn
yarn install
```

### 3. Configurar Supabase

1. **Crear un proyecto en [Supabase](https://supabase.com/)**
2. **Obtener las credenciales** del proyecto (URL y anon key)
3. **Crear un archivo `.env.local`** en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Ejecutar las migraciones SQL** en el editor SQL de Supabase:

```sql
-- Tabla de juegos
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de jugadores/usuarios
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de puntuaciones/records
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  level_reached INTEGER DEFAULT 1,
  time_played INTEGER, -- en segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de comentarios y reseñas
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales de juegos
INSERT INTO games (id, title, description, category, difficulty) VALUES
('snake', 'Snake Classic', 'El clásico juego de la serpiente', 'Arcade', 'Fácil'),
('fruit-ninja', 'Fruit Ninja', 'Corta frutas volando con tu espada ninja', 'Acción', 'Medio'),
('tetris', 'Tetris Classic', 'Organiza las piezas que caen', 'Puzzle', 'Medio'),
('pong', 'Pong Retro', 'El primer videojuego de la historia', 'Clásico', 'Fácil');
```

### 4. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
# o si usas yarn
yarn dev
```

Esto iniciará la aplicación en modo de desarrollo. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### 5. Construir para Producción

```bash
npm run build
# o si usas yarn
yarn build
```

### 6. Iniciar en Modo Producción

```bash
npm start
# o si usas yarn
yarn start
```

## 🗄️ Base de Datos

La aplicación utiliza **Supabase** como backend para almacenar:

- **Puntuaciones de jugadores**: Records y estadísticas de cada juego
- **Comentarios y reseñas**: Opiniones y calificaciones de usuarios
- **Perfiles de usuario**: Información básica de jugadores
- **Datos de juegos**: Metadatos de cada juego disponible

### Funcionalidades en Tiempo Real

- **Leaderboard dinámico**: Se actualiza automáticamente cuando otros jugadores suben nuevas puntuaciones
- **Comentarios instantáneos**: Los nuevos comentarios aparecen sin necesidad de recargar
- **Sincronización automática**: Los datos se mantienen consistentes entre dispositivos

## 📊 Variables de Entorno

Asegúrate de configurar las siguientes variables en tu archivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si tienes ideas para nuevos juegos, mejoras de rendimiento, correcciones de errores o nuevas características, no dudes en:

1. Hacer un `fork` del repositorio.
2. Crear una nueva rama (`git checkout -b feature/nueva-caracteristica`).
3. Realizar tus cambios y hacer `commit` (`git commit -m 'feat: Añadir nueva característica'`).
4. Hacer `push` a tu rama (`git push origin feature/nueva-caracteristica`).
5. Abrir un `Pull Request`.

Por favor, asegúrate de que tu código siga las convenciones de estilo del proyecto y que todas las pruebas pasen.

## 🔒 Seguridad

- Las políticas de seguridad (RLS) de Supabase están configuradas para proteger los datos de usuarios
- Las claves API están configuradas como variables de entorno
- Los datos sensibles nunca se exponen en el frontend

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

¡Esperamos que disfrutes jugando y contribuyendo a **Retro-GameHub**! Si tienes alguna pregunta o sugerencia, no dudes en abrir un `issue`.
