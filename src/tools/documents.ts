/**
 * Document & Vault Tools
 *
 * MCP tools for Basecamp Documents, Uploads, and Vaults (Docs & Files).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { BasecampClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerDocumentTools(server: McpServer, client: BasecampClient): void {
  // ===========================================================================
  // Get Vault
  // ===========================================================================
  server.tool(
    'basecamp_get_vault',
    `Get a vault (folder) for documents and files.

The vault is the container for all documents and uploads in a project. Get the
root vault ID from the project's dock items.

Args:
  - projectId: The project ID
  - vaultId: The vault ID
  - format: Response format

Returns:
  The vault with document/upload counts and nested vault links.`,
    {
      projectId: z.number().describe('Project ID'),
      vaultId: z.number().describe('Vault ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, vaultId, format }) => {
      try {
        const vault = await client.getVault(projectId, vaultId);
        return formatResponse(vault, format, 'vault');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Vaults (nested folders)
  // ===========================================================================
  server.tool(
    'basecamp_list_vaults',
    `List nested vaults (subfolders) within a vault.

Args:
  - projectId: The project ID
  - vaultId: The parent vault ID
  - format: Response format

Returns:
  Paginated list of nested vaults.`,
    {
      projectId: z.number().describe('Project ID'),
      vaultId: z.number().describe('Parent vault ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, vaultId, format }) => {
      try {
        const result = await client.listVaults(projectId, vaultId);
        return formatResponse(result, format, 'vaults');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Vault
  // ===========================================================================
  server.tool(
    'basecamp_create_vault',
    `Create a new vault (folder) nested under a parent vault.

Args:
  - projectId: The project ID
  - vaultId: The parent vault ID
  - title: Vault/folder name (required)

Returns:
  The created vault.`,
    {
      projectId: z.number().describe('Project ID'),
      vaultId: z.number().describe('Parent vault ID'),
      title: z.string().describe('Vault name'),
    },
    async ({ projectId, vaultId, title }) => {
      try {
        const vault = await client.createVault(projectId, vaultId, { title });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Vault created', vault }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Vault
  // ===========================================================================
  server.tool(
    'basecamp_update_vault',
    `Update a vault's title.

Args:
  - projectId: The project ID
  - vaultId: The vault ID
  - title: New vault name (required)

Returns:
  The updated vault.`,
    {
      projectId: z.number().describe('Project ID'),
      vaultId: z.number().describe('Vault ID'),
      title: z.string().describe('New vault name'),
    },
    async ({ projectId, vaultId, title }) => {
      try {
        const vault = await client.updateVault(projectId, vaultId, { title });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Vault updated', vault }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Documents
  // ===========================================================================
  server.tool(
    'basecamp_list_documents',
    `List all documents in a vault.

Args:
  - projectId: The project ID
  - vaultId: The vault ID
  - status: Filter by status ('active', 'archived', 'trashed')
  - format: Response format

Returns:
  Paginated list of documents.`,
    {
      projectId: z.number().describe('Project ID'),
      vaultId: z.number().describe('Vault ID'),
      status: z.enum(['active', 'archived', 'trashed']).optional().describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, vaultId, status, format }) => {
      try {
        const result = await client.listDocuments(projectId, vaultId, { status });
        return formatResponse(result, format, 'documents');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Document
  // ===========================================================================
  server.tool(
    'basecamp_get_document',
    `Get a single document.

Args:
  - projectId: The project ID
  - documentId: The document ID
  - format: Response format

Returns:
  The document with title and content.`,
    {
      projectId: z.number().describe('Project ID'),
      documentId: z.number().describe('Document ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, documentId, format }) => {
      try {
        const document = await client.getDocument(projectId, documentId);
        return formatResponse(document, format, 'document');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Document
  // ===========================================================================
  server.tool(
    'basecamp_create_document',
    `Create a new document in a vault.

Args:
  - projectId: The project ID
  - vaultId: The vault ID
  - title: Document title (required)
  - content: HTML content (required)
  - status: 'active' to publish, 'draft' to save as draft

Returns:
  The created document.`,
    {
      projectId: z.number().describe('Project ID'),
      vaultId: z.number().describe('Vault ID'),
      title: z.string().describe('Document title'),
      content: z.string().describe('HTML content'),
      status: z.enum(['active', 'draft']).default('active').describe('Publish status'),
    },
    async ({ projectId, vaultId, title, content, status }) => {
      try {
        const document = await client.createDocument(projectId, vaultId, { title, content, status });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Document created', document }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Document
  // ===========================================================================
  server.tool(
    'basecamp_update_document',
    `Update an existing document.

Args:
  - projectId: The project ID
  - documentId: The document ID
  - title: New document title
  - content: New HTML content

Returns:
  The updated document.`,
    {
      projectId: z.number().describe('Project ID'),
      documentId: z.number().describe('Document ID'),
      title: z.string().optional().describe('New document title'),
      content: z.string().optional().describe('New HTML content'),
    },
    async ({ projectId, documentId, ...input }) => {
      try {
        const document = await client.updateDocument(projectId, documentId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Document updated', document }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Uploads
  // ===========================================================================
  server.tool(
    'basecamp_list_uploads',
    `List all file uploads in a vault.

Args:
  - projectId: The project ID
  - vaultId: The vault ID
  - status: Filter by status ('active', 'archived', 'trashed')
  - format: Response format

Returns:
  Paginated list of uploads with download URLs.`,
    {
      projectId: z.number().describe('Project ID'),
      vaultId: z.number().describe('Vault ID'),
      status: z.enum(['active', 'archived', 'trashed']).optional().describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, vaultId, status, format }) => {
      try {
        const result = await client.listUploads(projectId, vaultId, { status });
        return formatResponse(result, format, 'uploads');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Upload
  // ===========================================================================
  server.tool(
    'basecamp_get_upload',
    `Get a single file upload.

Args:
  - projectId: The project ID
  - uploadId: The upload ID
  - format: Response format

Returns:
  The upload with filename, size, and download URL.`,
    {
      projectId: z.number().describe('Project ID'),
      uploadId: z.number().describe('Upload ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, uploadId, format }) => {
      try {
        const upload = await client.getUpload(projectId, uploadId);
        return formatResponse(upload, format, 'upload');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Upload
  // ===========================================================================
  server.tool(
    'basecamp_create_upload',
    `Create a new file upload in a vault.

Note: First use basecamp_create_attachment to upload the file and get an
attachable_sgid, then use this tool to add it to a vault.

Args:
  - projectId: The project ID
  - vaultId: The vault ID
  - attachableSgid: The attachment SGID from basecamp_create_attachment
  - description: HTML description
  - baseName: Custom filename (without extension)

Returns:
  The created upload.`,
    {
      projectId: z.number().describe('Project ID'),
      vaultId: z.number().describe('Vault ID'),
      attachableSgid: z.string().describe('Attachment SGID'),
      description: z.string().optional().describe('HTML description'),
      baseName: z.string().optional().describe('Custom filename'),
    },
    async ({ projectId, vaultId, attachableSgid, description, baseName }) => {
      try {
        const upload = await client.createUpload(projectId, vaultId, {
          attachableSgid,
          description,
          baseName,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Upload created', upload }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Upload
  // ===========================================================================
  server.tool(
    'basecamp_update_upload',
    `Update an existing upload's description or filename.

Args:
  - projectId: The project ID
  - uploadId: The upload ID
  - description: New HTML description
  - baseName: New filename (without extension)

Returns:
  The updated upload.`,
    {
      projectId: z.number().describe('Project ID'),
      uploadId: z.number().describe('Upload ID'),
      description: z.string().optional().describe('New HTML description'),
      baseName: z.string().optional().describe('New filename'),
    },
    async ({ projectId, uploadId, ...input }) => {
      try {
        const upload = await client.updateUpload(projectId, uploadId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Upload updated', upload }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
