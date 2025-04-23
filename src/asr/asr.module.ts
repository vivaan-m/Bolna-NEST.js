import { Module } from '@nestjs/common';
import { AsrService } from './asr.service';
import { DeepgramAsrService } from './providers/deepgram-asr.service';

@Module({
  providers: [AsrService, DeepgramAsrService],
  exports: [AsrService],
})
export class AsrModule {}