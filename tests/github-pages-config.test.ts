import { describe, expect, it } from 'vitest';
import { createNextConfig } from '../githubPagesConfig';

describe('GitHub Pages build configuration', () => {
  it('exports static files only for the dedicated Pages build', () => {
    const pagesConfig = createNextConfig(true);
    expect(pagesConfig.output).toBe('export');
    expect(pagesConfig.trailingSlash).toBe(true);
  });

  it('preserves the Vinext build defaults otherwise', () => {
    const sitesConfig = createNextConfig(false);
    expect(sitesConfig.output).toBeUndefined();
    expect(sitesConfig.trailingSlash).toBeUndefined();
  });
});
