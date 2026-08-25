import { afterEach, describe, expect, it, vi } from 'vitest';

const loadConfig = async (githubPages: string) => {
  vi.resetModules();
  vi.stubEnv('GITHUB_PAGES', githubPages);
  return (await import('../next.config')).default;
};

afterEach(() => vi.unstubAllEnvs());

describe('GitHub Pages build configuration', () => {
  it('exports static files only for the dedicated Pages build', async () => {
    const pagesConfig = await loadConfig('true');
    expect(pagesConfig.output).toBe('export');
    expect(pagesConfig.trailingSlash).toBe(true);
  });

  it('preserves the Vinext build defaults otherwise', async () => {
    const sitesConfig = await loadConfig('false');
    expect(sitesConfig.output).toBeUndefined();
    expect(sitesConfig.trailingSlash).toBeUndefined();
  });
});
