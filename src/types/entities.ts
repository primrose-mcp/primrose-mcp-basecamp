/**
 * Basecamp Entity Types
 *
 * Type definitions for Basecamp 4 API entities.
 * Reference: https://github.com/basecamp/bc3-api
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Page number (Basecamp uses link-based pagination but we track pages) */
  page?: number;
  /** Status filter */
  status?: 'active' | 'archived' | 'trashed';
}

export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Number of items in this response */
  count: number;
  /** Whether more items are available */
  hasMore: boolean;
  /** Next page URL (from Link header) */
  nextPageUrl?: string;
}

// =============================================================================
// Person
// =============================================================================

export interface Person {
  id: number;
  attachableSgid: string;
  name: string;
  emailAddress: string;
  personableType: string;
  title?: string;
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  admin: boolean;
  owner: boolean;
  client: boolean;
  employee: boolean;
  timeZone: string;
  avatarUrl: string;
  company?: {
    id: number;
    name: string;
  };
  canManageProjects: boolean;
  canManagePeople: boolean;
}

// =============================================================================
// Project (Basecamp)
// =============================================================================

export interface Project {
  id: number;
  status: 'active' | 'archived' | 'trashed';
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  purpose: string;
  clientsEnabled: boolean;
  bookmarkUrl: string;
  url: string;
  appUrl: string;
  dock: DockItem[];
  bookmarked: boolean;
}

export interface DockItem {
  id: number;
  title: string;
  name: string;
  enabled: boolean;
  position?: number;
  url: string;
  appUrl: string;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
}

// =============================================================================
// To-do Set
// =============================================================================

export interface Todoset {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bucket: ProjectRef;
  creator: PersonRef;
  completed: boolean;
  completedRatio: string;
  name: string;
  todolistsCount: number;
  todolistsUrl: string;
}

// =============================================================================
// To-do List
// =============================================================================

export interface Todolist {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bookmarkUrl: string;
  subscriptionUrl: string;
  commentsCount: number;
  commentsUrl: string;
  position: number;
  parent: ParentRef;
  bucket: ProjectRef;
  creator: PersonRef;
  description: string;
  completed: boolean;
  completedRatio: string;
  name: string;
  todosUrl: string;
  groupsUrl: string;
  appTodosUrl: string;
}

export interface TodolistCreateInput {
  name: string;
  description?: string;
}

export interface TodolistUpdateInput {
  name: string;
  description?: string;
}

// =============================================================================
// To-do
// =============================================================================

export interface Todo {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bookmarkUrl: string;
  subscriptionUrl: string;
  commentsCount: number;
  commentsUrl: string;
  position: number;
  parent: ParentRef;
  bucket: ProjectRef;
  creator: PersonRef;
  description: string;
  completed: boolean;
  content: string;
  startsOn?: string;
  dueOn?: string;
  assignees: PersonRef[];
  completionSubscribers: PersonRef[];
  completionUrl: string;
}

export interface TodoCreateInput {
  content: string;
  description?: string;
  assigneeIds?: number[];
  completionSubscriberIds?: number[];
  notify?: boolean;
  dueOn?: string;
  startsOn?: string;
}

export interface TodoUpdateInput {
  content?: string;
  description?: string;
  assigneeIds?: number[];
  completionSubscriberIds?: number[];
  notify?: boolean;
  dueOn?: string;
  startsOn?: string;
}

// =============================================================================
// Message Board
// =============================================================================

export interface MessageBoard {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bucket: ProjectRef;
  creator: PersonRef;
  messagesCount: number;
  messagesUrl: string;
}

// =============================================================================
// Message
// =============================================================================

export interface Message {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bookmarkUrl: string;
  subscriptionUrl: string;
  commentsCount: number;
  commentsUrl: string;
  parent: ParentRef;
  bucket: ProjectRef;
  creator: PersonRef;
  subject: string;
  content: string;
  category?: MessageCategory;
}

