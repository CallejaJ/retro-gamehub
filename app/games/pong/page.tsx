"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { saveScore } from "@/app/leaderboard/actions";
import { ScoreModal } from "@/components/score-modal";

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [paddleHeight, setPaddleHeight] = useState(80);
  const [gameState, setGameState] = useState({
    playerY: 0,
    aiY: 0,
    ballX: 0,
    ballY: 0,
    ballVX: 5,
    ballVY: 3,
    playerScore: 0,
    aiScore: 0,
    gameOver: false,
    isPlaying: false,
  });
  const [highScore, setHighScore] = useState(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const [showScoreModal, setShowScoreModal] = useState(false);

  const PADDLE_WIDTH = 10;
  const BALL_SIZE = 10;

  // Detectar si es móvil
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Actualizar tamaño del canvas y elementos según la pantalla
  useEffect(() => {
    const updateCanvasSize = () => {
      const isMobileCheck = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;

      let newCanvasSize, newPaddleHeight;

      if (isMobileCheck) {
        newCanvasSize = {
          width: Math.min(350, window.innerWidth - 40),
          height: 250,
        };
        newPaddleHeight = 60;
      } else if (isTablet) {
        newCanvasSize = { width: 600, height: 300 };
        newPaddleHeight = 70;
      } else {
        newCanvasSize = { width: 800, height: 400 };
        newPaddleHeight = 80;
      }

      setCanvasSize(newCanvasSize);
      setPaddleHeight(newPaddleHeight);

      // Resetear posiciones cuando cambie el tamaño
      setGameState((prev) => ({
        ...prev,
        playerY: newCanvasSize.height / 2 - newPaddleHeight / 2,
        aiY: newCanvasSize.height / 2 - newPaddleHeight / 2,
        ballX: newCanvasSize.width / 2,
        ballY: newCanvasSize.height / 2,
      }));
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const resetGame = () => {
    setGameState({
      playerY: canvasSize.height / 2 - paddleHeight / 2,
      aiY: canvasSize.height / 2 - paddleHeight / 2,
      ballX: canvasSize.width / 2,
      ballY: canvasSize.height / 2,
      ballVX: Math.random() > 0.5 ? 5 : -5,
      ballVY: (Math.random() - 0.5) * 6,
      playerScore: 0,
      aiScore: 0,
      gameOver: false,
      isPlaying: false,
    });
    setShowScoreModal(false);
  };

  // Funciones para controles móviles
  const movePlayerUp = () => {
    if (!gameState.isPlaying || gameState.gameOver) return;
    setGameState((prev) => ({
      ...prev,
      playerY: Math.max(0, prev.playerY - 15),
    }));
  };

  const movePlayerDown = () => {
    if (!gameState.isPlaying || gameState.gameOver) return;
    setGameState((prev) => ({
      ...prev,
      playerY: Math.min(canvasSize.height - paddleHeight, prev.playerY + 15),
    }));
  };

  const updateGame = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    setGameState((prev) => {
      let newState = { ...prev };

      // Player paddle movement (solo teclado en desktop)
      if (window.innerWidth >= 768) {
        if (keysPressed.current.has("ArrowUp") && newState.playerY > 0) {
          newState.playerY -= 8;
        }
        if (
          keysPressed.current.has("ArrowDown") &&
          newState.playerY < canvasSize.height - paddleHeight
        ) {
          newState.playerY += 8;
        }
      }

      // AI paddle movement (simple AI)
      const aiCenter = newState.aiY + paddleHeight / 2;
      const ballCenter = newState.ballY;
      const aiSpeed = 4;

      if (ballCenter < aiCenter - 10) {
        newState.aiY = Math.max(0, newState.aiY - aiSpeed);
      } else if (ballCenter > aiCenter + 10) {
        newState.aiY = Math.min(
          canvasSize.height - paddleHeight,
          newState.aiY + aiSpeed
        );
      }

      // Ball movement
      newState.ballX += newState.ballVX;
      newState.ballY += newState.ballVY;

      // Ball collision with top and bottom walls
      if (
        newState.ballY <= 0 ||
        newState.ballY >= canvasSize.height - BALL_SIZE
      ) {
        newState.ballVY = -newState.ballVY;
      }

      // Ball collision with player paddle
      if (
        newState.ballX <= PADDLE_WIDTH &&
        newState.ballY + BALL_SIZE >= newState.playerY &&
        newState.ballY <= newState.playerY + paddleHeight
      ) {
        newState.ballVX = -newState.ballVX;
        const hitPos = (newState.ballY - newState.playerY) / paddleHeight;
        newState.ballVY = (hitPos - 0.5) * 10;
      }

      // Ball collision with AI paddle
      if (
        newState.ballX + BALL_SIZE >= canvasSize.width - PADDLE_WIDTH &&
        newState.ballY + BALL_SIZE >= newState.aiY &&
        newState.ballY <= newState.aiY + paddleHeight
      ) {
        newState.ballVX = -newState.ballVX;
        const hitPos = (newState.ballY - newState.aiY) / paddleHeight;
        newState.ballVY = (hitPos - 0.5) * 10;
      }

      // Ball out of bounds (scoring)
      if (newState.ballX < 0) {
        newState.aiScore++;
        newState.ballX = canvasSize.width / 2;
        newState.ballY = canvasSize.height / 2;
        newState.ballVX = 5;
        newState.ballVY = (Math.random() - 0.5) * 6;
      } else if (newState.ballX > canvasSize.width) {
        newState.playerScore++;
        if (newState.playerScore > highScore) {
          setHighScore(newState.playerScore);
        }
        newState.ballX = canvasSize.width / 2;
        newState.ballY = canvasSize.height / 2;
        newState.ballVX = -5;
        newState.ballVY = (Math.random() - 0.5) * 6;
      }

      // Check win condition
      if (newState.playerScore >= 10 || newState.aiScore >= 10) {
        newState.gameOver = true;
        newState.isPlaying = false;
      }

      return newState;
    });
  }, [
    gameState.isPlaying,
    gameState.gameOver,
    highScore,
    canvasSize,
    paddleHeight,
  ]);

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const gameLoop = setInterval(updateGame, 16); // ~60fps
    return () => clearInterval(gameLoop);
  }, [gameState.isPlaying, gameState.gameOver, updateGame]);

  // Keyboard controls (solo desktop)
  useEffect(() => {
    if (window.innerWidth < 768) return; // No keyboard en móvil

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState.gameOver) {
      setShowScoreModal(true);
    }
  }, [gameState.gameOver]);

  const handleSaveScore = async (enteredUserName: string) => {
    if (gameState.playerScore > 0) {
      await saveScore(enteredUserName, "Pong Retro", gameState.playerScore);
    }
    setShowScoreModal(false);
    resetGame();
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw center line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvasSize.width / 2, 0);
    ctx.lineTo(canvasSize.width / 2, canvasSize.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, gameState.playerY, PADDLE_WIDTH, paddleHeight);
    ctx.fillRect(
      canvasSize.width - PADDLE_WIDTH,
      gameState.aiY,
      PADDLE_WIDTH,
      paddleHeight
    );

    // Draw ball
    ctx.fillRect(gameState.ballX, gameState.ballY, BALL_SIZE, BALL_SIZE);

    // Draw scores
    const fontSize = Math.min(48, canvasSize.width / 16);
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(
      gameState.playerScore.toString(),
      canvasSize.width / 4,
      fontSize + 10
    );
    ctx.fillText(
      gameState.aiScore.toString(),
      (3 * canvasSize.width) / 4,
      fontSize + 10
    );
  }, [gameState, canvasSize, paddleHeight]);

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
                Volver
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
                  className='w-full max-w-full h-auto bg-black border-2 border-white rounded-lg'
                  style={{
                    maxWidth: `${canvasSize.width}px`,
                    aspectRatio: `${canvasSize.width}/${canvasSize.height}`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Controles inmediatamente debajo del juego */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-4'>
            <CardContent className='p-4'>
              <div className='grid grid-cols-2 gap-3 mb-4'>
                <Button
                  onClick={() =>
                    setGameState((prev) => ({
                      ...prev,
                      isPlaying: !prev.isPlaying,
                    }))
                  }
                  className='bg-gray-600 hover:bg-gray-700 text-sm py-3'
                  disabled={gameState.gameOver}
                >
                  {gameState.isPlaying ? (
                    <>
                      <Pause className='h-4 w-4 mr-2' />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4 mr-2' />
                      {gameState.gameOver ? "Reiniciar" : "Jugar"}
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetGame}
                  className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm py-3'
                >
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Reiniciar
                </Button>
              </div>

              {/* Controles táctiles */}
              <div className='flex justify-center gap-4 mb-4'>
                <div className='flex flex-col gap-2'>
                  <span className='text-white text-xs text-center mb-1'>
                    Tu Paleta
                  </span>
                  <Button
                    onTouchStart={movePlayerUp}
                    onClick={movePlayerUp}
                    className='bg-gray-600 hover:bg-gray-700 active:bg-gray-800 p-3 h-12 w-16'
                    disabled={!gameState.isPlaying || gameState.gameOver}
                  >
                    <ArrowUp className='h-6 w-6' />
                  </Button>
                  <Button
                    onTouchStart={movePlayerDown}
                    onClick={movePlayerDown}
                    className='bg-gray-600 hover:bg-gray-700 active:bg-gray-800 p-3 h-12 w-16'
                    disabled={!gameState.isPlaying || gameState.gameOver}
                  >
                    <ArrowDown className='h-6 w-6' />
                  </Button>
                </div>
              </div>

              {/* Stats compactas */}
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <div className='text-xl font-bold text-white'>
                    {gameState.playerScore}
                  </div>
                  <div className='text-xs text-white/60'>Tu Score</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-white'>
                    {gameState.aiScore}
                  </div>
                  <div className='text-xs text-white/60'>IA Score</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-gray-300'>
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
                  Controla tu paleta (izquierda) 🏓
                </p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>
                    🏓 Tu paleta vs IA • ⚡ Primer jugador en 10 gana • 🤖 La IA
                    se adapta
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
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4'>
          <Link href='/'>
            <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
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
                    className='w-full max-w-full h-auto bg-black border-2 border-white rounded-lg'
                    style={{
                      maxWidth: `${canvasSize.width}px`,
                      aspectRatio: `${canvasSize.width}/${canvasSize.height}`,
                    }}
                  />
                </div>

                {/* Controles táctiles para móvil */}
                <div className='block md:hidden'>
                  <div className='flex justify-center gap-4'>
                    <div className='flex flex-col gap-2'>
                      <span className='text-white text-xs text-center mb-1'>
                        Tu Paleta
                      </span>
                      <Button
                        onTouchStart={movePlayerUp}
                        onClick={movePlayerUp}
                        className='bg-gray-600 hover:bg-gray-700 active:bg-gray-800 p-3 h-12 w-16'
                        disabled={!gameState.isPlaying || gameState.gameOver}
                      >
                        <ArrowUp className='h-6 w-6' />
                      </Button>
                      <Button
                        onTouchStart={movePlayerDown}
                        onClick={movePlayerDown}
                        className='bg-gray-600 hover:bg-gray-700 active:bg-gray-800 p-3 h-12 w-16'
                        disabled={!gameState.isPlaying || gameState.gameOver}
                      >
                        <ArrowDown className='h-6 w-6' />
                      </Button>
                    </div>
                  </div>

                  <div className='mt-4 text-center'>
                    <p className='text-white/80 text-sm'>
                      Controla tu paleta (izquierda) 🏓
                    </p>
                    <p className='text-white/60 text-xs mt-1'>
                      Evita que la pelota pase por tu lado
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info - Responsive */}
          <div className='space-y-4 sm:space-y-6 order-1 xl:order-2'>
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader className='pb-2 sm:pb-4'>
                <CardTitle className='text-white text-lg sm:text-xl'>
                  Puntuación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-center space-y-2'>
                  <div className='text-xl sm:text-2xl font-bold text-white'>
                    {gameState.playerScore} - {gameState.aiScore}
                  </div>
                  <div className='text-sm text-white/60'>
                    Mejor: {highScore}
                  </div>
                  <div className='text-xs text-white/50'>(Tu - IA)</div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader className='pb-2 sm:pb-4'>
                <CardTitle className='text-white text-lg sm:text-xl'>
                  Controles
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 sm:space-y-4'>
                <Button
                  onClick={() =>
                    setGameState((prev) => ({
                      ...prev,
                      isPlaying: !prev.isPlaying,
                    }))
                  }
                  className='w-full bg-gray-600 hover:bg-gray-700 text-sm sm:text-base py-2 sm:py-3'
                  disabled={gameState.gameOver}
                >
                  {gameState.isPlaying ? (
                    <>
                      <Pause className='h-4 w-4 mr-2' />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4 mr-2' />
                      {gameState.gameOver ? "Reiniciar" : "Jugar"}
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetGame}
                  className='w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base py-2 sm:py-3'
                >
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Reiniciar
                </Button>

                <div className='text-xs sm:text-sm text-white/60 space-y-1'>
                  <p className='hidden md:block'>• ↑ ↓ Mover paleta</p>
                  <p className='md:hidden'>
                    • Usa los botones para mover tu paleta
                  </p>
                  <p>• Primer jugador en llegar a 10 gana</p>
                  <p>• La pelota acelera con cada golpe</p>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader className='pb-2 sm:pb-4'>
                <CardTitle className='text-white text-lg sm:text-xl'>
                  Instrucciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-xs sm:text-sm text-white/80 space-y-2'>
                  <p>🏓 Controla la paleta izquierda</p>
                  <p>🤖 La IA controla la derecha</p>
                  <p>⚡ Evita que la pelota pase</p>
                  <p>🏆 Primer jugador en 10 puntos gana</p>
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
