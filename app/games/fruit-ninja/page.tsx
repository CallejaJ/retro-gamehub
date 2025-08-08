"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { saveScore } from "@/app/leaderboard/actions";
import { ScoreModal } from "@/components/score-modal";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const isMobile = useIsMobile();

  // Actualizar tamaño del canvas según la pantalla
  useEffect(() => {
    const updateCanvasSize = () => {
      if (isMobile) {
        // Móvil: canvas más pequeño
        setCanvasSize({ width: 300, height: 400 });
      } else {
        // Desktop: canvas original
        setCanvasSize({ width: 600, height: 450 });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [isMobile]);

  const spawnFruit = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const isBomb = Math.random() < 0.15;
    const newFruit: FruitItem = {
      id: Date.now() + Math.random(),
      x: Math.random() * (canvasSize.width - 100) + 50,
      y: canvasSize.height + 50,
      vx: (Math.random() - 0.5) * 8,
      vy: -15 - Math.random() * 10,
      type: isBomb ? "bomb" : "fruit",
      emoji: isBomb ? "💣" : FRUITS[Math.floor(Math.random() * FRUITS.length)],
      sliced: false,
      size: isMobile ? 25 + Math.random() * 10 : 30 + Math.random() * 15,
    };

    setFruits((prev) => [...prev, newFruit]);
  }, [isPlaying, gameOver, canvasSize, isMobile]);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(false);
    setFruits([]);
    setShowScoreModal(false);
  };

  const updateFruits = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setFruits((prev) => {
      const updated = prev
        .map((fruit) => ({
          ...fruit,
          x: fruit.x + fruit.vx,
          y: fruit.y + fruit.vy,
          vy: fruit.vy + 0.5,
        }))
        .filter((fruit) => {
          if (fruit.y > canvasSize.height + 100) {
            if (fruit.type === "fruit" && !fruit.sliced) {
              setLives((l) => l - 1);
            }
            return false;
          }
          return true;
        });

      return updated;
    });
  }, [isPlaying, gameOver, canvasSize.height]);

  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;

    let clientX, clientY;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("changedTouches" in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCanvasCoordinates(e);
    setMousePos(coords);
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

  const handlePointerDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    setIsSlicing(true);
    const coords = getCanvasCoordinates(e);
    handleSlice(coords.x, coords.y);
  };

  const handlePointerUp = () => {
    setIsSlicing(false);
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      updateFruits();

      if (Math.random() < 0.02) {
        spawnFruit();
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, updateFruits, spawnFruit]);

  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
      setIsPlaying(false);
    }
  }, [lives]);

  useEffect(() => {
    if (gameOver) {
      setShowScoreModal(true);
    }
  }, [gameOver]);

  const handleSaveScore = async (enteredUserName: string) => {
    if (score > 0) {
      await saveScore(enteredUserName, "Fruit Ninja", score);
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

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

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

    if (isSlicing) {
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 20, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [fruits, mousePos, isSlicing, canvasSize]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex flex-col'>
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
                <CardHeader className='pb-2 sm:pb-4'>
                  <CardTitle className='text-white text-lg sm:text-xl'>
                    Puntuación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl sm:text-3xl font-bold text-orange-400 mb-2'>
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
                    Vidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex space-x-1 justify-center'>
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
                <CardHeader className='pb-2 sm:pb-4'>
                  <CardTitle className='text-white text-lg sm:text-xl'>
                    Controles
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 sm:space-y-4'>
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
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

                  <Button
                    onClick={resetGame}
                    className='w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base py-2 sm:py-3'
                  >
                    <RotateCcw className='h-4 w-4 mr-2' />
                    Reiniciar
                  </Button>

                  <div className='text-xs sm:text-sm text-white/60 space-y-1'>
                    {!isMobile ? (
                      <p>• Mueve el mouse para cortar frutas</p>
                    ) : (
                      <p>• Toca y arrastra para cortar frutas</p>
                    )}
                    <p>• Evita las bombas 💣</p>
                    <p>• No dejes caer las frutas</p>
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
                    <p>🍎 Corta frutas para ganar puntos</p>
                    <p>💣 Evita las bombas o perderás</p>
                    <p>❤️ Pierdes vida si dejas caer frutas</p>
                    <p>⚡ Cada fruta vale 10 puntos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Canvas - Orden 2 en móvil, centrado y con límites */}
            <div className='xl:col-span-3 xl:order-1 flex flex-col items-center justify-center min-h-0'>
              <Card className='bg-black/40 backdrop-blur-sm border-white/20 w-full max-w-2xl mx-auto'>
                <CardContent className='p-2 sm:p-4 lg:p-6'>
                  <div className='flex justify-center'>
                    <canvas
                      ref={canvasRef}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      className='w-full max-w-full h-auto bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg cursor-crosshair touch-none border-2 border-white/20'
                      style={{
                        maxWidth: `${canvasSize.width}px`,
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
                  </div>

                  {/* Instrucciones para móvil */}
                  {isMobile && (
                    <div className='mt-4 text-center'>
                      <p className='text-white/80 text-sm'>
                        Toca y arrastra para cortar las frutas 🍎
                      </p>
                      <p className='text-white/60 text-xs mt-1'>
                        Evita las bombas 💣 y no dejes caer las frutas
                      </p>
                    </div>
                  )}
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
