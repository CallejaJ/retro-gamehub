"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ScoreModal } from "@/components/score-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useTetris,
  TETROMINOES,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  type TetrominoType,
} from "@/hooks/use-tetris";

function NextPiecePreview({
  type,
  cellClass = "w-3 h-3",
}: {
  type: TetrominoType;
  cellClass?: string;
}) {
  return (
    <div className='flex justify-center'>
      <div
        className='grid gap-1 p-2 rounded'
        style={{ backgroundColor: TETROMINOES[type].color + "20" }}
      >
        {TETROMINOES[type].shape.map((row, y) => (
          <div key={y} className='flex'>
            {row.map((cell, x) => (
              <div
                key={x}
                className={`${cellClass} border`}
                style={{
                  backgroundColor: cell
                    ? TETROMINOES[type].color
                    : "transparent",
                  borderColor: cell ? TETROMINOES[type].color : "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TetrisGame() {
  const isMobile = useIsMobile();
  const {
    nextPiece,
    score,
    level,
    lines,
    highScore,
    gameOver,
    isPlaying,
    showScoreModal,
    isFastDrop,
    isDragging,
    isHorizontalMoving,
    dragDirection,
    startGame,
    resetGame,
    handleSaveScore,
    renderBoard,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useTetris({ keyboardEnabled: !isMobile });

  const boardCells = renderBoard().map((row, y) =>
    row.map((cell, x) => (
      <div
        key={`${y}-${x}`}
        className='border border-gray-700/30'
        style={{ backgroundColor: cell || "#1a1a1a" }}
      />
    ))
  );

  const playPauseButton = (
    <Button
      onClick={startGame}
      className='w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base py-2 sm:py-3'
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

  if (isMobile) {
    // Layout específico para móvil
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col'>
        {/* Header */}
        <header className='w-full px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/'>
              <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Volver
              </Button>
            </Link>
            <h1 className='text-xl font-bold text-white'>Tetris Classic</h1>
            <div className='w-16'></div>
          </div>
        </header>

        {/* Contenido principal móvil */}
        <main className='flex-1 px-4 pb-4 flex flex-col'>
          {/* Game Board */}
          <Card className='bg-black/40 backdrop-blur-sm border-white/20 mb-4'>
            <CardContent className='p-4'>
              <div
                className='w-full max-w-xs mx-auto'
                style={{ aspectRatio: "1/2" }}
              >
                <div
                  className='grid gap-0 bg-gray-900 p-1 border-2 border-purple-400 w-full h-full touch-none select-none relative'
                  style={{
                    gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                    gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
                    touchAction: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none",
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {boardCells}

                  {/* Indicadores visuales */}
                  {isFastDrop && (
                    <div className='absolute inset-0 bg-blue-500/20 border-2 border-blue-400 rounded animate-pulse flex items-center justify-center'>
                      <div className='text-white font-bold text-base'>
                        ⚡ FAST DROP
                        <div className='text-xs mt-1'>
                          Mueve horizontalmente para reposicionar
                        </div>
                      </div>
                    </div>
                  )}

                  {isDragging && isHorizontalMoving && dragDirection && (
                    <div className='absolute inset-0 bg-green-500/20 border-2 border-green-400 rounded flex items-center justify-center'>
                      <div className='text-white font-bold text-base'>
                        {dragDirection === "left"
                          ? "← MOVING LEFT"
                          : "MOVING RIGHT →"}
                      </div>
                    </div>
                  )}
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

              {/* Instrucciones de gestos para móvil */}
              <div className='mt-4 text-center'>
                <p className='text-white/80 text-sm mb-2'>
                  Controles táctiles optimizados 🎮
                </p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>
                    👆 <strong>Tap</strong> = Rotar pieza
                  </p>
                  <p>
                    👈👉 <strong>Mantén + Arrastra</strong> = Movimiento
                    continuo horizontal
                  </p>
                  <p>
                    👇 <strong>Swipe abajo</strong> = Caída rápida
                  </p>
                  <p>
                    ✋ <strong>Mantén vertical</strong> = Fast drop + movimiento
                    libre
                  </p>
                </div>
              </div>

              {/* Stats compactas */}
              <div className='grid grid-cols-3 gap-4 text-center mt-3 mb-2'>
                <div>
                  <div className='text-xl font-bold text-purple-400'>
                    {score}
                  </div>
                  <div className='text-xs text-white/60'>Puntos</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-white'>{level}</div>
                  <div className='text-xs text-white/60'>Nivel</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-white'>{lines}</div>
                  <div className='text-xs text-white/60'>Líneas</div>
                </div>
              </div>

              {/* Siguiente pieza si existe */}
              {nextPiece && (
                <div className='text-center'>
                  <div className='text-white text-sm mb-2'>Siguiente:</div>
                  <NextPiecePreview type={nextPiece} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instrucciones compactas */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-white/80 text-sm mb-2'>
                  Encaja las piezas 🧩
                </p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>👆 Tap para rotar • 👈👉 Mantén + arrastra para mover</p>
                  <p>
                    👇 Swipe para acelerar • ✋ Hold vertical = fast drop +
                    control libre
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
          gameName='Tetris Classic'
          hasScoreToSave={score > 0}
          onSave={handleSaveScore}
        />
        <Footer />
      </div>
    );
  }

  // Layout original para desktop
  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col'>
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
              Tetris Classic
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
                <CardContent className='space-y-2'>
                  <div className='flex items-end justify-between'>
                    <div className='text-2xl sm:text-3xl font-bold text-purple-400'>
                      {score}
                    </div>
                    <div className='text-sm text-white/60'>
                      Mejor: {highScore}
                    </div>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-white/80'>
                      Nivel: <span className='text-white font-semibold'>{level}</span>
                    </span>
                    <span className='text-white/80'>
                      Líneas: <span className='text-white font-semibold'>{lines}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {nextPiece && (
                <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-white text-lg'>
                      Siguiente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NextPiecePreview
                      type={nextPiece}
                      cellClass='w-3 h-3 sm:w-4 sm:h-4'
                    />
                  </CardContent>
                </Card>
              )}

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
                    <p>⌨️ ← → Mover pieza</p>
                    <p>⬇️ Caída rápida</p>
                    <p>🔄 ↑ / Espacio: Rotar</p>
                    <p>⚡ Completa líneas para puntos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Board - Orden 2 en móvil, centrado y con límites */}
            <div className='xl:col-span-3 xl:order-1 flex flex-col items-center justify-start min-h-0'>
              <Card className='bg-black/40 backdrop-blur-sm border-white/20 w-full max-w-sm mx-auto'>
                <CardContent className='p-2 sm:p-3'>
                  {/* Tablero 1:2 limitado por ancho y alto de viewport */}
                  <div
                    className='mx-auto'
                    style={{
                      aspectRatio: "1/2",
                      width: "min(100%, 20rem, calc((100vh - 160px) / 2))",
                    }}
                  >
                    <div
                      className='grid gap-0 bg-gray-900 p-1 border-2 border-purple-400 w-full h-full'
                      style={{
                        gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                        gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
                      }}
                    >
                      {boardCells}
                    </div>
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
        gameName='Tetris Classic'
        hasScoreToSave={score > 0}
        onSave={handleSaveScore}
      />
      <Footer />
    </div>
  );
}
