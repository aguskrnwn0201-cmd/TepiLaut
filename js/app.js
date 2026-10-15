import { db } from './db.js';

const list = document.getElementById('list');
const tabs = document.querySelectorAll('.tab');
const badge = document.getElementById('offline-badge');
let currentTab = 'books';

const STATUS_LABEL = {
  reading: 'Sedang dibaca',
  read: 'Selesai',
  wishlist: 'Wishlist'
};

function bookCard(book) {
  const card = document.createElement('div');
  card.className = 'rounded-xl bg-white p-4 shadow-sm';

  const title = document.createElement('p');
  title.className = 'font-bold';
  title.textContent = book.title;

  const author = document.createElement('p');
  author.className = 'text-sm text-slate-500';
  author.textContent = book.author || '-';

  // Dropdown ubah status
  const select = document.createElement('select');
  select.className = 'rounded-lg border border-slate-300 bg-sky-50 px-2 py-1 text-xs text-sky-700';
  for (const [value, label] of Object.entries(STATUS_LABEL)) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    opt.selected = value === book.status;
    select.append(opt);
  }
  select.addEventListener('change', async () => {
    await db.books.update(book.id, { status: select.value });
    render();
  });

  // Tombol hapus
  const del = document.createElement('button');
  del.className = 'text-xs text-red-500';
  del.textContent = 'Hapus';
  del.addEventListener('click', async () => {
    if (!confirm(`Hapus "${book.title}"?`)) return;
    await db.transaction('rw', db.books, db.notes, async () => {
      await db.notes.where('bookId').equals(book.id).delete();
      await db.books.delete(book.id);
    });
    render();
  });

  const actions = document.createElement('div');
  actions.className = 'mt-3 flex items-center justify-between';
  actions.append(select, del);

  card.append(title, author, actions);
  return card;
}

function noteCard(note, book) {
  const card = document.createElement('div');
  const isQuote = note.type === 'quote';
  card.className = 'rounded-xl bg-white p-4 shadow-sm border-l-4 ' +
    (isQuote ? 'border-teal-500' : 'border-sky-400');

  const content = document.createElement('p');
  content.className = isQuote ? 'italic' : '';
  content.textContent = note.content;

  const meta = document.createElement('p');
  meta.className = 'mt-2 text-xs text-slate-500';
  meta.textContent = (book ? book.title : '(buku dihapus)') +
    (note.page ? ` · hlm. ${note.page}` : '');

  const del = document.createElement('button');
  del.className = 'mt-2 text-xs text-red-500';
  del.textContent = 'Hapus';
  del.addEventListener('click', async () => {
    if (!confirm('Hapus catatan ini?')) return;
    await db.notes.delete(note.id);
    render();
  });

  card.append(content, meta, del);
  return card;
}

async function render() {
  list.innerHTML = '';

  tabs.forEach((t) => {
    const active = t.dataset.tab === currentTab;
    t.classList.toggle('font-bold', active);
    t.classList.toggle('text-sky-700', active);
    t.classList.toggle('text-slate-500', !active);
  });

    if (currentTab === 'notes') {
    const notes = await db.notes.orderBy('createdAt').reverse().toArray();
    if (notes.length === 0) {
      list.textContent = 'Belum ada catatan.';
      return;
    }
    const books = await db.books.toArray();
    const byId = new Map(books.map((b) => [b.id, b]));
    notes.forEach((n) => list.append(noteCard(n, byId.get(n.bookId))));
    return;
  }

  const books = currentTab === 'wishlist'
    ? await db.books.where('status').equals('wishlist').toArray()
    : await db.books.where('status').anyOf('reading', 'read').toArray();

  if (books.length === 0) {
    list.textContent = 'Belum ada buku.';
    return;
  }
  books.forEach((b) => list.append(bookCard(b)));
}

tabs.forEach((t) =>
  t.addEventListener('click', () => {
    currentTab = t.dataset.tab;
    render();
  })
);

function updateOnlineStatus() {
  badge.classList.toggle('hidden', navigator.onLine);
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

const dialog = document.getElementById('book-dialog');
const form = document.getElementById('book-form');
const noteDialog = document.getElementById('note-dialog');
const noteForm = document.getElementById('note-form');

async function openNoteDialog() {
  const books = await db.books.toArray();
  if (books.length === 0) {
    alert('Tambah buku dulu sebelum membuat catatan.');
    return;
  }
  const select = noteForm.elements.bookId;
  select.innerHTML = '';
  books.forEach((b) => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.title;
    select.append(opt);
  });
  noteForm.reset();
  noteDialog.showModal();
}

document.getElementById('add-btn').addEventListener('click', () => {
  if (currentTab === 'notes') {
    openNoteDialog();
    return;
  }
  form.reset();
  form.elements.status.value = currentTab === 'wishlist' ? 'wishlist' : 'reading';
  dialog.showModal();
});

document.getElementById('cancel-note-btn').addEventListener('click', () => noteDialog.close());

document.getElementById('cancel-btn').addEventListener('click', () => dialog.close());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const status = data.get('status');

  await db.books.add({
    title: data.get('title').trim(),
    author: data.get('author').trim(),
    status,
    createdAt: Date.now()
  });

  dialog.close();
  currentTab = status === 'wishlist' ? 'wishlist' : 'books';
  render();
});

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(noteForm);
  const page = data.get('page');

  await db.notes.add({
    bookId: Number(data.get('bookId')),
    type: data.get('type'),
    content: data.get('content').trim(),
    page: page ? Number(page) : undefined,
    createdAt: Date.now()
  });

  noteDialog.close();
  render();
});

window.db = db; // sementara, untuk tes dari console
updateOnlineStatus();
render();