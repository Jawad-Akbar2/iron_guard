import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true }, // kg, ton, liter, piece, custom
  purchaseRate: { type: Number, default: 0 },
  saleRate: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Item', itemSchema);