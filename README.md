# Retro GameHub

<div align="center">
    <img src="https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/License-GPLv3-A42E2B?style=for-the-badge&logo=gnu" alt="License" />
    <img src="https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel" alt="Deployment" />
</div>

<p align="center">
    <i>Plataforma web de minijuegos retro con puntuaciones globales y comentarios, construida sobre Next.js y Supabase.</i>
</p>

## Juegos Disponibles

Cada juego vive en su propia ruta bajo `app/games/[nombre]` con lógica de estado en un hook dedicado (`hooks/use-*.ts`) y controles adaptados a teclado y a pantalla táctil.

| Juego | Categoría | Dificultad | Controles Desktop | Controles Móvil |
|---|---|---|---|---|
| **Snake Classic** | Arcade | Fácil | Flechas del teclado | Controles direccionales táctiles |
| **Fruit Ninja** | Acción | Medio | Movimiento del ratón | Gestos de corte táctiles |
| **Tetris Classic** | Puzzle | Medio | Flechas + barra espaciadora | Gestos táctiles (deslizar y tocar) |
| **Pong Retro** | Clásico | Fácil | Flechas arriba/abajo | Botones direccionales |

## Sistema de Puntuaciones y Comentarios

Al finalizar una partida, `components/score-modal.tsx` permite guardar el nombre del jugador, la puntuación y, opcionalmente, un comentario con valoración de 1 a 5. Las escrituras se hacen sin autenticación de usuario: la app usa la `anon key` de Supabase y delega la seguridad en políticas de Row Level Security y en los `CHECK constraints` de las tablas (longitud de texto, rango de rating, rango de score).

| Elemento | Descripción |
|---|---|
| **Guardado de puntuación** | Inserción directa en la tabla `scores`, sin límite de intentos por partida |
| **Comentarios** | Texto de 1 a 500 caracteres asociado a un juego (`game_name`) y una valoración de 1 a 5 |
| **Likes** | Incremento atómico vía la función `increment_likes`, evitando condiciones de carrera en lecturas concurrentes |
| **Leaderboard** | `app/leaderboard/page.tsx` consulta `scores` ordenadas por puntuación descendente usando el índice `idx_scores_score` |

## Seguridad de Datos

La aplicación no implementa autenticación de usuarios ni roles: cualquier visitante puede leer y escribir en `comments` y `scores`. La protección se apoya enteramente en la base de datos, no en el cliente.

| Mecanismo | Función |
|---|---|
| **Row Level Security** | Habilitada en `comments` y `scores`, con políticas de `SELECT` e `INSERT` públicas |
| **Ausencia de políticas UPDATE/DELETE** | Ninguna fila puede modificarse o borrarse con la `anon key` una vez insertada |
| **CHECK constraints** | Limitan longitud de nombre y comentario, rango de `rating` (1-5) y rango de `score` (0-1,000,000) |
| **Función SECURITY DEFINER** | `increment_likes` es la única vía para modificar `likes`, evitando que la anon key tenga permiso de `UPDATE` directo |
| **Service role key** | Nunca se usa en el código de la aplicación, solo está prevista para tareas administrativas fuera del cliente |

## System Architecture

| Component | Role |
|---|---|
| **Next.js App Router** | Renderiza páginas y server actions bajo `app/`, incluyendo las rutas de cada juego y el leaderboard |
| **React Hooks (`hooks/use-*.ts`)** | Encapsulan la lógica de estado y el bucle de juego de cada minijuego |
| **Supabase Client (`lib/supabase.ts`)** | Expone clientes tipados para componentes cliente y server actions, validando las variables de entorno al arrancar |
| **PostgreSQL (Supabase)** | Almacena `comments` y `scores`, con RLS, índices y la función `increment_likes` |
| **shadcn/ui + Radix** | Componentes de interfaz (`Dialog`, `Card`, `Badge`, `Button`, `Input`, `Textarea`) usados en el modal de puntuación y el leaderboard |
| **Vercel Analytics** | Recolecta métricas de uso vía `@vercel/analytics` |
| **Vercel** | Plataforma de build y despliegue |

## Technology Stack

| Categoría | Herramientas |
|---|---|
| **Frontend** | Next.js 15.2, React 19, TypeScript 5 |
| **Estilos** | Tailwind CSS 4.1, `tailwind-merge`, `class-variance-authority` |
| **Componentes UI** | shadcn/ui, Radix UI (`Dialog`, `Slot`), Lucide React |
| **Backend / Datos** | Supabase (`@supabase/supabase-js`), PostgreSQL, Row Level Security |
| **Validación** | Zod |
| **Analítica** | Vercel Analytics |
| **Herramientas de desarrollo** | ESLint, PostCSS |
| **Despliegue** | Vercel |

## Key Features

1. **Cuatro minijuegos retro** — Snake, Fruit Ninja, Tetris y Pong reimplementados con controles nativos de teclado y táctiles.
2. **Leaderboard global** — puntuaciones persistidas en Supabase y ordenadas por índice para consultas rápidas.
3. **Comentarios con valoración** — sistema de rating de 1 a 5 con contador de likes atómico vía función `SECURITY DEFINER`.
4. **Seguridad sin autenticación** — RLS y `CHECK constraints` protegen los datos sin necesitar login de usuario.
5. **Diseño mobile-first** — controles táctiles dedicados por juego (deslizar, tocar, mantener) sin depender de scroll.
6. **Migraciones versionadas** — `scripts/create-tables.sql` y `scripts/migrate-existing-db.sql` documentan y reproducen el esquema.

## Testing Strategy

El proyecto no incluye un framework de pruebas automatizadas configurado en `package.json`. La verificación es manual y exploratoria: cada hook de juego (`use-snake`, `use-tetris`, `use-pong`, `use-fruit-ninja`) se prueba jugando partidas completas en desktop y en dispositivo táctil antes de cada release, y los cambios de esquema se validan ejecutando `scripts/create-tables.sql` contra una instancia de Supabase de prueba. Antes de desplegar a producción se revisa manualmente que las políticas de RLS bloqueen escrituras fuera de los `CHECK constraints` esperados.

## Project Setup

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear `.env.local`:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Crear el esquema de base de datos ejecutando `scripts/create-tables.sql` en el editor SQL de Supabase.

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Visitar `http://localhost:3000`

---

Built for Vercel.
