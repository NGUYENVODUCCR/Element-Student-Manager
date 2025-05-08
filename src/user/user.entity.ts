import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Work } from '../work/work.entity';
import { NoticeNewWork } from '../notice-new-work/notice-new-work.entity'; // ✅ THÊM DÒNG NÀY

export enum UserRole {
  USER = 'ROLE_USER',
  WORK = 'ROLE_WORK',
  ADMIN = 'ROLE_ADMIN',
}

@Entity('account')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Work, (work) => work.createdBy)
  works: Work[];

  @OneToMany(() => NoticeNewWork, (notice) => notice.createdBy) // ✅ CÓ TYPE AN TOÀN
  notices: NoticeNewWork[];
}
