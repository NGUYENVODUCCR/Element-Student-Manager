import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
