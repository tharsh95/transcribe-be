import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoProcessingController } from './video-processing.controller';
import { VideoProcessingService } from './video-processing.service';
import { PythonApiModule } from '../python-api/python-api.module';
import {
  Transcription,
  TranscriptionSchema,
} from '../transcriptions/transcription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transcription.name, schema: TranscriptionSchema },
    ]),
    PythonApiModule,
  ],
  controllers: [VideoProcessingController],
  providers: [VideoProcessingService],
})
export class VideoProcessingModule {}
