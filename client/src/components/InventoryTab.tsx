import { useState } from "react";
import { motion } from "framer-motion";
import { useGameState } from "@/hooks/useGameState";
import { InventoryItem } from "@/types/game";
import { useToast } from "@/hooks/use-toast";

export default function InventoryTab() {
  const gameState = useGameState();
  const { player } = gameState;
  const equip = gameState.equip;
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleEquipItem = () => {
    if (!selectedItem) return;
    
    equip(selectedItem);
    toast({
      title: "Item Equipped",
      description: `You equipped ${selectedItem.name}`,
      variant: "default"
    });
    setSelectedItem(null);
  };

  // Group items by category
  const itemsByCategory: Record<string, InventoryItem[]> = {};
  player.inventory.forEach(item => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });

  return (
    <div id="inventory-tab" className="bg-surface rounded-lg p-4 border border-primary neon-border mb-8">
      <div className="flex justify-between mb-4">
        <h2 className="font-crime text-2xl text-primary">Your Crime Gear</h2>
        <div className="text-xs text-accent">
          <span>Items: {player.inventory.length}</span>
        </div>
      </div>
      
      {player.inventory.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-primary/50 rounded-lg">
          <i className="fas fa-box-open text-4xl text-primary/40 mb-2"></i>
          <p className="text-gray-400">Your inventory is empty. Complete missions to earn items!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark rounded-lg p-4 border border-primary/40">
            <h3 className="font-pixel text-primary text-sm mb-4">INVENTORY</h3>
            
            {Object.entries(itemsByCategory).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h4 className="text-secondary text-xs uppercase mb-2">{category}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className={`p-2 bg-surface border rounded-lg cursor-pointer text-center ${
                        selectedItem?.id === item.id ? 'border-accent animate-pulse-neon' : 'border-gray-700'
                      } ${item.equipped ? 'ring-2 ring-accent' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="w-10 h-10 mx-auto flex items-center justify-center mb-1 relative">
                        <i className={`fas ${item.icon} text-lg ${
                          item.rarity === 'common' ? 'text-gray-400' :
                          item.rarity === 'uncommon' ? 'text-secondary' :
                          item.rarity === 'rare' ? 'text-accent' :
                          'text-primary'
                        }`}></i>
                        {item.equipped && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-dark" />
                        )}
                      </div>
                      <div className="text-xs line-clamp-1">{item.name}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-dark rounded-lg p-4 border border-primary/40">
            <h3 className="font-pixel text-primary text-sm mb-4">ITEM DETAILS</h3>
            
            {selectedItem ? (
              <div className="p-3 bg-surface rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg border border-gray-700 flex items-center justify-center ${
                    selectedItem.rarity === 'common' ? 'bg-gray-800' :
                    selectedItem.rarity === 'uncommon' ? 'bg-secondary/20' :
                    selectedItem.rarity === 'rare' ? 'bg-accent/20' :
                    'bg-primary/20'
                  }`}>
                    <i className={`fas ${selectedItem.icon} text-2xl ${
                      selectedItem.rarity === 'common' ? 'text-gray-400' :
                      selectedItem.rarity === 'uncommon' ? 'text-secondary' :
                      selectedItem.rarity === 'rare' ? 'text-accent' :
                      'text-primary'
                    }`}></i>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{selectedItem.name}</h4>
                    <div className="flex gap-2 text-xs">
                      <span className={
                        selectedItem.rarity === 'common' ? 'text-gray-400' :
                        selectedItem.rarity === 'uncommon' ? 'text-secondary' :
                        selectedItem.rarity === 'rare' ? 'text-accent' :
                        'text-primary'
                      }>
                        {selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1)}
                      </span>
                      <span className="text-gray-500">|</span>
                      <span className="text-gray-400">{selectedItem.category}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">
                  {selectedItem.description}
                </p>
                
                <div className="mb-3">
                  <h5 className="text-xs text-gray-400 mb-1">EFFECTS</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedItem.effects.map((effect, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <i className={`fas fa-${effect.type === 'boost' ? 'arrow-up' : 'shield'} text-xs ${
                          effect.stat === 'stealth' ? 'text-secondary' :
                          effect.stat === 'intimidation' ? 'text-primary' :
                          effect.stat === 'speed' ? 'text-accent' :
                          'text-warning'
                        }`}></i>
                        <span className="text-gray-300">
                          {effect.stat.charAt(0).toUpperCase() + effect.stat.slice(1)} +{effect.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <motion.button
                    className="flex-1 bg-accent py-2 rounded text-dark text-sm font-pixel"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    onClick={handleEquipItem}
                  >
                    EQUIP
                  </motion.button>
                  
                  {selectedItem.isNFT && (
                    <motion.button
                      className="flex-1 bg-primary py-2 rounded text-dark text-sm font-pixel"
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      MINT NFT
                    </motion.button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <i className="fas fa-hand-pointer mb-2 text-2xl"></i>
                <p>Select an item to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}