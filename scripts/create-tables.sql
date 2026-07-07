-- ============================================================================
-- Esquema de base de datos de Retro GameHub
-- La app no tiene autenticación de usuarios: las escrituras se hacen con la
-- anon key y la seguridad se apoya en RLS + constraints. La service role key
-- no se usa en el código de la aplicación.
-- ============================================================================

-- Tabla para comentarios
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL CHECK (char_length(user_name) BETWEEN 1 AND 30),
  game_name TEXT NOT NULL CHECK (game_name IN ('Snake', 'Fruit Ninja', 'Tetris', 'Pong')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment_text TEXT NOT NULL CHECK (char_length(comment_text) BETWEEN 1 AND 500),
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para puntuaciones
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL CHECK (char_length(user_name) BETWEEN 1 AND 30),
  game_name TEXT NOT NULL CHECK (game_name IN ('Snake', 'Fruit Ninja', 'Tetris', 'Pong')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para las consultas del leaderboard
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores (score DESC);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at DESC);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Lectura pública de ambas tablas
DROP POLICY IF EXISTS "Public comments are viewable by everyone." ON comments;
DROP POLICY IF EXISTS "comments_select_public" ON comments;
CREATE POLICY "comments_select_public"
  ON comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "scores_select_public" ON scores;
CREATE POLICY "scores_select_public"
  ON scores FOR SELECT
  USING (true);

-- Inserción pública (la app no tiene auth). Los CHECK de las columnas
-- limitan longitud, rango de rating y de score. Sin políticas de UPDATE
-- ni DELETE: nadie puede modificar o borrar filas con la anon key.
DROP POLICY IF EXISTS "Authenticated users can insert comments." ON comments;
DROP POLICY IF EXISTS "Users can update their own comments." ON comments;
DROP POLICY IF EXISTS "comments_insert_public" ON comments;
CREATE POLICY "comments_insert_public"
  ON comments FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "scores_insert_public" ON scores;
CREATE POLICY "scores_insert_public"
  ON scores FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Likes atómicos
-- Los likes no se actualizan vía UPDATE directo (no hay política que lo
-- permita), sino a través de esta función SECURITY DEFINER que solo puede
-- incrementar el contador en 1. Elimina además la race condition de
-- leer-y-reescribir.
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_likes(comment_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE comments SET likes = likes + 1 WHERE id = comment_id;
$$;

REVOKE ALL ON FUNCTION increment_likes(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_likes(UUID) TO anon, authenticated;
