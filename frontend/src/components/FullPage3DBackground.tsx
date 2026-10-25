import { motion } from "framer-motion";

export function FullPage3DBackground() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#050914] overflow-hidden pointer-events-none flex items-center justify-center">
      
      {/* The 3D Wavy Shapes */}
      <div className="relative w-full max-w-7xl h-full flex items-center justify-center scale-150">
        
        {/* Wave 1 (Left) */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
            borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-20 w-[60vw] h-[60vw] bg-gradient-to-tr from-[#0f766e] via-[#14b8a6] to-[#2dd4bf] opacity-80 blur-[20px]"
          style={{ transform: "rotateX(45deg) rotateY(-30deg)" }}
        />

        {/* Wave 2 (Right) */}
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1.1, 1, 1.1],
            borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%"]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 w-[60vw] h-[60vw] bg-gradient-to-bl from-[#0f766e] via-[#14b8a6] to-[#06b6d4] opacity-80 blur-[20px]"
          style={{ transform: "rotateX(-45deg) rotateY(30deg)" }}
        />

        {/* Floating Sphere */}
        <motion.div
          animate={{ y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-40 w-40 h-40 rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#0f766e] shadow-[inset_-20px_-20px_40px_rgba(0,0,0,0.6),0_0_80px_rgba(45,212,191,0.6)]"
        />
      </div>

      {/* Dark gradient overlay so text is perfectly readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050914]/70 via-[#050914]/40 to-[#050914]" />
    </div>
  );
}