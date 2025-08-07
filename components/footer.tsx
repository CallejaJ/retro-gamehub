import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className='w-full border-t border-white/10 py-12 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900'>
      <div className='px-4 text-center'>
        <div className='flex items-center justify-center space-x-2 mb-4'>
          <Gamepad2 className='h-6 w-6 text-purple-400' />
          <span className='text-white font-semibold'>Retro GameHub</span>
        </div>
        <p className='text-white/70'>
          © 2025 Memento Academy. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
