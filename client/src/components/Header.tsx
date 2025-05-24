import { useGameState } from "@/hooks/useGameState";
import WalletButton from "./WalletButton";
import { motion } from "framer-motion";

export default function Header() {
  const { player } = useGameState();

  return (
    <header className="relative overflow-hidden">
      <motion.div 
        className="bg-gradient-to-r from-dark via-surface to-dark border-b-2 border-primary py-4 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-pulse-neon">
              <i className="fas fa-skull-crossbones text-dark text-xl"></i>
            </div>
            <div>
              <h1 className="font-crime text-4xl text-primary text-stroke tracking-wider">CRIME TIME</h1>
              <p className="text-xs text-secondary font-pixel">Fuck it, do $CRIME (have $FUN)</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <motion.div 
              className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-primary animate-pulse-neon"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <i className="fas fa-coins text-accent"></i>
              <span className="font-pixel text-accent text-sm">$CRIME: <span>{player.crimeCoin.toLocaleString()}</span></span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-secondary neon-border-secondary"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <i className="fas fa-face-grin-tears text-secondary"></i>
              <span className="font-pixel text-secondary text-sm">$FUN: <span>{player.funCoin.toLocaleString()}</span></span>
            </motion.div>
          </div>
        
          <WalletButton />
        </div>
      </motion.div>
      
      {/* Mobile token display */}
      <div className="md:hidden flex justify-center gap-4 py-2 bg-dark border-b border-primary">
        <div className="flex items-center gap-2">
          <i className="fas fa-coins text-accent"></i>
          <span className="font-pixel text-accent text-xs">$CRIME: <span>{player.crimeCoin.toLocaleString()}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-face-grin-tears text-secondary"></i>
          <span className="font-pixel text-secondary text-xs">$FUN: <span>{player.funCoin.toLocaleString()}</span></span>
        </div>
      </div>
    </header>
  );
}
