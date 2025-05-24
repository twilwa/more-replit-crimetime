import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { motion } from "framer-motion";

type TimeRange = "day" | "week" | "allTime";

export default function Leaderboard() {
  const { player, leaderboard } = useGameState();
  const [timeRange, setTimeRange] = useState<TimeRange>("day");

  // Get the filtered leaderboard based on time range
  const getFilteredLeaderboard = () => {
    // In a real implementation, we would filter based on the time range
    // For now, we'll just return the full leaderboard
    return leaderboard;
  };

  // Find the current player's rank
  const findPlayerRank = () => {
    const index = leaderboard.findIndex(entry => entry.id === player.id);
    return index !== -1 ? index + 1 : leaderboard.length + 1;
  };

  const renderStars = (notoriety: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`fas fa-star ${i < notoriety ? 'text-accent' : 'text-gray-600'}`}
        ></i>
      );
    }
    return stars;
  };

  return (
    <motion.div 
      className="bg-surface rounded-lg p-4 border border-primary neon-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-crime text-2xl text-primary">Criminal Leaderboard</h2>
        <div className="flex gap-2">
          <motion.button 
            className={`px-3 py-1 rounded text-sm ${timeRange === 'day' ? 'bg-dark text-primary border border-primary' : 'bg-dark text-primary'}`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => setTimeRange('day')}
          >
            Today
          </motion.button>
          <motion.button 
            className={`px-3 py-1 rounded text-sm ${timeRange === 'week' ? 'bg-dark text-primary border border-primary' : 'bg-dark text-primary'}`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => setTimeRange('week')}
          >
            Week
          </motion.button>
          <motion.button 
            className={`px-3 py-1 rounded text-sm ${timeRange === 'allTime' ? 'bg-dark text-primary border border-primary' : 'bg-dark text-primary'}`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => setTimeRange('allTime')}
          >
            All Time
          </motion.button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-primary">
            <tr className="text-primary font-pixel">
              <th className="p-2 text-left">Rank</th>
              <th className="p-2 text-left">Criminal</th>
              <th className="p-2 text-right">$CRIME Earned</th>
              <th className="p-2 text-right">Biggest Heist</th>
              <th className="p-2 text-right">Notoriety</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredLeaderboard().map((entry, index) => (
              <motion.tr 
                key={entry.id}
                className="border-b border-dark hover:bg-dark transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className={`p-2 font-pixel ${
                  index === 0 ? 'text-accent' : 
                  index === 1 ? 'text-secondary' : 
                  index === 2 ? 'text-primary' : ''
                }`}>{index + 1}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-primary' : 
                      index === 1 ? 'bg-secondary' : 
                      'bg-accent'
                    } flex items-center justify-center`}>
                      <i className="fas fa-user text-dark"></i>
                    </div>
                    <span>{entry.username}</span>
                  </div>
                </td>
                <td className="p-2 text-right text-accent">{entry.crimeEarned.toLocaleString()} $CRIME</td>
                <td className="p-2 text-right text-secondary">{entry.biggestHeist.toLocaleString()} $CRIME</td>
                <td className="p-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {renderStars(entry.notoriety)}
                  </div>
                </td>
              </motion.tr>
            ))}
            
            {/* Current player row highlighted */}
            <motion.tr 
              className="bg-primary bg-opacity-20 border-b border-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <td className="p-2 font-pixel text-primary">{findPlayerRank()}</td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                    <i className="fas fa-user text-dark"></i>
                  </div>
                  <span className="font-bold">YOU</span>
                </div>
              </td>
              <td className="p-2 text-right text-accent">{player.totalEarnings.toLocaleString()} $CRIME</td>
              <td className="p-2 text-right text-secondary">{player.biggestHeist.toLocaleString()} $CRIME</td>
              <td className="p-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  {renderStars(player.notoriety)}
                </div>
              </td>
            </motion.tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
