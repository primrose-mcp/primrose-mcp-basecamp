/**
 * Basecamp MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports stateless (McpServer) mode for multi-tenant deployments.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (OAuth tokens, account IDs) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Basecamp-Access-Token: OAuth 2.0 access token
 * - X-Basecamp-Account-ID: Basecamp account ID
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createBasecampClient } from './client.js';
import {
  registerCampfireTools,
  registerCardTableTools,
  registerCommentTools,
  registerDocumentTools,
  registerMessageTools,
  registerPeopleTools,
  registerProjectTools,
  registerRecordingTools,
  registerScheduleTools,
  registerTodoTools,
  registerWebhookTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-basecamp';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode instead.
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class BasecampMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Basecamp-Access-Token and X-Basecamp-Account-ID headers.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createBasecampClient(credentials);

  // Register all tool groups
  registerPeopleTools(server, client);
  registerProjectTools(server, client);
  registerTodoTools(server, client);
  registerMessageTools(server, client);
  registerCampfireTools(server, client);
  registerScheduleTools(server, client);
  registerDocumentTools(server, client);
  registerCommentTools(server, client);
  registerCardTableTools(server, client);
  registerWebhookTools(server, client);
  registerRecordingTools(server, client);

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Basecamp-Access-Token', 'X-Basecamp-Account-ID'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint (not supported in multi-tenant mode)
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Basecamp MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-Basecamp-Access-Token': 'OAuth 2.0 access token from Basecamp',
            'X-Basecamp-Account-ID': 'Basecamp account ID',
          },
          oauth_setup:
            'Register your app at https://launchpad.37signals.com/integrations to get OAuth credentials',
        },
        api_reference: 'https://github.com/basecamp/bc3-api',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
