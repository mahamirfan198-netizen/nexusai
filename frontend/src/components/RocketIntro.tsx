import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { useEffect, useState } from "react";

export function RocketIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState("countdown"); // countdown -> launch -> done

  useEffect(() => {
    // Wait 1 second in countdown, then launch
    const timer = setTimeout(() => setPhase("launch"), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === "launch") {
      // Wait 2 seconds for launch animation, then finish
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[10000] bg-[#03060a] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={phase === "launch" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, delay: phase === "launch" ? 1.5 : 0 }}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={phase === "launch" ? { y: "-150vh", scale: 0.5 } : { y: [0, -10, 0] }}
        transition={phase === "launch" ? { duration: 1.5, ease: "easeIn" } : { duration: 1, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <Rocket className="w-24 h-24 text-[#00D68F] mb-6" />
        <h1 className="text-4xl font-bold text-white tracking-widest">NEXUS AI</h1>
        
        {/* Engine Exhaust */}
        <motion.div 
          className="absolute -bottom-20 w-4 h-40 bg-gradient-to-b from-[#00D68F] to-transparent blur-md rounded-full"
          animate={phase === "launch" ? { height: [160, 400], opacity: [1, 0] } : { height: [100, 150, 100] }}
          transition={phase === "launch" ? { duration: 1.5 } : { duration: 0.5, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Countdown Text */}
      {phase === "countdown" && (
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute bottom-20 text-[#A8B3C2] font-mono tracking-widest text-sm"
        >
          PREPARING LAUNCH SEQUENCE...
        </motion.p>
      )}
    </motion.div>
  );
}