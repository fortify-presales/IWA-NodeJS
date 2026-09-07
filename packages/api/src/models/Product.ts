import {
  Table, Column, Model, DataType, PrimaryKey, Default, CreatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'products', timestamps: false })
export class Product extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.STRING)
  declare id: string;

  @Column(DataType.STRING)
  declare code: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.STRING)
  declare summary: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.DECIMAL(10, 2))
  declare price: number;

  @Column(DataType.DECIMAL(10, 2))
  declare salePrice: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare onSale: boolean;

  @Column(DataType.STRING)
  declare image: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare inStock: boolean;

  @Default(0)
  @Column(DataType.FLOAT)
  declare rating: number;

  @CreatedAt
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare dateCreated: Date;
}
