import { db } from './db.js';

// ─── DOM refs ────────────────────────────────────────────────────────────────
const list        = document.getElementById('list');
const tabs        = document.querySelectorAll('.tab');
const badge       = document.getElementById('offline-badge');
const toast       = document.getElementById('toast');
const darkToggle  = document.getElementById('dark-toggle');
const darkIcon    = document.getElementById('dark-icon');

// Detail view
const detailView      = document.getElementById('detail-view');
const detailBack      = document.getElementById('detail-back');
const detailHeading   = document.getElementById('detail-heading');
const detailEditBtn   = document.getElementById('detail-edit');
const detailCover     = document.getElementById('detail-cover');
const detailTitle     = document.getElementById('detail-title');
const detailAuthor    = document.getElementById('detail-author');
const detailBadge     = document.getElementById('detail-status-badge');
const detailMeta      = document.getElementById('detail-meta');
const detailBlurbWrap = document.getElementById('detail-blurb-wrap');
const detailBlurb     = document.getElementById('detail-blurb');
const detailNotes     = document.getElementById('detail-notes');
const detailAddNote   = document.getElementById('detail-add-note');

// Form / dialog
const dialog      = document.getElementById('book-dialog');
const form        = document.getElementById('book-form');
const noteDialog  = document.getElementById('note-dialog');
const noteForm    = document.getElementById('note-form');
const coverInput  = form.elements.cover;
const coverPreview = document.getElementById('cover-preview');

let currentTab   = 'books';
let toastTimer;
let pendingCover = null;
let currentCover = null;
let previewUrl   = null;
let editingId    = null;
let detailBookId = null;   // buku yang sedang dibuka di detail view

// ─── Dark mode ───────────────────────────────────────────────────────────────
function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  darkIcon.textContent = dark ? '☀️' : '🌙';
  document.getElementById('theme-color-meta').content = dark ? '#0F172A' : '#0284C7';
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark);
})();

darkToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  darkIcon.textContent = isDark ? '☀️' : '🌙';
  document.getElementById('theme-color-meta').content = isDark ? '#0F172A' : '#0284C7';
});

