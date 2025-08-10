"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  ArrowLeftIcon,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { saveScore } from "@/app/leaderboard/actions";
import { ScoreModal } from "@/components/score-modal";
import { useIsMobile } from "@/hooks/use-mobile";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const isMobile = useIsMobile();

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    setShowScoreModal(false);
  };

  const changeDirection = (newDirection: Direction) => {
    if (!isPlaying) return;

    setDirection((prev) => {
      // Evitar movimiento en dirección opuesta
      if (
        (prev === "UP" && newDirection === "DOWN") ||
        (prev === "DOWN" && newDirection === "UP") ||
        (prev === "LEFT" && newDirection === "RIGHT") ||
        (prev === "RIGHT" && newDirection === "LEFT")
      ) {
        return prev;
      }
      return newDirection;
    });
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying) return;

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Check wall collision
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      // Check self collision
      if (
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood());
        setScore((prev) => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPlaying, generateFood, highScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isMobile) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          changeDirection("UP");
          break;
        case "ArrowDown":
          e.preventDefault();
          changeDirection("DOWN");
          break;
        case "ArrowLeft":
          e.preventDefault();
          changeDirection("LEFT");
          break;
        case "ArrowRight":
          e.preventDefault();
          changeDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, isMobile]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    if (gameOver) {
      setShowScoreModal(true);
    }
  }, [gameOver]);

  const handleSaveScore = async (enteredUserName: string) => {
    if (score > 0) {
      await saveScore(enteredUserName, "Snake", score);
    }
    setShowScoreModal(false);
    resetGame();
  };

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
                Volver
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
                <div
                  className='grid bg-gray-900 border-2 border-green-400 w-full h-full'
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  }}
                >
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map(
                    (_, index) => {
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
                    }
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controles inmediatamente debajo del juego */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-4'>
            <CardContent className='p-4'>
              <div className='grid grid-cols-2 gap-3 mb-4'>
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className='bg-green-600 hover:bg-green-700 text-sm py-3'
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

                <Button
                  onClick={resetGame}
                  className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm py-3'
                >
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Reiniciar
                </Button>
              </div>

              {/* Controles táctiles */}
              <div className='flex justify-center mb-4'>
                <div className='grid grid-cols-3 gap-2 w-48'>
                  <div></div>
                  <Button
                    onTouchStart={() => changeDirection("UP")}
                    onClick={() => changeDirection("UP")}
                    className='bg-green-600 hover:bg-green-700 active:bg-green-800 p-3 h-12'
                    disabled={!isPlaying || gameOver}
                  >
                    <ArrowUp className='h-6 w-6' />
                  </Button>
                  <div></div>

                  <Button
                    onTouchStart={() => changeDirection("LEFT")}
                    onClick={() => changeDirection("LEFT")}
                    className='bg-green-600 hover:bg-green-700 active:bg-green-800 p-3 h-12'
                    disabled={!isPlaying || gameOver}
                  >
                    <ArrowLeftIcon className='h-6 w-6' />
                  </Button>
                  <div></div>
                  <Button
                    onTouchStart={() => changeDirection("RIGHT")}
                    onClick={() => changeDirection("RIGHT")}
                    className='bg-green-600 hover:bg-green-700 active:bg-green-800 p-3 h-12'
                    disabled={!isPlaying || gameOver}
                  >
                    <ArrowRight className='h-6 w-6' />
                  </Button>

                  <div></div>
                  <Button
                    onTouchStart={() => changeDirection("DOWN")}
                    onClick={() => changeDirection("DOWN")}
                    className='bg-green-600 hover:bg-green-700 active:bg-green-800 p-3 h-12'
                    disabled={!isPlaying || gameOver}
                  >
                    <ArrowDown className='h-6 w-6' />
                  </Button>
                  <div></div>
                </div>
              </div>

              {/* Stats compactas */}
              <div className='grid grid-cols-2 gap-4 text-center'>
                <div>
                  <div className='text-2xl font-bold text-green-400'>
                    {score}
                  </div>
                  <div className='text-xs text-white/60'>Puntos</div>
                </div>
                <div>
                  <div className='text-2xl font-bold text-green-300'>
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
                  Controla la serpiente verde 🐍
                </p>
                <div className='text-xs text-white/60 space-y-1'>
                  <p>
                    🍎 Come comida roja = +10 puntos • 💀 Evita paredes y tu
                    cuerpo
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
      <header className='w-full px-4 py-6 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-between'>
            <Link href='/'>
              <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Volver
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
                <CardHeader className='pb-2 sm:pb-4'>
                  <CardTitle className='text-white text-lg sm:text-xl'>
                    Puntuación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl sm:text-3xl font-bold text-green-400 mb-2'>
                    {score}
                  </div>
                  <div className='text-sm text-white/60'>
                    Mejor: {highScore}
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
                    onClick={() => setIsPlaying(!isPlaying)}
                    className='w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3'
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

                  <Button
                    onClick={resetGame}
                    className='w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base py-2 sm:py-3'
                  >
                    <RotateCcw className='h-4 w-4 mr-2' />
                    Reiniciar
                  </Button>

                  <div className='text-xs sm:text-sm text-white/60 space-y-1'>
                    <p>• Usa las flechas del teclado para moverte</p>
                    <p>• Come la comida roja para crecer</p>
                    <p>• Evita chocar con las paredes o contigo mismo</p>
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
                    <p>🐍 Controla la serpiente verde</p>
                    <p>🍎 Come la comida roja para crecer</p>
                    <p>⚡ Cada comida vale 10 puntos</p>
                    <p>💀 No choques con las paredes o contigo mismo</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Board - Orden 2 en móvil, centrado y con límites */}
            <div className='xl:col-span-3 xl:order-1 flex flex-col items-center justify-center min-h-0'>
              <Card className='bg-black/40 backdrop-blur-sm border-white/20 w-full max-w-lg mx-auto'>
                <CardContent className='p-2 sm:p-4 lg:p-6'>
                  {/* Contenedor del juego con aspect ratio fijo */}
                  <div className='w-full aspect-square max-w-md mx-auto'>
                    <div
                      className='grid bg-gray-900 border-2 border-green-400 w-full h-full'
                      style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                      }}
                    >
                      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map(
                        (_, index) => {
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
                        }
                      )}
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
        gameName='Snake Classic'
        hasScoreToSave={score > 0}
        onSave={handleSaveScore}
      />
      <Footer />
    </div>
  );
}
