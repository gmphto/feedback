export type ReadinessCheck = () => boolean | Promise<boolean>;

// Application-only readiness: database checks belong to issue #3.
export function checkApplicationReadiness(): boolean {
  return true;
}

export async function getReadiness(
  check: ReadinessCheck = checkApplicationReadiness,
): Promise<'ready' | 'not_ready'> {
  try {
    return await check() ? 'ready' : 'not_ready';
  } catch {
    // A failed probe must not expose internal details or poison future requests.
    return 'not_ready';
  }
}
