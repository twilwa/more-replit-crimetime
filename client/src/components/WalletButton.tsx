import { useState } from "react";
import { motion } from "framer-motion";
import { useGameState } from "@/hooks/useGameState";
import { useToast } from "@/hooks/use-toast";

export default function WalletButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { isWalletConnected, connectWallet } = useGameState();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (isWalletConnected) return;
    
    setIsConnecting(true);
    
    try {
      await connectWallet();
      toast({
        title: "Wallet connected",
        description: "Your crypto wallet has been connected successfully!",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <motion.button
      id="connect-wallet"
      className={`px-4 py-2 rounded-lg font-pixel text-dark text-xs hover:opacity-90 transition-all ${
        isWalletConnected 
          ? "bg-success" 
          : "bg-gradient-to-r from-primary to-accent"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      disabled={isConnecting || isWalletConnected}
    >
      {isConnecting ? (
        <i className="fas fa-spinner fa-spin mr-2"></i>
      ) : (
        <i className={`fas ${isWalletConnected ? 'fa-check-circle' : 'fa-wallet'} mr-2`}></i>
      )}
      {isWalletConnected ? "Connected" : "Connect Wallet"}
    </motion.button>
  );
}
