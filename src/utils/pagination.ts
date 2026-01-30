/**
 * Pagination Utilities
 *
 * Helpers for handling pagination in the Basecamp API.
 * Basecamp uses link-based pagination following RFC5988.
 */

import type { PaginatedResponse, PaginationParams } from '../types/entities.js';

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
} as const;

/**
 * Normalize pagination parameters
 */
export function normalizePaginationParams(
  params?: PaginationParams
): PaginationParams {
  return {
    page: params?.page || PAGINATION_DEFAULTS.page,
    status: params?.status,
  };
}

/**
 * Create an empty paginated response
 */
export function emptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    items: [],
    count: 0,
    hasMore: false,
  };
}

/**
 * Create a paginated response from an array
 */
export function createPaginatedResponse<T>(
  items: T[],
  options: {
    hasMore?: boolean;
    nextPageUrl?: string;
  } = {}
): PaginatedResponse<T> {
  return {
    items,
    count: items.length,
    hasMore: options.hasMore ?? false,
    nextPageUrl: options.nextPageUrl,
  };
}

/**
 * Parse Link header for pagination
 * Basecamp uses RFC5988 Link headers for pagination
 * Example: <https://...?page=2>; rel="next"
 */
export function parseLinkHeader(linkHeader?: string | null): {
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
} {
  if (!linkHeader) return {};

  const links: Record<string, string> = {};
  const parts = linkHeader.split(',');

  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const [, url, rel] = match;
      links[rel] = url;
    }
  }

  return links;
}

/**
 * Extract page number from URL
 */
export function extractPageFromUrl(url?: string): number | undefined {
  if (!url) return undefined;

  try {
    const urlObj = new URL(url);
    const page = urlObj.searchParams.get('page');
    return page ? parseInt(page, 10) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Check if there are more pages based on Link header
 */
export function hasNextPage(linkHeader?: string | null): boolean {
  const links = parseLinkHeader(linkHeader);
  return !!links.next;
}

/**
 * Get next page URL from Link header
 */
export function getNextPageUrl(linkHeader?: string | null): string | undefined {
  const links = parseLinkHeader(linkHeader);
  return links.next;
}
