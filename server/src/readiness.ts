export type ReadinessCheck = () => boolean | Promise<boolean>;

export async function getReadiness(
  check: ReadinessCheck = () => true,
): Promise<'ready' | 'not_ready'> {
  try {
    return await check() ? 'ready' : 'not_ready';
  } catch {
    // A failed probe must not expose internal details or poison future requests.
    return 'not_ready';
  }
}
