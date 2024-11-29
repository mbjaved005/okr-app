import mongoose, { Schema, Document } from 'mongoose';

interface OKRDocument extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: string;
  vertical: string;
  owner: string[];
  userId: mongoose.Types.ObjectId;
}

const OKRSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  category: { type: String, required: true },
  vertical: { type: String, required: true },
  owner: { type: [String], required: true },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

const OKR = mongoose.models.OKR || mongoose.model<OKRDocument>('OKR', OKRSchema);

export default OKR;
