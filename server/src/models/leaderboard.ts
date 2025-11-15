import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaderboardEntry {
  userId: mongoose.Types.ObjectId;
  name: string;
  score: number;
  wins: number;
  gamesPlayed: number;
}

export interface ILeaderboard extends Document {
  _id: mongoose.Types.ObjectId;
  gameId: string;
  entries: ILeaderboardEntry[];
  updatedAt: Date;
}

const LeaderboardEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    wins: { type: Number, required: true, default: 0 },
    gamesPlayed: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const LeaderboardSchema = new Schema<ILeaderboard>(
  {
    gameId: { type: String, required: true, unique: true },
    entries: [LeaderboardEntrySchema],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

LeaderboardSchema.index({ gameId: 1 });
LeaderboardSchema.index({ 'entries.userId': 1 });

export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);

