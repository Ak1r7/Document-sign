import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Get, Param, Res, Body, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { Request, Response } from 'express';
import { UserEntity } from '../user/user.entity';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { User } from 'src/core/decorator/user.decorator';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { DocumentLogService } from './document-log.service';
import { ApiBearerAuth } from '@nestjs/swagger';


@Controller('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private readonly logService: DocumentLogService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async uploadDocument(@User() user: UserEntity, @UploadedFile() file: Express.Multer.File) {
    return this.documentService.uploadDocument(user, file.filename, `/uploads/${file.filename}`);
  }

  @Get('my')
  async getUserDocuments(@User() user: UserEntity) {
    return this.documentService.getUserDocuments(user);
  }

  @Post('send/:id')
  async sendDocument(@Param('id') id: number, @User() user: UserEntity) {
    return this.documentService.markAsSent(id, user);
  }
  @Get('download/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'uploads', filename);
    return res.download(filePath);
  }
  
  @Post('send/:documentId')
  async sendForSignature(@Param('documentId') documentId: number, @Body('recipients') recipients: number[]) {
    return this.documentService.sendForSignature(documentId, recipients);
  }
  @Post('sign/:documentId')
  @UseInterceptors(FileInterceptor('signature', {
    storage: diskStorage({
      destination: './signatures',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async signDocument(
    @Param('documentId') documentId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req, 
  ) {
    const user = req.user;
    return this.documentService.signDocument(documentId, user, file.path);
  }
  

  @Get('history/:documentId')
async getDocumentHistory(@Param('documentId') documentId: number) {
  return this.logService.getDocumentHistory(documentId);
}

}
