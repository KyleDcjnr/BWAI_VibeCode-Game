import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Trophy, Play } from 'lucide-react';

// Game Constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 100; // Faster initial speed

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  isPlayingMusic: boolean;
}

export default function SnakeGame({ onScoreChange, isPlayingMusic }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true); // Start paused
  const [hasStarted, setHasStarted] = useState(false); // Track if game has ever started
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  // Refs for mutable state in event listeners/intervals
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<number | null>(null);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('neonSnakeHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Save High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('neonSnakeHighScore', score.toString());
    }
  }, [score, highScore]);

  // Initialize Game
  const initGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    onScoreChange(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
    setHasStarted(true);
  }, [onScoreChange]);

  // Generate random food position
  const generateFood = (currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOnSnake = true;
    
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Check if food is on snake
      // eslint-disable-next-line no-loop-func
      isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) return newFood;
    }
    return { x: 0, y: 0 }; // Should not reach here
  };

  // Handle Key Press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') directionRef.current = 'UP';
          if (!hasStarted) initGame();
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') directionRef.current = 'DOWN';
          if (!hasStarted) initGame();
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
          if (!hasStarted) initGame();
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
          if (!hasStarted) initGame();
          break;
        case ' ':
          if (!hasStarted) {
            initGame();
          } else {
            setIsPaused(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, hasStarted, initGame]);

  // Game Loop
  useEffect(() => {
    if (gameOver || isPaused || !hasStarted) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = directionRef.current;
        setDirection(currentDir); // Sync state for UI if needed

        switch (currentDir) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Check Wall Collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check Food Collision
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onScoreChange(newScore);
          setFood(generateFood(newSnake));
          // Increase speed slightly
          setSpeed(prev => Math.max(50, prev * 0.98));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = window.setInterval(moveSnake, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [food, gameOver, isPaused, hasStarted, score, speed, onScoreChange]);

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Optional, subtle)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
      // Calculate opacity/glow based on position (head is brightest)
      const isHead = index === 0;
      const opacity = Math.max(0.3, 1 - index / (snake.length + 5));
      
      ctx.shadowBlur = isHead ? 20 : 10 * opacity;
      ctx.shadowColor = '#39ff14';
      
      if (isHead) {
        ctx.fillStyle = '#ccffcc';
      } else {
        // Gradient trail effect
        ctx.fillStyle = `rgba(57, 255, 20, ${opacity})`;
      }
      
      // Draw rounded rects for snake segments
      const x = segment.x * CELL_SIZE + 1;
      const y = segment.y * CELL_SIZE + 1;
      const size = CELL_SIZE - 2;
      
      ctx.fillRect(x, y, size, size);
    });
    ctx.shadowBlur = 0;

  }, [snake, food, gameOver]);

  return (
    <div className="relative flex flex-col items-center justify-center p-1">
      <div className="mb-4 flex items-center justify-between w-full px-2 text-neon-green font-mono">
        <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#39ff14]" />
            <span 
              className="text-5xl font-digital font-bold text-[#39ff14] glitch" 
              data-text={score.toString().padStart(4, '0')}
              style={{ textShadow: '0 0 10px #39ff14' }}
            >
                {score.toString().padStart(4, '0')}
            </span>
        </div>
        <div className="text-sm text-gray-500 font-mono">
            HI: {highScore.toString().padStart(4, '0')}
        </div>
      </div>

      <div className="relative border-4 border-[#39ff14] p-1 bg-black shadow-[0_0_30px_rgba(57,255,20,0.2)]">
        {/* Corner Accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#39ff14]"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#39ff14]"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#39ff14]"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#39ff14]"></div>

        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="bg-black block opacity-90"
          style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 2px, 3px 100%'
          }}
        />
        
        {/* Start Screen Overlay */}
        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-20">
            <div className="w-20 h-20 mb-6 border-4 border-[#39ff14] flex items-center justify-center animate-pulse">
              <Play className="w-10 h-10 text-[#39ff14] ml-1" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2 font-digital glitch" data-text="READY?">READY?</h2>
            <p className="text-[#39ff14] font-mono text-sm animate-bounce tracking-widest">&gt; PRESS SPACE</p>
          </div>
        )}
        
        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-20">
            <h2 className="text-6xl font-bold text-[#ff00ff] mb-4 font-digital glitch" data-text="GAME OVER">GAME OVER</h2>
            <p className="text-white mb-8 font-mono text-xl">SCORE: {score}</p>
            <button
              onClick={initGame}
              className="group relative px-8 py-3 bg-transparent border-2 border-[#39ff14] text-[#39ff14] font-bold font-mono hover:bg-[#39ff14] hover:text-black transition-all overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-[#39ff14] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                SYSTEM_REBOOT
              </span>
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && hasStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
            <div className="text-4xl font-bold text-white font-digital tracking-widest border-4 border-white px-8 py-4 glitch" data-text="PAUSED">PAUSED</div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-[#39ff14] font-mono tracking-widest opacity-70">
        [ARROWS] MOVE • [SPACE] PAUSE
      </div>
    </div>
  );
}