export interface MessageCategory {
  id: number;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageCreateInput {
  subject: string;
  content?: string;
  status?: 'active' | 'draft';
  categoryId?: number;
}

export interface MessageUpdateInput {
  subject?: string;
  content?: string;
  categoryId?: number;
}

// =============================================================================
// Campfire (Chat)
// =============================================================================

export interface Campfire {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bucket: ProjectRef;
  creator: PersonRef;
  linesUrl: string;
  topic: string;
}

export interface CampfireLine {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bucket: ProjectRef;
  creator: PersonRef;
  content: string;
}

export interface CampfireLineCreateInput {
  content: string;
}

// =============================================================================
// Schedule
// =============================================================================

export interface Schedule {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bucket: ProjectRef;
  creator: PersonRef;
  includeDueAssignments: boolean;
  entriesCount: number;
  entriesUrl: string;
}

export interface ScheduleEntry {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bookmarkUrl: string;
  subscriptionUrl: string;
  commentsCount: number;
  commentsUrl: string;
  parent: ParentRef;
  bucket: ProjectRef;
  creator: PersonRef;
  description: string;
  summary: string;
  allDay: boolean;
  startsAt: string;
  endsAt: string;
  participants: PersonRef[];
}

export interface ScheduleEntryCreateInput {
  summary: string;
  startsAt: string;
  endsAt: string;
  description?: string;
  participantIds?: number[];
  allDay?: boolean;
  notify?: boolean;
}

export interface ScheduleEntryUpdateInput {
  summary?: string;
  startsAt?: string;
  endsAt?: string;
  description?: string;
  participantIds?: number[];
  allDay?: boolean;
  notify?: boolean;
}

// =============================================================================
// Vault (Docs & Files)
// =============================================================================

export interface Vault {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bucket: ProjectRef;
  creator: PersonRef;
  documentsCount: number;
  documentsUrl: string;
  uploadsCount: number;
  uploadsUrl: string;
  vaultsCount: number;
  vaultsUrl: string;
}

export interface VaultCreateInput {
  title: string;
}

export interface VaultUpdateInput {
  title: string;
}

// =============================================================================
// Document
// =============================================================================

export interface Document {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bookmarkUrl: string;
  subscriptionUrl: string;
  commentsCount: number;
  commentsUrl: string;
  parent: ParentRef;
  bucket: ProjectRef;
  creator: PersonRef;
  content: string;
}

export interface DocumentCreateInput {
  title: string;
  content: string;
  status?: 'active' | 'draft';
}

export interface DocumentUpdateInput {
  title?: string;
  content?: string;
}

// =============================================================================
// Upload
// =============================================================================

export interface Upload {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bookmarkUrl: string;
  subscriptionUrl: string;
  commentsCount: number;
  commentsUrl: string;
  parent: ParentRef;
  bucket: ProjectRef;
  creator: PersonRef;
  description: string;
  contentType: string;
  byteSize: number;
  filename: string;
  downloadUrl: string;
  appDownloadUrl: string;
  width?: number;
  height?: number;
}

export interface UploadCreateInput {
  attachableSgid: string;
  description?: string;
  baseName?: string;
}

export interface UploadUpdateInput {
  description?: string;
  baseName?: string;
}

// =============================================================================
// Comment
// =============================================================================

export interface Comment {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  parent: ParentRef;
  bucket: ProjectRef;
  creator: PersonRef;
  content: string;
}

export interface CommentCreateInput {
  content: string;
}

export interface CommentUpdateInput {
  content: string;
}

// =============================================================================
// Card Table (Kanban)
// =============================================================================

export interface CardTable {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bookmarkUrl: string;
  subscriptionUrl: string;
  bucket: ProjectRef;
  creator: PersonRef;
  subscribers: PersonRef[];
  lists: CardColumn[];
}

export interface CardColumn {
  id: number;
  title: string;
  type: string;
  position: number;
  color?: string;
  cardsCount: number;
  commentCount: number;
  cardsUrl: string;
}

export interface Card {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bookmarkUrl: string;
  subscriptionUrl: string;
  commentsCount: number;
  commentsUrl: string;
  parent: ParentRef;
  bucket: ProjectRef;
  creator: PersonRef;
  content: string;
  dueOn?: string;
  assignees: PersonRef[];
}

export interface CardCreateInput {
  title: string;
  content?: string;
  dueOn?: string;
  assigneeIds?: number[];
}

export interface CardUpdateInput {
  title?: string;
  content?: string;
  dueOn?: string;
  assigneeIds?: number[];
}

// =============================================================================
// Webhook
// =============================================================================

export interface Webhook {
  id: number;
  createdAt: string;
  updatedAt: string;
  payloadUrl: string;
  types: string[];
  active: boolean;
  url: string;
  appUrl: string;
}

export interface WebhookCreateInput {
  payloadUrl: string;
  types: string[];
}

export interface WebhookUpdateInput {
  payloadUrl?: string;
  types?: string[];
  active?: boolean;
}

// =============================================================================
// Recording
// =============================================================================

export interface Recording {
  id: number;
  status: string;
  visibleToClients: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  inheritStatus: boolean;
  type: string;
  url: string;
  appUrl: string;
  bucket: ProjectRef;
  creator: PersonRef;
  parent?: ParentRef;
}

// =============================================================================
// Event
// =============================================================================

export interface Event {
  id: number;
  recordingId: number;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
  creator: PersonRef;
}

// =============================================================================
// Attachment
// =============================================================================

export interface Attachment {
  attachableSgid: string;
}

// =============================================================================
// Common Types
// =============================================================================

export interface ProjectRef {
  id: number;
  name: string;
  type: string;
}

export interface PersonRef {
  id: number;
  attachableSgid: string;
  name: string;
  emailAddress: string;
  personableType: string;
  title?: string;
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  admin: boolean;
  owner: boolean;
  client: boolean;
  employee: boolean;
  timeZone: string;
  avatarUrl: string;
  company?: {
    id: number;
    name: string;
  };
  canManageProjects: boolean;
  canManagePeople: boolean;
}

export interface ParentRef {
  id: number;
  title: string;
  type: string;
  url: string;
  appUrl: string;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';
