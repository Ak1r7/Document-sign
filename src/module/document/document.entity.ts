import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { DocumentLogEntity } from './document-log.entity';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column({ default: 'uploaded' }) 
  status: string;

  @ManyToOne(() => UserEntity, (user) => user.sentDocuments)
  owner: UserEntity;

  @ManyToMany(() => UserEntity, (user) => user.receivedDocuments)
  @JoinTable()
  recipients: UserEntity[];

  @Column({ nullable: true })
  signature: string;

  @OneToMany(() => DocumentLogEntity, (log) => log.document)
  logs: DocumentLogEntity[];
}
