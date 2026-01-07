import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import QuizView from './components/QuizView';
import { MusicProvider, BackgroundMusicWidget, useMusic } from './components/BackgroundMusic';
import { ViewState, Difficulty, LeaderboardEntry, LearnContent, UserProfile, LiveFact } from './types';
import { Play, Star, Loader2, Signal, Globe, ExternalLink, LogOut, ChevronRight, Check, Sparkles, RefreshCw } from 'lucide-react';
import { generateLeaderboard, generateLearnContent, getLiveGennaFacts } from './services/geminiService';
import { authService } from './services/authService';

const AuthView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await authService.loginWithGoogle();
            onLogin();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#051210] flex flex-col justify-center items-center px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F2926] via-[#051210] to-[#051210] z-0"></div>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-sm h-64 opacity-30 pointer-events-none bg-genna-gold/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
                 <div className="mx-auto w-20 h-20 bg-genna-gold/10 rounded-full flex items-center justify-center border border-genna-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                    <Star size={40} className="text-genna-gold fill-genna-gold" />
                 </div>
                 <div>
                    <h1 className="text-4xl font-display text-white mb-2">Melkam Genna</h1>
                    <p className="text-gray-400 text-sm tracking-widest uppercase">Ethiopian Christmas Challenge</p>
                 </div>
                 <div className="bg-[#122b27] border border-white/5 rounded-2xl p-6 text-left space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="mt-1 bg-green-900/30 p-1 rounded"><Check size={14} className="text-green-500"/></div>
                        <p className="text-sm text-gray-300">Test your knowledge of the Nativity & Tradition.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                         <div className="mt-1 bg-green-900/30 p-1 rounded"><Check size={14} className="text-green-500"/></div>
                        <p className="text-sm text-gray-300">Fast-Check facts with real-time Google Grounding.</p>
                    </div>
                     <div className="flex items-start space-x-3">
                         <div className="mt-1 bg-green-900/30 p-1 rounded"><Check size={14} className="text-green-500"/></div>
                        <p className="text-sm text-gray-300">Climb the Hall of Faithful.</p>
                    </div>
                 </div>
                 <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-gray-100 transition-colors shadow-lg">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        <span>Sign in with Google</span>
                        </>}
                 </button>
            </div>
        </div>
    )
}

