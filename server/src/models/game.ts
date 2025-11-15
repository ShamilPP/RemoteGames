import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
  _id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  assets: string[];
  rules: string;
  description?: string;
}

const GameSchema = new Schema<IGame>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    minPlayers: { type: Number, required: true },
    maxPlayers: { type: Number, required: true },
    assets: [String],
    rules: { type: String, required: true },
    description: String,
  },
  { _id: true }
);

export const Game = mongoose.model<IGame>('Game', GameSchema);

