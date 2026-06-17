/** Convert a stroops-denominated bigint to a human-readable decimal string. */
export function formatAmount(raw: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const fraction = raw % divisor;
  return fraction === 0n
    ? String(whole)
    : `${whole}.${String(fraction).padStart(decimals, '0').replace(/0+$/, '')}`;
}

/** Seconds remaining in a stream from now. Returns 0 if already past stop_time. */
export function secondsRemaining(stopTime: bigint): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return stopTime > now ? Number(stopTime - now) : 0;
}
