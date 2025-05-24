import { useContext } from "react";
import { GameContext } from "@/context/GameContext";
import { Player, Mission, LeaderboardEntry } from "@/types/game";
import { useToast } from "@/hooks/use-toast";

export const useGameState = () => {
  const { state, dispatch } = useContext(GameContext);
  const { toast } = useToast();

  // Player-related actions
  const updatePlayer = (playerData: Partial<Player>) => {
    dispatch({ type: "UPDATE_PLAYER", payload: playerData });
  };

  // Wallet connection
  const connectWallet = async (): Promise<void> => {
    // Simulate wallet connection
    return new Promise((resolve) => {
      setTimeout(() => {
        dispatch({ type: "CONNECT_WALLET", payload: true });
        resolve();
      }, 1500);
    });
  };

  // Mission completion
  const completeMission = (
    missionId: number, 
    crimeCoin: number, 
    funCoin: number,
    experience: number
  ) => {
    dispatch({ 
      type: "COMPLETE_MISSION", 
      payload: { missionId, crimeCoin, funCoin, experience } 
    });

    // Update player stats on the server
    try {
      apiUpdatePlayerStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update player stats on the server",
        variant: "destructive"
      });
    }
  };

  // Mission failure
  const failMission = (
    missionId: number, 
    crimeCoinLost: number, 
    funCoinGained: number
  ) => {
    dispatch({ 
      type: "FAIL_MISSION", 
      payload: { missionId, crimeCoinLost, funCoinGained } 
    });

    // Update player stats on the server
    try {
      apiUpdatePlayerStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update player stats on the server",
        variant: "destructive"
      });
    }
  };

  // API call to update player stats
  const apiUpdatePlayerStats = async () => {
    try {
      await fetch("/api/player", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(state.player)
      });
    } catch (error) {
      console.error("Failed to update player stats:", error);
      throw error;
    }
  };

  // Equip/unequip items
  const equip = (item: any) => {
    // Create a copy of the inventory
    const updatedInventory = [...state.player.inventory];
    
    // Find the item
    const itemIndex = updatedInventory.findIndex(i => i.id === item.id);
    if (itemIndex === -1) return;
    
    // Toggle equipped status
    updatedInventory[itemIndex] = {
      ...updatedInventory[itemIndex],
      equipped: !updatedInventory[itemIndex].equipped
    };
    
    // Update player with new inventory
    updatePlayer({ inventory: updatedInventory });
    
    // Update player stats on server
    try {
      apiUpdatePlayerStats();
    } catch (error) {
      console.error("Failed to update equipped items:", error);
    }
  };

  return {
    player: state.player,
    missions: state.missions,
    leaderboard: state.leaderboard,
    isWalletConnected: state.isWalletConnected,
    updatePlayer,
    connectWallet,
    completeMission,
    failMission,
    equip
  };
};
