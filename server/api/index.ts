import { handle } from '@hono/node-server/vercel';
import app from '../src/app';

export const config = {
    runtime: 'nodejs', // ❌ Bỏ cái đuôi 20.x đi, chỉ để nodejs thôi!
};

export default handle(app);