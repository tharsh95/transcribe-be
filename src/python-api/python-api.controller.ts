import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PythonApiService } from './python-api.service';

@Controller('python-api')
export class PythonApiController {
  constructor(private readonly pythonApiService: PythonApiService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribe(@UploadedFile() file: any) {
    return this.pythonApiService.transcribe(file);
  }

  @Post('generate-mcq')
  async generateMcqs(@Body('text') text: string) {
    return this.pythonApiService.generateMcqs(text);
  }
}
