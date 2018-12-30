export const DEFAULT_FIRST_LOGINS: number = 100;
export const DEFAULT_FIRST_REPOS: number = 5;
export const DEFAULT_SCOPES: string[] = ['repo', 'read:org'];
export const GITHUB_API: string = 'https://api.github.com/graphql';
export const GITHUB_OAUTH_URL: string = 'https://github.com/login/oauth/authorize';
export const GITHUB_TOKEN_URL: string = 'https://github.com/login/oauth/access_token';
export const REDIRECT_URL: string = process.env.REDIRECT_URL || 'https://github.com/gmenih341/github-omnibox';
export const CLIENT_ID: string = process.env.CLIENT_ID || '';
export const CLIENT_SECRET: string = process.env.CLIENT_SECRET || '';
