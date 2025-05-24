import { motion } from "framer-motion";

type GameTabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function GameTabs({ activeTab, setActiveTab }: GameTabsProps) {
  const tabs = [
    { id: "missions", label: "Missions", icon: "fa-crosshairs" },
    { id: "inventory", label: "Inventory", icon: "fa-briefcase" },
    { id: "gang", label: "Gang", icon: "fa-users" },
    { id: "heists", label: "Heists", icon: "fa-gem" },
    { id: "pvp", label: "PvP", icon: "fa-skull" }
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 border-b border-primary">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            className={`px-4 py-2 font-pixel text-sm rounded-t-lg ${
              activeTab === tab.id
                ? "bg-primary text-dark"
                : "bg-surface text-primary hover:bg-opacity-80"
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
