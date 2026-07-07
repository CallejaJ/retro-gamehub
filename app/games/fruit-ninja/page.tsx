"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ScoreModal } from "@/components/score-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFruitNinja } from "@/hooks/use-fruit-ninja";

export default function FruitNinjaGame() {
  const isMobile = useIsMobile();
  const {
    canvasRef,
    canvasSize,
    score,
    lives,
    highScore,
    gameOver,
    isPlaying,
    showScoreModal,
    togglePlay,
    resetGame,
    handleSaveScore,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
  } = useFruitNinja(isMobile);

  const gameCanvas = (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className='max-w-full h-auto bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg cursor-crosshair touch-none border-2 border-white/20'
      style={{
        width: "auto",
        maxWidth: `min(${canvasSize.width}px, 100%)`,
        maxHeight: "calc(100vh - 180px)",
        aspectRatio: `${canvasSize.width}/${canvasSize.height}`,
      }}
      onMouseMove={handlePointerMove}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  );

  const playPauseButton = (
    <Button
      onClick={togglePlay}
      className='w-full bg-orange-600 hover:bg-orange-700 text-sm sm:text-base py-2 sm:py-3'
      disabled={gameOver}
    >
      {isPlaying ? (
        <>
          <Pause className='h-4 w-4 mr-2' />
          Pausar
        </>
      ) : (
        <>
          <Play className='h-4 w-4 mr-2' />
          {gameOver ? "Reiniciar" : "Jugar"}
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
      Reiniciar
    </Button>
  );

  const livesIndicator = (sizeClass: string) => (
    <div className='flex space-x-1 justify-center'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`${sizeClass} ${i < lives ? "opacity-100" : "opacity-30"}`}
        >
          ❤️
        </div>
      ))}
    </div>
  );

  if (isMobile) {
    // Layout específico para móvil
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex flex-col'>
        {/* Header */}
        <header className='w-full px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/'>
              <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Volver
              </Button>
            </Link>
            <h1 className='text-xl font-bold text-white'>Fruit Ninja</h1>
            <div className='w-16'></div>
          </div>
        </header>

        {/* Contenido principal móvil */}
        <main className='flex-1 px-4 pb-4 flex flex-col'>
          {/* Game Canvas */}
          <Card className='bg-black/40 backdrop-blur-sm border-white/20 mb-4'>
            <CardContent className='p-4'>
              <div className='flex justify-center'>{gameCanvas}</div>
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
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <div className='text-xl font-bold text-orange-400'>
                    {score}
                  </div>
                  <div className='text-xs text-white/60'>Puntos</div>
                </div>
                <div>
                  {livesIndicator("text-lg")}
                  <div className='text-xs text-white/60'>Vidas</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-orange-300'>
                    {highScore}
                  </div>
                  <div className='text-xs text-white/60'>Mejor</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones compactas */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-white/80 text-sm mb-2'>
                  Toca y arrastra para cortar las frutas 🍎
                </p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>
                    🍎 Corta frutas = +10 puntos • 💣 Evita bombas • ❤️ No dejes
                    caer frutas
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
          gameName='Fruit Ninja'
          hasScoreToSave={score > 0}
          onSave={handleSaveScore}
        />
        <Footer />
      </div>
    );
  }

  // Layout original para desktop
  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex flex-col'>
      {/* Header mejorado con mejor espaciado */}
      <header className='w-full px-4 py-3 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-between'>
            <Link href='/'>
              <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Volver
              </Button>
            </Link>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center'>
              Fruit Ninja
            </h1>
            {/* Spacer para centrar el título */}
            <div className='w-20 sm:w-24'></div>
          </div>
        </div>
      </header>

      {/* Contenido principal con constraints de tamaño */}
      <main className='flex-1 px-2 sm:px-4 pb-4 overflow-hidden'>
        <div className='max-w-7xl mx-auto h-full'>
          <div className='grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 h-full'>
            {/* Panel de información - Orden 1 en móvil */}
            <div className='xl:col-span-1 xl:order-2 space-y-4 sm:space-y-6 overflow-y-auto'>
              <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-white text-lg'>
                    Puntuación
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex items-center justify-between'>
                  <div>
                    <div className='text-2xl sm:text-3xl font-bold text-orange-400'>
                      {score}
                    </div>
                    <div className='text-sm text-white/60'>
                      Mejor: {highScore}
                    </div>
                  </div>
                  <div className='text-center'>
                    {livesIndicator("text-xl")}
                    <div className='text-xs text-white/60 mt-1'>Vidas</div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-white text-lg'>
                    Controles
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {playPauseButton}
                  {resetButton}

                  <div className='text-xs sm:text-sm text-white/70 space-y-1'>
                    <p>🍎 Corta frutas con el mouse = +10 puntos</p>
                    <p>💣 Evita las bombas o perderás</p>
                    <p>❤️ Pierdes vida si dejas caer frutas</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Canvas - Orden 2 en móvil, centrado y con límites */}
            <div className='xl:col-span-3 xl:order-1 flex flex-col items-center justify-start min-h-0'>
              <Card className='bg-black/40 backdrop-blur-sm border-white/20 w-full max-w-2xl mx-auto'>
                <CardContent className='p-2 sm:p-3'>
                  <div className='flex justify-center'>{gameCanvas}</div>
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
        gameName='Fruit Ninja'
        hasScoreToSave={score > 0}
        onSave={handleSaveScore}
      />
      <Footer />
    </div>
  );
}
