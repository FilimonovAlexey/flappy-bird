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
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [backgroundType, setBackgroundType] = useState('day');

  const birdPositionRef = useRef(birdPosition);
  const pipesRef = useRef(pipes);
  const scoreRef = useRef(score);

  const baseHeight = 112; // Высота base.png
  const gameAreaHeight = 600; // Общая высота игрового поля
  const playableHeight = gameAreaHeight - baseHeight; // Высота игрового пространства
  const gameAreaWidth = 400;

  const gravity = 3;
  const jumpHeight = -60;
  const pipeWidth = 80;
  const pipeGap = 170;
  const pipeSpeed = 4;
  const pipeInterval = 2500;

  const pipeTimerRef = useRef(null);
  const gameLoopRef = useRef(null);

  // Обновление рефов при изменении состояния
  useEffect(() => {
    birdPositionRef.current = birdPosition;
  }, [birdPosition]);

  useEffect(() => {
    pipesRef.current = pipes;
  }, [pipes]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Обработка прыжка
  const handleJump = () => {
    if (!gameHasStarted) {
      setGameHasStarted(true);
    }
    if (isGameOver) {
      resetGame();
    } else {
      setBirdPosition((prev) => prev + jumpHeight);
    }
  };

  // Обработчик клавиатуры
  const handleKeyDown = (e) => {
    if (e.code === 'Space') {
      handleJump();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleJump);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleJump);
    };
  }, [isGameOver]);

  useEffect(() => {
    if (gameHasStarted && !isGameOver) {
      // Добавление новых труб
      pipeTimerRef.current = setInterval(() => {
        const minPipeHeight = 50;
        const maxPipeHeight = playableHeight - pipeGap - minPipeHeight;

        const pipeTopHeight =
          Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
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

      // Игровой цикл
      gameLoopRef.current = setInterval(() => {
        // Обновление позиции птички
        setBirdPosition((prev) => prev + gravity);

        // Движение труб влево
        setPipes((prevPipes) =>
          prevPipes
            .map((pipe) => ({ ...pipe, left: pipe.left - pipeSpeed }))
            .filter((pipe) => pipe.left + pipeWidth > 0)
        );

        // Проверка столкновений и обновление счета
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
            // Игра окончена
            setIsGameOver(true);
            clearInterval(pipeTimerRef.current);
            clearInterval(gameLoopRef.current);
          }

          // Обновление счета
          if (!pipe.scored && pipeLeft + pipeWidth < birdLeft) {
            pipe.scored = true;
            const newScore = scoreRef.current + 1;
            setScore(newScore);

            // Смена фона каждые 10 очков
            if (newScore % 10 === 0) {
              setBackgroundType((prevType) => (prevType === 'day' ? 'night' : 'day'));
            }
          }
        });

        // Проверка выхода за границы
        if (
          birdPositionRef.current > playableHeight - 35 ||
          birdPositionRef.current < 0
        ) {
          setIsGameOver(true);
          clearInterval(pipeTimerRef.current);
          clearInterval(gameLoopRef.current);
        }
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
      <h1>Flappy Bird на React</h1>
      <div style={gameAreaStyle}>
        {!isGameOver && <Score score={score} style={scoreStyle} />}
        <Bird position={birdPosition} />
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

        {/* Добавляем Base */}
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
