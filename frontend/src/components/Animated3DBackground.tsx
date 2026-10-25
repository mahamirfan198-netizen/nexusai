import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function Animated3DBackground() {
  // Mouse tracking for parallax 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050914] perspective-[1000px]">
      {/* 3D Wavy Blob 1 */}
      <motion.div
        style={{ rotateX, rotateY }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-br from-nexus-teal to-blue-600 opacity-20 blur-[80px]"
      />
      
      {/* 3D Wavy Blob 2 */}
      <motion.div
        style={{ rotateX, rotateY }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -90, 0],
          borderRadius: ["50% 50% 30% 70% / 50% 60% 40% 50%", "30% 70% 50% 50% / 40% 40% 60% 60%", "50% 50% 30% 70% / 50% 60% 40% 50%"],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-gradient-to-tl from-indigo-600 to-purple-800 opacity-20 blur-[100px]"
      />

      {/* Floating 3D Spheres */}
      <motion.div
        animate={{ y: [0, -50, 0], x: [0, 30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-white to-slate-400 opacity-80 shadow-[inset_-20px_-20px_40px_rgba(0,0,0,0.5),0_0_40px_rgba(255,255,255,0.4)]"
      />
      <motion.div
        animate={{ y: [0, 60, 0], x: [0, -40, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 left-1/4 w-20 h-20 rounded-full bg-gradient-to-tr from-nexus-teal to-emerald-500 opacity-80 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_30px_rgba(20,184,166,0.5)]"
      />

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-[#050914]/50" />
    </div>
  );
}