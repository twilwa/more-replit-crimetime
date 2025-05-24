import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-primary mt-8 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div 
            className="text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="font-crime text-xl text-primary">CRIME TIME</div>
            <div className="text-xs text-gray-400">© {new Date().getFullYear()} Crime Syndicate Inc. All rights reserved.</div>
          </motion.div>
          
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.a 
              href="#" 
              className="text-primary hover:text-secondary transition-colors"
              whileHover={{ y: -3 }}
            >
              <i className="fab fa-discord text-xl"></i>
            </motion.a>
            <motion.a 
              href="#" 
              className="text-primary hover:text-secondary transition-colors"
              whileHover={{ y: -3 }}
            >
              <i className="fab fa-twitter text-xl"></i>
            </motion.a>
            <motion.a 
              href="#" 
              className="text-primary hover:text-secondary transition-colors"
              whileHover={{ y: -3 }}
            >
              <i className="fab fa-telegram text-xl"></i>
            </motion.a>
            <motion.a 
              href="#" 
              className="text-primary hover:text-secondary transition-colors"
              whileHover={{ y: -3 }}
            >
              <i className="fab fa-medium text-xl"></i>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
