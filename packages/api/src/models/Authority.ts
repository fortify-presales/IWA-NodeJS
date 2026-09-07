import {
  Table, Column, Model, DataType, PrimaryKey, Default, BelongsToMany,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.js';
import { UserAuthority } from './UserAuthority.js';

@Table({ tableName: 'authorities', timestamps: false })
export class Authority extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.STRING)
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @BelongsToMany(() => User, () => UserAuthority)
  declare users: User[];
}
