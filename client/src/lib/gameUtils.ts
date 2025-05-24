import { MissionAction, MissionRewards } from "@/types/game";

// Generate random mission actions for a given difficulty
export const generateMissionActions = (difficulty: string, count = 3): MissionAction[] => {
  const actions: MissionAction[] = [];
  
  // Action data with expanded options
  const actionTypes = [
    { 
      stat: 'stealth', 
      actions: [
        {
          name: 'Hide in shadows',
          description: 'Use the darkness to conceal your movements, decreasing detection chance.',
          risk: 10
        },
        {
          name: 'Move silently',
          description: 'Tread carefully to avoid making noise that could alert guards.',
          risk: 15
        },
        {
          name: 'Create a distraction',
          description: 'Set up a diversion to draw attention away from your objective.',
          risk: 25
        },
        {
          name: 'Disable cameras',
          description: 'Take out security systems to prevent surveillance recordings.',
          risk: 30
        },
        {
          name: 'Use crypto masking',
          description: 'Apply digital stealth techniques to hide your virtual footprint.',
          risk: 20
        }
      ] 
    },
    { 
      stat: 'intimidation', 
      actions: [
        {
          name: 'Threaten the target',
          description: 'Make it clear what will happen if they don\'t comply with your demands.',
          risk: 40
        },
        {
          name: 'Show your weapon',
          description: 'Reveal your piece to demonstrate you mean business.',
          risk: 35
        },
        {
          name: 'Demand compliance',
          description: 'Use authoritative tone to command respect and obedience.',
          risk: 25
        },
        {
          name: 'Assert dominance',
          description: 'Establish yourself as the alpha through body language and attitude.',
          risk: 30
        },
        {
          name: 'Dox threaten',
          description: 'Imply you have access to their personal blockchain information.',
          risk: 35
        }
      ] 
    },
    { 
      stat: 'speed', 
      actions: [
        {
          name: 'Move quickly',
          description: 'Rapid action minimizes exposure time and chance of being caught.',
          risk: 20
        },
        {
          name: 'Plan escape route',
          description: 'Map out the fastest way to get out once the job is done.',
          risk: 15
        },
        {
          name: 'Grab the loot fast',
          description: 'Prioritize speed over thoroughness when collecting valuables.',
          risk: 25
        },
        {
          name: 'Sprint to safety',
          description: 'Make a rapid dash to get clear of the danger zone.',
          risk: 30
        },
        {
          name: 'High-frequency trading',
          description: 'Execute transactions at lightning speed before security catches on.',
          risk: 35
        }
      ] 
    },
    { 
      stat: 'luck', 
      actions: [
        {
          name: 'Bribe a security guard',
          description: 'Money talks - pay someone on the inside to look the other way.',
          risk: 45
        },
        {
          name: 'Use inside information',
          description: 'Leverage intel from your network to gain an advantage.',
          risk: 25
        },
        {
          name: 'Wait for perfect timing',
          description: 'Patience is a virtue that can drastically improve success rates.',
          risk: 15
        },
        {
          name: 'Deploy special equipment',
          description: 'Use your specialized tools to make the job easier and cleaner.',
          risk: 30
        },
        {
          name: 'Flash loan attack',
          description: 'Temporarily borrow massive amounts of crypto for quick exploitation.',
          risk: 50
        }
      ] 
    }
  ];
  
  const narratives = [
    'You blend into the shadows, avoiding detection completely.',
    'You create a clever distraction, drawing all eyes away from your true objective.',
    'Your intimidating presence makes everyone comply without question.',
    'You move with lightning speed, in and out before anyone realizes what happened.',
    'Your careful planning pays off as you execute the perfect maneuver.',
    'You deploy your specialized tools, turning a difficult job into child\'s play.',
    'You find an unexpected opportunity and capitalize on it brilliantly.',
    'Your criminal instincts kick in, guiding you through what could have been a fatal error.',
    'Your digital ghost protocol conceals all traces of your virtual presence.',
    'The blockchain transaction confirms just as you complete the physical breach.',
    'You manipulate the security systems with well-timed exploits.',
    'You social engineer your way past what should have been impenetrable defenses.'
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
    const actionObj = type.actions[Math.floor(Math.random() * type.actions.length)];
    const bonus = Math.floor(Math.random() * (maxBonus - minBonus + 1)) + minBonus;
    const narrative = narratives[Math.floor(Math.random() * narratives.length)];
    
    // Add cooldown based on bonus - more powerful actions have longer cooldowns
    const cooldown = Math.ceil(bonus / 5);
    
    actions.push({
      name: actionObj.name,
      description: actionObj.description,
      affectedStat: type.stat,
      bonus,
      narrative,
      risk: actionObj.risk,
      cooldown
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
