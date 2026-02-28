import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'motion/react';

// Dummy AI Generated Music Tracks
const TRACKS = [
  {
    id: 1,
    title: "Cybernetic Dreams",
    artist: "AI Composer Alpha",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12"
  },
  {
    id: 2,
    title: "Neon Pulse",
    artist: "Neural Network Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: "4:35"
  },
  {
    id: 3,
    title: "Digital Horizon",
    artist: "SynthMind v2.0",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "5:45"
  }
];

interface MusicPlayerProps {
  onPlayStateChange: (isPlaying: boolean) => void;
}

export default function MusicPlayer({ onPlayStateChange }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    } else {
      audioRef.current?.pause();
    }
    onPlayStateChange(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  // Handle track change
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.load();
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnded = () => {
    nextTrack();
  };

  return (
    <div className="w-full max-w-md bg-black border border-[#00ffff] p-6 shadow-[0_0_15px_rgba(0,255,255,0.1)] relative overflow-hidden">
      {/* Decorative Corner Lines */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00ffff]"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00ffff]"></div>
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnded}
      />

      {/* Track Info */}
      <div className="mb-8 flex items-start gap-6">
        <div className="w-20 h-20 bg-black border border-[#00ffff] flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.3)] relative group">
          <div className="absolute inset-0 bg-[#00ffff] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <Music className="text-[#00ffff] w-10 h-10 neon-icon" />
        </div>
        <div className="overflow-hidden flex-1">
          <div className="text-[10px] text-[#00ffff] font-mono tracking-widest mb-1">TRACK_{currentTrack.id.toString().padStart(2, '0')}</div>
          <h3 className="text-white font-bold text-2xl truncate font-digital tracking-wide glitch" data-text={currentTrack.title}>
            {currentTrack.title}
          </h3>
          <p className="text-gray-500 text-sm font-mono truncate mt-1">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 group cursor-pointer relative">
        <div className="h-2 w-full bg-[#1a1a1a] border border-[#39ff14]/30">
          <motion.div 
            className="h-full bg-[#39ff14] shadow-[0_0_10px_#39ff14]"
            style={{ width: `${progress}%` }}
            layoutId="progressBar"
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-[#39ff14] font-mono opacity-70">
            <span>00:00</span>
            <span>{currentTrack.duration}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Volume Control */}
        <div className="flex items-center gap-3 group relative">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-500 hover:text-[#00ffff] transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="w-24 h-1 bg-[#1a1a1a] relative">
            <div 
                className="absolute top-0 left-0 h-full bg-[#00ffff]" 
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            ></div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={prevTrack}
            className="text-[#00ffff] transition-all hover:scale-110 active:scale-95 neon-icon hover:text-white"
          >
            <SkipBack size={32} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-16 h-16 bg-black border-2 border-[#00ffff] text-[#00ffff] flex items-center justify-center hover:bg-[#00ffff] hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] active:scale-95 neon-icon group"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={nextTrack}
            className="text-[#00ffff] transition-all hover:scale-110 active:scale-95 neon-icon hover:text-white"
          >
            <SkipForward size={32} />
          </button>
        </div>
      </div>
      
      {/* Visualizer Placeholder */}
      <div className="mt-8 flex items-end justify-between gap-1 h-12 opacity-80 border-b border-[#ff00ff]/30 pb-1">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-[#ff00ff]"
            animate={{
              height: isPlaying ? [4, Math.random() * 40 + 4, 4] : 4,
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.02,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
}
