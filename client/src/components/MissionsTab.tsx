import { useGameState } from "@/hooks/useGameState";
import MissionCard from "./MissionCard";
import { useMission } from "@/hooks/useMission";
import { motion } from "framer-motion";

export default function MissionsTab() {
  const { player, missions } = useGameState();
  const { startMission } = useMission();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div id="missions-tab" className="bg-surface rounded-lg p-4 border border-primary neon-border mb-8">
      <div className="flex justify-between mb-4">
        <h2 className="font-crime text-2xl text-primary">Choose Your Crime</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary">Daily missions: <span>{player.dailyMissions}/5</span></span>
          <div className="w-24 h-2 bg-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary" 
              style={{ width: `${(player.dailyMissions / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {missions.map(mission => (
          <MissionCard 
            key={mission.id} 
            mission={mission} 
            onSelect={startMission}
          />
        ))}
      </motion.div>
    </div>
  );
}
