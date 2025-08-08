"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Trophy, Gamepad2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";

const games = [
  {
    id: "snake",
    title: "Snake Classic",
    description:
      "El clásico juego de la serpiente. Come frutas, crece y evita chocar contigo mismo.",
    image: "/snake-classic.png",
    rating: 4.8,
    players: "2.1K",
    difficulty: "Fácil",
    category: "Arcade",
  },
  {
    id: "fruit-ninja",
    title: "Fruit Ninja",
    description:
      "Corta frutas volando con tu espada ninja. ¡Evita las bombas y consigue la puntuación más alta!",
    image: "/fruit-ninja.jpg",
    rating: 4.9,
    players: "3.5K",
    difficulty: "Medio",
    category: "Acción",
  },
  {
    id: "tetris",
    title: "Tetris Classic",
    description:
      "Organiza las piezas que caen para completar líneas y obtener puntos.",
    image: "/tetris.jpg",
    rating: 4.7,
    players: "1.8K",
    difficulty: "Medio",
    category: "Puzzle",
  },
  {
    id: "pong",
    title: "Pong Retro",
    description:
      "El primer videojuego de la historia. Controla tu paleta y vence a tu oponente.",
    image: "/pong-retro.png",
    rating: 4.5,
    players: "892",
    difficulty: "Fácil",
    category: "Clásico",
  },
];

