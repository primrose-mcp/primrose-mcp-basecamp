/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  Message,
  PaginatedResponse,
  Person,
  Project,
  ResponseFormat,
  ScheduleEntry,
  Todo,
  Todolist,
} from '../types/entities.js';
import { CrmApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof CrmApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatGenericTable(data);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');
  lines.push(`**Showing:** ${data.count}`);

  if (data.hasMore) {
    lines.push(`**More available:** Yes`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  // Format items based on entity type
  switch (entityType) {
    case 'projects':
      lines.push(formatProjectsTable(data.items as Project[]));
      break;
    case 'people':
      lines.push(formatPeopleTable(data.items as Person[]));
      break;
    case 'todos':
      lines.push(formatTodosTable(data.items as Todo[]));
      break;
    case 'todolists':
      lines.push(formatTodolistsTable(data.items as Todolist[]));
      break;
    case 'messages':
      lines.push(formatMessagesTable(data.items as Message[]));
      break;
    case 'scheduleEntries':
      lines.push(formatScheduleEntriesTable(data.items as ScheduleEntry[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format projects as Markdown table
 */
function formatProjectsTable(projects: Project[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Status | Description |');
  lines.push('|---|---|---|---|');

  for (const project of projects) {
    const desc = project.description ? project.description.slice(0, 50) : '-';
    lines.push(`| ${project.id} | ${project.name} | ${project.status} | ${desc} |`);
  }

  return lines.join('\n');
}

/**
 * Format people as Markdown table
 */
function formatPeopleTable(people: Person[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Email | Title | Admin |');
  lines.push('|---|---|---|---|---|');

  for (const person of people) {
    lines.push(
      `| ${person.id} | ${person.name} | ${person.emailAddress} | ${person.title || '-'} | ${person.admin ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format todos as Markdown table
 */
function formatTodosTable(todos: Todo[]): string {
  const lines: string[] = [];
  lines.push('| ID | Content | Status | Due | Assignees |');
  lines.push('|---|---|---|---|---|');

  for (const todo of todos) {
    const status = todo.completed ? 'Done' : 'Pending';
    const assignees = todo.assignees?.map((a) => a.name).join(', ') || '-';
    lines.push(
      `| ${todo.id} | ${todo.content.slice(0, 40)} | ${status} | ${todo.dueOn || '-'} | ${assignees} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format todolists as Markdown table
 */
function formatTodolistsTable(todolists: Todolist[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Progress | Comments |');
  lines.push('|---|---|---|---|');

  for (const list of todolists) {
    lines.push(
      `| ${list.id} | ${list.name} | ${list.completedRatio || '-'} | ${list.commentsCount} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format messages as Markdown table
 */
function formatMessagesTable(messages: Message[]): string {
  const lines: string[] = [];
  lines.push('| ID | Subject | Author | Comments |');
  lines.push('|---|---|---|---|');

  for (const msg of messages) {
    const author = msg.creator?.name || '-';
    lines.push(`| ${msg.id} | ${msg.subject} | ${author} | ${msg.commentsCount} |`);
  }

  return lines.join('\n');
}

/**
 * Format schedule entries as Markdown table
 */
function formatScheduleEntriesTable(entries: ScheduleEntry[]): string {
  const lines: string[] = [];
  lines.push('| ID | Summary | Starts | Ends | All Day |');
  lines.push('|---|---|---|---|---|');

  for (const entry of entries) {
    lines.push(
      `| ${entry.id} | ${entry.summary} | ${entry.startsAt} | ${entry.endsAt} | ${entry.allDay ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5); // Limit columns

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-').slice(0, 30));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
