import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketConfig extends Document {
  guildId: string;
  enabled: boolean;
  panelChannelId: string;
  categoryId: string;
  transcriptChannelId: string;
  logChannelId: string;
  supportRoleIds: string[];
  buttonLabel: string;
  buttonEmoji: string;
  panelTitle: string;
  panelDescription: string;
  panelColor: string;
  ticketMessage: string;
  closeOnLeave: boolean;
  autoDeleteSeconds: number;
  maxOpenPerUser: number;
  requireTopic: boolean;
  updatedAt: Date;
}

const TicketConfigSchema = new Schema<ITicketConfig>(
  {
    guildId:              { type: String, required: true, unique: true, index: true },
    enabled:              { type: Boolean, default: false },
    panelChannelId:       { type: String, default: '' },
    categoryId:           { type: String, default: '' },
    transcriptChannelId:  { type: String, default: '' },
    logChannelId:         { type: String, default: '' },
    supportRoleIds:       { type: [String], default: [] },
    buttonLabel:          { type: String, default: 'Open Ticket' },
    buttonEmoji:          { type: String, default: '🎫' },
    panelTitle:           { type: String, default: 'Support Tickets' },
    panelDescription:     { type: String, default: 'Click the button below to open a support ticket.' },
    panelColor:           { type: String, default: '#7c3aed' },
    ticketMessage:        { type: String, default: 'Hello {mention}! Support will be with you shortly.' },
    closeOnLeave:         { type: Boolean, default: false },
    autoDeleteSeconds:    { type: Number, default: 0 },
    maxOpenPerUser:       { type: Number, default: 1 },
    requireTopic:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.TicketConfig ||
  mongoose.model<ITicketConfig>('TicketConfig', TicketConfigSchema);
