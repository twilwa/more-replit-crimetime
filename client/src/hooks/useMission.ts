import { useState, useEffect } from 'react';
import { useGameState } from './useGameState';
import { Mission, MissionAction, MissionRewards, MissionPenalties } from '@/types/game';
import { generateMissionActions, calculateSuccessChance, generateRandomReward } from '@/lib/gameUtils';
import { useToast } from '@/hooks/use-toast';

export const useMission = () => {
  console.log("useMission hook initialized");
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
    console.log("Starting mission:", mission.name);

    // First open the mission modal to show loading state
    setIsMissionModalOpen(true);
    setCurrentMission(mission);
    setMissionProgress(0);
    setCurrentMissionState("Initializing mission...");
    
    // Make API call to start the mission
    fetch('/api/missions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: 1, // Default player for now
        missionId: mission.id
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to start mission');
      }
      return response.json();
    })
    .then(data => {
      if (!data.success) {
        // Handle error case
        toast({
          title: "Mission Failed to Start",
          description: data.message || "An error occurred while starting the mission",
          variant: "destructive"
        });
        setIsMissionModalOpen(false);
        return;
      }
      
      // Success - update state with server data
      setCurrentMissionState(data.missionState || `You're about to start the ${mission.name} mission. Ready to commit some crime?`);
      setActions(data.actions || generateMissionActions(mission.difficulty));
      setPlayerStats(data.playerStats || {
        stealth: Math.floor(Math.random() * 30) + 50,
        intimidation: Math.floor(Math.random() * 30) + 60,
        speed: Math.floor(Math.random() * 30) + 40,
        luck: Math.floor(Math.random() * 30) + 20
      });
      
      // Calculate potential reward from min/max values
      const baseReward = mission.min_reward + 
        Math.floor(Math.random() * (mission.max_reward - mission.min_reward));
      setPotentialReward(baseReward);
      
    })
    .catch(error => {
      console.error("Error starting mission:", error);
      
      // Fallback to client-side logic if API fails
      setCurrentMissionState(`You're about to start the ${mission.name} mission. Ready to commit some crime?`);
      setActions(generateMissionActions(mission.difficulty));
      setPlayerStats({
        stealth: Math.floor(Math.random() * 30) + 50,
        intimidation: Math.floor(Math.random() * 30) + 60,
        speed: Math.floor(Math.random() * 30) + 40,
        luck: Math.floor(Math.random() * 30) + 20
      });
      
      // Calculate potential reward from min/max values or fall back to legacy format
      let baseReward = 100;
      if (mission.min_reward && mission.max_reward) {
        baseReward = mission.min_reward + 
          Math.floor(Math.random() * (mission.max_reward - mission.min_reward));
      } else if (mission.reward) {
        baseReward = parseInt(mission.reward.replace(/[^0-9]/g, '')) || 100;
      }
      setPotentialReward(baseReward);
      
      toast({
        title: "Connection Issue",
        description: "Playing in offline mode. Some features may be limited.",
        variant: "destructive"
      });
    });
  };

  // Take an action during a mission
  const takeAction = (action: MissionAction) => {
    if (!currentMission) return;
    
    // Call the server API to process this action
    fetch('/api/missions/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: 1, // Default player for now
        missionId: currentMission.id,
        action
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to process mission action');
      }
      return response.json();
    })
    .then(data => {
      if (!data.success) {
        toast({
          title: "Action Failed",
          description: data.message || "An error occurred processing your action",
          variant: "destructive"
        });
        return;
      }
      
      // Update mission progress
      setMissionProgress(prev => Math.min(100, prev + (data.progressIncrease || 20)));
      
      // Update narrative based on server response
      setCurrentMissionState(data.narrative || action.narrative);
      
      // Update player stats based on action
      if (data.statIncrease) {
        const { stat, value } = data.statIncrease;
        
        // Type-safe stat update
        setPlayerStats(prev => {
          const updatedStats = { ...prev };
          if (stat === 'stealth') {
            updatedStats.stealth = Math.min(100, prev.stealth + value);
          } else if (stat === 'intimidation') {
            updatedStats.intimidation = Math.min(100, prev.intimidation + value);
          } else if (stat === 'speed') {
            updatedStats.speed = Math.min(100, prev.speed + value);
          } else if (stat === 'luck') {
            updatedStats.luck = Math.min(100, prev.luck + value);
          } else if (stat === 'success') {
            // Boost all stats a bit
            updatedStats.stealth = Math.min(100, prev.stealth + Math.floor(value / 4));
            updatedStats.intimidation = Math.min(100, prev.intimidation + Math.floor(value / 4));
            updatedStats.speed = Math.min(100, prev.speed + Math.floor(value / 4));
            updatedStats.luck = Math.min(100, prev.luck + Math.floor(value / 4));
          }
          return updatedStats;
        });
      } else {
        // Fallback to client-side stat update if server doesn't provide it
        if (action.affectedStat === 'stealth' || 
            action.affectedStat === 'intimidation' || 
            action.affectedStat === 'speed' || 
            action.affectedStat === 'luck') {
          
          setPlayerStats(prev => {
            const updatedStats = { ...prev };
            if (action.affectedStat === 'stealth') {
              updatedStats.stealth = Math.min(100, prev.stealth + action.bonus);
            } else if (action.affectedStat === 'intimidation') {
              updatedStats.intimidation = Math.min(100, prev.intimidation + action.bonus);
            } else if (action.affectedStat === 'speed') {
              updatedStats.speed = Math.min(100, prev.speed + action.bonus);
            } else if (action.affectedStat === 'luck') {
              updatedStats.luck = Math.min(100, prev.luck + action.bonus);
            }
            return updatedStats;
          });
        } else if (action.affectedStat === 'success') {
          // Direct success bonus increases all stats a little
          setPlayerStats(prev => ({
            stealth: Math.min(100, prev.stealth + Math.floor(action.bonus / 4)),
            intimidation: Math.min(100, prev.intimidation + Math.floor(action.bonus / 4)),
            speed: Math.min(100, prev.speed + Math.floor(action.bonus / 4)),
            luck: Math.min(100, prev.luck + Math.floor(action.bonus / 4))
          }));
        }
      }
      
      // Remove this action from available actions
      setActions(prev => prev.filter(a => a.name !== action.name));
      
      // Generate a new replacement action
      if (currentMission) {
        const newAction = generateMissionActions(currentMission.difficulty, 1)[0];
        setActions(prev => [...prev, newAction]);
      }
    })
    .catch(error => {
      console.error("Error processing mission action:", error);
      
      // Fallback to client-side logic if API fails
      // Update stats based on action
      if (action.affectedStat === 'stealth' || 
          action.affectedStat === 'intimidation' || 
          action.affectedStat === 'speed' || 
          action.affectedStat === 'luck') {
        
        setPlayerStats(prev => {
          const updatedStats = { ...prev };
          if (action.affectedStat === 'stealth') {
            updatedStats.stealth = Math.min(100, prev.stealth + action.bonus);
          } else if (action.affectedStat === 'intimidation') {
            updatedStats.intimidation = Math.min(100, prev.intimidation + action.bonus);
          } else if (action.affectedStat === 'speed') {
            updatedStats.speed = Math.min(100, prev.speed + action.bonus);
          } else if (action.affectedStat === 'luck') {
            updatedStats.luck = Math.min(100, prev.luck + action.bonus);
          }
          return updatedStats;
        });
      } else if (action.affectedStat === 'success') {
        // Direct success bonus increases all stats a little
        setPlayerStats(prev => ({
          stealth: Math.min(100, prev.stealth + Math.floor(action.bonus / 4)),
          intimidation: Math.min(100, prev.intimidation + Math.floor(action.bonus / 4)),
          speed: Math.min(100, prev.speed + Math.floor(action.bonus / 4)),
          luck: Math.min(100, prev.luck + Math.floor(action.bonus / 4))
        }));
      }
      
      // Update mission progress
      setMissionProgress(prev => Math.min(100, prev + 20));
      
      // Set narrative
      setCurrentMissionState(action.narrative);
      
      // Remove this action from available actions
      setActions(prev => prev.filter(a => a.name !== action.name));
      
      // Generate a new replacement action
      if (currentMission) {
        const newAction = generateMissionActions(currentMission.difficulty, 1)[0];
        setActions(prev => [...prev, newAction]);
      }
      
      toast({
        title: "Connection Issue",
        description: "Playing in offline mode. Some features may be limited.",
        variant: "destructive"
      });
    });
  };

  // Abort the current mission
  const abortMission = () => {
    if (!currentMission) return;
    
    // Call the server API to abort the mission
    fetch('/api/missions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: 1, // Default player for now
        missionId: currentMission.id,
        playerStats,
        attempt: false // Indicate we're aborting, not attempting completion
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to abort mission');
      }
      return response.json();
    })
    .then(data => {
      if (!data.success) {
        toast({
          title: "Failed to Abort Mission",
          description: data.message || "An error occurred aborting the mission",
          variant: "destructive"
        });
        return;
      }
      
      // Set penalty for aborting
      setMissionPenalties({
        crimeCoinLost: currentMission.cost - (data.crimeCoinRefunded || 0),
        funCoinGained: data.funCoinGained || 1,
        lessonLearned: data.message || "You aborted the mission and lost most of your investment. Sometimes it's better to walk away than get caught!"
      });
      
      // Apply the penalties through the game state
      failMission(
        currentMission.id, 
        currentMission.cost - (data.crimeCoinRefunded || 0), 
        data.funCoinGained || 1
      );
      
      // Close the mission modal and show the failure modal
      setIsMissionModalOpen(false);
      setFailureReason("You decided to abort the mission and cut your losses.");
      setIsFailureModalOpen(true);
    })
    .catch(error => {
      console.error("Error aborting mission:", error);
      
      // Fallback to client-side logic if API fails
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
      
      toast({
        title: "Connection Issue",
        description: "Playing in offline mode. Some features may be limited.",
        variant: "destructive"
      });
    });
  };

  // Continue with the mission (progress to outcome)
  const continueMission = () => {
    if (!currentMission) return;
    
    // If mission is not complete, increment progress
    if (missionProgress < 100) {
      // Each continuation adds 20% progress
      const newProgress = Math.min(100, missionProgress + 20);
      setMissionProgress(newProgress);
      
      // Generate dynamic narrative based on progress
      const narratives = [
        "You begin approaching the target location, scouting for any security...",
        "You're inside now, carefully navigating through potential obstacles...",
        "You're getting closer to the objective, but the risk is increasing...",
        "Almost there! Just need to finish the job and make your escape...",
        "Time to get out with the loot before anyone notices!"
      ];
      
      // Select narrative based on progress
      const narrativeIndex = Math.floor(newProgress / 20) - 1;
      if (narrativeIndex >= 0 && narrativeIndex < narratives.length) {
        setCurrentMissionState(narratives[narrativeIndex]);
      } else {
        setCurrentMissionState("You continue with the mission...");
      }
      
      // Add random events based on progress
      if (newProgress >= 60 && Math.random() < 0.3) {
        // 30% chance of random event at 60% or more progress
        const events = [
          { 
            message: "You spot a security guard ahead! Your stealth skills help you avoid detection.",
            statBoost: { stat: "stealth", value: 5 }
          },
          { 
            message: "You find an alternative route that saves time! Your speed improves.",
            statBoost: { stat: "speed", value: 5 }
          },
          { 
            message: "You encounter a bystander, but your intimidating presence keeps them quiet.",
            statBoost: { stat: "intimidation", value: 5 }
          },
          { 
            message: "You discover a hidden stash of extra loot! Your luck just improved.",
            statBoost: { stat: "luck", value: 5 }
          }
        ];
        
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setCurrentMissionState(randomEvent.message);
        
        // Apply stat boost
        setPlayerStats(prev => {
          const updatedStats = { ...prev };
          // Type-safe update of the specific stat
          if (randomEvent.statBoost.stat === 'stealth') {
            updatedStats.stealth = Math.min(100, prev.stealth + randomEvent.statBoost.value);
          } else if (randomEvent.statBoost.stat === 'intimidation') {
            updatedStats.intimidation = Math.min(100, prev.intimidation + randomEvent.statBoost.value);
          } else if (randomEvent.statBoost.stat === 'speed') {
            updatedStats.speed = Math.min(100, prev.speed + randomEvent.statBoost.value);
          } else if (randomEvent.statBoost.stat === 'luck') {
            updatedStats.luck = Math.min(100, prev.luck + randomEvent.statBoost.value);
          }
          return updatedStats;
        });
      }
      
      return;
    }
    
    // Mission is at 100% progress, time to attempt completion
    
    // Make API call to complete the mission
    fetch('/api/missions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: 1, // Default player for now
        missionId: currentMission.id,
        playerStats,
        attempt: true // We're attempting to complete the mission
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to complete mission');
      }
      return response.json();
    })
    .then(data => {
      if (!data.success) {
        toast({
          title: "Mission Error",
          description: data.message || "An error occurred completing the mission",
          variant: "destructive"
        });
        return;
      }
      
      // Close mission modal 
      setIsMissionModalOpen(false);
      
      if (data.missionSuccess) {
        // Mission succeeded
        // Set rewards from server response
        setMissionRewards({
          crimeCoin: data.crimeCoinReward || 0,
          funCoin: data.funCoinReward || 0,
          reputationGain: data.experienceGained ? Math.floor(data.experienceGained / 10) : 1,
          bonusItems: [] // Future expansion for item rewards
        });
        
        // Apply rewards to player state
        completeMission(
          currentMission.id, 
          data.crimeCoinReward || 0, 
          data.funCoinReward || 0,
          data.experienceGained || 10
        );
        
        // Show success modal
        setIsSuccessModalOpen(true);
      } else {
        // Mission failed
        // Set penalties from server response
        setMissionPenalties({
          crimeCoinLost: data.crimeCoinLost || 0,
          funCoinGained: data.funCoinGained || 0,
          lessonLearned: data.message || "Better luck next time!"
        });
        
        // Apply penalties to player state
        failMission(
          currentMission.id, 
          data.crimeCoinLost || 0, 
          data.funCoinGained || 0
        );
        
        // Set failure reason and show failure modal
        setFailureReason(data.failureReason || "Your mission failed unexpectedly.");
        setIsFailureModalOpen(true);
      }
    })
    .catch(error => {
      console.error("Error completing mission:", error);
      
      // Fallback to client-side logic if API fails
      // Calculate success chance based on player stats and difficulty
      const successChance = calculateSuccessChance(playerStats, currentMission.difficulty);
      
      // Add some drama with a random factor based on stats
      const luckFactor = playerStats.luck / 200; // Max 0.5 boost from luck
      const finalSuccessChance = Math.min(0.95, successChance + luckFactor); // Cap at 95%
      
      // Log the odds for dramatic effect
      console.log(`Mission success chance: ${(finalSuccessChance * 100).toFixed(1)}%`);
      
      // Determine outcome
      const roll = Math.random();
      const isSuccessful = roll < finalSuccessChance;
      
      if (isSuccessful) {
        // Mission succeeded
        // Calculate reward with bonus based on how well the player did
        const performanceBonus = Math.max(0, (finalSuccessChance - 0.5) * 2);
        const rewardMultiplier = 1 + (performanceBonus * 0.5);
        
        // Calculate base reward
        let baseReward = 100;
        if (currentMission.min_reward && currentMission.max_reward) {
          baseReward = currentMission.min_reward + 
            Math.floor(Math.random() * (currentMission.max_reward - currentMission.min_reward));
        } else if (currentMission.reward) {
          baseReward = parseInt(currentMission.reward.replace(/[^0-9]/g, '')) || 100;
        }
        
        const crimeCoinReward = Math.floor(baseReward * rewardMultiplier);
        const funCoinReward = Math.floor(Math.random() * 20) + 10;
        const experienceGained = Math.floor(baseReward / 10) + Math.floor(Math.random() * 10);
        
        const rewards = {
          crimeCoin: crimeCoinReward,
          funCoin: funCoinReward,
          reputationGain: Math.floor(experienceGained / 10)
        };
        
        setMissionRewards(rewards);
        
        // Apply rewards to player
        completeMission(
          currentMission.id, 
          crimeCoinReward, 
          funCoinReward,
          experienceGained
        );
        
        // Close mission modal and show success modal
        setIsMissionModalOpen(false);
        setIsSuccessModalOpen(true);
      } else {
        // Mission failed
        const failSeverity = Math.min(1, (1 - finalSuccessChance) * 2);
        const baseLoss = currentMission.cost;
        const difficultyMultiplier = currentMission.difficulty.toLowerCase() === "easy" ? 0.5 : 
                               currentMission.difficulty.toLowerCase() === "medium" ? 1 : 1.5;
        
        const extraLoss = Math.floor(baseLoss * failSeverity * difficultyMultiplier);
        const crimeCoinLost = baseLoss + extraLoss;
        const funCoinGained = Math.floor(failSeverity * 5) + 1;
        
        // Generate failure narrative based on stats
        const weakestStat = Object.entries(playerStats).reduce(
          (lowest, [stat, value]) => value < lowest.value ? {stat, value} : lowest, 
          {stat: "", value: 100}
        ).stat;
        
        const failureReasons = {
          stealth: [
            "You weren't stealthy enough! Security cameras caught you red-handed.",
            "Your noisy approach alerted the guards. Stealth fail!",
            "You stepped on a creaky floorboard at the worst possible moment!"
          ],
          intimidation: [
            "Your attempt to intimidate the security guard backfired completely.",
            "No one took your threats seriously, and they called your bluff.",
            "Your disguise was unconvincing and the staff immediately called security."
          ],
          speed: [
            "You were too slow! The police arrived before you could escape.",
            "Your getaway vehicle stalled and you couldn't outrun the cops.",
            "You tripped during your escape and got caught in an embarrassing faceplant."
          ],
          luck: [
            "Just bad luck! A random police patrol happened to drive by.",
            "What are the odds? The owner returned early from vacation.",
            "Murphy's Law in full effect - everything that could go wrong, did go wrong."
          ]
        };
        
        const lessonLearned = [
          "Next time, spend more time scouting the location first.",
          "You should invest in better equipment for jobs like these.",
          "Consider improving your " + weakestStat + " skills for future missions.",
          "Maybe bring a partner along next time for backup.",
          "Try a less risky job until you build up more experience.",
          "This wasn't your day. Sometimes it's better to walk away than force it."
        ];
        
        const failureReasonsForStat = failureReasons[weakestStat as keyof typeof failureReasons] || failureReasons.luck;
        const randomFailureReason = failureReasonsForStat[Math.floor(Math.random() * failureReasonsForStat.length)];
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
      
      toast({
        title: "Connection Issue",
        description: "Playing in offline mode. Some features may be limited.",
        variant: "destructive"
      });
    });
  };

  // Collect rewards and close success modal
  const collectRewards = () => {
    setIsSuccessModalOpen(false);
    
    toast({
      title: "Rewards Collected",
      description: `You've earned ${missionRewards.crimeCoin} $CRIME and ${missionRewards.funCoin} $FUN`,
      variant: "default"
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