'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react'
import Link from "next/link"
import { Footer } from "@/components/footer" // Importar el nuevo componente Footer

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const PADDLE_HEIGHT = 80
const PADDLE_WIDTH = 10
const BALL_SIZE = 10

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVX: 5,
    ballVY: 3,
    playerScore: 0,
    aiScore: 0,
    gameOver: false,
    isPlaying: false
  })
  const [highScore, setHighScore] = useState(0)
  const keysPressed = useRef<Set<string>>(new Set())

  const resetGame = () => {
    setGameState({
      playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballVX: Math.random() > 0.5 ? 5 : -5,
      ballVY: (Math.random() - 0.5) * 6,
      playerScore: 0,
      aiScore: 0,
      gameOver: false,
      isPlaying: false
    })
  }

  const updateGame = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return

    setGameState(prev => {
      let newState = { ...prev }

      // Player paddle movement
      if (keysPressed.current.has('ArrowUp') && newState.playerY > 0) {
        newState.playerY -= 8
      }
      if (keysPressed.current.has('ArrowDown') && newState.playerY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
        newState.playerY += 8
      }

      // AI paddle movement (simple AI)
      const aiCenter = newState.aiY + PADDLE_HEIGHT / 2
      const ballCenter = newState.ballY
      const aiSpeed = 4

      if (ballCenter < aiCenter - 10) {
        newState.aiY = Math.max(0, newState.aiY - aiSpeed)
      } else if (ballCenter > aiCenter + 10) {
        newState.aiY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newState.aiY + aiSpeed)
      }

      // Ball movement
      newState.ballX += newState.ballVX
      newState.ballY += newState.ballVY

      // Ball collision with top and bottom walls
      if (newState.ballY <= 0 || newState.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
        newState.ballVY = -newState.ballVY
      }

      // Ball collision with player paddle
      if (
        newState.ballX <= PADDLE_WIDTH &&
        newState.ballY + BALL_SIZE >= newState.playerY &&
        newState.ballY <= newState.playerY + PADDLE_HEIGHT
      ) {
        newState.ballVX = -newState.ballVX
        const hitPos = (newState.ballY - newState.playerY) / PADDLE_HEIGHT
        newState.ballVY = (hitPos - 0.5) * 10
      }

      // Ball collision with AI paddle
      if (
        newState.ballX + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH &&
        newState.ballY + BALL_SIZE >= newState.aiY &&
        newState.ballY <= newState.aiY + PADDLE_HEIGHT
      ) {
        newState.ballVX = -newState.ballVX
        const hitPos = (newState.ballY - newState.aiY) / PADDLE_HEIGHT
        newState.ballVY = (hitPos - 0.5) * 10
      }

      // Ball out of bounds (scoring)
      if (newState.ballX < 0) {
        newState.aiScore++
        newState.ballX = CANVAS_WIDTH / 2
        newState.ballY = CANVAS_HEIGHT / 2
        newState.ballVX = 5
        newState.ballVY = (Math.random() - 0.5) * 6
      } else if (newState.ballX > CANVAS_WIDTH) {
        newState.playerScore++
        if (newState.playerScore > highScore) {
          setHighScore(newState.playerScore)
        }
        newState.ballX = CANVAS_WIDTH / 2
        newState.ballY = CANVAS_HEIGHT / 2
        newState.ballVX = -5
        newState.ballVY = (Math.random() - 0.5) * 6
      }

      // Check win condition
      if (newState.playerScore >= 10 || newState.aiScore >= 10) {
        newState.gameOver = true
        newState.isPlaying = false
      }

      return newState
    })
  }, [gameState.isPlaying, gameState.gameOver, highScore])

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return

    const gameLoop = setInterval(updateGame, 16) // ~60fps
    return () => clearInterval(gameLoop)
  }, [gameState.isPlaying, gameState.gameOver, updateGame])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw center line
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw paddles
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, gameState.playerY, PADDLE_WIDTH, PADDLE_HEIGHT)
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gameState.aiY, PADDLE_WIDTH, PADDLE_HEIGHT)

    // Draw ball
    ctx.fillRect(gameState.ballX, gameState.ballY, BALL_SIZE, BALL_SIZE)

    // Draw scores
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(gameState.playerScore.toString(), CANVAS_WIDTH / 4, 60)
    ctx.fillText(gameState.aiScore.toString(), (3 * CANVAS_WIDTH) / 4, 60)
  }, [gameState])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4 flex flex-col">
      <div className="container mx-auto max-w-6xl flex-grow">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Pong Retro</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <Card className="bg-black/40 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="w-full h-auto bg-black border-2 border-white rounded-lg"
                  />

                  {gameState.gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <Card className="bg-gray-900/90 border-white/20">
                        <CardContent className="p-6 text-center">
                          <h3 className="text-2xl font-bold text-white mb-4">
                            {gameState.playerScore > gameState.aiScore ? '¡Ganaste!' : '¡Perdiste!'}
                          </h3>
                          <p className="text-white/80 mb-4">
                            {gameState.playerScore} - {gameState.aiScore}
                          </p>
                          <Button onClick={resetGame} className="bg-gray-600 hover:bg-gray-700">
                            <RotateCcw className="h-4 w-4 mr-2" />
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
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Puntuación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-white">
                    {gameState.playerScore} - {gameState.aiScore}
                  </div>
                  <div className="text-sm text-white/60">Mejor: {highScore}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Controles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                  className="w-full bg-gray-600 hover:bg-gray-700"
                  disabled={gameState.gameOver}
                >
                  {gameState.isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {gameState.gameOver ? 'Reiniciar' : 'Jugar'}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetGame}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar
                </Button>

                <div className="text-sm text-white/60 space-y-1">
                  <p>• ↑ ↓ Mover paleta</p>
                  <p>• Primer jugador en llegar a 10 gana</p>
                  <p>• La pelota acelera con cada golpe</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Instrucciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white/80 space-y-2">
                  <p>🏓 Controla la paleta izquierda</p>
                  <p>🤖 La IA controla la derecha</p>
                  <p>⚡ Evita que la pelota pase</p>
                  <p>🏆 Primer jugador en 10 puntos gana</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer /> {/* Añadir el Footer */}
    </div>
  )
}
