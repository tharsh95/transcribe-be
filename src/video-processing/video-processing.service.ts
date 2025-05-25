import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PythonApiService } from '../python-api/python-api.service';
import { Transcription } from '../transcriptions/transcription.schema';

const execAsync = promisify(exec);

@Injectable()
export class VideoProcessingService {
  constructor(
    @InjectModel(Transcription.name)
    private transcriptionModel: Model<Transcription>,

    private pythonApiService: PythonApiService,
  ) {}

  async processVideo(file: Express.Multer.File) {
    const tempDir = path.join(process.cwd(), 'temp');
    const videoPath = path.join(tempDir, file.originalname);

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Save the uploaded video
    fs.writeFileSync(videoPath, file.buffer);

    try {
      // Get video duration using ffprobe
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
      );
      const duration = parseFloat(stdout);
      const chunkDuration = 300; // 5 minutes in seconds
      const chunks = Math.ceil(duration / chunkDuration);
      let transcriptionDoc = null;

      for (let i = 0; i < chunks; i++) {
        const startTime = i * chunkDuration;
        const endTime = Math.min((i + 1) * chunkDuration, duration);

        // Extract chunk using ffmpeg
        const chunkPath = path.join(tempDir, `chunk_${i}.mp4`);
        try {
          await execAsync(
            `ffmpeg -i "${videoPath}" -ss ${startTime} -t ${endTime - startTime} -c:v copy -c:a copy "${chunkPath}"`,
          );
          console.log(chunkPath, '6th');
        } catch (error) {
          console.log(error, '7th');
        }

        try {
          const transcriptionResult =
            await this.pythonApiService.transcribe(chunkPath);
          console.log(transcriptionResult, '8th');
          const mcqs =
            await this.pythonApiService.generateMcqs(transcriptionResult);

          if (!transcriptionDoc) {
            // Create new document for first chunk
            transcriptionDoc = await this.transcriptionModel.create({
              videoName: file.originalname,
              chunks: [
                {
                  chunkNumber: i,
                  startTime,
                  endTime,
                  transcription: transcriptionResult,
                  mcqs: mcqs.questions,
                },
              ],
            });
          } else {
            // Add subsequent chunks to existing document
            transcriptionDoc = await this.transcriptionModel.findByIdAndUpdate(
              transcriptionDoc._id,
              {
                $push: {
                  chunks: {
                    chunkNumber: i,
                    startTime,
                    endTime,
                    transcription: transcriptionResult,
                    mcqs: mcqs.questions,
                  },
                },
              },
              { new: true },
            );
          }

          // Clean up chunk file
          fs.unlinkSync(chunkPath);
        } catch (error) {
          console.error('Error processing chunk:', error);
          // Clean up on error
          if (fs.existsSync(chunkPath)) {
            fs.unlinkSync(chunkPath);
          }
          throw error;
        }
      }

      // Clean up original video file
      fs.unlinkSync(videoPath);

      return transcriptionDoc;
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
      throw new HttpException(
        `Failed to process video: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // async processVideo(file: Express.Multer.File) {
  //   return this.transcriptionModel.findById('6831daaed7d4a8ac0671543f');
  // }
  async getAllTransriptions() {
    return this.transcriptionModel.find();
  }
}
