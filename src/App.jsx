import React, { useState, useEffect, useRef } from 'react';

// Simple Pentatonic Synth for pleasant sounds
const playSound = (index) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Pentatonic scale (C major pentatonic: C, D, E, G, A)
    const scale = [
      261.63, 293.66, 329.63, 392.00, 440.00, 
      523.25, 587.33, 659.25, 783.99, 880.00
    ];
    
    const note = scale[index % scale.length];
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, ctx.currentTime);
    
    // Envelope for a "pop" sound
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Silent fail for audio contexts that aren't ready
  }
};

const BalloonGame = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const requestRef = useRef();
  
  // Game state stored in refs
  const gameState = useRef({
    balloons: [],
    particles: [],
    clouds: [],
    lastBalloonTime: 0,
    width: 0,
    height: 0,
    ctx: null
  });

  const colors = [
    { fill: '#FF6B6B', string: '#CC5555' }, // Red
    { fill: '#4ECDC4', string: '#3D9992' }, // Teal
    { fill: '#FFE66D', string: '#CCB655' }, // Yellow
    { fill: '#FF9F43', string: '#CC7F35' }, // Orange
    { fill: '#6C5CE7', string: '#5549B5' }, // Purple
    { fill: '#A8E6CF', string: '#86B8A5' }, // Mint
  ];

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Force canvas to match window visual viewport to handle mobile bars correctly
    const width = window.innerWidth;
    const height = window.innerHeight;

    gameState.current.width = width;
    gameState.current.height = height;
    
    // Handle retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // CSS size must match
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    gameState.current.ctx = canvas.getContext('2d');
    gameState.current.ctx.scale(dpr, dpr);
    
    // Reset clouds if empty
    if (gameState.current.clouds.length === 0) {
      gameState.current.clouds = [];
      for(let i=0; i<5; i++) {
          gameState.current.clouds.push(createCloud(true));
      }
    }
  };

  const createCloud = (randomY = false) => {
    const w = gameState.current.width;
    const h = gameState.current.height;
    return {
        x: Math.random() * w,
        y: randomY ? Math.random() * (h/2) : Math.random() * (h/3),
        speed: 0.2 + Math.random() * 0.3,
        size: 0.5 + Math.random() * 0.5,
        opacity: 0.4 + Math.random() * 0.4
    };
  };

  const createBalloon = () => {
    const w = gameState.current.width;
    const h = gameState.current.height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    // EXTRA LARGE balloons for mobile touch targets (55-95px radius)
    const size = 55 + Math.random() * 40; 
    
    return {
      x: Math.random() * (w - size*2) + size,
      y: h + size + 50,
      radius: size,
      speed: 1.5 + Math.random() * 2,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      color: color,
      id: Date.now() + Math.random()
    };
  };

  const createParticles = (x, y, color) => {
    for (let i = 0; i < 12; i++) { // More particles!
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 3 + Math.random() * 4;
      gameState.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: color.fill,
        size: 8 + Math.random() * 6
      });
    }
  };

  const update = (time) => {
    if (!isPlaying) return;
    
    const state = gameState.current;
    const ctx = state.ctx;
    const w = state.width;
    const h = state.height;

    // Clear screen
    ctx.clearRect(0, 0, w, h);

    // Draw Sky Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Draw Clouds
    ctx.fillStyle = '#FFFFFF';
    state.clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if(cloud.x > w + 100) {
            cloud.x = -100;
            cloud.y = Math.random() * (h/3);
        }

        ctx.globalAlpha = cloud.opacity;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 30 * cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + 25 * cloud.size, cloud.y - 10 * cloud.size, 35 * cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + 50 * cloud.size, cloud.y, 30 * cloud.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    // Spawn Balloons (Faster spawn rate for more fun)
    if (time - state.lastBalloonTime > 800) { 
      state.balloons.push(createBalloon());
      state.lastBalloonTime = time;
    }

    // Update and Draw Balloons
    for (let i = state.balloons.length - 1; i >= 0; i--) {
      const b = state.balloons[i];
      b.y -= b.speed;
      const wobble = Math.sin(time * 0.003 + b.wobbleOffset) * 1;
      
      if (b.y < -150) {
        state.balloons.splice(i, 1);
        continue;
      }

      // Draw String
      ctx.beginPath();
      ctx.moveTo(b.x + wobble, b.y + b.radius);
      ctx.quadraticCurveTo(
        b.x + wobble + Math.sin(time * 0.01) * 10, 
        b.y + b.radius + 30, 
        b.x + wobble, 
        b.y + b.radius + 60
      );
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Balloon
      ctx.beginPath();
      ctx.ellipse(b.x + wobble, b.y, b.radius, b.radius * 1.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = b.color.fill;
      ctx.fill();
      
      // Shine
      ctx.beginPath();
      ctx.ellipse(b.x + wobble - b.radius*0.3, b.y - b.radius*0.3, b.radius*0.1, b.radius*0.2, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();
      
      // Knot
      ctx.beginPath();
      ctx.fillStyle = b.color.fill;
      ctx.moveTo(b.x + wobble - 8, b.y + b.radius * 1.1);
      ctx.lineTo(b.x + wobble + 8, b.y + b.radius * 1.1);
      ctx.lineTo(b.x + wobble, b.y + b.radius * 1.1 + 12);
      ctx.fill();
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Stronger gravity
      p.life -= 0.02;

      if (p.life <= 0) {
        state.particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    requestRef.current = requestAnimationFrame((t) => update(t));
  };

  const handleInteraction = (clientX, clientY) => {
    if (!isPlaying) return;

    const state = gameState.current;
    
    // Canvas is now fixed to window, so clientX/Y are accurate directly
    // but we double check offset just in case
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check collision with balloons
    // Iterate backwards to pop top balloons first
    for (let i = state.balloons.length - 1; i >= 0; i--) {
      const b = state.balloons[i];
      const dx = x - b.x; 
      const dy = y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // VERY Generous hit area for toddlers (radius + 40px padding)
      // They can miss by a lot and still pop it
      if (distance < b.radius + 40) {
        createParticles(b.x, b.y, b.color);
        playSound(i);
        state.balloons.splice(i, 1);
        setScore(prev => prev + 1);
        // Don't break; allow one tap to pop overlapping balloons (very satisfying)
      }
    }
  };

  const handleTouch = (e) => {
    // Critical: Prevent browser scrolling/bouncing
    if (e.cancelable) e.preventDefault(); 
    
    // Multi-touch support: Loop through all changed touches
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        handleInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleClick = (e) => {
    handleInteraction(e.clientX, e.clientY);
  };

  // Prevent elastic scrolling on iOS
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e) => {
        if (e.cancelable) e.preventDefault();
    };

    // Non-passive listener to forcefully stop scrolling
    container.addEventListener('touchmove', preventScroll, { passive: false });
    
    // Handle Resize
    window.addEventListener('resize', initGame);
    initGame();
    
    if (isPlaying) {
      requestRef.current = requestAnimationFrame((t) => update(t));
    }
    
    return () => {
      container.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('resize', initGame);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-blue-200 font-sans select-none"
      style={{ touchAction: 'none' }} 
    >
      
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-pointer touch-none"
        onTouchStart={handleTouch}
        onClick={handleClick}
        title="Balloon Pop Game Area"
      />

      {/* SEO & Accessibility Hidden Content */}
      <div className="sr-only">
        <h1>Balloon Pop Party - Free Online Sensory Game for Toddlers</h1>
        <p>A safe, ad-free interactive game for 3-4 year old kids. Tap balloons to pop them and improve fine motor skills.</p>
      </div>

      {/* Score UI - Safe Area Aware */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {isPlaying && (
          <div className="bg-white/80 backdrop-blur rounded-full px-8 py-4 shadow-xl border-4 border-yellow-400">
             <span className="text-5xl font-black text-yellow-500 tracking-wider">
               {score}
             </span>
          </div>
        )}
      </div>

      {/* Watermark - Fixed to bottom right */}
      <div className="absolute bottom-3 right-4 pointer-events-none opacity-60 z-40 bg-white/30 rounded-full px-3 py-1 backdrop-blur-sm" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <p className="text-xs font-bold text-slate-700 tracking-wide drop-shadow-sm">
          Developed by Vivek Narkhede
        </p>
      </div>

      {/* Start/Pause Menu */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-sm w-full shadow-2xl text-center border-b-8 border-blue-500 animate-bounce-slow">
            <h1 className="text-6xl font-black text-blue-500 mb-2 drop-shadow-md">
              POP!
            </h1>
            <h2 className="text-2xl text-gray-700 font-bold mb-2">Balloon Party</h2>
            <p className="text-gray-500 text-lg mb-8 font-medium">
              Tap the balloons!
            </p>
            
            <button
              onClick={() => {
                // Attempt Full Screen on Play
                const elem = document.documentElement;
                const requestFS = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
                
                if (requestFS) {
                  try {
                    requestFS.call(elem).catch(() => {
                        // Pass silently if user agent or preference blocks this
                    });
                  } catch(e) {}
                }

                setIsPlaying(true);
                try {
                  const AudioContext = window.AudioContext || window.webkitAudioContext;
                  new AudioContext().resume();
                } catch(e) {}
              }}
              className="w-full bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-yellow-900 text-4xl font-black py-6 px-8 rounded-2xl shadow-lg transform transition active:scale-95 border-b-8 border-yellow-600"
              aria-label="Start Game"
            >
              PLAY ▶
            </button>
          </div>
        </div>
      )}

      {/* Pause Button - Big hit target */}
      {isPlaying && (
        <button
          onClick={() => setIsPlaying(false)}
          className="absolute top-4 right-4 bg-white/60 p-4 rounded-full shadow-lg active:bg-white active:scale-90 transition z-50"
          style={{ marginTop: 'env(safe-area-inset-top)' }}
          aria-label="Pause Game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
      )}
    </div>
  );
};

export default BalloonGame;
