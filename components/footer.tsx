import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className='border-t border-white/10 py-12 bg-black/20 backdrop-blur-sm'>
      <div className='container mx-auto px-4 text-center'>
        <div className='flex items-center justify-center space-x-2 mb-4'>
          <Gamepad2 className='h-6 w-6 text-purple-400' />
          <span className='text-white font-semibold'>GameHub</span>
        </div>
        <p className='text-white/60'>
          © 2024 GameHub. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
