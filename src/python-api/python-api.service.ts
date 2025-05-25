import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PythonApiService {
  constructor(private readonly httpService: HttpService) {}
  private readonly pythonApiUrl = 'http://localhost:8000';

  async transcribe(filePath: string): Promise<string> {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await lastValueFrom(
        this.httpService.post(`${this.pythonApiUrl}/transcribe`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 300000, // 5 minutes timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }),
      );
      if (response.data && response.data.transcript) {
        return response.data.transcript;
      } else if (typeof response.data === 'string') {
        return response.data;
      } else {
        throw new Error('Invalid transcription response format');
      }
    } catch (error) {
      console.error(
        'Transcription Error:',
        error.response?.data || error.message || error,
      );
      throw new HttpException(
        'Failed to transcribe: ' +
          (error.response?.data?.message || error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async generateMcqs(text: string) {
    try {
      const payload = { transcript: text };

      const response = await lastValueFrom(
        this.httpService.post(`${this.pythonApiUrl}/generate-mcq`, payload, {
          timeout: 300000, // 5 minutes timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }),
      );

      if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid MCQ response format');
      }
    } catch (error) {
      console.error(
        'MCQ Generation Error:',
        error.response?.data || error.message || error,
      );
      throw new HttpException(
        'Failed to generate MCQs: ' +
          (error.response?.data?.message || error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
