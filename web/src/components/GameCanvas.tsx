import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import '../styles/GameCanvas.css';

interface GameCanvasProps {
  gameId: string;
  gameState: any;
  socket: Socket | null;
}

export default function GameCanvas({ gameId, gameState, socket }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Game loop
    const render = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render based on game type
      if (gameState) {
        switch (gameId) {
          case 'pong':
            renderPong(ctx, canvas, gameState);
            break;
          case 'duel_racer':
            renderDuelRacer(ctx, canvas, gameState);
            break;
          case 'reaction_blitz':
            renderReactionBlitz(ctx, canvas, gameState);
            break;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameId, gameState]);

  return (
    <div className="game-canvas-container">
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}

function renderPong(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: any) {
  const { ball, paddles } = state;
  const width = canvas.width;
  const height = canvas.height;

  // Draw paddles
  ctx.fillStyle = '#4a9eff';
  const paddleWidth = 10;
  const paddleHeight = height * 0.15;

  // Left paddle
  if (paddles[0]) {
    ctx.fillRect(
      20,
      paddles[0].y * height - paddleHeight / 2,
      paddleWidth,
      paddleHeight
    );
  }

  // Right paddle
  if (paddles[1]) {
    ctx.fillRect(
      width - 30,
      paddles[1].y * height - paddleHeight / 2,
      paddleWidth,
      paddleHeight
    );
  }

  // Draw ball
  ctx.fillStyle = '#fff';
  const ballSize = 10;
  ctx.fillRect(
    ball.x * width - ballSize / 2,
    ball.y * height - ballSize / 2,
    ballSize,
    ballSize
  );

  // Draw scores
  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  if (paddles[0]) {
    ctx.fillText(paddles[0].score.toString(), width / 4, 60);
  }
  if (paddles[1]) {
    ctx.fillText(paddles[1].score.toString(), (3 * width) / 4, 60);
  }
}

function renderDuelRacer(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: any) {
  const { cars, obstacles } = state;
  const width = canvas.width;
  const height = canvas.height;
  const laneWidth = width / 2;

  // Draw road
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, width, height);

  // Draw lane dividers
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw obstacles
  ctx.fillStyle = '#ff4444';
  if (obstacles) {
    obstacles.forEach((obs: any) => {
      ctx.fillRect(
        obs.lane * laneWidth + 20,
        obs.y * height,
        laneWidth - 40,
        30
      );
    });
  }

  // Draw cars
  if (cars) {
    cars.forEach((car: any, index: number) => {
      ctx.fillStyle = index === 0 ? '#4a9eff' : '#8b5cf6';
      ctx.fillRect(
        car.lane * laneWidth + 20,
        car.y * height,
        laneWidth - 40,
        40
      );
    });
  }
}

function renderReactionBlitz(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: any) {
  const { targets } = state;
  const width = canvas.width;
  const height = canvas.height;

  // Draw targets
  ctx.fillStyle = '#4a9eff';
  if (targets) {
    targets.forEach((target: any) => {
      const x = target.x * width;
      const y = target.y * height;
      const size = 60;

      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();
    });
  }
}

