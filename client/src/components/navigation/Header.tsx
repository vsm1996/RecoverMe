import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { HeartPulse } from 'lucide-react';

const Header: React.FC = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-[#64B5F6] mr-2">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-nunito font-bold">RecoverME</h1>
        </div>
        <nav>
          <button 
            className="md:hidden p-2 rounded-full hover:bg-[#F5F5F5]" 
            onClick={toggleMenu}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-[#424242]"
            >
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={location === '/' ? "text-[#64B5F6] font-semibold" : "text-[#424242] hover:text-[#64B5F6] transition-colors"}
            >
              Dashboard
            </Link>
            <Link 
              href="/plan" 
              className={location === '/plan' ? "text-[#64B5F6] font-semibold" : "text-[#424242] hover:text-[#64B5F6] transition-colors"}
            >
              My Plan
            </Link>
            <Link 
              href="/progress" 
              className={location === '/progress' ? "text-[#64B5F6] font-semibold" : "text-[#424242] hover:text-[#64B5F6] transition-colors"}
            >
              Progress
            </Link>
            <Link 
              href="/profile" 
              className={location === '/profile' ? "text-[#64B5F6] font-semibold" : "text-[#424242] hover:text-[#64B5F6] transition-colors"}
            >
              Settings
            </Link>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          </div>
        </nav>
      </div>
      {/* Mobile menu dropdown */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-white border-t`}>
        <div className="container mx-auto px-4 py-2">
          <Link 
            href="/" 
            className={location === '/' ? "block py-2 text-[#64B5F6] font-semibold" : "block py-2 text-[#424242]"}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/plan" 
            className={location === '/plan' ? "block py-2 text-[#64B5F6] font-semibold" : "block py-2 text-[#424242]"}
            onClick={() => setMobileMenuOpen(false)}
          >
            My Plan
          </Link>
          <Link 
            href="/progress" 
            className={location === '/progress' ? "block py-2 text-[#64B5F6] font-semibold" : "block py-2 text-[#424242]"}
            onClick={() => setMobileMenuOpen(false)}
          >
            Progress
          </Link>
          <Link 
            href="/profile" 
            className={location === '/profile' ? "block py-2 text-[#64B5F6] font-semibold" : "block py-2 text-[#424242]"}
            onClick={() => setMobileMenuOpen(false)}
          >
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
