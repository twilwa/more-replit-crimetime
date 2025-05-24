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

    // Check if player has enough crime coins
    if (player.crimeCoin < mission.cost) {
      toast({
        title: "Not enough $CRIME",
        description: "You don't have enough $CRIME to start this mission!",
        variant: "destructive"
      });
      return;
    }

    // Open the mission modal FIRST to make sure it's visible
    setIsMissionModalOpen(true);
    
    // Then set all the mission state
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
    const baseReward = parseInt(mission.reward.replace(/[^0-9]/g, '')) || 100;
    setPotentialReward(baseReward);
    
    console.log("Mission modal should be open now, isMissionModalOpen:", true);
    
    // Just to be extra sure
    setTimeout(() => {
      setIsMissionModalOpen(true);
      console.log("Mission modal state after timeout:", true);
    }, 100);
  };

  // Take an action during a mission
  const takeAction = (action: MissionAction) => {
    // Type-safe stat update based on affected stat
    if (action.affectedStat === 'stealth' || 
        action.affectedStat === 'intimidation' || 
        action.affectedStat === 'speed' || 
        action.affectedStat === 'luck') {
      
      // Type-safe stat update
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
    
    // Risk calculation - higher risk actions can have consequences
    if (action.risk && Math.random() * 100 < action.risk) {
      // Action has some negative consequence based on the risk
      const statPenalty = Math.ceil(action.risk / 10); // 1-5% penalty based on risk level
      
      // Choose a random stat to penalize
      const stats = ['stealth', 'intimidation', 'speed', 'luck'];
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      
      // Apply the penalty
      setPlayerStats(prev => {
        const updatedStats = { ...prev };
        if (randomStat === 'stealth') {
          updatedStats.stealth = Math.max(0, prev.stealth - statPenalty);
        } else if (randomStat === 'intimidation') {
          updatedStats.intimidation = Math.max(0, prev.intimidation - statPenalty);
        } else if (randomStat === 'speed') {
          updatedStats.speed = Math.max(0, prev.speed - statPenalty);
        } else if (randomStat === 'luck') {
          updatedStats.luck = Math.max(0, prev.luck - statPenalty);
        }
        return updatedStats;
      });
      
      // Update narrative to reflect the complication
      const complications = [
        "Something goes wrong. You take a minor setback.",
        `Your ${randomStat} is tested and you struggle a bit.`,
        "The situation gets more complicated than you expected.",
        "You encounter unexpected resistance."
      ];
      
      const complication = complications[Math.floor(Math.random() * complications.length)];
      setCurrentMissionState(`${action.narrative} ${complication}`);
    } else {
      // Normal positive outcome
      setCurrentMissionState(action.narrative);
    }

    // Update mission progress
    setMissionProgress(prev => Math.min(100, prev + 20));
    
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
    
    // Mission is complete, calculate success chance based on player stats and difficulty
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
      const performanceBonus = Math.max(0, (finalSuccessChance - 0.5) * 2); // 0-1 scale based on how much over 50% they were
      const rewardMultiplier = 1 + (performanceBonus * 0.5); // 1x to 1.5x multiplier
      
      const baseRewards = generateRandomReward(currentMission, potentialReward);
      const boostedRewards = {
        ...baseRewards,
        crimeCoin: Math.floor(baseRewards.crimeCoin * rewardMultiplier),
        reputationGain: baseRewards.reputationGain + (performanceBonus > 0.5 ? 1 : 0)
      };
      
      setMissionRewards(boostedRewards);
      
      // Record mission success in database
      fetch('/api/mission-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: 1, // Default player ID
          missionId: currentMission.id,
          success: true,
          crimeCoinChange: boostedRewards.crimeCoin,
          funCoinChange: boostedRewards.funCoin,
          experienceGained: boostedRewards.reputationGain * 10 // Convert rep to experience
        })
      }).catch(error => {
        console.error("Failed to record mission history:", error);
        // Continue with gameplay even if database update fails
      });
      
      // Apply rewards to player
      completeMission(
        currentMission.id, 
        boostedRewards.crimeCoin, 
        boostedRewards.funCoin,
        boostedRewards.reputationGain * 10 // Convert rep to experience
      );
      
      // Close mission modal and show success modal
      setIsMissionModalOpen(false);
      setIsSuccessModalOpen(true);
    } else {
      // Mission failed - calculate severity of failure based on how close they were
      const failSeverity = Math.min(1, (1 - finalSuccessChance) * 2); // 0-1 scale of how bad the failure is
      
      // Base loss is the mission cost
      const baseLoss = currentMission.cost;
      // Extra loss scales with difficulty and failure severity
      const difficultyMultiplier = currentMission.difficulty.toLowerCase() === "easy" ? 0.5 : 
                                 currentMission.difficulty.toLowerCase() === "medium" ? 1 : 1.5;
      
      const extraLoss = Math.floor(baseLoss * failSeverity * difficultyMultiplier);
      const crimeCoinLost = baseLoss + extraLoss;
      
      // More fun coins for spectacular failures
      const funCoinGained = Math.floor(failSeverity * 5) + 1; // 1-6 fun coins depending on how badly they failed
      
      // Generate failure narrative based on stats
      const weakestStat = Object.entries(playerStats).reduce(
        (lowest, [stat, value]) => value < lowest.value ? {stat, value} : lowest, 
        {stat: "", value: 100}
      ).stat;
      
      // Generate narrative based on weakest stat
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
      
      // Pick random failure reason based on weakest stat
      const failureReasonsForStat = failureReasons[weakestStat as keyof typeof failureReasons] || failureReasons.luck;
      const randomFailureReason = failureReasonsForStat[Math.floor(Math.random() * failureReasonsForStat.length)];
      const randomLesson = lessonLearned[Math.floor(Math.random() * lessonLearned.length)];
      
      setMissionPenalties({
        crimeCoinLost,
        funCoinGained,
        lessonLearned: randomLesson
      });
      
      // Record mission failure in database
      fetch('/api/mission-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: 1, // Default player ID
          missionId: currentMission.id,
          success: false,
          crimeCoinChange: -crimeCoinLost, // Negative value for loss
          funCoinChange: funCoinGained,
          experienceGained: 5 // Small experience gain even on failure
        })
      }).catch(error => {
        console.error("Failed to record mission history:", error);
        // Continue with gameplay even if database update fails
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
