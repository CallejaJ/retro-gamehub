"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { saveScore } from "@/app/leaderboard/actions";
import { ScoreModal } from "@/components/score-modal";
import { useIsMobile } from "@/hooks/use-mobile";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: "#00f0f0" },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a000f0",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00f000",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#f00000",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#0000f0",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#f0a000",
  },
};

type TetrominoType = keyof typeof TETROMINOES;

interface Piece {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: number;
}

export default function TetrisGame() {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null))
  );

  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const isMobile = useIsMobile();

  const dropTimeRef = useRef<number>(1000);
  const lastDropTimeRef = useRef<number>(0);

  // Estados mejorados para gestos táctiles
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isFastDrop, setIsFastDrop] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(
    null
  );
  const [lastMoveTime, setLastMoveTime] = useState<number>(0);

  // Referencias para timers
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dragThresholdRef = useRef<number>(25); // píxeles para detectar drag

  const getRandomTetromino = (): TetrominoType => {
    const types = Object.keys(TETROMINOES) as TetrominoType[];
    return types[Math.floor(Math.random() * types.length)];
  };

  const rotatePiece = (shape: number[][]): number[][] => {
    return shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
  };

  const getPieceShape = (piece: Piece): number[][] => {
    let shape = TETROMINOES[piece.type].shape;
    for (let i = 0; i < piece.rotation; i++) {
      shape = rotatePiece(shape);
    }
    return shape;
  };

  const isValidPosition = useCallback(
    (piece: Piece, testBoard?: (string | null)[][]): boolean => {
      const shape = getPieceShape(piece);
      const boardToTest = testBoard || board;

      for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
          if (shape[py][px]) {
            const newX = piece.x + px;
            const newY = piece.y + py;

            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return false;
            }

            if (newY >= 0 && boardToTest[newY][newX] !== null) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [board]
  );

  const placePieceOnBoard = useCallback(
    (piece: Piece): (string | null)[][] => {
      const newBoard = board.map((row) => [...row]);
      const shape = getPieceShape(piece);
      const color = TETROMINOES[piece.type].color;

      for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
          if (shape[py][px]) {
            const x = piece.x + px;
            const y = piece.y + py;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              newBoard[y][x] = color;
            }
          }
        }
      }
      return newBoard;
    },
    [board]
  );

  const clearLines = useCallback(
    (
      boardToClear: (string | null)[][]
    ): { newBoard: (string | null)[][]; linesCleared: number } => {
      let linesCleared = 0;
      const newBoard = [];

      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (boardToClear[y].every((cell) => cell !== null)) {
          linesCleared++;
        } else {
          newBoard.push([...boardToClear[y]]);
        }
      }

      while (newBoard.length < BOARD_HEIGHT) {
        newBoard.unshift(Array(BOARD_WIDTH).fill(null));
      }

      return { newBoard, linesCleared };
    },
    []
  );

  const spawnNewPiece = useCallback((): Piece => {
    const type = nextPiece || getRandomTetromino();
    setNextPiece(getRandomTetromino());

    return {
      type,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      rotation: 0,
    };
  }, [nextPiece]);

  const movePiece = useCallback(
    (dx: number, dy: number): boolean => {
      if (!currentPiece || !isPlaying || gameOver) return false;

      const newPiece = {
        ...currentPiece,
        x: currentPiece.x + dx,
        y: currentPiece.y + dy,
      };

      if (isValidPosition(newPiece)) {
        setCurrentPiece(newPiece);
        return true;
      }

      if (dy > 0) {
        const newBoard = placePieceOnBoard(currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

        setBoard(clearedBoard);

        if (linesCleared > 0) {
          setLines((prev) => prev + linesCleared);
          setScore((prev) => {
            const newScore = prev + linesCleared * 100 * level;
            if (newScore > highScore) {
              setHighScore(newScore);
            }
            return newScore;
          });
          setLevel(Math.floor((lines + linesCleared) / 10) + 1);
        }

        const newPieceSpawned = spawnNewPiece();
        if (!isValidPosition(newPieceSpawned, clearedBoard)) {
          setGameOver(true);
          setIsPlaying(false);
        } else {
          setCurrentPiece(newPieceSpawned);
        }
      }

      return false;
    },
    [
      currentPiece,
      isPlaying,
      gameOver,
      isValidPosition,
      placePieceOnBoard,
      clearLines,
      level,
      lines,
      highScore,
      spawnNewPiece,
    ]
  );

  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || !isPlaying || gameOver) return;

    const newPiece = {
      ...currentPiece,
      rotation: (currentPiece.rotation + 1) % 4,
    };

    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, isPlaying, gameOver, isValidPosition]);

  const drop = useCallback(() => {
    const now = Date.now();
    const currentDropTime = isFastDrop ? 50 : dropTimeRef.current;

    if (now - lastDropTimeRef.current > currentDropTime) {
      movePiece(0, 1);
      lastDropTimeRef.current = now;
    }
  }, [movePiece, isFastDrop]);

  // Función para mover continuamente durante el drag
  const startContinuousMove = useCallback(
    (direction: "left" | "right") => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }

      const dx = direction === "left" ? -1 : 1;

      // Primer movimiento inmediato
      movePiece(dx, 0);

      // Movimientos continuos cada 120ms
      moveIntervalRef.current = setInterval(() => {
        movePiece(dx, 0);
      }, 120);
    },
    [movePiece]
  );

  const stopContinuousMove = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    setDragDirection(null);
  }, []);

  // Gestores de eventos táctiles MEJORADOS
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isPlaying || gameOver) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchStartTime(Date.now());
      setIsDragging(false);
      setLastMoveTime(Date.now());

      // Timer más corto para detectar hold (300ms)
      holdTimerRef.current = setTimeout(() => {
        // Solo activar fast drop si NO estamos arrastrando horizontalmente
        if (!isDragging) {
          setIsFastDrop(true);
        }
      }, 300);
    },
    [isPlaying, gameOver, isDragging]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPlaying || gameOver || !touchStart) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const now = Date.now();

      // Detectar si es un drag horizontal (prioridad sobre vertical)
      if (Math.abs(deltaX) > dragThresholdRef.current) {
        if (!isDragging) {
          setIsDragging(true);
          // IMPORTANTE: Cancelar fast drop ya que estamos arrastrando horizontalmente
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
          setIsFastDrop(false);
        }

        const direction = deltaX > 0 ? "right" : "left";

        // Solo cambiar dirección si es diferente o si no hay dirección activa
        if (dragDirection !== direction) {
          stopContinuousMove();
          setDragDirection(direction);
          startContinuousMove(direction);
        }
      }
      // Si ya estamos en fast drop y nos movemos horizontalmente, iniciar movimiento continuo horizontal
      else if (isFastDrop && Math.abs(deltaX) > 15) {
        const direction = deltaX > 0 ? "right" : "left";

        // Cambiar a modo drag horizontal continuo incluso durante fast drop
        if (!isDragging) {
          setIsDragging(true);
          setDragDirection(direction);
          startContinuousMove(direction);
          // Actualizar touchStart para evitar re-detección
          setTouchStart({ x: touch.clientX, y: touch.clientY });
        }
      }
    },
    [
      isPlaying,
      gameOver,
      touchStart,
      isDragging,
      dragDirection,
      isFastDrop,
      startContinuousMove,
      stopContinuousMove,
    ]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isPlaying || gameOver || !touchStart) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.changedTouches[0];
      const touchDuration = Date.now() - touchStartTime;
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      // Limpiar todos los timers e intervalos
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      stopContinuousMove();
      setIsFastDrop(false);
      setIsDragging(false);

      // Si fue un drag (horizontal o durante fast drop), no procesar como otro gesto
      if (isDragging) {
        setTouchStart(null);
        return;
      }

      // Si fue un hold largo (fast drop solo), no procesar como tap
      if (touchDuration > 300) {
        setTouchStart(null);
        return;
      }

      const minSwipeDistance = 30;

      // Procesar gestos simples SOLO si no hubo drag ni hold
      if (
        Math.abs(deltaX) < minSwipeDistance &&
        Math.abs(deltaY) < minSwipeDistance
      ) {
        // Tap = rotar
        rotatePieceHandler();
      } else if (
        Math.abs(deltaY) > Math.abs(deltaX) &&
        deltaY > minSwipeDistance
      ) {
        // Swipe hacia abajo = caída rápida de una vez
        movePiece(0, 1);
      } else if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        // Swipe horizontal único (solo si no fue drag continuo)
        const direction = deltaX > 0 ? 1 : -1;
        movePiece(direction, 0);
      }

      setTouchStart(null);
    },
    [
      isPlaying,
      gameOver,
      touchStart,
      touchStartTime,
      isDragging,
      movePiece,
      rotatePieceHandler,
      stopContinuousMove,
    ]
  );

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, []);

  const resetGame = () => {
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(null))
    );
    setCurrentPiece(null);
    setNextPiece(null);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPlaying(false);
    lastDropTimeRef.current = 0;
    setShowScoreModal(false);
    setIsFastDrop(false);
    setIsDragging(false);
    stopContinuousMove();
  };

  const startGame = () => {
    if (!isPlaying && !gameOver) {
      const newPiece = spawnNewPiece();
      setCurrentPiece(newPiece);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    dropTimeRef.current = Math.max(50, 1000 - (level - 1) * 100);

    const gameLoop = () => {
      drop();
    };

    const intervalId = setInterval(gameLoop, 16);
    return () => clearInterval(intervalId);
  }, [isPlaying, gameOver, level, drop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver || isMobile) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          movePiece(1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          movePiece(0, 1);
          break;
        case "ArrowUp":
        case " ":
          e.preventDefault();
          rotatePieceHandler();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, gameOver, movePiece, rotatePieceHandler, isMobile]);

  useEffect(() => {
    if (gameOver) {
      setShowScoreModal(true);
    }
  }, [gameOver]);

  const handleSaveScore = async (enteredUserName: string) => {
    if (score > 0) {
      await saveScore(enteredUserName, "Tetris", score);
    }
    setShowScoreModal(false);
    resetGame();
  };

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row]);

    if (currentPiece) {
      const shape = getPieceShape(currentPiece);
      const color = TETROMINOES[currentPiece.type].color;

      for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
          if (shape[py][px]) {
            const x = currentPiece.x + px;
            const y = currentPiece.y + py;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = color;
            }
          }
        }
      }
    }

    return displayBoard;
  };

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
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderBoard().map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`${y}-${x}`}
                        className='border border-gray-700/30'
                        style={{
                          backgroundColor: cell || "#1a1a1a",
                        }}
                      />
                    ))
                  )}

                  {/* Indicadores visuales mejorados */}
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

                  {isDragging && dragDirection && (
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
                <Button
                  onClick={startGame}
                  className='bg-purple-600 hover:bg-purple-700 text-sm py-3'
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

              {/* Instrucciones de gestos MEJORADAS para móvil */}
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
                  <div className='flex justify-center'>
                    <div
                      className='grid gap-1 p-2 rounded'
                      style={{
                        backgroundColor: TETROMINOES[nextPiece].color + "20",
                      }}
                    >
                      {TETROMINOES[nextPiece].shape.map((row, y) => (
                        <div key={y} className='flex'>
                          {row.map((cell, x) => (
                            <div
                              key={x}
                              className='w-3 h-3 border'
                              style={{
                                backgroundColor: cell
                                  ? TETROMINOES[nextPiece].color
                                  : "transparent",
                                borderColor: cell
                                  ? TETROMINOES[nextPiece].color
                                  : "transparent",
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
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
                <CardHeader className='pb-2 sm:pb-4'>
                  <CardTitle className='text-white text-lg sm:text-xl'>
                    Puntuación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl sm:text-3xl font-bold text-purple-400 mb-2'>
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
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-white/80'>Nivel:</span>
                    <span className='text-white font-semibold'>{level}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-white/80'>Líneas:</span>
                    <span className='text-white font-semibold'>{lines}</span>
                  </div>
                </CardContent>
              </Card>

              {nextPiece && (
                <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                  <CardHeader className='pb-2 sm:pb-4'>
                    <CardTitle className='text-white text-lg sm:text-xl'>
                      Siguiente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex justify-center'>
                      <div
                        className='grid gap-1 p-2 rounded'
                        style={{
                          backgroundColor: TETROMINOES[nextPiece].color + "20",
                        }}
                      >
                        {TETROMINOES[nextPiece].shape.map((row, y) => (
                          <div key={y} className='flex'>
                            {row.map((cell, x) => (
                              <div
                                key={x}
                                className='w-3 h-3 sm:w-4 sm:h-4 border'
                                style={{
                                  backgroundColor: cell
                                    ? TETROMINOES[nextPiece].color
                                    : "transparent",
                                  borderColor: cell
                                    ? TETROMINOES[nextPiece].color
                                    : "transparent",
                                }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                <CardHeader className='pb-2 sm:pb-4'>
                  <CardTitle className='text-white text-lg sm:text-xl'>
                    Controles
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 sm:space-y-4'>
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

                  <Button
                    onClick={resetGame}
                    className='w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 text-sm sm:text-base py-2 sm:py-3'
                  >
                    <RotateCcw className='h-4 w-4 mr-2' />
                    Reiniciar
                  </Button>

                  <div className='text-xs sm:text-sm text-white/60 space-y-1'>
                    <p>• ← → Mover pieza</p>
                    <p>• ↓ Caída rápida</p>
                    <p>• ↑ / Espacio: Rotar</p>
                    <p>• Completa líneas para puntos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Board - Orden 2 en móvil, centrado y con límites */}
            <div className='xl:col-span-3 xl:order-1 flex flex-col items-center justify-center min-h-0'>
              <Card className='bg-black/40 backdrop-blur-sm border-white/20 w-full max-w-sm mx-auto'>
                <CardContent className='p-2 sm:p-4 lg:p-6'>
                  {/* Contenedor del juego con aspect ratio fijo */}
                  <div
                    className='w-full max-w-xs mx-auto'
                    style={{ aspectRatio: "1/2" }}
                  >
                    <div
                      className='grid gap-0 bg-gray-900 p-1 border-2 border-purple-400 w-full h-full'
                      style={{
                        gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                        gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
                      }}
                    >
                      {renderBoard().map((row, y) =>
                        row.map((cell, x) => (
                          <div
                            key={`${y}-${x}`}
                            className='border border-gray-700/30'
                            style={{
                              backgroundColor: cell || "#1a1a1a",
                            }}
                          />
                        ))
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
        gameName='Tetris Classic'
        hasScoreToSave={score > 0}
        onSave={handleSaveScore}
      />
      <Footer />
    </div>
  );
}
