import mongoose from 'mongoose';

interface Cache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
// eslint-disable-next-line no-var
declare global { var __mongooseCache: Cache }

const cached: Cache = global.__mongooseCache ?? { conn: null, promise: null };
if (!global.__mongooseCache) global.__mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGO_DB;
  if (!MONGODB_URI) throw new Error('MONGO_DB environment variable is not set.');

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
