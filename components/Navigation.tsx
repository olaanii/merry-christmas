import React from 'react';
import { Home, Gamepad2, Trophy, BookOpen } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'HOME', icon: Home, label: 'Home' },
    { id: 'GAMES', icon: Gamepad2, label: 'Games' },
    { id: 'LEADERBOARD', icon: Trophy, label: 'Rank' },
    { id: 'LEARN', icon: BookOpen, label: 'Learn' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-genna-dark/95 backdrop-blur-md border-t border-genna-gold/20 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${
                isActive ? 'text-genna-gold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <item.icon size={24} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="text-[10px] mt-1 font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;