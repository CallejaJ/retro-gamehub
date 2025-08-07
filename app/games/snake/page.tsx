"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer"; // Importar el nuevo componente Footer

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
      if (!isPlaying) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setDirection((prev) => (prev !== "DOWN" ? "UP" : prev));
          break;
        case "ArrowDown":
          e.preventDefault();
          setDirection((prev) => (prev !== "UP" ? "DOWN" : prev));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setDirection((prev) => (prev !== "RIGHT" ? "LEFT" : prev));
          break;
        case "ArrowRight":
          e.preventDefault();
          setDirection((prev) => (prev !== "LEFT" ? "RIGHT" : prev));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-4 flex flex-col'>
      <div className='container mx-auto max-w-4xl flex-grow'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <Link href='/'>
            <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
            </Button>
          </Link>
          <h1 className='text-3xl font-bold text-white'>Snake Classic</h1>
          <div className='w-20'></div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Game Board */}
          <div className='lg:col-span-2'>
            <Card className='bg-black/40 backdrop-blur-sm border-white/20'>
              <CardContent className='p-6'>
                <div
                  className='grid bg-gray-900 border-2 border-green-400 mx-auto'
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    width: "400px",
                    height: "400px",
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

                {gameOver && (
                  <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                    <Card className='bg-red-900/90 border-red-500'>
                      <CardContent className='p-6 text-center'>
                        <h3 className='text-2xl font-bold text-white mb-4'>
                          ¡Game Over!
                        </h3>
                        <p className='text-white/80 mb-4'>
                          Puntuación: {score}
                        </p>
                        <Button
                          onClick={resetGame}
                          className='bg-green-600 hover:bg-green-700'
                        >
                          <RotateCcw className='h-4 w-4 mr-2' />
                          Jugar de Nuevo
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Info */}
          <div className='space-y-6'>
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white'>Puntuación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-green-400 mb-2'>
                  {score}
                </div>
                <div className='text-sm text-white/60'>Mejor: {highScore}</div>
              </CardContent>
            </Card>

            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white'>Controles</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className='w-full bg-green-600 hover:bg-green-700'
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
                  className='w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60'
                >
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Reiniciar
                </Button>

                <div className='text-sm text-white/60 space-y-1'>
                  <p>• Usa las flechas del teclado para moverte</p>
                  <p>• Come la comida roja para crecer</p>
                  <p>• Evita chocar con las paredes o contigo mismo</p>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white'>Instrucciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-sm text-white/80 space-y-2'>
                  <p>🐍 Controla la serpiente verde</p>
                  <p>🍎 Come la comida roja para crecer</p>
                  <p>⚡ Cada comida vale 10 puntos</p>
                  <p>💀 No choques con las paredes o contigo mismo</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
