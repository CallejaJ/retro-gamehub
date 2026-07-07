"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { saveScore } from "@/app/leaderboard/actions";

export interface FruitItem {
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
const INITIAL_LIVES = 3;
const BOMB_PROBABILITY = 0.15;
const SPAWN_PROBABILITY = 0.012;
// Física pausada: gravedad baja y lanzamientos calculados para que toda
// fruta suba siempre hasta la zona jugable del canvas
const GRAVITY = 0.18;

type PointerEvt =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

export function useFruitNinja(isMobile: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [fruits, setFruits] = useState<FruitItem[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSlicing, setIsSlicing] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Actualizar tamaño del canvas según la pantalla
  useEffect(() => {
    const updateCanvasSize = () => {
      if (isMobile) {
        setCanvasSize({ width: 300, height: 400 });
      } else {
        setCanvasSize({ width: 600, height: 450 });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [isMobile]);

  const spawnFruit = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const isBomb = Math.random() < BOMB_PROBABILITY;

    // Altura máxima objetivo: entre el 15% y el 50% del canvas (desde arriba).
    // Con v = sqrt(2·g·distancia) la fruta llega EXACTAMENTE a esa altura,
    // así ninguna se queda fuera de alcance.
    const startY = canvasSize.height + 50;
    const targetPeakY =
      canvasSize.height * 0.15 + Math.random() * (canvasSize.height * 0.35);
    const launchSpeed = Math.sqrt(2 * GRAVITY * (startY - targetPeakY));

    const newFruit: FruitItem = {
      id: Date.now() + Math.random(),
      x: Math.random() * (canvasSize.width - 100) + 50,
      y: startY,
      vx: (Math.random() - 0.5) * 4,
      vy: -launchSpeed,
      type: isBomb ? "bomb" : "fruit",
      emoji: isBomb ? "💣" : FRUITS[Math.floor(Math.random() * FRUITS.length)],
      sliced: false,
      size: isMobile ? 25 + Math.random() * 10 : 30 + Math.random() * 15,
    };

    setFruits((prev) => [...prev, newFruit]);
  }, [isPlaying, gameOver, canvasSize, isMobile]);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setGameOver(false);
    setIsPlaying(false);
    setFruits([]);
    setShowScoreModal(false);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const updateFruits = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setFruits((prev) =>
      prev
        .map((fruit) => ({
          ...fruit,
          x: fruit.x + fruit.vx,
          y: fruit.y + fruit.vy,
          vy: fruit.vy + GRAVITY,
        }))
        .filter((fruit) => {
          if (fruit.y > canvasSize.height + 100) {
            if (fruit.type === "fruit" && !fruit.sliced) {
              setLives((l) => l - 1);
            }
            return false;
          }
          return true;
        })
    );
  }, [isPlaying, gameOver, canvasSize.height]);

  // --- Puntero / táctil ------------------------------------------------------

  const getCanvasCoordinates = useCallback(
    (e: PointerEvt) => {
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
    },
    [canvasSize]
  );

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
                setHighScore((best) => Math.max(best, newScore));
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
    [isPlaying, gameOver]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvt) => {
      const coords = getCanvasCoordinates(e);
      setMousePos(coords);
      // Cortar mientras se arrastra con el puntero/dedo pulsado
      if (isSlicing) {
        handleSlice(coords.x, coords.y);
      }
    },
    [getCanvasCoordinates, isSlicing, handleSlice]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvt) => {
      e.preventDefault();
      setIsSlicing(true);
      const coords = getCanvasCoordinates(e);
      handleSlice(coords.x, coords.y);
    },
    [getCanvasCoordinates, handleSlice]
  );

  const handlePointerUp = useCallback(() => {
    setIsSlicing(false);
  }, []);

  // --- Bucle del juego -------------------------------------------------------

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      updateFruits();

      if (Math.random() < SPAWN_PROBABILITY) {
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

  const handleSaveScore = useCallback(
    async (enteredUserName: string) => {
      if (score > 0) {
        await saveScore(enteredUserName, "Fruit Ninja", score);
      }
      setShowScoreModal(false);
      resetGame();
    },
    [score, resetGame]
  );

  // --- Render del canvas -----------------------------------------------------

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

  return {
    canvasRef,
    canvasSize,
    score,
    lives,
    highScore,
    gameOver,
    isPlaying,
    showScoreModal,
    togglePlay,
    resetGame,
    handleSaveScore,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
  };
}
