import React from 'react';

const Header = () => {
  return (
    <header className="bg-white p-4 shadow-md sticky top-0 z-40">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-600">Glucosense</h1>
        
        {/* --- LOGO DITAMBAHKAN DI SINI --- */}
        <img 
          src="/Glucosense.png" 
          alt="Glucosense Logo" 
          className="h-10 w-auto" 
        />

      </div>
    </header>
  );
};

export default Header;