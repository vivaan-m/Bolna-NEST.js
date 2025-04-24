import { Controller, Get, Post, Query, Body, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { TwilioWebsocketService } from './twilio-websocket.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('telephony')
@Controller('telephony/twilio')
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);

  constructor(private readonly twilioWebsocketService: TwilioWebsocketService) {}

  @Get('connect')
  @ApiOperation({ summary: 'Generate TwiML for connecting to Bolna WebSocket' })
  @ApiQuery({ name: 'agentId', required: true, description: 'Agent ID to connect to' })
  connect(@Query('agentId') agentId: string, @Res() res: Response) {
    this.logger.log(`Generating TwiML for agent: ${agentId}`);
    
    const twiml = this.twilioWebsocketService.generateTwiML(agentId);
    
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  }

  @Post('status-callback')
  @ApiOperation({ summary: 'Handle Twilio status callbacks' })
  statusCallback(@Body() body: any) {
    this.logger.log('Received status callback from Twilio');
    this.logger.debug(body);
    
    return { received: true };
  }

  @Post('event-callback')
  @ApiOperation({ summary: 'Handle Twilio event callbacks' })
  eventCallback(@Body() body: any) {
    this.logger.log('Received event callback from Twilio');
    this.logger.debug(body);
    
    return { received: true };
  }
}