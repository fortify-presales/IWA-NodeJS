import {
  Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.js';

@Table({ tableName: 'messages', timestamps: false })
export class Message extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.STRING)
  declare id: string;

  @Column(DataType.TEXT)
  declare text: string;

  @CreatedAt
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare sentDate: Date;

  @Column(DataType.DATE)
  declare readDate: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare read: boolean;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;
}
