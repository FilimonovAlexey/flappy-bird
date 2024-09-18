// src/components/Bird.js
import React, { useState, useEffect } from 'react';
import birdMidFlap from '../assets/yellowbird-midflap.png';
import birdDownFlap from '../assets/yellowbird-downflap.png';
import birdUpFlap from '../assets/yellowbird-upflap.png';

const Bird = ({ position, velocity, gameHasStarted, hasCollided }) => {
  const [flapState, setFlapState] = useState(0); // Состояние для анимации

  useEffect(() => {
    const flapInterval = setInterval(() => {
      setFlapState((prev) => (prev + 1) % 3); // Переключаем анимацию
    }, 200);

    return () => clearInterval(flapInterval);
  }, []);

  const birdImages = [birdMidFlap, birdDownFlap, birdUpFlap];
  const currentBirdImage = birdImages[flapState];

  // Рассчитываем поворот птички
  const rotation = hasCollided
    ? 90
    : gameHasStarted
    ? Math.max(Math.min((velocity / 10) * 60, 25), -25)
    : 0; // Птичка смотрит прямо до начала игры

  const birdStyle = {
    position: 'absolute',
    top: `${position}px`,
    left: '20%',
    width: '50px',
    height: '35px',
    backgroundImage: `url(${currentBirdImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    transform: `rotate(${rotation}deg)`, // Поворот в зависимости от состояния игры и скорости
    zIndex: 2,
  };

  return <div style={birdStyle}></div>;
};

export default Bird;
