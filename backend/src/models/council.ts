import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export interface CouncilAttributes {
  id: number;
  name: string;
}

export interface CouncilCreationAttributes extends Optional<CouncilAttributes, 'id'> {}

export class Council extends Model<CouncilAttributes, CouncilCreationAttributes> implements CouncilAttributes {
  public id!: number;
  public name!: string;
}

Council.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: 'council' }
);
