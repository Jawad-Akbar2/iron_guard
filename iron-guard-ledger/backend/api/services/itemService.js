import Item from '../models/Item.js';

export const createItem = async (itemData) => {
  const { name, unit, purchaseRate, saleRate } = itemData;

  const existing = await Item.findOne({ name });
  if (existing) {
    throw { statusCode: 400, message: 'Item already exists' };
  }

  const item = new Item({
    name,
    unit,
    purchaseRate: purchaseRate || 0,
    saleRate: saleRate || 0,
    currentStock: 0
  });

  await item.save();
  return item;
};

export const getItemById = async (id) => {
  const item = await Item.findById(id);
  if (!item) {
    throw { statusCode: 404, message: 'Item not found' };
  }
  return item;
};

export const getAllItems = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  const items = await Item.find()
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

  const total = await Item.countDocuments();

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateItem = async (id, updates) => {
  const item = await Item.findByIdAndUpdate(id, updates, { new: true });
  if (!item) {
    throw { statusCode: 404, message: 'Item not found' };
  }
  return item;
};

export const deleteItem = async (id) => {
  const item = await Item.findByIdAndDelete(id);
  if (!item) {
    throw { statusCode: 404, message: 'Item not found' };
  }
  return { message: 'Item deleted successfully' };
};

export const updateStock = async (itemId, quantityChange) => {
  const item = await Item.findByIdAndUpdate(
    itemId,
    { $inc: { currentStock: quantityChange } },
    { new: true }
  );
  return item;
};