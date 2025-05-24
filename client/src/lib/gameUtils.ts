import { MissionAction, MissionRewards } from "@/types/game";

// Generate random mission actions for a given difficulty
export const generateMissionActions = (difficulty: string, count = 3): MissionAction[] => {
  const actions: MissionAction[] = [];
  const actionTypes = [
    { stat: 'stealth', actions: ['Hide in shadows', 'Move silently', 'Create a distraction', 'Disable cameras'] },
    { stat: 'intimidation', actions: ['Threaten the target', 'Show your weapon', 'Demand compliance', 'Assert dominance'] },
    { stat: 'speed', actions: ['Move quickly', 'Plan escape route', 'Grab the loot fast', 'Sprint to safety'] },
    { stat: 'success', actions: ['Bribe a security guard', 'Use inside information', 'Wait for perfect timing', 'Deploy special equipment'] }
  ];
  
  const narratives = [
    'You blend into the shadows, avoiding detection.',
    'You create a clever distraction to divert attention.',
    'Your intimidating presence makes everyone comply immediately.',
    'You move with lightning speed, in and out before anyone notices.',
    'Your careful planning pays off as you execute the perfect maneuver.',
    'You deploy your specialized tools, making the job much easier.',
    'You find an unexpected opportunity and capitalize on it.',
    'Your criminal instincts kick in, guiding you through a tricky situation.'
  ];
  
  // Determine bonus range based on difficulty
  let minBonus = 5;
  let maxBonus = 15;
  
  if (difficulty.toLowerCase() === 'medium') {
    minBonus = 10;
    maxBonus = 20;
  } else if (difficulty.toLowerCase() === 'hard') {
    minBonus = 15;
    maxBonus = 25;
  }
  
  // Generate the requested number of actions
  for (let i = 0; i < count; i++) {
    const typeIndex = Math.floor(Math.random() * actionTypes.length);
    const type = actionTypes[typeIndex];
    const actionIndex = Math.floor(Math.random() * type.actions.length);
    const action = type.actions[actionIndex];
    const bonus = Math.floor(Math.random() * (maxBonus - minBonus + 1)) + minBonus;
    const narrative = narratives[Math.floor(Math.random() * narratives.length)];
    
    actions.push({
      name: action,
      affectedStat: type.stat,
      bonus,
      narrative
    });
  }
  
  return actions;
};

// Calculate success chance based on player stats and mission difficulty
export const calculateSuccessChance = (
  stats: { stealth: number; intimidation: number; speed: number; luck: number }, 
  difficulty: string
): number => {
  // Calculate base success chance from stats
  const statAverage = (stats.stealth + stats.intimidation + stats.speed + stats.luck) / 4;
  let baseChance = statAverage / 100; // 0-1 range
  
  // Adjust based on difficulty
  if (difficulty.toLowerCase() === 'easy') {
    baseChance = Math.min(0.95, baseChance + 0.2); // Max 95% chance
  } else if (difficulty.toLowerCase() === 'medium') {
    baseChance = Math.min(0.85, baseChance + 0.1); // Max 85% chance
  } else if (difficulty.toLowerCase() === 'hard') {
    baseChance = Math.min(0.75, baseChance); // Max 75% chance
  }
  
  return baseChance;
};

// Generate random rewards for a successful mission
export const generateRandomReward = (mission: any, baseReward: number): MissionRewards => {
  // Base reward is the already calculated potential reward
  const crimeCoin = baseReward;
  
  // Generate some fun coins too
  const funCoin = Math.floor(Math.random() * 5) + 1; // 1-5 fun coins
  
  // Reputation gain based on difficulty
  let repGain = 1; // Default for easy
  if (mission.difficulty.toLowerCase() === 'medium') {
    repGain = 2;
  } else if (mission.difficulty.toLowerCase() === 'hard') {
    repGain = 3;
  }
  
  // Chance to get bonus items (higher on harder difficulties)
  let bonusChance = 0.1; // 10% for easy
  if (mission.difficulty.toLowerCase() === 'medium') {
    bonusChance = 0.3;
  } else if (mission.difficulty.toLowerCase() === 'hard') {
    bonusChance = 0.5;
  }
  
  const bonusItems: { name: string; icon: string }[] = [];
  if (Math.random() < bonusChance) {
    const possibleItems = [
      { name: 'Ski Mask', icon: 'fa-mask' },
      { name: 'Lockpick Set', icon: 'fa-key' },
      { name: 'Hacking Device', icon: 'fa-laptop-code' },
      { name: 'Disguise Kit', icon: 'fa-user-secret' },
      { name: 'Smoke Bomb', icon: 'fa-bomb' }
    ];
    
    const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
    bonusItems.push(randomItem);
  }
  
  return {
    crimeCoin,
    funCoin,
    reputationGain: repGain,
    bonusItems
  };
};
