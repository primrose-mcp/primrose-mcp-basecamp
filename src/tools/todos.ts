/**
 * Todo Tools
 *
 * MCP tools for Basecamp to-dos, to-do lists, and to-do sets.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerTodoTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // Get Todoset
  // ===========================================================================
  server.tool(
    'basecamp_get_todoset',
    `Get a to-do set for a project.

The todoset is the container for all to-do lists in a project. Get the todoset ID
from the project's dock items.

Args:
  - projectId: The project ID (bucket ID)
  - todosetId: The todoset ID

Returns:
  The todoset with completion stats and link to todolists.`,
    {
      projectId: z.number().describe('Project ID'),
      todosetId: z.number().describe('Todoset ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, todosetId, format }) => {
      try {
        const todoset = await client.getTodoset(projectId, todosetId);
        return formatResponse(todoset, format, 'todoset');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Todolists
  // ===========================================================================
  server.tool(
    'basecamp_list_todolists',
    `List all to-do lists in a todoset.

Args:
  - projectId: The project ID
  - todosetId: The todoset ID
  - status: Filter by status ('active', 'archived', 'trashed')
  - format: Response format

Returns:
  Paginated list of to-do lists.`,
    {
      projectId: z.number().describe('Project ID'),
      todosetId: z.number().describe('Todoset ID'),
      status: z.enum(['active', 'archived', 'trashed']).optional().describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, todosetId, status, format }) => {
      try {
        const result = await client.listTodolists(projectId, todosetId, { status });
        return formatResponse(result, format, 'todolists');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Todolist
  // ===========================================================================
  server.tool(
    'basecamp_get_todolist',
    `Get a single to-do list.

Args:
  - projectId: The project ID
  - todolistId: The to-do list ID
  - format: Response format

Returns:
  The to-do list with completion stats.`,
    {
      projectId: z.number().describe('Project ID'),
      todolistId: z.number().describe('Todolist ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, todolistId, format }) => {
      try {
        const todolist = await client.getTodolist(projectId, todolistId);
        return formatResponse(todolist, format, 'todolist');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Todolist
  // ===========================================================================
  server.tool(
    'basecamp_create_todolist',
    `Create a new to-do list in a todoset.

Args:
  - projectId: The project ID
  - todosetId: The todoset ID
  - name: Name of the to-do list (required)
  - description: HTML description

Returns:
  The created to-do list.`,
    {
      projectId: z.number().describe('Project ID'),
      todosetId: z.number().describe('Todoset ID'),
      name: z.string().describe('Todolist name'),
      description: z.string().optional().describe('HTML description'),
    },
    async ({ projectId, todosetId, name, description }) => {
      try {
        const todolist = await client.createTodolist(projectId, todosetId, { name, description });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Todolist created', todolist }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Todolist
  // ===========================================================================
  server.tool(
    'basecamp_update_todolist',
    `Update an existing to-do list.

Args:
  - projectId: The project ID
  - todolistId: The to-do list ID
  - name: New name (required)
  - description: New HTML description

Returns:
  The updated to-do list.`,
    {
      projectId: z.number().describe('Project ID'),
      todolistId: z.number().describe('Todolist ID'),
      name: z.string().describe('Todolist name'),
      description: z.string().optional().describe('HTML description'),
    },
    async ({ projectId, todolistId, name, description }) => {
      try {
        const todolist = await client.updateTodolist(projectId, todolistId, { name, description });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Todolist updated', todolist }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Todos
  // ===========================================================================
  server.tool(
    'basecamp_list_todos',
    `List all to-dos in a to-do list.

Args:
  - projectId: The project ID
  - todolistId: The to-do list ID
  - status: Filter by status ('active', 'archived', 'trashed')
  - completed: Filter by completion (true = completed only, false = pending only)
  - format: Response format

Returns:
  Paginated list of to-dos.`,
    {
      projectId: z.number().describe('Project ID'),
      todolistId: z.number().describe('Todolist ID'),
      status: z.enum(['active', 'archived', 'trashed']).optional().describe('Filter by status'),
      completed: z.boolean().optional().describe('Filter by completion status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, todolistId, status, completed, format }) => {
      try {
        const result = await client.listTodos(projectId, todolistId, { status, completed });
        return formatResponse(result, format, 'todos');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Todo
  // ===========================================================================
  server.tool(
    'basecamp_get_todo',
    `Get a single to-do.

Args:
  - projectId: The project ID
  - todoId: The to-do ID
  - format: Response format

Returns:
  The to-do with assignees, due date, and description.`,
    {
      projectId: z.number().describe('Project ID'),
      todoId: z.number().describe('Todo ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, todoId, format }) => {
      try {
        const todo = await client.getTodo(projectId, todoId);
        return formatResponse(todo, format, 'todo');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Todo
  // ===========================================================================
  server.tool(
    'basecamp_create_todo',
    `Create a new to-do in a to-do list.

Args:
  - projectId: The project ID
  - todolistId: The to-do list ID
  - content: The to-do content/title (required)
  - description: HTML description
  - assigneeIds: Array of person IDs to assign
  - dueOn: Due date (YYYY-MM-DD format)
  - startsOn: Start date (YYYY-MM-DD format)
  - notify: Whether to notify assignees

Returns:
  The created to-do.`,
    {
      projectId: z.number().describe('Project ID'),
      todolistId: z.number().describe('Todolist ID'),
      content: z.string().describe('Todo content/title'),
      description: z.string().optional().describe('HTML description'),
      assigneeIds: z.array(z.number()).optional().describe('Person IDs to assign'),
      dueOn: z.string().optional().describe('Due date (YYYY-MM-DD)'),
      startsOn: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      notify: z.boolean().optional().describe('Notify assignees'),
    },
    async ({ projectId, todolistId, ...input }) => {
      try {
        const todo = await client.createTodo(projectId, todolistId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Todo created', todo }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Todo
  // ===========================================================================
  server.tool(
    'basecamp_update_todo',
    `Update an existing to-do.

Args:
  - projectId: The project ID
  - todoId: The to-do ID
  - content: New to-do content/title
  - description: New HTML description
  - assigneeIds: New array of person IDs to assign
  - dueOn: New due date (YYYY-MM-DD format)
  - startsOn: New start date (YYYY-MM-DD format)

Returns:
  The updated to-do.`,
    {
      projectId: z.number().describe('Project ID'),
      todoId: z.number().describe('Todo ID'),
      content: z.string().optional().describe('Todo content/title'),
      description: z.string().optional().describe('HTML description'),
      assigneeIds: z.array(z.number()).optional().describe('Person IDs to assign'),
      dueOn: z.string().optional().describe('Due date (YYYY-MM-DD)'),
      startsOn: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    },
    async ({ projectId, todoId, ...input }) => {
      try {
        const todo = await client.updateTodo(projectId, todoId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Todo updated', todo }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Complete Todo
  // ===========================================================================
  server.tool(
    'basecamp_complete_todo',
    `Mark a to-do as complete.

Args:
  - projectId: The project ID
  - todoId: The to-do ID

Returns:
  Confirmation of completion.`,
    {
      projectId: z.number().describe('Project ID'),
      todoId: z.number().describe('Todo ID'),
    },
    async ({ projectId, todoId }) => {
      try {
        await client.completeTodo(projectId, todoId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Todo ${todoId} marked as complete` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Uncomplete Todo
  // ===========================================================================
  server.tool(
    'basecamp_uncomplete_todo',
    `Mark a to-do as incomplete.

Args:
  - projectId: The project ID
  - todoId: The to-do ID

Returns:
  Confirmation.`,
    {
      projectId: z.number().describe('Project ID'),
      todoId: z.number().describe('Todo ID'),
    },
    async ({ projectId, todoId }) => {
      try {
        await client.uncompleteTodo(projectId, todoId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Todo ${todoId} marked as incomplete` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
