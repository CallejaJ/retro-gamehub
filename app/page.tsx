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
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      left: string;
      top: string;
      animationDelay: string;
      animationDuration: string;
    }>
  >([]);

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
                  <Gamepad2 className='h-8 w-8 text-purple-400 animate-pulse' />
                  <div className='absolute inset-0 animate-ping'>
                    <Gamepad2 className='h-8 w-8 text-purple-400 opacity-75' />
                  </div>
                </div>
                <h1
                  className='text-2xl font-bold text-white tracking-wider'
                  style={{
                    fontFamily: "monospace",
                    textShadow: "0 0 10px rgba(147, 51, 234, 0.8)",
                  }}
                >
                  RETRO-GAMEHUB
                </h1>
              </div>
              <nav className='hidden md:flex space-x-6'>
                <Link
                  href='#games'
                  className='text-white/80 hover:text-cyan-400 transition-all duration-300 font-mono tracking-wide relative group'
                  style={{ textShadow: "0 0 5px rgba(0,255,255,0.5)" }}
                >
                  [JUEGOS]
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300'></span>
                </Link>
                <Link
                  href='/leaderboard'
                  className='text-white/80 hover:text-green-400 transition-all duration-300 font-mono tracking-wide relative group'
                  style={{ textShadow: "0 0 5px rgba(0,255,0,0.5)" }}
                >
                  [RANKING]
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300'></span>
                </Link>
                <Link
                  href='/leaderboard#comments'
                  className='text-white/80 hover:text-pink-400 transition-all duration-300 font-mono tracking-wide relative group'
                  style={{ textShadow: "0 0 5px rgba(255,20,147,0.5)" }}
                >
                  [COMENTARIOS]
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 group-hover:w-full transition-all duration-300'></span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* EPIC Hero Section */}
        <section className='py-32 text-center relative overflow-hidden'>
          {/* Matrix rain effect */}
          <div className='absolute inset-0 matrix-rain'></div>

          {/* Scan lines */}
          <div className='absolute inset-0 scan-lines pointer-events-none'></div>

          {/* Glowing orbs */}
          <div className='absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse'></div>
          <div
            className='absolute bottom-20 right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse'
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className='absolute top-32 right-20 w-24 h-24 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse'
            style={{ animationDelay: "2s" }}
          ></div>

          <div className='container mx-auto px-4 relative z-10'>
            {/* MEGA Title */}
            <div className='mb-12'>
              {/* Subtitle futurista */}
              <div className='mb-8 opacity-80'>
                <p
                  className='text-lg md:text-xl text-cyan-300 font-mono tracking-[0.5em] mb-2'
                  style={{
                    textShadow: "0 0 20px rgba(0,255,255,0.8)",
                    animation: "typewriter 2s steps(20, end)",
                  }}
                >
                  INITIALIZE_NOSTALGIA.EXE
                </p>
                <div className='flex justify-center items-center space-x-4'>
                  <div className='h-px w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                  <span className='text-cyan-400 animate-spin'>⚡</span>
                  <div className='h-px w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                </div>
              </div>

              {/* Título principal ÉPICO */}
              <div className='relative'>
                <h1
                  className='text-6xl md:text-8xl lg:text-9xl font-black text-transparent mb-4 glitch-text'
                  style={{
                    fontFamily: "monospace",
                    background:
                      "linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff6600, #ff00ff)",
                    backgroundSize: "400% 400%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    animation:
                      "rainbow-wave 4s ease-in-out infinite, textGlow 2s ease-in-out infinite alternate",
                    letterSpacing: "0.1em",
                    textShadow: "0 0 80px rgba(255,0,255,0.8)",
                  }}
                >
                  RETRO
                </h1>

                {/* Efecto de glitch overlay */}
                <h1
                  className='absolute top-0 left-0 text-6xl md:text-8xl lg:text-9xl font-black text-red-500 opacity-30 glitch-overlay'
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    animation:
                      "glitch-1 0.3s infinite linear alternate-reverse",
                  }}
                >
                  RETRO
                </h1>
              </div>

              <div className='relative'>
                <h2
                  className='text-4xl md:text-6xl lg:text-8xl font-black mb-8'
                  style={{
                    fontFamily: "monospace",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
                    backgroundSize: "300% 300%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation:
                      "gradient-pulse 3s ease-in-out infinite, float 6s ease-in-out infinite",
                    letterSpacing: "0.15em",
                    filter: "drop-shadow(0 0 30px rgba(102, 126, 234, 0.6))",
                  }}
                >
                  GAMEHUB
                </h2>
              </div>

              {/* ASCII Art decorativo */}
              <div className='font-mono text-green-400 text-xs md:text-sm opacity-60 mb-8'>
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
            <div className='mb-10'>
              <div
                className='inline-flex items-center space-x-8 bg-black/40 backdrop-blur-lg border border-cyan-400/30 px-8 py-4 rounded-lg'
                style={{ boxShadow: "0 0 30px rgba(0,255,255,0.2)" }}
              >
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-400 font-mono'>
                    &gt;ONLINE
                  </div>
                  <div className='text-sm text-green-300 font-mono'>STATUS</div>
                </div>
                <div className='w-px h-8 bg-cyan-400/50'></div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-cyan-400 font-mono'>
                    10K+
                  </div>
                  <div className='text-sm text-cyan-300 font-mono'>PLAYERS</div>
                </div>
                <div className='w-px h-8 bg-cyan-400/50'></div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-pink-400 font-mono'>
                    ∞
                  </div>
                  <div className='text-sm text-pink-300 font-mono'>FUN</div>
                </div>
              </div>
            </div>

            {/* Mensaje principal mejorado */}
            <div className='mb-12'>
              <p
                className='text-xl md:text-2xl text-green-300 mb-6 font-mono tracking-wide leading-relaxed'
                style={{
                  textShadow: "0 0 15px rgba(0,255,0,0.8)",
                  animation: "glow-pulse 3s ease-in-out infinite",
                }}
              >
                &gt; ACCESO_DIRECTO_AL_PASADO.EXE
              </p>

              <p className='text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-mono leading-relaxed'>
                <span className='text-cyan-400'>SISTEMA:</span> Sin descargas •
                <span className='text-pink-400'> PROTOCOLO:</span> Sin
                instalaciones •
                <span className='text-yellow-400'> RESULTADO:</span> Diversión
                infinita
              </p>
            </div>

            {/* Botones ÉPICOS */}
            <div className='flex flex-col sm:flex-row gap-6 justify-center mb-12'>
              <button
                className='group relative px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-black text-xl tracking-widest transform hover:scale-110 transition-all duration-300 border-2 border-purple-400 overflow-hidden'
                style={{
                  fontFamily: "monospace",
                  textShadow: "0 0 10px rgba(0,0,0,0.8)",
                  boxShadow:
                    "0 0 40px rgba(147, 51, 234, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
                  clipPath:
                    "polygon(0 0, calc(100% - 20px) 0, 100% calc(100% - 20px), 20px 100%, 0 100%)",
                }}
              >
                <span className='relative z-10'>
                  <Link href='#games'>&gt;&gt; INICIAR JUEGO &lt;&lt;</Link>
                </span>
                <div className='absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300'></div>
                <div className='absolute -top-1 -left-1 w-2 h-2 bg-white animate-ping'></div>
                <div
                  className='absolute -bottom-1 -right-1 w-2 h-2 bg-white animate-ping'
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </button>

              <button
                className='group relative px-12 py-6 bg-transparent hover:bg-cyan-400/10 text-cyan-400 font-black text-xl tracking-widest border-2 border-cyan-400 hover:border-cyan-300 transform hover:scale-110 transition-all duration-300 overflow-hidden'
                style={{
                  fontFamily: "monospace",
                  textShadow: "0 0 15px rgba(0,255,255,0.8)",
                  boxShadow: "0 0 40px rgba(0,255,255,0.4)",
                  clipPath:
                    "polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%)",
                }}
              >
                <span className='relative z-10'>
                  <Link href='/leaderboard'>[ HALL OF FAME ]</Link>
                </span>
                <div className='absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300'></div>
              </button>
            </div>

            {/* Terminal de estado futurista */}
            <div
              className='max-w-2xl mx-auto p-6 border-2 border-green-400/40 bg-black/60 backdrop-blur-lg relative overflow-hidden'
              style={{
                boxShadow: "0 0 50px rgba(0,255,0,0.2)",
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% calc(100% - 10px), 10px 100%, 0 100%)",
              }}
            >
              {/* Terminal header */}
              <div className='flex items-center justify-between border-b border-green-400/30 pb-2 mb-4'>
                <div className='flex space-x-2'>
                  <div className='w-3 h-3 rounded-full bg-red-500 animate-pulse'></div>
                  <div
                    className='w-3 h-3 rounded-full bg-yellow-500 animate-pulse'
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className='w-3 h-3 rounded-full bg-green-500 animate-pulse'
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className='text-green-400 font-mono text-sm'>
                  RETRO_TERMINAL v3.14
                </span>
              </div>

              <div className='font-mono text-green-400 text-sm space-y-2'>
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

              {/* Matrix style overlay */}
              <div className='absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-green-400/10 to-transparent pointer-events-none'></div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className='py-16 border-y border-white/20 backdrop-blur-sm bg-black/20 relative'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
              <div
                className='group relative p-6 border border-purple-400/30 bg-purple-500/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300'
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 15px) 0, 100% 100%, 15px 100%)",
                }}
              >
                <div className='text-4xl font-black text-purple-400 mb-2 font-mono'>
                  10K+
                </div>
                <div className='text-white/90 font-mono tracking-wide'>
                  JUGADORES_ACTIVOS
                </div>
                <div className='absolute top-2 left-2 w-2 h-2 bg-purple-400 animate-ping'></div>
              </div>
              <div
                className='group relative p-6 border border-pink-400/30 bg-pink-500/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300'
                style={{
                  clipPath:
                    "polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)",
                }}
              >
                <div className='text-4xl font-black text-pink-400 mb-2 font-mono'>
                  50M+
                </div>
                <div className='text-white/90 font-mono tracking-wide'>
                  PARTIDAS_COMPLETADAS
                </div>
                <div className='absolute top-2 right-2 w-2 h-2 bg-pink-400 animate-ping'></div>
              </div>
              <div
                className='group relative p-6 border border-cyan-400/30 bg-cyan-500/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300'
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 15px) 0, 100% 100%, 15px 100%)",
                }}
              >
                <div className='text-4xl font-black text-cyan-400 mb-2 font-mono'>
                  4.8★
                </div>
                <div className='text-white/90 font-mono tracking-wide'>
                  RATING_PROMEDIO
                </div>
                <div className='absolute bottom-2 left-2 w-2 h-2 bg-cyan-400 animate-ping'></div>
              </div>
            </div>
          </div>
        </section>

        {/* Games Section Enhanced */}
        <section id='games' className='py-24'>
          <div className='container mx-auto px-4'>
            <div className='text-center mb-16'>
              <h3 className='text-5xl md:text-6xl font-black text-white mb-6 font-mono tracking-wider arcade-selection'>
                &gt;&gt; ARCADE_SELECTION &lt;&lt;
              </h3>
              {/* <div className='flex justify-center items-center mt-6'>
                <div className='h-1 w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                <span className='mx-4 text-cyan-400 text-3xl animate-bounce'>
                  ◆
                </span>
                <div className='h-1 w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
              </div>  */}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
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
                  {/* Scan line effect on cards */}
                  <div className='absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent h-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                  <CardHeader className='pb-4'>
                    <div className='relative overflow-hidden rounded-lg mb-4 border-2 border-purple-400/30'>
                      <Image
                        src={game.image || "/placeholder.svg"}
                        alt={game.title}
                        width={300}
                        height={200}
                        className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                        style={{ filter: "contrast(1.2) saturate(1.3)" }}
                      />
                      <Badge
                        className='absolute top-2 right-2 bg-purple-600 border border-purple-400 font-mono tracking-wide'
                        style={{
                          boxShadow: "0 0 10px rgba(147, 51, 234, 0.6)",
                        }}
                      >
                        {game.category}
                      </Badge>
                      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                    </div>
                    <CardTitle
                      className='text-white text-2xl font-mono tracking-wider'
                      style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}
                    >
                      {game.title}
                    </CardTitle>
                    <CardDescription className='text-white/80 font-mono leading-relaxed'>
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center justify-between mb-6'>
                      <div className='flex items-center space-x-6 text-sm text-white/70'>
                        <div className='flex items-center space-x-2'>
                          <Star className='h-5 w-5 fill-yellow-400 text-yellow-400 animate-pulse' />
                          <span className='font-mono font-bold'>
                            {game.rating}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Users className='h-5 w-5 text-cyan-400' />
                          <span className='font-mono font-bold'>
                            {game.players}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='outline'
                        className='border-cyan-400/50 text-cyan-400 font-mono tracking-wide bg-cyan-400/10'
                      >
                        {game.difficulty}
                      </Badge>
                    </div>
                    <Link href={`/games/${game.id}`}>
                      <Button
                        className='w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-black text-lg tracking-wider py-3 border-2 border-purple-400/50 relative overflow-hidden group'
                        style={{
                          fontFamily: "monospace",
                          boxShadow: "0 0 30px rgba(147, 51, 234, 0.4)",
                          clipPath:
                            "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
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
                  <div className='absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />

      {/* MEGA CSS para todos los efectos */}
      <style jsx>{`
        .grid-bg {
          background-image: linear-gradient(
              rgba(0, 255, 255, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          width: 100%;
          height: 100%;
          animation: grid-move 20s linear infinite;
        }

        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        .floating-particle {
          animation: float-up linear infinite;
        }

        @keyframes float-up {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .matrix-rain {
          background: linear-gradient(
            0deg,
            transparent 0%,
            rgba(0, 255, 0, 0.05) 50%,
            transparent 100%
          );
          background-size: 100% 200px;
          animation: matrix-fall 3s linear infinite;
        }

        @keyframes matrix-fall {
          0% {
            background-position: 0% -200px;
          }
          100% {
            background-position: 0% 100%;
          }
        }

        .scan-lines {
          background: linear-gradient(
            0deg,
            transparent 0%,
            rgba(0, 255, 255, 0.03) 50%,
            transparent 51%,
            rgba(0, 255, 255, 0.03) 52%,
            transparent 100%
          );
          background-size: 100% 4px;
          animation: scan 0.1s linear infinite;
        }

        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(4px);
          }
        }

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

        @keyframes textGlow {
          0% {
            filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(0, 255, 255, 1))
              drop-shadow(0 0 60px rgba(255, 255, 0, 0.8));
          }
          100% {
            filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.8));
          }
        }

        @keyframes glitch-1 {
          0% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-2px) scaleY(1.004);
          }
          40% {
            transform: translateX(2px);
          }
          60% {
            transform: translateX(-2px) scaleX(0.998);
          }
          80% {
            transform: translateX(2px) scaleY(0.996);
          }
          100% {
            transform: translateX(0);
          }
        }

        .glitch-text {
          position: relative;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes typewriter {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes glow-pulse {
          0% {
            text-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
            filter: brightness(1);
          }
          50% {
            text-shadow: 0 0 25px rgba(0, 255, 0, 1),
              0 0 35px rgba(0, 255, 255, 0.6);
            filter: brightness(1.2);
          }
          100% {
            text-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
            filter: brightness(1);
          }
        }

        @keyframes rainbow-text {
          0% {
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
          50% {
            background-position: 100% 50%;
            filter: hue-rotate(180deg);
          }
          100% {
            background-position: 0% 50%;
            filter: hue-rotate(360deg);
          }
        }

        /* Efectos de hover mejorados */
        .group:hover .floating-particle {
          animation-duration: 2s !important;
        }

        /* Efectos de terminal mejorados */
        .terminal-cursor {
          animation: cursor-blink 1s infinite;
        }

        @keyframes cursor-blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        /* Efecto de chromatic aberration */
        .chromatic-text {
          position: relative;
        }

        .chromatic-text::before {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 2px;
          color: #ff0000;
          opacity: 0.7;
          z-index: -1;
        }

        .chromatic-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: -2px;
          color: #00ffff;
          opacity: 0.7;
          z-index: -1;
        }

        /* Efectos de neón pulsante */
        .neon-border {
          box-shadow: 0 0 5px currentColor, 0 0 10px currentColor,
            0 0 15px currentColor, 0 0 20px currentColor;
          animation: neon-flicker 2s ease-in-out infinite alternate;
        }

        @keyframes neon-flicker {
          0%,
          100% {
            opacity: 1;
            filter: brightness(1);
          }
          50% {
            opacity: 0.8;
            filter: brightness(1.2);
          }
        }

        /* Efectos de interferencia TV retro */
        .tv-static {
          position: relative;
          overflow: hidden;
        }

        .tv-static::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
              circle,
              transparent 0%,
              rgba(255, 255, 255, 0.01) 100%
            ),
            linear-gradient(
              0deg,
              transparent 49%,
              rgba(255, 255, 255, 0.02) 50%,
              transparent 51%
            );
          background-size: 100% 100%, 100% 2px;
          animation: tv-static 0.15s linear infinite;
          pointer-events: none;
          mix-blend-mode: screen;
        }

        @keyframes tv-static {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-1px, 1px);
          }
          50% {
            transform: translate(1px, -1px);
          }
          75% {
            transform: translate(-1px, -1px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        /* Efectos de hologram */
        .hologram {
          background: linear-gradient(
            45deg,
            rgba(0, 255, 255, 0.1) 0%,
            rgba(255, 0, 255, 0.1) 25%,
            rgba(255, 255, 0, 0.1) 50%,
            rgba(0, 255, 255, 0.1) 75%,
            rgba(255, 0, 255, 0.1) 100%
          );
          background-size: 200% 200%;
          animation: hologram-shift 4s ease-in-out infinite;
          position: relative;
        }

        @keyframes hologram-shift {
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

        .hologram::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          animation: hologram-scan 3s ease-in-out infinite;
        }

        @keyframes hologram-scan {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: -100%;
          }
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .grid-bg {
            background-size: 30px 30px;
          }

          @keyframes grid-move {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(30px, 30px);
            }
          }
        }

        /* Performance optimizations */
        .floating-particle,
        .matrix-rain,
        .scan-lines {
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
