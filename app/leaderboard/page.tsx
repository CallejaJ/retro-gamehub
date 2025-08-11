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
  Zap,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { addComment, likeComment, getComments, getScores } from "./actions";
import { Footer } from "@/components/footer";

export default function LeaderboardPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedGame, setSelectedGame] = useState("Snake");
  const [rating, setRating] = useState(5);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedComments = await getComments();
        const fetchedScores = await getScores();

        // Debug: Log para ver los nombres exactos en la BD
        console.log(
          "Comments from DB:",
          fetchedComments.map((c) => c.game_name)
        );
        console.log(
          "Scores from DB:",
          fetchedScores.map((s) => s.game_name)
        );

        setComments(fetchedComments);
        setScores(fetchedScores);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmitComment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!newCommentText.trim() || !userName.trim()) return;

    const formData = new FormData();
    formData.append("userName", userName);
    formData.append("selectedGame", selectedGame);
    formData.append("rating", rating.toString());
    formData.append("newComment", newCommentText);

    try {
      const response = await addComment(formData);
      if (response.success) {
        const updatedComments = await getComments();
        setComments(updatedComments);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }

    setNewCommentText("");
    setUserName("");
    setRating(5);
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await likeComment(commentId);
      if (response.success) {
        const updatedComments = await getComments();
        setComments(updatedComments);
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className='relative'>
            <Crown className='h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 animate-pulse' />
            <div className='absolute inset-0 animate-ping'>
              <Crown className='h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 opacity-75' />
            </div>
          </div>
        );
      case 2:
        return <Medal className='h-5 w-5 sm:h-7 sm:w-7 text-gray-300' />;
      case 3:
        return <Award className='h-5 w-5 sm:h-7 sm:w-7 text-amber-600' />;
      default:
        return (
          <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center border-2 border-cyan-400'>
            <span className='text-xs sm:text-sm font-black text-white font-mono'>
              #{rank}
            </span>
          </div>
        );
    }
  };

  const getGameColor = (game: string) => {
    const normalizedGame = normalizeGameName(game);
    switch (normalizedGame) {
      case "Snake":
        return "bg-green-500/20 text-green-400 border-green-500/50 shadow-lg shadow-green-500/25";
      case "Fruit Ninja":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-lg shadow-orange-500/25";
      case "Tetris":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-lg shadow-purple-500/25";
      case "Pong":
        return "bg-gray-500/20 text-gray-300 border-gray-500/50 shadow-lg shadow-gray-500/25";
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-lg shadow-cyan-500/25";
    }
  };

  // Función para normalizar nombres de juegos
  const normalizeGameName = (gameName: string) => {
    // Convierte "Tetris Classic" -> "Tetris", "Pong Retro" -> "Pong", etc.
    return gameName.replace(/ Classic| Retro/g, "");
  };

  const filteredLeaderboard =
    selectedFilter === "all"
      ? scores
      : scores.filter((player) => {
          const normalizedPlayerGame = normalizeGameName(player.game_name);
          const normalizedFilter = normalizeGameName(selectedFilter);
          return normalizedPlayerGame === normalizedFilter;
        });

  const filteredComments =
    selectedFilter === "all"
      ? comments
      : comments.filter((comment) => {
          const normalizedCommentGame = normalizeGameName(comment.game_name);
          const normalizedFilter = normalizeGameName(selectedFilter);
          console.log(
            `Normalized: "${normalizedCommentGame}" vs "${normalizedFilter}"`
          );
          return normalizedCommentGame === normalizedFilter;
        });

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden'>
        {/* Grid Matrix Background */}
        <div className='absolute inset-0 opacity-10'>
          <div className='grid-bg'></div>
        </div>

        {/* Scan lines */}
        <div className='absolute inset-0 scan-lines pointer-events-none'></div>

        {/* Header optimizado para móvil */}
        <header className='border-b border-cyan-400/30 backdrop-blur-md bg-black/40 relative z-20'>
          <div className='container mx-auto px-2 sm:px-4 py-3 sm:py-6'>
            <div className='flex items-center justify-between'>
              <Link href='/'>
                <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 font-mono tracking-wider text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2'>
                  <ArrowLeft className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                  <span className='hidden sm:inline'>[ VOLVER ]</span>
                  <span className='sm:hidden'>BACK</span>
                </Button>
              </Link>
              <div className='text-center flex-1 px-2'>
                <h1 className='text-sm sm:text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text font-retro tracking-wider animate-pulse'>
                  <span className='sm:hidden'>HALL_OF_FAME</span>
                  <span className='hidden sm:inline'>
                    &gt;&gt; HALL_OF_FAME &lt;&lt;
                  </span>
                </h1>
                <div className='flex items-center justify-center mt-1 sm:mt-2 space-x-2'>
                  <div className='h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                  <Zap className='h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 animate-spin' />
                  <div className='h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                </div>
              </div>
              <div className='w-12 sm:w-20'></div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className='container mx-auto max-w-7xl px-2 sm:px-4 py-4 sm:py-8'>
          {/* Filter Tabs optimizados para móvil */}
          <div className='flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-8 justify-center'>
            {["all", "Snake", "Fruit Ninja", "Tetris", "Pong"].map((filter) => (
              <Button
                key={filter}
                onClick={() => {
                  console.log("Filter clicked:", filter);
                  setSelectedFilter(filter);
                }}
                className={`font-mono tracking-wider text-xs sm:text-sm transition-all duration-300 relative z-10 cursor-pointer px-2 sm:px-4 py-1 sm:py-2 ${
                  selectedFilter === filter
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-400/50 transform scale-105"
                    : "bg-black/40 hover:bg-white/20 text-white/80 border border-white/40 hover:border-cyan-400/60 hover:text-cyan-400"
                }`}
              >
                <span className='relative z-20 pointer-events-none'>
                  {filter === "all" ? "TODOS" : `${filter.toUpperCase()}`}
                </span>
              </Button>
            ))}
          </div>

          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8'>
            {/* Leaderboard optimizado para móvil */}
            <div className='space-y-4 sm:space-y-6'>
              <Card className='bg-black/40 backdrop-blur-sm border-2 border-cyan-400/30 shadow-2xl shadow-cyan-400/20 relative overflow-hidden'>
                {/* Corner decorations - reducidas en móvil */}
                <div className='absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-t-2 border-cyan-400'></div>
                <div className='absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-t-2 border-pink-400'></div>
                <div className='absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-b-2 border-green-400'></div>
                <div className='absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-b-2 border-yellow-400'></div>

                <CardHeader className='bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-cyan-400/30 p-3 sm:p-6'>
                  <CardTitle className='text-white flex items-center font-mono tracking-wider text-sm sm:text-base'>
                    <Trophy className='h-4 w-4 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-yellow-400 animate-pulse' />
                    <span className='sm:hidden'>RANKING</span>
                    <span className='hidden sm:inline'>RANKING_GLOBAL.EXE</span>
                    {selectedFilter !== "all" && (
                      <Badge
                        className={`ml-2 sm:ml-3 font-mono text-xs ${getGameColor(
                          selectedFilter
                        )}`}
                      >
                        {selectedFilter.toUpperCase()}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-3 sm:p-6'>
                  <div className='space-y-3 sm:space-y-4'>
                    {filteredLeaderboard.length > 0 ? (
                      filteredLeaderboard.map((player, index) => (
                        <div
                          key={player.id}
                          className={`group relative p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            index < 3
                              ? "bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/25"
                              : "bg-gradient-to-r from-gray-900/50 to-slate-800/50 border border-white/20 hover:border-cyan-400/60"
                          }`}
                          style={
                            index < 3
                              ? {
                                  clipPath:
                                    "polygon(0 0, calc(100% - 10px) 0, 100% calc(100% - 10px), 10px 100%, 0 100%)",
                                }
                              : {}
                          }
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0'>
                              <div className='flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0'>
                                {getRankIcon(index + 1)}
                              </div>
                              <div className='text-lg sm:text-3xl animate-bounce flex-shrink-0'>
                                🎮
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='font-bold text-white font-mono tracking-wide text-sm sm:text-lg truncate'>
                                  {player.user_name}
                                </div>
                                <div className='flex items-center space-x-1 sm:space-x-2 mt-1'>
                                  <Badge
                                    className={`font-mono text-xs ${getGameColor(
                                      player.game_name
                                    )} truncate max-w-20 sm:max-w-none`}
                                  >
                                    {player.game_name}
                                  </Badge>
                                  <span className='text-xs text-cyan-400 font-mono hidden sm:inline'>
                                    {new Date(
                                      player.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className='text-right flex-shrink-0 ml-2'>
                              <div className='text-lg sm:text-2xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-mono'>
                                {player.score.toLocaleString()}
                              </div>
                              <div className='text-xs sm:text-sm text-white/60 font-mono'>
                                <span className='hidden sm:inline'>POINTS</span>
                                <span className='sm:hidden'>PTS</span>
                              </div>
                            </div>
                          </div>

                          {/* Glow effect for top 3 */}
                          {index < 3 && (
                            <div className='absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className='text-center py-8 text-white/60 font-mono'>
                        <div className='text-4xl mb-4'>🎯</div>
                        <p className='text-sm sm:text-base'>
                          NO_DATA_FOUND.404
                        </p>
                        <p className='text-xs sm:text-sm mt-2'>
                          ¡Sé el primero en establecer un récord!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card optimizado para móvil */}
              <Card className='bg-black/40 backdrop-blur-sm border-2 border-green-400/30 shadow-2xl shadow-green-400/20 relative overflow-hidden'>
                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400'></div>

                <CardHeader className='bg-gradient-to-r from-green-900/50 to-teal-900/50 p-3 sm:p-6'>
                  <CardTitle className='text-white flex items-center font-mono tracking-wider text-sm sm:text-base'>
                    <TrendingUp className='h-4 w-4 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-green-400 animate-pulse' />
                    <span className='sm:hidden'>STATS</span>
                    <span className='hidden sm:inline'>SYSTEM_STATS.LOG</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-3 sm:p-6'>
                  <div className='grid grid-cols-2 gap-3 sm:gap-6'>
                    <div className='text-center p-2 sm:p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-400/30'>
                      <div className='text-xl sm:text-3xl font-black text-green-400 font-mono animate-pulse'>
                        {scores.length}
                      </div>
                      <div className='text-xs sm:text-sm text-white/80 font-mono tracking-wide'>
                        RECORDS
                      </div>
                    </div>
                    <div className='text-center p-2 sm:p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-400/30'>
                      <div className='text-xl sm:text-3xl font-black text-blue-400 font-mono animate-pulse'>
                        {scores
                          .reduce((acc, score) => acc + score.score, 0)
                          .toLocaleString()}
                      </div>
                      <div className='text-xs sm:text-sm text-white/80 font-mono tracking-wide'>
                        <span className='hidden sm:inline'>TOTAL_PTS</span>
                        <span className='sm:hidden'>TOTAL</span>
                      </div>
                    </div>
                    <div className='text-center p-2 sm:p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-400/30'>
                      <div className='text-xl sm:text-3xl font-black text-purple-400 font-mono animate-pulse'>
                        {comments.length > 0
                          ? (
                              comments.reduce(
                                (acc, comment) => acc + comment.rating,
                                0
                              ) / comments.length
                            ).toFixed(1)
                          : "0"}
                        ★
                      </div>
                      <div className='text-xs sm:text-sm text-white/80 font-mono tracking-wide'>
                        <span className='hidden sm:inline'>AVG_RATING</span>
                        <span className='sm:hidden'>RATING</span>
                      </div>
                    </div>
                    <div className='text-center p-2 sm:p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-400/30'>
                      <div className='text-xl sm:text-3xl font-black text-orange-400 font-mono animate-pulse'>
                        {comments.length}
                      </div>
                      <div className='text-xs sm:text-sm text-white/80 font-mono tracking-wide'>
                        COMMENTS
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comments Section optimizado para móvil */}
            <div className='space-y-4 sm:space-y-6' id='comments'>
              {/* Add Comment */}
              <Card className='bg-black/40 backdrop-blur-sm border-2 border-blue-400/30 shadow-2xl shadow-blue-400/20 relative overflow-hidden'>
                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'></div>

                <CardHeader className='bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-3 sm:p-6'>
                  <CardTitle className='text-white flex items-center font-mono tracking-wider text-sm sm:text-base'>
                    <Users className='h-4 w-4 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-400 animate-pulse' />
                    <span className='sm:hidden'>COMMENT</span>
                    <span className='hidden sm:inline'>NEW_COMMENT.INPUT</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-3 sm:p-6'>
                  <form
                    onSubmit={handleSubmitComment}
                    className='space-y-4 sm:space-y-6'
                  >
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                      <Input
                        placeholder='> USERNAME'
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className='bg-black/60 border-2 border-cyan-400/30 text-cyan-300 placeholder:text-cyan-400/50 font-mono focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 text-sm'
                        required
                      />
                      <select
                        aria-label='Selecciona un juego'
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className='bg-black/60 border-2 border-cyan-400/30 rounded-md px-3 py-2 text-cyan-300 font-mono focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 focus:outline-none text-sm'
                      >
                        <option value='Snake'>SNAKE</option>
                        <option value='Fruit Ninja'>FRUIT_NINJA</option>
                        <option value='Tetris'>TETRIS</option>
                        <option value='Pong'>PONG</option>
                      </select>
                    </div>

                    <div className='flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-400/30'>
                      <span className='text-white font-mono tracking-wide text-sm sm:text-base'>
                        RATING:
                      </span>
                      <div className='flex space-x-1'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type='button'
                            onClick={() => setRating(star)}
                            className={`transition-all duration-200 hover:scale-125 ${
                              star <= rating
                                ? "text-yellow-400 drop-shadow-lg"
                                : "text-white/30"
                            }`}
                          >
                            <Star className='h-5 w-5 sm:h-6 sm:w-6 fill-current' />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Textarea
                      placeholder='> WRITE_YOUR_REVIEW_HERE...'
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className='bg-black/60 border-2 border-cyan-400/30 text-cyan-300 placeholder:text-cyan-400/50 font-mono focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 min-h-[100px] sm:min-h-[120px] text-sm'
                      rows={4}
                      required
                    />

                    <Button
                      type='submit'
                      className='w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-black text-sm sm:text-lg tracking-wider py-2 sm:py-3 border-2 border-purple-400 relative overflow-hidden font-mono transition-all duration-300 hover:scale-105'
                      style={{
                        clipPath:
                          "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                        boxShadow: "0 0 30px rgba(147, 51, 234, 0.6)",
                      }}
                      disabled={!newCommentText.trim() || !userName.trim()}
                    >
                      <span className='sm:hidden'>
                        &gt;&gt; SUBMIT &lt;&lt;
                      </span>
                      <span className='hidden sm:inline'>
                        &gt;&gt; SUBMIT_COMMENT &lt;&lt;
                      </span>
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Comments List optimizado para móvil */}
              <Card className='bg-black/40 backdrop-blur-sm border-2 border-pink-400/30 shadow-2xl shadow-pink-400/20 relative overflow-hidden'>
                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400'></div>

                <CardHeader className='bg-gradient-to-r from-pink-900/50 to-purple-900/50 p-3 sm:p-6'>
                  <CardTitle className='text-white font-mono tracking-wider flex items-center text-sm sm:text-base'>
                    <span className='sm:hidden'>COMMENTS</span>
                    <span className='hidden sm:inline'>COMMENT_STREAM.LOG</span>
                    {selectedFilter !== "all" && (
                      <Badge
                        className={`ml-2 sm:ml-3 font-mono text-xs ${getGameColor(
                          selectedFilter
                        )}`}
                      >
                        {selectedFilter.toUpperCase()}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-3 sm:p-6'>
                  <div className='space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto'>
                    {filteredComments.length > 0 ? (
                      filteredComments.map((comment, index) => (
                        <div
                          key={comment.id}
                          className='bg-gradient-to-r from-gray-900/80 to-slate-800/80 p-3 sm:p-4 rounded-lg border border-white/20 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25 group'
                          style={{
                            clipPath:
                              "polygon(0 0, calc(100% - 10px) 0, 100% calc(100% - 10px), 10px 100%, 0 100%)",
                          }}
                        >
                          <div className='flex items-start justify-between mb-2 sm:mb-3'>
                            <div className='flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1'>
                              <span className='text-xl sm:text-2xl animate-bounce flex-shrink-0'>
                                🎮
                              </span>
                              <span className='font-bold text-white font-mono tracking-wide text-sm sm:text-base truncate'>
                                {comment.user_name}
                              </span>
                              <Badge
                                className={`font-mono text-xs ${getGameColor(
                                  comment.game_name
                                )} hidden sm:inline-block`}
                              >
                                {comment.game_name}
                              </Badge>
                            </div>
                            <div className='flex items-center space-x-2 sm:space-x-3 flex-shrink-0'>
                              <div className='flex items-center space-x-1'>
                                {Array.from({ length: comment.rating }).map(
                                  (_, i) => (
                                    <Star
                                      key={i}
                                      className='h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current animate-pulse'
                                      style={{ animationDelay: `${i * 0.1}s` }}
                                    />
                                  )
                                )}
                              </div>
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className='flex items-center space-x-1 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110 font-mono text-xs sm:text-sm bg-red-500/20 px-1 sm:px-2 py-1 rounded border border-red-500/30'
                                aria-label={`Like comment ${comment.id} - Likes: ${comment.likes}`}
                              >
                                <span>❤️</span>
                                <span>{comment.likes}</span>
                              </button>
                            </div>
                          </div>

                          {/* Badge móvil */}
                          <Badge
                            className={`font-mono text-xs ${getGameColor(
                              comment.game_name
                            )} mb-2 sm:hidden inline-block`}
                          >
                            {comment.game_name}
                          </Badge>

                          <p className='text-white/90 mb-2 sm:mb-3 leading-relaxed font-mono text-xs sm:text-sm'>
                            {comment.comment_text}
                          </p>
                          <div className='text-xs text-cyan-400 font-mono'>
                            [{new Date(comment.created_at).toLocaleDateString()}
                            ]
                            <span className='hidden sm:inline'>
                              {" "}
                              - COMMENT_ID: {String(index + 1).padStart(3, "0")}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='text-center py-8 text-white/60 font-mono'>
                        <div className='text-4xl mb-4'>💬</div>
                        <p className='text-sm sm:text-base'>
                          NO_COMMENTS_FOUND.404
                        </p>
                        <p className='text-xs sm:text-sm mt-2'>
                          ¡Sé el primero en comentar!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
