// src/components/Bird.js
import React, { useState, useEffect } from 'react';
import birdMidFlap from '../assets/yellowbird-midflap.png';
import birdDownFlap from '../assets/yellowbird-downflap.png';
import birdUpFlap from '../assets/yellowbird-upflap.png';

const Bird = ({ position, velocity }) => {
  const [flapState, setFlapState] = useState(0); // Состояние для анимации

  useEffect(() => {
    const flapInterval = setInterval(() => {
      setFlapState((prev) => (prev + 1) % 3); // Переключаем анимацию
    }, 200);

    return () => clearInterval(flapInterval);
  }, []);

  const birdImages = [birdMidFlap, birdDownFlap, birdUpFlap];
  const currentBirdImage = birdImages[flapState];

  const birdStyle = {
    position: 'absolute',
    top: `${position}px`,
    left: '20%',
    width: '50px',
    height: '35px',
    backgroundImage: `url(${currentBirdImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    transform: `rotate(${velocity < 0 ? -20 : 20}deg)`, // Поворот в зависимости от скорости
  };

  return <div style={birdStyle}></div>;
};

export default Bird;
