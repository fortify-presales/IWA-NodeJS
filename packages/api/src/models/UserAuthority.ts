import {
  Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey,
} from 'sequelize-typescript';
import { User } from './User.js';
import { Authority } from './Authority.js';

@Table({ tableName: 'user_authorities', timestamps: false })
export class UserAuthority extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.STRING)
  declare userId: string;

  @PrimaryKey
  @ForeignKey(() => Authority)
  @Column(DataType.STRING)
  declare authorityId: string;
}
