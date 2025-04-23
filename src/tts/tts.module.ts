import { Module } from '@nestjs/common';
import { TtsService } from './tts.service';
import { AwsPollyTtsService } from './providers/aws-polly-tts.service';
import { ElevenLabsTtsService } from './providers/elevenlabs-tts.service';

@Module({
  providers: [TtsService, AwsPollyTtsService, ElevenLabsTtsService],
  exports: [TtsService],
})
export class TtsModule {}