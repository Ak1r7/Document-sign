import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });
  }

  async sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
    await this.transporter.sendMail({ from: 'your-email@gmail.com', to, subject, text });
  }
}
