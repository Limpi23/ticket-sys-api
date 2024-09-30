import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  findOne(id: number): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { id } });
  }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { user: createUserDto } = createTicketDto;

    let user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (!user) {
      user = this.userRepository.create({
        email: createUserDto.email,
        phone: createUserDto.phone,
      });
      user = await this.userRepository.save(user);
    }

    const ticketNumber = await this.generateTicketNumber();

    const newTicket = this.ticketRepository.create({
      ...createTicketDto,
      user: user,
      ticketNumber,
    });

    return this.ticketRepository.save(newTicket);
  }

  async generateTicketNumber(): Promise<string> {
    const lastTicket = await this.ticketRepository.findOne({
      order: { ticketNumber: 'DESC' },
    });

    let newTicketNumber = 'TKS-0001';

    if (lastTicket) {
      const lastTicketNumber = lastTicket.ticketNumber;
      const lastNumber = parseInt(lastTicketNumber.split('-')[1], 10);

      const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
      newTicketNumber = `TKS-${nextNumber}`;
    }

    return newTicketNumber;
  }

  async update(id: number, updatedTicket: Partial<Ticket>): Promise<Ticket> {
    await this.ticketRepository.update(id, updatedTicket);
    return this.ticketRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.ticketRepository.delete(id);
  }
}
