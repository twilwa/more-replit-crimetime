import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMission } from "@/hooks/useMission";
import { Mission, MissionAction } from "@/types/game";
import { calculateSuccessChance } from "@/lib/gameUtils";

type MissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission | null;
};

export default function MissionModal({ isOpen, onClose, mission }: MissionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { 
    currentMissionState, 
    missionProgress, 
    playerStats, 
    potentialReward,
    actions,
    takeAction,
    abortMission,
    continueMission
  } = useMission();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  console.log("MissionModal rendering, isOpen:", isOpen, "mission:", mission);

  const handleActionClick = (action: MissionAction) => {
    takeAction(action);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
          <motion.div
            ref={modalRef}
            className="bg-surface rounded-lg border-2 border-primary neon-border max-w-2xl w-full mx-4 overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="p-4 bg-primary">
              <h2 className="font-crime text-2xl text-dark">
                Mission: {mission?.name || 'Loading...'}
              </h2>
            </div>
            
            {!mission ? (
              <div className="p-6">
                <p className="text-white text-center py-10">Loading mission details...</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="flex-1">
                    <img 
                      src={mission?.image || ''} 
                      alt={mission?.name || 'Mission image'} 
                      className="w-full h-auto rounded-lg mb-4"
                    />
                    
                    <div className="p-4 bg-dark rounded-lg border border-warning">
                      <h3 className="font-pixel text-warning text-sm mb-2">MISSION STATUS</h3>
                      <div className="bg-surface/50 rounded p-2 mb-3">
                        <p className="text-gray-300">
                          {currentMissionState || "You're about to start the mission. Ready?"}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 mb-3">
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Mission Progress</span>
                            <span>{missionProgress}%</span>
                          </div>
                          <div className="w-full bg-surface h-4 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-warning" 
                              initial={{ width: 0 }}
                              animate={{ width: `${missionProgress}%` }}
                              transition={{ duration: 1 }}
                            ></motion.div>
                          </div>
                        </div>
                        
                        {missionProgress >= 100 && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Success Chance</span>
                              <span className={
                                calculateSuccessChance(playerStats, mission.difficulty) > 0.7 ? 'text-success' :
                                calculateSuccessChance(playerStats, mission.difficulty) > 0.4 ? 'text-warning' :
                                'text-destructive'
                              }>
                                {Math.round(calculateSuccessChance(playerStats, mission.difficulty) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-surface h-4 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${
                                  calculateSuccessChance(playerStats, mission.difficulty) > 0.7 ? 'bg-success' :
                                  calculateSuccessChance(playerStats, mission.difficulty) > 0.4 ? 'bg-warning' :
                                  'bg-destructive'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${calculateSuccessChance(playerStats, mission.difficulty) * 100}%` }}
                                transition={{ duration: 1 }}
                              ></motion.div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-surface/30 rounded p-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <span className="text-xs">STATUS:</span>
                          {missionProgress < 100 ? (
                            <span className="text-warning font-medium">In Progress</span>
                          ) : (
                            <span className="text-success font-medium">Ready for Final Move</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 bg-dark rounded-lg border border-primary mb-4">
                      <h3 className="font-pixel text-primary text-sm mb-2">YOUR STATS</h3>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {Object.entries(playerStats).map(([stat, value]) => (
                          <div key={stat}>
                            <div className="text-gray-400 text-xs mb-1">{stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
                            <div className="flex items-center gap-1">
                              <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full ${
                                    stat === 'stealth' ? 'bg-secondary' :
                                    stat === 'intimidation' ? 'bg-primary' :
                                    stat === 'speed' ? 'bg-accent' :
                                    'bg-warning'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  transition={{ duration: 0.5 }}
                                ></motion.div>
                              </div>
                              <span className="text-xs">{value}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-400">Cost:</span> 
                          <span className="text-accent">{mission.cost} $CRIME</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Potential Reward:</span> 
                          <span className="text-success">{potentialReward} $CRIME</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark rounded-lg border border-secondary p-4 mb-4">
                      <h3 className="font-pixel text-secondary text-sm mb-3">CHOOSE YOUR ACTION</h3>
                      
                      <div className="space-y-3">
                        {actions.map((action, index) => (
                          <motion.button 
                            key={index}
                            className="w-full bg-surface hover:bg-opacity-80 text-left p-3 rounded border border-primary text-white flex justify-between items-center"
                            whileHover={{ x: 5 }}
                            whileTap={{ x: 0 }}
                            onClick={() => handleActionClick(action)}
                            disabled={missionProgress >= 100}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{action.name}</span>
                              <span className="text-xs text-gray-400 mt-1 line-clamp-1">
                                {action.description || "Use this action to progress in your mission"}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              action.affectedStat === 'success' ? 'bg-primary/20 text-primary' :
                              action.affectedStat === 'stealth' ? 'bg-secondary/20 text-secondary' :
                              action.affectedStat === 'speed' ? 'bg-accent/20 text-accent' :
                              'bg-warning/20 text-warning'
                            }`}>
                              +{action.bonus}% {action.affectedStat.charAt(0).toUpperCase() + action.affectedStat.slice(1)}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-auto flex gap-2">
                      <motion.button 
                        className="flex-1 bg-destructive py-2 rounded font-pixel text-sm hover:bg-opacity-90 transition-all"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        onClick={abortMission}
                      >
                        ABORT MISSION
                      </motion.button>
                      <motion.button 
                        className="flex-1 bg-primary py-2 rounded font-pixel text-sm hover:bg-opacity-90 transition-all"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        onClick={continueMission}
                      >
                        CONTINUE
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}