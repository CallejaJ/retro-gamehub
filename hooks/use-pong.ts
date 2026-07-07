"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { saveScore } from "@/app/leaderboard/actions";

const PADDLE_WIDTH = 10;
const BALL_SIZE = 10;
const WINNING_SCORE = 10;

export interface PongState {
  playerY: number;
  aiY: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  playerScore: number;
  aiScore: number;
  gameOver: boolean;
  isPlaying: boolean;
}

export function usePong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [paddleHeight, setPaddleHeight] = useState(80);
  const [gameState, setGameState] = useState<PongState>({
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

  const resetGame = useCallback(() => {
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
  }, [canvasSize, paddleHeight]);

  const togglePlay = useCallback(
    () => setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying })),
    []
  );

  // --- Controles táctiles ----------------------------------------------------

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

  // --- Bucle del juego -------------------------------------------------------

  const updateGame = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    setGameState((prev) => {
      const newState = { ...prev };

      // Movimiento de la paleta del jugador (solo teclado en desktop)
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

      // IA simple
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

      // Movimiento de la bola
      newState.ballX += newState.ballVX;
      newState.ballY += newState.ballVY;

      // Rebote arriba/abajo
      if (
        newState.ballY <= 0 ||
        newState.ballY >= canvasSize.height - BALL_SIZE
      ) {
        newState.ballVY = -newState.ballVY;
      }

      // Colisión con la paleta del jugador
      if (
        newState.ballX <= PADDLE_WIDTH &&
        newState.ballY + BALL_SIZE >= newState.playerY &&
        newState.ballY <= newState.playerY + paddleHeight
      ) {
        newState.ballVX = -newState.ballVX;
        const hitPos = (newState.ballY - newState.playerY) / paddleHeight;
        newState.ballVY = (hitPos - 0.5) * 10;
      }

      // Colisión con la paleta de la IA
      if (
        newState.ballX + BALL_SIZE >= canvasSize.width - PADDLE_WIDTH &&
        newState.ballY + BALL_SIZE >= newState.aiY &&
        newState.ballY <= newState.aiY + paddleHeight
      ) {
        newState.ballVX = -newState.ballVX;
        const hitPos = (newState.ballY - newState.aiY) / paddleHeight;
        newState.ballVY = (hitPos - 0.5) * 10;
      }

      // Punto (bola fuera)
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

      // Condición de victoria
      if (
        newState.playerScore >= WINNING_SCORE ||
        newState.aiScore >= WINNING_SCORE
      ) {
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

  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const gameLoop = setInterval(updateGame, 16); // ~60fps
    return () => clearInterval(gameLoop);
  }, [gameState.isPlaying, gameState.gameOver, updateGame]);

  // --- Teclado (solo desktop) ------------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 768) return;

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

  // --- Fin de partida --------------------------------------------------------

  useEffect(() => {
    if (gameState.gameOver) {
      setShowScoreModal(true);
    }
  }, [gameState.gameOver]);

  const handleSaveScore = useCallback(
    async (enteredUserName: string) => {
      if (gameState.playerScore > 0) {
        await saveScore(enteredUserName, "Pong", gameState.playerScore);
      }
      setShowScoreModal(false);
      resetGame();
    },
    [gameState.playerScore, resetGame]
  );

  // --- Render del canvas -----------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fondo
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Línea central
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvasSize.width / 2, 0);
    ctx.lineTo(canvasSize.width / 2, canvasSize.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paletas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, gameState.playerY, PADDLE_WIDTH, paddleHeight);
    ctx.fillRect(
      canvasSize.width - PADDLE_WIDTH,
      gameState.aiY,
      PADDLE_WIDTH,
      paddleHeight
    );

    // Bola
    ctx.fillRect(gameState.ballX, gameState.ballY, BALL_SIZE, BALL_SIZE);

    // Marcadores
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

    // Indicador táctil
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

  return {
    canvasRef,
    canvasSize,
    gameState,
    highScore,
    showScoreModal,
    togglePlay,
    resetGame,
    handleSaveScore,
    handleCanvasTouchStart,
    handleCanvasTouchMove,
    handleCanvasTouchEnd,
  };
}
