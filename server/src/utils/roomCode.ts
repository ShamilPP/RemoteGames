/**
 * Generate a 4-digit join code
 */
export function generateJoinCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

