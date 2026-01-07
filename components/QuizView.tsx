
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, XCircle, Sparkles, X, Info, RefreshCw, Star, Home, Share2, Search, Maximize, Minimize, Volume2, VolumeX, SkipForward, Play, Pause, ExternalLink, ShieldCheck, BookOpen, Globe } from 'lucide-react';
import { Question, FactCheckResult, Difficulty, HintResult } from '../types';
import { getFactCheck, generateQuizQuestions, getQuickHint } from '../services/geminiService';
import { soundService } from '../services/soundService';
import { useMusic } from './BackgroundMusic';

interface QuizViewProps {
  difficulty: Difficulty;
  onExit: () => void;
}

const LOADING_TIPS = [
  "Did you know? Genna is celebrated on Tahsas 29 (January 7th).",
  "Tsome Nebiyat is the 43-day fast of the prophets preceding Christmas.",
  "YeGenna Chewata is a traditional hockey-like game played by shepherds.",
  "Lalibela's rock-hewn churches represent the humble birth of Christ.",
  "Ethiopians traditionally wear a white Shamma with a colored border on Genna.",
  "The date of Genna matches the Julian calendar which Ethiopia follows."
];

const Confetti = () => {
  const colors = ['bg-genna-gold', 'bg-genna-red', 'bg-genna-green', 'bg-white'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 rounded-sm ${colors[Math.floor(Math.random() * colors.length)]} opacity-90`}
          style={{
            top: '-20px',
            left: `${Math.random() * 100}%`,
            animation: `fall ${Math.random() * 3 + 3}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-5vh) rotate(0deg) translateX(0); opacity: 1; }
          25% { transform: translateY(25vh) rotate(90deg) translateX(20px); }
          50% { transform: translateY(50vh) rotate(180deg) translateX(-20px); }
          75% { transform: translateY(75vh) rotate(270deg) translateX(20px); }
          100% { transform: translateY(110vh) rotate(360deg) translateX(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const QuizView: React.FC<QuizViewProps> = ({ difficulty, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [factCheck, setFactCheck] = useState<FactCheckResult>({ text: '', sources: [], isLoading: false });
  const [fastCheckData, setFastCheckData] = useState<HintResult>({ text: '', sources: [], isLoading: false });
  const [showFastCheck, setShowFastCheck] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
  const [restartKey, setRestartKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bonusDisabled, setBonusDisabled] = useState(false);
  
  const { isPlaying, togglePlay, skipTrack } = useMusic();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const initialDuration = difficulty === 'Hard' ? 10 : difficulty === 'Medium' ? 15 : 25;
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [difficulty, restartKey]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loadingQuestions) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loadingQuestions]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timeLeft > 0 && !isAnswered) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
             if (prev <= 4 && prev > 1 && soundEnabled) soundService.playTick();
             return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeOut();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isAnswered, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
  };

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setShowResults(false);
    try {
      const data = await generateQuizQuestions(difficulty);
      setQuestions(data);
    } catch (err) {
      console.warn("Quiz generation issue, using local fallback if needed.");
    } finally {
      setLoadingQuestions(false);
      setCurrentQIndex(0);
      setScore(0);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setBonusDisabled(false);
    setShowFastCheck(false);
    setFactCheck({ text: '', sources: [], isLoading: false });
    setFastCheckData({ text: '', sources: [], isLoading: false });
    const duration = difficulty === 'Hard' ? 10 : difficulty === 'Medium' ? 15 : 25;
    setTimeLeft(duration);
    setTimerActive(true);
  };

  const currentQuestion = questions[currentQIndex];

  const handleSelect = (id: string) => {
    if (isAnswered) return;
    if (soundEnabled) soundService.playClick();
    setSelectedOption(id);
  };

  const handleTimeOut = () => {
    setIsAnswered(true);
    setTimerActive(false);
    if (soundEnabled) soundService.playWrong();
    if (currentQuestion) {
        const answerText = currentQuestion.options.find(o => o.id === currentQuestion.correctId)?.text || "";
        setFactCheck(prev => ({ ...prev, isLoading: true }));
        getFactCheck(answerText, currentQuestion.question).then(result => {
             setFactCheck({ ...result, isLoading: false });
        });
    }
  };

  const handleFastCheck = async () => {
      if (!currentQuestion || isAnswered || fastCheckData.isLoading) return;
      if (soundEnabled) soundService.playClick();
      
      setShowFastCheck(true);
      setBonusDisabled(true); 
      setFastCheckData(prev => ({ ...prev, isLoading: true }));
      
      const result = await getQuickHint(currentQuestion.question);
      // Merge with initial sources if available
      const combinedSources = [...(currentQuestion.sources || []), ...(result.sources || [])];
      setFastCheckData({ ...result, sources: combinedSources.slice(0, 4), isLoading: false });
  };

  const handleSubmit = () => {
    if (!selectedOption || !currentQuestion) return;
    setIsAnswered(true);
    setTimerActive(false);
    
    if (selectedOption === currentQuestion.correctId) {
        const baseScore = 500;
        const timeBonus = bonusDisabled ? 0 : timeLeft * 100;
        setScore(prev => prev + baseScore + timeBonus);
        if (soundEnabled) soundService.playCorrect();
    } else {
        if (soundEnabled) soundService.playWrong();
    }

    const answerText = currentQuestion.options.find(o => o.id === currentQuestion.correctId)?.text || "";
    setFactCheck(prev => ({ ...prev, isLoading: true }));
    
    getFactCheck(answerText, currentQuestion.question).then(result => {
      setFactCheck({ ...result, isLoading: false });
    });
  };

  const handleNext = () => {
    if (soundEnabled) soundService.playClick();
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
      setShowResults(true);
      if (soundEnabled) soundService.playWin();
      const currentSavedScore = parseInt(localStorage.getItem('genna_score') || '0');
      if (score > currentSavedScore) {
          localStorage.setItem('genna_score', score.toString());
      }
  };

  const handleRestart = () => {
      setRestartKey(prev => prev + 1);
  };

  const handleShare = async () => {
    const title = 'Melkam Genna Challenge';
    const text = `I just scored ${score} points on the Melkam Genna Quiz! Test your knowledge of Ethiopian Christmas traditions.`;
    const url = window.location.href;
    const shareData = { title, text, url };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            setShareStatus('shared');
        } catch (err) {
            console.debug("Share cancelled");
        }
    } else {
        try {
            await navigator.clipboard.writeText(`${text} ${url}`);
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }
  };

  if (loadingQuestions) {
      return (
        <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-6 text-center font-serif relative overflow-hidden">
             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}></div>
            <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
                <div className="mb-8 relative">
                   <div className="absolute inset-0 bg-genna-gold/20 blur-2xl rounded-full animate-pulse"></div>
                   <Sparkles size={64} className="text-genna-gold animate-spin-slow relative z-10" />
                </div>
                <h2 className="text-xl text-white font-display mb-1 tracking-wide">Preparing Your Journey</h2>
                <p className="text-genna-gold/60 text-xs uppercase tracking-widest mb-8">{difficulty} Mode</p>
                <div className="h-1 w-32 bg-gray-800 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-genna-gold/60 w-1/2 animate-[pulse_1s_ease-in-out_infinite] translate-x-full"></div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-genna-gold/70 text-xs uppercase tracking-[0.2em] mb-3 font-bold">Did you know?</p>
                    <p className="text-gray-300 text-sm font-serif leading-relaxed italic min-h-[3rem]">"{LOADING_TIPS[tipIndex]}"</p>
                </div>
            </div>
        </div>
      );
  }

  if (showResults) {
    const isHighScore = score > 1000;
    let rank = "Pilgrim";
    if (score >= 4000) rank = "Genna Scholar";
    else if (score >= 2000) rank = "Faithful Learner";

    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-6 relative overflow-hidden font-serif">
         {isHighScore ? <Confetti /> : (
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <Star key={i} size={Math.random() * 20 + 10} className="text-genna-gold/20 absolute animate-pulse" style={{top: `${Math.random()*100}%`, left: `${Math.random()*100}%`}} />
                ))}
            </div>
         )}
         <div className="relative z-10 text-center max-w-sm w-full animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-display text-genna-gold mb-2 drop-shadow-lg">Journey Complete</h2>
            <p className="text-white/60 text-sm mb-8 tracking-wide">You have finished the Genna Quiz.</p>
            <div className="bg-[#1a1a1a] border border-genna-gold/30 rounded-2xl p-8 mb-8 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-genna-gold to-transparent opacity-50"></div>
                <div className="text-6xl font-bold text-white mb-2 font-display">{score}</div>
                <div className="text-genna-gold/80 text-xs uppercase tracking-widest font-bold mb-4">Total Score</div>
                <div className="inline-block px-4 py-1 rounded-full bg-genna-gold/10 border border-genna-gold/20 text-genna-gold text-sm font-bold">Rank: {rank}</div>
            </div>
            <div className="space-y-3">
                <button onClick={handleRestart} className="w-full py-4 bg-genna-gold text-black font-bold rounded-xl hover:bg-genna-goldLight transition-all transform hover:scale-[1.02] flex items-center justify-center shadow-lg group"><RefreshCw size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-500" /> Play Again</button>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleShare} className="py-3 bg-white/5 text-gray-300 border border-white/10 font-bold rounded-xl flex items-center justify-center text-sm">{shareStatus === 'copied' ? <CheckCircle2 size={16} className="mr-2 text-green-500"/> : <Share2 size={16} className="mr-2" />} {shareStatus === 'copied' ? 'Copied' : 'Share'}</button>
                    <button onClick={onExit} className="py-3 bg-white/5 text-gray-300 border border-white/10 font-bold rounded-xl flex items-center justify-center text-sm"><Home size={16} className="mr-2" /> Home</button>
                </div>
            </div>
         </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className={`min-h-screen bg-[#0d0d0d] pb-24 pt-4 px-4 font-serif relative overflow-hidden transition-all duration-500 ${isFullscreen ? 'p-0 flex flex-col' : ''}`}>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

      <div className={`flex justify-between items-center mb-6 relative z-10 ${isFullscreen ? 'p-6 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-genna-gold/10' : ''}`}>
        <button onClick={onExit} className="p-2 rounded-full border border-genna-gold/30 text-genna-gold/70 hover:bg-genna-gold/10"><X size={20} /></button>
        <div className="flex-1 mx-4">
             <div className="flex justify-between items-center mb-1 text-[10px] text-gray-400 font-bold tracking-wider">
                 <span>Q {currentQIndex + 1} / {questions.length}</span>
                 <span className={`${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-genna-gold'}`}>{timeLeft}s</span>
             </div>
             <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-600'