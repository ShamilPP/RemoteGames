import { Match, IMatch, IPlayerResult } from '../models/match';
import { Leaderboard } from '../models/leaderboard';
import mongoose from 'mongoose';

export class MatchService {
  async createMatch(
    roomId: string,
    gameId: string,
    players: IPlayerResult[],
    winner?: string,
    durationMs: number = 0,
    eventsLog?: string
  ): Promise<IMatch> {
    const match = new Match({
      roomId: new mongoose.Types.ObjectId(roomId),
      gameId,
      players,
      winner: winner ? new mongoose.Types.ObjectId(winner) : undefined,
      durationMs,
      eventsLog,
    });

    await match.save();
    await this.updateLeaderboard(gameId, players, winner);
    return match;
  }

  async getMatch(matchId: string): Promise<IMatch | null> {
    return Match.findById(matchId).populate('players.userId', 'name');
  }

  async getUserMatches(userId: string, limit: number = 50): Promise<IMatch[]> {
    return Match.find({ 'players.userId': new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('players.userId', 'name')
      .populate('winner', 'name');
  }

  async getLeaderboard(gameId: string, limit: number = 100) {
    let leaderboard = await Leaderboard.findOne({ gameId });

    if (!leaderboard) {
      // Create initial leaderboard from match history
      leaderboard = new Leaderboard({
        gameId,
        entries: [],
      });
      await leaderboard.save();
    }

    // Return top entries sorted by score
    const sortedEntries = leaderboard.entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      gameId,
      entries: sortedEntries,
      updatedAt: leaderboard.updatedAt,
    };
  }

  private async updateLeaderboard(
    gameId: string,
    players: IPlayerResult[],
    winner?: string
  ): Promise<void> {
    let leaderboard = await Leaderboard.findOne({ gameId });

    if (!leaderboard) {
      leaderboard = new Leaderboard({
        gameId,
        entries: [],
      });
    }

    for (const player of players) {
      const existingEntry = leaderboard.entries.find(
        (e) => e.userId.toString() === player.userId.toString()
      );

      if (existingEntry) {
        existingEntry.score += player.score;
        existingEntry.gamesPlayed += 1;
        if (winner && existingEntry.userId.toString() === winner) {
          existingEntry.wins += 1;
        }
      } else {
        const user = await mongoose.model('User').findById(player.userId);
        leaderboard.entries.push({
          userId: player.userId,
          name: player.name || user?.name || 'Unknown',
          score: player.score,
          wins: winner && player.userId.toString() === winner ? 1 : 0,
          gamesPlayed: 1,
        });
      }
    }

    leaderboard.updatedAt = new Date();
    await leaderboard.save();
  }
}

export const matchService = new MatchService();

