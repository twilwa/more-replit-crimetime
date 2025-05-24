import { createContext, useReducer, useEffect, ReactNode } from "react";
import { GameState, Player, Mission, LeaderboardEntry } from "@/types/game";
import { apiRequest } from "@/lib/queryClient";
import { initialMissions, initialLeaderboard } from "@/lib/gameData";

// Initial state
const initialPlayer: Player = {
  id: 1,
  username: "Player",
  crimeCoin: 1337,
  funCoin: 42,
  reputation: "Rookie Thief",
  level: 3,
  experience: 350,
  nextLevelExperience: 1000,
  successfulMissions: 21,
  totalMissions: 29,
  totalEarnings: 4269,
  biggestHeist: 420,
  dailyMissions: 3,
  notoriety: 1,
  inventory: [
    {
      id: 1,
      name: "Ski Mask",
      description: "A basic ski mask to hide your identity. Crime 101 essential gear.",
      category: "Disguise",
      rarity: "common",
      icon: "fa-mask",
      effects: [
        {
          type: "boost",
          stat: "stealth",
          value: 5
        }
      ],
      equippable: true,
      equipped: false
    },
    {
      id: 2,
      name: "Lockpick Set",
      description: "Standard set of lockpicks. Gets the job done for most basic locks.",
      category: "Tools",
      rarity: "common",
      icon: "fa-key",
      effects: [
        {
          type: "boost",
          stat: "speed",
          value: 5
        }
      ],
      equippable: true,
      equipped: false
    },
    {
      id: 3,
      name: "Crypto Wallet",
      description: "Digital wallet for storing your ill-gotten gains. Has enhanced security features.",
      category: "Tech",
      rarity: "uncommon",
      icon: "fa-wallet",
      effects: [
        {
          type: "protection",
          stat: "luck",
          value: 10
        }
      ],
      equippable: true,
      equipped: false,
      isNFT: true,
      tokenId: "CRIM3-0x42069"
    }
  ]
};

const initialState: GameState = {
  player: initialPlayer,
  missions: initialMissions,
  leaderboard: initialLeaderboard,
  isWalletConnected: false
};

// Action types
type GameAction = 
  | { type: "SET_PLAYER"; payload: Player }
  | { type: "UPDATE_PLAYER"; payload: Partial<Player> }
  | { type: "SET_MISSIONS"; payload: Mission[] }
  | { type: "SET_LEADERBOARD"; payload: LeaderboardEntry[] }
  | { type: "CONNECT_WALLET"; payload: boolean }
  | { type: "COMPLETE_MISSION"; payload: { 
      missionId: number; 
      crimeCoin: number; 
      funCoin: number;
      experience: number;
    } 
  }
  | { type: "FAIL_MISSION"; payload: { 
      missionId: number; 
      crimeCoinLost: number; 
      funCoinGained: number;
    } 
  };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PLAYER":
      return { ...state, player: action.payload };
    case "UPDATE_PLAYER":
      return { 
        ...state, 
        player: { ...state.player, ...action.payload } 
      };
    case "SET_MISSIONS":
      return { ...state, missions: action.payload };
    case "SET_LEADERBOARD":
      return { ...state, leaderboard: action.payload };
    case "CONNECT_WALLET":
      return { ...state, isWalletConnected: action.payload };
    case "COMPLETE_MISSION":
      return {
        ...state,
        player: {
          ...state.player,
          crimeCoin: state.player.crimeCoin + action.payload.crimeCoin,
          funCoin: state.player.funCoin + action.payload.funCoin,
          experience: state.player.experience + action.payload.experience,
          successfulMissions: state.player.successfulMissions + 1,
          totalMissions: state.player.totalMissions + 1,
          totalEarnings: state.player.totalEarnings + action.payload.crimeCoin,
          biggestHeist: Math.max(state.player.biggestHeist, action.payload.crimeCoin),
          dailyMissions: state.player.dailyMissions + 1
        }
      };
    case "FAIL_MISSION":
      return {
        ...state,
        player: {
          ...state.player,
          crimeCoin: Math.max(0, state.player.crimeCoin - action.payload.crimeCoinLost),
          funCoin: state.player.funCoin + action.payload.funCoinGained,
          totalMissions: state.player.totalMissions + 1,
          dailyMissions: state.player.dailyMissions + 1
        }
      };
    default:
      return state;
  }
}

// Context
export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load game data from API on initial load
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const playerResponse = await apiRequest("GET", "/api/player", undefined);
        const playerData = await playerResponse.json();
        dispatch({ type: "SET_PLAYER", payload: playerData });

        const missionsResponse = await apiRequest("GET", "/api/missions", undefined);
        const missionsData = await missionsResponse.json();
        dispatch({ type: "SET_MISSIONS", payload: missionsData });

        const leaderboardResponse = await apiRequest("GET", "/api/leaderboard", undefined);
        const leaderboardData = await leaderboardResponse.json();
        dispatch({ type: "SET_LEADERBOARD", payload: leaderboardData });
      } catch (error) {
        console.error("Failed to load game data:", error);
        // If API fails, we'll use the initial state data
      }
    };

    fetchGameData();
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
