import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
@Index('IDX_position_salary', ['position', 'salary'])
export class NoticeNewWork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  position: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('text')
  description: string;

  @Column()
  name: string;

  @Column('decimal')
  salary: number;

  @Column()
  address: string;

  @Column({ default: 0 })
  acceptedCount: number;

  @Column({ default: 1 })
  maxAccepted: number;

  @ManyToOne(() => User, user => user.notices)
  createdBy: User;

  // Danh sách người nhận công việc
  @ManyToMany(() => User)
  @JoinTable()
  acceptedBy: User[];

  @Column({ default: false })
  isNotified: boolean;
}
