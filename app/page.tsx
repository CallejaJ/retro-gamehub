import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Trophy, Gamepad2 } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer" // Importar el nuevo componente Footer

const games = [
  {
    id: "snake",
    title: "Snake Classic",
    description: "El clásico juego de la serpiente. Come frutas, crece y evita chocar contigo mismo.",
    image: "/placeholder.svg?height=200&width=300", // Imagen específica
    rating: 4.8,
    players: "2.1K",
    difficulty: "Fácil",
    category: "Arcade"
  },
  {
    id: "fruit-ninja",
    title: "Fruit Ninja",
    description: "Corta frutas volando con tu espada ninja. ¡Evita las bombas y consigue la puntuación más alta!",
    image: "/placeholder.svg?height=200&width=300", // Imagen específica
    rating: 4.9,
    players: "3.5K",
    difficulty: "Medio",
    category: "Acción"
  },
  {
    id: "tetris",
    title: "Tetris Classic",
    description: "Organiza las piezas que caen para completar líneas y obtener puntos.",
    image: "/placeholder.svg?height=200&width=300", // Imagen específica
    rating: 4.7,
    players: "1.8K",
    difficulty: "Medio",
    category: "Puzzle"
  },
  {
    id: "pong",
    title: "Pong Retro",
    description: "El primer videojuego de la historia. Controla tu paleta y vence a tu oponente.",
    image: "/placeholder.svg?height=200&width=300", // Imagen específica
    rating: 4.5,
    players: "892",
    difficulty: "Fácil",
    category: "Clásico"
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">GameHub</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="#games" className="text-white/80 hover:text-white transition-colors">
                Juegos
              </Link>
              <Link href="/leaderboard" className="text-white/80 hover:text-white transition-colors">
                Ranking
              </Link>
              <Link href="/leaderboard#comments" className="text-white/80 hover:text-white transition-colors">
                Comentarios
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Juegos Clásicos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              En Línea
            </span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Disfruta de los mejores juegos clásicos directamente en tu navegador. 
            Sin descargas, sin instalaciones, solo diversión pura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="#games">Explorar Juegos</Link>
            </Button>
            <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50">
              <Link href="/leaderboard">Ver Ranking</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-white/80">Jugadores Activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400 mb-2">50M+</div>
              <div className="text-white/80">Partidas Jugadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">4.8★</div>
              <div className="text-white/80">Calificación Promedio</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-white text-center mb-12">
            Juegos Destacados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {games.map((game) => (
              <Card key={game.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={game.image || "/placeholder.svg"} // Usar la imagen específica
                      alt={game.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2 bg-purple-600">
                      {game.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl">{game.title}</CardTitle>
                  <CardDescription className="text-white/70">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{game.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{game.players}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white/80">
                      {game.difficulty}
                    </Badge>
                  </div>
                  <Link href={`/games/${game.id}`}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Jugar Ahora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
