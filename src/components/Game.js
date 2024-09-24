// src/components/Game.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import Bird from './Bird';
import Pipe from './Pipe';
import Score from './Score';
import backgroundDay from '../assets/background-day.png';
import backgroundNight from '../assets/background-night.png';
import baseImage from '../assets/base.png';
import gameOverImage from '../assets/gameover.png';

// Импорт новых изображений
import labelFlappyBird from '../assets/label_flappy_bird.png';
import startButtonSprite from '../assets/Start-button-sprite.png';
import messageImage from '../assets/message.png';
import buttonPause from '../assets/button_pause.png';
import buttonResume from '../assets/button_resume.png';

// Импорт звуковых файлов в форматах OGG и WAV
import wingSoundOgg from '../assets/songs/wing.ogg';
import wingSoundWav from '../assets/songs/wing.wav';
import swooshSoundOgg from '../assets/songs/swoosh.ogg';
import swooshSoundWav from '../assets/songs/swoosh.wav';
import pointSoundOgg from '../assets/songs/point.ogg';
import pointSoundWav from '../assets/songs/point.wav';
import hitSoundOgg from '../assets/songs/hit.ogg';
import hitSoundWav from '../assets/songs/hit.wav';
import dieSoundOgg from '../assets/songs/die.ogg';
import dieSoundWav from '../assets/songs/die.wav';

// Создание объектов Howl с использованием OGG и WAV форматов
const sounds = {
  wing: new Howl({
    src: [wingSoundOgg, wingSoundWav],
    preload: true,
  }),
  swoosh: new Howl({
    src: [swooshSoundOgg, swooshSoundWav],
    preload: true,
  }),
  point: new Howl({
    src: [pointSoundOgg, pointSoundWav],
    preload: true,
  }),
  hit: new Howl({
    src: [hitSoundOgg, hitSoundWav],
    preload: true,
  }),
  die: new Howl({
    src: [dieSoundOgg, dieSoundWav],
    preload: true,
  }),
};

