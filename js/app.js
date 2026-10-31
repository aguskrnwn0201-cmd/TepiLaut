import { db } from './db.js';

const list = document.getElementById('list');
const tabs = document.querySelectorAll('.tab');
const badge = document.getElementById('offline-badge');
let currentTab = 'books';

const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('opacity-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('opacity-0'), 2000);
}

async function resizeImage(file, maxWidth = 600) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
}

const STATUS_LABEL = {
  unread: 'Belum dibaca',
  reading: 'Sedang dibaca',
  read: 'Selesai',
  wishlist: 'Wishlist'
};

const TEXT_FIELDS = ['title', 'language', 'author', 'translator', 'illustrator', 'publisher', 'edition', 'blurb', 'ownership'];
const NUM_FIELDS = ['totalPages', 'price'];

function bookCard(book) {
  const card = document.createElement('div');
  card.className = 'flex gap-3 rounded-xl bg-white p-4 shadow-sm';

  const title = document.createElement('p');
  title.className = 'font-bold';
  title.textContent = book.title;

  const author = document.createElement('p');
  author.className = 'text-sm text-slate-500';
  author.textContent = book.author || '-';

  const info = document.createElement('p');
  info.className = 'mt-1 text-xs text-slate-400';
    const parts = [];
  if (book.totalPages) parts.push(`${book.totalPages} hlm.`);
  if (book.publisher) parts.push(book.publisher);
  if (book.price) parts.push('Rp ' + book.price.toLocaleString('id-ID'));
  if (book.ownership) parts.push(book.ownership);
  info.textContent = parts.join(' · ');

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
    showToast('Buku dihapus');
    render();
  });

  const addNote = document.createElement('button');
  addNote.className = 'text-xs text-sky-700';
  addNote.textContent = '+ Catatan';
  addNote.addEventListener('click', () => openNoteDialog(book.id));

  const edit = document.createElement('button');
  edit.className = 'text-xs text-slate-600';
  edit.textContent = 'Edit';
  edit.addEventListener('click', () => openBookDialog(book));

  const right = document.createElement('div');
  right.className = 'flex items-center gap-3';
  right.append(edit, addNote, del);

  const actions = document.createElement('div');
    actions.className = 'mt-3 flex flex-wrap items-center justify-between gap-2';
  actions.append(select, right);

   const cover = document.createElement('div');
  cover.className = 'flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sky-100 text-2xl';
  if (book.cover) {
    const img = document.createElement('img');
    img.className = 'h-full w-full object-cover';
    img.alt = '';
    img.src = URL.createObjectURL(book.cover);
    img.onload = () => URL.revokeObjectURL(img.src);
    cover.append(img);
  } else {
    cover.textContent = '📖';
  }

    const body = document.createElement('div');
  body.className = 'min-w-0 flex-1';
  body.append(title, author, info, actions);

  card.append(cover, body);
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
    showToast('Catatan dihapus');
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
    : await db.books.where('status').anyOf('unread', 'reading', 'read').toArray();

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
let pendingCover = null;   // foto baru yang dipilih
let currentCover = null;   // foto lama saat mengedit
let previewUrl = null;

const coverInput = form.elements.cover;
const coverPreview = document.getElementById('cover-preview');

function showCoverPreview(blob) {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = blob ? URL.createObjectURL(blob) : null;
  if (previewUrl) coverPreview.src = previewUrl;
  else coverPreview.removeAttribute('src');
  coverPreview.classList.toggle('hidden', !blob);
}

coverInput.addEventListener('change', async () => {
  const file = coverInput.files[0];
  if (!file) return;
  try {
    pendingCover = await resizeImage(file);
    showCoverPreview(pendingCover);
  } catch {
    showToast('Foto tidak bisa dibaca');
  }
});

let editingId = null;
dialog.addEventListener('close', () => {
  editingId = null;
  pendingCover = null;
  currentCover = null;
  showCoverPreview(null);
});

function openBookDialog(book) {
  editingId = book ? book.id : null;
  form.reset();
  document.getElementById('book-dialog-title').textContent = book ? 'Edit Buku' : 'Tambah Buku';
  pendingCover = null;
  currentCover = book?.cover ?? null;
  showCoverPreview(currentCover);
  if (book) {
    [...TEXT_FIELDS, ...NUM_FIELDS].forEach((f) => {
      form.elements[f].value = book[f] ?? '';
    });
    form.elements.status.value = book.status;
  } else {
    form.elements.status.value = currentTab === 'wishlist' ? 'wishlist' : 'reading';
  }
  dialog.scrollTop = 0;
  dialog.showModal();
}

async function openNoteDialog(bookId) {
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
  if (bookId) noteForm.elements.bookId.value = String(bookId);
  noteDialog.showModal();
}

document.getElementById('add-btn').addEventListener('click', () => {
  if (currentTab === 'notes') {
    openNoteDialog();
    return;
  }
  openBookDialog();
});
document.getElementById('cancel-note-btn').addEventListener('click', () => noteDialog.close());

document.getElementById('cancel-btn').addEventListener('click', () => dialog.close());

const num = (v) => (v === '' ? undefined : Number(v));
const text = (v) => (v.trim() === '' ? undefined : v.trim());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const status = data.get('status');

  const fields = { status };
  TEXT_FIELDS.forEach((f) => { fields[f] = text(data.get(f)); });
  NUM_FIELDS.forEach((f) => { fields[f] = num(data.get(f)); });
  fields.cover = pendingCover ?? currentCover ?? undefined;
  if (editingId) {
    await db.books.update(editingId, fields);
    showToast('Buku diperbarui');
  } else {
    await db.books.add({ ...fields, createdAt: Date.now() });
    showToast('Buku ditambahkan');
  }

  editingId = null;
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
  showToast('Catatan disimpan');
  render();
});

window.db = db; // sementara, untuk tes dari console
updateOnlineStatus();
render();