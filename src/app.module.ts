import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ormconfig } from './ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './common/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './module/document/document.module';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DocumentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
