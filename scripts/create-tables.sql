-- Tabla para comentarios
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  game_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment_text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para puntuaciones (ejemplo, necesitarías integrar esto en cada juego)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  game_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Habilitar Row Level Security (RLS) para la tabla de comentarios
-- Esto es crucial para la seguridad en producción.
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (ejemplos básicos, ajusta según tus necesidades de seguridad)
-- Permitir que todos lean los comentarios
CREATE POLICY "Public comments are viewable by everyone."
  ON comments FOR SELECT
  USING (true);

-- Permitir que los usuarios autenticados inserten comentarios
-- Si no tienes autenticación de usuarios, puedes permitir que todos inserten,
-- pero ten cuidado con el spam.
CREATE POLICY "Authenticated users can insert comments."
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL); -- Requiere que el usuario esté autenticado

-- Si quieres permitir que cualquiera inserte sin autenticación (menos seguro):
-- CREATE POLICY "Anyone can insert comments."
--   ON comments FOR INSERT
--   WITH CHECK (true);

-- Permitir que los usuarios actualicen sus propios comentarios (ej. likes)
CREATE POLICY "Users can update their own comments."
  ON comments FOR UPDATE
  USING (auth.uid() = (SELECT id FROM auth.users WHERE email = user_name)); -- Esto asume que user_name es el email del usuario, ajusta si usas IDs.
  -- Una política más simple para likes públicos:
  -- USING (true);
