/**
 * Campfire Tools
 *
 * MCP tools for Basecamp Campfire (chat).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerCampfireTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // List Campfires
  // ===========================================================================
  server.tool(
    'basecamp_list_campfires',
    `List all Campfires visible to the current user.

Returns:
  Paginated list of all Campfires across projects.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const result = await client.listCampfires();
        return formatResponse(result, format, 'campfires');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Campfire
  // ===========================================================================
  server.tool(
    'basecamp_get_campfire',
    `Get a Campfire by ID.

Args:
  - projectId: The project ID
  - campfireId: The Campfire ID
  - format: Response format

Returns:
  The Campfire with topic and lines URL.`,
    {
      projectId: z.number().describe('Project ID'),
      campfireId: z.number().describe('Campfire ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, campfireId, format }) => {
      try {
        const campfire = await client.getCampfire(projectId, campfireId);
        return formatResponse(campfire, format, 'campfire');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Campfire Lines
  // ===========================================================================
  server.tool(
    'basecamp_list_campfire_lines',
    `List chat messages in a Campfire.

Args:
  - projectId: The project ID
  - campfireId: The Campfire ID
  - format: Response format

Returns:
  Paginated list of chat lines/messages.`,
    {
      projectId: z.number().describe('Project ID'),
      campfireId: z.number().describe('Campfire ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, campfireId, format }) => {
      try {
        const result = await client.listCampfireLines(projectId, campfireId);
        return formatResponse(result, format, 'campfireLines');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Campfire Line
  // ===========================================================================
  server.tool(
    'basecamp_get_campfire_line',
    `Get a single Campfire chat message.

Args:
  - projectId: The project ID
  - lineId: The line/message ID
  - format: Response format

Returns:
  The chat message with content and creator.`,
    {
      projectId: z.number().describe('Project ID'),
      lineId: z.number().describe('Line ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, lineId, format }) => {
      try {
        const line = await client.getCampfireLine(projectId, lineId);
        return formatResponse(line, format, 'campfireLine');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Campfire Line
  // ===========================================================================
  server.tool(
    'basecamp_create_campfire_line',
    `Post a new message to a Campfire.

Args:
  - projectId: The project ID
  - campfireId: The Campfire ID
  - content: The message content (plain text)

Returns:
  The created chat message.`,
    {
      projectId: z.number().describe('Project ID'),
      campfireId: z.number().describe('Campfire ID'),
      content: z.string().describe('Message content'),
    },
    async ({ projectId, campfireId, content }) => {
      try {
        const line = await client.createCampfireLine(projectId, campfireId, { content });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Message posted', line }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Campfire Line
  // ===========================================================================
  server.tool(
    'basecamp_delete_campfire_line',
    `Delete a Campfire chat message.

Args:
  - projectId: The project ID
  - lineId: The line/message ID to delete

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.number().describe('Project ID'),
      lineId: z.number().describe('Line ID to delete'),
    },
    async ({ projectId, lineId }) => {
      try {
        await client.deleteCampfireLine(projectId, lineId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Campfire line ${lineId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
