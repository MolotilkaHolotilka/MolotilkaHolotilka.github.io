import type { NextConfig } from 'next';

export const createNextConfig = (githubPages: boolean): NextConfig =>
  githubPages ? { output: 'export', trailingSlash: true } : {};
