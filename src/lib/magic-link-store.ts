// Simple in-memory store for magic link tokens
// In production, you should use a database like Redis

interface MagicLinkToken {
  email: string;
  expiresAt: number;
  createdAt: number;
}

const magicLinkTokens = new Map<string, MagicLinkToken>();

export function storeMagicLinkToken(token: string, email: string, expiresAt: number) {
  magicLinkTokens.set(token, { 
    email, 
    expiresAt,
    createdAt: Date.now()
  });
}

export function getMagicLinkToken(token: string): MagicLinkToken | null {
  return magicLinkTokens.get(token) || null;
}

export function deleteMagicLinkToken(token: string): boolean {
  return magicLinkTokens.delete(token);
}

export function isTokenExpired(token: MagicLinkToken): boolean {
  return Date.now() > token.expiresAt;
}

// Clean up expired tokens (call this periodically)
export function cleanupExpiredTokens(): number {
  let cleanedCount = 0;
  const now = Date.now();
  
  for (const [token, tokenData] of magicLinkTokens.entries()) {
    if (now > tokenData.expiresAt) {
      magicLinkTokens.delete(token);
      cleanedCount++;
    }
  }
  
  return cleanedCount;
}
