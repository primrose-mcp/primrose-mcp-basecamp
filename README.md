# Basecamp MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with Basecamp. Manage projects, to-dos, messages, schedules, documents, and team collaboration features.

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-6366f1)](https://primrose.dev/mcp/basecamp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[View on Primrose](https://primrose.dev/mcp/basecamp)** | **[Documentation](https://primrose.dev/docs)**

---

## Features

- **Campfire** - Real-time chat and messaging
- **Card Tables** - Kanban-style project boards
- **Comments** - Comment on any Basecamp content
- **Documents** - Create and manage documents
- **Messages** - Post announcements and messages
- **People** - Manage project members and teams
- **Projects** - Create and organize projects
- **Recordings** - Access content recordings
- **Schedule** - Manage calendar events and milestones
- **Todos** - Create and track to-do lists and items
- **Webhooks** - Configure real-time notifications

## Quick Start

### Using Primrose SDK (Recommended)

The fastest way to get started is with the [Primrose SDK](https://github.com/primrose-mcp/primrose-sdk), which handles authentication and provides tool definitions formatted for your LLM provider.

```bash
npm install primrose-mcp
```

```typescript
import { Primrose } from 'primrose-mcp';

const primrose = new Primrose({
  apiKey: 'prm_xxxxx',
  provider: 'anthropic', // or 'openai', 'google', 'amazon', etc.
});

// List available Basecamp tools
const tools = await primrose.listTools({ mcpServer: 'basecamp' });

// Call a tool
const result = await primrose.callTool('basecamp_list_projects', {
  status: 'active',
  format: 'json'
});
```

[Get your Primrose API key](https://primrose.dev) to start building.

### Manual Installation

If you prefer to self-host, you can deploy this MCP server directly to Cloudflare Workers.

```bash
git clone https://github.com/primrose-mcp/primrose-mcp-basecamp.git
cd primrose-mcp-basecamp
bun install
bun run deploy
```

## Configuration

This server uses a multi-tenant architecture where credentials are passed via request headers.

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Basecamp-Access-Token` | OAuth 2.0 access token |
| `X-Basecamp-Account-ID` | Basecamp account ID |

### Getting Credentials

1. Register your application at [37signals Launchpad](https://launchpad.37signals.com/integrations)
2. Implement OAuth 2.0 flow to obtain access tokens
3. Find your account ID in your Basecamp URL (e.g., `https://3.basecamp.com/ACCOUNT_ID/`)

## Available Tools

### Projects
- `basecamp_list_projects` - List all projects
- `basecamp_get_project` - Get project details
- `basecamp_create_project` - Create a new project
- `basecamp_update_project` - Update a project
- `basecamp_delete_project` - Delete a project

### Todos
- `basecamp_list_todolists` - List to-do lists
- `basecamp_get_todolist` - Get to-do list details
- `basecamp_create_todolist` - Create a to-do list
- `basecamp_list_todos` - List to-do items
- `basecamp_create_todo` - Create a to-do item
- `basecamp_complete_todo` - Mark a to-do as complete

### Messages
- `basecamp_list_messages` - List messages
- `basecamp_get_message` - Get message details
- `basecamp_create_message` - Post a new message

### Documents
- `basecamp_list_documents` - List documents
- `basecamp_get_document` - Get document content
- `basecamp_create_document` - Create a document

### Schedule
- `basecamp_list_events` - List schedule events
- `basecamp_create_event` - Create a calendar event

### Campfire
- `basecamp_list_campfire_lines` - Get chat messages
- `basecamp_create_campfire_line` - Send a chat message

### People
- `basecamp_list_people` - List project members

## Development

```bash
bun run dev
bun run typecheck
bun run lint
bun run inspector
```

## Related Resources

- [Primrose SDK](https://github.com/primrose-mcp/primrose-sdk)
- [Basecamp API Documentation](https://github.com/basecamp/bc3-api)
- [Model Context Protocol](https://modelcontextprotocol.io)

## License

MIT License - see [LICENSE](LICENSE) for details.
