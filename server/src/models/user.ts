import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  createdAt: Date;
  lastActive: Date;
  auth: {
    type: 'anon' | 'email';
    pwdHash?: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    auth: {
      type: {
        type: String,
        enum: ['anon', 'email'],
        required: true,
      },
      pwdHash: String,
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ lastActive: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);