const HomeView: React.FC<{ onStart: () => void, onLearn: () => void, user: UserProfile | null }> = ({ onStart, onLearn, user }) => {
  const [liveFacts, setLiveFacts] = useState<LiveFact[]>([]);
  const [loadingFacts, setLoadingFacts] = useState(false);
  const { setHasInteracted, setIsPlaying } = useMusic();

  useEffect(() => {
    const fetchFacts = async () => {
      setLoadingFacts(true);
      try {
        const facts = await getLiveGennaFacts();
        setLiveFacts(facts);
      } catch (err) {
        console.error("Failed to fetch live facts", err);
      } finally {
        setLoadingFacts(false);
      }
    };
    fetchFacts();
  }, []);

  const handleStartInteraction = () => {
    setHasInteracted(true);
    setIsPlaying(true);
    onStart();
  }

  return (
    <div className="min-h-screen bg-[#051210] flex flex-col pt-12 pb-32 px-6 relative overflow-x-hidden overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2926] via-[#1D4E45] to-[#2E1A16] z-0"></div>
      
      <div className="relative z-10 text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        {user && (
           <div className="flex items-center justify-center space-x-2 mb-6">
               <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-genna-gold shadow-lg" alt="User" />
               <div className="text-left">
                  <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">Greetings</p>
                  <p className="text-genna-gold text-sm font-bold">{user.name}</p>
               </div>
           </div>
        )}

        <h1 className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-br from-genna-gold via-yellow-200 to-genna-gold mb-2">
          Melkam Genna
        </h1>
        <p className="text-white/80 font-serif tracking-widest text-[10px] uppercase mb-8 border-t border-b border-white/10 py-2 inline-block">
          Ethiopian Christmas Tradition
        </p>
      </div>

      <div className="relative z-10 grid gap-6 max-w-sm mx-auto w-full mb-12">
        <button 
          onClick={handleStartInteraction}
          className="w-full bg-gradient-to-r from-genna-gold to-[#B8860B] py-5 rounded-2xl flex items-center justify-center space-x-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-black group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <Play size={24} className="fill-black relative z-10" />
          <span className="font-bold text-lg tracking-wide relative z-10">Enter the Journey</span>
        </button>

        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/5">
          <div className="flex items-center space-x-2 mb-4">
            <Signal size={14} className="text-red-500 animate-pulse" />
            <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center">
              Live Verified Feed
              <Globe size={12} className="ml-2 text-blue-400" />
            </h3>
          </div>
          
          <div className="space-y-4">
            {loadingFacts ? (
              <div className="flex flex-col items-center py-4 space-y-2">
                <Loader2 size={20} className="animate-spin text-genna-gold/50" />
                <span className="text-[10px] text-white/30 uppercase tracking-tighter">Grounding search results...</span>
              </div>
            ) : liveFacts.length > 0 ? (
              liveFacts.map((fact, idx) => (
                <div key={idx} className="border-l-2 border-genna-gold/30 pl-3 py-1 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2">"{fact.fact}"</p>
                  {fact.source && (
                    <a href={fact.source.uri} target="_blank" className="inline-flex items-center text-[9px] text-blue-400 hover:text-blue-300 transition-colors uppercase font-bold tracking-tighter">
                      <ExternalLink size={10} className="mr-1" />
                      {fact.source.title}
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-white/20 italic">No live updates currently available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-center">
        <button onClick={onLearn} className="flex items-center space-x-2 text-genna-gold/80 hover:text-genna-gold transition-colors text-xs font-bold uppercase tracking-widest">
          <span>Explore Sacred Archives</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const GamesView: React.FC<{ onSelectGame: () => void }> = ({ onSelectGame }) => {
  const games = [
    { title: "Grounded Quiz", desc: "Real-time verified questions using Google Search grounding.", tag: "LIVE DATA", img: "https://picsum.photos/seed/bible/400/200", action: "Start Quest" },
    { title: "Story Weaver", desc: "Collaborate with Gemini to narrate the Christmas story.", tag: "AI CHALLENGE", img: "https://picsum.photos/seed/icons/400/200", action: "Locked", disabled: true },
    { title: "Lalibela Gates", desc: "Explore the rock-hewn churches in a memory trial.", tag: "COMING SOON", img: "https://picsum.photos/seed/tile/400/200", action: "Locked", disabled: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a1f1c] pb-28 pt-20 px-4">
      <div className="fixed top-0 left-0 w-full bg-[#0a1f1c]/90 backdrop-blur-sm z-40 p-4 border-b border-white/5">
         <h2 className="text-center font-display text-xl text-white">Choose Your Path</h2>
      </div>
      <div className="space-y-6 mt-4">
        {games.map((game, idx) => (
          <div key={idx} className={`bg-[#122b27] rounded-2xl overflow-hidden border border-white/5 shadow-xl ${game.disabled ? 'opacity-70 grayscale-[0.5]' : ''}`}>
             <div className="h-32 bg-cover bg-center relative" style={{backgroundImage: `url('${game.img}')`}}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#122b27] to-transparent"></div>
                {game.tag && <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded border ${game.tag === 'LIVE DATA' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-genna-gold/20 text-genna-gold border-genna-gold/40'}`}>{game.tag}</span>}
             </div>
             <div className="p-5">
                <h3 className="text-xl font-display text-white mb-2">{game.title}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{game.desc}</p>
                <button 
                  onClick={!game.disabled ? onSelectGame : undefined}
                  className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                      game.disabled 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-genna-accent hover:bg-genna-accent/80 text-white'
                  }`}
                >
                  {game.disabled && <Star size={14} className="mr-2" />}
                  {game.action} 
                  {!game.disabled && <ChevronRight size={16} className="ml-1" />}
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DifficultySelection: React.FC<{ onSelect: (d: Difficulty) => void, onBack: () => void }> = ({ onSelect, onBack }) => {
    return (
        <div className="min-h-screen bg-[#0a1f1c] flex flex-col justify-center px-6 relative">
             <button onClick={onBack} className="absolute top-6 left-4 text-gray-400 hover:text-white p-2">
                <ChevronRight className="rotate-180" size={28}/>
             </button>
             <div className="text-center mb-12">
                <h2 className="text-3xl font-display text-white mb-2">Faith Level</h2>
                <p className="text-gray-400 text-sm">How deep is your knowledge of Genna?</p>
             </div>
             <div className="space-y-4">
                 {[
                     { level: 'Easy', desc: 'Pilgrim • Well-known stories (25s timer)', color: 'border-green-500/30 bg-green-900/10' },
                     { level: 'Medium', desc: 'Faithful • Cultural History (15s timer)', color: 'border-yellow-500/30 bg-yellow-900/10' },
                     { level: 'Hard', desc: 'Scholar • Obscure Ge\'ez Facts (10s timer)', color: 'border-red-500/30 bg-red-900/10' }
                 ].map((opt) => (
                     <button key={opt.level} onClick={() => onSelect(opt.level as Difficulty)} className={`w-full p-6 rounded-2xl border transition-all text-left group ${opt.color}`}>
                         <div className="flex justify-between items-center">
                             <div>
                                 <h3 className="text-xl font-display text-white group-hover:text-genna-gold transition-colors">{opt.level}</h3>
                                 <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">{opt.desc}</p>
                             </div>
                             <ChevronRight className="text-gray-600 group-hover:text-white" />
                         </div>
                     </button>
                 ))}
             </div>
        </div>
    )
}

const LeaderboardView: React.FC<{user: UserProfile | null}> = ({user}) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const savedScore = parseInt(localStorage.getItem('genna_score') || '0');
            const data = await generateLeaderboard(savedScore, user?.name || "You");
            setEntries(data);
            setLoading(false);
        };
        load();
    }, [user]);

    if (loading) return <div className="min-h-screen bg-[#0a1f1c] flex items-center justify-center"><Loader2 className="animate-spin text-genna-gold" size={32} /></div>
    const topThree = entries.slice(0, 3);
    const rest = entries.slice(3);

    return (
    <div className="min-h-screen bg-[#0a1f1c] pb-28 pt-8 px-4">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display text-white">Hall of Faithful</h2>
            <div className="flex bg-[#122b27] rounded-lg p-1 border border-white/5 items-center"><Signal size={12} className="text-green-500 mx-2 animate-pulse" /><span className="text-[10px] text-green-500 font-bold uppercase mr-2">Live Ranking</span></div>
        </div>
        <div className="flex justify-center items-end space-x-4 mb-10 min-h-[160px]">
            {topThree[1] && <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-100"><span className="text-xs text-gray-400 mb-1">Rank 2</span><div className="w-16 h-16 rounded-full border-2 border-gray-400 p-1 mb-2 relative"><img src={topThree[1].avatar} className="w-full h-full rounded-full object-cover" alt="User" /><div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">#2</div></div><span className={`font-bold text-sm text-center line-clamp-1 max-w-[80px] ${topThree[1].isUser ? 'text-genna-gold' : 'text-white'}`}>{topThree[1].name}</span><span className="text-gray-400 text-xs">{topThree[1].score}</span></div>}
            {topThree[0] && <div className="flex flex-col items-center -mt-6 animate-in slide-in-from-bottom-8 duration-700"><Sparkles size={16} className="text-genna-gold mb-1" /><div className="w-24 h-24 rounded-full border-2 border-genna-gold p-1 mb-2 relative shadow-[0_0_20px_rgba(212,175,55,0.3)]"><img src={topThree[0].avatar} className="w-full h-full rounded-full object-cover" alt="User" /><div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-genna-gold text-black font-bold text-xs px-3 py-0.5 rounded-full">#1</div></div><span className={`font-bold text-base text-center line-clamp-1 max-w-[100px] ${topThree[0].isUser ? 'text-genna-gold' : 'text-genna-gold'}`}>{topThree[0].name}</span><span className="text-white/80 text-xs">{topThree[0].score}</span></div>}
            {topThree[2] && <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-200"><span className="text-xs text-gray-400 mb-1">Rank 3</span><div className="w-16 h-16 rounded-full border-2 border-orange-700 p-1 mb-2 relative"><img src={topThree[2].avatar} className="w-full h-full rounded-full object-cover" alt="User" /><div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">#3</div></div><span className={`font-bold text-sm text-center line-clamp-1 max-w-[80px] ${topThree[2].isUser ? 'text-genna-gold' : 'text-white'}`}>{topThree[2].name}</span><span className="text-gray-400 text-xs">{topThree[2].score}</span></div>}
        </div>
        <div className="bg-[#122b27] rounded-xl border border-white/5 overflow-hidden">
            {rest.map((entry) => <div key={entry.rank} className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 ${entry.isUser ? 'bg-genna-gold/10' : ''}`}><div className="flex items-center space-x-4"><span className="text-gray-500 font-bold w-6 text-center">{entry.rank}</span><img src={entry.avatar} className="w-8 h-8 rounded-full bg-black/20" alt={entry.name} /><span className={`text-sm font-medium ${entry.isUser ? 'text-genna-gold' : 'text-gray-200'}`}>{entry.name} {entry.isUser && '(You)'}</span></div><span className="text-white font-mono text-sm">{entry.score}</span></div>)}
        </div>
    </div>
    );
};

const LearnView: React.FC = () => {
    const [content, setContent] = useState<LearnContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'All' | 'Scripture' | 'Tradition'>('All');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await generateLearnContent();
            setContent(data);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = activeTab === 'All' ? content : content.filter(c => c.category === activeTab || (activeTab === 'Tradition' && c.category === 'History'));

    if (loading) return <div className="min-h-screen bg-[#0a1f1c] flex flex-col items-center justify-center space-y-4"><Loader2 className="animate-spin text-genna-gold" size={40} /><p className="text-white/60 text-sm animate-pulse">Consulting the archives...</p></div>

    return (
        <div className="min-h-screen bg-[#0a1f1c] pb-28 pt-8 px-4 font-serif">
            <h2 className="text-2xl font-display text-center text-white mb-2">Sacred Traditions</h2>
            <div className="flex justify-center space-x-2 mb-8">
                {['All', 'Scripture', 'Tradition'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === t ? 'bg-genna-gold text-black' : 'bg-white/10 text-gray-400'}`}>{t}</button>
                ))}
            </div>
            <div className="grid gap-6">
                {filtered.map((item, idx) => (
                    <div key={idx} className="bg-[#122b27] rounded-xl overflow-hidden border border-white/5 hover:border-genna-gold/30 transition-colors animate-in slide-in-from-bottom-4">
                        <div className="p-6">
                             <div className="flex items-center space-x-2 mb-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.category === 'Scripture' ? 'bg-blue-900/40 text-blue-300' : 'bg-orange-900/40 text-orange-300'}`}>{item.category}</span>
                             </div>
                             <h3 className="text-genna-gold font-bold text-lg mb-2">{item.title}</h3>
                             <p className="text-gray-400 text-sm mb-4 leading-relaxed italic">{item.description}</p>
                             <div className="bg-black/20 p-4 rounded-lg border-l-2 border-genna-gold/50">
                                 <p className="text-gray-300 text-sm leading-relaxed">{item.details}</p>
                                 {item.reference && <p className="text-xs text-genna-gold mt-2 font-bold text-right">— {item.reference}</p>}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
             <button onClick={() => window.location.reload()} className="w-full mt-6 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                <RefreshCw size={16} className="mr-2"/> Discover More Facts
            </button>
        </div>
    );
};

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('AUTH');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
      const existing = authService.getCurrentUser();
      if (existing) {
          setUser(existing);
          setCurrentView('HOME');
      }
  }, []);

  const handleLogin = () => {
      const u = authService.getCurrentUser();
      setUser(u);
      setCurrentView('HOME');
  }

  const handleStartQuiz = (diff: Difficulty) => {
      setDifficulty(diff);
      setCurrentView('QUIZ');
  }

  const handleLogout = () => {
      authService.logout();
      setUser(null);
      setCurrentView('AUTH');
  }

  const renderView = () => {
    switch (currentView) {
      case 'AUTH': return <AuthView onLogin={handleLogin} />;
      case 'HOME': return <HomeView onStart={() => setCurrentView('GAMES')} onLearn={() => setCurrentView('LEARN')} user={user} />;
      case 'GAMES': return <GamesView onSelectGame={() => setCurrentView('DIFFICULTY')} />;
      case 'DIFFICULTY': return <DifficultySelection onSelect={handleStartQuiz} onBack={() => setCurrentView('GAMES')} />;
      case 'QUIZ': return <QuizView difficulty={difficulty} onExit={() => setCurrentView('GAMES')} />;
      case 'LEADERBOARD': return <LeaderboardView user={user} />;
      case 'LEARN': return <LearnView />;
      default: return <HomeView onStart={() => setCurrentView('GAMES')} onLearn={() => setCurrentView('LEARN')} user={user} />;
    }
  };

  return (
    <div className="bg-[#051210] min-h-screen text-white font-sans selection:bg-genna-gold selection:text-black">
      {currentView !== 'AUTH' && <BackgroundMusicWidget />}
      {renderView()}
      {currentView !== 'QUIZ' && currentView !== 'DIFFICULTY' && currentView !== 'AUTH' && (
        <>
            <Navigation currentView={currentView} setView={setCurrentView} />
            {currentView === 'HOME' && (
                <button onClick={handleLogout} className="fixed top-6 right-6 z-40 p-2 text-gray-500 hover:text-white bg-black/40 rounded-full backdrop-blur transition-all active:scale-90">
                    <LogOut size={20} />
                </button>
            )}
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
};

export default App;