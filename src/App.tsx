import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { motion } from 'motion/react';

export default function App() {
  const [score, setScore] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-[#ff00ff] selection:text-white">
      
      {/* CRT Effects */}
      <div className="scanlines"></div>
      <div className="noise"></div>
      
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
             backgroundSize: '20px 20px'
           }}
      />
      
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#39ff14] opacity-10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#ff00ff] opacity-10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Game */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center relative"
        >
          <div className="mb-12 text-center relative w-full">
            <h1 
              className="text-7xl md:text-8xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#39ff14] via-[#00ffff] to-[#ff00ff] glitch"
              data-text="NEON SNAKE"
              style={{ fontFamily: 'var(--font-digital)' }}
            >
              NEON SNAKE
            </h1>
            <div className="flex justify-center gap-4 text-[#00ffff] font-mono text-xs tracking-[0.3em] uppercase opacity-70">
              <span>Sys.Ver.2.0.4</span>
              <span>//</span>
              <span>Connected</span>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#39ff14] to-[#00ffff] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <SnakeGame onScoreChange={setScore} isPlayingMusic={isPlayingMusic} />
          </div>
        </motion.div>

        {/* Right Column: Music & Info */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-12"
        >
          <div className="text-center lg:text-left w-full max-w-md relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#ff00ff] opacity-50 screen-tear"></div>
            <h2 className="text-3xl font-bold text-white mb-2 font-digital tracking-widest flex items-center gap-3">
              <span className="w-3 h-3 bg-[#ff00ff] animate-pulse"></span>
              AUDIO_STREAM_V1
            </h2>
            <p className="text-gray-500 text-sm font-mono border-l-2 border-[#39ff14]/30 pl-4 ml-1">
              Initializing neural network audio synthesis...
              <br/>
              <span className="text-[#39ff14]">&gt; Stream active</span>
            </p>
          </div>

          <MusicPlayer onPlayStateChange={setIsPlayingMusic} />

          {/* Decorative Elements */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
            <div className="bg-black border border-[#ff00ff]/30 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1">
                <div className="w-2 h-2 bg-[#ff00ff] rounded-full animate-ping"></div>
              </div>
              <div className="text-[10px] text-[#ff00ff] font-mono uppercase mb-1 tracking-widest">High Score</div>
              <div className="text-4xl font-digital text-white glitch" data-text={Math.max(score, 0)}>
                {Math.max(score, 0)}
              </div>
            </div>
            <div className="bg-black border border-[#39ff14]/30 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1">
                <div className={`w-2 h-2 rounded-full ${isPlayingMusic ? 'bg-[#39ff14] animate-pulse' : 'bg-gray-500'}`}></div>
              </div>
              <div className="text-[10px] text-[#39ff14] font-mono uppercase mb-1 tracking-widest">System Status</div>
              <div className="text-xl font-mono text-white">
                {isPlayingMusic ? 'ONLINE' : 'STANDBY'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 w-full flex justify-between px-8 text-[#00ffff]/40 text-[10px] font-mono z-10 uppercase tracking-widest">
        <span>ID: 8473-X9</span>
        <span>REACT_CORE // TAILWIND_SHELL</span>
      </div>
    </div>
  );
}
