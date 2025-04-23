import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, Controller, Get, Header, Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelephonyModule } from './telephony/telephony.module';
import { RedisModule } from './redis/redis.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AgentModule } from './agent/agent.module';
import { AsrModule } from './asr/asr.module';
import { LlmModule } from './llm/llm.module';
import { TtsModule } from './tts/tts.module';

// Create a service for the telephony server welcome page
@Injectable()
class TelephonyServerService {
  getWelcome(): string {
    return `
      <html>
        <head>
          <title>Bolna - Telephony Server</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .endpoints {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            code {
              background-color: #eee;
              padding: 2px 5px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <h1>Bolna - Telephony Server</h1>
          <p>Welcome to the Bolna Telephony Server. This server handles telephony operations for the Bolna Voice AI Platform.</p>
          
          <div class="endpoints">
            <h2>Telephony Server Endpoints (Port 3001):</h2>
            <ul>
              <li><code>POST /telephony/call</code> - Initiate a call</li>
              <li><code>DELETE /telephony/call/:provider/:callId</code> - End a call</li>
              <li><code>POST /telephony/twilio/webhook</code> - Twilio webhook endpoint</li>
              <li><code>POST /telephony/plivo/webhook</code> - Plivo webhook endpoint</li>
              <li><code>GET /telephony/webhook-url/:provider</code> - Get webhook URL for provider</li>
            </ul>
          </div>
          
          <div class="endpoints">
            <h2>API Server Endpoints (Port 3000):</h2>
            <ul>
              <li><code>GET /agents</code> - List all agents</li>
              <li><code>POST /agents</code> - Create a new agent</li>
              <li><code>GET /agents/:id</code> - Get an agent by ID</li>
              <li><code>PUT /agents/:id</code> - Update an agent</li>
              <li><code>DELETE /agents/:id</code> - Delete an agent</li>
            </ul>
          </div>
          
          <p>For more information, please refer to the <a href="https://github.com/yourusername/bolna-nest/blob/main/README.md">README</a> or <a href="https://github.com/yourusername/bolna-nest/blob/main/DOCKER_SETUP.md">DOCKER_SETUP.md</a>.</p>
          
          <p><strong>Telephony Server</strong> is running on port 3001!</p>
          <p><strong>API Server</strong> is running on port 3000!</p>
        </body>
      </html>
    `;
  }
}

// Create a controller for the telephony server welcome page
@Controller()
class TelephonyServerController {
  constructor(private readonly telephonyServerService: TelephonyServerService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getWelcome(): string {
    return this.telephonyServerService.getWelcome();
  }
}

// Create a standalone module for the telephony server
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    WebsocketModule,
    AgentModule,
    AsrModule,
    LlmModule,
    TtsModule,
    TelephonyModule,
  ],
  controllers: [TelephonyServerController],
  providers: [TelephonyServerService],
})
class TelephonyServerModule {}

async function bootstrap() {
  const logger = new Logger('TelephonyBootstrap');
  const app = await NestFactory.create(TelephonyServerModule);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS
  app.enableCors();
  
  // Get port from environment variable or use default
  const port = process.env.PORT || 3001;
  
  // Start the server
  await app.listen(port);
  
  logger.log(`Telephony server is running on: http://localhost:${port}`);
  logger.log('Telephony server is ready to handle calls');
}

bootstrap();