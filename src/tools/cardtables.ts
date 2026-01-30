/**
 * Card Table (Kanban) Tools
 *
 * MCP tools for Basecamp Card Tables (Kanban boards).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerCardTableTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // Get Card Table
  // ===========================================================================
  server.tool(
    'basecamp_get_card_table',
    `Get a card table (Kanban board).

Get the card table ID from the project's dock items.

Args:
  - projectId: The project ID
  - cardTableId: The card table ID
  - format: Response format

Returns:
  The card table with all columns and their card counts.`,
    {
      projectId: z.number().describe('Project ID'),
      cardTableId: z.number().describe('Card table ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, cardTableId, format }) => {
      try {
        const cardTable = await client.getCardTable(projectId, cardTableId);
        return formatResponse(cardTable, format, 'cardTable');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Cards in Column
  // ===========================================================================
  server.tool(
    'basecamp_list_cards',
    `List all cards in a card table column.

Args:
  - projectId: The project ID
  - columnId: The column ID
  - format: Response format

Returns:
  Paginated list of cards in the column.`,
    {
      projectId: z.number().describe('Project ID'),
      columnId: z.number().describe('Column ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, columnId, format }) => {
      try {
        const result = await client.listCards(projectId, columnId);
        return formatResponse(result, format, 'cards');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Card
  // ===========================================================================
  server.tool(
    'basecamp_get_card',
    `Get a single card.

Args:
  - projectId: The project ID
  - cardId: The card ID
  - format: Response format

Returns:
  The card with title, content, assignees, and due date.`,
    {
      projectId: z.number().describe('Project ID'),
      cardId: z.number().describe('Card ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, cardId, format }) => {
      try {
        const card = await client.getCard(projectId, cardId);
        return formatResponse(card, format, 'card');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
