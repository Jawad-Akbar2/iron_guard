import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const createUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw { statusCode: 400, message: 'User already exists' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role
  });

  await user.save();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return user;
};

export const getAllUsers = async () => {
  return await User.find().select('-password').sort({ createdAt: -1 });
};

export const updateUser = async (id, updates) => {
  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return { message: 'User deleted successfully' };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};