import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Shield, Brain, Globe, Lock, Cpu, Activity, ChevronRight, Sparkles, ArrowRight, Zap as Lightning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      id: 'neural',
      icon: Brain,
      title: 'Neural Intelligence',
      description: 'AI-powered threat detection with deep learning algorithms',
      gradient: 'from-purple-600 to-pink-600',
      delay: 0.1
    },
    {
      id: 'realtime',
      icon: Activity,
      title: 'Real-time Analysis',
      description: 'Monitor threats as they happen with sub-millisecond response',
      gradient: 'from-blue-600 to-cyan-600',
      delay: 0.2
    },
    {
      id: 'global',
      icon: Globe,
      title: 'Global Protection',
      description: 'Worldwide threat intelligence from 150+ countries',
      gradient: 'from-purple-600 to-blue-600',
      delay: 0.3
    },
    {
      id: 'secure',
      icon: Lock,
      title: 'Zero-Trust Security',
      description: 'Military-grade encryption and authentication protocols',
      gradient: 'from-pink-600 to-purple-600',
      delay: 0.4
    }
  ];

  const stats = [
    { icon: Cpu, value: 'AI', label: 'Powered Detection', color: 'from-purple-500 to-purple-600' },
    { icon: Lightning, value: 'Real', label: 'Time Analysis', suffix: '-time', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, value: 'Neural', label: 'Network Defense', color: 'from-pink-500 to-pink-600' },
    { icon: Globe, value: 'Smart', label: 'Threat Intelligence', color: 'from-cyan-500 to-cyan-600' }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Interactive gradient that follows mouse */}
      <div 
        className="fixed inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.15), transparent 50%)`
        }}
      />

      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {/* Animated grid pattern */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
          <motion.div 
            className="absolute inset-0 opacity-[0.05]"
            animate={{
              backgroundPosition: ['0px 0px', '50px 50px']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundImage: `linear-gradient(45deg, transparent 48%, rgba(168, 85, 247, 0.1) 49%, rgba(168, 85, 247, 0.1) 51%, transparent 52%)`,
              backgroundSize: '20px 20px'
            }}
          />
        </div>
        
        {/* Multiple animated gradient orbs with different animations */}
        <motion.div 
          className="absolute top-20 left-20 w-[500px] h-[500px] rounded-full opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full filter blur-[128px]" />
        </motion.div>

        <motion.div 
          className="absolute bottom-20 right-20 w-[400px] h-[400px] rounded-full opacity-20"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full filter blur-[128px]" />
        </motion.div>
        
        {/* Floating particles with varied animations */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              backgroundColor: i % 2 === 0 ? 'rgba(168, 85, 247, 0.5)' : 'rgba(236, 72, 153, 0.5)'
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3 sm:gap-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20"
                animate={{
                  rotate: [0, 10, -10, 0],
                  borderColor: ['rgba(168, 85, 247, 0.2)', 'rgba(168, 85, 247, 0.4)', 'rgba(168, 85, 247, 0.2)']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </motion.div>
              <motion.div 
                className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 rounded-xl blur-xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-white">DeepSoul</span>
              <div className="text-[10px] sm:text-xs text-purple-400/60 uppercase tracking-widest">Neural Defense</div>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Analytics', 'Technology'].map((item, idx) => (
              <motion.a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="relative text-white/60 hover:text-white transition-colors text-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ y: -2 }}
              >
                <span className="relative z-10">{item}</span>
                <motion.div
                  className="absolute -bottom-1 left-0 h-px bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="relative px-6 py-2.5 overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <div className="relative bg-[#0a0a0f] m-[1px] px-6 py-2 rounded-lg group-hover:bg-transparent transition-colors duration-300">
                <span className="text-purple-300 group-hover:text-white transition-colors">Access Dashboard</span>
              </div>
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="md:hidden relative px-4 py-2 bg-purple-600/10 border border-purple-500/30 rounded-lg text-purple-300"
            whileTap={{ scale: 0.95 }}
          >
            Enter
          </motion.button>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div 
          className="max-w-7xl mx-auto"
          style={{
            opacity: heroOpacity,
            scale: heroScale
          }}
        >
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3, 
                type: "spring",
                stiffness: 200
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-md"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
                <div className="relative bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-full px-4 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span className="text-purple-300 text-sm">AI-Powered Threat Intelligence</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.span 
                className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Deep Learning
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Meets Cybersecurity
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-lg sm:text-xl text-white/60 mb-10 max-w-3xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Experience the future of threat detection with DeepSoul's neural defense system. 
              Protect your digital infrastructure with AI that learns, adapts, and evolves.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="relative px-8 py-4 w-full sm:w-auto group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-md"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-200%', '200%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <span className="relative z-10 px-8 py-4 flex items-center gap-2 text-white font-medium text-lg">
                    Enter Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </motion.button>

              <motion.button
                className="px-8 py-4 w-full sm:w-auto relative group overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 border border-purple-500/30 rounded-lg" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0"
                  animate={{
                    x: ['-200%', '200%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <span className="relative z-10 text-purple-300 font-medium">View Demo</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Enhanced Dashboard preview */}
          <motion.div 
            className="mt-12 sm:mt-20 relative px-4"
            initial={{ opacity: 0, y: 40, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative">
              <motion.div 
                className="relative rounded-xl overflow-hidden border border-purple-500/20 shadow-2xl"
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.25)'
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5" />
                <div className="relative p-4 sm:p-8 bg-[#0f0f14]/80 backdrop-blur-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    {[...Array(4)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="h-16 sm:h-20 rounded-lg relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
                        <div className="absolute inset-0 bg-purple-500/5 backdrop-blur-sm animate-pulse" />
                        <div className="absolute top-2 left-2 w-8 h-1 bg-purple-400/20 rounded" />
                        <div className="absolute bottom-2 right-2 text-purple-400/30 font-mono text-xs">
                          {['99.9%', '1.2M', '0.3ms', '150+'][i]}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div 
                    className="h-48 sm:h-64 rounded-lg relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                    <div className="absolute inset-0 bg-purple-500/5 backdrop-blur-sm" />
                    
                    {/* Animated chart lines */}
                    <svg className="absolute inset-0 w-full h-full">
                      <motion.path
                        d="M 0 120 Q 100 80 200 100 T 400 90"
                        stroke="rgba(168, 85, 247, 0.3)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1.5 }}
                      />
                      <motion.path
                        d="M 0 140 Q 150 100 300 120 T 400 110"
                        stroke="rgba(236, 72, 153, 0.3)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1.7 }}
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Floating badges */}
              <motion.div 
                className="absolute -top-4 -right-4 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs hidden sm:block"
                animate={{
                  y: [-2, 2, -2],
                  rotate: [-5, 5, -5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity
                }}
              >
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live
                </span>
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -left-4 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs hidden sm:block"
                animate={{
                  y: [2, -2, 2],
                  rotate: [5, -5, 5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 0.5
                }}
              >
                AI Enhanced
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold mb-4"
              whileInView={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Elite Features
              </span>
            </motion.h2>
            <p className="text-white/60">Powered by advanced neural networks and real-time intelligence</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="relative group"
                whileHover={{ y: -8 }}
              >
                <div className={cn(
                  "relative p-6 rounded-xl border backdrop-blur-sm transition-all duration-300",
                  "bg-[#0f0f14]/50 border-purple-500/10",
                  hoveredFeature === feature.id && "border-purple-500/30 bg-purple-500/5"
                )}>
                  <AnimatePresence>
                    {hoveredFeature === feature.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-10",
                          feature.gradient
                        )}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10">
                    <motion.div 
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 relative",
                        "bg-gradient-to-br",
                        feature.gradient,
                        "bg-opacity-20"
                      )}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="w-6 h-6 text-white relative z-10" />
                      <motion.div
                        className="absolute inset-0 rounded-lg blur-md"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                        style={{
                          background: `linear-gradient(to br, ${feature.gradient.includes('purple') ? '#a855f7' : '#3b82f6'}, ${feature.gradient.includes('pink') ? '#ec4899' : '#06b6d4'})`
                        }}
                      />
                    </motion.div>
                    <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.description}</p>
                    
                    {hoveredFeature === feature.id && (
                      <motion.div
                        className="absolute bottom-2 right-2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="w-4 h-4 text-purple-400" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Technology Section */}
      <section id="technology" className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Powered by Advanced Technology
              </span>
            </h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="relative group cursor-pointer"
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: idx * 0.1, 
                  type: "spring",
                  stiffness: 200 
                }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <motion.div 
                  className="relative p-6 sm:p-8 rounded-xl border border-purple-500/10 bg-[#0f0f14]/50 backdrop-blur-sm overflow-hidden"
                  whileHover={{
                    borderColor: 'rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 20px 40px -15px rgba(168, 85, 247, 0.3)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <motion.div 
                    className="absolute top-2 right-2"
                    animate={{
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <stat.icon className="w-6 h-6 text-purple-400/20" />
                  </motion.div>

                  <motion.div 
                    className="text-3xl sm:text-4xl font-bold mb-2"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", stat.color)}>
                      {stat.value}
                    </span>
                    <span className="text-purple-400 text-xl sm:text-2xl">{stat.suffix}</span>
                  </motion.div>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            whileInView={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Experience the Future of Threat Detection
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-lg sm:text-xl text-white/60 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            A hackathon project showcasing AI-powered cybersecurity intelligence
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="relative px-10 py-5 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-lg blur-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              />
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg overflow-hidden px-10 py-5">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-200%', '200%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <span className="relative z-10 flex items-center gap-2 text-white font-medium text-lg">
                  Explore the Dashboard
                  <motion.span
                    animate={{
                      x: [0, 5, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.span>
                </span>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Animated Footer */}
      <footer className="relative z-10 border-t border-purple-500/10 px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-white/40 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>© 2025 DeepSoul - A Hackathon Project</p>
          <motion.div 
            className="flex items-center gap-2"
            animate={{
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            <span className="text-purple-400/60">Built with</span>
            <span className="text-pink-400">❤️</span>
            <span className="text-purple-400/60">for innovation</span>
          </motion.div>
        </motion.div>
      </footer>
    </div>
  );
};

export default Landing;