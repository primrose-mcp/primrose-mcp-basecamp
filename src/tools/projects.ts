/**
 * Project Tools
 *
 * MCP tools for Basecamp project management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerProjectTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // List Projects
  // ===========================================================================
  server.tool(
    'basecamp_list_projects',
    `List all Basecamp projects.

Returns a paginated list of projects visible to the current user.

Args:
  - status: Filter by status ('active', 'archived', 'trashed'). Default: 'active'
  - format: Response format ('json' or 'markdown')

Returns:
  List of projects with their names, descriptions, and dock items.`,
    {
      status: z
        .enum(['active', 'archived', 'trashed'])
        .default('active')
        .describe('Filter by project status'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ status, format }) => {
      try {
        const result = await client.listProjects({ status });
        return formatResponse(result, format, 'projects');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Project
  // ===========================================================================
  server.tool(
    'basecamp_get_project',
    `Get a single Basecamp project by ID.

Args:
  - projectId: The project ID
  - format: Response format ('json' or 'markdown')

Returns:
  The project with its dock items (message board, todoset, schedule, vault, etc.)`,
    {
      projectId: z.number().describe('Project ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, format }) => {
      try {
        const project = await client.getProject(projectId);
        return formatResponse(project, format, 'project');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Project
  // ===========================================================================
  server.tool(
    'basecamp_create_project',
    `Create a new Basecamp project.

Args:
  - name: Project name (required)
  - description: Project description

Returns:
  The created project.`,
    {
      name: z.string().describe('Project name'),
      description: z.string().optional().describe('Project description'),
    },
    async (input) => {
      try {
        const project = await client.createProject(input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Project created', project }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Project
  // ===========================================================================
  server.tool(
    'basecamp_update_project',
    `Update an existing Basecamp project.

Args:
  - projectId: Project ID to update
  - name: New project name
  - description: New project description

Returns:
  The updated project.`,
    {
      projectId: z.number().describe('Project ID to update'),
      name: z.string().optional().describe('New project name'),
      description: z.string().optional().describe('New project description'),
    },
    async ({ projectId, ...input }) => {
      try {
        const project = await client.updateProject(projectId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Project updated', project }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Trash Project
  // ===========================================================================
  server.tool(
    'basecamp_trash_project',
    `Move a Basecamp project to trash.

Args:
  - projectId: Project ID to trash

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.number().describe('Project ID to trash'),
    },
    async ({ projectId }) => {
      try {
        await client.trashProject(projectId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Project ${projectId} moved to trash` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
