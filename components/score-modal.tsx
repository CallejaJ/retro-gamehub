// components/score-modal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void; // Esta función solo cerrará el modal y reiniciará el juego
  score: number;
  gameName: string;
  hasScoreToSave: boolean; // Prop para indicar si hay puntuación para guardar
  onSave: (userName: string) => void; // Esta función guardará la puntuación
}

export function ScoreModal({
  isOpen,
  onClose,
  score,
  gameName,
  hasScoreToSave,
  onSave,
}: ScoreModalProps) {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUserName(""); // Reset username when modal opens
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (userName.trim()) {
      onSave(userName.trim());
      // onClose() // No llamamos onClose aquí, la página de juego lo manejará después de onSave
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {" "}
      {/* onOpenChange llamará a onClose */}
      <DialogContent className='sm:max-w-[425px] bg-gray-900 text-white border-white/20'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-purple-400'>
            ¡Partida Terminada!
          </DialogTitle>
          {hasScoreToSave ? (
            <DialogDescription className='text-white/70'>
              Has conseguido una puntuación de{" "}
              <span className='font-bold text-yellow-400'>{score}</span> en{" "}
              {gameName}. Introduce tu nombre para guardar tu puntuación en el
              ranking.
            </DialogDescription>
          ) : (
            <DialogDescription className='text-white/70'>
              Tu partida en {gameName} ha terminado. ¡Inténtalo de nuevo para
              conseguir una puntuación alta!
            </DialogDescription>
          )}
        </DialogHeader>

        {hasScoreToSave && (
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label htmlFor='username' className='text-right text-white'>
                Tu Nombre
              </label>
              <Input
                id='username'
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className='col-span-3 bg-white/10 border-white/20 text-white placeholder:text-white/50'
                placeholder='Ej: JugadorPro'
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>
          </div>
        )}

        <DialogFooter className='flex flex-col sm:flex-row sm:justify-end gap-2'>
          {hasScoreToSave && (
            <Button
              type='submit'
              onClick={handleSubmit}
              disabled={!userName.trim()}
              className='bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto'
            >
              Guardar Puntuación
            </Button>
          )}
          <Button
            onClick={onClose} // Llama a onClose para cerrar el modal y reiniciar el juego
            className='bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 w-full sm:w-auto'
          >
            <RotateCcw className='h-4 w-4 mr-2' />
            Jugar de Nuevo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
