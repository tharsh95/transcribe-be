import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { PythonApiModule } from './python-api/python-api.module';
import { VideoProcessingModule } from './video-processing/video-processing.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/lecture',
    ),
    AuthModule,
    PythonApiModule,
    VideoProcessingModule,
  ],
})
export class AppModule {}
