"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function addComment(formData: FormData) {
  const supabase = createServerActionClient();
  const user_name = formData.get("userName") as string;
  const game_name = formData.get("selectedGame") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment_text = formData.get("newComment") as string;

  if (!user_name || !game_name || !comment_text || isNaN(rating)) {
    return { success: false, message: "Todos los campos son obligatorios." };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ user_name, game_name, rating, comment_text })
    .select();

  if (error) {
    console.error("Error al insertar comentario:", error);
    return { success: false, message: "Error al publicar el comentario." };
  }

  revalidatePath("/leaderboard"); // Revalida la página para mostrar el nuevo comentario
  return {
    success: true,
    message: "Comentario publicado con éxito.",
    comment: data[0],
  };
}

export async function likeComment(commentId: string) {
  const supabase = createServerActionClient();

  // Obtener el número actual de likes para incrementarlo
  const { data: currentLikesData, error: fetchError } = await supabase
    .from("comments")
    .select("likes")
    .eq("id", commentId)
    .single();

  if (fetchError || !currentLikesData) {
    console.error("Error al obtener likes actuales:", fetchError);
    return { success: false, message: "Error al dar me gusta." };
  }

  const newLikes = currentLikesData.likes + 1;

  const { data, error } = await supabase
    .from("comments")
    .update({ likes: newLikes })
    .eq("id", commentId)
    .select();

  if (error) {
    console.error("Error al dar like:", error);
    return { success: false, message: "Error al dar me gusta." };
  }

  revalidatePath("/leaderboard"); // Revalida la página para actualizar los likes
  return { success: true, message: "Me gusta añadido." };
}

// Función para obtener comentarios (puede ser llamada desde el cliente o servidor)
export async function getComments() {
  const supabase = createServerActionClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener comentarios:", error);
    return [];
  }
  return comments;
}

// NUEVA FUNCIÓN: Guardar puntuación
export async function saveScore(
  userName: string,
  gameName: string,
  score: number
) {
  const supabase = createServerActionClient();

  if (!userName || !gameName || isNaN(score)) {
    return {
      success: false,
      message: "Nombre de usuario, juego y puntuación son obligatorios.",
    };
  }

  const { data, error } = await supabase
    .from("scores")
    .insert({ user_name: userName, game_name: gameName, score: score })
    .select();

  if (error) {
    console.error("Error al guardar la puntuación:", error);
    return { success: false, message: "Error al guardar la puntuación." };
  }

  revalidatePath("/leaderboard"); // Revalida la página para actualizar el ranking
  return { success: true, message: "Puntuación guardada con éxito." };
}

// NUEVA FUNCIÓN: Obtener puntuaciones
export async function getScores() {
  const supabase = createServerActionClient();
  const { data: scores, error } = await supabase
    .from("scores")
    .select("*")
    .order("score", { ascending: false }) // Ordenar por puntuación de mayor a menor
    .limit(100); // Limitar a los 100 mejores, por ejemplo

  if (error) {
    console.error("Error al obtener puntuaciones:", error);
    return [];
  }
  return scores;
}
