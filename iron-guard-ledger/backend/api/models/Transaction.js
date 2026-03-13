import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true 
  },
  type: { 
    type: String, 
    enum: ['sale', 'purchase', 'payment', 'return', 'adjustment'], 
    required: true,
    index: true 
  },
  accountType: { 
    type: String, 
    enum: ['customer', 'supplier'], 
    required: true 
  },
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true 
  },
  accountName: { 
    type: String, 
    required: true 
  },
  customerId: { 
    type: String, 
    default: null,
    index: true 
  },
  supplierId: { 
    type: String, 
    default: null,
    index: true 
  },
  items: [
    {
      itemId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item' 
      },
      itemName: String,
      quantity: Number,
      unit: String,
      price: Number,
      total: Number
    }
  ],
  totalAmount: { 
    type: Number, 
    default: 0 
  },
  previousBalance: { 
    type: Number, 
    default: 0 
  },
  finalBalance: { 
    type: Number, 
    default: 0 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  paymentType: { 
    type: String, 
    enum: ['Cash', 'Bank', 'EasyPaisa', 'Cheque'], 
    default: 'Cash' 
  },
  paymentTransactionId: { 
    type: String, 
    default: '' 
  },
  isDeleted: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Comprehensive indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ accountId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ customerId: 1 });
transactionSchema.index({ supplierId: 1 });
transactionSchema.index({ 'items.itemId': 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ isDeleted: 1 });

export default mongoose.model('Transaction', transactionSchema);