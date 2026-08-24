import {
  Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.js';

@Table({ tableName: 'orders', timestamps: false })
export class Order extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.STRING)
  declare id: string;

  @Column(DataType.STRING)
  declare orderNum: string;

  @CreatedAt
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare orderDate: Date;

  @Column(DataType.DECIMAL(10, 2))
  declare amount: number;

  @Column(DataType.TEXT)
  declare cart: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare shipped: boolean;

  @Column(DataType.DATE)
  declare shippedDate: Date;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;
}
