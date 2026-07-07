"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ScoreModal } from "@/components/score-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePong } from "@/hooks/use-pong";

export default function PongGame() {
  const isMobile = useIsMobile();
  const {
    canvasRef,
    canvasSize,
    gameState,
    highScore,
    showScoreModal,
    togglePlay,
    resetGame,
    handleSaveScore,
    handleCanvasTouchStart,
    handleCanvasTouchMove,
    handleCanvasTouchEnd,
  } = usePong();

  const playPauseButton = (
    <Button
      onClick={togglePlay}
      className='w-full bg-gray-600 hover:bg-gray-700 text-sm sm:text-base py-2 sm:py-3'
      disabled={gameState.gameOver}
    >
      {gameState.isPlaying ? (
        <>
          <Pause className='h-4 w-4 mr-2' />
          Pause
        </>
      ) : (
        <>
          <Play className='h-4 w-4 mr-2' />
          {gameState.gameOver ? "Restart" : "Play"}
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
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col'>
        {/* Header */}
        <header className='w-full px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/'>
              <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back
              </Button>
            </Link>
            <h1 className='text-xl font-bold text-white'>Pong Retro</h1>
            <div className='w-16'></div>
          </div>
        </header>

        {/* Contenido principal móvil */}
        <main className='flex-1 px-4 pb-4 flex flex-col'>
          {/* Game Canvas */}
          <Card className='bg-black/40 backdrop-blur-sm border-white/20 mb-4'>
            <CardContent className='p-4'>
              <div className='flex justify-center'>
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className='w-full max-w-full h-auto bg-black border-2 border-white rounded-lg touch-none select-none'
                  style={{
                    maxWidth: `${canvasSize.width}px`,
                    aspectRatio: `${canvasSize.width}/${canvasSize.height}`,
                    touchAction: "none",
                  }}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasTouchEnd}
                />
              </div>

              {/* Instrucciones de control táctil */}
              <div className='mt-4 text-center'>
                <p className='text-white/80 text-sm mb-2'>Touch Controls 🎮</p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>
                    👆👇 <strong>Touch and drag</strong> = Move your paddle
                    (left)
                  </p>
                  <p>🏓 Follow the ball position to defend your side</p>
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
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <div className='text-xl font-bold text-white'>
                    {gameState.playerScore}
                  </div>
                  <div className='text-xs text-white/60'>Your Score</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-white'>
                    {gameState.aiScore}
                  </div>
                  <div className='text-xs text-white/60'>AI Score</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-gray-300'>
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
                  Control your paddle (left side) 🏓
                </p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>
                    🏓 You vs AI • ⚡ First to 10 wins • 🤖 AI adapts to your
                    play
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <ScoreModal
          isOpen={showScoreModal}
          onClose={resetGame}
          score={gameState.playerScore}
          gameName='Pong Retro'
          hasScoreToSave={gameState.playerScore > 0}
          onSave={handleSaveScore}
        />
        <Footer />
      </div>
    );
  }

  // Layout original para desktop
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-2 sm:p-4 flex flex-col'>
      <div className='container mx-auto max-w-7xl flex-grow'>
        {/* Header mejorado */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-4'>
          <Link href='/'>
            <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
          </Link>
          <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center flex-1'>
            Pong Retro
          </h1>
          <div className='w-20 hidden sm:block'></div>
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6'>
          {/* Game Canvas */}
          <div className='xl:col-span-3 order-2 xl:order-1'>
            <Card className='bg-black/40 backdrop-blur-sm border-white/20'>
              <CardContent className='p-2 sm:p-4 lg:p-6'>
                <div className='flex justify-center mb-4'>
                  <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className='max-w-full h-auto bg-black border-2 border-white rounded-lg'
                    style={{
                      width: "auto",
                      maxWidth: `min(${canvasSize.width}px, 100%)`,
                      maxHeight: "calc(100vh - 200px)",
                      aspectRatio: `${canvasSize.width}/${canvasSize.height}`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info - Responsive */}
          <div className='space-y-4 sm:space-y-6 order-1 xl:order-2'>
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader className='pb-2 sm:pb-4'>
                <CardTitle className='text-white text-lg sm:text-xl'>
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-center space-y-2'>
                  <div className='text-xl sm:text-2xl font-bold text-white'>
                    {gameState.playerScore} - {gameState.aiScore}
                  </div>
                  <div className='text-sm text-white/60'>Best: {highScore}</div>
                  <div className='text-xs text-white/50'>(You - AI)</div>
                </div>
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
                  <p>⌨️ ↑ ↓ Move your paddle (left)</p>
                  <p>🤖 AI controls the right paddle</p>
                  <p>⚡ Don't let the ball pass</p>
                  <p>🏆 First to 10 points wins</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ScoreModal
        isOpen={showScoreModal}
        onClose={resetGame}
        score={gameState.playerScore}
        gameName='Pong Retro'
        hasScoreToSave={gameState.playerScore > 0}
        onSave={handleSaveScore}
      />
      <Footer />
    </div>
  );
}