// ─── Toast ───────────────────────────────────────────────────────────────────
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('opacity-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('opacity-0'), 2200);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function resizeImage(file, maxWidth = 600) {
  const bitmap = await createImageBitmap(file);
  const scale  = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(bitmap.width  * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
}

const num  = (v) => (v === '' ? undefined : Number(v));
const text = (v) => (v.trim() === '' ? undefined : v.trim());

const STATUS_LABEL = {
  unread:   'Belum dibaca',
  reading:  'Sedang dibaca',
  read:     'Selesai',
  wishlist: 'Wishlist',
};

const STATUS_COLOR = {
  unread:   'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  reading:  'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  read:     'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  wishlist: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

const TEXT_FIELDS = ['title','language','author','translator','illustrator','publisher','edition','blurb','ownership'];
const NUM_FIELDS  = ['totalPages','price'];

function makeCoverEl(book, h = 24, w = 16) {
  const wrap = document.createElement('div');
  wrap.className = `flex h-${h} w-${w} shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sky-100 dark:bg-slate-700 text-3xl shadow`;
  if (book.cover) {
    const img = document.createElement('img');
    img.className = 'h-full w-full object-cover';
    img.alt = '';
    const url = URL.createObjectURL(book.cover);
    img.src = url;
    img.onload = () => URL.revokeObjectURL(url);
    wrap.append(img);
  } else {
    wrap.textContent = '📖';
  }
  return wrap;
}

// ─── Book Card ────────────────────────────────────────────────────────────────
function bookCard(book) {
  const card = document.createElement('article');
  card.className = 'flex gap-3 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer';

  // cover
  card.append(makeCoverEl(book, 24, 16));

  // body
  const body = document.createElement('div');
  body.className = 'min-w-0 flex-1 flex flex-col gap-1';

  const title = document.createElement('p');
  title.className = 'font-bold leading-snug line-clamp-2';
  title.textContent = book.title;

  const author = document.createElement('p');
  author.className = 'text-sm text-slate-500 dark:text-slate-400 truncate';
  author.textContent = book.author || '—';

  // status badge
  const statusBadge = document.createElement('span');
  statusBadge.className = `self-start mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[book.status] || ''}`;
  statusBadge.textContent = STATUS_LABEL[book.status] || book.status;

  // info line
  const info = document.createElement('p');
  info.className = 'text-xs text-slate-400 dark:text-slate-500';
  const parts = [];
  if (book.totalPages) parts.push(`${book.totalPages} hlm.`);
  if (book.publisher)  parts.push(book.publisher);
  if (book.price)      parts.push('Rp ' + book.price.toLocaleString('id-ID'));
  info.textContent = parts.join(' · ');

  // actions row
  const actions = document.createElement('div');
  actions.className = 'mt-2 flex flex-wrap items-center gap-2';

  // status dropdown
  const select = document.createElement('select');
  select.className = 'rounded-lg border border-slate-200 dark:border-slate-600 bg-sky-50 dark:bg-slate-700 px-2 py-1 text-xs text-sky-700 dark:text-sky-300';
  for (const [value, label] of Object.entries(STATUS_LABEL)) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    opt.selected = value === book.status;
    select.append(opt);
  }
  select.addEventListener('change', async (e) => {
    e.stopPropagation();
    await db.books.update(book.id, { status: select.value });
    showToast('Status diperbarui');
    render();
  });

  const btnEdit = makeActionBtn('Edit', 'text-slate-600 dark:text-slate-300');
  btnEdit.addEventListener('click', (e) => { e.stopPropagation(); openBookDialog(book); });

  const btnNote = makeActionBtn('+ Catatan', 'text-sky-600 dark:text-sky-400');
  btnNote.addEventListener('click', (e) => { e.stopPropagation(); openNoteDialog(book.id); });

  const btnDel = makeActionBtn('Hapus', 'text-red-500');
  btnDel.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirm(`Hapus "${book.title}"?`)) return;
    await db.transaction('rw', db.books, db.notes, async () => {
      await db.notes.where('bookId').equals(book.id).delete();
      await db.books.delete(book.id);
    });
    showToast('Buku dihapus');
    render();
  });

  actions.append(select, btnEdit, btnNote, btnDel);
  body.append(title, author, statusBadge, info, actions);
  card.append(body);

  // tap kartu → detail
  card.addEventListener('click', () => openDetailView(book.id));

  return card;
}

function makeActionBtn(label, colorClass) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `text-xs rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${colorClass}`;
  btn.textContent = label;
  return btn;
}

// ─── Note Card ────────────────────────────────────────────────────────────────
function noteCard(note, book, showDelete = true) {
  const card = document.createElement('div');
  const isQuote = note.type === 'quote';
  card.className = 'rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border-l-4 ' +
    (isQuote ? 'border-teal-500' : 'border-sky-400');

  const content = document.createElement('p');
  content.className = `text-sm leading-relaxed ${isQuote ? 'italic' : ''}`;
  content.textContent = isQuote ? `"${note.content}"` : note.content;

  const meta = document.createElement('p');
  meta.className = 'mt-2 text-xs text-slate-400 dark:text-slate-500';
  const metaParts = [];
  if (book) metaParts.push(book.title);
  else      metaParts.push('(buku dihapus)');
  if (note.page) metaParts.push(`hlm. ${note.page}`);
  meta.textContent = metaParts.join(' · ');

  card.append(content, meta);

  if (showDelete) {
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'mt-2 text-xs text-red-500 hover:underline';
    del.textContent = 'Hapus';
    del.addEventListener('click', async () => {
      if (!confirm('Hapus catatan ini?')) return;
      await db.notes.delete(note.id);
      showToast('Catatan dihapus');
      // refresh wherever visible
      if (detailBookId !== null) await refreshDetailNotes(detailBookId);
      render();
    });
    card.append(del);
  }

  return card;
}

