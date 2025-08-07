"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { addComment, likeComment, getComments, getScores } from "./actions"; // Importar getScores
import { Footer } from "@/components/footer"; // Importar el componente Footer

const leaderboardData = [
  {
    rank: 1,
    name: "NinjaGamer",
    game: "Fruit Ninja",
    score: 2450,
    avatar: "🥷",
    date: "2024-01-20",
  },
  {
    rank: 2,
    name: "SnakeMaster",
    game: "Snake",
    score: 1890,
    avatar: "🐍",
    date: "2024-01-19",
  },
  {
    rank: 3,
    name: "FruitSlayer",
    game: "Fruit Ninja",
    score: 1750,
    avatar: "🗡️",
    date: "2024-01-18",
  },
  {
    rank: 4,
    name: "RetroKing",
    game: "Snake",
    score: 1650,
    avatar: "👑",
    date: "2024-01-17",
  },
  {
    rank: 5,
    name: "BlockBuster",
    game: "Tetris",
    score: 1500,
    avatar: "🧱",
    date: "2024-01-16",
  },
  {
    rank: 6,
    name: "PongChamp",
    game: "Pong",
    score: 1200,
    avatar: "🏓",
    date: "2024-01-15",
  },
  {
    rank: 7,
    name: "ArcadeHero",
    game: "Snake",
    score: 1100,
    avatar: "🎮",
    date: "2024-01-14",
  },
  {
    rank: 8,
    name: "FruitNinja",
    game: "Fruit Ninja",
    score: 980,
    avatar: "🥋",
    date: "2024-01-13",
  },
  {
    rank: 9,
    name: "TetrisLord",
    game: "Tetris",
    score: 950,
    avatar: "🎯",
    date: "2024-01-12",
  },
  {
    rank: 10,
    name: "ClassicGamer",
    game: "Pong",
    score: 800,
    avatar: "🕹️",
    date: "2024-01-11",
  },
];

