import { useState, useEffect } from 'react';
import { useGameState } from './useGameState';
import { Mission, MissionAction, MissionRewards, MissionPenalties } from '@/types/game';
import { generateMissionActions, calculateSuccessChance, generateRandomReward } from '@/lib/gameUtils';
import { useToast } from '@/hooks/use-toast';

export const useMission = () => {
  const { player, missions, completeMission, failMission } = useGameState();
  const { toast } = useToast();
  
  // Mission state
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [missionProgress, setMissionProgress] = useState(0);
  const [currentMissionState, setCurrentMissionState] = useState<string>('');
  const [actions, setActions] = useState<MissionAction[]>([]);
  const [playerStats, setPlayerStats] = useState({
    stealth: 65,
    intimidation: 80,
    speed: 45,
    luck: 35
  });
  const [potentialReward, setPotentialReward] = useState(0);
  const [missionRewards, setMissionRewards] = useState<MissionRewards>({
    crimeCoin: 0,
    funCoin: 0,
    reputationGain: 0,
    bonusItems: []
  });
  const [missionPenalties, setMissionPenalties] = useState<MissionPenalties>({
    crimeCoinLost: 0,
    funCoinGained: 0,
    lessonLearned: ''
  });
  const [failureReason, setFailureReason] = useState('');

  // Start a mission
  const startMission = (mission: Mission) => {
    // Check if player has enough crime coins
    if (player.crimeCoin < mission.cost) {
      toast({
        title: "Not enough $CRIME",
        description: "You don't have enough $CRIME to start this mission!",
        variant: "destructive"
      });
      return;
    }

    setCurrentMission(mission);
    setMissionProgress(0);
    setCurrentMissionState(`You're about to start the ${mission.name} mission. Ready to commit some crime?`);
    
    // Generate random actions for this mission
    const missionActions = generateMissionActions(mission.difficulty);
    setActions(missionActions);
    
    // Set initial player stats (slightly randomized)
    setPlayerStats({
      stealth: Math.floor(Math.random() * 30) + 50,
      intimidation: Math.floor(Math.random() * 30) + 60,
      speed: Math.floor(Math.random() * 30) + 40,
      luck: Math.floor(Math.random() * 30) + 20
    });
    
    // Set potential reward
    const [minReward, maxReward] = mission.reward.split('-').map(n => parseInt(n.trim()));
    const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
    setPotentialReward(reward);
    
    setIsMissionModalOpen(true);
  };

  // Take an action during a mission
  const takeAction = (action: MissionAction) => {
    // Update the affected stat
    setPlayerStats(prev => ({
      ...prev,
      [action.affectedStat]: Math.min(100, prev[action.affectedStat] + action.bonus)
    }));

    // Update mission progress
    setMissionProgress(prev => Math.min(100, prev + 20));
    
    // Update mission state with a narrative
    setCurrentMissionState(action.narrative);
    
    // Remove this action from available actions
    setActions(prev => prev.filter(a => a.name !== action.name));
    
    // Generate a new replacement action
    if (currentMission) {
      const newAction = generateMissionActions(currentMission.difficulty, 1)[0];
      setActions(prev => [...prev, newAction]);
    }
  };

  // Abort the current mission
  const abortMission = () => {
    if (currentMission) {
      // Set penalty for aborting (lose the mission cost)
      setMissionPenalties({
        crimeCoinLost: currentMission.cost,
        funCoinGained: 1, // Get a little fun coin for the disappointment
        lessonLearned: "You aborted the mission and lost your investment. Sometimes it's better to walk away than get caught!"
      });
      
      // Apply the penalties
      failMission(currentMission.id, currentMission.cost, 1);
      
      // Close the mission modal and show the failure modal
      setIsMissionModalOpen(false);
      setFailureReason("You decided to abort the mission and cut your losses.");
      setIsFailureModalOpen(true);
    }
  };

  // Continue with the mission (progress to outcome)
  const continueMission = () => {
    if (!currentMission) return;
    
    // If mission is not complete, increment progress
    if (missionProgress < 100) {
      setMissionProgress(prev => Math.min(100, prev + 20));
      setCurrentMissionState("You continue with the mission...");
      return;
    }
    
    // Mission is complete, calculate success chance based on player stats
    const successChance = calculateSuccessChance(playerStats, currentMission.difficulty);
    const isSuccessful = Math.random() < successChance;
    
    if (isSuccessful) {
      // Mission succeeded
      const rewards = generateRandomReward(currentMission, potentialReward);
      setMissionRewards(rewards);
      
      // Apply rewards to player
      completeMission(
        currentMission.id, 
        rewards.crimeCoin, 
        rewards.funCoin,
        rewards.reputationGain * 10 // Convert rep to experience
      );
      
      // Close mission modal and show success modal
      setIsMissionModalOpen(false);
      setIsSuccessModalOpen(true);
    } else {
      // Mission failed
      const crimeCoinLost = currentMission.cost;
      const funCoinGained = Math.floor(Math.random() * 3) + 1; // 1-3 fun coins for failing
      
      // Generate random failure reason
      const failureReasons = [
        "You got caught by security cameras you didn't notice!",
        "An unexpected police patrol showed up at the worst time.",
        "Your getaway vehicle broke down during the escape.",
        "A witness called the authorities on you.",
        "You tripped the silent alarm system."
      ];
      
      const lessonLearned = [
        "Next time, spend more time scouting the location first.",
        "You should invest in better equipment for jobs like these.",
        "Consider improving your stealth skills for future missions.",
        "Maybe bring a partner along next time for backup.",
        "Try a less risky job until you build up more experience."
      ];
      
      const randomFailureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      const randomLesson = lessonLearned[Math.floor(Math.random() * lessonLearned.length)];
      
      setMissionPenalties({
        crimeCoinLost,
        funCoinGained,
        lessonLearned: randomLesson
      });
      
      // Apply penalties to player
      failMission(currentMission.id, crimeCoinLost, funCoinGained);
      
      // Close mission modal and show failure modal
      setIsMissionModalOpen(false);
      setFailureReason(randomFailureReason);
      setIsFailureModalOpen(true);
    }
  };

  // Collect rewards and close success modal
  const collectRewards = () => {
    setIsSuccessModalOpen(false);
    
    toast({
      title: "Rewards Collected",
      description: `You've earned ${missionRewards.crimeCoin} $CRIME and ${missionRewards.funCoin} $FUN`,
      variant: "success"
    });
  };

  // Try again after failure
  const tryAgain = () => {
    setIsFailureModalOpen(false);
    
    if (currentMission) {
      // Check if player still has enough coins to try again
      if (player.crimeCoin < currentMission.cost) {
        toast({
          title: "Not enough $CRIME",
          description: "You don't have enough $CRIME to try this mission again!",
          variant: "destructive"
        });
        return;
      }
      
      startMission(currentMission);
    }
  };

  // Modal control functions
  const closeMissionModal = () => setIsMissionModalOpen(false);
  const closeSuccessModal = () => setIsSuccessModalOpen(false);
  const closeFailureModal = () => setIsFailureModalOpen(false);

  return {
    currentMission,
    isMissionModalOpen,
    isSuccessModalOpen,
    isFailureModalOpen,
    missionProgress,
    currentMissionState,
    playerStats,
    potentialReward,
    actions,
    missionRewards,
    missionPenalties,
    failureReason,
    startMission,
    takeAction,
    abortMission,
    continueMission,
    collectRewards,
    tryAgain,
    closeMissionModal,
    closeSuccessModal,
    closeFailureModal
  };
};
