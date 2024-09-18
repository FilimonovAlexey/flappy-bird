import React, { useState, useEffect, useRef, useCallback } from 'react';
import Bird from './Bird';
import Pipe from './Pipe';
import Score from './Score';
import backgroundDay from '../assets/background-day.png';
import backgroundNight from '../assets/background-night.png';
import baseImage from '../assets/base.png';
import gameOverImage from '../assets/gameover.png';

// Импорт звуковых файлов
import wingSound from '../assets/songs/wing.wav';
import swooshSound from '../assets/songs/swoosh.wav';
import pointSound from '../assets/songs/point.wav';
import hitSound from '../assets/songs/hit.wav';
import dieSound from '../assets/songs/die.wav';

// Создание объектов Audio
const wingAudio = new Audio(wingSound);
const swooshAudio = new Audio(swooshSound);
const pointAudio = new Audio(pointSound);
const hitAudio = new Audio(hitSound);
const dieAudio = new Audio(dieSound);

const Game = () => {
  // Используем состояние для ширины и высоты игрового поля
  const [gameAreaWidth, setGameAreaWidth] = useState(window.innerWidth);
  const [gameAreaHeight, setGameAreaHeight] = useState(window.innerHeight);
  const [birdPosition, setBirdPosition] = useState(window.innerHeight / 2);
  const [velocity, setVelocity] = useState(0);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasCollided, setHasCollided] = useState(false);
  const [backgroundType, setBackgroundType] = useState('day');

  const birdPositionRef = useRef(birdPosition);
  const pipesRef = useRef(pipes);
  const scoreRef = useRef(score);

  const baseHeight = 112;
  const gravity = 0.8;
  const jumpHeight = -10;
  const pipeWidth = 80;
  const pipeGap = 170;
  const pipeSpeed = 4;
  const pipeInterval = 2500;

  const pipeTimerRef = useRef(null);
  const playableHeightRef = useRef(gameAreaHeight - baseHeight);

  // Обновляем размеры игрового поля при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      setGameAreaWidth(window.innerWidth);
      setGameAreaHeight(window.innerHeight);
      playableHeightRef.current = window.innerHeight - baseHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Инициализация Telegram Web App
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand(); // Разворачивает приложение на весь экран
    }
  }, []);

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
  const handleJump = useCallback(() => {
    if (isGameOver || !gameHasStarted) {
      return; // Не позволяем прыгать
    }
    setVelocity(jumpHeight);
    wingAudio.currentTime = 0;
    wingAudio.play(); // Звук прыжка птички
  }, [isGameOver, gameHasStarted]);

  // Начало игры
  const startGame = () => {
    setGameHasStarted(true);
    setIsGameOver(false);
    setHasCollided(false);
    setBirdPosition(gameAreaHeight / 2);
    setVelocity(jumpHeight);
    setPipes([]);
    setScore(0);
    setBackgroundType('day');
    wingAudio.currentTime = 0;
    wingAudio.play(); // Звук прыжка птички при старте
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
  }, [handleJump]);

  // Основная игровая логика с использованием requestAnimationFrame
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const gameLoop = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setVelocity((prevVelocity) => {
        const newVelocity = Math.min(prevVelocity + gravity, 10);
        setBirdPosition((prevPosition) => {
          let newPosition = prevPosition + newVelocity;

          // Ограничиваем позицию птицы, чтобы она не упала ниже базы
          if (newPosition >= playableHeightRef.current - 35) {
            newPosition = playableHeightRef.current - 35;
            if (!isGameOver) {
              setIsGameOver(true);
              dieAudio.currentTime = 0;
              dieAudio.play(); // Звук падения птички
              clearInterval(pipeTimerRef.current);
            }
          }

          // Проверка столкновения с верхом экрана
          if (newPosition < 0) {
            newPosition = 0;
          }

          return newPosition;
        });
        return newVelocity;
      });

      // Обновление труб и проверка столкновений
      setPipes((prevPipes) =>
        prevPipes
          .map((pipe) => ({
            ...pipe,
            left: hasCollided ? pipe.left : pipe.left - pipeSpeed,
          }))
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

        // Проверка столкновений с трубами
        if (
          birdRight > pipeLeft &&
          birdLeft < pipeRight &&
          (birdTop < pipe.pipeTopHeight ||
            birdBottom > playableHeightRef.current - pipe.pipeBottomHeight)
        ) {
          if (!hasCollided) {
            setHasCollided(true);
            hitAudio.currentTime = 0;
            hitAudio.play(); // Звук столкновения
          }
        }

        // Обновление счёта
        if (!pipe.scored && pipeLeft + pipeWidth < birdLeft) {
          pipe.scored = true;
          const newScore = scoreRef.current + 1;
          setScore(newScore);
          pointAudio.currentTime = 0;
          pointAudio.play(); // Звук получения очка

          if (newScore % 10 === 0) {
            setBackgroundType((prev) => (prev === 'day' ? 'night' : 'day'));
          }
        }
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (gameHasStarted) {
      animationFrameId = requestAnimationFrame(gameLoop);

      // Спавн труб
      pipeTimerRef.current = setInterval(() => {
        const minPipeHeight = 50;
        const maxPipeHeight =
          playableHeightRef.current - pipeGap - minPipeHeight;

        const pipeTopHeight =
          Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) +
          minPipeHeight;
        const pipeBottomHeight =
          playableHeightRef.current - pipeGap - pipeTopHeight;

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
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(pipeTimerRef.current);
    };
  }, [gameHasStarted, hasCollided, isGameOver, gameAreaWidth]);

  const resetGame = () => {
    startGame();
  };

  // Обновленные стили для полного экрана
  const gameAreaStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
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
    <div style={{ textAlign: 'center' }}>
      <div style={gameAreaStyle}>
        {!isGameOver && gameHasStarted && (
          <Score score={score} style={scoreStyle} />
        )}
        <Bird
          position={birdPosition}
          velocity={velocity}
          gameHasStarted={gameHasStarted}
          hasCollided={hasCollided}
        />
        {pipes.map((pipe, index) => (
          <Pipe
            key={index}
            left={pipe.left}
            pipeTopHeight={pipe.pipeTopHeight}
            pipeBottomHeight={pipe.pipeBottomHeight}
            playableHeight={playableHeightRef.current}
          />
        ))}
        {/* Перемещаем кнопку внутрь игрового поля и изменяем ее стиль */}
        {!gameHasStarted && !isGameOver && (
          <button
            onClick={() => {
              swooshAudio.currentTime = 0;
              swooshAudio.play(); // Звук нажатия кнопки
              startGame();
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              zIndex: 3,
            }}
          >
            Начать игру
          </button>
        )}
        {isGameOver && (
          <div style={gameOverStyle}>
            <img
              src={gameOverImage}
              alt="Game Over"
              style={{ width: '80%' }}
            />
            <Score score={score} style={{ marginTop: '20px' }} />
            <button
              onClick={() => {
                swooshAudio.currentTime = 0;
                swooshAudio.play(); // Звук нажатия кнопки
                resetGame();
              }}
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
    </div>
  );
};

export default Game;
