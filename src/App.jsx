import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, RefreshCw, Trophy, ArrowLeft, Star, Grid3X3, Shapes, Brain, Maximize } from 'lucide-react';

// --- Shared Components ---

const Button = ({ onClick, children, className = "", variant = "primary" }) => {
  const baseStyle = "px-4 py-2 md:px-6 md:py-3 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 select-none";
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white border-b-4 border-blue-700 active:border-b-0 active:translate-y-1",
    secondary: "bg-purple-500 hover:bg-purple-600 text-white border-b-4 border-purple-700 active:border-b-0 active:translate-y-1",
    success: "bg-green-500 hover:bg-green-600 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1",
    danger: "bg-red-500 hover:bg-red-600 text-white border-b-4 border-red-700 active:border-b-0 active:translate-y-1",
    outline: "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 active:border-b-0 active:translate-y-1"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Confetti = ({ active }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDuration: `${Math.random() * 2 + 1}s`,
            animationDelay: `${Math.random()}s`,
            fontSize: '24px'
          }}
        >
          {['🎉', '⭐', '🎈', '✨'][Math.floor(Math.random() * 4)]}
        </div>
      ))}
    </div>
  );
};

// --- Game 1: Jigsaw Puzzle ---

const JigsawGame = ({ onBack }) => {
  const [pieces, setPieces] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [complete, setComplete] = useState(false);
  const [fullImage, setFullImage] = useState(null);
  const gridSize = 3; // 3x3 grid

  // Generate the puzzle image
  const generatePuzzle = () => {
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw a simple scene (Farm)
    // Sky
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, size, size);
    // Sun
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(250, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    // Grass
    ctx.fillStyle = "#90EE90";
    ctx.fillRect(0, 200, size, 100);
    // House
    ctx.fillStyle = "#FF6B6B";
    ctx.fillRect(50, 150, 100, 100);
    // Roof
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.moveTo(40, 150);
    ctx.lineTo(100, 90);
    ctx.lineTo(160, 150);
    ctx.fill();
    // Door
    ctx.fillStyle = "#4A3728";
    ctx.fillRect(90, 200, 30, 50);
    // Tree
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(220, 160, 20, 80);
    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.arc(230, 160, 40, 0, Math.PI * 2);
    ctx.fill();

    // Store full image for reference
    setFullImage(canvas.toDataURL());

    const pieceSize = size / gridSize;
    const newPieces = [];
    const newSlots = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceSize;
        pieceCanvas.height = pieceSize;
        const pCtx = pieceCanvas.getContext('2d');
        
        pCtx.drawImage(
          canvas,
          x * pieceSize, y * pieceSize, pieceSize, pieceSize, // Source
          0, 0, pieceSize, pieceSize // Dest
        );
        
        // Draw border
        pCtx.strokeStyle = '#fff';
        pCtx.lineWidth = 2;
        pCtx.strokeRect(0, 0, pieceSize, pieceSize);

        const id = y * gridSize + x;
        newSlots.push({ id, x, y, current: null });
        newPieces.push({
          id,
          img: pieceCanvas.toDataURL(),
          correctSlot: id
        });
      }
    }

    // Shuffle pieces
    setPieces(newPieces.sort(() => Math.random() - 0.5));
    setSlots(newSlots);
    setComplete(false);
    setSelectedPiece(null);
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  const handlePieceClick = (piece) => {
    if (selectedPiece && selectedPiece.id === piece.id) {
        setSelectedPiece(null); // Deselect
    } else {
        setSelectedPiece(piece);
    }
  };

  const handleSlotClick = (slotId) => {
    if (!selectedPiece) return;

    // Check if slot is empty
    const slotIndex = slots.findIndex(s => s.id === slotId);
    if (slots[slotIndex].current !== null) return;

    const newSlots = [...slots];
    newSlots[slotIndex].current = selectedPiece;
    setSlots(newSlots);
    
    setPieces(pieces.filter(p => p.id !== selectedPiece.id));
    setSelectedPiece(null);

    // Check win
    const allFilled = newSlots.every(s => s.current !== null);
    if (allFilled) {
      const allCorrect = newSlots.every(s => s.current.id === s.id);
      if (allCorrect) setComplete(true);
    }
  };

  const handleReset = () => {
    generatePuzzle();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-2 md:p-4 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-4">
        <Button onClick={onBack} variant="outline" className="!px-3 !py-2 text-sm"><ArrowLeft size={16} /> Back</Button>
        <h2 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center gap-2">
          <Grid3X3 className="hidden md:block"/> Farm Puzzle
        </h2>
        <Button onClick={handleReset} variant="secondary" className="!px-3 !py-2 text-sm"><RefreshCw size={16} /></Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center w-full flex-grow">
        
        {/* Left Column: Reference & Board */}
        <div className="flex flex-col items-center gap-4">
            
            {/* Reference Image (Goal) */}
            <div className="bg-white p-2 rounded-xl shadow-md border border-blue-100 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Goal</span>
                {fullImage && (
                    <img src={fullImage} alt="Goal" className="w-32 h-32 md:w-48 md:h-48 rounded-lg border-2 border-gray-200" />
                )}
            </div>

            {/* Puzzle Board */}
            <div className="bg-blue-50 p-2 md:p-4 rounded-xl shadow-inner border-2 border-blue-200">
                <div className="grid grid-cols-3 gap-0 w-[300px] h-[300px] bg-gray-200 relative shadow-xl">
                    {complete && <Confetti active={true} />}
                    {slots.map((slot) => (
                    <div
                        key={slot.id}
                        onClick={() => handleSlotClick(slot.id)}
                        className={`
                            w-[100px] h-[100px] border border-gray-300 flex items-center justify-center 
                            transition-colors duration-200
                            ${slot.current ? 'bg-white' : 'bg-gray-100'}
                            ${selectedPiece && !slot.current ? 'bg-blue-100 animate-pulse cursor-pointer' : ''}
                        `}
                    >
                        {slot.current ? (
                        <img src={slot.current.img} className="w-full h-full block" alt="placed piece" />
                        ) : (
                        <div className="text-gray-300 opacity-20 text-4xl font-bold">+</div>
                        )}
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Pieces Pool */}
        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-100 w-full max-w-[350px] lg:h-[600px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-500 mb-4 text-center sticky top-0 bg-white z-10 py-2 border-b">
              {pieces.length > 0 ? "Tap a piece to move it!" : "Great Job!"}
          </h3>
          
          <div className="grid grid-cols-3 gap-3 overflow-y-auto p-2 custom-scrollbar">
            {pieces.map((piece) => (
              <div
                key={piece.id}
                onClick={() => handlePieceClick(piece)}
                className={`
                    cursor-pointer transition-all transform duration-200 rounded-lg overflow-hidden border-2
                    ${selectedPiece?.id === piece.id 
                        ? 'ring-4 ring-blue-400 scale-105 border-blue-500 shadow-xl z-10' 
                        : 'border-transparent hover:scale-105 hover:shadow-md'
                    }
                `}
              >
                <img src={piece.img} alt="puzzle piece" className="w-full block" />
              </div>
            ))}
            {pieces.length === 0 && !complete && (
              <div className="col-span-3 text-center text-gray-400 py-8">No pieces left!</div>
            )}
            {complete && (
               <div className="col-span-3 flex flex-col items-center justify-center text-green-500 py-8">
                 <Trophy size={64} className="mb-4 animate-bounce" />
                 <span className="font-bold text-xl">Puzzle Solved!</span>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Game 2: Memory Match ---

const MemoryGame = ({ onBack }) => {
  const cardsData = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const doubled = [...cardsData, ...cardsData];
    const shuffled = doubled
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
  };

  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    if (flipped.length === 1) {
      setDisabled(true);
      const firstId = flipped[0];
      const secondId = id;
      setFlipped([firstId, secondId]);

      if (cards[firstId].emoji === cards[secondId].emoji) {
        setSolved([...solved, firstId, secondId]);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 min-h-screen">
      <div className="flex justify-between w-full mb-6">
        <Button onClick={onBack} variant="outline" className="!px-3 !py-2 text-sm"><ArrowLeft size={16} /> Back</Button>
        <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
          <Brain /> Memory Match
        </h2>
        <Button onClick={shuffleCards} variant="secondary" className="!px-3 !py-2 text-sm"><RefreshCw size={16} /></Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-md my-auto">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
          const isSolved = solved.includes(card.id);
          return (
            <div
              key={card.id}
              onClick={() => handleClick(card.id)}
              className={`
                aspect-square rounded-xl cursor-pointer shadow-lg
                flex items-center justify-center text-4xl transition-all duration-300 transform
                ${isFlipped ? 'bg-white rotate-y-180' : 'bg-purple-500'}
                ${isSolved ? 'bg-green-100 ring-4 ring-green-400' : ''}
                active:scale-95 hover:scale-105
              `}
            >
              {isFlipped ? card.emoji : <span className="text-white text-2xl font-bold">?</span>}
            </div>
          );
        })}
      </div>
      
      {solved.length === cards.length && cards.length > 0 && (
        <div className="mt-8 text-center animate-bounce">
          <h3 className="text-3xl font-bold text-green-600">You Won! 🎉</h3>
          <Confetti active={true} />
        </div>
      )}
    </div>
  );
};

// --- Game 3: Shape Sorter ---

const SortGame = ({ onBack }) => {
  const categories = {
    fruit: { label: 'Fruits', color: 'bg-red-100 border-red-300 text-red-600', bg: 'bg-red-50', icon: '🍎' },
    animal: { label: 'Animals', color: 'bg-green-100 border-green-300 text-green-600', bg: 'bg-green-50', icon: '🐾' }
  };
  
  const itemsData = [
    { id: 1, type: 'fruit', content: '🍎' },
    { id: 2, type: 'fruit', content: '🍌' },
    { id: 3, type: 'fruit', content: '🍇' },
    { id: 4, type: 'fruit', content: '🍓' },
    { id: 5, type: 'animal', content: '🐶' },
    { id: 6, type: 'animal', content: '🐱' },
    { id: 7, type: 'animal', content: '🦁' },
    { id: 8, type: 'animal', content: '🐮' },
  ];

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setItems(itemsData.sort(() => Math.random() - 0.5));
    setScore(0);
    setSelectedItem(null);
  };

  // Mobile friendly: Tap item to select, tap box to drop
  const handleItemClick = (item) => {
    if (selectedItem?.id === item.id) {
        setSelectedItem(null);
    } else {
        setSelectedItem(item);
    }
  };

  const handleCategoryClick = (categoryKey) => {
      if (!selectedItem) return;

      if (selectedItem.type === categoryKey) {
        // Correct
        setItems(items.filter(i => i.id !== selectedItem.id));
        setScore(s => s + 1);
        setSelectedItem(null);
      } else {
          // Wrong shake effect could go here
          setSelectedItem(null);
      }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 min-h-screen">
      <div className="flex justify-between w-full mb-6">
        <Button onClick={onBack} variant="outline" className="!px-3 !py-2 text-sm"><ArrowLeft size={16} /> Back</Button>
        <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
          <Shapes /> Sort It Out!
        </h2>
        <Button onClick={resetGame} variant="secondary" className="!px-3 !py-2 text-sm"><RefreshCw size={16} /></Button>
      </div>

      <div className="text-xl font-bold text-gray-700 mb-6 bg-white px-4 py-2 rounded-full shadow-sm">
        {items.length > 0 ? "Tap an item, then tap its box!" : "Complete!"}
      </div>

      {items.length === 0 ? (
         <div className="text-center py-12 flex-grow flex flex-col justify-center items-center">
            <h3 className="text-4xl font-bold text-green-600 mb-4">All Sorted! 🎉</h3>
             <Button onClick={resetGame} variant="success">Play Again</Button>
             <Confetti active={true} />
         </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center mb-12 min-h-[100px] content-start">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`
                w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow-md flex items-center justify-center text-4xl cursor-pointer transition-all
                ${selectedItem?.id === item.id ? 'ring-4 ring-orange-400 scale-110 -translate-y-2' : 'hover:scale-105'}
              `}
            >
              {item.content}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-2xl mt-auto md:mt-0 mb-8">
        {Object.entries(categories).map(([key, cat]) => (
          <div
            key={key}
            onClick={() => handleCategoryClick(key)}
            className={`
              h-40 md:h-64 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer
              ${cat.color} ${cat.bg}
              ${selectedItem ? 'animate-pulse ring-2 ring-offset-2 ring-gray-200' : ''}
              active:scale-95
            `}
          >
            <span className="text-5xl md:text-7xl mb-4">{cat.icon}</span>
            <span className="text-xl md:text-2xl font-bold uppercase tracking-wider">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [view, setView] = useState('menu');

  useEffect(() => {
      document.title = "Kids Puzzle Playground - Educational Games";
  }, []);

  const renderView = () => {
    switch(view) {
      case 'jigsaw': return <JigsawGame onBack={() => setView('menu')} />;
      case 'memory': return <MemoryGame onBack={() => setView('menu')} />;
      case 'sort': return <SortGame onBack={() => setView('menu')} />;
      default: return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-4 text-center">
          <div className="animate-fade-in-down">
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-2 drop-shadow-sm">
                🧩 Kids Puzzle
            </h1>
            <h2 className="text-3xl md:text-5xl font-black text-blue-500 tracking-tight">
                Playground
            </h2>
          </div>
          
          <p className="text-lg text-gray-500 max-w-md mb-4">
            Fun, safe, and educational games designed for little hands.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
            <button 
              onClick={() => setView('jigsaw')}
              className="group bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-b-8 border-blue-200 active:border-b-0 active:translate-y-1 flex flex-col items-center gap-4"
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform duration-300">
                <Grid3X3 size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Jigsaw</h3>
                <p className="text-gray-400 font-medium">Build the Farm</p>
              </div>
            </button>

            <button 
              onClick={() => setView('memory')}
              className="group bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-b-8 border-purple-200 active:border-b-0 active:translate-y-1 flex flex-col items-center gap-4"
            >
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 group-hover:rotate-12 transition-transform duration-300">
                <Brain size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Memory</h3>
                <p className="text-gray-400 font-medium">Find Pairs</p>
              </div>
            </button>

            <button 
              onClick={() => setView('sort')}
              className="group bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-b-8 border-orange-200 active:border-b-0 active:translate-y-1 flex flex-col items-center gap-4"
            >
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 group-hover:rotate-12 transition-transform duration-300">
                <Shapes size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Sorting</h3>
                <p className="text-gray-400 font-medium">Fruits & Animals</p>
              </div>
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white font-sans text-slate-800 flex flex-col">
      <header className="p-4 border-b border-white/50 bg-white/50 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-center relative">
             <span className="font-black text-xl tracking-wider text-blue-600 opacity-80 flex items-center gap-2">
                <Star className="text-yellow-400 fill-current" size={20}/> TOY BOX
             </span>
        </div>
      </header>
      
      <main className="flex-grow">
        {renderView()}
      </main>

      <footer className="p-6 text-center text-slate-400 text-sm font-medium bg-slate-50 border-t border-slate-100">
          <p>© {new Date().getFullYear()} Kids Puzzle Playground</p>
          <p className="mt-1 text-slate-500">Developed by <span className="text-blue-500 font-bold">Vivek Narkhede</span></p>
      </footer>
    </div>
  );
};

export default App;
