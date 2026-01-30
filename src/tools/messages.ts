/**
 * Message Tools
 *
 * MCP tools for Basecamp messages and message boards.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerMessageTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // Get Message Board
  // ===========================================================================
  server.tool(
    'basecamp_get_message_board',
    `Get the message board for a project.

The message board is the container for all messages in a project. Get the message
board ID from the project's dock items.

Args:
  - projectId: The project ID
  - messageBoardId: The message board ID
  - format: Response format

Returns:
  The message board with message count and messages URL.`,
    {
      projectId: z.number().describe('Project ID'),
      messageBoardId: z.number().describe('Message board ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, messageBoardId, format }) => {
      try {
        const messageBoard = await client.getMessageBoard(projectId, messageBoardId);
        return formatResponse(messageBoard, format, 'messageBoard');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Messages
  // ===========================================================================
  server.tool(
    'basecamp_list_messages',
    `List all messages in a message board.

Args:
  - projectId: The project ID
  - messageBoardId: The message board ID
  - status: Filter by status ('active', 'archived', 'trashed')
  - format: Response format

Returns:
  Paginated list of messages.`,
    {
      projectId: z.number().describe('Project ID'),
      messageBoardId: z.number().describe('Message board ID'),
      status: z.enum(['active', 'archived', 'trashed']).optional().describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, messageBoardId, status, format }) => {
      try {
        const result = await client.listMessages(projectId, messageBoardId, { status });
        return formatResponse(result, format, 'messages');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Message
  // ===========================================================================
  server.tool(
    'basecamp_get_message',
    `Get a single message.

Args:
  - projectId: The project ID
  - messageId: The message ID
  - format: Response format

Returns:
  The message with subject, content, and creator.`,
    {
      projectId: z.number().describe('Project ID'),
      messageId: z.number().describe('Message ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, messageId, format }) => {
      try {
        const message = await client.getMessage(projectId, messageId);
        return formatResponse(message, format, 'message');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Message
  // ===========================================================================
  server.tool(
    'basecamp_create_message',
    `Create a new message on a message board.

Args:
  - projectId: The project ID
  - messageBoardId: The message board ID
  - subject: Message subject (required)
  - content: HTML content
  - status: 'active' to publish immediately, 'draft' to save as draft
  - categoryId: Message type/category ID

Returns:
  The created message.`,
    {
      projectId: z.number().describe('Project ID'),
      messageBoardId: z.number().describe('Message board ID'),
      subject: z.string().describe('Message subject'),
      content: z.string().optional().describe('HTML content'),
      status: z.enum(['active', 'draft']).default('active').describe('Publish status'),
      categoryId: z.number().optional().describe('Message category ID'),
    },
    async ({ projectId, messageBoardId, subject, content, status, categoryId }) => {
      try {
        const message = await client.createMessage(projectId, messageBoardId, {
          subject,
          content,
          status,
          categoryId,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Message created', result: message }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Message
  // ===========================================================================
  server.tool(
    'basecamp_update_message',
    `Update an existing message.

Args:
  - projectId: The project ID
  - messageId: The message ID
  - subject: New subject
  - content: New HTML content
  - categoryId: New category ID

Returns:
  The updated message.`,
    {
      projectId: z.number().describe('Project ID'),
      messageId: z.number().describe('Message ID'),
      subject: z.string().optional().describe('New subject'),
      content: z.string().optional().describe('New HTML content'),
      categoryId: z.number().optional().describe('New category ID'),
    },
    async ({ projectId, messageId, ...input }) => {
      try {
        const message = await client.updateMessage(projectId, messageId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Message updated', result: message }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
