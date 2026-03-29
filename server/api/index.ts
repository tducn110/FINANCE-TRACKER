import { handle } from '@hono/node-server/vercel';

// ✅ BẮT BUỘC PHẢI CÓ ĐUÔI .js Ở ĐÂY DÙ FILE GỐC LÀ .ts
import app from '../src/app.js';

export const config = {
    runtime: 'nodejs',
};

export default handle(app);