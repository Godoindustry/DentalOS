import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface DentalPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function DentalPasswordInput({ 
  value, 
  onChange, 
  placeholder = "Sua senha profissional",
  className = "",
  ...props 
}: DentalPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      {/* Container Principal do Input */}
      <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 overflow-hidden shadow-inner">
        
        {/* Arcada Dentária Superior (Animação) */}
        <motion.div 
          animate={{ y: showPassword ? -16 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-0 left-6 right-6 h-3 bg-white/90 rounded-b-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex justify-center gap-1 opacity-95 pointer-events-none"
          title="Arcada Superior"
        >
          {/* Dentes superiores arredondados e realistas */}
          <div className="w-3.5 h-full bg-slate-50 border-x border-slate-200/50 rounded-b-full shadow-inner" />
          <div className="w-4.5 h-full bg-slate-50 border-x border-slate-200/50 rounded-b-full shadow-inner" />
          <div className="w-5 h-full bg-slate-50 border-x border-slate-200/50 rounded-b-full shadow-inner" />
          <div className="w-5 h-full bg-slate-50 border-x border-slate-200/50 rounded-b-full shadow-inner" />
          <div className="w-4.5 h-full bg-slate-50 border-x border-slate-200/50 rounded-b-full shadow-inner" />
          <div className="w-3.5 h-full bg-slate-50 border-x border-slate-200/50 rounded-b-full shadow-inner" />
        </motion.div>

        {/* Input de Senha */}
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none z-10 text-sm tracking-wide"
          {...props}
        />

        {/* Botão Interativo "Dente SVG" (Substitui o olho tradicional) */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="ml-3 z-20 text-slate-400 hover:text-white transition-colors focus:outline-none flex items-center justify-center p-1"
          aria-label="Revelar senha"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 transition-transform duration-300 ${showPassword ? 'text-white' : 'text-slate-400'}`}
          >
            {showPassword ? (
              // Dente vazado (senha revelada)
              <path d="M12 2c2.761 0 5 2.239 5 5v3.5c0 1.5-.5 3-1.5 4.5-.5.75-1.5 2-1.5 3.5v2.5a1 1 0 0 1-2 0v-1.5c0-.5-.5-1-1-1s-1 .5-1 1v1.5a1 1 0 0 1-2 0v-2.5c0-1.5-1-2.75-1.5-3.5C5.5 10.5 5 9 5 7.5V7c0-2.761 2.239-5 5-5Zm0 2c-1.657 0-3 1.343-3 3v3.5c0 1.956.705 3.655 1.762 4.908A5.474 5.474 0 0 0 11 16.5v1.28c.32-.087.653-.18 1-.28.347.1.68.193 1 .28v-1.28a5.474 5.474 0 0 0 .238-1.092C14.295 14.155 15 12.456 15 10.5V7c0-1.657-1.343-3-3-3Z" />
            ) : (
              // Dente sólido (senha oculta)
              <path d="M12 2c2.761 0 5 2.239 5 5v3.5c0 1.5-.5 3-1.5 4.5-.5.75-1.5 2-1.5 3.5v2.5a1 1 0 0 1-2 0v-1.5c0-.5-.5-1-1-1s-1 .5-1 1v1.5a1 1 0 0 1-2 0v-2.5c0-1.5-1-2.75-1.5-3.5C5.5 10.5 5 9 5 7.5V7c0-2.761 2.239-5 5-5Z" />
            )}
          </svg>
        </button>

        {/* Arcada Dentária Inferior (Animação) */}
        <motion.div 
          animate={{ y: showPassword ? 16 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute bottom-0 left-6 right-6 h-3 bg-white/90 rounded-t-lg shadow-[0_-2px_4px_rgba(0,0,0,0.1)] flex justify-center gap-1 opacity-95 pointer-events-none"
          title="Arcada Inferior"
        >
          {/* Dentes inferiores arredondados e realistas */}
          <div className="w-3.5 h-full bg-slate-50 border-x border-slate-200/50 rounded-t-full shadow-inner" />
          <div className="w-4.5 h-full bg-slate-50 border-x border-slate-200/50 rounded-t-full shadow-inner" />
          <div className="w-5 h-full bg-slate-50 border-x border-slate-200/50 rounded-t-full shadow-inner" />
          <div className="w-5 h-full bg-slate-50 border-x border-slate-200/50 rounded-t-full shadow-inner" />
          <div className="w-4.5 h-full bg-slate-50 border-x border-slate-200/50 rounded-t-full shadow-inner" />
          <div className="w-3.5 h-full bg-slate-50 border-x border-slate-200/50 rounded-t-full shadow-inner" />
        </motion.div>

      </div>
    </div>
  );
}
