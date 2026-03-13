import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  supplierId: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true 
  }, // SUP-0001, SUP-0002, etc.
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
supplierSchema.index({ supplierId: 1 });
supplierSchema.index({ name: 1 });
supplierSchema.index({ phone: 1 });
supplierSchema.index({ createdAt: -1 });

export default mongoose.model('Supplier', supplierSchema);