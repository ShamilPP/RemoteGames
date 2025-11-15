import { Game, IGame } from '../models/game';

export class GameService {
  async getAllGames(): Promise<IGame[]> {
    return Game.find().sort({ name: 1 });
  }

  async getGame(gameId: string): Promise<IGame | null> {
    return Game.findById(gameId);
  }

  async initializeGames(): Promise<void> {
    const games = await Game.countDocuments();
    if (games > 0) {
      return; // Already initialized
    }

    const defaultGames: Partial<IGame>[] = [
      {
        _id: 'pong',
        name: 'Pong',
        minPlayers: 1,
        maxPlayers: 2,
        assets: ['paddle', 'ball', 'bg'],
        rules: 'Move paddles to hit the ball. First to miss loses a point.',
        description: 'Classic Pong between two players or vs bot',
      },
      {
        _id: 'duel_racer',
        name: 'Duel Racer',
        minPlayers: 2,
        maxPlayers: 2,
        assets: ['car1', 'car2', 'obstacle', 'road', 'bg'],
        rules: 'Tap to switch lanes, avoid obstacles. First to finish wins!',
        description: 'Top-down racing game with lane switching',
      },
      {
        _id: 'reaction_blitz',
        name: 'Reaction Blitz',
        minPlayers: 1,
        maxPlayers: 4,
        assets: ['target', 'bg'],
        rules: 'Hit the button when the target appears. Fastest wins!',
        description: 'Quick reaction time game for 1-4 players',
      },
    ];

    await Game.insertMany(defaultGames);
  }
}

export const gameService = new GameService();

