export interface ReactionBlitzState {
  targets: Array<{ id: string; x: number; y: number; appearedAt: number }>;
  scores: number[];
  round: number;
  activeTarget?: string;
  gameOver: boolean;
}

export class ReactionBlitzEngine {
  private state: ReactionBlitzState;
  private targetLifetime = 2000; // 2 seconds
  private roundDuration = 30000; // 30 seconds
  private gameStartTime = Date.now();

  constructor(playerCount: number) {
    this.state = {
      targets: [],
      scores: new Array(playerCount).fill(0),
      round: 1,
      gameOver: false,
    };
  }

  getState(): ReactionBlitzState {
    return { ...this.state };
  }

  update(inputs: Array<{ controllerId: string; input: any }>): ReactionBlitzState {
    const now = Date.now();
    const elapsed = now - this.gameStartTime;

    // Check game over
    if (elapsed >= this.roundDuration) {
      this.state.gameOver = true;
      return this.getState();
    }

    // Spawn new target randomly
    if (Math.random() < 0.01 && !this.state.activeTarget) {
      const targetId = `target_${Date.now()}`;
      this.state.targets.push({
        id: targetId,
        x: Math.random(),
        y: Math.random(),
        appearedAt: now,
      });
      this.state.activeTarget = targetId;
    }

    // Process inputs
    for (const { controllerId, input } of inputs) {
      const playerIndex = this.getPlayerIndex(controllerId);
      if (playerIndex === -1 || playerIndex >= this.state.scores.length) continue;

      if (input.e === 'btnDown' && this.state.activeTarget) {
        // Player hit button - check if target still active
        const target = this.state.targets.find((t) => t.id === this.state.activeTarget);
        if (target && now - target.appearedAt < this.targetLifetime) {
          this.state.scores[playerIndex]++;
          this.state.targets = this.state.targets.filter((t) => t.id !== this.state.activeTarget);
          this.state.activeTarget = undefined;
        }
      }
    }

    // Remove expired targets
    this.state.targets = this.state.targets.filter((target) => {
      if (now - target.appearedAt > this.targetLifetime) {
        if (this.state.activeTarget === target.id) {
          this.state.activeTarget = undefined;
        }
        return false;
      }
      return true;
    });

    return this.getState();
  }

  private getPlayerIndex(controllerId: string): number {
    // Simplified mapping
    return 0;
  }
}

