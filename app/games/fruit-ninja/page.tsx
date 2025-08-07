"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";

interface FruitItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "fruit" | "bomb";
  emoji: string;
  sliced: boolean;
  size: number;
}

const FRUITS = ["🍎", "🍊", "🍌", "🍇", "🍓", "🥝", "🍑", "🍒"];
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function FruitNinjaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [fruits, setFruits] = useState<FruitItem[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSlicing, setIsSlicing] = useState(false);

  const spawnFruit = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const isBomb = Math.random() < 0.15; // 15% chance of bomb
    const newFruit: FruitItem = {
      id: Date.now() + Math.random(),
      x: Math.random() * (CANVAS_WIDTH - 100) + 50,
      y: CANVAS_HEIGHT + 50,
      vx: (Math.random() - 0.5) * 8,
      vy: -15 - Math.random() * 10,
      type: isBomb ? "bomb" : "fruit",
      emoji: isBomb ? "💣" : FRUITS[Math.floor(Math.random() * FRUITS.length)],
      sliced: false,
      size: 40 + Math.random() * 20,
    };

    setFruits((prev) => [...prev, newFruit]);
  }, [isPlaying, gameOver]);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(false);
    setFruits([]);
  };

  const updateFruits = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setFruits((prev) => {
      const updated = prev
        .map((fruit) => ({
          ...fruit,
          x: fruit.x + fruit.vx,
          y: fruit.y + fruit.vy,
          vy: fruit.vy + 0.5, // gravity
        }))
        .filter((fruit) => {
          // Remove fruits that fell off screen
          if (fruit.y > CANVAS_HEIGHT + 100) {
            if (fruit.type === "fruit" && !fruit.sliced) {
              setLives((l) => l - 1);
            }
            return false;
          }
          return true;
        });

      return updated;
    });
  }, [isPlaying, gameOver]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  };

  const handleSlice = useCallback(
    (x: number, y: number) => {
      if (!isPlaying || gameOver) return;

      setFruits((prev) =>
        prev.map((fruit) => {
          if (fruit.sliced) return fruit;

          const distance = Math.sqrt(
            Math.pow(fruit.x - x, 2) + Math.pow(fruit.y - y, 2)
          );

          if (distance < fruit.size) {
            if (fruit.type === "fruit") {
              setScore((s) => {
                const newScore = s + 10;
                if (newScore > highScore) {
                  setHighScore(newScore);
                }
                return newScore;
              });
            } else {
              // Hit bomb
              setGameOver(true);
              setIsPlaying(false);
            }
            return { ...fruit, sliced: true };
          }
          return fruit;
        })
      );
    },
    [isPlaying, gameOver, highScore]
  );

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      updateFruits();

      // Spawn new fruits
      if (Math.random() < 0.02) {
        spawnFruit();
      }
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, updateFruits, spawnFruit]);

  // Check game over
  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
      setIsPlaying(false);
    }
  }, [lives]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw fruits
    fruits.forEach((fruit) => {
      ctx.save();
      ctx.translate(fruit.x, fruit.y);

      if (fruit.sliced) {
        ctx.globalAlpha = 0.5;
        ctx.rotate(Math.random() * Math.PI);
      }

      ctx.font = `${fruit.size}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fruit.emoji, 0, 0);

      ctx.restore();
    });

    // Draw slice trail
    if (isSlicing) {
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 20, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [fruits, mousePos, isSlicing]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-4 flex flex-col'>
      <div className='container mx-auto max-w-6xl flex-grow'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <Link href='/'>
            <Button className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
            </Button>
          </Link>
          <h1 className='text-3xl font-bold text-white'>Fruit Ninja</h1>
          <div className='w-20'></div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Game Canvas */}
          <div className='lg:col-span-3'>
            <Card className='bg-black/40 backdrop-blur-sm border-white/20'>
              <CardContent className='p-6'>
                <div className='relative'>
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className='w-full h-auto bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg cursor-crosshair'
                    onMouseMove={handleMouseMove}
                    onMouseDown={(e) => {
                      setIsSlicing(true);
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const rect = canvas.getBoundingClientRect();
                      const scaleX = CANVAS_WIDTH / rect.width;
                      const scaleY = CANVAS_HEIGHT / rect.height;
                      handleSlice(
                        (e.clientX - rect.left) * scaleX,
                        (e.clientY - rect.top) * scaleY
                      );
                    }}
                    onMouseUp={() => setIsSlicing(false)}
                    onMouseLeave={() => setIsSlicing(false)}
                  />

                  {gameOver && (
                    <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
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
                            className='bg-orange-600 hover:bg-orange-700'
                          >
                            <RotateCcw className='h-4 w-4 mr-2' />
                            Jugar de Nuevo
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
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
                <div className='text-3xl font-bold text-orange-400 mb-2'>
                  {score}
                </div>
                <div className='text-sm text-white/60'>Mejor: {highScore}</div>
              </CardContent>
            </Card>

            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white'>Vidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex space-x-1'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`text-2xl ${
                        i < lives ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      ❤️
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white'>Controles</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className='w-full bg-orange-600 hover:bg-orange-700'
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
                  <p>• Mueve el mouse para cortar frutas</p>
                  <p>• Evita las bombas 💣</p>
                  <p>• No dejes caer las frutas</p>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white'>Instrucciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-sm text-white/80 space-y-2'>
                  <p>🍎 Corta frutas para ganar puntos</p>
                  <p>💣 Evita las bombas o perderás</p>
                  <p>❤️ Pierdes vida si dejas caer frutas</p>
                  <p>⚡ Cada fruta vale 10 puntos</p>
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
