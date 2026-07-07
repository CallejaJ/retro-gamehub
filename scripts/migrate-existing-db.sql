-- ============================================================================
-- Migración para bases de datos YA creadas con la versión anterior de
-- create-tables.sql. Ejecutar UNA VEZ en el SQL Editor de Supabase.
-- (Si creas el proyecto desde cero, usa solo create-tables.sql.)
-- ============================================================================

-- 1. Normalizar nombres de juego existentes ("Tetris Classic" -> "Tetris", etc.)
UPDATE comments SET game_name = replace(replace(game_name, ' Classic', ''), ' Retro', '');
UPDATE scores   SET game_name = replace(replace(game_name, ' Classic', ''), ' Retro', '');

-- 2. Constraints que la tabla antigua no tenía
ALTER TABLE comments
  ADD CONSTRAINT comments_user_name_len CHECK (char_length(user_name) BETWEEN 1 AND 30),
  ADD CONSTRAINT comments_game_name_chk CHECK (game_name IN ('Snake', 'Fruit Ninja', 'Tetris', 'Pong')),
  ADD CONSTRAINT comments_text_len CHECK (char_length(comment_text) BETWEEN 1 AND 500);

ALTER TABLE comments ALTER COLUMN likes SET NOT NULL;

ALTER TABLE scores
  ADD CONSTRAINT scores_user_name_len CHECK (char_length(user_name) BETWEEN 1 AND 30),
  ADD CONSTRAINT scores_game_name_chk CHECK (game_name IN ('Snake', 'Fruit Ninja', 'Tetris', 'Pong')),
  ADD CONSTRAINT scores_score_range CHECK (score >= 0 AND score <= 1000000);

-- 3. RLS, políticas nuevas y función de likes: ejecutar después la sección
--    "Row Level Security" y "Likes atómicos" de create-tables.sql
--    (es idempotente, se puede lanzar entera sin peligro).
