import { randomBytes } from 'crypto'

// High-entropy, URL-safe bearer token for the pre-auth /results/[token] page.
// (32 bytes; see the migration's SECURITY notes, consider hashing + expiry later.)
export function generateResultToken(): string {
  return randomBytes(32).toString('base64url')
}
