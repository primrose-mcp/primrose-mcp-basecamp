/**
 * Recording Tools
 *
 * MCP tools for Basecamp recordings (archive/trash operations).
 * Recordings are a generic type that encompasses all content types.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerRecordingTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // List Recordings
  // ===========================================================================
  server.tool(
    'basecamp_list_recordings',
    `List recordings across projects.

Recordings represent all content types in Basecamp. Use this to find items
across multiple projects or to list archived/trashed items.

Args:
  - type: Recording type (required). One of:
    Comment, Document, Message, Todo, Todolist, Upload, Vault, Schedule::Entry,
    Question::Answer, Kanban::Card, Kanban::Step
  - bucketIds: Array of project IDs to filter by
  - status: Filter by status ('active', 'archived', 'trashed'). Default: 'active'
  - sort: Sort by 'created_at' or 'updated_at'. Default: 'created_at'
  - direction: Sort direction ('asc' or 'desc'). Default: 'desc'
  - format: Response format

Returns:
  Paginated list of recordings.`,
    {
      type: z.string().describe('Recording type (e.g., Todo, Message, Document)'),
      bucketIds: z.array(z.number()).optional().describe('Project IDs to filter by'),
      status: z.enum(['active', 'archived', 'trashed']).default('active').describe('Filter by status'),
      sort: z.enum(['created_at', 'updated_at']).default('created_at').describe('Sort field'),
      direction: z.enum(['asc', 'desc']).default('desc').describe('Sort direction'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ type, bucketIds, status, sort, direction, format }) => {
      try {
        const result = await client.listRecordings({
          type,
          bucket: bucketIds,
          status,
          sort,
          direction,
        });
        return formatResponse(result, format, 'recordings');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Trash Recording
  // ===========================================================================
  server.tool(
    'basecamp_trash_recording',
    `Move a recording to trash.

Use this to delete any content type (message, todo, document, etc.).

Args:
  - projectId: The project ID
  - recordingId: The recording ID to trash

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.number().describe('Project ID'),
      recordingId: z.number().describe('Recording ID to trash'),
    },
    async ({ projectId, recordingId }) => {
      try {
        await client.trashRecording(projectId, recordingId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Recording ${recordingId} moved to trash` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Archive Recording
  // ===========================================================================
  server.tool(
    'basecamp_archive_recording',
    `Archive a recording.

Use this to archive any content type (message, todo, document, etc.).

Args:
  - projectId: The project ID
  - recordingId: The recording ID to archive

Returns:
  Confirmation of archival.`,
    {
      projectId: z.number().describe('Project ID'),
      recordingId: z.number().describe('Recording ID to archive'),
    },
    async ({ projectId, recordingId }) => {
      try {
        await client.archiveRecording(projectId, recordingId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Recording ${recordingId} archived` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Unarchive Recording
  // ===========================================================================
  server.tool(
    'basecamp_unarchive_recording',
    `Restore an archived recording to active status.

Args:
  - projectId: The project ID
  - recordingId: The recording ID to unarchive

Returns:
  Confirmation of restoration.`,
    {
      projectId: z.number().describe('Project ID'),
      recordingId: z.number().describe('Recording ID to unarchive'),
    },
    async ({ projectId, recordingId }) => {
      try {
        await client.unarchiveRecording(projectId, recordingId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Recording ${recordingId} restored to active` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