// ─── Detail View ─────────────────────────────────────────────────────────────
async function openDetailView(bookId) {
  detailBookId = bookId;
  const book = await db.books.get(bookId);
  if (!book) return;

  // heading & title
  detailHeading.textContent = book.title;
  detailTitle.textContent   = book.title;
  detailAuthor.textContent  = book.author || '—';

  // status badge
  detailBadge.className = `inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_COLOR[book.status] || ''}`;
  detailBadge.textContent = STATUS_LABEL[book.status] || book.status;

  // cover
  detailCover.innerHTML = '';
  detailCover.className = 'flex h-40 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sky-100 dark:bg-slate-700 text-4xl shadow-md';
  if (book.cover) {
    const img = document.createElement('img');
    img.className = 'h-full w-full object-cover';
    img.alt = '';
    const url = URL.createObjectURL(book.cover);
    img.src = url;
    img.onload = () => URL.revokeObjectURL(url);
    detailCover.append(img);
  } else {
    detailCover.textContent = '📖';
  }

  // meta rows
  detailMeta.innerHTML = '';
  const metaFields = [
    ['Penulis',      book.author],
    ['Penerjemah',   book.translator],
    ['Ilustrator',   book.illustrator],
    ['Penerbit',     book.publisher],
    ['Cetakan',      book.edition],
    ['Halaman',      book.totalPages ? `${book.totalPages} hlm.` : null],
    ['Bahasa',       book.language],
    ['Harga',        book.price ? 'Rp ' + book.price.toLocaleString('id-ID') : null],
    ['Kepemilikan',  book.ownership],
  ];
  metaFields.forEach(([label, value]) => {
    if (!value) return;
    const row = document.createElement('div');
    row.className = 'flex gap-2';
    row.innerHTML = `<span class="w-28 shrink-0 text-slate-400 dark:text-slate-500">${label}</span>
                     <span class="flex-1 font-medium">${value}</span>`;
    detailMeta.append(row);
  });
  if (!detailMeta.children.length) {
    detailMeta.innerHTML = '<p class="text-xs text-slate-400">Tidak ada data tambahan.</p>';
  }

  // blurb
  if (book.blurb) {
    detailBlurb.textContent = book.blurb;
    detailBlurbWrap.classList.remove('hidden');
  } else {
    detailBlurbWrap.classList.add('hidden');
  }

  // notes
  await refreshDetailNotes(bookId);

  // edit button
  detailEditBtn.onclick = () => openBookDialog(book);
  detailAddNote.onclick = () => openNoteDialog(bookId);

  // slide in
  detailView.scrollTop = 0;
  detailView.classList.remove('translate-x-full');
}

async function refreshDetailNotes(bookId) {
  detailNotes.innerHTML = '';
  const notes = await db.notes.where('bookId').equals(bookId).reverse().sortBy('createdAt');
  if (notes.length === 0) {
    detailNotes.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500">Belum ada catatan untuk buku ini.</p>';
    return;
  }
  const book = await db.books.get(bookId);
  notes.forEach((n) => detailNotes.append(noteCard(n, book, true)));
}

function closeDetailView() {
  detailView.classList.add('translate-x-full');
  detailBookId = null;
}

detailBack.addEventListener('click', closeDetailView);

// Back gesture / browser back on detail view
window.addEventListener('popstate', () => {
  if (!detailView.classList.contains('translate-x-full')) closeDetailView();
});

