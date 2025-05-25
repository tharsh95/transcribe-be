import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Transcription extends Document {
  @Prop({ required: true })
  videoName: string;

  @Prop({
    required: true,
    type: [
      {
        chunkNumber: { type: Number, required: true },
        startTime: { type: Number, required: true },
        endTime: { type: Number, required: true },
        transcription: { type: String, required: true },
        mcqs: {
          type: [
            {
              question: { type: String, required: true },
              options: { type: [String], required: true },
              answer: { type: String, required: true },
            },
          ],
          required: true,
        },
      },
    ],
  })
  chunks: Array<{
    chunkNumber: number;
    startTime: number;
    endTime: number;
    transcription: string;
    mcqs: Array<{
      question: string;
      options: string[];
      answer: string;
    }>;
  }>;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TranscriptionSchema = SchemaFactory.createForClass(Transcription);
