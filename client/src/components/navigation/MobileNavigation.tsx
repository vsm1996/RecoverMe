import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, ClipboardList, Plus, LineChart, User } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-white shadow-lg border-t fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around">
        <Link href="/" className="flex flex-col items-center py-2 px-4">
          <Home className={`h-6 w-6 ${location === '/' ? 'text-[#64B5F6]' : 'text-gray-500'}`} />
          <span className={`text-xs mt-1 ${location === '/' ? 'text-[#64B5F6]' : 'text-gray-500'}`}>Home</span>
        </Link>
        
        <Link href="/plan" className="flex flex-col items-center py-2 px-4">
          <ClipboardList className={`h-6 w-6 ${location === '/plan' ? 'text-[#64B5F6]' : 'text-gray-500'}`} />
          <span className={`text-xs mt-1 ${location === '/plan' ? 'text-[#64B5F6]' : 'text-gray-500'}`}>Plan</span>
        </Link>
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#64B5F6] flex items-center justify-center -mt-4 shadow-lg">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs mt-1 text-gray-500">Track</span>
        </div>
        
        <Link href="/progress" className="flex flex-col items-center py-2 px-4">
          <LineChart className={`h-6 w-6 ${location === '/progress' ? 'text-[#64B5F6]' : 'text-gray-500'}`} />
          <span className={`text-xs mt-1 ${location === '/progress' ? 'text-[#64B5F6]' : 'text-gray-500'}`}>Progress</span>
        </Link>
        
        <Link href="/profile" className="flex flex-col items-center py-2 px-4">
          <User className={`h-6 w-6 ${location === '/profile' ? 'text-[#64B5F6]' : 'text-gray-500'}`} />
          <span className={`text-xs mt-1 ${location === '/profile' ? 'text-[#64B5F6]' : 'text-gray-500'}`}>Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;
