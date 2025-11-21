import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';
import { Team } from './Team';

export enum RegistrationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  TEAM_INCOMPLETE = 'team_incomplete',
  TEAM_COMPLETE = 'team_complete',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'registrations',
  timestamps: true,
})
export class Registration extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => Team)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  teamId!: string | null;

  @BelongsTo(() => Team)
  team?: Team;

  @Column({
    type: DataType.ENUM(...Object.values(RegistrationStatus)),
    defaultValue: RegistrationStatus.PENDING,
  })
  status!: RegistrationStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  verifiedAt!: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  checkedInAt!: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt!: Date | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes!: string | null;
}

