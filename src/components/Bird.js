// src/components/Bird.js
import React, { useState, useEffect } from 'react';
import birdMidFlap from '../assets/yellowbird-midflap.png';
import birdDownFlap from '../assets/yellowbird-downflap.png';
import birdUpFlap from '../assets/yellowbird-upflap.png';

const Bird = ({
  position,
  velocity,
  gameHasStarted,
  hasCollided,
  style = {},
}) => {
  const [flapState, setFlapState] = useState(0); // Состояние анимации

  useEffect(() => {
    if (!hasCollided) {
      // Анимация крыльев, если нет столкновения
      const flapInterval = setInterval(() => {
        setFlapState((prev) => (prev + 1) % 3); // Переключение кадров
      }, 200);

      return () => clearInterval(flapInterval);
    }
  }, [hasCollided]);

  const birdImages = [birdMidFlap, birdDownFlap, birdUpFlap];
  const currentBirdImage = birdImages[flapState];

  // Рассчитываем угол поворота птички
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
    transform: `rotate(${rotation}deg)`,
    zIndex: 2,
    ...style, // Позволяет переопределять стили через пропсы
  };

  return <div style={birdStyle}></div>;
};

export default Bird;
