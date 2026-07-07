"use client";

import { useState, useEffect, useCallback } from "react";
import { saveScore } from "@/app/leaderboard/actions";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Position = { x: number; y: number };

export const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_FOOD: Position = { x: 15, y: 15 };
const TICK_MS = 150;
const MIN_SWIPE_DISTANCE = 30;

interface UseSnakeOptions {
  /** Desactiva el teclado (p. ej. en móvil, donde se juega con swipes) */
  keyboardEnabled?: boolean;
}

export function useSnake({ keyboardEnabled = true }: UseSnakeOptions = {}) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [touchStart, setTouchStart] = useState<Position | null>(null);

  // Genera comida en una celda libre (no encima de la serpiente)
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y)
    );
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    setShowScoreModal(false);
  }, []);

  const changeDirection = useCallback(
    (newDirection: Direction) => {
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
    },
    [isPlaying]
  );

  // --- Gestos táctiles -------------------------------------------------------

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isPlaying || gameOver) return;
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    },
    [isPlaying, gameOver]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isPlaying || gameOver || !touchStart) return;
      e.preventDefault();
      e.stopPropagation();

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
          changeDirection(deltaX > 0 ? "RIGHT" : "LEFT");
        }
      } else if (Math.abs(deltaY) > MIN_SWIPE_DISTANCE) {
        changeDirection(deltaY > 0 ? "DOWN" : "UP");
      }

      setTouchStart(null);
    },
    [isPlaying, gameOver, touchStart, changeDirection]
  );

  // --- Bucle del juego -------------------------------------------------------

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

      // Wrap-around: al salir por un borde, la serpiente aparece por el opuesto
      head.x = (head.x + GRID_SIZE) % GRID_SIZE;
      head.y = (head.y + GRID_SIZE) % GRID_SIZE;

      // Colisión con el propio cuerpo
      if (
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Comida
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood(newSnake));
        setScore((prev) => {
          const newScore = prev + 10;
          setHighScore((best) => Math.max(best, newScore));
          return newScore;
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPlaying, generateFood]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, TICK_MS);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  // --- Teclado ---------------------------------------------------------------

  useEffect(() => {
    if (!keyboardEnabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

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
  }, [isPlaying, keyboardEnabled, changeDirection]);

  // --- Fin de partida --------------------------------------------------------

  useEffect(() => {
    if (gameOver) {
      setShowScoreModal(true);
    }
  }, [gameOver]);

  const handleSaveScore = useCallback(
    async (enteredUserName: string) => {
      if (score > 0) {
        await saveScore(enteredUserName, "Snake", score);
      }
      setShowScoreModal(false);
      resetGame();
    },
    [score, resetGame]
  );

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  return {
    // estado
    snake,
    food,
    score,
    highScore,
    gameOver,
    isPlaying,
    showScoreModal,
    // acciones
    togglePlay,
    resetGame,
    changeDirection,
    handleSaveScore,
    // gestos táctiles
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
