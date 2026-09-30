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
  declare category: string;

  @Column(DataType.STRING)
  declare subcategory: string;

  @Column(DataType.STRING)
  declare brand: string;

  @Column(DataType.STRING)
  declare activeIngredient: string | null;

  @Column(DataType.STRING)
  declare strength: string | null;

  @Column(DataType.STRING)
  declare form: string;

  @Column(DataType.INTEGER)
  declare quantity: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare onPrescription: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare pharmacyOnly: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare controlledMedicine: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare requiresConsultation: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  declare minimumAge: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare suitableForChildren: boolean;

  @Column(DataType.JSON)
  declare symptomsTreated: string[];

  @Column(DataType.JSON)
  declare commonUses: string[];

  @Column(DataType.JSON)
  declare keywords: string[];

  @Default(0)
  @Column(DataType.INTEGER)
  declare stockLevel: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare featured: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare bestseller: boolean;

  @Column(DataType.JSON)
  declare alternativeProducts: string[];

  @Column(DataType.JSON)
  declare relatedProducts: string[];

  @Column(DataType.STRING)
  declare summary: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.TEXT)
  declare warning: string | null;

  @Column(DataType.TEXT)
  declare usageNotes: string | null;

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
