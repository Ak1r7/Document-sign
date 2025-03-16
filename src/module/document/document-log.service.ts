import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentLogEntity } from './document-log.entity';
import { UserEntity } from '../user/user.entity';
import { DocumentEntity } from './document.entity';

@Injectable()
export class DocumentLogService {
  constructor(
    @InjectRepository(DocumentLogEntity)
    private readonly logRepo: Repository<DocumentLogEntity>,
  ) {}

  async logAction(user: UserEntity, document: DocumentEntity, action: string) {
    const log = this.logRepo.create({ user, document, action });
    await this.logRepo.save(log);
  }
  async getDocumentHistory(documentId: number) {
    return this.logRepo.find({ where: { document: { id: documentId } }, relations: ['user'] });
  }
}
