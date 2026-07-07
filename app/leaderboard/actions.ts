"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createServerActionClient,
  type Comment,
  type Score,
} from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Validación de entrada
// ---------------------------------------------------------------------------

const GAME_NAMES = [
  "Snake",
  "Snake Classic",
  "Fruit Ninja",
  "Tetris",
  "Tetris Classic",
  "Pong",
  "Pong Retro",
] as const;

// Normaliza "Tetris Classic" -> "Tetris", "Pong Retro" -> "Pong", etc.
// para que la BD guarde siempre el mismo nombre por juego.
const normalizeGameName = (name: string) =>
  name.replace(/ Classic| Retro/g, "");

const userNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio.")
  .max(30, "El nombre no puede superar 30 caracteres.");

const commentSchema = z.object({
  user_name: userNameSchema,
  game_name: z.enum(GAME_NAMES),
  rating: z.coerce.number().int().min(1).max(5),
  comment_text: z
    .string()
    .trim()
    .min(1, "El comentario es obligatorio.")
    .max(500, "El comentario no puede superar 500 caracteres."),
});

const scoreSchema = z.object({
  user_name: userNameSchema,
  game_name: z.enum(GAME_NAMES),
  score: z.number().int().min(0).max(1_000_000),
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function addComment(formData: FormData) {
  const parsed = commentSchema.safeParse({
    user_name: formData.get("userName"),
    game_name: formData.get("selectedGame"),
    rating: formData.get("rating"),
    comment_text: formData.get("newComment"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  const supabase = createServerActionClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      ...parsed.data,
      game_name: normalizeGameName(parsed.data.game_name),
    })
    .select();

  if (error) {
    console.error("Error al insertar comentario:", error);
    return { success: false, message: "Error al publicar el comentario." };
  }

  revalidatePath("/leaderboard");
  return {
    success: true,
    message: "Comentario publicado con éxito.",
    comment: data[0] as Comment,
  };
}

export async function likeComment(commentId: string) {
  const parsedId = z.string().uuid().safeParse(commentId);
  if (!parsedId.success) {
    return { success: false, message: "Identificador no válido." };
  }

  const supabase = createServerActionClient();

  // Incremento atómico en la BD (función increment_likes, ver
  // scripts/create-tables.sql). Evita la race condition de leer y reescribir.
  const { error } = await supabase.rpc("increment_likes", {
    comment_id: parsedId.data,
  });

  if (error) {
    console.error("Error al dar like:", error);
    return { success: false, message: "Error al dar me gusta." };
  }

  revalidatePath("/leaderboard");
  return { success: true, message: "Me gusta añadido." };
}

export async function getComments(): Promise<Comment[]> {
  const supabase = createServerActionClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Error al obtener comentarios:", error);
    return [];
  }
  return comments as Comment[];
}

export async function saveScore(
  userName: string,
  gameName: string,
  score: number
) {
  const parsed = scoreSchema.safeParse({
    user_name: userName,
    game_name: gameName,
    score,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  const supabase = createServerActionClient();
  const { error } = await supabase.from("scores").insert({
    ...parsed.data,
    game_name: normalizeGameName(parsed.data.game_name),
  });

  if (error) {
    console.error("Error al guardar la puntuación:", error);
    return { success: false, message: "Error al guardar la puntuación." };
  }

  revalidatePath("/leaderboard");
  return { success: true, message: "Puntuación guardada con éxito." };
}

export async function getScores(): Promise<Score[]> {
  const supabase = createServerActionClient();
  const { data: scores, error } = await supabase
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error al obtener puntuaciones:", error);
    return [];
  }
  return scores as Score[];
}
