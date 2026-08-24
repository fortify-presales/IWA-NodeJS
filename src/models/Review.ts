import {
  Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.js';
import { Product } from './Product.js';

@Table({ tableName: 'reviews', timestamps: false })
export class Review extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.STRING)
  declare id: string;

  @Column(DataType.TEXT)
  declare comment: string;

  @Column(DataType.INTEGER)
  declare rating: number;

  @CreatedAt
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare reviewDate: Date;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare visible: boolean;

  @ForeignKey(() => Product)
  @Column(DataType.STRING)
  declare productId: string;

  @BelongsTo(() => Product)
  declare product: Product;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;
}
