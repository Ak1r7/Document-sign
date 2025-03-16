import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentEntity } from './document.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { DocumentLogService } from './document-log.service';
import { DocumentLogEntity } from './document-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, UserEntity, DocumentLogEntity]), MailModule],
  providers: [DocumentService, MailService, DocumentLogService],
  controllers: [DocumentController],
  exports: [DocumentService],
})

export class DocumentModule {}
