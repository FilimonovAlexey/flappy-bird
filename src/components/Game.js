// src/components/Game.js
import React, { useState, useEffect, useRef } from 'react';
import Bird from './Bird';
import Pipe from './Pipe';
import Score from './Score';
import backgroundDay from '../assets/background-day.png';
import backgroundNight from '../assets/background-night.png';
import baseImage from '../assets/base.png';
import gameOverImage from '../assets/gameover.png';

const Game = () => {
  const [birdPosition, setBirdPosition] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [backgroundType, setBackgroundType] = useState('day');

  const birdPositionRef = useRef(birdPosition);
  const pipesRef = useRef(pipes);
  const scoreRef = useRef(score);

  const baseHeight = 112;
  const gameAreaHeight = 600;
  const gameAreaWidth = 400;
  const playableHeight = gameAreaHeight - baseHeight;
  const gravity = 0.8;
  const jumpHeight = -10;
  const pipeWidth = 80;
  const pipeGap = 170;
  const pipeSpeed = 4;
  const pipeInterval = 2500;

  const pipeTimerRef = useRef(null);
  const gameLoopRef = useRef(null);

  // Актуализируем позиции птицы и труб
  useEffect(() => {
    birdPositionRef.current = birdPosition;
  }, [birdPosition]);

  useEffect(() => {
    pipesRef.current = pipes;
  }, [pipes]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Управление прыжком
  const handleJump = () => {
    if (!gameHasStarted) {
      setGameHasStarted(true);
    }
    if (isGameOver) {
      resetGame();
    } else {
      setVelocity(jumpHeight);
    }
  };

  // Слушаем события прыжка
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleJump);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleJump);
    };
  }, [isGameOver]);

  // Основная игровая логика
  useEffect(() => {
    if (gameHasStarted && !isGameOver) {
      pipeTimerRef.current = setInterval(() => {
        const minPipeHeight = 50;
        const maxPipeHeight = playableHeight - pipeGap - minPipeHeight;

        const pipeTopHeight =
          Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) +
          minPipeHeight;
        const pipeBottomHeight = playableHeight - pipeGap - pipeTopHeight;

        setPipes((prevPipes) => [
          ...prevPipes,
          {
            left: gameAreaWidth,
            pipeTopHeight,
            pipeBottomHeight,
            scored: false,
          },
        ]);
      }, pipeInterval);

      gameLoopRef.current = setInterval(() => {
        setVelocity((prevVelocity) => {
          const newVelocity = Math.min(prevVelocity + gravity, 10);
          setBirdPosition((prevPosition) => {
            const newPosition = Math.max(prevPosition + newVelocity, 0);

            // Проверка выхода за границы
            if (
              newPosition > playableHeight - 35 ||
              newPosition < 0
            ) {
              setIsGameOver(true);
              clearInterval(pipeTimerRef.current);
              clearInterval(gameLoopRef.current);
            }

            return newPosition;
          });
          return newVelocity;
        });

        // Обновление труб и проверка столкновений
        setPipes((prevPipes) =>
          prevPipes
            .map((pipe) => ({ ...pipe, left: pipe.left - pipeSpeed }))
            .filter((pipe) => pipe.left + pipeWidth > 0)
        );

        // Проверка столкновений и обновление счёта
        const birdLeft = gameAreaWidth * 0.2;
        const birdRight = birdLeft + 50;
        const birdTop = birdPositionRef.current;
        const birdBottom = birdTop + 35;

        pipesRef.current.forEach((pipe) => {
          const pipeLeft = pipe.left;
          const pipeRight = pipe.left + pipeWidth;

          // Проверка столкновений
          if (
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            (birdTop < pipe.pipeTopHeight ||
              birdBottom > playableHeight - pipe.pipeBottomHeight)
          ) {
            setIsGameOver(true);
            clearInterval(pipeTimerRef.current);
            clearInterval(gameLoopRef.current);
          }

          // Обновление счёта
          if (!pipe.scored && pipeLeft + pipeWidth < birdLeft) {
            pipe.scored = true;
            const newScore = scoreRef.current + 1;
            setScore(newScore);

            if (newScore % 10 === 0) {
              setBackgroundType((prev) => (prev === 'day' ? 'night' : 'day'));
            }
          }
        });
      }, 30);

      return () => {
        clearInterval(pipeTimerRef.current);
        clearInterval(gameLoopRef.current);
      };
    }
  }, [gameHasStarted, isGameOver]);

  const resetGame = () => {
    setGameHasStarted(false);
    setIsGameOver(false);
    setBirdPosition(250);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setBackgroundType('day');
  };

  const gameAreaStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    height: `${gameAreaHeight}px`,
    overflow: 'hidden',
    margin: '0 auto',
    backgroundImage: `url(${
      backgroundType === 'day' ? backgroundDay : backgroundNight
    })`,
    backgroundSize: 'cover',
    backgroundPosition: 'top',
  };

  const scoreStyle = {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    zIndex: 2,
  };

  const gameOverStyle = {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <div style={gameAreaStyle}>
        {!isGameOver && <Score score={score} style={scoreStyle} />}
        <Bird position={birdPosition} velocity={velocity} />
        {pipes.map((pipe, index) => (
          <Pipe
            key={index}
            left={pipe.left}
            pipeTopHeight={pipe.pipeTopHeight}
            pipeBottomHeight={pipe.pipeBottomHeight}
            playableHeight={playableHeight}
          />
        ))}
        {isGameOver && (
          <div style={gameOverStyle}>
            <img src={gameOverImage} alt="Game Over" style={{ width: '80%' }} />
            <Score score={score} style={{ marginTop: '20px' }} />
            <button
              onClick={resetGame}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Повторить игру
            </button>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${baseHeight}px`,
            backgroundImage: `url(${baseImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'repeat-x',
            zIndex: 1,
          }}
        ></div>
      </div>
      {!gameHasStarted && !isGameOver && (
        <button
          onClick={handleJump}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Начать игру
        </button>
      )}
    </div>
  );
};

export default Game;
