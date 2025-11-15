export interface DuelRacerState {
  cars: Array<{ lane: number; y: number; speed: number; boost: number }>;
  obstacles: Array<{ lane: number; y: number }>;
  finishLine: number;
  gameOver: boolean;
  winner?: number;
}

export class DuelRacerEngine {
  private state: DuelRacerState;
  private laneCount = 2;
  private obstacleSpawnRate = 0.02;

  constructor() {
    this.state = {
      cars: [
        { lane: 0, y: 0, speed: 0.01, boost: 0 },
        { lane: 1, y: 0, speed: 0.01, boost: 0 },
      ],
      obstacles: [],
      finishLine: 1.0,
      gameOver: false,
    };
  }

  getState(): DuelRacerState {
    return { ...this.state };
  }

  update(inputs: Array<{ controllerId: string; input: any }>): DuelRacerState {
    if (this.state.gameOver) {
      return this.getState();
    }

    // Process inputs
    for (const { controllerId, input } of inputs) {
      const playerIndex = this.getPlayerIndex(controllerId);
      if (playerIndex === -1 || playerIndex >= this.state.cars.length) continue;

      if (input.e === 'btnDown') {
        if (input.b === 'left') {
          this.state.cars[playerIndex].lane = Math.max(0, this.state.cars[playerIndex].lane - 1);
        } else if (input.b === 'right') {
          this.state.cars[playerIndex].lane = Math.min(this.laneCount - 1, this.state.cars[playerIndex].lane + 1);
        } else if (input.b === 'boost') {
          this.state.cars[playerIndex].boost = 1.5;
        }
      }
    }

    // Update car positions
    for (let i = 0; i < this.state.cars.length; i++) {
      const car = this.state.cars[i];
      const speed = car.speed * (car.boost > 0 ? 1.5 : 1);
      car.y += speed;
      if (car.boost > 0) {
        car.boost -= 0.1;
        if (car.boost < 0) car.boost = 0;
      }

      // Check finish line
      if (car.y >= this.state.finishLine && !this.state.gameOver) {
        this.state.gameOver = true;
        this.state.winner = i;
      }
    }

    // Spawn obstacles
    if (Math.random() < this.obstacleSpawnRate) {
      this.state.obstacles.push({
        lane: Math.floor(Math.random() * this.laneCount),
        y: 0,
      });
    }

    // Update obstacles
    this.state.obstacles = this.state.obstacles
      .map((obs) => ({ ...obs, y: obs.y + 0.015 }))
      .filter((obs) => obs.y < 1.2);

    // Check collisions
    for (let i = 0; i < this.state.cars.length; i++) {
      const car = this.state.cars[i];
      for (const obs of this.state.obstacles) {
        if (
          obs.lane === car.lane &&
          Math.abs(obs.y - car.y) < 0.1
        ) {
          // Collision - slow down car
          car.speed = Math.max(0.005, car.speed * 0.5);
          this.state.obstacles = this.state.obstacles.filter((o) => o !== obs);
        }
      }
    }

    return this.getState();
  }

  private getPlayerIndex(controllerId: string): number {
    // Simplified mapping
    return controllerId ? 0 : 1;
  }
}

