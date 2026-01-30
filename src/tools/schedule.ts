/**
 * Schedule Tools
 *
 * MCP tools for Basecamp Schedule and schedule entries.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerScheduleTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // Get Schedule
  // ===========================================================================
  server.tool(
    'basecamp_get_schedule',
    `Get the schedule for a project.

The schedule is the container for all calendar events. Get the schedule ID
from the project's dock items.

Args:
  - projectId: The project ID
  - scheduleId: The schedule ID
  - format: Response format

Returns:
  The schedule with entry count and entries URL.`,
    {
      projectId: z.number().describe('Project ID'),
      scheduleId: z.number().describe('Schedule ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, scheduleId, format }) => {
      try {
        const schedule = await client.getSchedule(projectId, scheduleId);
        return formatResponse(schedule, format, 'schedule');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Schedule Entries
  // ===========================================================================
  server.tool(
    'basecamp_list_schedule_entries',
    `List all schedule entries (events) in a schedule.

Args:
  - projectId: The project ID
  - scheduleId: The schedule ID
  - status: Filter by status ('active', 'archived', 'trashed')
  - format: Response format

Returns:
  Paginated list of schedule entries.`,
    {
      projectId: z.number().describe('Project ID'),
      scheduleId: z.number().describe('Schedule ID'),
      status: z.enum(['active', 'archived', 'trashed']).optional().describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, scheduleId, status, format }) => {
      try {
        const result = await client.listScheduleEntries(projectId, scheduleId, { status });
        return formatResponse(result, format, 'scheduleEntries');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Schedule Entry
  // ===========================================================================
  server.tool(
    'basecamp_get_schedule_entry',
    `Get a single schedule entry (event).

Args:
  - projectId: The project ID
  - entryId: The schedule entry ID
  - format: Response format

Returns:
  The schedule entry with dates, participants, and description.`,
    {
      projectId: z.number().describe('Project ID'),
      entryId: z.number().describe('Schedule entry ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, entryId, format }) => {
      try {
        const entry = await client.getScheduleEntry(projectId, entryId);
        return formatResponse(entry, format, 'scheduleEntry');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Schedule Entry
  // ===========================================================================
  server.tool(
    'basecamp_create_schedule_entry',
    `Create a new schedule entry (event).

Args:
  - projectId: The project ID
  - scheduleId: The schedule ID
  - summary: Event title (required)
  - startsAt: Start date/time in ISO 8601 format (required)
  - endsAt: End date/time in ISO 8601 format (required)
  - description: HTML description
  - participantIds: Array of person IDs to invite
  - allDay: Whether this is an all-day event
  - notify: Whether to notify participants

Returns:
  The created schedule entry.`,
    {
      projectId: z.number().describe('Project ID'),
      scheduleId: z.number().describe('Schedule ID'),
      summary: z.string().describe('Event title'),
      startsAt: z.string().describe('Start date/time (ISO 8601)'),
      endsAt: z.string().describe('End date/time (ISO 8601)'),
      description: z.string().optional().describe('HTML description'),
      participantIds: z.array(z.number()).optional().describe('Person IDs to invite'),
      allDay: z.boolean().optional().describe('All-day event'),
      notify: z.boolean().optional().describe('Notify participants'),
    },
    async ({ projectId, scheduleId, ...input }) => {
      try {
        const entry = await client.createScheduleEntry(projectId, scheduleId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Schedule entry created', entry }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Schedule Entry
  // ===========================================================================
  server.tool(
    'basecamp_update_schedule_entry',
    `Update an existing schedule entry (event).

Args:
  - projectId: The project ID
  - entryId: The schedule entry ID
  - summary: New event title
  - startsAt: New start date/time (ISO 8601)
  - endsAt: New end date/time (ISO 8601)
  - description: New HTML description
  - participantIds: New array of person IDs
  - allDay: Whether this is an all-day event
  - notify: Whether to notify participants

Returns:
  The updated schedule entry.`,
    {
      projectId: z.number().describe('Project ID'),
      entryId: z.number().describe('Schedule entry ID'),
      summary: z.string().optional().describe('New event title'),
      startsAt: z.string().optional().describe('New start date/time (ISO 8601)'),
      endsAt: z.string().optional().describe('New end date/time (ISO 8601)'),
      description: z.string().optional().describe('New HTML description'),
      participantIds: z.array(z.number()).optional().describe('New person IDs'),
      allDay: z.boolean().optional().describe('All-day event'),
      notify: z.boolean().optional().describe('Notify participants'),
    },
    async ({ projectId, entryId, ...input }) => {
      try {
        const entry = await client.updateScheduleEntry(projectId, entryId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Schedule entry updated', entry }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
