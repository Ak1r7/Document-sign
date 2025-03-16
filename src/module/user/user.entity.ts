import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { DocumentEntity } from '../document/document.entity';
import { DocumentLogEntity } from '../document/document-log.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'USER' })
  role: string;

  @OneToMany(() => DocumentEntity, (document) => document.owner)
  documents: DocumentEntity[];
 
  @OneToMany(() => DocumentEntity, (document) => document.owner)
  sentDocuments: DocumentEntity[];

  @ManyToMany(() => DocumentEntity, (document) => document.recipients)
  receivedDocuments: DocumentEntity[];

  @OneToMany(() => DocumentLogEntity, (log) => log.user)
  logs: DocumentLogEntity[];
}
