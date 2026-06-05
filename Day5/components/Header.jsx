import React from "react";

const Header = () => {
  const h1Style = {
    display: 'flex',
    alignItems: 'center',
    height: '70px',
    margin: '0',
    padding: '0',
    color: '#1E293B',
    fontSize: '20px',
    textAlign: 'left',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    fontFamily: 'Arial, sans-serif',
  };

  return (
    <header>
      <div style={h1Style}>
      <h1 style={{ color: 'white', padding :'20px' } }>MERN Day 4</h1>
      </div>
    </header>
  );
};

export default Header;
