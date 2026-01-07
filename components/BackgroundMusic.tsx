import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { Music, Upload, Play, Pause, Volume2, VolumeX, Youtube, FileAudio, Plus } from 'lucide-react';

interface Track {
  title: string;
  url: string;
  type: 'direct' | 'youtube' | 'local';
}

const DEFAULT_TRACKS: Track[] = [
  { 
    title: "Melkam Genna Mezmur (Primary)", 
    url: "H9rfP01eeEQ", // YouTube ID
    type: 'youtube' 
  },
  { 
    title: "Genna Orthodox Mezmur", 
    url: "L17R7p_3Yc0", // YouTube ID
    type: 'youtube' 
  },
  { 
    title: "Begena Mezmur (Traditional)", 
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Etenesh_Wassie_-_Zomawa.ogg",
    type: 'direct'
  },
  { 
    title: "Ethiopian Washint Melody", 
    url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Washint_sample.ogg",
    type: 'direct'
  }
];

interface MusicContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isMuted: boolean;
  currentTrack: Track;
  allTracks: Track[];
  togglePlay: () => void;
  toggleMute: () => void;
  skipTrack: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCurrentTrack: (track: Track) => void;
  hasInteracted: boolean;
  setHasInteracted: (val: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(DEFAULT_TRACKS[0]);
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const allTracks = [...DEFAULT_TRACKS, ...userTracks];

  useEffect(() => {
    const audio = audioRef.current;
    if (currentTrack.type !== 'youtube' && audio) {
      if (isPlaying && hasInteracted) {
        // Defensive check: Ensure the source is not empty or pointing to the root page
        if (audio.src && !audio.src.endsWith('/') && audio.src !== window.location.href) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                // Log only the message to avoid circular structure JSON error from logging 'err'
                console.warn("Audio Playback Issue:", err.message);
              }
              if (err.name === 'NotAllowedError') {
                setIsPlaying(false);
              }
            });
          }
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, currentTrack, hasInteracted]);

  const togglePlay = () => {
    setHasInteracted(true);
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const skipTrack = () => {
    const currentIndex = allTracks.findIndex(t => t.url === currentTrack.url);
    const nextIndex = (currentIndex + 1) % allTracks.length;
    setCurrentTrack(allTracks[nextIndex]);
    setIsPlaying(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      const newTrack: Track = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        url: objectUrl,
        type: 'local'
      };
      setUserTracks(prev => [...prev, newTrack]);
      setCurrentTrack(newTrack);
      setIsPlaying(true);
      setHasInteracted(true);
    }
  };

  useEffect(() => {
    return () => {
      userTracks.forEach(track => {
        if (track.url.startsWith('blob:')) {
          URL.revokeObjectURL(track.url);
        }
      });
    };
  }, [userTracks]);

  return (
    <MusicContext.Provider value={{
      isPlaying, setIsPlaying,
      isMuted, currentTrack, allTracks,
      togglePlay, toggleMute, skipTrack, handleFileUpload,
      setCurrentTrack, hasInteracted, setHasInteracted
    }}>
      {children}
      
      {currentTrack.type !== 'youtube' && (
        <audio 
          ref={audioRef} 
          key={currentTrack.url}
          src={currentTrack.url} 
          loop 
          muted={isMuted}
          onEnded={skipTrack}
          preload="auto"
          // Log only primitive messages to prevent circular JSON error
          onError={() => console.warn("Background audio source failed to load.")}
        />
      )}

      {currentTrack.type === 'youtube' && hasInteracted && (
        <div className="fixed -top-[1000px] -left-[1000px] pointer-events-none opacity-0 invisible">
          <iframe
            key={`${currentTrack.url}-${isPlaying}`} 
            width="1"
            height="1"
            src={`https://www.youtube.com/embed/${currentTrack.url}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${currentTrack.url}&enablejsapi=1`}
            title="Genna Music"
            allow="autoplay; encrypted-media"
          ></iframe>
        </div>
      )}
    </MusicContext.Provider>
  );
};

