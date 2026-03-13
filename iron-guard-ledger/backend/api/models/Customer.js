import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerId: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true 
  }, // CUS-0001, CUS-0002, etc.
  name: { 
    type: String, 
    required: true, 
    index: true 
  },
  phone: { 
    type: String, 
    default: '',
    index: true 
  },
  address: { 
    type: String, 
    default: '' 
  },
  currentBalance: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  totalOrders: { 
    type: Number, 
    default: 0 
  },
  totalPayments: { 
    type: Number, 
    default: 0 
  },
  totalReturns: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for fast queries
customerSchema.index({ customerId: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ createdAt: -1 });

export default mongoose.model('Customer', customerSchema);