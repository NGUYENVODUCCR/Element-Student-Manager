import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('work_title')
export class Work {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string; // Optional mô tả

  @Column({ length: 255, nullable: true })
  type: string; // Optional loại công việc

  @Column({ length: 255, nullable: true })
  address: string; // Optional địa chỉ

  @Column({ type: 'int', default: 1 }) // Số người tối đa nhận công việc, mặc định là 1
  maxReceiver: number;

  @ManyToOne(() => User, (user) => user.works)
  @JoinColumn({ name: 'createdBy' }) // Đặt tên khóa ngoại là createdBy
  createdBy: User;
}
