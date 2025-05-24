import { useGameState } from "@/hooks/useGameState";
import { motion } from "framer-motion";

export default function PlayerStats() {
  const { player } = useGameState();

  const calculateSuccessRate = () => {
    const rate = player.successfulMissions / Math.max(1, player.totalMissions) * 100;
    return rate.toFixed(0);
  };

  const successRate = calculateSuccessRate();

  return (
    <motion.div 
      className="bg-surface rounded-lg p-4 border border-primary neon-border mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="font-crime text-2xl text-primary mb-4">Criminal Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="flex flex-col bg-dark p-4 rounded-lg border border-secondary"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-star text-accent"></i>
            <span className="font-pixel text-sm text-secondary">Reputation</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xl font-bold">{player.reputation}</span>
            <span className="text-xs text-gray-400">Level {player.level}</span>
          </div>
          <div className="w-full h-2 bg-surface mt-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary" 
              style={{ width: `${(player.experience / player.nextLevelExperience) * 100}%` }}
            ></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex flex-col bg-dark p-4 rounded-lg border border-accent"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-trophy text-accent"></i>
            <span className="font-pixel text-sm text-accent">Success Rate</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xl font-bold">{successRate}%</span>
            <span className="text-xs text-gray-400">{player.successfulMissions}/{player.totalMissions} missions</span>
          </div>
          <div className="w-full h-2 bg-surface mt-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent" 
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex flex-col bg-dark p-4 rounded-lg border border-primary"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-chart-line text-primary"></i>
            <span className="font-pixel text-sm text-primary">Total Earnings</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xl font-bold">{player.totalEarnings.toLocaleString()} $CRIME</span>
            <span className="text-xs text-gray-400">Lifetime</span>
          </div>
          <div className="w-full h-2 bg-surface mt-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${Math.min(100, (player.totalEarnings / 10000) * 100)}%` }}
            ></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
