/**
 * People Tools
 *
 * MCP tools for Basecamp people/users.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerPeopleTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // Test Connection
  // ===========================================================================
  server.tool(
    'basecamp_test_connection',
    `Test the connection to Basecamp API.

Verifies that the OAuth token and account ID are valid.

Returns:
  Connection status and current user info.`,
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get My Profile
  // ===========================================================================
  server.tool(
    'basecamp_get_my_profile',
    `Get the current user's profile.

Returns:
  The authenticated user's profile information.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const profile = await client.getMyProfile();
        return formatResponse(profile, format, 'person');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List People
  // ===========================================================================
  server.tool(
    'basecamp_list_people',
    `List all people visible to the current user.

Returns:
  Paginated list of all people in the account.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const result = await client.listPeople();
        return formatResponse(result, format, 'people');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Project People
  // ===========================================================================
  server.tool(
    'basecamp_list_project_people',
    `List all people assigned to a project.

Args:
  - projectId: The project ID
  - format: Response format

Returns:
  Paginated list of people in the project.`,
    {
      projectId: z.number().describe('Project ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, format }) => {
      try {
        const result = await client.listProjectPeople(projectId);
        return formatResponse(result, format, 'people');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Person
  // ===========================================================================
  server.tool(
    'basecamp_get_person',
    `Get a person by ID.

Args:
  - personId: The person ID
  - format: Response format

Returns:
  The person's profile information.`,
    {
      personId: z.number().describe('Person ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ personId, format }) => {
      try {
        const person = await client.getPerson(personId);
        return formatResponse(person, format, 'person');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
