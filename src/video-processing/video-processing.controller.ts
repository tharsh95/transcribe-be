import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoProcessingService } from './video-processing.service';

@Controller('video-processing')
export class VideoProcessingController {
  constructor(
    private readonly videoProcessingService: VideoProcessingService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    // console.log(file);
    return this.videoProcessingService.processVideo(file);
  }
  @Get('/')
  async getAllTransriptions() {
    return this.videoProcessingService.getAllTransriptions();
  }
}
