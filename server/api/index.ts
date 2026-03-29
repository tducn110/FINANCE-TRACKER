import { handle } from '@hono/node-server/vercel';

// Bỏ đuôi .js đi để Vercel tự động nhận diện file TypeScript (app.ts)
import app from '../src/app';

export const config = {
    runtime: 'nodejs20.x',
};

export default handle(app);