// src/components/Bird.js
import React from 'react';
import birdImage from '../assets/bird.png';

const Bird = ({ position }) => {
  const birdStyle = {
    position: 'absolute',
    top: `${position}px`,
    left: '20%', // Или используйте фиксированное значение в пикселях, например, '80px'
    width: '50px',
    height: '35px',
    backgroundImage: `url(${birdImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    zIndex: 2,
  };

  return <div style={birdStyle}></div>;
};

export default Bird;
