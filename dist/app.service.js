"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    getHello() {
        return `
      <html>
        <head>
          <title>Bolna - Voice AI Platform</title>
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
          <h1>Bolna - Voice AI Platform</h1>
          <p>Welcome to the Bolna Voice AI Platform API. This platform provides services for building voice-driven conversational AI agents.</p>
          
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
          
          <p>For more information, please refer to the <a href="https://github.com/yourusername/bolna-nest/blob/main/README.md">README</a> or <a href="https://github.com/yourusername/bolna-nest/blob/main/DOCKER_SETUP.md">DOCKER_SETUP.md</a>.</p>
          
          <p><strong>API Server</strong> is running on port 3000!</p>
          <p><strong>Telephony Server</strong> is running on port 3001!</p>
        </body>
      </html>
    `;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map