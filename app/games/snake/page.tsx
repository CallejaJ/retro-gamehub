"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ScoreModal } from "@/components/score-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSnake, GRID_SIZE, type Position } from "@/hooks/use-snake";

interface SnakeBoardProps {
  snake: Position[];
  food: Position;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

function SnakeBoard({
  snake,
  food,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: SnakeBoardProps) {
  return (
    <div
      className='grid bg-gray-900 border-2 border-green-400 w-full h-full touch-none select-none'
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        touchAction: "none",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
        const x = index % GRID_SIZE;
        const y = Math.floor(index / GRID_SIZE);
        const isSnake = snake.some(
          (segment) => segment.x === x && segment.y === y
        );
        const isFood = food.x === x && food.y === y;
        const isHead = snake[0]?.x === x && snake[0]?.y === y;

        return (
          <div
            key={index}
            className={`border border-gray-800 ${
              isSnake
                ? isHead
                  ? "bg-green-400"
                  : "bg-green-600"
                : isFood
                ? "bg-red-500"
                : "bg-gray-900"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function SnakeGame() {
  const isMobile = useIsMobile();
  const {
    snake,
    food,
    score,
    highScore,
    gameOver,
    isPlaying,
    showScoreModal,
    togglePlay,
    resetGame,
    handleSaveScore,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSnake({ keyboardEnabled: !isMobile });

  const playPauseButton = (
    <Button
      onClick={togglePlay}
      className='w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3'
      disabled={gameOver}
    >
      {isPlaying ? (
        <>
          <Pause className='h-4 w-4 mr-2' />
          Pause
        </>
      ) : (
        <>
          <Play className='h-4 w-4 mr-2' />
          {gameOver ? "Restart" : "Play"}
        </>
      )}
    </Button>
  );

  const resetButton = (
    <Button
      onClick={resetGame}
      className='w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base py-2 sm:py-3'
    >
      <RotateCcw className='h-4 w-4 mr-2' />
      Reset
    </Button>
  );

  if (isMobile) {
    // Layout específico para móvil
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex flex-col'>
        {/* Header */}
        <header className='w-full px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/'>
              <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back
              </Button>
            </Link>
            <h1 className='text-xl font-bold text-white'>Snake Classic</h1>
            <div className='w-16'></div>
          </div>
        </header>

        {/* Contenido principal móvil */}
        <main className='flex-1 px-4 pb-4 flex flex-col'>
          {/* Game Board */}
          <Card className='bg-black/40 backdrop-blur-sm border-white/20 mb-4'>
            <CardContent className='p-4'>
              <div className='w-full aspect-square max-w-xs mx-auto'>
                <SnakeBoard
                  snake={snake}
                  food={food}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>

              {/* Instrucciones de gestos */}
              <div className='mt-4 text-center'>
                <p className='text-white/80 text-sm mb-2'>Swipe Controls 🎮</p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>
                    👆 <strong>Swipe up</strong> = Move up
                  </p>
                  <p>
                    👇 <strong>Swipe down</strong> = Move down
                  </p>
                  <p>
                    👈 <strong>Swipe left</strong> = Move left
                  </p>
                  <p>
                    👉 <strong>Swipe right</strong> = Move right
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controles inmediatamente debajo del juego */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-4'>
            <CardContent className='p-4'>
              <div className='grid grid-cols-2 gap-3 mb-4'>
                {playPauseButton}
                {resetButton}
              </div>

              {/* Stats compactas */}
              <div className='grid grid-cols-2 gap-4 text-center'>
                <div>
                  <div className='text-2xl font-bold text-green-400'>
                    {score}
                  </div>
                  <div className='text-xs text-white/60'>Score</div>
                </div>
                <div>
                  <div className='text-2xl font-bold text-green-300'>
                    {highScore}
                  </div>
                  <div className='text-xs text-white/60'>Best</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones compactas */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-white/80 text-sm mb-2'>
                  Control the green snake 🐍
                </p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>
                    🍎 Eat red food = +10 points • 🔄 Walls wrap around • 💀
                    Avoid your own body
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <ScoreModal
          isOpen={showScoreModal}
          onClose={resetGame}
          score={score}
          gameName='Snake Classic'
          hasScoreToSave={score > 0}
          onSave={handleSaveScore}
        />
        <Footer />
      </div>
    );
  }

  // Layout original para desktop
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex flex-col'>
      {/* Header mejorado con mejor espaciado */}
      <header className='w-full px-4 py-3 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-between'>
            <Link href='/'>
              <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back
              </Button>
            </Link>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center'>
              Snake Classic
            </h1>
            {/* Spacer para centrar el título */}
            <div className='w-20 sm:w-24'></div>
          </div>
        </div>
      </header>

      {/* Contenido principal con constraints de tamaño */}
      <main className='flex-1 px-2 sm:px-4 pb-4'>
        <div className='max-w-7xl mx-auto h-full'>
          <div className='grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 h-full'>
            {/* Panel de información - Orden 1 en móvil */}
            <div className='xl:col-span-1 xl:order-2 space-y-4 sm:space-y-6'>
              <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-white text-lg'>Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl sm:text-3xl font-bold text-green-400 mb-1'>
                    {score}
                  </div>
                  <div className='text-sm text-white/60'>Best: {highScore}</div>
                </CardContent>
              </Card>

              <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-white text-lg'>Controls</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {playPauseButton}
                  {resetButton}

                  <div className='text-xs sm:text-sm text-white/70 space-y-1'>
                    <p>⌨️ Use keyboard arrows to move</p>
                    <p>🍎 Eat red food = +10 points</p>
                    <p>🔄 Walls wrap around to the other side</p>
                    <p>💀 Don't hit your own body</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Board - Orden 2 en móvil, centrado y con límites */}
            <div className='xl:col-span-3 xl:order-1 flex flex-col items-center justify-start min-h-0'>
              <Card className='bg-black/40 backdrop-blur-sm border-white/20 w-full max-w-lg mx-auto'>
                <CardContent className='p-2 sm:p-3'>
                  {/* Contenedor cuadrado limitado por ancho y alto de viewport */}
                  <div
                    className='aspect-square mx-auto'
                    style={{
                      width: "min(100%, 28rem, calc(100vh - 180px))",
                    }}
                  >
                    <SnakeBoard snake={snake} food={food} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <ScoreModal
        isOpen={showScoreModal}
        onClose={resetGame}
        score={score}
        gameName='Snake Classic'
        hasScoreToSave={score > 0}
        onSave={handleSaveScore}
      />
      <Footer />
    </div>
  );
}
