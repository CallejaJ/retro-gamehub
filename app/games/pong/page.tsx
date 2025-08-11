"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
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

  // Estados para controles táctiles
  const [touchY, setTouchY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // Gestores de eventos táctiles para el canvas
  const handleCanvasTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!gameState.isPlaying || gameState.gameOver) return;

      e.preventDefault();
      e.stopPropagation();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const relativeY =
        ((touch.clientY - rect.top) / rect.height) * canvasSize.height;

      setTouchY(relativeY);
      setIsDragging(true);
    },
    [gameState.isPlaying, gameState.gameOver, canvasSize.height]
  );

  const handleCanvasTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!gameState.isPlaying || gameState.gameOver || !isDragging) return;

      e.preventDefault();
      e.stopPropagation();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const relativeY =
        ((touch.clientY - rect.top) / rect.height) * canvasSize.height;

      setTouchY(relativeY);

      // Actualizar posición de la paleta del jugador
      const newPaddleY = Math.max(
        0,
        Math.min(canvasSize.height - paddleHeight, relativeY - paddleHeight / 2)
      );
      setGameState((prev) => ({ ...prev, playerY: newPaddleY }));
    },
    [
      gameState.isPlaying,
      gameState.gameOver,
      isDragging,
      canvasSize.height,
      paddleHeight,
    ]
  );

  const handleCanvasTouchEnd = useCallback(() => {
    setIsDragging(false);
    setTouchY(null);
  }, []);

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

    // Draw touch indicator if dragging
    if (isDragging && touchY !== null) {
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, touchY);
      ctx.lineTo(PADDLE_WIDTH * 3, touchY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [gameState, canvasSize, paddleHeight, isDragging, touchY]);

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
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4 mr-2' />
                      {gameState.gameOver ? "Restart" : "Play"}
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetGame}
                  className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm py-3'
                >
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Reset
                </Button>
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
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4'>
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
                    className='w-full max-w-full h-auto bg-black border-2 border-white rounded-lg'
                    style={{
                      maxWidth: `${canvasSize.width}px`,
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
              <CardHeader className='pb-2 sm:pb-4'>
                <CardTitle className='text-white text-lg sm:text-xl'>
                  Controls
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
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4 mr-2' />
                      {gameState.gameOver ? "Restart" : "Play"}
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetGame}
                  className='w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base py-2 sm:py-3'
                >
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Reset
                </Button>

                <div className='text-xs sm:text-sm text-white/60 space-y-1'>
                  <p>• ↑ ↓ Move paddle</p>
                  <p>• First player to 10 wins</p>
                  <p>• Ball speeds up with each hit</p>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader className='pb-2 sm:pb-4'>
                <CardTitle className='text-white text-lg sm:text-xl'>
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-xs sm:text-sm text-white/80 space-y-2'>
                  <p>🏓 Control the left paddle</p>
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
