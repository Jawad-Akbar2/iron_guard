import * as itemService from '../services/itemService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createItem = asyncHandler(async (req, res) => {
  const item = await itemService.createItem(req.body);
  res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: item
  });
});

export const getItemById = asyncHandler(async (req, res) => {
  const item = await itemService.getItemById(req.params.id);
  res.json({
    success: true,
    message: 'Item fetched',
    data: item
  });
});

export const getAllItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  
  const items = await itemService.getAllItems(page, limit);
  res.json({
    success: true,
    message: 'Items fetched',
    data: items
  });
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await itemService.updateItem(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Item updated',
    data: item
  });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const result = await itemService.deleteItem(req.params.id);
  res.json({
    success: true,
    message: result.message,
    data: null
  });
});