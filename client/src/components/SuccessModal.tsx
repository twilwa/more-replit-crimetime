import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMission } from "@/hooks/useMission";

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { 
    missionRewards, 
    currentMission,
    collectRewards
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

  if (!currentMission) return null;

  const handleCollectRewards = () => {
    collectRewards();
    onClose();
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
            className="bg-surface rounded-lg border-2 border-success neon-border-secondary max-w-md w-full mx-4 overflow-hidden animate-float"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="p-4 bg-success">
              <h2 className="font-crime text-2xl text-dark text-center">MISSION SUCCESSFUL!</h2>
            </div>
            
            <div className="p-6 text-center">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2037/2037457.png" 
                alt="Money bag with cash" 
                className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-success mb-4"
              />
              
              <motion.h3 
                className="font-pixel text-success text-xl mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                YOU SCORED BIG!
              </motion.h3>
              
              <p className="text-gray-300 mb-6">
                You successfully completed the {currentMission.name} mission and got away clean!
              </p>
              
              <div className="flex justify-center gap-8 mb-8">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <div className="text-5xl font-bold text-accent mb-2">+{missionRewards.crimeCoin}</div>
                  <div className="text-xs text-gray-400">$CRIME EARNED</div>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <div className="text-5xl font-bold text-secondary mb-2">+{missionRewards.funCoin}</div>
                  <div className="text-xs text-gray-400">$FUN EARNED</div>
                </motion.div>
              </div>
              
              {missionRewards.bonusItems && missionRewards.bonusItems.length > 0 && (
                <motion.div 
                  className="bg-dark p-4 rounded-lg mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h4 className="font-pixel text-primary text-sm mb-2">BONUS REWARDS</h4>
                  <div className="flex justify-center gap-4">
                    {missionRewards.bonusItems.map((item, index) => (
                      <div key={index} className="bg-surface p-3 rounded-lg">
                        <i className={`fas ${item.icon} text-secondary text-2xl`}></i>
                        <div className="text-xs mt-1">{item.name}</div>
                      </div>
                    ))}
                    {missionRewards.reputationGain > 0 && (
                      <div className="bg-surface p-3 rounded-lg">
                        <i className="fas fa-star text-accent text-2xl"></i>
                        <div className="text-xs mt-1">+{missionRewards.reputationGain} Rep</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              <motion.button 
                className="bg-success text-dark py-3 px-8 rounded-lg font-pixel text-sm hover:bg-opacity-90 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCollectRewards}
              >
                COLLECT REWARDS
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
