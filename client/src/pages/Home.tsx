import { useState } from "react";
import Header from "@/components/Header";
import GameTabs from "@/components/GameTabs";
import MissionsTab from "@/components/MissionsTab";
import PlayerStats from "@/components/PlayerStats";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";
import MissionModal from "@/components/MissionModal";
import SuccessModal from "@/components/SuccessModal";
import FailureModal from "@/components/FailureModal";
import InventoryTab from "@/components/InventoryTab";
import { useMission } from "@/hooks/useMission";
import { motion } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState("missions");
  const { 
    currentMission, 
    isMissionModalOpen,
    isSuccessModalOpen,
    isFailureModalOpen,
    closeMissionModal,
    closeSuccessModal,
    closeFailureModal
  } = useMission();

  const renderTabContent = () => {
    switch (activeTab) {
      case "missions":
        return <MissionsTab />;
      case "inventory":
        return <InventoryTab />;
      case "gang":
        return (
          <div className="bg-surface rounded-lg p-4 border border-primary neon-border mb-8">
            <h2 className="font-crime text-2xl text-primary mb-4">Gang</h2>
            <p className="text-gray-300">Gang features will be available soon...</p>
          </div>
        );
      case "heists":
        return (
          <div className="bg-surface rounded-lg p-4 border border-primary neon-border mb-8">
            <h2 className="font-crime text-2xl text-primary mb-4">Heists</h2>
            <p className="text-gray-300">Heists will be available soon...</p>
          </div>
        );
      case "pvp":
        return (
          <div className="bg-surface rounded-lg p-4 border border-primary neon-border mb-8">
            <h2 className="font-crime text-2xl text-primary mb-4">PvP</h2>
            <p className="text-gray-300">PvP features will be available soon...</p>
          </div>
        );
      default:
        return <MissionsTab />;
    }
  };

  return (
    <div className="bg-background text-white font-body min-h-screen overflow-x-hidden bg-grid">
      <Header />
      
      <motion.main 
        className="container mx-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GameTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {renderTabContent()}
        
        <PlayerStats />
        
        <Leaderboard />
      </motion.main>

      <MissionModal 
        isOpen={isMissionModalOpen} 
        onClose={closeMissionModal} 
        mission={currentMission}
      />
      
      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={closeSuccessModal} 
      />
      
      <FailureModal 
        isOpen={isFailureModalOpen} 
        onClose={closeFailureModal} 
      />

      <Footer />
    </div>
  );
}
