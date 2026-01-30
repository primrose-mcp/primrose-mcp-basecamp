/**
 * Webhook Tools
 *
 * MCP tools for Basecamp webhooks.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerWebhookTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // List Webhooks
  // ===========================================================================
  server.tool(
    'basecamp_list_webhooks',
    `List all webhooks for a project.

Args:
  - projectId: The project ID
  - format: Response format

Returns:
  Paginated list of webhooks.`,
    {
      projectId: z.number().describe('Project ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, format }) => {
      try {
        const result = await client.listWebhooks(projectId);
        return formatResponse(result, format, 'webhooks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Webhook
  // ===========================================================================
  server.tool(
    'basecamp_get_webhook',
    `Get a single webhook with delivery history.

Args:
  - projectId: The project ID
  - webhookId: The webhook ID
  - format: Response format

Returns:
  The webhook with its configuration.`,
    {
      projectId: z.number().describe('Project ID'),
      webhookId: z.number().describe('Webhook ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, webhookId, format }) => {
      try {
        const webhook = await client.getWebhook(projectId, webhookId);
        return formatResponse(webhook, format, 'webhook');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Webhook
  // ===========================================================================
  server.tool(
    'basecamp_create_webhook',
    `Create a new webhook for a project.

Args:
  - projectId: The project ID
  - payloadUrl: HTTPS URL to receive webhook payloads (required)
  - types: Array of event types to subscribe to, or ['all'] for all events

Supported event types:
  Comment, Document, Message, Todo, Todolist, Upload, Vault, Schedule::Entry,
  Question, Question::Answer, Kanban::Card, Kanban::Step, CloudFile, GoogleDocument,
  Client::Approval::Response, Client::Forward, Client::Reply, Inbox::Forward

Returns:
  The created webhook.`,
    {
      projectId: z.number().describe('Project ID'),
      payloadUrl: z.string().url().describe('HTTPS payload URL'),
      types: z.array(z.string()).describe('Event types to subscribe to'),
    },
    async ({ projectId, payloadUrl, types }) => {
      try {
        const webhook = await client.createWebhook(projectId, { payloadUrl, types });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Webhook created', webhook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Webhook
  // ===========================================================================
  server.tool(
    'basecamp_update_webhook',
    `Update an existing webhook.

Args:
  - projectId: The project ID
  - webhookId: The webhook ID
  - payloadUrl: New HTTPS payload URL
  - types: New array of event types
  - active: Enable/disable the webhook

Returns:
  The updated webhook.`,
    {
      projectId: z.number().describe('Project ID'),
      webhookId: z.number().describe('Webhook ID'),
      payloadUrl: z.string().url().optional().describe('New HTTPS payload URL'),
      types: z.array(z.string()).optional().describe('New event types'),
      active: z.boolean().optional().describe('Enable/disable webhook'),
    },
    async ({ projectId, webhookId, ...input }) => {
      try {
        const webhook = await client.updateWebhook(projectId, webhookId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Webhook updated', webhook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Webhook
  // ===========================================================================
  server.tool(
    'basecamp_delete_webhook',
    `Delete a webhook.

Args:
  - projectId: The project ID
  - webhookId: The webhook ID

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.number().describe('Project ID'),
      webhookId: z.number().describe('Webhook ID'),
    },
    async ({ projectId, webhookId }) => {
      try {
        await client.deleteWebhook(projectId, webhookId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Webhook ${webhookId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
