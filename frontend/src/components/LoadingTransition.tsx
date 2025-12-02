import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

const LoadingTransition = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-6">
          <motion.div 
            className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-500/20"
            animate={{
              rotate: [0, 360],
              borderColor: ['rgba(168, 85, 247, 0.2)', 'rgba(168, 85, 247, 0.5)', 'rgba(168, 85, 247, 0.2)']
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              borderColor: { duration: 2, repeat: Infinity }
            }}
          >
            <Cpu className="w-10 h-10 text-purple-400" />
          </motion.div>
          <motion.div 
            className="absolute inset-0 w-20 h-20 mx-auto bg-purple-600/20 rounded-2xl blur-xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-medium text-white mb-2">Initializing Neural Defense</h3>
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingTransition;
