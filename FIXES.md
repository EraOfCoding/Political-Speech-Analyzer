# Bug Fixes

## Webpack Parse Error with ytdl-core

### Problem
Next.js was trying to parse the `undici` package (a dependency of `@distube/ytdl-core`) on the client side, which uses modern JavaScript syntax (private fields with `#`) that webpack couldn't handle.

Error:
```
Module parse failed: Unexpected token (619:63)
if (typeof this !== "object" || this === null || !(#target in this)) {
```

### Solution
Implemented a multi-layered approach to ensure ytdl-core is only used server-side:

#### 1. Updated `next.config.js`
Added webpack configuration to exclude server-only packages from client bundle:

```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
  }
  config.externals = config.externals || [];
  if (!isServer) {
    config.externals.push('@distube/ytdl-core', 'undici');
  }
  return config;
}
```

#### 2. Added Dynamic Imports
Updated `lib/youtube.ts` and `lib/audio.ts` to use dynamic imports:

```typescript
// Before
import ytdl from '@distube/ytdl-core';

// After
async function getYtdl() {
  const ytdl = await import('@distube/ytdl-core');
  return ytdl.default;
}
```

#### 3. Added `server-only` Package
Installed and imported `server-only` in library files to enforce server-side usage:

```typescript
import 'server-only';
```

This ensures these files will throw an error if accidentally imported on the client side.

#### 4. Updated Environment Variables
Changed OpenAI API key from `NEXT_PUBLIC_OPENAI_API_KEY` to `OPENAI_API_KEY` (removed NEXT_PUBLIC_ prefix) to ensure it's server-side only.

### Files Modified
- `next.config.js` - Added webpack configuration
- `lib/youtube.ts` - Dynamic imports + server-only
- `lib/audio.ts` - Dynamic imports + server-only
- `lib/openai.ts` - Added server-only
- `.env.local` - Updated variable names
- `package.json` - Added `server-only` package

### Result
✅ Dev server now starts without webpack errors
✅ ytdl-core is correctly isolated to server-side only
✅ API routes work as expected
✅ Client bundle size reduced (no ytdl-core in client)
