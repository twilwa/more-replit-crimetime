import { Mission, LeaderboardEntry } from "@/types/game";

// Initial missions
export const initialMissions: Mission[] = [
  {
    id: 1,
    name: "Street Tagger",
    description: "Tag a rival gang's territory with your crew's logo. Easy money, low risk.",
    difficulty: "Easy",
    cost: 1,
    reward: "2-5",
    successRate: "95%",
    timeRequired: "10 min",
    image: "https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 2,
    name: "Corner Store Heist",
    description: "Rob the local corner store. Classic risk, decent reward. Watch for security cameras!",
    difficulty: "Medium",
    cost: 10,
    reward: "20-40",
    successRate: "75%",
    timeRequired: "30 min",
    image: "https://images.unsplash.com/photo-1616469829167-0bd76a80c913?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 3,
    name: "Crypto Wallet Hack",
    description: "Hack into a forgotten crypto wallet. High-tech crime, high rewards, but risky.",
    difficulty: "Hard",
    cost: 50,
    reward: "100-300",
    successRate: "45%",
    timeRequired: "2 hours",
    image: "https://images.unsplash.com/photo-1633265486501-0cf524a07213?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 4,
    name: "NFT Counterfeit",
    description: "Create and sell counterfeit NFTs to unsuspecting collectors. A high-tech approach to art theft.",
    difficulty: "Medium",
    cost: 15,
    reward: "30-60",
    successRate: "65%",
    timeRequired: "45 min",
    image: "https://images.unsplash.com/photo-1645378999496-33c8c2afe38d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 5,
    name: "Rug Pull Reversal",
    description: "Infiltrate a rug pull dev's wallet and return funds to scammed victims. Chaotic good crime.",
    difficulty: "Hard",
    cost: 75,
    reward: "150-400",
    successRate: "40%",
    timeRequired: "3 hours",
    image: "https://images.unsplash.com/photo-1614854262318-831574f15f1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 6,
    name: "Meme Coin Pump",
    description: "Create artificial hype for a worthless meme coin and cash out before the dump. Classic crypto scheme.",
    difficulty: "Medium",
    cost: 25,
    reward: "50-100",
    successRate: "70%",
    timeRequired: "1 hour",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  }
];

// Initial leaderboard
export const initialLeaderboard: LeaderboardEntry[] = [
  {
    id: 101,
    username: "CryptoThief420",
    crimeEarned: 42069,
    biggestHeist: 15000,
    notoriety: 5,
    rank: 1
  },
  {
    id: 102,
    username: "RugPuller9000",
    crimeEarned: 31337,
    biggestHeist: 12000,
    notoriety: 4,
    rank: 2
  },
  {
    id: 103,
    username: "DeFiVillain",
    crimeEarned: 28456,
    biggestHeist: 9800,
    notoriety: 3,
    rank: 3
  }
];
