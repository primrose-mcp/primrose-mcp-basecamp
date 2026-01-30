/**
 * Basecamp API Client
 *
 * Implements the Basecamp 4 API.
 * Reference: https://github.com/basecamp/bc3-api
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different OAuth tokens.
 */

import type {
  Attachment,
  Campfire,
  CampfireLine,
  CampfireLineCreateInput,
  Card,
  CardTable,
  Comment,
  CommentCreateInput,
  CommentUpdateInput,
  Document,
  DocumentCreateInput,
  DocumentUpdateInput,
  Message,
  MessageBoard,
  MessageCreateInput,
  MessageUpdateInput,
  PaginatedResponse,
  PaginationParams,
  Person,
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
  Recording,
  Schedule,
  ScheduleEntry,
  ScheduleEntryCreateInput,
  ScheduleEntryUpdateInput,
  Todo,
  TodoCreateInput,
  Todolist,
  TodolistCreateInput,
  TodolistUpdateInput,
  Todoset,
  TodoUpdateInput,
  Upload,
  UploadCreateInput,
  UploadUpdateInput,
  Vault,
  VaultCreateInput,
  VaultUpdateInput,
  Webhook,
  WebhookCreateInput,
  WebhookUpdateInput,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, CrmApiError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const USER_AGENT = 'Primrose MCP (https://primrose.dev)';

// =============================================================================
// Basecamp Client Interface
// =============================================================================

export interface BasecampClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // People
  listPeople(): Promise<PaginatedResponse<Person>>;
  listProjectPeople(projectId: number): Promise<PaginatedResponse<Person>>;
  getPerson(personId: number): Promise<Person>;
  getMyProfile(): Promise<Person>;

  // Projects
  listProjects(params?: PaginationParams): Promise<PaginatedResponse<Project>>;
  getProject(projectId: number): Promise<Project>;
  createProject(input: ProjectCreateInput): Promise<Project>;
  updateProject(projectId: number, input: ProjectUpdateInput): Promise<Project>;
  trashProject(projectId: number): Promise<void>;

  // Todosets
  getTodoset(projectId: number, todosetId: number): Promise<Todoset>;

  // Todolists
  listTodolists(
    projectId: number,
    todosetId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Todolist>>;
  getTodolist(projectId: number, todolistId: number): Promise<Todolist>;
  createTodolist(
    projectId: number,
    todosetId: number,
    input: TodolistCreateInput
  ): Promise<Todolist>;
  updateTodolist(projectId: number, todolistId: number, input: TodolistUpdateInput): Promise<Todolist>;

  // Todos
  listTodos(
    projectId: number,
    todolistId: number,
    params?: PaginationParams & { completed?: boolean }
  ): Promise<PaginatedResponse<Todo>>;
  getTodo(projectId: number, todoId: number): Promise<Todo>;
  createTodo(projectId: number, todolistId: number, input: TodoCreateInput): Promise<Todo>;
  updateTodo(projectId: number, todoId: number, input: TodoUpdateInput): Promise<Todo>;
  completeTodo(projectId: number, todoId: number): Promise<void>;
  uncompleteTodo(projectId: number, todoId: number): Promise<void>;

  // Message Boards
  getMessageBoard(projectId: number, messageBoardId: number): Promise<MessageBoard>;

  // Messages
  listMessages(
    projectId: number,
    messageBoardId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Message>>;
  getMessage(projectId: number, messageId: number): Promise<Message>;
  createMessage(
    projectId: number,
    messageBoardId: number,
    input: MessageCreateInput
  ): Promise<Message>;
  updateMessage(projectId: number, messageId: number, input: MessageUpdateInput): Promise<Message>;

  // Campfires
  listCampfires(): Promise<PaginatedResponse<Campfire>>;
  getCampfire(projectId: number, campfireId: number): Promise<Campfire>;
  listCampfireLines(
    projectId: number,
    campfireId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<CampfireLine>>;
  getCampfireLine(projectId: number, lineId: number): Promise<CampfireLine>;
  createCampfireLine(
    projectId: number,
    campfireId: number,
    input: CampfireLineCreateInput
  ): Promise<CampfireLine>;
  deleteCampfireLine(projectId: number, lineId: number): Promise<void>;

  // Schedule
  getSchedule(projectId: number, scheduleId: number): Promise<Schedule>;
  listScheduleEntries(
    projectId: number,
    scheduleId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ScheduleEntry>>;
  getScheduleEntry(projectId: number, entryId: number): Promise<ScheduleEntry>;
  createScheduleEntry(
    projectId: number,
    scheduleId: number,
    input: ScheduleEntryCreateInput
  ): Promise<ScheduleEntry>;
  updateScheduleEntry(
    projectId: number,
    entryId: number,
    input: ScheduleEntryUpdateInput
  ): Promise<ScheduleEntry>;

  // Vault (Docs & Files)
  getVault(projectId: number, vaultId: number): Promise<Vault>;
  listVaults(projectId: number, vaultId: number): Promise<PaginatedResponse<Vault>>;
  createVault(projectId: number, vaultId: number, input: VaultCreateInput): Promise<Vault>;
  updateVault(projectId: number, vaultId: number, input: VaultUpdateInput): Promise<Vault>;

  // Documents
  listDocuments(
    projectId: number,
    vaultId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Document>>;
  getDocument(projectId: number, documentId: number): Promise<Document>;
  createDocument(projectId: number, vaultId: number, input: DocumentCreateInput): Promise<Document>;
  updateDocument(projectId: number, documentId: number, input: DocumentUpdateInput): Promise<Document>;

  // Uploads
  listUploads(
    projectId: number,
    vaultId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Upload>>;
  getUpload(projectId: number, uploadId: number): Promise<Upload>;
  createUpload(projectId: number, vaultId: number, input: UploadCreateInput): Promise<Upload>;
  updateUpload(projectId: number, uploadId: number, input: UploadUpdateInput): Promise<Upload>;
  createAttachment(
    filename: string,
    contentType: string,
    data: ArrayBuffer
  ): Promise<Attachment>;

  // Comments
  listComments(
    projectId: number,
    recordingId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Comment>>;
  getComment(projectId: number, commentId: number): Promise<Comment>;
  createComment(
    projectId: number,
    recordingId: number,
    input: CommentCreateInput
  ): Promise<Comment>;
  updateComment(projectId: number, commentId: number, input: CommentUpdateInput): Promise<Comment>;

  // Card Tables (Kanban)
  getCardTable(projectId: number, cardTableId: number): Promise<CardTable>;
  listCards(projectId: number, columnId: number): Promise<PaginatedResponse<Card>>;
  getCard(projectId: number, cardId: number): Promise<Card>;

  // Webhooks
  listWebhooks(projectId: number): Promise<PaginatedResponse<Webhook>>;
  getWebhook(projectId: number, webhookId: number): Promise<Webhook>;
  createWebhook(projectId: number, input: WebhookCreateInput): Promise<Webhook>;
  updateWebhook(projectId: number, webhookId: number, input: WebhookUpdateInput): Promise<Webhook>;
  deleteWebhook(projectId: number, webhookId: number): Promise<void>;

  // Recordings (Archive/Trash)
  listRecordings(params: {
    type: string;
    bucket?: number[];
    status?: 'active' | 'archived' | 'trashed';
    sort?: 'created_at' | 'updated_at';
    direction?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Recording>>;
  trashRecording(projectId: number, recordingId: number): Promise<void>;
  archiveRecording(projectId: number, recordingId: number): Promise<void>;
  unarchiveRecording(projectId: number, recordingId: number): Promise<void>;
}

// =============================================================================
// Response transformation helpers
// =============================================================================

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[snakeToCamel(key)] = transformKeys(value);
    }
    return result;
  }
  return obj;
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function transformKeysToSnake(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnake);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[camelToSnake(key)] = transformKeysToSnake(value);
    }
    return result;
  }
  return obj;
}

// =============================================================================
// Basecamp Client Implementation
// =============================================================================

class BasecampClientImpl implements BasecampClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  private getBaseUrl(): string {
    return `https://3.basecampapi.com/${this.credentials.accountId}`;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.credentials.accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.getBaseUrl()}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting (50 requests per 10 seconds)
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 10);
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your OAuth access token.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Basecamp API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.error || errorJson.message || message;
      } catch {
        // Use default message
      }
      throw new CrmApiError(message, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return transformKeys(data) as T;
  }

  private async requestWithPagination<T>(
    endpoint: string,
    _params?: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.getBaseUrl()}${endpoint}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 10);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your OAuth access token.');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Basecamp API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.error || errorJson.message || message;
      } catch {
        // Use default message
      }
      throw new CrmApiError(message, response.status);
    }

    const data = await response.json();
    const items = (transformKeys(data) as T[]) || [];

    // Parse Link header for pagination
    const linkHeader = response.headers.get('Link');
    let hasMore = false;
    let nextPageUrl: string | undefined;

    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (nextMatch) {
        hasMore = true;
        nextPageUrl = nextMatch[1];
      }
    }

    return {
      items,
      count: items.length,
      hasMore,
      nextPageUrl,
    };
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const profile = await this.getMyProfile();
      return {
        connected: true,
        message: `Connected as ${profile.name} (${profile.emailAddress})`,
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // People
  // ===========================================================================

  async listPeople(): Promise<PaginatedResponse<Person>> {
    return this.requestWithPagination<Person>('/people.json');
  }

  async listProjectPeople(projectId: number): Promise<PaginatedResponse<Person>> {
    return this.requestWithPagination<Person>(`/projects/${projectId}/people.json`);
  }

  async getPerson(personId: number): Promise<Person> {
    return this.request<Person>(`/people/${personId}.json`);
  }

  async getMyProfile(): Promise<Person> {
    return this.request<Person>('/my/profile.json');
  }

  // ===========================================================================
  // Projects
  // ===========================================================================

  async listProjects(params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    let endpoint = '/projects.json';
    if (params?.status === 'archived') {
      endpoint = '/projects/archive.json';
    } else if (params?.status === 'trashed') {
      endpoint = '/projects/trash.json';
    }
    return this.requestWithPagination<Project>(endpoint, params);
  }

  async getProject(projectId: number): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}.json`);
  }

  async createProject(input: ProjectCreateInput): Promise<Project> {
    return this.request<Project>('/projects.json', {
      method: 'POST',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  async updateProject(projectId: number, input: ProjectUpdateInput): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}.json`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  async trashProject(projectId: number): Promise<void> {
    await this.request(`/projects/${projectId}.json`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Todosets
  // ===========================================================================

  async getTodoset(projectId: number, todosetId: number): Promise<Todoset> {
    return this.request<Todoset>(`/buckets/${projectId}/todosets/${todosetId}.json`);
  }

  // ===========================================================================
  // Todolists
  // ===========================================================================

  async listTodolists(
    projectId: number,
    todosetId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Todolist>> {
    let endpoint = `/buckets/${projectId}/todosets/${todosetId}/todolists.json`;
    if (params?.status) {
      endpoint += `?status=${params.status}`;
    }
    return this.requestWithPagination<Todolist>(endpoint, params);
  }

  async getTodolist(projectId: number, todolistId: number): Promise<Todolist> {
    return this.request<Todolist>(`/buckets/${projectId}/todolists/${todolistId}.json`);
  }

  async createTodolist(
    projectId: number,
    todosetId: number,
    input: TodolistCreateInput
  ): Promise<Todolist> {
    return this.request<Todolist>(
      `/buckets/${projectId}/todosets/${todosetId}/todolists.json`,
      {
        method: 'POST',
        body: JSON.stringify(transformKeysToSnake(input)),
      }
    );
  }

  async updateTodolist(
    projectId: number,
    todolistId: number,
    input: TodolistUpdateInput
  ): Promise<Todolist> {
    return this.request<Todolist>(`/buckets/${projectId}/todolists/${todolistId}.json`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  // ===========================================================================
  // Todos
  // ===========================================================================

  async listTodos(
    projectId: number,
    todolistId: number,
    params?: PaginationParams & { completed?: boolean }
  ): Promise<PaginatedResponse<Todo>> {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.set('status', params.status);
    }
    if (params?.completed !== undefined) {
      queryParams.set('completed', String(params.completed));
    }
    const query = queryParams.toString();
    const endpoint = `/buckets/${projectId}/todolists/${todolistId}/todos.json${query ? `?${query}` : ''}`;
    return this.requestWithPagination<Todo>(endpoint, params);
  }

  async getTodo(projectId: number, todoId: number): Promise<Todo> {
    return this.request<Todo>(`/buckets/${projectId}/todos/${todoId}.json`);
  }

  async createTodo(projectId: number, todolistId: number, input: TodoCreateInput): Promise<Todo> {
    return this.request<Todo>(`/buckets/${projectId}/todolists/${todolistId}/todos.json`, {
      method: 'POST',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  async updateTodo(projectId: number, todoId: number, input: TodoUpdateInput): Promise<Todo> {
    return this.request<Todo>(`/buckets/${projectId}/todos/${todoId}.json`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  async completeTodo(projectId: number, todoId: number): Promise<void> {
    await this.request(`/buckets/${projectId}/todos/${todoId}/completion.json`, {
      method: 'POST',
    });
  }

  async uncompleteTodo(projectId: number, todoId: number): Promise<void> {
    await this.request(`/buckets/${projectId}/todos/${todoId}/completion.json`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Message Boards
  // ===========================================================================

  async getMessageBoard(projectId: number, messageBoardId: number): Promise<MessageBoard> {
    return this.request<MessageBoard>(
      `/buckets/${projectId}/message_boards/${messageBoardId}.json`
    );
  }

  // ===========================================================================
  // Messages
  // ===========================================================================

  async listMessages(
    projectId: number,
    messageBoardId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Message>> {
    let endpoint = `/buckets/${projectId}/message_boards/${messageBoardId}/messages.json`;
    if (params?.status) {
      endpoint += `?status=${params.status}`;
    }
    return this.requestWithPagination<Message>(endpoint, params);
  }

  async getMessage(projectId: number, messageId: number): Promise<Message> {
    return this.request<Message>(`/buckets/${projectId}/messages/${messageId}.json`);
  }

  async createMessage(
    projectId: number,
    messageBoardId: number,
    input: MessageCreateInput
  ): Promise<Message> {
    const body: Record<string, unknown> = {
      subject: input.subject,
      content: input.content,
      status: input.status || 'active',
    };
    if (input.categoryId) {
      body.category_id = input.categoryId;
    }
    return this.request<Message>(
      `/buckets/${projectId}/message_boards/${messageBoardId}/messages.json`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  async updateMessage(
    projectId: number,
    messageId: number,
    input: MessageUpdateInput
  ): Promise<Message> {
    return this.request<Message>(`/buckets/${projectId}/messages/${messageId}.json`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  // ===========================================================================
  // Campfires
  // ===========================================================================

  async listCampfires(): Promise<PaginatedResponse<Campfire>> {
    return this.requestWithPagination<Campfire>('/chats.json');
  }

  async getCampfire(projectId: number, campfireId: number): Promise<Campfire> {
    return this.request<Campfire>(`/buckets/${projectId}/chats/${campfireId}.json`);
  }

  async listCampfireLines(
    projectId: number,
    campfireId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<CampfireLine>> {
    return this.requestWithPagination<CampfireLine>(
      `/buckets/${projectId}/chats/${campfireId}/lines.json`,
      params
    );
  }

  async getCampfireLine(projectId: number, lineId: number): Promise<CampfireLine> {
    return this.request<CampfireLine>(`/buckets/${projectId}/chats/lines/${lineId}.json`);
  }

  async createCampfireLine(
    projectId: number,
    campfireId: number,
    input: CampfireLineCreateInput
  ): Promise<CampfireLine> {
    return this.request<CampfireLine>(
      `/buckets/${projectId}/chats/${campfireId}/lines.json`,
      {
        method: 'POST',
        body: JSON.stringify(transformKeysToSnake(input)),
      }
    );
  }

  async deleteCampfireLine(projectId: number, lineId: number): Promise<void> {
    await this.request(`/buckets/${projectId}/chats/lines/${lineId}.json`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Schedule
  // ===========================================================================

  async getSchedule(projectId: number, scheduleId: number): Promise<Schedule> {
    return this.request<Schedule>(`/buckets/${projectId}/schedules/${scheduleId}.json`);
  }

  async listScheduleEntries(
    projectId: number,
    scheduleId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ScheduleEntry>> {
    let endpoint = `/buckets/${projectId}/schedules/${scheduleId}/entries.json`;
    if (params?.status) {
      endpoint += `?status=${params.status}`;
    }
    return this.requestWithPagination<ScheduleEntry>(endpoint, params);
  }

  async getScheduleEntry(projectId: number, entryId: number): Promise<ScheduleEntry> {
    return this.request<ScheduleEntry>(`/buckets/${projectId}/schedule_entries/${entryId}.json`);
  }

  async createScheduleEntry(
    projectId: number,
    scheduleId: number,
    input: ScheduleEntryCreateInput
  ): Promise<ScheduleEntry> {
    const body: Record<string, unknown> = {
      summary: input.summary,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
    };
    if (input.description) body.description = input.description;
    if (input.participantIds) body.participant_ids = input.participantIds;
    if (input.allDay !== undefined) body.all_day = input.allDay;
    if (input.notify !== undefined) body.notify = input.notify;

    return this.request<ScheduleEntry>(
      `/buckets/${projectId}/schedules/${scheduleId}/entries.json`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  async updateScheduleEntry(
    projectId: number,
    entryId: number,
    input: ScheduleEntryUpdateInput
  ): Promise<ScheduleEntry> {
    const body: Record<string, unknown> = {};
    if (input.summary) body.summary = input.summary;
    if (input.startsAt) body.starts_at = input.startsAt;
    if (input.endsAt) body.ends_at = input.endsAt;
    if (input.description !== undefined) body.description = input.description;
    if (input.participantIds) body.participant_ids = input.participantIds;
    if (input.allDay !== undefined) body.all_day = input.allDay;
    if (input.notify !== undefined) body.notify = input.notify;

    return this.request<ScheduleEntry>(
      `/buckets/${projectId}/schedule_entries/${entryId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
  }

  // ===========================================================================
  // Vault (Docs & Files)
  // ===========================================================================

  async getVault(projectId: number, vaultId: number): Promise<Vault> {
    return this.request<Vault>(`/buckets/${projectId}/vaults/${vaultId}.json`);
  }

  async listVaults(projectId: number, vaultId: number): Promise<PaginatedResponse<Vault>> {
    return this.requestWithPagination<Vault>(
      `/buckets/${projectId}/vaults/${vaultId}/vaults.json`
    );
  }

  async createVault(projectId: number, vaultId: number, input: VaultCreateInput): Promise<Vault> {
    return this.request<Vault>(`/buckets/${projectId}/vaults/${vaultId}/vaults.json`, {
      method: 'POST',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  async updateVault(projectId: number, vaultId: number, input: VaultUpdateInput): Promise<Vault> {
    return this.request<Vault>(`/buckets/${projectId}/vaults/${vaultId}.json`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  // ===========================================================================
  // Documents
  // ===========================================================================

  async listDocuments(
    projectId: number,
    vaultId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Document>> {
    let endpoint = `/buckets/${projectId}/vaults/${vaultId}/documents.json`;
    if (params?.status) {
      endpoint += `?status=${params.status}`;
    }
    return this.requestWithPagination<Document>(endpoint, params);
  }

  async getDocument(projectId: number, documentId: number): Promise<Document> {
    return this.request<Document>(`/buckets/${projectId}/documents/${documentId}.json`);
  }

  async createDocument(
    projectId: number,
    vaultId: number,
    input: DocumentCreateInput
  ): Promise<Document> {
    const body: Record<string, unknown> = {
      title: input.title,
      content: input.content,
      status: input.status || 'active',
    };
    return this.request<Document>(`/buckets/${projectId}/vaults/${vaultId}/documents.json`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateDocument(
    projectId: number,
    documentId: number,
    input: DocumentUpdateInput
  ): Promise<Document> {
    return this.request<Document>(`/buckets/${projectId}/documents/${documentId}.json`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  // ===========================================================================
  // Uploads
  // ===========================================================================

  async listUploads(
    projectId: number,
    vaultId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Upload>> {
    let endpoint = `/buckets/${projectId}/vaults/${vaultId}/uploads.json`;
    if (params?.status) {
      endpoint += `?status=${params.status}`;
    }
    return this.requestWithPagination<Upload>(endpoint, params);
  }

  async getUpload(projectId: number, uploadId: number): Promise<Upload> {
    return this.request<Upload>(`/buckets/${projectId}/uploads/${uploadId}.json`);
  }

  async createUpload(
    projectId: number,
    vaultId: number,
    input: UploadCreateInput
  ): Promise<Upload> {
    const body: Record<string, unknown> = {
      attachable_sgid: input.attachableSgid,
    };
    if (input.description) body.description = input.description;
    if (input.baseName) body.base_name = input.baseName;

    return this.request<Upload>(`/buckets/${projectId}/vaults/${vaultId}/uploads.json`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateUpload(
    projectId: number,
    uploadId: number,
    input: UploadUpdateInput
  ): Promise<Upload> {
    return this.request<Upload>(`/buckets/${projectId}/uploads/${uploadId}.json`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  async createAttachment(
    filename: string,
    contentType: string,
    data: ArrayBuffer
  ): Promise<Attachment> {
    const url = `${this.getBaseUrl()}/attachments.json?name=${encodeURIComponent(filename)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        'Content-Type': contentType,
        'Content-Length': String(data.byteLength),
        'User-Agent': USER_AGENT,
      },
      body: data,
    });

    if (!response.ok) {
      throw new CrmApiError(`Failed to upload attachment: ${response.status}`, response.status);
    }

    const result = await response.json();
    return transformKeys(result) as Attachment;
  }

  // ===========================================================================
  // Comments
  // ===========================================================================

  async listComments(
    projectId: number,
    recordingId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Comment>> {
    return this.requestWithPagination<Comment>(
      `/buckets/${projectId}/recordings/${recordingId}/comments.json`,
      params
    );
  }

  async getComment(projectId: number, commentId: number): Promise<Comment> {
    return this.request<Comment>(`/buckets/${projectId}/comments/${commentId}.json`);
  }

  async createComment(
    projectId: number,
    recordingId: number,
    input: CommentCreateInput
  ): Promise<Comment> {
    return this.request<Comment>(
      `/buckets/${projectId}/recordings/${recordingId}/comments.json`,
      {
        method: 'POST',
        body: JSON.stringify(transformKeysToSnake(input)),
      }
    );
  }

  async updateComment(
    projectId: number,
    commentId: number,
    input: CommentUpdateInput
  ): Promise<Comment> {
    return this.request<Comment>(`/buckets/${projectId}/comments/${commentId}.json`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(input)),
    });
  }

  // ===========================================================================
  // Card Tables (Kanban)
  // ===========================================================================

  async getCardTable(projectId: number, cardTableId: number): Promise<CardTable> {
    return this.request<CardTable>(`/buckets/${projectId}/card_tables/${cardTableId}.json`);
  }

  async listCards(projectId: number, columnId: number): Promise<PaginatedResponse<Card>> {
    return this.requestWithPagination<Card>(
      `/buckets/${projectId}/card_tables/lists/${columnId}/cards.json`
    );
  }

  async getCard(projectId: number, cardId: number): Promise<Card> {
    return this.request<Card>(`/buckets/${projectId}/card_tables/cards/${cardId}.json`);
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async listWebhooks(projectId: number): Promise<PaginatedResponse<Webhook>> {
    return this.requestWithPagination<Webhook>(`/buckets/${projectId}/webhooks.json`);
  }

  async getWebhook(projectId: number, webhookId: number): Promise<Webhook> {
    return this.request<Webhook>(`/buckets/${projectId}/webhooks/${webhookId}.json`);
  }

  async createWebhook(projectId: number, input: WebhookCreateInput): Promise<Webhook> {
    const body = {
      payload_url: input.payloadUrl,
      types: input.types,
    };
    return this.request<Webhook>(`/buckets/${projectId}/webhooks.json`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateWebhook(
    projectId: number,
    webhookId: number,
    input: WebhookUpdateInput
  ): Promise<Webhook> {
    const body: Record<string, unknown> = {};
    if (input.payloadUrl) body.payload_url = input.payloadUrl;
    if (input.types) body.types = input.types;
    if (input.active !== undefined) body.active = input.active;

    return this.request<Webhook>(`/buckets/${projectId}/webhooks/${webhookId}.json`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteWebhook(projectId: number, webhookId: number): Promise<void> {
    await this.request(`/buckets/${projectId}/webhooks/${webhookId}.json`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Recordings (Archive/Trash)
  // ===========================================================================

  async listRecordings(params: {
    type: string;
    bucket?: number[];
    status?: 'active' | 'archived' | 'trashed';
    sort?: 'created_at' | 'updated_at';
    direction?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Recording>> {
    const queryParams = new URLSearchParams();
    queryParams.set('type', params.type);
    if (params.bucket) {
      for (const b of params.bucket) {
        queryParams.append('bucket', String(b));
      }
    }
    if (params.status) queryParams.set('status', params.status);
    if (params.sort) queryParams.set('sort', params.sort);
    if (params.direction) queryParams.set('direction', params.direction);

    return this.requestWithPagination<Recording>(
      `/projects/recordings.json?${queryParams.toString()}`
    );
  }

  async trashRecording(projectId: number, recordingId: number): Promise<void> {
    await this.request(
      `/buckets/${projectId}/recordings/${recordingId}/status/trashed.json`,
      { method: 'PUT' }
    );
  }

  async archiveRecording(projectId: number, recordingId: number): Promise<void> {
    await this.request(
      `/buckets/${projectId}/recordings/${recordingId}/status/archived.json`,
      { method: 'PUT' }
    );
  }

  async unarchiveRecording(projectId: number, recordingId: number): Promise<void> {
    await this.request(
      `/buckets/${projectId}/recordings/${recordingId}/status/active.json`,
      { method: 'PUT' }
    );
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Basecamp client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createBasecampClient(credentials: TenantCredentials): BasecampClient {
  return new BasecampClientImpl(credentials);
}