const Game = () => {
  // Состояния игры
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
  const [isPaused, setIsPaused] = useState(false);
  const [showMessage, setShowMessage] = useState(false); // Добавлено

  // Рефы для актуальных значений
  const isPausedRef = useRef(isPaused);
  const birdPositionRef = useRef(birdPosition);
  const pipesRef = useRef(pipes);
  const scoreRef = useRef(score);
  const gameAreaHeightRef = useRef(gameAreaHeight);
  const isGameOverRef = useRef(isGameOver);
  const hasPlayedDieSoundRef = useRef(false);

  const baseHeight = 112;
  const gravity = 0.7;
  const jumpHeight = -8;
  const pipeWidth = 80;
  const pipeGap = 170;
  const pipeSpeed = 4;
  const pipeInterval = 2500;

  const pipeTimerRef = useRef(null);
  const playableHeightRef = useRef(gameAreaHeight - baseHeight);

  // Обновляем ref при изменении состояний
  useEffect(() => {
    isPausedRef.current = isPaused;
    birdPositionRef.current = birdPosition;
    pipesRef.current = pipes;
    scoreRef.current = score;
    gameAreaHeightRef.current = gameAreaHeight;
    isGameOverRef.current = isGameOver;
    playableHeightRef.current = gameAreaHeight - baseHeight;
  }, [isPaused, birdPosition, pipes, score, gameAreaHeight, isGameOver]);

  // Обновляем размеры игрового поля при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      setGameAreaWidth(window.innerWidth);
      setGameAreaHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Инициализация Telegram Web App
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand(); // Разворачивает приложение на весь экран
    }
  }, []);

  // Предзагрузка звуков и освобождение ресурсов
  useEffect(() => {
    Object.values(sounds).forEach((sound) => sound.load());
    return () => {
      Howler.unload();
    };
  }, []);

  // Управление прыжком
  const handleJump = useCallback(() => {
    if (isGameOver || !gameHasStarted || isPausedRef.current) {
      return;
    }
    setVelocity(jumpHeight);
    sounds.wing.play();
  }, [isGameOver, gameHasStarted]);

  // Начало игры
  const startGame = useCallback(() => {
    setGameHasStarted(true);
    setIsGameOver(false);
    setHasCollided(false);
    setIsPaused(false);
    setShowMessage(false); // Добавлено
    setBirdPosition(gameAreaHeightRef.current / 2);
    setVelocity(jumpHeight);
    setPipes([]);
    setScore(0);
    setBackgroundType('day');
    hasPlayedDieSoundRef.current = false;
    sounds.wing.play();
  }, []);

  // Обработчик клика
  const handleClick = useCallback(() => {
    if (showMessage) {
      startGame();
    } else if (gameHasStarted && !isGameOver) {
      handleJump();
    }
  }, [showMessage, gameHasStarted, isGameOver, startGame, handleJump]);

  // Слушаем события прыжка
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        if (showMessage) {
          startGame();
        } else if (gameHasStarted && !isGameOver) {
          handleJump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMessage, gameHasStarted, isGameOver, handleJump, startGame]);

  // Основная игровая логика
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const gameLoop = (currentTime) => {
      if (!isPausedRef.current && !isGameOverRef.current) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        setVelocity((prevVelocity) => {
          const newVelocity = Math.min(prevVelocity + gravity, 10);
          setBirdPosition((prevPosition) => {
            let newPosition = prevPosition + newVelocity;

            // Ограничиваем позицию птицы, чтобы она не упала ниже базы
            if (newPosition >= playableHeightRef.current - 35) {
              newPosition = playableHeightRef.current - 35;
              if (!isGameOverRef.current) {
                setIsGameOver(true);
                clearInterval(pipeTimerRef.current);
              }
              // Проигрываем звук die, если он еще не был проигран
              if (!hasPlayedDieSoundRef.current) {
                sounds.die.play();
                hasPlayedDieSoundRef.current = true;
              }
              return newPosition;
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
        setPipes((prevPipes) => {
          const birdLeft = gameAreaWidth * 0.2;
          const birdRight = birdLeft + 50;
          const birdTop = birdPositionRef.current;
          const birdBottom = birdTop + 35;

          const updatedPipes = prevPipes
            .map((pipe) => {
              const newLeft = hasCollided ? pipe.left : pipe.left - pipeSpeed;
              const pipeLeft = newLeft;
              const pipeRight = newLeft + pipeWidth;

              let scored = pipe.scored;

              // Проверка столкновений с трубами
              if (
                birdRight > pipeLeft &&
                birdLeft < pipeRight &&
                (birdTop < pipe.pipeTopHeight ||
                  birdBottom >
                    playableHeightRef.current - pipe.pipeBottomHeight)
              ) {
                if (!hasCollided) {
                  setHasCollided(true);
                  sounds.hit.play();
                  setIsGameOver(true);
                  clearInterval(pipeTimerRef.current);
                }
              }

              // Обновление счёта и смена фона
              if (!scored && pipeLeft + pipeWidth < birdLeft) {
                scored = true;
                const newScore = scoreRef.current + 1;
                setScore(newScore);
                sounds.point.play();

                if (newScore % 10 === 0) {
                  setBackgroundType((prev) =>
                    prev === 'day' ? 'night' : 'day'
                  );
                }
              }

              return {
                ...pipe,
                left: newLeft,
                scored,
              };
            })
            .filter((pipe) => pipe.left + pipeWidth > 0);

          return updatedPipes;
        });
      } else if (isGameOverRef.current) {
        // Если игра окончена, но птица еще не достигла земли после столкновения с трубой
        setVelocity((prevVelocity) => {
          const newVelocity = Math.min(prevVelocity + gravity, 10);
          setBirdPosition((prevPosition) => {
            let newPosition = prevPosition + newVelocity;

            if (newPosition >= playableHeightRef.current - 35) {
              newPosition = playableHeightRef.current - 35;
              // Проигрываем звук die, если он еще не был проигран
              if (!hasPlayedDieSoundRef.current) {
                sounds.die.play();
                hasPlayedDieSoundRef.current = true;
              }
              return newPosition;
            }

            return newPosition;
          });
          return newVelocity;
        });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (gameHasStarted) {
      animationFrameId = requestAnimationFrame(gameLoop);

      // Спавн труб
      if (!isGameOver && !isPaused) {
        pipeTimerRef.current = setInterval(() => {
          if (isPausedRef.current || isGameOverRef.current) return;

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
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(pipeTimerRef.current);
    };
  }, [
    gameHasStarted,
    hasCollided,
    isGameOver,
    gameAreaWidth,
    isPaused,
    isGameOverRef,
  ]);

  const resetGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Обработчики событий
  const handlePauseClick = useCallback(() => {
    setIsPaused((prev) => !prev);
    sounds.swoosh.play();
  }, []);

  const handleStartClick = useCallback(() => {
    sounds.swoosh.play();
    setShowMessage(true); // Показываем message.png
  }, []);

  const handleResetClick = useCallback(() => {
    sounds.swoosh.play();
    resetGame();
  }, [resetGame]);

  // Стили игры
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

  const initialScreenStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const labelStyle = {
    width: '200%',
    maxWidth: '400px',
    marginTop: '20px',
    marginBottom: '20px',
  };

  const startButtonStyle = {
    width: '100px',
    cursor: 'pointer',
    marginBottom: '20px',
  };

  const pauseButtonStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    zIndex: 4,
  };

  // Стили для экрана с message.png
  const messageScreenStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 3,
  };

  const messageContentStyle = {
    position: 'relative', // Чтобы абсолютное позиционирование работало относительно этого контейнера
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const messageStyle = {
    width: '200px',
    maxWidth: '400px',
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={gameAreaStyle} onClick={handleClick}>
        {/* Кнопка паузы/возобновления */}
        {gameHasStarted && !isGameOver && (
          <img
            src={isPaused ? buttonResume : buttonPause}
            alt={isPaused ? 'Resume' : 'Pause'}
            style={pauseButtonStyle}
            onClick={handlePauseClick}
          />
        )}

        {/* Отображение счёта */}
        {!isGameOver && gameHasStarted && (
          <Score score={score} style={scoreStyle} />
        )}

        {/* Птичка */}
        {gameHasStarted && (
          <Bird
            position={birdPosition}
            velocity={velocity}
            gameHasStarted={gameHasStarted}
            hasCollided={hasCollided}
          />
        )}

        {/* Трубы */}
        {pipes.map((pipe, index) => (
          <Pipe
            key={pipe.left + index}
            left={pipe.left}
            pipeTopHeight={pipe.pipeTopHeight}
            pipeBottomHeight={pipe.pipeBottomHeight}
            playableHeight={playableHeightRef.current}
          />
        ))}

        {/* Начальный экран */}
        {!gameHasStarted && !isGameOver && !showMessage && (
          <div style={initialScreenStyle}>
            <Bird
              position={gameAreaHeight / 2 - 150}
              velocity={0}
              gameHasStarted={false}
              hasCollided={false}
            />
            <img
              src={labelFlappyBird}
              alt="Flappy Bird"
              style={labelStyle}
            />
            <img
              src={startButtonSprite}
              alt="Start"
              style={startButtonStyle}
              onClick={handleStartClick}
            />
          </div>
        )}

        {/* Экран с message.png */}
        {showMessage && !gameHasStarted && !isGameOver && (
          <div style={messageScreenStyle} onClick={startGame}>
            <div style={messageContentStyle}>
              <Bird
                position={0}
                velocity={0}
                gameHasStarted={false}
                hasCollided={false}
                style={{
                  position: 'absolute',
                  left: '-80px', // Отодвигаем птичку влево от message.png
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '50px',
                  height: '35px',
                }}
              />
              <img
                src={messageImage}
                alt="Message"
                style={messageStyle}
              />
            </div>
          </div>
        )}

        {/* Экран окончания игры */}
        {isGameOver && (
          <div style={gameOverStyle}>
            <img
              src={gameOverImage}
              alt="Game Over"
              style={{ width: '100%' }}
            />
            <Score score={score} style={{ marginTop: '20px' }} />
            <img
              src={startButtonSprite}
              alt="Повторить игру"
              style={{
                ...startButtonStyle,
                marginTop: '20px',
              }}
              onClick={handleResetClick}
            />
          </div>
        )}

        {/* База */}
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
