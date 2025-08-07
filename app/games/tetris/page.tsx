'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react'
import Link from "next/link"
import { Footer } from "@/components/footer" // Importar el nuevo componente Footer

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }
}

type TetrominoType = keyof typeof TETROMINOES

interface Piece {
  type: TetrominoType
  x: number
  y: number
  rotation: number
}

export default function TetrisGame() {
  // Tablero estático (piezas ya colocadas)
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  )
  
  // Pieza actual que está cayendo
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null)
  
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highScore, setHighScore] = useState(0)
  
  const dropTimeRef = useRef<number>(1000)
  const lastDropTimeRef = useRef<number>(0)

  const getRandomTetromino = (): TetrominoType => {
    const types = Object.keys(TETROMINOES) as TetrominoType[]
    return types[Math.floor(Math.random() * types.length)]
  }

  const rotatePiece = (shape: number[][]): number[][] => {
    return shape[0].map((_, i) => shape.map(row => row[i]).reverse())
  }

  const getPieceShape = (piece: Piece): number[][] => {
    let shape = TETROMINOES[piece.type].shape
    for (let i = 0; i < piece.rotation; i++) {
      shape = rotatePiece(shape)
    }
    return shape
  }

  // Verificar si una posición es válida
  const isValidPosition = useCallback((piece: Piece, testBoard?: (string | null)[][]): boolean => {
    const shape = getPieceShape(piece)
    const boardToTest = testBoard || board

    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = piece.x + px
          const newY = piece.y + py

          // Verificar límites
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }

          // Verificar colisión con piezas ya colocadas (solo si Y >= 0)
          if (newY >= 0 && boardToTest[newY][newX] !== null) {
            return false
          }
        }
      }
    }
    return true
  }, [board])

  // Colocar pieza en el tablero
  const placePieceOnBoard = useCallback((piece: Piece): (string | null)[][] => {
    const newBoard = board.map(row => [...row])
    const shape = getPieceShape(piece)
    const color = TETROMINOES[piece.type].color

    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const x = piece.x + px
          const y = piece.y + py
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            newBoard[y][x] = color
          }
        }
      }
    }
    return newBoard
  }, [board])

  // Eliminar líneas completas
  const clearLines = useCallback((boardToClear: (string | null)[][]): { newBoard: (string | null)[][], linesCleared: number } => {
    let linesCleared = 0
    const newBoard = []

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (boardToClear[y].every(cell => cell !== null)) {
        linesCleared++
      } else {
        newBoard.push([...boardToClear[y]])
      }
    }

    // Agregar líneas vacías al principio
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null))
    }

    return { newBoard, linesCleared }
  }, [])

  // Generar nueva pieza
  const spawnNewPiece = useCallback((): Piece => {
    const type = nextPiece || getRandomTetromino()
    setNextPiece(getRandomTetromino())
    
    return {
      type,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      rotation: 0
    }
  }, [nextPiece])

  // Mover pieza
  const movePiece = useCallback((dx: number, dy: number): boolean => {
    if (!currentPiece || !isPlaying || gameOver) return false

    const newPiece = {
      ...currentPiece,
      x: currentPiece.x + dx,
      y: currentPiece.y + dy
    }

    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
      return true
    }

    // Si no se puede mover hacia abajo, colocar la pieza
    if (dy > 0) {
      const newBoard = placePieceOnBoard(currentPiece)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
      
      setBoard(clearedBoard)
      
      if (linesCleared > 0) {
        setLines(prev => prev + linesCleared)
        setScore(prev => {
          const newScore = prev + linesCleared * 100 * level
          if (newScore > highScore) {
            setHighScore(newScore)
          }
          return newScore
        })
        setLevel(Math.floor((lines + linesCleared) / 10) + 1)
      }

      // Generar nueva pieza
      const newPieceSpawned = spawnNewPiece()
      if (!isValidPosition(newPieceSpawned, clearedBoard)) {
        setGameOver(true)
        setIsPlaying(false)
      } else {
        setCurrentPiece(newPieceSpawned)
      }
    }

    return false
  }, [currentPiece, isPlaying, gameOver, isValidPosition, placePieceOnBoard, clearLines, level, lines, highScore, spawnNewPiece])

  // Rotar pieza
  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || !isPlaying || gameOver) return

    const newPiece = {
      ...currentPiece,
      rotation: (currentPiece.rotation + 1) % 4
    }

    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, isPlaying, gameOver, isValidPosition])

  // Caída automática
  const drop = useCallback(() => {
    const now = Date.now()
    if (now - lastDropTimeRef.current > dropTimeRef.current) {
      movePiece(0, 1)
      lastDropTimeRef.current = now
    }
  }, [movePiece])

  // Reiniciar juego
  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)))
    setCurrentPiece(null)
    setNextPiece(null)
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPlaying(false)
    lastDropTimeRef.current = 0
  }

  // Iniciar juego
  const startGame = () => {
    if (!isPlaying && !gameOver) {
      const newPiece = spawnNewPiece()
      setCurrentPiece(newPiece)
    }
    setIsPlaying(!isPlaying)
  }

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return

    dropTimeRef.current = Math.max(50, 1000 - (level - 1) * 100)

    const gameLoop = () => {
      drop()
    }

    const intervalId = setInterval(gameLoop, 16) // ~60fps
    return () => clearInterval(intervalId)
  }, [isPlaying, gameOver, level, drop])

  // Controles de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          movePiece(-1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          movePiece(1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          movePiece(0, 1)
          break
        case 'ArrowUp':
        case ' ':
          e.preventDefault()
          rotatePieceHandler()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, gameOver, movePiece, rotatePieceHandler])

  // Renderizar tablero
  const renderBoard = () => {
    // Crear tablero de visualización combinando tablero estático y pieza actual
    const displayBoard = board.map(row => [...row])

    // Agregar pieza actual al tablero de visualización
    if (currentPiece) {
      const shape = getPieceShape(currentPiece)
      const color = TETROMINOES[currentPiece.type].color

      for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
          if (shape[py][px]) {
            const x = currentPiece.x + px
            const y = currentPiece.y + py
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = color
            }
          }
        }
      }
    }

    return displayBoard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 flex flex-col">
      <div className="container mx-auto max-w-4xl flex-grow">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Tetris Classic</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="relative">
                  <div 
                    className="grid gap-0 mx-auto bg-gray-900 p-2 border-2 border-purple-400 relative overflow-hidden"
                    style={{
                      gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                      gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
                      width: '320px',
                      height: '640px'
                    }}
                  >
                    {renderBoard().map((row, y) => 
                      row.map((cell, x) => (
                        <div
                          key={`${y}-${x}`}
                          className="border border-gray-700/30"
                          style={{
                            backgroundColor: cell || '#1a1a1a',
                            width: '30px',
                            height: '30px'
                          }}
                        />
                      ))
                    )}
                  </div>

                  {gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Card className="bg-red-900/90 border-red-500">
                        <CardContent className="p-6 text-center">
                          <h3 className="text-2xl font-bold text-white mb-4">¡Game Over!</h3>
                          <p className="text-white/80 mb-4">Puntuación: {score}</p>
                          <Button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700">
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
                <div className="text-3xl font-bold text-purple-400 mb-2">{score}</div>
                <div className="text-sm text-white/60">Mejor: {highScore}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/80">Nivel:</span>
                  <span className="text-white font-semibold">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Líneas:</span>
                  <span className="text-white font-semibold">{lines}</span>
                </div>
              </CardContent>
            </Card>

            {nextPiece && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Siguiente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div 
                      className="grid gap-1 p-2"
                      style={{
                        gridTemplateColumns: `repeat(4, 1fr)`,
                        backgroundColor: TETROMINOES[nextPiece].color + '20'
                      }}
                    >
                      {TETROMINOES[nextPiece].shape[0].map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4"
                          style={{
                            backgroundColor: TETROMINOES[nextPiece].color
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Controles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={startGame}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={gameOver}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {gameOver ? 'Reiniciar' : 'Jugar'}
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
                  <p>• ← → Mover pieza</p>
                  <p>• ↓ Caída rápida</p>
                  <p>• ↑ / Espacio: Rotar</p>
                  <p>• Completa líneas para puntos</p>
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
