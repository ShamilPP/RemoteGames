import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer {
  userId: mongoose.Types.ObjectId;
  socketId: string;
  controllerId: string;
  isOwner: boolean;
  name?: string;
}

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: string; // UUID
  joinCode: string; // 4-digit
  ownerId: mongoose.Types.ObjectId;
  gameId: string;
  players: IPlayer[];
  status: 'waiting' | 'running' | 'finished';
  createdAt: Date;
  settings: Record<string, any>;
}

const PlayerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    socketId: { type: String, required: true },
    controllerId: { type: String, required: true },
    isOwner: { type: Boolean, default: false },
    name: String,
  },
  { _id: false }
);

const RoomSchema = new Schema<IRoom>(
  {
    roomId: { type: String, required: true, unique: true },
    joinCode: { type: String, required: true, unique: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: String, required: true },
    players: [PlayerSchema],
    status: {
      type: String,
      enum: ['waiting', 'running', 'finished'],
      default: 'waiting',
    },
    createdAt: { type: Date, default: Date.now },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

RoomSchema.index({ roomId: 1 });
RoomSchema.index({ joinCode: 1 });
RoomSchema.index({ ownerId: 1 });
RoomSchema.index({ status: 1 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);

