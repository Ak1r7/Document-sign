import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Get,
  Param,
  Res,
  Body,
  ParseFilePipe,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { Response } from 'express';
import { UserEntity } from '../user/user.entity';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { User } from 'src/core/decorator/user.decorator';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { DocumentLogService } from './document-log.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common/pipes';
import { MailService } from '../mail/mail.service';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private readonly logService: DocumentLogService,
    private readonly mailService: MailService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Загрузка документа (Word, PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файл документа (Word, PDF)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadDocument(
    @User() user: UserEntity,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              'application/pdf|application/vnd.openxmlformats-officedocument.wordprocessingml.document|application/msword',
          }),
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
            message: 'Файл слишком большой. Максимальный размер: 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.documentService.uploadDocument(
      user,
      file.filename,
      `/uploads/${file.filename}`,
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить документы пользователя' })
  async getUserDocuments(@User() user: UserEntity) {
    return this.documentService.getUserDocuments(user);
  }

  @Post('send/:id')
  @ApiOperation({ summary: 'Отправить документ' })
  @ApiParam({ name: 'id', required: true, description: 'ID документа' })
  async sendDocument(@Param('id', ParseIntPipe) id: number, @User() user: UserEntity) {
    return this.documentService.markAsSent(id, user);
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Скачать документ' })
  @ApiParam({ name: 'filename', required: true, description: 'Имя файла' })
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'uploads', filename);
    return res.download(filePath);
  }

  @Post('send/:documentId')
  @ApiOperation({ summary: 'Отправить документ на подпись по email' })
  @ApiParam({ name: 'documentId', required: true, description: 'ID документа' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email получателя' },
      },
    },
  })
  async sendDocumentForSignature(
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body('email') email: string,
    @User() user: UserEntity,
  ) {
    const document = await this.documentService.getDocumentById(documentId, user);
  
    if (!document) {
      throw new NotFoundException('Документ не найден');
    }
  
    const downloadUrl = `http://yourdomain.com/api/documents/download/${document.path}`;
  
    await this.mailService.sendMail(
      email,
      'Документ для подписания',
      `Здравствуйте! Вам отправлен документ на подпись. Вы можете скачать его по ссылке: ${downloadUrl}`,
      user.email 
    );
    
    

    return { message: 'Документ отправлен на подпись', email };
  }
  

  @Post('sign/:documentId')
  @ApiOperation({ summary: 'Подписать документ' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'documentId', required: true, description: 'ID документа' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        signature: {
          type: 'string',
          format: 'binary',
          description: 'Файл подписи (PDF или Word)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: './signatures',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async signDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
    @User() user: UserEntity,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              'application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }),
          new MaxFileSizeValidator({ maxSize: 10_000_000 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.documentService.signDocument(documentId, user, file.path);
  }

  @Get('history/:documentId')
  @ApiOperation({ summary: 'Получить историю документа' })
  @ApiParam({ name: 'documentId', required: true, description: 'ID документа' })
  async getDocumentHistory(@Param('documentId', ParseIntPipe) documentId: number) {
    return this.logService.getDocumentHistory(documentId);
  }
}
