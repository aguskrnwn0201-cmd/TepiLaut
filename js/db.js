import Dexie from './lib/dexie.mjs';

export const db = new Dexie('SimpleBookTrackerDB');

db.version(1).stores({
  books: '++id, title, status, createdAt',
  notes: '++id, bookId, type, createdAt'
});