export const BackgroundMusicWidget: React.FC = () => {
  const { 
    isPlaying, isMuted, currentTrack, allTracks, 
    togglePlay, toggleMute, handleFileUpload, setCurrentTrack 
  } = useMusic();
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed z-[60] bottom-20 right-4 transition-all duration-500">
      <div className={`bg-genna-dark/95 border border-genna-gold/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl transition-all duration-300 origin-bottom-right mb-4 w-72 ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute bottom-0 right-0'}`}>
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
          <div className="flex items-center space-x-2">
            <Music size={16} className="text-genna-gold" />
            <h3 className="text-genna-gold text-xs font-bold uppercase tracking-widest">Sacred Melodies</h3>
          </div>
          <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white transition-colors">&times;</button>
        </div>

        <div className="mb-4 text-center">
          <div className="relative inline-block mb-2">
            <div className={`absolute inset-0 bg-genna-gold/20 rounded-full blur-xl animate-pulse ${isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="w-16 h-16 bg-black rounded-full border-2 border-genna-gold/40 flex items-center justify-center relative z-10">
              {currentTrack.type === 'youtube' ? <Youtube size={30} className="text-red-500" /> : <Music size={30} className="text-genna-gold" />}
            </div>
          </div>
          <h4 className="text-white text-sm font-bold line-clamp-1">{currentTrack.title}</h4>
          <p className="text-[10px] text-genna-gold/60 uppercase tracking-widest mt-1">
            {currentTrack.type === 'youtube' ? 'YouTube Stream' : currentTrack.type === 'local' ? 'Local File' : 'Genna Archive'}
          </p>
        </div>

        <div className="flex items-center justify-center space-x-6 mb-6">
          <button onClick={toggleMute} className="p-2 text-gray-400 hover:text-white transition-colors">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button onClick={togglePlay} className="p-4 bg-genna-gold text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg">
            {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white transition-colors" title="Upload track">
            <Upload size={20} />
          </button>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <p className="text-[10px] text-white/30 uppercase tracking-widest px-2 mb-1 mt-2">Library</p>
          {allTracks.map((track, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentTrack(track)}
              className={`w-full text-left text-[11px] p-2.5 rounded-xl flex items-center transition-all ${currentTrack.url === track.url ? 'bg-genna-gold/20 text-genna-gold border border-genna-gold/30' : 'hover:bg-white/5 text-gray-400'}`}
            >
              {track.type === 'youtube' ? <Youtube size={14} className="mr-3 opacity-70" /> : track.type === 'local' ? <FileAudio size={14} className="mr-3 opacity-70" /> : <Music size={14} className="mr-3 opacity-70" />}
              <span className="truncate flex-1">{track.title}</span>
              {track.type === 'local' && <span className="text-[8px] bg-genna-gold/20 px-1 rounded ml-1">USER</span>}
            </button>
          ))}
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left text-[11px] p-2.5 rounded-xl flex items-center transition-all hover:bg-white/10 text-genna-gold border border-dashed border-genna-gold/30 mt-2 bg-genna-gold/5"
          >
            <Plus size={14} className="mr-3" />
            <span className="font-bold">Upload Audio...</span>
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="audio/*" 
          className="hidden" 
        />
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-2xl relative overflow-hidden group ${isPlaying ? 'bg-genna-dark border-genna-gold text-genna-gold' : 'bg-black border-white/10 text-gray-500'}`}
      >
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-full h-full border-4 border-genna-gold rounded-full animate-ping"></div>
          </div>
        )}
        <div className={`transition-transform duration-500 ${isPlaying ? 'scale-110 rotate-[360deg]' : 'scale-100'}`}>
          {currentTrack.type === 'youtube' ? <Youtube size={24} /> : <Music size={24} />}
        </div>
      </button>
    </div>
  );
};