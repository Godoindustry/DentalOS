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
          animate={{ y: showPassword ? -12 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute top-0 left-6 right-6 h-2 bg-white rounded-b-md shadow-sm flex justify-around opacity-90 pointer-events-none"
          title="Arcada Superior"
        >
          {/* Detalhes estéticos dos dentes superiores */}
          <div className="w-3 h-2 bg-slate-100 border-x border-slate-200 rounded-b-sm" />
          <div className="w-3 h-2 bg-slate-100 border-x border-slate-200 rounded-b-sm" />
          <div className="w-3 h-2 bg-slate-100 border-x border-slate-200 rounded-b-sm" />
          <div className="w-3 h-2 bg-slate-100 border-x border-slate-200 rounded-b-sm" />
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

        {/* Botão Interativo "Boca" (Substitui o olho tradicional) */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="ml-3 z-20 text-slate-400 hover:text-white transition-colors focus:outline-none flex items-center justify-center p-1"
          aria-label="Revelar senha"
        >
          <motion.div
            animate={{ scale: showPassword ? 1.1 : 1 }}
            className="text-lg"
          >
            {showPassword ? "👄" : "🤐"}
          </motion.div>
        </button>

        {/* Arcada Dentária Inferior (Animação) */}
        <motion.div 
          animate={{ y: showPassword ? 12 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute bottom-0 left-6 right-6 h-2 bg-white rounded-t-md shadow-sm flex justify-around opacity-90 pointer-events-none"
          title="Arcada Inferior"
        >
          {/* Detalhes estéticos dos dentes inferiores */}
          <div className="w-3 h-2 bg-slate-100 border-x border-slate-200 rounded-t-sm" />
          <div className="w-3 h-2 bg-slate-100 border-x border-slate-200 rounded-t-sm" />
          <div className="w-3 h-2 bg-slate-100 border-x border-slate-200 rounded-t-sm" />
          <div className="w-3 h-2 bg-slate-100 border-x border-slate-200 rounded-t-sm" />
        </motion.div>

      </div>
    </div>
  );
}
