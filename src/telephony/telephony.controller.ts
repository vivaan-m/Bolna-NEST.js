import { Controller, Post, Body, Param, Delete, Get, Req, Res } from '@nestjs/common';
import { TelephonyService, CallOptions } from './telephony.service';
import { Request, Response } from 'express';
import { TwilioService } from './providers/twilio.service';
import { PlivoService } from './providers/plivo.service';

@Controller('telephony')
export class TelephonyController {
  constructor(
    private readonly telephonyService: TelephonyService,
    private readonly twilioService: TwilioService,
    private readonly plivoService: PlivoService,
  ) {}

  @Post('call')
  async initiateCall(@Body() options: CallOptions) {
    const callId = await this.telephonyService.initiateCall(options);
    return { callId };
  }

  @Delete('call/:provider/:callId')
  async endCall(@Param('callId') callId: string, @Param('provider') provider: string) {
    const success = await this.telephonyService.endCall(callId, provider);
    return { success };
  }

  @Post('twilio/webhook')
  async twilioWebhook(@Req() req: Request, @Res() res: Response) {
    return this.twilioService.handleWebhook(req, res);
  }

  @Post('plivo/webhook')
  async plivoWebhook(@Req() req: Request, @Res() res: Response) {
    return this.plivoService.handleWebhook(req, res);
  }

  @Get('webhook-url/:provider')
  getWebhookUrl(@Param('provider') provider: string) {
    const url = this.telephonyService.getWebhookUrl(provider);
    return { url };
  }
}