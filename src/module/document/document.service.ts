import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from './document.entity';
import { UserEntity } from '../user/user.entity';
import { MailService } from '../mail/mail.service';
import { DocumentLogService } from './document-log.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentEntity)
    private documentRepo: Repository<DocumentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly mailService: MailService,
    private readonly logService: DocumentLogService,
  ) {}

  async uploadDocument(owner: UserEntity, fileName: string, filePath: string) {
    const document = this.documentRepo.create({
      name: fileName,
      path: filePath,
      status: 'uploaded',
      owner,
    });

    return this.documentRepo.save(document);
  }

  async getUserDocuments(user: UserEntity) {
    return this.documentRepo.find({ where: { owner: user } });
  }

  async markAsSent(documentId: number, user: UserEntity) {
    const document = await this.documentRepo.findOne({ where: { id: documentId, owner: user } });
    if (!document) throw new NotFoundException('Document not found');

    document.status = 'sent';
    return this.documentRepo.save(document);
  }

  async sendForSignature(documentId: number, recipientIds: number[]) {
    const document = await this.documentRepo.findOne({ where: { id: documentId }, relations: ['owner'] });
    if (!document) throw new NotFoundException('Документ не найден');

    const recipients = await this.userRepo.findByIds(recipientIds);
    if (recipients.length === 0) throw new NotFoundException('Получатели не найдены');

    document.recipients = recipients;
    document.status = 'sent';
    await this.documentRepo.save(document);

    for (const recipient of recipients) {
      await this.mailService.sendMail(
        recipient.email,
        'Документ для подписи',
        `Вам отправлен документ ${document.name} для подписания. Перейдите по ссылке: http://localhost:3000/documents/sign/${document.id}`
      );      
    }

    return { message: 'Документ отправлен на подпись', document };
  }

  async signDocument(documentId: number, user: UserEntity, signaturePath: string) {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
      relations: ['recipients'],
    });
    
    if (!document) throw new NotFoundException('Документ не найден');
    if (!document.recipients.some(recipient => recipient.id === user.id)) {
      throw new ForbiddenException('Вы не можете подписать этот документ');
    }
  
    document.signature = signaturePath;
    document.status = 'signed';
    await this.documentRepo.save(document);
  
    return { message: 'Документ подписан', document };
  }
  
  async getDocumentById(documentId: number, user: UserEntity) {
    return this.documentRepo.findOne({
      where: { id: documentId, owner: user },
    });
  }
  
}
