import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Item from './models/Item.js';
import Customer from './models/Customer.js';
import Supplier from './models/Supplier.js';
import Transaction from './models/Transaction.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // ===== CREATE ADMIN USERS =====
    const adminExists = await User.findOne({ email: 'owner@ironguard.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('owner123456', 10);
      await User.create({
        name: 'Admin Owner',
        email: 'owner@ironguard.com',
        password: hashedPassword,
        role: 'Owner',
        lastLogin: new Date()
      });
      console.log('✅ Admin user created: owner@ironguard.com / owner123456');
    }

    const managerExists = await User.findOne({ email: 'manager@ironguard.com' });
    if (!managerExists) {
      const hashedPassword = await bcrypt.hash('manager123456', 10);
      await User.create({
        name: 'Manager User',
        email: 'manager@ironguard.com',
        password: hashedPassword,
        role: 'Manager',
        lastLogin: new Date()
      });
      console.log('✅ Manager user created: manager@ironguard.com / manager123456');
    }

    const admin = await User.findOne({ email: 'owner@ironguard.com' });

    // ===== CREATE ITEMS =====
    const itemsData = [
      { name: 'Steel Rod', unit: 'ton', purchaseRate: 90000, saleRate: 120000, currentStock: 100 },
      { name: 'Cement Bag', unit: 'bag', purchaseRate: 400, saleRate: 500, currentStock: 500 },
      { name: 'Iron Wire', unit: 'kg', purchaseRate: 150, saleRate: 200, currentStock: 1000 },
      { name: 'Wooden Plank', unit: 'piece', purchaseRate: 2000, saleRate: 3000, currentStock: 200 },
      { name: 'Paint Gallon', unit: 'liter', purchaseRate: 2000, saleRate: 2500, currentStock: 50 },
      { name: 'Bricks', unit: 'piece', purchaseRate: 15, saleRate: 20, currentStock: 10000 }
    ];

    const createdItems = [];
    for (const itemData of itemsData) {
      const exists = await Item.findOne({ name: itemData.name });
      if (!exists) {
        const item = await Item.create(itemData);
        createdItems.push(item);
        console.log(`✅ Item created: ${itemData.name}`);
      } else {
        createdItems.push(exists);
      }
    }

    // ===== CREATE CUSTOMERS =====
    const customersData = [
      { name: 'Ahmed Steel Mills', phone: '03001234567', address: 'Karachi, Pakistan' },
      { name: 'Golden Construction Co.', phone: '03009876543', address: 'Lahore, Pakistan' },
      { name: 'BuildRight Enterprises', phone: '03215551234', address: 'Islamabad, Pakistan' },
      { name: 'Metropolitan Trading', phone: '03355559876', address: 'Rawalpindi, Pakistan' },
      { name: 'Elite Hardware Store', phone: '03005559999', address: 'Multan, Pakistan' }
    ];

    const createdCustomers = [];
    for (let i = 0; i < customersData.length; i++) {
      const exists = await Customer.findOne({ name: customersData[i].name });
      if (!exists) {
        const customer = await Customer.create({
          customerId: `CUS-${String(i + 1).padStart(4, '0')}`,
          ...customersData[i],
          currentBalance: 0,
          status: 'active',
          totalOrders: 0,
          totalPayments: 0,
          totalReturns: 0
        });
        createdCustomers.push(customer);
        console.log(`✅ Customer created: ${customer.customerId} - ${customer.name}`);
      } else {
        createdCustomers.push(exists);
      }
    }

    // ===== CREATE SUPPLIERS =====
    const suppliersData = [
      { name: 'National Steel Mills', phone: '03401234567', address: 'Karachi Industrial Zone' },
      { name: 'Premier Cement Company', phone: '03429876543', address: 'Wah Cantt' },
      { name: 'Global Traders Ltd', phone: '03215551234', address: 'Port Qasim' },
      { name: 'Direct Import Co.', phone: '03355559876', address: 'Karachi Port' }
    ];

    const createdSuppliers = [];
    for (let i = 0; i < suppliersData.length; i++) {
      const exists = await Supplier.findOne({ name: suppliersData[i].name });
      if (!exists) {
        const supplier = await Supplier.create({
          supplierId: `SUP-${String(i + 1).padStart(4, '0')}`,
          ...suppliersData[i],
          currentBalance: 0,
          status: 'active',
          totalOrders: 0,
          totalPayments: 0,
          totalReturns: 0
        });
        createdSuppliers.push(supplier);
        console.log(`✅ Supplier created: ${supplier.supplierId} - ${supplier.name}`);
      } else {
        createdSuppliers.push(exists);
      }
    }

    // ===== CREATE SAMPLE TRANSACTIONS =====
    const existingTransactions = await Transaction.countDocuments();
    if (existingTransactions === 0) {
      const sampleTransactions = [
        {
          transactionId: 'TXN-0001',
          type: 'sale',
          accountType: 'customer',
          accountId: createdCustomers[0]._id,
          accountName: createdCustomers[0].name,
          customerId: createdCustomers[0].customerId,
          items: [
            {
              itemId: createdItems[0]._id,
              itemName: 'Steel Rod',
              quantity: 10,
              unit: 'ton',
              price: 120000,
              total: 1200000
            }
          ],
          totalAmount: 1200000,
          previousBalance: 0,
          finalBalance: 1200000,
          notes: 'Initial order for construction project',
          paymentType: 'Bank',
          paymentTransactionId: 'CHK-001',
          createdBy: admin._id,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          transactionId: 'TXN-0002',
          type: 'payment',
          accountType: 'customer',
          accountId: createdCustomers[0]._id,
          accountName: createdCustomers[0].name,
          customerId: createdCustomers[0].customerId,
          items: [],
          totalAmount: 600000,
          previousBalance: 1200000,
          finalBalance: 600000,
          notes: 'Partial payment received',
          paymentType: 'Bank',
          paymentTransactionId: 'DEP-001',
          createdBy: admin._id,
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        },
        {
          transactionId: 'TXN-0003',
          type: 'purchase',
          accountType: 'supplier',
          accountId: createdSuppliers[0]._id,
          accountName: createdSuppliers[0].name,
          supplierId: createdSuppliers[0].supplierId,
          items: [
            {
              itemId: createdItems[0]._id,
              itemName: 'Steel Rod',
              quantity: 25,
              unit: 'ton',
              price: 90000,
              total: 2250000
            }
          ],
          totalAmount: 2250000,
          previousBalance: 0,
          finalBalance: 2250000,
          notes: 'Bulk purchase for inventory',
          paymentType: 'Cash',
          paymentTransactionId: '',
          createdBy: admin._id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          transactionId: 'TXN-0004',
          type: 'sale',
          accountType: 'customer',
          accountId: createdCustomers[1]._id,
          accountName: createdCustomers[1].name,
          customerId: createdCustomers[1].customerId,
          items: [
            {
              itemId: createdItems[1]._id,
              itemName: 'Cement Bag',
              quantity: 100,
              unit: 'bag',
              price: 500,
              total: 50000
            },
            {
              itemId: createdItems[2]._id,
              itemName: 'Iron Wire',
              quantity: 50,
              unit: 'kg',
              price: 200,
              total: 10000
            }
          ],
          totalAmount: 60000,
          previousBalance: 0,
          finalBalance: 60000,
          notes: 'Building materials shipment',
          paymentType: 'Cash',
          paymentTransactionId: '',
          createdBy: admin._id,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          transactionId: 'TXN-0005',
          type: 'return',
          accountType: 'customer',
          accountId: createdCustomers[1]._id,
          accountName: createdCustomers[1].name,
          customerId: createdCustomers[1].customerId,
          items: [
            {
              itemId: createdItems[1]._id,
              itemName: 'Cement Bag',
              quantity: -10,
              unit: 'bag',
              price: 500,
              total: -5000
            }
          ],
          totalAmount: -5000,
          previousBalance: 60000,
          finalBalance: 55000,
          notes: 'Return of defective bags',
          paymentType: 'Cash',
          paymentTransactionId: '',
          createdBy: admin._id,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];

      for (const txn of sampleTransactions) {
        await Transaction.create(txn);
      }

      // Update balances
      await Customer.findByIdAndUpdate(createdCustomers[0]._id, {
        currentBalance: 600000,
        totalOrders: 1200000,
        totalPayments: 600000
      });
      await Customer.findByIdAndUpdate(createdCustomers[1]._id, {
        currentBalance: 55000,
        totalOrders: 60000,
        totalReturns: 5000
      });
      await Supplier.findByIdAndUpdate(createdSuppliers[0]._id, {
        currentBalance: 2250000,
        totalOrders: 2250000
      });

      console.log('✅ Sample transactions created');
    }

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Owner: owner@ironguard.com / owner123456');
    console.log('   Manager: manager@ironguard.com / manager123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();