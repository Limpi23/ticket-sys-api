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

    // 1. Buscar si el usuario ya existe por su email
    let user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    // 2. Si el usuario no existe, lo creamos
    if (!user) {
      user = this.userRepository.create({
        email: createUserDto.email,
        phone: createUserDto.phone,
      });

      // Guardar el nuevo usuario en la base de datos
      user = await this.userRepository.save(user);
    }

    // 3. Crear el nuevo ticket y asignarle el usuario
    const newTicket = this.ticketRepository.create({
      ...createTicketDto,
      user: user, // Asignar el usuario encontrado o recién creado
    });

    // Guardar el ticket en la base de datos
    return this.ticketRepository.save(newTicket);
  }

  async update(id: number, updatedTicket: Partial<Ticket>): Promise<Ticket> {
    await this.ticketRepository.update(id, updatedTicket);
    return this.ticketRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.ticketRepository.delete(id);
  }
}