// ─── Render ───────────────────────────────────────────────────────────────────
async function render() {
  list.innerHTML = '';

  tabs.forEach((t) => {
    const active = t.dataset.tab === currentTab;
    t.classList.toggle('font-bold',    active);
    t.classList.toggle('text-sky-700', active);
    t.classList.toggle('dark:text-sky-400', active);
    t.classList.toggle('text-slate-500', !active);
  });

  if (currentTab === 'notes') {
    const notes = await db.notes.orderBy('createdAt').reverse().toArray();
    if (notes.length === 0) {
      emptyState(list, '📝', 'Belum ada catatan.');
      return;
    }
    const books = await db.books.toArray();
    const byId  = new Map(books.map((b) => [b.id, b]));
    notes.forEach((n) => list.append(noteCard(n, byId.get(n.bookId))));
    return;
  }

  const books = currentTab === 'wishlist'
    ? await db.books.where('status').equals('wishlist').toArray()
    : await db.books.where('status').anyOf('unread', 'reading', 'read').toArray();

  if (books.length === 0) {
    const msg = currentTab === 'wishlist' ? 'Wishlist masih kosong.' : 'Belum ada buku.';
    emptyState(list, '📚', msg);
    return;
  }
  books.forEach((b) => list.append(bookCard(b)));
}

function emptyState(container, icon, msg) {
  container.innerHTML = `
    <div class="flex flex-col items-center gap-2 py-16 text-slate-400 dark:text-slate-600">
      <span class="text-5xl">${icon}</span>
      <p class="text-sm">${msg}</p>
    </div>`;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
tabs.forEach((t) =>
  t.addEventListener('click', () => {
    currentTab = t.dataset.tab;
    render();
  })
);

// ─── Online / offline ─────────────────────────────────────────────────────────
function updateOnlineStatus() {
  badge.classList.toggle('hidden', navigator.onLine);
}
window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// ─── Cover preview ────────────────────────────────────────────────────────────
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

// ─── Book dialog ──────────────────────────────────────────────────────────────
dialog.addEventListener('close', () => {
  editingId    = null;
  pendingCover = null;
  currentCover = null;
  showCoverPreview(null);
});

function openBookDialog(book) {
  editingId    = book ? book.id : null;
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

document.getElementById('add-btn').addEventListener('click', () => {
  if (currentTab === 'notes') { openNoteDialog(); return; }
  openBookDialog();
});
document.getElementById('cancel-btn').addEventListener('click', () => dialog.close());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data   = new FormData(form);
  const status = data.get('status');

  const fields = { status };
  TEXT_FIELDS.forEach((f) => { fields[f] = text(data.get(f)); });
  NUM_FIELDS.forEach((f)  => { fields[f] = num(data.get(f));  });
  fields.cover = pendingCover ?? currentCover ?? undefined;

  if (editingId) {
    await db.books.update(editingId, fields);
    showToast('Buku diperbarui ✓');
    // refresh detail view if open for the same book
    if (detailBookId === editingId) await openDetailView(editingId);
  } else {
    await db.books.add({ ...fields, createdAt: Date.now() });
    showToast('Buku ditambahkan ✓');
  }

  editingId  = null;
  dialog.close();
  currentTab = status === 'wishlist' ? 'wishlist' : 'books';
  render();
});

// ─── Note dialog ──────────────────────────────────────────────────────────────
async function openNoteDialog(bookId) {
  const books = await db.books.toArray();
  if (books.length === 0) {
    alert('Tambah buku dulu sebelum membuat catatan.');
    return;
  }
  const sel = noteForm.elements.bookId;
  sel.innerHTML = '';
  books.forEach((b) => {
    const opt = document.createElement('option');
    opt.value     = b.id;
    opt.textContent = b.title;
    sel.append(opt);
  });
  noteForm.reset();
  if (bookId) noteForm.elements.bookId.value = String(bookId);
  noteDialog.showModal();
}

document.getElementById('cancel-note-btn').addEventListener('click', () => noteDialog.close());

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(noteForm);
  const page = data.get('page');

  const bookId = Number(data.get('bookId'));
  await db.notes.add({
    bookId,
    type:      data.get('type'),
    content:   data.get('content').trim(),
    page:      page ? Number(page) : undefined,
    createdAt: Date.now(),
  });

  noteDialog.close();
  showToast('Catatan disimpan ✓');
  if (detailBookId === bookId) await refreshDetailNotes(bookId);
  render();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
updateOnlineStatus();
render();
