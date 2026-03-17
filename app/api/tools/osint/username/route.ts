import { NextRequest, NextResponse } from 'next/server';
import { usernameSearchSchema } from '@/lib/validators/tools';

// List of platforms to check username availability
const PLATFORMS = [
  { name: 'GitHub', url: 'https://github.com/{username}', checkUrl: 'https://api.github.com/users/{username}' },
  { name: 'Twitter/X', url: 'https://twitter.com/{username}', checkUrl: null },
  { name: 'Instagram', url: 'https://instagram.com/{username}', checkUrl: null },
  { name: 'Reddit', url: 'https://reddit.com/u/{username}', checkUrl: 'https://www.reddit.com/user/{username}/about.json' },
  { name: 'Dev.to', url: 'https://dev.to/{username}', checkUrl: 'https://dev.to/api/users/by_username?url={username}' },
  { name: 'HackerNews', url: 'https://news.ycombinator.com/user?id={username}', checkUrl: 'https://hacker-news.firebaseio.com/v0/user/{username}.json' },
  { name: 'GitLab', url: 'https://gitlab.com/{username}', checkUrl: 'https://gitlab.com/api/v4/users?username={username}' },
  { name: 'Keybase', url: 'https://keybase.io/{username}', checkUrl: 'https://keybase.io/_/api/1.0/user/lookup.json?username={username}' },
  { name: 'Pastebin', url: 'https://pastebin.com/u/{username}', checkUrl: null },
  { name: 'Medium', url: 'https://medium.com/@{username}', checkUrl: null },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = usernameSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { username } = parsed.data;
    const results: Array<{
      platform: string;
      url: string;
      found: boolean | null;
      error?: string;
    }> = [];

    await Promise.allSettled(
      PLATFORMS.map(async (platform) => {
        const profileUrl = platform.url.replace('{username}', username);
        let found: boolean | null = null;
        let error: string | undefined;

        if (platform.checkUrl) {
          const checkUrl = platform.checkUrl.replace('{username}', username);
          try {
            const res = await fetch(checkUrl, {
              headers: { 'User-Agent': 'CyberKit/1.0' },
              signal: AbortSignal.timeout(5000),
            });
            if (platform.name === 'GitHub') {
              found = res.status === 200;
            } else if (platform.name === 'HackerNews') {
              const data = await res.json();
              found = data !== null;
            } else if (platform.name === 'GitLab') {
              const data = await res.json();
              found = Array.isArray(data) && data.length > 0;
            } else {
              found = res.status === 200;
            }
          } catch {
            found = null;
            error = 'Check unavailable';
          }
        }

        results.push({ platform: platform.name, url: profileUrl, found, error });
      })
    );

    return NextResponse.json({ username, results });
  } catch (err) {
    console.error('Username search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
