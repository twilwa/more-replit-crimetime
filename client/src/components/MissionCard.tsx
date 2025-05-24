import { motion } from "framer-motion";
import { Mission } from "@/types/game";

type MissionCardProps = {
  mission: Mission;
  onSelect: (mission: Mission) => void;
};

export default function MissionCard({ mission, onSelect }: MissionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-accent';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      default: return 'text-accent';
    }
  };

  const getDifficultyBgColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-accent';
      case 'medium': return 'bg-warning';
      case 'hard': return 'bg-destructive';
      default: return 'bg-accent';
    }
  };

  return (
    <motion.div
      className="mission-card bg-dark rounded-lg overflow-hidden border border-primary hover:animate-pulse-neon transition-all cursor-pointer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(mission)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img 
          src={mission.image} 
          alt={mission.name} 
          className="w-full h-32 object-cover"
        />
        <div className={`absolute top-2 right-2 bg-surface px-2 py-1 rounded text-xs font-pixel ${getDifficultyColor(mission.difficulty)}`}>
          {mission.difficulty}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-crime text-xl text-primary mb-2">{mission.name}</h3>
        <p className="text-sm text-gray-300 mb-3">{mission.description}</p>
        
        <div className="flex justify-between text-xs mb-3">
          <div>
            <span className="text-gray-400">Cost:</span> 
            <span className="text-accent">{mission.cost} $CRIME</span>
          </div>
          <div>
            <span className="text-gray-400">Reward:</span> 
            <span className="text-success">{mission.reward} $CRIME</span>
          </div>
        </div>
        
        <div className="flex justify-between text-xs mb-4">
          <div>
            <span className="text-gray-400">Success Rate:</span> 
            <span className={getDifficultyColor(mission.difficulty)}>{mission.successRate}</span>
          </div>
          <div>
            <span className="text-gray-400">Time:</span> 
            <span className="text-gray-300">{mission.timeRequired}</span>
          </div>
        </div>
        
        <motion.button 
          className="w-full bg-primary text-dark py-2 rounded font-pixel text-sm hover:bg-opacity-90 transition-all"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          onClick={() => onSelect(mission)}
        >
          START MISSION
        </motion.button>
      </div>
    </motion.div>
  );
}
