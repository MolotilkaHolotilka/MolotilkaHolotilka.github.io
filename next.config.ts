import { createNextConfig } from './githubPagesConfig';

const nextConfig = createNextConfig(process.env.GITHUB_PAGES === 'true');

export default nextConfig;
