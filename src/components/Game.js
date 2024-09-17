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
  // Состояния игры
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [backgroundType, setBackgroundType] = useState('day');

  // Рефы для доступа к актуальным состояниям внутри интервалов
  const birdPositionRef = useRef(birdPosition);
  const pipesRef = useRef(pipes);
  const scoreRef = useRef(score);

  // Обновление рефов при изменении состояний
  useEffect(() => {
    birdPositionRef.current = birdPosition;
  }, [birdPosition]);

  useEffect(() => {
    pipesRef.current = pipes;
  }, [pipes]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Константы для размеров и поведения игры
  const gameAreaWidth = 400; // Фиксированная ширина игрового поля
  const baseHeight = 112; // Высота base.png
  const gameAreaHeight = 600; // Общая высота игрового поля
  const playableHeight = gameAreaHeight - baseHeight; // Высота игрового пространства

  const gravity = 3; // Сила гравитации
  const jumpHeight = -60; // Высота прыжка
  const pipeWidth = 80; // Ширина трубы
  const pipeGap = 170; // Зазор между верхней и нижней трубами
  const pipeSpeed = 4; // Скорость движения труб (пикселей за кадр)
  const pipeInterval = 2500; // Интервал появления труб (мс)

  // Рефы для интервалов
  const pipeTimerRef = useRef(null);
  const gameLoopRef = useRef(null);

  // Обработчик прыжка
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

  // Обработчик нажатия клавиш
  const handleKeyDown = (e) => {
    if (e.code === 'Space') {
      handleJump();
    }
  };

  // Добавление слушателей событий при монтировании
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleJump);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleJump);
    };
  }, [isGameOver]);

  // Игровой цикл и генерация труб
  useEffect(() => {
    if (gameHasStarted && !isGameOver) {
      // Интервал для появления труб
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
            left: gameAreaWidth, // Начальная позиция трубы справа
            pipeTopHeight,
            pipeBottomHeight,
            scored: false, // Флаг для счета очков
          },
        ]);
      }, pipeInterval);

      // Интервал игрового цикла
      gameLoopRef.current = setInterval(() => {
        // Обновление позиции птички (гравитация)
        setBirdPosition((prev) => prev + gravity);

        // Движение труб влево
        setPipes((prevPipes) =>
          prevPipes
            .map((pipe) => ({
              ...pipe,
              left: pipe.left - pipeSpeed,
            }))
            .filter((pipe) => pipe.left + pipeWidth > 0) // Удаление труб за пределами экрана
        );

        // Проверка столкновений и обновление счета
        const birdLeft = 80; // Фиксированное значение в пикселях
        const birdRight = birdLeft + 50; // Ширина птички
        const birdTop = birdPositionRef.current;
        const birdBottom = birdTop + 35; // Высота птички

        pipesRef.current.forEach((pipe) => {
          const pipeLeft = pipe.left;
          const pipeRight = pipe.left + pipeWidth;

          // Проверка столкновений с трубами
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

          // Обновление счета при прохождении трубы
          if (!pipe.scored && pipeLeft + pipeWidth < birdLeft) {
            pipe.scored = true;
            const newScore = scoreRef.current + 1;
            setScore(newScore);

            // Смена фона каждые 10 очков
            if (newScore % 10 === 0) {
              setBackgroundType((prevType) =>
                prevType === 'day' ? 'night' : 'day'
              );
            }
          }
        });

        // Проверка выхода птички за границы игрового поля
        if (
          birdPositionRef.current > playableHeight - 35 || // Высота птички
          birdPositionRef.current < 0
        ) {
          setIsGameOver(true);
          clearInterval(pipeTimerRef.current);
          clearInterval(gameLoopRef.current);
        }
      }, 30);

      // Очистка интервалов при размонтировании или окончании игры
      return () => {
        clearInterval(pipeTimerRef.current);
        clearInterval(gameLoopRef.current);
      };
    }
  }, [gameHasStarted, isGameOver]);

  // Сброс игры
  const resetGame = () => {
    setGameHasStarted(false);
    setIsGameOver(false);
    setBirdPosition(250);
    setPipes([]);
    setScore(0);
    setBackgroundType('day');
  };

  // Стили

  const gameAreaStyle = {
    position: 'relative',
    width: `${gameAreaWidth}px`, // Фиксированная ширина игрового поля
    height: `${gameAreaHeight}px`, // Общая высота (игровая зона + база)
    overflow: 'hidden',
    margin: '0 auto',
    backgroundImage: `url(${
      backgroundType === 'day' ? backgroundDay : backgroundNight
    })`,
    backgroundSize: 'cover',
    backgroundPosition: 'top',
  };

  const baseStyle = {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    width: '100%',
    height: `${baseHeight}px`,
    backgroundImage: `url(${baseImage})`,
    backgroundSize: 'auto 100%', // Изменено для корректного масштабирования
    backgroundRepeat: 'repeat-x',
    zIndex: 1, // Под птичкой и трубами
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

        {/* База */}
        <div style={baseStyle}></div>
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
