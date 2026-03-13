import Transaction from '../models/Transaction.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';

export const getAggregatedReports = async (filters = {}) => {
  const pipeline = [];

  // Match stage - exclude deleted transactions
  const matchStage = { isDeleted: false };
  
  if (filters.startDate || filters.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = endDate;
    }
  }
  if (filters.entityId) matchStage.entityId = filters.entityId;
  if (filters.type) matchStage.type = filters.type;

  pipeline.push({ $match: matchStage });

  // Group stage
  const groupBy = filters.groupBy === 'entityId' ? '$entityId' : '$type';
  
  pipeline.push({
    $group: {
      _id: groupBy,
      totalSales: {
        $sum: {
          $cond: [{ $eq: ['$type', 'sale'] }, '$totalAmount', 0]
        }
      },
      totalPurchases: {
        $sum: {
          $cond: [{ $eq: ['$type', 'purchase'] }, '$totalAmount', 0]
        }
      },
      totalReturns: {
        $sum: {
          $cond: [{ $eq: ['$type', 'return'] }, '$totalAmount', 0]
        }
      },
      totalPayments: { $sum: '$paidAmount' },
      totalProfit: { $sum: '$profit' },
      totalDiscount: { $sum: '$discount' },
      transactionCount: { $sum: 1 }
    }
  });

  // Project stage
  pipeline.push({
    $project: {
      _id: 1,
      totalSales: 1,
      totalPurchases: 1,
      totalReturns: 1,
      totalPayments: 1,
      remainingBalance: {
        $subtract: [
          { $add: ['$totalSales', '$totalPurchases', { $multiply: ['$totalReturns', -1] }] },
          '$totalPayments'
        ]
      },
      totalProfit: 1,
      totalDiscount: 1,
      transactionCount: 1
    }
  });

  const results = await Transaction.aggregate(pipeline);
  return results;
};

export const getDailyReport = async (filters = {}) => {
  const startDate = filters.startDate ? new Date(filters.startDate) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  endDate.setHours(23, 59, 59, 999);

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        isDeleted: false,
        ...(filters.entityId && { entityId: filters.entityId })
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalSales: {
          $sum: {
            $cond: [{ $eq: ['$type', 'sale'] }, '$totalAmount', 0]
          }
        },
        totalPurchases: {
          $sum: {
            $cond: [{ $eq: ['$type', 'purchase'] }, '$totalAmount', 0]
          }
        },
        totalPayments: { $sum: '$paidAmount' },
        totalProfit: { $sum: '$profit' },
        transactionCount: { $sum: 1 }
      }
    },
    {
      $project: {
        date: '$_id',
        totalSales: 1,
        totalPurchases: 1,
        totalPayments: 1,
        totalProfit: 1,
        transactionCount: 1,
        _id: 0
      }
    },
    { $sort: { date: -1 } }
  ];

  const results = await Transaction.aggregate(pipeline);
  return results;
};

export const getMonthlyReport = async (filters = {}) => {
  const startDate = filters.startDate ? new Date(filters.startDate) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  endDate.setHours(23, 59, 59, 999);

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m', date: '$createdAt' }
        },
        totalSales: {
          $sum: {
            $cond: [{ $eq: ['$type', 'sale'] }, '$totalAmount', 0]
          }
        },
        totalPurchases: {
          $sum: {
            $cond: [{ $eq: ['$type', 'purchase'] }, '$totalAmount', 0]
          }
        },
        totalPayments: { $sum: '$paidAmount' },
        totalProfit: { $sum: '$profit' },
        transactionCount: { $sum: 1 }
      }
    },
    {
      $project: {
        month: '$_id',
        totalSales: 1,
        totalPurchases: 1,
        totalPayments: 1,
        totalProfit: 1,
        transactionCount: 1,
        _id: 0
      }
    },
    { $sort: { month: -1 } }
  ];

  const results = await Transaction.aggregate(pipeline);
  return results;
};

export const getDashboardKPIs = async (filters = {}) => {
  const startDate = filters.startDate ? new Date(filters.startDate) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  endDate.setHours(23, 59, 59, 999);

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalSales: {
                $sum: {
                  $cond: [{ $eq: ['$type', 'sale'] }, '$totalAmount', 0]
                }
              },
              totalPurchases: {
                $sum: {
                  $cond: [{ $eq: ['$type', 'purchase'] }, '$totalAmount', 0]
                }
              },
              totalPayments: { $sum: '$paidAmount' },
              totalProfit: { $sum: '$profit' },
              totalDiscount: { $sum: '$discount' }
            }
          }
        ],
        topItems: [
          {
            $unwind: '$items'
          },
          {
            $group: {
              _id: '$items.name',
              quantity: { $sum: '$items.quantity' },
              total: { $sum: '$items.total' }
            }
          },
          { $sort: { quantity: -1 } },
          { $limit: 10 }
        ],
        topCustomers: [
          {
            $match: { entityType: 'customer' }
          },
          {
            $group: {
              _id: '$entityId',
              totalAmount: { $sum: '$totalAmount' },
              transactions: { $sum: 1 }
            }
          },
          { $sort: { totalAmount: -1 } },
          { $limit: 10 }
        ]
      }
    }
  ];

  const result = await Transaction.aggregate(pipeline);
  return result[0];
};