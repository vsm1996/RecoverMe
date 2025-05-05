import React from 'react';
import Header from '@/components/navigation/Header';
import MobileNavigation from '@/components/navigation/MobileNavigation';

interface DefaultLayoutProps {
  children: React.ReactNode;
  isMobile: boolean;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children, isMobile }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className={`flex-1 container mx-auto px-4 py-6 ${isMobile ? 'pb-20' : ''}`}>
        {children}
      </main>
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default DefaultLayout;
