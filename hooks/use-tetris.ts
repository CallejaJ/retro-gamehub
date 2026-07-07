"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveScore } from "@/app/leaderboard/actions";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOES = {
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

export type TetrominoType = keyof typeof TETROMINOES;

export interface Piece {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: number;
}

type Board = (string | null)[][];

const createEmptyBoard = (): Board =>
  Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));

const getRandomTetromino = (): TetrominoType => {
  const types = Object.keys(TETROMINOES) as TetrominoType[];
  return types[Math.floor(Math.random() * types.length)];
};

const rotateShape = (shape: number[][]): number[][] =>
  shape[0].map((_, i) => shape.map((row) => row[i]).reverse());

const getPieceShape = (piece: Piece): number[][] => {
  let shape = TETROMINOES[piece.type].shape;
  for (let i = 0; i < piece.rotation; i++) {
    shape = rotateShape(shape);
  }
  return shape;
};

interface UseTetrisOptions {
  /** Desactiva el teclado (p. ej. en móvil, donde se juega con gestos) */
  keyboardEnabled?: boolean;
}

export function useTetris({ keyboardEnabled = true }: UseTetrisOptions = {}) {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const dropTimeRef = useRef<number>(1000);
  const lastDropTimeRef = useRef<number>(0);

  // Estados para gestos táctiles
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isFastDrop, setIsFastDrop] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isHorizontalMoving, setIsHorizontalMoving] = useState(false);

  // Referencias para timers
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const horizontalMoveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dragThresholdRef = useRef<number>(20); // píxeles para detectar drag

  const isValidPosition = useCallback(
    (piece: Piece, testBoard?: Board): boolean => {
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
    (piece: Piece): Board => {
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
    (boardToClear: Board): { newBoard: Board; linesCleared: number } => {
      let linesCleared = 0;
      const newBoard: Board = [];

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

      // La pieza no puede bajar más: fijarla y generar la siguiente
      if (dy > 0) {
        const newBoard = placePieceOnBoard(currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

        setBoard(clearedBoard);

        if (linesCleared > 0) {
          setLines((prev) => prev + linesCleared);
          setScore((prev) => {
            const newScore = prev + linesCleared * 100 * level;
            setHighScore((best) => Math.max(best, newScore));
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

  // --- Movimiento horizontal continuo (táctil) -------------------------------

  const startHorizontalMovement = useCallback(
    (direction: "left" | "right") => {
      if (horizontalMoveIntervalRef.current) {
        clearInterval(horizontalMoveIntervalRef.current);
      }

      const dx = direction === "left" ? -1 : 1;

      // Primer movimiento inmediato
      movePiece(dx, 0);

      const stopMovement = () => {
        if (horizontalMoveIntervalRef.current) {
          clearInterval(horizontalMoveIntervalRef.current);
          horizontalMoveIntervalRef.current = null;
        }
        setIsHorizontalMoving(false);
        setDragDirection(null);
      };

      // Movimientos continuos cada 100ms
      horizontalMoveIntervalRef.current = setInterval(() => {
        // Usar callback para obtener el estado más reciente
        setCurrentPiece((prevPiece) => {
          if (!prevPiece || !isPlaying || gameOver) {
            stopMovement();
            return prevPiece;
          }

          const newPiece = {
            ...prevPiece,
            x: prevPiece.x + dx,
            y: prevPiece.y,
          };

          if (isValidPosition(newPiece)) {
            return newPiece;
          }
          stopMovement();
          return prevPiece;
        });
      }, 100);

      setIsHorizontalMoving(true);
      setDragDirection(direction);
    },
    [movePiece, isPlaying, gameOver, isValidPosition]
  );

  const stopHorizontalMovement = useCallback(() => {
    if (horizontalMoveIntervalRef.current) {
      clearInterval(horizontalMoveIntervalRef.current);
      horizontalMoveIntervalRef.current = null;
    }
    setIsHorizontalMoving(false);
    setDragDirection(null);
  }, []);

  const stopContinuousMove = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    setDragDirection(null);
  }, []);

  // --- Gestos táctiles -------------------------------------------------------

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isPlaying || gameOver) return;

      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchStartTime(Date.now());
      setIsDragging(false);

      // Timer para fast drop vertical - dar tiempo al drag horizontal
      holdTimerRef.current = setTimeout(() => {
        if (!isDragging && !isHorizontalMoving) {
          setIsFastDrop(true);
        }
      }, 500);
    },
    [isPlaying, gameOver, isDragging, isHorizontalMoving]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPlaying || gameOver || !touchStart) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;

      // Si no estamos ya moviendo horizontalmente, verificar si debemos empezar
      if (!isHorizontalMoving && Math.abs(deltaX) > dragThresholdRef.current) {
        // Cancelar fast drop
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        setIsFastDrop(false);
        setIsDragging(true);

        startHorizontalMovement(deltaX > 0 ? "right" : "left");
      }
      // Si ya estamos moviendo horizontalmente, verificar cambio de dirección
      else if (
        isHorizontalMoving &&
        Math.abs(deltaX) > dragThresholdRef.current
      ) {
        const newDirection = deltaX > 0 ? "right" : "left";
        if (newDirection !== dragDirection) {
          stopHorizontalMovement();
          startHorizontalMovement(newDirection);
        }
      }
    },
    [
      isPlaying,
      gameOver,
      touchStart,
      isHorizontalMoving,
      dragDirection,
      startHorizontalMovement,
      stopHorizontalMovement,
    ]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isPlaying || gameOver || !touchStart) return;

      const touch = e.changedTouches[0];
      const touchDuration = Date.now() - touchStartTime;
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      // Solo detener movimiento si NO hubo movimiento continuo o si fue muy corto
      const wasRealMovement = isHorizontalMoving && touchDuration > 200;

      // Limpiar timers
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      // Si fue un movimiento continuo real, solo limpiar al final
      if (wasRealMovement) {
        stopHorizontalMovement();
        stopContinuousMove();
        setIsFastDrop(false);
        setIsDragging(false);
        setTouchStart(null);
        return;
      }

      // Para gestos cortos o taps
      stopHorizontalMovement();
      stopContinuousMove();
      setIsFastDrop(false);
      setIsDragging(false);

      // Si fue un hold largo, no procesar como tap
      if (touchDuration > 500) {
        setTouchStart(null);
        return;
      }

      const minSwipeDistance = 30;

      // Procesar gestos simples
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
        // Swipe horizontal único rápido
        movePiece(deltaX > 0 ? 1 : -1, 0);
      }

      setTouchStart(null);
    },
    [
      isPlaying,
      gameOver,
      touchStart,
      touchStartTime,
      isHorizontalMoving,
      movePiece,
      rotatePieceHandler,
      stopHorizontalMovement,
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
      if (horizontalMoveIntervalRef.current) {
        clearInterval(horizontalMoveIntervalRef.current);
      }
    };
  }, []);

  // --- Control de partida ----------------------------------------------------

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
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
    setIsHorizontalMoving(false);
    stopHorizontalMovement();
    stopContinuousMove();
  }, [stopHorizontalMovement, stopContinuousMove]);

  const startGame = useCallback(() => {
    if (!isPlaying && !gameOver) {
      const newPiece = spawnNewPiece();
      setCurrentPiece(newPiece);
    }
    setIsPlaying((p) => !p);
  }, [isPlaying, gameOver, spawnNewPiece]);

  // --- Bucle del juego -------------------------------------------------------

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    dropTimeRef.current = Math.max(50, 1000 - (level - 1) * 100);

    const intervalId = setInterval(drop, 16);
    return () => clearInterval(intervalId);
  }, [isPlaying, gameOver, level, drop]);

  // --- Teclado ---------------------------------------------------------------

  useEffect(() => {
    if (!keyboardEnabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

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
  }, [isPlaying, gameOver, movePiece, rotatePieceHandler, keyboardEnabled]);

  // --- Fin de partida --------------------------------------------------------

  useEffect(() => {
    if (gameOver) {
      setShowScoreModal(true);
    }
  }, [gameOver]);

  const handleSaveScore = useCallback(
    async (enteredUserName: string) => {
      if (score > 0) {
        await saveScore(enteredUserName, "Tetris", score);
      }
      setShowScoreModal(false);
      resetGame();
    },
    [score, resetGame]
  );

  // --- Tablero para renderizar (tablero + pieza actual) ----------------------

  const renderBoard = useCallback((): Board => {
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
  }, [board, currentPiece]);

  return {
    // estado
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
    // acciones
    startGame,
    resetGame,
    handleSaveScore,
    renderBoard,
    // gestos táctiles
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
