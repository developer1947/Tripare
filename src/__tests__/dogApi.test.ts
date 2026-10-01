import { withExponentialBackoff } from '../api/dogApi';

describe('dogApi exponential backoff retry logic', () => {
  it('returns value immediately on first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withExponentialBackoff(fn, { maxRetries: 3 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and resolves when subsequent attempt succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network drop 1'))
      .mockRejectedValueOnce(new Error('Network drop 2'))
      .mockResolvedValue('recovered');

    const onRetry = jest.fn();

    const result = await withExponentialBackoff(fn, {
      maxRetries: 3,
      initialDelayMs: 10,
      onRetry,
    });

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('throws error when maxRetries is exceeded', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Fatal 500 error'));

    await expect(
      withExponentialBackoff(fn, { maxRetries: 2, initialDelayMs: 10 })
    ).rejects.toThrow('Fatal 500 error');

    expect(fn).toHaveBeenCalledTimes(3);
  });
});
