import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export type Role = 'SUPER_ADMIN' | 'MANAGER' | 'BILLING' | 'OPERATOR';

// User
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public role!: Role;
}
User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('SUPER_ADMIN', 'MANAGER', 'BILLING', 'OPERATOR'), allowNull: false },
  },
  { sequelize, modelName: 'user' }
);

// Operator
export interface OperatorAttributes {
  id: number;
  business_name: string;
  phone: string;
  email: string;
  address: string;
  category: 'NEW' | 'EXISTING';
  business_license_status: 'PAID' | 'PENDING';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
export interface OperatorCreationAttributes extends Optional<OperatorAttributes, 'id' | 'status'> {}
export class Operator extends Model<OperatorAttributes, OperatorCreationAttributes> implements OperatorAttributes {
  public id!: number;
  public business_name!: string;
  public phone!: string;
  public email!: string;
  public address!: string;
  public category!: 'NEW' | 'EXISTING';
  public business_license_status!: 'PAID' | 'PENDING';
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED';
}
Operator.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    business_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.ENUM('NEW', 'EXISTING'), allowNull: false },
    business_license_status: { type: DataTypes.ENUM('PAID', 'PENDING'), allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING' },
  },
  { sequelize, modelName: 'operator' }
);

// Tariff
export interface TariffAttributes {
  id: number;
  ward_id: number;
  location_type: string;
  surface_area_bucket: string;
  tariff_amount: number;
}
export interface TariffCreationAttributes extends Optional<TariffAttributes, 'id'> {}
export class Tariff extends Model<TariffAttributes, TariffCreationAttributes> implements TariffAttributes {
  public id!: number;
  public ward_id!: number;
  public location_type!: string;
  public surface_area_bucket!: string;
  public tariff_amount!: number;
}
Tariff.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ward_id: { type: DataTypes.INTEGER, allowNull: false },
    location_type: { type: DataTypes.STRING, allowNull: false },
    surface_area_bucket: { type: DataTypes.STRING, allowNull: false },
    tariff_amount: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, modelName: 'tariff' }
);

// LicenseRequest
export interface LicenseRequestAttributes {
  id: number;
  operator_id: number;
  request_date: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
export interface LicenseRequestCreationAttributes extends Optional<LicenseRequestAttributes, 'id' | 'status' | 'request_date'> {}
export class LicenseRequest extends Model<LicenseRequestAttributes, LicenseRequestCreationAttributes> implements LicenseRequestAttributes {
  public id!: number;
  public operator_id!: number;
  public request_date!: Date;
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED';
}
LicenseRequest.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    operator_id: { type: DataTypes.INTEGER, allowNull: false },
    request_date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING' },
  },
  { sequelize, modelName: 'license_request' }
);

// LicenseRequestItem
export interface LicenseRequestItemAttributes {
  id: number;
  request_id: number;
  ward_id: number;
  location_type: string;
  surface_area_bucket: string;
  plus_code: string;
  gps_lat: number;
  gps_long: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
export interface LicenseRequestItemCreationAttributes extends Optional<LicenseRequestItemAttributes, 'id' | 'status'> {}
export class LicenseRequestItem extends Model<LicenseRequestItemAttributes, LicenseRequestItemCreationAttributes> implements LicenseRequestItemAttributes {
  public id!: number;
  public request_id!: number;
  public ward_id!: number;
  public location_type!: string;
  public surface_area_bucket!: string;
  public plus_code!: string;
  public gps_lat!: number;
  public gps_long!: number;
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED';
}
LicenseRequestItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    request_id: { type: DataTypes.INTEGER, allowNull: false },
    ward_id: { type: DataTypes.INTEGER, allowNull: false },
    location_type: { type: DataTypes.STRING, allowNull: false },
    surface_area_bucket: { type: DataTypes.STRING, allowNull: false },
    plus_code: { type: DataTypes.STRING, allowNull: false },
    gps_lat: { type: DataTypes.FLOAT, allowNull: false },
    gps_long: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING' },
  },
  { sequelize, modelName: 'license_request_item' }
);

// Invoice
export interface InvoiceAttributes {
  id: number;
  invoice_no: string;
  operator_id: number;
  request_id: number | null;
  subtotal: number;
  gst: number;
  total: number;
  revmis_status: string | null;
  revmis_reference: string | null;
}
export interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, 'id' | 'request_id' | 'revmis_status' | 'revmis_reference'> {}
export class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
  public id!: number;
  public invoice_no!: string;
  public operator_id!: number;
  public request_id!: number | null;
  public subtotal!: number;
  public gst!: number;
  public total!: number;
  public revmis_status!: string | null;
  public revmis_reference!: string | null;
}
Invoice.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    invoice_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    operator_id: { type: DataTypes.INTEGER, allowNull: false },
    request_id: { type: DataTypes.INTEGER, allowNull: true },
    subtotal: { type: DataTypes.FLOAT, allowNull: false },
    gst: { type: DataTypes.FLOAT, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
    revmis_status: { type: DataTypes.STRING, allowNull: true },
    revmis_reference: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'invoice' }
);

// License
export interface LicenseAttributes {
  id: number;
  license_no: string;
  invoice_id: number;
  issue_date: Date;
  pdf_url: string | null;
  qr_code_url: string | null;
}
export interface LicenseCreationAttributes extends Optional<LicenseAttributes, 'id' | 'issue_date' | 'pdf_url' | 'qr_code_url'> {}
export class License extends Model<LicenseAttributes, LicenseCreationAttributes> implements LicenseAttributes {
  public id!: number;
  public license_no!: string;
  public invoice_id!: number;
  public issue_date!: Date;
  public pdf_url!: string | null;
  public qr_code_url!: string | null;
}
License.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    license_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    invoice_id: { type: DataTypes.INTEGER, allowNull: false },
    issue_date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    pdf_url: { type: DataTypes.STRING, allowNull: true },
    qr_code_url: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'license' }
);

// Associations
Operator.hasMany(LicenseRequest, { foreignKey: 'operator_id' });
LicenseRequest.belongsTo(Operator, { foreignKey: 'operator_id' });

LicenseRequest.hasMany(LicenseRequestItem, { foreignKey: 'request_id' });
LicenseRequestItem.belongsTo(LicenseRequest, { foreignKey: 'request_id' });

Operator.hasMany(Invoice, { foreignKey: 'operator_id' });
Invoice.belongsTo(Operator, { foreignKey: 'operator_id' });

LicenseRequest.hasMany(Invoice, { foreignKey: 'request_id' });
Invoice.belongsTo(LicenseRequest, { foreignKey: 'request_id' });

Invoice.hasOne(License, { foreignKey: 'invoice_id' });
License.belongsTo(Invoice, { foreignKey: 'invoice_id' });

export default {
  sequelize,
  User,
  Operator,
  Tariff,
  LicenseRequest,
  LicenseRequestItem,
  Invoice,
  License,
};
