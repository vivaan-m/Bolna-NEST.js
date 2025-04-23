import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
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
            <h2>Available Endpoints:</h2>
            <ul>
              <li><code>GET /agents</code> - List all agents</li>
              <li><code>POST /agents</code> - Create a new agent</li>
              <li><code>GET /agents/:id</code> - Get an agent by ID</li>
              <li><code>PUT /agents/:id</code> - Update an agent</li>
              <li><code>DELETE /agents/:id</code> - Delete an agent</li>
              <li><code>POST /telephony/call</code> - Initiate a call</li>
              <li><code>DELETE /telephony/call/:provider/:callId</code> - End a call</li>
            </ul>
          </div>
          
          <p>For more information, please refer to the API documentation or README.</p>
          
          <p>Server is up and running!</p>
        </body>
      </html>
    `;
  }
}
