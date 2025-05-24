import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMission } from "@/hooks/useMission";

type FailureModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FailureModal({ isOpen, onClose }: FailureModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { 
    missionPenalties, 
    currentMission,
    failureReason,
    tryAgain
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

  const handleTryAgain = () => {
    tryAgain();
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
            className="bg-surface rounded-lg border-2 border-destructive neon-border max-w-md w-full mx-4 overflow-hidden animate-shake"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="p-4 bg-destructive">
              <h2 className="font-crime text-2xl text-dark text-center">MISSION FAILED!</h2>
            </div>
            
            <div className="p-6 text-center">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/5229/5229377.png" 
                alt="Police lights" 
                className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-destructive mb-4"
              />
              
              <motion.h3 
                className="font-pixel text-destructive text-xl mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                BUSTED!
              </motion.h3>
              
              <p className="text-gray-300 mb-6">
                {failureReason || `You got caught during the ${currentMission.name} mission. Better luck next time!`}
              </p>
              
              <div className="flex justify-center gap-8 mb-8">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <div className="text-5xl font-bold text-destructive mb-2">-{missionPenalties.crimeCoinLost}</div>
                  <div className="text-xs text-gray-400">$CRIME LOST</div>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <div className="text-5xl font-bold text-secondary mb-2">+{missionPenalties.funCoinGained}</div>
                  <div className="text-xs text-gray-400">$FUN EARNED</div>
                  <div className="text-xs text-gray-500">(for the lols)</div>
                </motion.div>
              </div>
              
              <motion.div 
                className="bg-dark p-4 rounded-lg mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="font-pixel text-primary text-sm mb-2">WHAT WENT WRONG</h4>
                <p className="text-xs text-gray-300">
                  {missionPenalties.lessonLearned || "You didn't have enough skill for this job. Try improving your stats or taking an easier mission."}
                </p>
              </motion.div>
              
              <motion.button 
                className="bg-primary text-dark py-3 px-8 rounded-lg font-pixel text-sm hover:bg-opacity-90 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTryAgain}
              >
                TRY AGAIN
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
