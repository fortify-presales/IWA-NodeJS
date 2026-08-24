import {
  Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.js';

@Table({ tableName: 'refresh_tokens', timestamps: false })
export class RefreshToken extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.STRING)
  declare id: string;

  @Column(DataType.STRING)
  declare token: string;

  @Column(DataType.DATE)
  declare expiryDate: Date;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;
}
