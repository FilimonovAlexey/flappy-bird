// src/components/Bird.js
import React from 'react';
import birdImage from '../assets/bird.png';

const Bird = ({ position }) => {
  const birdStyle = {
    position: 'absolute',
    top: `${position}px`,
    left: '20%',
    width: '50px',
    height: '35px',
    backgroundImage: `url(${birdImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    transition: 'top 0.1s',
  };

  return <div style={birdStyle}></div>;
};

export default Bird;