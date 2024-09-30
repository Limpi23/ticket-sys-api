import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, length: 50 })
  email: string;

  @Column({ type: 'varchar', length: 10 })
  phone: string;

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];
}
