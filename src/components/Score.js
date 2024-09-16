// src/components/Score.js
import React from 'react';
import zero from '../assets/numbers/0.png';
import one from '../assets/numbers/1.png';
import two from '../assets/numbers/2.png';
import three from '../assets/numbers/3.png';
import four from '../assets/numbers/4.png';
import five from '../assets/numbers/5.png';
import six from '../assets/numbers/6.png';
import seven from '../assets/numbers/7.png';
import eight from '../assets/numbers/8.png';
import nine from '../assets/numbers/9.png';

const numberImages = {
  '0': zero,
  '1': one,
  '2': two,
  '3': three,
  '4': four,
  '5': five,
  '6': six,
  '7': seven,
  '8': eight,
  '9': nine,
};

const Score = ({ score, style }) => {
  const scoreString = score.toString();

  return (
    <div style={{ display: 'flex', ...style }}>
      {scoreString.split('').map((digit, index) => (
        <img
          key={index}
          src={numberImages[digit]}
          alt={digit}
          style={{ width: '24px', height: '36px' }}
        />
      ))}
    </div>
  );
};

export default Score;
