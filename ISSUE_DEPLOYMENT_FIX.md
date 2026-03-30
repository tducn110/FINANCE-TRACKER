# Issue: Monorepo Deployment Failure and Connectivity Issues

## Description
The Finance Tracker project is currently experiencing several key issues that prevent successful deployment on Vercel and stable local development.

### Identified Problems:
1.  **Vercel Build Conflict**: The `main` branch deployment is failing because `vercel.json` and root `package.json` build scripts are not synchronized for a full monorepo build (Client + Server).
2.  **Missing Base Config**: The project root is missing a `tsconfig.json` file, causing IDE error TS5033 in `@vercel/analytics` and potentially other libraries.
3.  **Hardcoded Dev Endpoint**: The `dev` branch is hardcoded to talk to a broken/offline Vercel backend (`tducn.vercel.app`), making local testing impossible.
4.  **CORS Misconfiguration**: The production server may not be accepting requests from Vercel preview environments correctly.

## Proposed Fix
- Unified root-level build script and Vercel configuration.
- Unified root `tsconfig.json`.
- Environment-agnostic API base URL (`/api`).
- Robust CORS policy for the Hono backend.
