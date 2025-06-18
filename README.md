# Flappy Bird React Game

This repository contains a browser implementation of the classic **Flappy Bird** built with [Create React App](https://create-react-app.dev/). The game is optimized for both desktop browsers and Telegram Web App embedding.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
   Node.js 18+ is recommended.

2. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000/`.

3. **Run tests** (optional)
   ```bash
   npm test -- --watchAll=false
   ```

4. **Create a production build**
   ```bash
   npm run build
   ```
   The optimized output will be placed in the `build/` directory.

## Project Structure

```
flappy-bird/
├── public/          # Static files and HTML template
├── src/             # Application source code
│   ├── assets/      # Images and sound effects
│   ├── components/  # React components (game logic)
│   ├── App.js       # Root component
│   └── index.js     # Entry point
├── package.json     # Project metadata and scripts
└── README.md        # This file
```

### Main Components

- **Game** (`src/components/Game.js`)
  Handles the main game loop, collisions, score and background switching.
- **Bird** (`src/components/Bird.js`)
  Renders the player character and wing animation.
- **Pipe** (`src/components/Pipe.js`)
  Displays the obstacles that scroll across the screen.
- **Score** (`src/components/Score.js`)
  Shows the numeric score using sprite images.

## Dependencies

- `react` and `react-dom` – core UI library.
- `react-scripts` – tooling from Create React App.
- `howler` – audio playback of game effects.
- `@testing-library/react` and related packages – testing utilities.
- `web-vitals` – optional performance metrics.

All runtime dependencies are listed in `package.json`.

## Customization

### Changing Game Rules

Key gameplay parameters are defined in `src/components/Game.js`. You can adjust values such as:

- **gravity** – how fast the bird falls.
- **jumpHeight** – the strength of each flap.
- **pipeGap** and **pipeSpeed** – obstacle spacing and movement speed.

Editing these constants allows you to tweak difficulty or experiment with new rules.

### Adding New Content or Questions

The current project does not ship with a question system. To introduce your own questions or mini‑games, add new React components in `src/components/` and invoke them from `Game.js` when needed. All assets (images and sounds) can be placed in `src/assets/` and imported just like the existing files.

## License

This project is provided for educational purposes without a specified license.
