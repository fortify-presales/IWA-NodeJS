import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  BelongsToMany,
  HasMany,
  CreatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Authority } from './Authority.js';
import { Order } from './Order.js';
import { Message } from './Message.js';
import { Review } from './Review.js';
import { RefreshToken } from './RefreshToken.js';
import { MfaType } from './enums.js';
import { UserAuthority } from './UserAuthority.js';

@Table({ tableName: 'users', timestamps: false })
export class User extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.STRING)
  declare id: string;

  @Unique
  @Column(DataType.STRING)
  declare username: string;

  @Column(DataType.STRING)
  declare password: string;

  @Unique
  @Column(DataType.STRING)
  declare email: string;

  @Column(DataType.STRING)
  declare firstName: string;

  @Column(DataType.STRING)
  declare lastName: string;

  @Column(DataType.STRING)
  declare phone: string;

  @Column(DataType.STRING)
  declare address: string;

  @Column(DataType.STRING)
  declare city: string;

  @Column(DataType.STRING)
  declare state: string;

  @Column(DataType.STRING)
  declare zip: string;

  @Column(DataType.STRING)
  declare country: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare enabled: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare verified: boolean;

  @Default(MfaType.MFA_NONE)
  @Column(DataType.STRING)
  declare mfaType: MfaType;

  @Column(DataType.STRING)
  declare mfaSecret: string;

  @Default(0)
  @Column(DataType.INTEGER)
  declare failedLoginAttempts: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare locked: boolean;

  @CreatedAt
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare dateCreated: Date;

  @Column(DataType.DATE)
  declare lastLogin: Date;

  @BelongsToMany(() => Authority, () => UserAuthority)
  declare authorities: Authority[];

  @HasMany(() => Order)
  declare orders: Order[];

  @HasMany(() => Message)
  declare messages: Message[];

  @HasMany(() => Review)
  declare reviews: Review[];

  @HasMany(() => RefreshToken)
  declare refreshTokens: RefreshToken[];
}
