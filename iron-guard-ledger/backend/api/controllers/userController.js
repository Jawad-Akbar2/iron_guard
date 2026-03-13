import * as userService from '../services/userService.js';
import jwt from 'jsonwebtoken';
import { asyncHandler, errorHandler } from '../middleware/errorHandler.js';

export const register = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.loginUser(email, password);

  const token = jwt.sign(
    { _id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: { user, token }
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logout successful',
    data: null
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  res.json({
    success: true,
    message: 'User fetched',
    data: user
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({
    success: true,
    message: 'Users fetched',
    data: users
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({
    success: true,
    message: 'User updated',
    data: user
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  res.json({
    success: true,
    message: result.message,
    data: null
  });
});