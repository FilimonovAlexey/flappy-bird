// src/components/Pipe.js
import React from 'react';
import pipeTopImage from '../assets/pipe-top.png';
import pipeBottomImage from '../assets/pipe-bottom.png';

const Pipe = ({ left, pipeTopHeight, pipeBottomHeight, playableHeight }) => {
  const pipeWidth = 80;

  const pipeTopStyle = {
    position: 'absolute',
    top: 0,
    left: `${left}px`,
    width: `${pipeWidth}px`,
    height: `${pipeTopHeight}px`,
    backgroundImage: `url(${pipeTopImage})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    transform: 'rotate(180deg)',
  };

  const pipeBottomStyle = {
    position: 'absolute',
    top: `${playableHeight - pipeBottomHeight}px`,
    left: `${left}px`,
    width: `${pipeWidth}px`,
    height: `${pipeBottomHeight}px`,
    backgroundImage: `url(${pipeBottomImage})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <>
      <div style={pipeTopStyle}></div>
      <div style={pipeBottomStyle}></div>
    </>
  );
};

export default Pipe;