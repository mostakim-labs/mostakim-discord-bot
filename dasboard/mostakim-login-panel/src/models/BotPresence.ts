import mongoose, { Schema, Document } from 'mongoose';

export interface IBotPresence extends Document {
  status: 'online' | 'idle' | 'dnd' | 'invisible';
  activityType: number; // 0=Playing,1=Streaming,2=Listening,3=Watching,4=Custom
  activityName: string;
  streamingUrl: string;
  updatedAt: Date;
}

const BotPresenceSchema = new Schema<IBotPresence>(
  {
    status:       { type: String, default: 'online', enum: ['online','idle','dnd','invisible'] },
    activityType: { type: Number, default: 4 },
    activityName: { type: String, default: 'Enjoy Every Moment :)' },
    streamingUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.BotPresence ||
  mongoose.model<IBotPresence>('BotPresence', BotPresenceSchema);
