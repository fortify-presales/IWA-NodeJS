import { Sequelize } from 'sequelize-typescript';
import { env } from './env.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Message } from '../models/Message.js';
import { Review } from '../models/Review.js';
import { Authority } from '../models/Authority.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { UserAuthority } from '../models/UserAuthority.js';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.databaseUrl,
  logging: env.isDevelopment ? console.log : false,
  models: [User, Product, Order, Message, Review, Authority, RefreshToken, UserAuthority],
});