export default function LeaderboardPage() {
  const [comments, setComments] = useState<any[]>([]); // Estado para los comentarios cargados
  const [scores, setScores] = useState<any[]>([]); // Nuevo estado para las puntuaciones
  const [newCommentText, setNewCommentText] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedGame, setSelectedGame] = useState("Snake");
  const [rating, setRating] = useState(5);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const fetchedComments = await getComments();
      setComments(fetchedComments);
      const fetchedScores = await getScores(); // Cargar puntuaciones
      setScores(fetchedScores);
    };
    fetchData();
  }, [selectedFilter]); // Re-fetch cuando se cambia el filtro

  const handleSubmitComment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault(); // Prevenir el envío por defecto del formulario
    const formData = new FormData(event.currentTarget);
    formData.append("userName", userName);
    formData.append("selectedGame", selectedGame);
    formData.append("rating", rating.toString());
    formData.append("newComment", newCommentText);

    const response = await addComment(formData);
    if (response.success) {
      // No es necesario añadirlo al estado local, revalidatePath se encargará de recargar
      // pero para una actualización más rápida en el cliente, puedes añadirlo si la acción devuelve el comentario completo
      // setComments([response.comment, ...comments])
    }
    setNewCommentText("");
    setUserName("");
    setRating(5);
  };

  const handleLikeComment = async (commentId: string) => {
    const response = await likeComment(commentId);
    if (response.success) {
      // No es necesario actualizar el estado local, revalidatePath se encargará
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='h-6 w-6 text-yellow-400' />;
      case 2:
        return <Medal className='h-6 w-6 text-gray-400' />;
      case 3:
        return <Award className='h-6 w-6 text-amber-600' />;
      default:
        return <span className='text-lg font-bold text-white/60'>#{rank}</span>;
    }
  };

  const getGameColor = (game: string) => {
    switch (game) {
      case "Snake":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Fruit Ninja":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Tetris":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Pong":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const filteredLeaderboard =
    selectedFilter === "all"
      ? scores // Usar las puntuaciones de Supabase
      : scores.filter((player) => player.game_name === selectedFilter); // Filtrar por game_name

  const filteredComments =
    selectedFilter === "all"
      ? comments
      : comments.filter((comment) => comment.game_name === selectedFilter);

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex flex-col'>
      <div className='container mx-auto max-w-7xl flex-grow'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <Link href='/'>
            <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
            </Button>
          </Link>
          <h1 className='text-3xl font-bold text-white'>
            Ranking y Comentarios
          </h1>
          <div className='w-20'></div>
        </div>

        {/* Filter Tabs */}
        <div className='flex flex-wrap gap-2 mb-6 justify-center'>
          {["all", "Snake", "Fruit Ninja", "Tetris", "Pong"].map((filter) => (
            <Button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              variant={selectedFilter === filter ? "default" : "outline"}
              className={`${
                selectedFilter === filter
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/40 hover:border-white/60"
              }`}
            >
              {filter === "all" ? "Todos los Juegos" : filter}
            </Button>
          ))}
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
          {/* Leaderboard */}
          <div>
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white flex items-center'>
                  <Trophy className='h-6 w-6 mr-2 text-yellow-400' />
                  Tabla de Líderes
                  {selectedFilter !== "all" && (
                    <Badge className={`ml-2 ${getGameColor(selectedFilter)}`}>
                      {selectedFilter}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard.map((player, index) => (
                      <div
                        key={player.id} // Usar el ID de Supabase
                        className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/5 ${
                          index < 3
                            ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
                            : "bg-white/5"
                        }`}
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='flex items-center justify-center w-10 h-10'>
                            {getRankIcon(index + 1)}
                          </div>
                          <div className='text-2xl'>🎮</div>{" "}
                          {/* Avatar genérico */}
                          <div>
                            <div className='font-semibold text-white'>
                              {player.user_name}
                            </div>
                            <div className='flex items-center space-x-2'>
                              <Badge className={getGameColor(player.game_name)}>
                                {player.game_name}
                              </Badge>
                              <span className='text-xs text-white/50'>
                                {new Date(
                                  player.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-xl font-bold text-purple-400'>
                            {player.score.toLocaleString()}
                          </div>
                          <div className='text-sm text-white/60'>puntos</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-white/60 text-center py-4'>
                      No hay puntuaciones para mostrar.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className='bg-white/10 backdrop-blur-sm border-white/20 mt-6'>
              <CardHeader>
                <CardTitle className='text-white flex items-center'>
                  <TrendingUp className='h-6 w-6 mr-2 text-green-400' />
                  Estadísticas Globales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-400'>
                      10,247
                    </div>
                    <div className='text-sm text-white/60'>
                      Jugadores Activos
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-400'>
                      52.3M
                    </div>
                    <div className='text-sm text-white/60'>
                      Partidas Jugadas
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-purple-400'>
                      4.8★
                    </div>
                    <div className='text-sm text-white/60'>
                      Calificación Media
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-orange-400'>
                      {comments.length}
                    </div>
                    <div className='text-sm text-white/60'>Comentarios</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments Section */}
          <div className='space-y-6' id='comments'>
            {/* Add Comment */}
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white flex items-center'>
                  <Users className='h-6 w-6 mr-2 text-blue-400' />
                  Agregar Comentario
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <form onSubmit={handleSubmitComment}>
                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <Input
                      placeholder='Tu nombre'
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      name='userName' // Añadir name para FormData
                    />
                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className='bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:bg-white/20 focus:border-white/40'
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      }}
                      name='selectedGame' // Añadir name para FormData
                    >
                      <option
                        value='Snake'
                        style={{ backgroundColor: "#1f2937", color: "white" }}
                      >
                        Snake
                      </option>
                      <option
                        value='Fruit Ninja'
                        style={{ backgroundColor: "#1f2937", color: "white" }}
                      >
                        Fruit Ninja
                      </option>
                      <option
                        value='Tetris'
                        style={{ backgroundColor: "#1f2937", color: "white" }}
                      >
                        Tetris
                      </option>
                      <option
                        value='Pong'
                        style={{ backgroundColor: "#1f2937", color: "white" }}
                      >
                        Pong
                      </option>
                    </select>
                  </div>

                  <div className='flex items-center space-x-2 mb-4'>
                    <span className='text-white/80'>Calificación:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type='button' // Importante para que no envíe el formulario
                        onClick={() => setRating(star)}
                        className={`${
                          star <= rating ? "text-yellow-400" : "text-white/30"
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <Star className='h-5 w-5 fill-current' />
                      </button>
                    ))}
                    <input type='hidden' name='rating' value={rating} />{" "}
                    {/* Campo oculto para el rating */}
                  </div>

                  <Textarea
                    placeholder='Escribe tu comentario sobre el juego...'
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className='bg-white/10 border-white/20 text-white placeholder:text-white/50 mb-4'
                    rows={3}
                    name='newComment' // Añadir name para FormData
                  />

                  <Button
                    type='submit'
                    className='w-full bg-purple-600 hover:bg-purple-700'
                    disabled={!newCommentText.trim() || !userName.trim()}
                  >
                    Publicar Comentario
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white'>
                  Comentarios Recientes
                  {selectedFilter !== "all" && (
                    <Badge className={`ml-2 ${getGameColor(selectedFilter)}`}>
                      {selectedFilter}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4 max-h-96 overflow-y-auto'>
                  {filteredComments.length > 0 ? (
                    filteredComments.map((comment) => (
                      <div
                        key={comment.id}
                        className='bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div className='flex items-center space-x-2'>
                            <span className='text-xl'>🎮</span>{" "}
                            {/* Avatar genérico */}
                            <span className='font-semibold text-white'>
                              {comment.user_name}
                            </span>
                            <Badge className={getGameColor(comment.game_name)}>
                              {comment.game_name}
                            </Badge>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <div className='flex items-center space-x-1'>
                              {Array.from({ length: comment.rating }).map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className='h-4 w-4 text-yellow-400 fill-current'
                                  />
                                )
                              )}
                            </div>
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className='text-red-400 hover:text-red-300 transition-colors text-sm'
                            >
                              ❤️ {comment.likes}
                            </button>
                          </div>
                        </div>
                        <p className='text-white/80 mb-2'>
                          {comment.comment_text}
                        </p>
                        <div className='text-sm text-white/50'>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-white/60 text-center py-4'>
                      No hay comentarios para mostrar.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
