import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { DocumentEntity } from './document.entity';

@Entity('document_logs')
export class DocumentLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.logs)
  user: UserEntity; 

  @ManyToOne(() => DocumentEntity, (document) => document.logs, { onDelete: 'CASCADE' })
  document: DocumentEntity; 

  @Column()
  action: string;

  @CreateDateColumn()
  createdAt: Date; 
}
