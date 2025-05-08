import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Work } from './work.entity';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { UserRole } from '../user/user.entity';

@Injectable()
export class WorkService {
  constructor(
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
  ) {}

  async findAll(): Promise<Work[]> {
    return this.workRepository.find({ relations: ['createdBy'] });
  }

  async findOne(id: number): Promise<Work> {
    const work = await this.workRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!work) {
      throw new NotFoundException(`Công việc ID ${id} không tồn tại`);
    }
    return work;
  }

  async create(createWorkDto: CreateWorkDto): Promise<Work> {
    if (createWorkDto.maxReceiver < 1) {
      throw new ForbiddenException('Số người tối đa phải >= 1');
    }

    const newWork = this.workRepository.create({
      ...createWorkDto,
      createdBy: { id: createWorkDto.createdBy }, // userId được gán từ controller
    });

    return this.workRepository.save(newWork);
  }

  async update(id: number, updateWorkDto: UpdateWorkDto): Promise<Work> {
    const existingWork = await this.findOne(id);

    // Không kiểm tra updateWorkDto.createdBy vì không được gửi từ client
    const updatedWork = Object.assign(existingWork, updateWorkDto);
    return this.workRepository.save(updatedWork);
  }

  async remove(id: number): Promise<void> {
    const work = await this.findOne(id);
    await this.workRepository.remove(work);
  }

  async findByOwner(userId: number): Promise<Work[]> {
    return this.workRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy'],
    });
  }

  async findPublicWorks(): Promise<Partial<Work>[]> {
    const works = await this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.createdBy', 'user')
      .where('user.role = :role1 OR user.role = :role2', {
        role1: UserRole.WORK,
        role2: UserRole.ADMIN,
      })
      .getMany();

    return works.map(this.sanitizeWork);
  }

  async searchWorksByKeyword(keyword: string): Promise<Partial<Work>[]> {
    const works = await this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.createdBy', 'user')
      .where('work.name LIKE :keyword OR work.description LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .getMany();

    return works.map(this.sanitizeWork);
  }

  sanitizeWork(work: Work): Partial<Work> {
    return {
      id: work.id,
      name: work.name,
      description: work.description,
      type: work.type,
      address: work.address,
      maxReceiver: work.maxReceiver,
    };
  }
}
