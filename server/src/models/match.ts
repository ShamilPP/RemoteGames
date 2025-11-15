import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayerResult {
  userId: mongoose.Types.ObjectId;
  score: number;
  name?: string;
}

export interface IMatch extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  gameId: string;
  players: IPlayerResult[];
  winner?: mongoose.Types.ObjectId;
  durationMs: number;
  eventsLog?: string; // Compressed summary
  createdAt: Date;
}

const PlayerResultSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, default: 0 },
    name: String,
  },
  { _id: false }
);

const MatchSchema = new Schema<IMatch>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    gameId: { type: String, required: true },
    players: [PlayerResultSchema],
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    durationMs: { type: Number, required: true },
    eventsLog: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MatchSchema.index({ roomId: 1 });
MatchSchema.index({ gameId: 1 });
MatchSchema.index({ createdAt: -1 });
MatchSchema.index({ 'players.userId': 1 });

export const Match = mongoose.model<IMatch>('Match', MatchSchema);