export default function HomePage() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generar partículas solo en el cliente
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${5 + Math.random() * 10}s`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div>
      {/* Contenido principal */}
      <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden'>
        {/* Grid Matrix Background */}
        <div className='absolute inset-0 opacity-10'>
          <div className='grid-bg'></div>
        </div>

        {/* Floating particles */}
        <div className='absolute inset-0 overflow-hidden'>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className='absolute w-1 h-1 bg-cyan-400 rounded-full floating-particle'
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <header className='border-b border-white/10 backdrop-blur-md bg-black/30 relative z-20'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <div className='relative'>
                  <Gamepad2 className='h-6 w-6 md:h-8 md:w-8 text-purple-400 animate-pulse' />
                  <div className='absolute inset-0 animate-ping'>
                    <Gamepad2 className='h-6 w-6 md:h-8 md:w-8 text-purple-400 opacity-75' />
                  </div>
                </div>
                <h1 className='text-lg md:text-2xl font-bold text-white tracking-wider font-mono'>
                  RETRO-GAMEHUB
                </h1>
              </div>
              <nav className='hidden md:flex space-x-4 lg:space-x-6'>
                <Link
                  href='#games'
                  className='text-white/80 hover:text-cyan-400 transition-all duration-300 font-mono tracking-wide text-sm lg:text-base relative group'
                >
                  [JUEGOS]
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300'></span>
                </Link>
                <Link
                  href='/leaderboard'
                  className='text-white/80 hover:text-green-400 transition-all duration-300 font-mono tracking-wide text-sm lg:text-base relative group'
                >
                  [RANKING]
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300'></span>
                </Link>
                <Link
                  href='/leaderboard#comments'
                  className='text-white/80 hover:text-pink-400 transition-all duration-300 font-mono tracking-wide text-sm lg:text-base relative group'
                >
                  [COMENTARIOS]
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 group-hover:w-full transition-all duration-300'></span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* EPIC Hero Section */}
        <section className='py-16 md:py-24 lg:py-32 text-center relative overflow-hidden'>
          {/* Matrix rain effect */}
          <div className='absolute inset-0 matrix-rain'></div>

          {/* Scan lines */}
          <div className='absolute inset-0 scan-lines pointer-events-none'></div>

          {/* Glowing orbs - adjusted for mobile */}
          <div className='absolute top-10 md:top-20 left-5 md:left-10 w-16 h-16 md:w-32 md:h-32 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse'></div>
          <div className='absolute bottom-10 md:bottom-20 right-5 md:right-10 w-20 h-20 md:w-40 md:h-40 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000'></div>
          <div className='absolute top-16 md:top-32 right-10 md:right-20 w-12 h-12 md:w-24 md:h-24 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse delay-2000'></div>

          <div className='container mx-auto px-4 relative z-10'>
            {/* MEGA Title */}
            <div className='mb-8 md:mb-12'>
              {/* Subtitle futurista */}
              <div className='mb-6 md:mb-8 opacity-80'>
                <p className='text-sm md:text-lg lg:text-xl text-cyan-300 font-mono tracking-widest mb-2'>
                  INITIALIZE_NOSTALGIA.EXE
                </p>
                <div className='flex justify-center items-center space-x-4'>
                  <div className='h-px w-10 md:w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                  <span className='text-cyan-400 animate-spin'>⚡</span>
                  <div className='h-px w-10 md:w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                </div>
              </div>

              {/* Título principal ÉPICO */}
              <div className='relative mb-4 md:mb-6'>
                <h1
                  className='text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black text-transparent mb-2 md:mb-4 retro-gaming'
                  style={{
                    background:
                      "linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff6600, #ff00ff)",
                    backgroundSize: "400% 400%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    animation: "rainbow-wave 4s ease-in-out infinite",
                    textShadow: "0 0 80px rgba(255,0,255,0.8)",
                  }}
                >
                  RETRO
                </h1>
              </div>

              <div className='relative mb-6 md:mb-8'>
                <h2
                  className='text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-8xl font-black retro-gaming'
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
                    backgroundSize: "300% 300%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "gradient-pulse 3s ease-in-out infinite",
                    filter: "drop-shadow(0 0 30px rgba(102, 126, 234, 0.6))",
                  }}
                >
                  GAMEHUB
                </h2>
              </div>

              {/* ASCII Art decorativo - hidden on mobile */}
              <div className='hidden md:block font-mono text-green-400 text-xs md:text-sm opacity-60 mb-6 md:mb-8'>
                <pre className='leading-tight'>
                  {`    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    █ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ █
    █ ▄▀▄ CLASSIC ARCADE EXPERIENCE ▄ █
    █ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ █
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`}
                </pre>
              </div>
            </div>

            {/* HUD Style Info */}
            <div className='mb-8 md:mb-10'>
              <div className='inline-flex items-center space-x-4 md:space-x-8 bg-black/40 backdrop-blur-lg border border-cyan-400/30 px-4 md:px-8 py-3 md:py-4 rounded-lg'>
                <div className='text-center'>
                  <div className='text-lg md:text-2xl font-bold text-green-400 font-mono'>
                    &gt;ONLINE
                  </div>
                  <div className='text-xs md:text-sm text-green-300 font-mono'>
                    STATUS
                  </div>
                </div>
                <div className='w-px h-6 md:h-8 bg-cyan-400/50'></div>
                <div className='text-center'>
                  <div className='text-lg md:text-2xl font-bold text-cyan-400 font-mono'>
                    10K+
                  </div>
                  <div className='text-xs md:text-sm text-cyan-300 font-mono'>
                    PLAYERS
                  </div>
                </div>
                <div className='w-px h-6 md:h-8 bg-cyan-400/50'></div>
                <div className='text-center'>
                  <div className='text-lg md:text-2xl font-bold text-pink-400 font-mono'>
                    ∞
                  </div>
                  <div className='text-xs md:text-sm text-pink-300 font-mono'>
                    FUN
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje principal mejorado */}
            <div className='mb-8 md:mb-12'>
              <p className='text-lg md:text-xl lg:text-2xl text-green-300 mb-4 md:mb-6 font-mono tracking-wide leading-relaxed'>
                &gt; ACCESO_DIRECTO_AL_PASADO.EXE
              </p>

              <p className='text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto font-mono leading-relaxed px-4'>
                <span className='text-cyan-400'>SISTEMA:</span> Sin descargas •{" "}
                <span className='text-pink-400'>PROTOCOLO:</span> Sin
                instalaciones •{" "}
                <span className='text-yellow-400'>RESULTADO:</span> Diversión
                infinita
              </p>
            </div>

            {/* Botones ÉPICOS */}
            <div className='flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-8 md:mb-12 px-4'>
              <Link href='#games'>
                <button
                  className='w-full sm:w-auto group relative px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-black text-lg md:text-xl tracking-widest transform hover:scale-110 transition-all duration-300 border-2 border-purple-400 overflow-hidden font-mono'
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 20px) 0, 100% calc(100% - 20px), 20px 100%, 0 100%)",
                    boxShadow: "0 0 40px rgba(147, 51, 234, 0.6)",
                  }}
                >
                  <span className='relative z-10'>
                    &gt;&gt; INICIAR JUEGO &lt;&lt;
                  </span>
                  <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                </button>
              </Link>

              <Link href='/leaderboard'>
                <button
                  className='w-full sm:w-auto group relative px-8 md:px-12 py-4 md:py-6 bg-transparent hover:bg-cyan-400/10 text-cyan-400 font-black text-lg md:text-xl tracking-widest border-2 border-cyan-400 hover:border-cyan-300 transform hover:scale-110 transition-all duration-300 font-mono'
                  style={{
                    clipPath:
                      "polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%)",
                    boxShadow: "0 0 40px rgba(0,255,255,0.4)",
                    textShadow: "0 0 15px rgba(0,255,255,0.8)",
                  }}
                >
                  <span className='relative z-10'>[ HALL OF FAME ]</span>
                </button>
              </Link>
            </div>

            {/* Terminal de estado futurista */}
            <div
              className='max-w-2xl mx-auto p-4 md:p-6 border-2 border-green-400/40 bg-black/60 backdrop-blur-lg relative overflow-hidden'
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% calc(100% - 10px), 10px 100%, 0 100%)",
                boxShadow: "0 0 50px rgba(0,255,0,0.2)",
              }}
            >
              {/* Terminal header */}
              <div className='flex items-center justify-between border-b border-green-400/30 pb-2 mb-4'>
                <div className='flex space-x-2'>
                  <div className='w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500 animate-pulse'></div>
                  <div className='w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500 animate-pulse delay-200'></div>
                  <div className='w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 animate-pulse delay-300'></div>
                </div>
                <span className='text-green-400 font-mono text-xs md:text-sm'>
                  RETRO_TERMINAL v3.14
                </span>
              </div>

              <div className='font-mono text-green-400 text-xs md:text-sm space-y-1 md:space-y-2'>
                <p>
                  <span className='text-cyan-400'>root@retro-hub:~$</span>{" "}
                  system_status --verbose
                </p>
                <p>
                  <span className='text-yellow-400'>INFO:</span> Nostalgia
                  levels: MAXIMUM
                </p>
                <p>
                  <span className='text-green-300'>SUCCESS:</span> All games
                  operational
                </p>
                <p>
                  <span className='text-pink-400'>ALERT:</span> Fun overload
                  detected
                </p>
                <p>
                  <span className='text-cyan-400'>root@retro-hub:~$</span>{" "}
                  <span className='animate-pulse'>█</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className='py-12 md:py-16 border-y border-white/20 backdrop-blur-sm bg-black/20 relative'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center'>
              <div
                className='group relative p-4 md:p-6 border border-purple-400/30 bg-purple-500/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300'
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 15px) 0, 100% 100%, 15px 100%)",
                }}
              >
                <div className='text-3xl md:text-4xl font-black text-purple-400 mb-2 font-mono'>
                  10K+
                </div>
                <div className='text-white/90 font-mono tracking-wide text-sm md:text-base'>
                  JUGADORES_ACTIVOS
                </div>
                <div className='absolute top-2 left-2 w-2 h-2 bg-purple-400 animate-ping'></div>
              </div>
              <div
                className='group relative p-4 md:p-6 border border-pink-400/30 bg-pink-500/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300'
                style={{
                  clipPath:
                    "polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)",
                }}
              >
                <div className='text-3xl md:text-4xl font-black text-pink-400 mb-2 font-mono'>
                  50M+
                </div>
                <div className='text-white/90 font-mono tracking-wide text-sm md:text-base'>
                  PARTIDAS_COMPLETADAS
                </div>
                <div className='absolute top-2 right-2 w-2 h-2 bg-pink-400 animate-ping'></div>
              </div>
              <div
                className='group relative p-4 md:p-6 border border-cyan-400/30 bg-cyan-500/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300'
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 15px) 0, 100% 100%, 15px 100%)",
                }}
              >
                <div className='text-3xl md:text-4xl font-black text-cyan-400 mb-2 font-mono'>
                  4.8★
                </div>
                <div className='text-white/90 font-mono tracking-wide text-sm md:text-base'>
                  RATING_PROMEDIO
                </div>
                <div className='absolute bottom-2 left-2 w-2 h-2 bg-cyan-400 animate-ping'></div>
              </div>
            </div>
          </div>
        </section>

        {/* Games Section Enhanced */}
        <section id='games' className='py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='text-center mb-12 md:mb-16'>
              {/* Prueba simple sin animaciones primero */}
              <h3
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 4rem)",
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  color: "#ff0080",
                  textShadow: "0 0 10px #ff0080",
                  marginBottom: "1.5rem",
                  letterSpacing: "0.1em",
                }}
              >
                &gt;&gt; ARCADE_SELECTION &lt;&lt;
              </h3>
              <p className='text-lg md:text-xl text-white/90 font-mono tracking-wide'>
                Selecciona tu juego favorito y comienza la aventura retro.
              </p>

              {/* Test para ver si las animaciones funcionan */}
              <div className='flex justify-center items-center mt-6'>
                <div className='h-1 w-16 md:w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                <span className='mx-4 text-cyan-400 text-2xl md:text-3xl animate-bounce'>
                  ◆
                </span>
                <div className='h-1 w-16 md:w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto'>
              {games.map((game, index) => (
                <Card
                  key={game.id}
                  className='group bg-black/40 backdrop-blur-lg border-2 border-white/20 hover:border-cyan-400/60 transition-all duration-500 transform hover:scale-105 hover:-rotate-1 relative overflow-hidden'
                  style={{
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                    clipPath:
                      "polygon(0 0, calc(100% - 20px) 0, 100% calc(100% - 20px), 20px 100%, 0 100%)",
                  }}
                >
                  <CardHeader className='pb-4'>
                    <div className='relative overflow-hidden rounded-lg mb-4 border-2 border-purple-400/30'>
                      <Image
                        src={game.image || "/placeholder.svg"}
                        alt={game.title}
                        width={400}
                        height={250}
                        className='w-full h-40 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                      />
                      <Badge className='absolute top-2 right-2 bg-purple-600 border border-purple-400 font-mono tracking-wide text-xs'>
                        {game.category}
                      </Badge>
                    </div>
                    <CardTitle className='text-white text-xl md:text-2xl font-mono tracking-wider'>
                      {game.title}
                    </CardTitle>
                    <CardDescription className='text-white/80 font-mono leading-relaxed text-sm md:text-base'>
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center justify-between mb-4 md:mb-6'>
                      <div className='flex items-center space-x-4 md:space-x-6 text-sm text-white/70'>
                        <div className='flex items-center space-x-2'>
                          <Star className='h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400 animate-pulse' />
                          <span className='font-mono font-bold text-xs md:text-sm'>
                            {game.rating}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Users className='h-4 w-4 md:h-5 md:w-5 text-cyan-400' />
                          <span className='font-mono font-bold text-xs md:text-sm'>
                            {game.players}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='outline'
                        className='border-cyan-400/50 text-cyan-400 font-mono tracking-wide bg-cyan-400/10 text-xs'
                      >
                        {game.difficulty}
                      </Badge>
                    </div>
                    <Link href={`/games/${game.id}`}>
                      <Button
                        className='w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-black text-base md:text-lg tracking-wider py-2 md:py-3 border-2 border-purple-400/50 relative overflow-hidden group font-mono'
                        style={{
                          clipPath:
                            "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                          boxShadow: "0 0 30px rgba(147, 51, 234, 0.4)",
                        }}
                      >
                        <span className='relative z-10'>
                          &gt;&gt; PLAY NOW &lt;&lt;
                        </span>
                        <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                      </Button>
                    </Link>
                  </CardContent>

                  {/* Corner decorations */}
                  <div className='absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 border-l-2 border-t-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 border-r-2 border-t-2 border-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='absolute bottom-0 left-0 w-3 h-3 md:w-4 md:h-4 border-l-2 border-b-2 border-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border-r-2 border-b-2 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        @keyframes rainbow-wave {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes gradient-pulse {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
