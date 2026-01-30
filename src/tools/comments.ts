/**
 * Comment Tools
 *
 * MCP tools for Basecamp comments on any recording.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerCommentTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // List Comments
  // ===========================================================================
  server.tool(
    'basecamp_list_comments',
    `List all comments on a recording (message, todo, document, etc.).

Args:
  - projectId: The project ID
  - recordingId: The recording ID (message, todo, document, etc.)
  - format: Response format

Returns:
  Paginated list of comments.`,
    {
      projectId: z.number().describe('Project ID'),
      recordingId: z.number().describe('Recording ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, recordingId, format }) => {
      try {
        const result = await client.listComments(projectId, recordingId);
        return formatResponse(result, format, 'comments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Comment
  // ===========================================================================
  server.tool(
    'basecamp_get_comment',
    `Get a single comment.

Args:
  - projectId: The project ID
  - commentId: The comment ID
  - format: Response format

Returns:
  The comment with content and creator.`,
    {
      projectId: z.number().describe('Project ID'),
      commentId: z.number().describe('Comment ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, commentId, format }) => {
      try {
        const comment = await client.getComment(projectId, commentId);
        return formatResponse(comment, format, 'comment');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Comment
  // ===========================================================================
  server.tool(
    'basecamp_create_comment',
    `Add a comment to a recording (message, todo, document, etc.).

Args:
  - projectId: The project ID
  - recordingId: The recording ID to comment on
  - content: HTML content of the comment

Returns:
  The created comment.`,
    {
      projectId: z.number().describe('Project ID'),
      recordingId: z.number().describe('Recording ID'),
      content: z.string().describe('HTML content'),
    },
    async ({ projectId, recordingId, content }) => {
      try {
        const comment = await client.createComment(projectId, recordingId, { content });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Comment created', comment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Comment
  // ===========================================================================
  server.tool(
    'basecamp_update_comment',
    `Update an existing comment.

Args:
  - projectId: The project ID
  - commentId: The comment ID
  - content: New HTML content

Returns:
  The updated comment.`,
    {
      projectId: z.number().describe('Project ID'),
      commentId: z.number().describe('Comment ID'),
      content: z.string().describe('New HTML content'),
    },
    async ({ projectId, commentId, content }) => {
      try {
        const comment = await client.updateComment(projectId, commentId, { content });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Comment updated', comment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
