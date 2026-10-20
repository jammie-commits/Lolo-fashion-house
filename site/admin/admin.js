(() => {
  const $ = (s) => document.querySelector(s);
  const FILE_RE = /^[A-Za-z0-9_-]+\.jpg$/;
  const HIDDEN_KEYS = new Set(['id', 'href']);
  const LONG_KEYS = /copy|desc|intro|note|detail|promise|extra|paragraphs/i;
  const SECTION_TITLES = {
    heroes: 'Page headers (title, intro and photo)',
    homeStrip: 'Home page gallery preview',
    brands: 'Brands (Home page cards)',
    collections: 'LoLo Fashion House collections',
    bridalOfferings: 'LoLo Bridal offerings',
    beforeIDo: 'Before I Do packages & prices',
    guardianAngel: 'Bridal Guardian Angel',
    planning: 'Wedding planning',
    digitalProducts: 'Digital products',
    about: 'About us',
    mfalme: 'Mfalme by LoLo',
    kidsInfo: 'LoLo Kids',
  };

  let photos = [];
  let used = [];
  let content = null;
  let dirty = false;

  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
    }
    el.append(...kids.flat().filter((x) => x != null));
    return el;
  };

  const toast = (msg, bad = false) => {
    const t = $('#toast');
    t.textContent = msg;
    t.className = `show${bad ? ' bad' : ''}`;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (t.className = ''), 4000);
  };

  const api = async (path, method = 'GET', body) => {
    const res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/api/auth') showLogin();
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  };

  const LABELS = { img: 'Photo', image: 'Photo', alt: 'Photo description', addonsImage: 'Photo', packageImages: 'Photos', desc: 'Intro text', eyebrow: 'Small heading above title' };
  const humanize = (k) => LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const photoUrl = (f) => `/assets/gallery/${f}`;

  // Resize in the browser so uploads stay small and always arrive as JPEG.
  const toJpeg = async (file, max = 1600) => {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = h('canvas', { width: Math.round(bmp.width * scale), height: Math.round(bmp.height * scale) });
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  };

  const showLogin = () => {
    for (const id of ['#photos', '#content', '#tabs', '#logout']) $(id).hidden = true;
    $('#login').hidden = false;
  };

  const showTab = (name) => {
    $('#login').hidden = true;
    $('#tabs').hidden = false;
    $('#logout').hidden = false;
    for (const b of document.querySelectorAll('#tabs button')) b.classList.toggle('active', b.dataset.tab === name);
    $('#photos').hidden = name !== 'photos';
    $('#content').hidden = name !== 'content';
  };

  /* Photos */
  const loadPhotos = async () => {
    const data = await api('/api/photos');
    photos = data.photos;
    used = data.used;
    renderPhotos();
  };

  const renderPhotos = () => {
    $('#photo-grid').replaceChildren(
      ...photos.map((p) => {
        const alt = h('input', { type: 'text', value: p.alt, maxlength: '200', 'aria-label': 'Caption' });
        const listed = h('input', { type: 'checkbox' });
        listed.checked = p.listed !== false;
        const isUsed = used.includes(p.file);
        const replace = h('input', { type: 'file', accept: 'image/*', hidden: true });
        replace.addEventListener('change', async () => {
          if (!replace.files[0]) return;
          await run(async () => {
            await api('/api/photos', 'PUT', { file: p.file, image: await toJpeg(replace.files[0]) });
            toast('Photo replaced. The live site updates in about a minute.');
            await loadPhotos();
          });
        });
        return h(
          'div',
          { class: 'photo-card' },
          h('img', { src: photoUrl(p.file), alt: p.alt, loading: 'lazy' }),
          isUsed ? h('span', { class: 'badge' }, 'Used on pages') : null,
          alt,
          h('label', { class: 'check' }, listed, 'Show in Gallery page'),
          h(
            'div',
            { class: 'actions' },
            h('button', { type: 'button', class: 'primary', onclick: () => run(async () => {
              await api('/api/photos', 'PUT', { file: p.file, alt: alt.value, listed: listed.checked });
              toast('Saved. The live site updates in about a minute.');
              await loadPhotos();
            }) }, 'Save'),
            h('label', { class: 'button' }, 'Replace', replace),
            h('button', { type: 'button', class: 'danger', onclick: () => {
              if (!confirm('Delete this photo permanently?')) return;
              run(async () => {
                await api('/api/photos', 'DELETE', { file: p.file });
                toast('Photo deleted. The live site updates in about a minute.');
                await loadPhotos();
              });
            } }, 'Delete'),
          ),
        );
      }),
    );
  };

  const busy = async (on) => document.querySelectorAll('button').forEach((b) => (b.disabled = on));
  const run = async (fn) => {
    await busy(true);
    try {
      await fn();
    } catch (e) {
      toast(e.message, true);
    } finally {
      await busy(false);
    }
  };

  $('#upload').addEventListener('change', (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    run(async () => {
      for (const [i, f] of files.entries()) {
        toast(`Uploading ${i + 1} of ${files.length}…`);
        await api('/api/photos', 'POST', { image: await toJpeg(f), listed: $('#upload-listed').checked });
      }
      toast('Photos added. The live site updates in about a minute.');
      await loadPhotos();
    });
  });

  /* Content editor */
  const markDirty = () => {
    dirty = true;
    $('#content-dirty').textContent = 'Unsaved changes';
  };

  const pickPhoto = () =>
    new Promise((resolve) => {
      const dlg = $('#picker');
      $('#picker-grid').replaceChildren(
        ...photos.map((p) => h('button', { type: 'button', title: p.alt, onclick: () => { dlg.close(); resolve(p.file); } }, h('img', { src: photoUrl(p.file), alt: p.alt, loading: 'lazy' }))),
      );
      dlg.addEventListener('close', () => resolve(null), { once: true });
      dlg.showModal();
    });

  const blank = (node) => {
    if (typeof node === 'string') return FILE_RE.test(node) ? node : '';
    if (Array.isArray(node)) return node.length ? [blank(node[0])] : [];
    if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, HIDDEN_KEYS.has(k) ? v : blank(v)]));
    return node;
  };

  const field = (parent, key, label) => {
    const value = parent[key];
    if (typeof value === 'string') {
      if (FILE_RE.test(value)) {
        const img = h('img', { src: photoUrl(value), alt: '' });
        const name = h('span', { class: 'muted' }, value);
        const btn = h('button', { type: 'button', onclick: async () => {
          const pick = await pickPhoto();
          if (!pick) return;
          parent[key] = pick;
          img.src = photoUrl(pick);
          name.textContent = pick;
          markDirty();
        } }, 'Change photo');
        return h('div', { class: 'picker-field' }, h('div', {}, h('div', { class: 'muted' }, label), btn), img, name);
      }
      const long = value.length > 70 || LONG_KEYS.test(key) || LONG_KEYS.test(label);
      const input = long ? h('textarea', {}, value) : h('input', { type: 'text', value });
      input.value = value;
      input.addEventListener('input', () => {
        parent[key] = input.value;
        markDirty();
      });
      return h('label', {}, label, input);
    }

    if (Array.isArray(value)) {
      const box = h('div', { class: 'group' }, h('div', { class: 'group-title' }, label));
      const renderItems = () => {
        box.replaceChildren(
          box.firstChild,
          ...value.map((_, i) =>
            h(
              'div',
              { class: 'item' },
              h('div', { class: 'item-head' }, h('span', { class: 'muted' }, `${humanize(key)} ${i + 1}`), h('button', { type: 'button', class: 'danger', onclick: () => {
                if (!confirm('Remove this item?')) return;
                value.splice(i, 1);
                markDirty();
                renderItems();
              } }, 'Remove')),
              Array.isArray(value[i]) && value[i].every((x) => typeof x === 'string')
                ? h('div', { class: 'row-pair' }, ...value[i].map((_, j) => field(value[i], j, ['Item', 'Price'][j] || `Value ${j + 1}`)))
                : field(value, i, 'Value'),
            ),
          ),
          value.length ? h('button', { type: 'button', onclick: () => {
            value.push(blank(value[value.length - 1]));
            markDirty();
            renderItems();
          } }, `Add ${humanize(key).toLowerCase()} item`) : null,
        );
      };
      renderItems();
      return box;
    }

    if (value && typeof value === 'object') {
      return h(
        'div',
        { class: 'group' },
        h('div', { class: 'group-title' }, label),
        ...Object.keys(value).filter((k) => !HIDDEN_KEYS.has(k)).map((k) => field(value, k, humanize(k))),
      );
    }
    return null;
  };

  const renderContent = () => {
    $('#content-form').replaceChildren(
      ...Object.keys(content).map((k) =>
        h('details', { class: 'section' }, h('summary', {}, SECTION_TITLES[k] || humanize(k)), h('div', { class: 'fields' }, field(content, k, ''))),
      ),
    );
    dirty = false;
    $('#content-dirty').textContent = '';
  };

  const loadContent = async () => {
    if (!photos.length) await loadPhotos();
    content = (await api('/api/content')).content;
    renderContent();
  };

  $('#save-content').addEventListener('click', () =>
    run(async () => {
      await api('/api/content', 'PUT', { content });
      dirty = false;
      $('#content-dirty').textContent = '';
      toast('Saved. The live site updates in about a minute.');
    }),
  );

  window.addEventListener('beforeunload', (e) => {
    if (dirty) e.preventDefault();
  });

  /* Session */
  for (const b of document.querySelectorAll('#tabs button')) {
    b.addEventListener('click', () => {
      showTab(b.dataset.tab);
      run(b.dataset.tab === 'photos' ? loadPhotos : loadContent);
    });
  }

  $('#logout').addEventListener('click', async () => {
    await api('/api/auth', 'DELETE');
    showLogin();
  });

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#login-error').textContent = '';
    try {
      await api('/api/auth', 'POST', { password: $('#password').value });
      $('#password').value = '';
      showTab('photos');
      run(loadPhotos);
    } catch (err) {
      $('#login-error').textContent = err.message;
    }
  });

  api('/api/auth')
    .then((s) => {
      if (s.authed) {
        showTab('photos');
        run(loadPhotos);
      } else showLogin();
    })
    .catch(showLogin);
})();
