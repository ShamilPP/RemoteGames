export interface PongState {
  ball: { x: number; y: number; vx: number; vy: number };
  paddles: Array<{ y: number; score: number }>;
  width: number;
  height: number;
}

export class PongEngine {
  private state: PongState;
  private paddleSpeed = 0.02;
  private ballSpeed = 0.015;

  constructor(width: number = 1, height: number = 1) {
    this.state = {
      ball: { x: 0.5, y: 0.5, vx: this.ballSpeed, vy: this.ballSpeed },
      paddles: [
        { y: 0.5, score: 0 },
        { y: 0.5, score: 0 },
      ],
      width,
      height,
    };
  }

  getState(): PongState {
    return { ...this.state };
  }

  update(inputs: Array<{ controllerId: string; input: any }>): PongState {
    // Process inputs
    for (const { controllerId, input } of inputs) {
      const playerIndex = this.getPlayerIndex(controllerId);
      if (playerIndex === -1) continue;

      if (input.e === 'btnDown' || input.e === 'move') {
        if (input.b === 'up' || input.y < 0) {
          this.state.paddles[playerIndex].y = Math.max(0.1, this.state.paddles[playerIndex].y - this.paddleSpeed);
        } else if (input.b === 'down' || input.y > 0) {
          this.state.paddles[playerIndex].y = Math.min(0.9, this.state.paddles[playerIndex].y + this.paddleSpeed);
        }
      }
    }

    // Update ball position
    this.state.ball.x += this.state.ball.vx;
    this.state.ball.y += this.state.ball.vy;

    // Ball collision with top/bottom walls
    if (this.state.ball.y <= 0 || this.state.ball.y >= this.state.height) {
      this.state.ball.vy = -this.state.ball.vy;
      this.state.ball.y = Math.max(0, Math.min(this.state.height, this.state.ball.y));
    }

    // Ball collision with paddles
    const paddleWidth = 0.02;
    const paddleHeight = 0.15;

    // Left paddle (player 0)
    if (
      this.state.ball.x <= paddleWidth &&
      this.state.ball.y >= this.state.paddles[0].y - paddleHeight / 2 &&
      this.state.ball.y <= this.state.paddles[0].y + paddleHeight / 2 &&
      this.state.ball.vx < 0
    ) {
      this.state.ball.vx = -this.state.ball.vx;
      this.state.ball.x = paddleWidth;
    }

    // Right paddle (player 1)
    if (
      this.state.ball.x >= this.state.width - paddleWidth &&
      this.state.ball.y >= this.state.paddles[1].y - paddleHeight / 2 &&
      this.state.ball.y <= this.state.paddles[1].y + paddleHeight / 2 &&
      this.state.ball.vx > 0
    ) {
      this.state.ball.vx = -this.state.ball.vx;
      this.state.ball.x = this.state.width - paddleWidth;
    }

    // Score points
    if (this.state.ball.x < 0) {
      this.state.paddles[1].score++;
      this.resetBall();
    } else if (this.state.ball.x > this.state.width) {
      this.state.paddles[0].score++;
      this.resetBall();
    }

    return this.getState();
  }

  private resetBall() {
    this.state.ball = {
      x: 0.5,
      y: 0.5,
      vx: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
      vy: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
    };
  }

  private getPlayerIndex(controllerId: string): number {
    // This should map controllerId to player index
    // For now, return 0 or 1 based on some logic
    // In production, maintain a mapping
    return controllerId ? 0 : 1; // Simplified
  }

  setPlayerMapping(mapping: Map<string, number>) {
    (this as any).playerMapping = mapping;
  }
}

