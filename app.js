// ===== לא שכחתי — app.js =====

// ========== DATA ==========
let contacts = JSON.parse(localStorage.getItem('ls_v1_contacts') || '[]');
let settings = JSON.parse(localStorage.getItem('ls_v1_settings') || '{}');
let greetings = JSON.parse(localStorage.getItem('ls_v1_greetings') || 'null') || {
  birthday_male:   'יום הולדת שמח! שהשנה תביא לך בריאות, אושר והצלחה 🎂',
  birthday_female: 'יום הולדת שמח! שתמשיכי לקרן ולהאיר לכולנו 🌟',
  birthday_other:  'יום הולדת שמח! שהשנה תביא לך את כל הטוב 🎉',
  memorial:        'זכרו יהיה ברוך לעד. מחבק מרחוק 🕯️',
  anniversary:     'יום נישואין שמח! שתמשיכו לאהוב ולצמוח יחד 💍',
  wedding:         'מזל טוב! שתתחילו את דרכם המשותפת באהבה ובאושר 💒',
};
let myGreetings = JSON.parse(localStorage.getItem('ls_v1_my_greetings') || '["","","","",""]');
let activeStores = JSON.parse(localStorage.getItem('ls_v1_stores') || '["Amazon","KSP","זאפ"]');

// ========== DEFAULT SETTINGS ==========
const defaultSettings = {
  showStats: true, showHero: true, showBudget: false,
  showCalendar: true, showNotifPanel: false,
  defaultFilter: '30', defaultSort: 'date',
  sounds: true, confetti: true,
  notifEnabled: true, notifSound: true, notifVibrate: false,
  defaultDayBefore: true, defaultWeekBefore: false, giftReminder: true,
  largeFont: false, animations: true,
  theme: 'purple', mode: 'dark',
};
settings = Object.assign({}, defaultSettings, settings);

// ========== SAVE ==========
function save() { localStorage.setItem('ls_v1_contacts', JSON.stringify(contacts)); }
function saveSetting(key, val) { settings[key] = val; localStorage.setItem('ls_v1_settings', JSON.stringify(settings)); }
function saveAllSettings() { localStorage.setItem('ls_v1_settings', JSON.stringify(settings)); }

// ========== SCREEN NAVIGATION ==========
let _history = ['screen-main'];
function openScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
  _history.push(id);
  if (id === 'screen-main') renderMain();
  if (id === 'screen-contacts') renderContactsList();
  if (id === 'screen-greetings') renderGreetings();
  if (id === 'screen-stores') renderStores();
  if (id === 'screen-budget-summary') renderBudgetSummary();
  if (id === 'screen-search') { setTimeout(() => document.getElementById('searchInput').focus(), 100); renderSearchFilters(); }
}

// ========== SOUNDS ==========
let _actx = null;
function getACtx() { if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)(); return _actx; }
function playSound(type) {
  if (!settings.sounds) return;
  try {
    const ctx = getACtx();
    const g = ctx.createGain(); g.gain.value = 0.15; g.connect(ctx.destination);
    const play = (freq, start, dur, wave = 'sine') => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = wave; o.frequency.value = freq;
      og.gain.setValueAtTime(0.3, ctx.currentTime + start);
      og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      o.connect(og); og.connect(g);
      o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.05);
    };
    if (type === 'save')   { play(520, 0, 0.12); play(660, 0.14, 0.18); }
    if (type === 'delete') { play(380, 0, 0.1); play(220, 0.12, 0.18); }
    if (type === 'greet')  { play(880, 0, 0.15); play(660, 0.17, 0.2); }
    if (type === 'edit')   { play(600, 0, 0.08); }
  } catch (e) {}
}

// ========== CONFETTI ==========
function triggerConfetti() {
  if (!settings.confetti) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const pieces = Array.from({length:80}, () => ({
    x: Math.random() * canvas.width, y: -10,
    w: 7 + Math.random() * 7, h: 7 + Math.random() * 7,
    color: 'hsl(' + Math.floor(Math.random()*360) + ',90%,60%)',
    vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 3,
    rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 8,
  }));
  let frame = 0;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    if (++frame < 100) requestAnimationFrame(draw); else canvas.remove();
  };
  draw();
}

// ========== EVENT CALCULATIONS ==========
const YEARLY_TYPES = ['birthday', 'anniversary', 'memorial', 'holiday'];
function getRecurrence(type) { return YEARLY_TYPES.includes(type) ? 'yearly' : 'once'; }

function calcDays(dateStr, recurrence) {
  if (!dateStr) return { daysLeft: null, isOver: false, pastDays: null };
  const today = new Date(); today.setHours(0,0,0,0);
  const ev = new Date(dateStr);
  if (recurrence === 'once') {
    const diff = Math.round((ev - today) / 86400000);
    return { daysLeft: diff >= 0 ? diff : null, isOver: diff < 0, pastDays: diff < 0 ? -diff : null };
  }
  // yearly
  let next = new Date(today.getFullYear(), ev.getMonth(), ev.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
  const daysLeft = Math.round((next - today) / 86400000);
  return { daysLeft, isOver: false, pastDays: null, nextDate: next };
}

// ========== LABELS ==========
const EVENT_LABELS = {
  birthday: '🎉 יום הולדת', wedding: '💒 חתונה', anniversary: '💍 יום נישואין',
  memorial: '🕯️ אזכרה', barmitzvah: '✡️ בר/בת מצווה', friends: '👥 מפגש חברים',
  trip: '✈️ טיול', car: '🚗 טסט לרכב', medical: '🏥 תור רפואי',
  holiday: '🎊 חג', graduation: '🎓 סיום לימודים', custom: '✨ אירוע',
};
function getLabel(type, custom) { return EVENT_LABELS[type] || custom || '✨ אירוע'; }

const AVATAR_COLORS = [
  ['#1e1b4b','#a5b4fc'], ['#042c53','#93c5fd'], ['#052e16','#86efac'],
  ['#451a03','#fed7aa'], ['#2e1065','#c4b5fd'], ['#0c1e3c','#93c5fd'],
];
function avatarColor(name) {
  const i = (name || 'A').charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}
function avatarEl(name, size = 'sm', photo = '') {
  const cls = 'avatar avatar-' + size;
  if (photo) return '<img src="' + photo + '" class="' + cls + '" style="object-fit:cover;">';
  const [bg, fg] = avatarColor(name);
  const letter = (name || '?')[0].toUpperCase();
  return '<div class="' + cls + '" style="background:' + bg + ';color:' + fg + ';">' + letter + '</div>';
}

function countdownBadge(daysLeft, isOver) {
  if (isOver || daysLeft === null) return '<span class="countdown-far">עבר</span>';
  if (daysLeft === 0) return '<span class="countdown-today">🎉 היום!</span>';
  if (daysLeft === 1) return '<span class="countdown-today">🔥 מחר!</span>';
  if (daysLeft <= 7)  return '<span class="countdown-soon">⚡ עוד ' + daysLeft + ' ימים</span>';
  if (daysLeft <= 30) return '<span class="countdown-normal">📅 עוד ' + daysLeft + ' ימים</span>';
  return '<span class="countdown-far">📅 עוד ' + daysLeft + ' ימים</span>';
}

function urgencyBadge(daysLeft, isOver) {
  if (isOver || daysLeft === null) return '<span class="badge badge-gray">עבר</span>';
  if (daysLeft === 0) return '<span class="badge badge-red">היום!</span>';
  if (daysLeft === 1) return '<span class="badge badge-red">מחר</span>';
  if (daysLeft <= 7)  return '<span class="badge badge-amber">' + daysLeft + ' ימים</span>';
  if (daysLeft <= 30) return '<span class="badge badge-purple">' + daysLeft + ' ימים</span>';
  return '<span class="badge badge-gray">' + daysLeft + ' ימים</span>';
}

// ========== MAIN RENDER ==========
let calYear, calMonth;

function renderMain() {
  const today = new Date();
  if (calYear === undefined) { calYear = today.getFullYear(); calMonth = today.getMonth(); }

  // calc days for all
  const enriched = contacts.map(c => ({ ...c, ...calcDays(c.date, getRecurrence(c.type)) }));
  const filter = settings.defaultFilter || '30';
  const sort = settings.defaultSort || 'date';

  // stats
  if (settings.showStats) {
    const upcoming30 = enriched.filter(c => c.daysLeft !== null && c.daysLeft <= 30).length;
    const totalBudget = contacts.reduce((s, c) => s + (parseInt(c.budget) || 0), 0);
    const statsHtml = '<div class="stat-card"><div class="stat-num">' + upcoming30 + '</div><div class="stat-label">אירועים ב-30 יום</div></div>' +
      '<div class="stat-card"><div class="stat-num green">' + totalBudget + '₪</div><div class="stat-label">תקציב מתנות</div></div>';
    document.getElementById('statsGrid').innerHTML = statsHtml;
    document.getElementById('statsGrid').style.display = '';
  } else {
    document.getElementById('statsGrid').style.display = 'none';
  }

  // calendar
  document.getElementById('calendarSection').style.display = settings.showCalendar ? '' : 'none';
  if (settings.showCalendar) renderCalendar(enriched);

  // hero
  document.getElementById('heroWidget').style.display = settings.showHero ? '' : 'none';
  if (settings.showHero) renderHero(enriched);

  // group filters
  renderGroupFilters(enriched);

  // events list
  renderEventsList(enriched, filter, sort);
}

// ========== CALENDAR ==========
function renderCalendar(enriched) {
  const today = new Date();
  const monthNames = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  document.getElementById('calMonthLabel').textContent = monthNames[calMonth] + ' ' + calYear;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // build event day map
  const eventDays = {};
  enriched.forEach(c => {
    if (!c.date) return;
    const ev = new Date(c.date);
    const rec = getRecurrence(c.type);
    let evYear = ev.getFullYear(), evMonth = ev.getMonth(), evDay = ev.getDate();
    if (rec === 'yearly') evYear = calYear;
    if (evYear === calYear && evMonth === calMonth) {
      if (!eventDays[evDay]) eventDays[evDay] = [];
      eventDays[evDay].push(c);
    }
  });

  let html = '';
  // empty cells
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
    const hasEvents = eventDays[d];
    const isUrgent = hasEvents && hasEvents.some(c => { const calc = calcDays(c.date, getRecurrence(c.type)); return calc.daysLeft !== null && calc.daysLeft <= 7; });
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (hasEvents) cls += ' has-event';
    if (isUrgent) cls += ' urgent';
    html += '<div class="' + cls + '" onclick="onCalDayClick(' + d + ',' + calMonth + ',' + calYear + ')">' + d + '</div>';
  }
  document.getElementById('calGrid').innerHTML = html;
}

function changeMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  const enriched = contacts.map(c => ({ ...c, ...calcDays(c.date, getRecurrence(c.type)) }));
  renderCalendar(enriched);
}

function onCalDayClick(d, m, y) {
  // find events for that day
  const events = contacts.filter(c => {
    if (!c.date) return false;
    const ev = new Date(c.date);
    const rec = getRecurrence(c.type);
    const evM = ev.getMonth(), evD = ev.getDate();
    const evY = rec === 'yearly' ? y : ev.getFullYear();
    return evY === y && evM === m && evD === d;
  });
  if (!events.length) return;

  const monthNames = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  document.getElementById('calPopupTitle').textContent = '📅 ' + d + ' ' + monthNames[m];

  const html = events.map(c => {
    const [bg, fg] = avatarColor(c.name);
    return '<div class="cal-popup-event"><div class="avatar avatar-sm" style="background:' + bg + ';color:' + fg + ';">' + (c.name||'?')[0].toUpperCase() + '</div><div><div style="font-size:13px;font-weight:500;">' + (c.name||'') + '</div><div style="font-size:11px;color:var(--muted);">' + getLabel(c.type, c.customType) + '</div></div></div>';
  }).join('');
  document.getElementById('calPopupList').innerHTML = html;

  const popup = document.getElementById('calPopup');
  popup.classList.add('open');
}

function closeCalPopup() { document.getElementById('calPopup').classList.remove('open'); }

// ========== HERO WIDGET ==========
function renderHero(enriched) {
  const upcoming = enriched.filter(c => c.daysLeft !== null).sort((a,b) => a.daysLeft - b.daysLeft);
  if (!upcoming.length) { document.getElementById('heroWidget').innerHTML = ''; return; }
  const c = upcoming[0];
  const [bg, fg] = avatarColor(c.name);
  document.getElementById('heroWidget').innerHTML =
    '<div class="hero-card" onclick="openEventDetail(' + c.id + ')">' +
    '<div class="hero-label">הבא בתור</div>' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<div class="avatar avatar-sm" style="background:' + bg + ';color:' + fg + ';">' + (c.name||'?')[0].toUpperCase() + '</div>' +
    '<div><div class="hero-name">' + (c.name||'') + '</div>' +
    '<div style="font-size:11px;color:#818cf8;margin-top:2px;">' + getLabel(c.type, c.customType) + '</div></div>' +
    '</div>' +
    '<span class="hero-badge">' + (c.daysLeft === 0 ? '🎉 היום!' : c.daysLeft === 1 ? '🔥 מחר!' : '📅 עוד ' + c.daysLeft + ' ימים') + '</span>' +
    '</div>';

  // confetti on event day
  const todayEvents = enriched.filter(c => c.daysLeft === 0);
  if (todayEvents.length) setTimeout(triggerConfetti, 500);
}

// ========== GROUP FILTERS ==========
let activeGroupFilter = '';
function renderGroupFilters(enriched) {
  const groups = ['', ...new Set(enriched.map(c => c.group).filter(Boolean))];
  const html = groups.map(g =>
    '<div class="chip' + (activeGroupFilter === g ? ' active' : '') + '" onclick="setGroupFilter(\'' + g.replace(/'/g,'\\\'') + '\')">' +
    (g === '' ? 'הכל' : g) + '</div>'
  ).join('');
  document.getElementById('groupFilterRow').innerHTML = html;
}

function setGroupFilter(g) {
  activeGroupFilter = g;
  const enriched = contacts.map(c => ({ ...c, ...calcDays(c.date, getRecurrence(c.type)) }));
  renderGroupFilters(enriched);
  renderEventsList(enriched, settings.defaultFilter || '30', settings.defaultSort || 'date');
}

// ========== EVENTS LIST ==========
function renderEventsList(enriched, filter, sort) {
  let list = [...enriched];

  // group filter
  if (activeGroupFilter) list = list.filter(c => c.group === activeGroupFilter);

  // time filter
  if (filter === '30') list = list.filter(c => c.daysLeft !== null && c.daysLeft <= 30);
  else if (filter === 'future') list = list.filter(c => c.daysLeft !== null && !c.isOver);
  else if (filter === 'past') list = list.filter(c => c.isOver);

  // sort
  if (sort === 'name') list.sort((a,b) => (a.name||'').localeCompare(b.name||'','he'));
  else if (sort === 'group') list.sort((a,b) => (a.group||'').localeCompare(b.group||'','he'));
  else list.sort((a,b) => {
    if (a.daysLeft === null && b.daysLeft === null) return 0;
    if (a.daysLeft === null) return 1;
    if (b.daysLeft === null) return -1;
    return a.daysLeft - b.daysLeft;
  });

  const cont = document.getElementById('eventsList');
  if (!list.length) {
    if (!contacts.length) {
      cont.innerHTML = '<div class="empty-state">' +
        '<div class="empty-icon">🔔</div>' +
        '<div class="empty-title">ברוך הבא ל"לא שכחתי"!</div>' +
        '<div class="empty-sub">האפליקציה שתזכיר לך כל אירוע חשוב</div>' +
        '<div class="features-list">' +
        '<div class="feature-row"><div class="feature-icon" style="background:rgba(99,102,241,0.2);">🎉</div>ימי הולדת ואירועים</div>' +
        '<div class="feature-row"><div class="feature-icon" style="background:rgba(52,211,153,0.15);">🎁</div>ניהול מתנות ותקציב</div>' +
        '<div class="feature-row"><div class="feature-icon" style="background:rgba(251,191,36,0.15);">🔔</div>תזכורות חכמות</div>' +
        '<div class="feature-row"><div class="feature-icon" style="background:rgba(99,102,241,0.15);">💬</div>ברכות בוואטסאפ</div>' +
        '</div>' +
        '<button class="btn-primary" onclick="openScreen(\'screen-add-event\')">➕ הוסף אירוע ראשון</button>' +
        '<button class="btn-ghost" onclick="openScreen(\'screen-import\')">📥 ייבוא מלוח השנה</button>' +
        '</div>';
    } else {
      cont.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">לא נמצאו אירועים</div>';
    }
    return;
  }

  cont.innerHTML = list.map(c => buildEventCard(c)).join('');
}

function buildEventCard(c) {
  const [bg, fg] = avatarColor(c.name);
  const letter = (c.name||'?')[0].toUpperCase();
  const hasGift = c.giftIdea || c.budget;
  const notifCount = (c.notifications || []).length;

  const storeLinksHtml = c.giftIdea ? activeStores.map(s =>
    '<a href="https://www.google.com/search?q=' + encodeURIComponent(c.giftIdea + ' ' + s) + '" target="_blank" class="store-link">🔍 ' + s + '</a>'
  ).join('') : '';

  const giftHtml = hasGift ? (
    '<div class="gift-box">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
    '<span class="gift-title">🎁 ' + (c.giftIdea || '') + (c.budget ? ' | ' + c.budget + ' ₪' : '') + '</span>' +
    '<button onclick="event.stopPropagation();toggleGiftStatus(' + c.id + ')" style="background:' + (c.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';color:white;border:none;padding:3px 9px;border-radius:var(--radius-full);font-size:11px;cursor:pointer;">' +
    (c.giftStatus==='paid'?'✅ נקנה':'⏳ לביצוע') + '</button>' +
    '</div>' +
    '<div class="store-links">' + storeLinksHtml + '</div>' +
    '</div>'
  ) : '';

  const greetingText = buildGreeting(c);

  return '<div class="event-card new-card" id="card-' + c.id + '">' +
    '<div class="event-card-main">' +
    '<div class="avatar avatar-sm" style="background:' + bg + ';color:' + fg + ';">' + letter + '</div>' +
    '<div style="flex:1;min-width:0;">' +
    '<div style="font-weight:600;font-size:16px;">' + (c.name||'') + '</div>' +
    '<div style="font-size:12px;color:var(--accent);margin-top:1px;">' + getLabel(c.type, c.customType) + '</div>' +
    '<div style="margin-top:4px;">' + countdownBadge(c.daysLeft, c.isOver) + '</div>' +
    '</div>' +
    urgencyBadge(c.daysLeft, c.isOver) +
    '</div>' +
    '<div class="event-card-actions">' +
    '<button class="card-btn share" onclick="event.stopPropagation();shareEvent(' + c.id + ')">📱 שתף</button>' +
    '<button class="card-btn edit" onclick="event.stopPropagation();editEvent(' + c.id + ')">✏️ ערוך</button>' +
    '<button class="card-btn" onclick="event.stopPropagation();toggleDetails(' + c.id + ',this)">⚙️ עוד ▼</button>' +
    '</div>' +
    '<div class="details-panel" id="details-' + c.id + '">' +
    (c.group ? '<div class="detail-row"><span class="detail-label">🏷️ קבוצה</span><span>' + c.group + '</span></div>' : '') +
    (c.phone ? '<div class="detail-row"><span class="detail-label">📱 טלפון</span><a href="tel:' + c.phone + '" style="color:var(--accent);">' + c.phone + '</a></div>' : '') +
    (c.notes ? '<div style="font-size:12px;font-style:italic;color:var(--muted);padding:6px 0;border-bottom:1px solid var(--border);">💡 ' + c.notes + '</div>' : '') +
    (notifCount ? '<div class="detail-row"><span class="detail-label">🔔 תזכורות</span><span style="color:var(--accent);">' + notifCount + '</span></div>' : '') +
    giftHtml +
    '<div class="greet-box">' +
    '<div class="greet-label">💬 ברכה מוכנה</div>' +
    '<div class="greet-text">' + greetingText + '</div>' +
    '<div class="greet-actions">' +
    '<button class="greet-btn" onclick="sendWhatsApp(' + c.id + ')">📱 וואטסאפ</button>' +
    '<button class="greet-btn secondary" onclick="copyGreeting(' + c.id + ')">📋 העתק</button>' +
    '</div></div>' +
    '</div>' +
    '</div>';
}

function toggleDetails(id, btn) {
  const panel = document.getElementById('details-' + id);
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open');
  btn.textContent = isOpen ? '⚙️ עוד ▼' : '▲ הסתר';
}

// ========== GREETING ==========
function buildGreeting(c) {
  const type = c.type;
  const gender = c.gender;
  const name = c.name || '';
  if (type === 'memorial') return greetings.memorial;
  if (type === 'anniversary') return greetings.anniversary.replace('!', ' ' + name + '!');
  if (type === 'wedding') return greetings.wedding.replace('!', ' ' + name + '!');
  // birthday based on gender
  const key = 'birthday_' + (gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'other');
  return greetings[key].replace('!', ' ' + name + '!');
}

function sendWhatsApp(id) {
  const c = contacts.find(x => x.id === id); if (!c) return;
  playSound('greet');
  const text = buildGreeting(c);
  const phone = (c.phone || '').replace(/\D/g,'');
  const url = phone ? 'https://wa.me/972' + phone.replace(/^0/,'') + '?text=' + encodeURIComponent(text) : 'https://wa.me/?text=' + encodeURIComponent(text);
  window.open(url, '_blank');
}

function copyGreeting(id) {
  const c = contacts.find(x => x.id === id); if (!c) return;
  playSound('greet');
  navigator.clipboard.writeText(buildGreeting(c)).then(() => alert('הברכה הועתקה! 📋'));
}

// ========== GIFT STATUS ==========
function toggleGiftStatus(id) {
  const c = contacts.find(x => x.id === id); if (!c) return;
  c.giftStatus = c.giftStatus === 'paid' ? 'pending' : 'paid';
  save(); renderMain();
}

// ========== SHARE ==========
function shareEvent(id) {
  const c = contacts.find(x => x.id === id); if (!c) return;
  const calc = calcDays(c.date, getRecurrence(c.type));
  const text = '🔔 ' + c.name + ' — ' + getLabel(c.type, c.customType) + (calc.daysLeft !== null ? ' (בעוד ' + calc.daysLeft + ' ימים)' : '') + '\n\nהאפליקציה "לא שכחתי": https://barakaflalo.github.io/lo-shachachti';
  if (navigator.share) navigator.share({ title: 'לא שכחתי', text }).catch(() => {});
  else navigator.clipboard.writeText(text).then(() => alert('הועתק! 📋'));
}

function shareApp() {
  const text = '🔔 "לא שכחתי" — האפליקציה שתזכיר לך כל יום הולדת, אזכרה ואירוע חשוב!\nhttps://barakaflalo.github.io/lo-shachachti';
  if (navigator.share) navigator.share({ title: 'לא שכחתי', text }).catch(() => {});
  else navigator.clipboard.writeText(text).then(() => alert('הקישור הועתק! 📋'));
}

// ========== FORM ==========
const GIFT_OPTIONS = [
  {e:'⌚',l:'שעון'},{e:'👕',l:'בגדים'},{e:'👟',l:'נעליים'},{e:'🖼️',l:'תמונה'},
  {e:'📱',l:'סלולר'},{e:'🎮',l:'גיימינג'},{e:'📚',l:'ספרים'},{e:'💄',l:'קוסמטיקה'},
  {e:'🌸',l:'פרחים'},{e:'🍫',l:'שוקולד'},{e:'🍷',l:'יין'},{e:'☕',l:'קפה'},
  {e:'🎒',l:'תיק'},{e:'💍',l:'תכשיטים'},{e:'🏠',l:'לבית'},{e:'🧹',l:'שואב אבק'},
  {e:'📺',l:'טלוויזיה'},{e:'🎵',l:'אוזניות'},{e:'✈️',l:'חוויה'},{e:'💆',l:'ספא'},
  {e:'🎟️',l:'כרטיסים'},{e:'💰',l:'גיפט קארד'},
];

let selectedGiftTags = [];

function initGiftTags() {
  const cont = document.getElementById('giftTagsContainer');
  if (!cont) return;
  cont.innerHTML = GIFT_OPTIONS.map(o =>
    '<div class="gift-tag" data-label="' + o.l + '" onclick="toggleGiftTag(this,\'' + o.l + '\')">' + o.e + ' ' + o.l + '</div>'
  ).join('');
}

function toggleGiftTag(el, label) {
  const idx = selectedGiftTags.indexOf(label);
  if (idx === -1) { selectedGiftTags.push(label); el.classList.add('selected'); }
  else { selectedGiftTags.splice(idx, 1); el.classList.remove('selected'); }
  updateGiftDisplay();
}

function updateGiftDisplay() {
  const custom = document.getElementById('inp-gift-idea').value;
  const all = [...selectedGiftTags, ...(custom ? [custom] : [])];
  const disp = document.getElementById('giftSelectedDisplay');
  if (all.length) { disp.style.display='block'; disp.textContent='🎁 נבחר: ' + all.join(' · '); }
  else disp.style.display='none';
}

function getGiftIdea() {
  const custom = document.getElementById('inp-gift-idea').value;
  return [...selectedGiftTags, ...(custom ? [custom] : [])].join(', ');
}

function setGiftIdea(val) {
  selectedGiftTags = [];
  document.querySelectorAll('.gift-tag').forEach(t => t.classList.remove('selected'));
  if (!val) { updateGiftDisplay(); return; }
  val.split(',').map(s => s.trim()).forEach(p => {
    const tag = document.querySelector('.gift-tag[data-label="' + p + '"]');
    if (tag) { selectedGiftTags.push(p); tag.classList.add('selected'); }
    else document.getElementById('inp-gift-idea').value = p;
  });
  updateGiftDisplay();
}

function onTypeChange() {
  const type = document.getElementById('inp-type').value;
  document.getElementById('inp-custom-type').style.display = type === 'custom' ? 'block' : 'none';
  document.getElementById('inp-recurrence').value = getRecurrence(type);
}

function onGroupSelectChange() {
  const val = document.getElementById('inp-group-select').value;
  document.getElementById('inp-group-custom').style.display = val === 'custom' ? 'block' : 'none';
}

function toggleCollapse(id) {
  const btn = document.getElementById('btn-' + id);
  const content = document.getElementById('collapse-' + id);
  const isOpen = content.classList.contains('open');
  content.classList.toggle('open');
  btn.classList.toggle('open');
  const arrow = btn.querySelector('span:last-child');
  if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
}

function openAddForm() {
  document.getElementById('formTitle').textContent = 'אירוע חדש';
  document.getElementById('editingId').value = '';
  document.getElementById('btn-delete-form').style.display = 'none';
  clearForm();
  openScreen('screen-add-event');
}

function clearForm() {
  ['inp-name','inp-date','inp-phone','inp-notes','inp-budget','inp-gift-idea','inp-custom-type','inp-group-custom'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('inp-type').value = 'birthday';
  document.getElementById('inp-gender').value = '';
  document.getElementById('inp-group-select').value = '';
  document.getElementById('inp-gift-status').value = 'pending';
  document.getElementById('inp-custom-type').style.display = 'none';
  document.getElementById('inp-group-custom').style.display = 'none';
  selectedGiftTags = [];
  document.querySelectorAll('.gift-tag').forEach(t => t.classList.remove('selected'));
  document.getElementById('giftSelectedDisplay').style.display = 'none';
  // close collapses
  ['extra','gift'].forEach(id => {
    document.getElementById('collapse-' + id).classList.remove('open');
    document.getElementById('btn-' + id).classList.remove('open');
    const arrow = document.getElementById('btn-' + id).querySelector('span:last-child');
    if (arrow) arrow.textContent = '▼';
  });
}

function cancelForm() { clearForm(); openScreen('screen-main'); }

function saveEvent() {
  const name = document.getElementById('inp-name').value.trim();
  const date = document.getElementById('inp-date').value;
  if (!name || !date) { alert('שם ותאריך הם שדות חובה'); return; }

  const groupSelect = document.getElementById('inp-group-select').value;
  const group = groupSelect === 'custom' ? document.getElementById('inp-group-custom').value.trim() : groupSelect;

  const eventData = {
    name, date,
    type: document.getElementById('inp-type').value,
    customType: document.getElementById('inp-custom-type').value,
    phone: document.getElementById('inp-phone').value.trim(),
    gender: document.getElementById('inp-gender').value,
    group,
    notes: document.getElementById('inp-notes').value.trim(),
    budget: document.getElementById('inp-budget').value,
    giftIdea: getGiftIdea(),
    giftStatus: document.getElementById('inp-gift-status').value,
  };

  const editId = document.getElementById('editingId').value;
  if (editId) {
    const idx = contacts.findIndex(c => c.id === parseInt(editId));
    if (idx !== -1) contacts[idx] = { ...contacts[idx], ...eventData };
  } else {
    eventData.id = Date.now();
    eventData.notifications = [];
    contacts.unshift(eventData);
    scheduleNotifs(eventData);
  }
  save(); playSound('save'); clearForm(); openScreen('screen-main');
}

function saveAndEdit() {
  saveEvent();
  // open last saved for editing
  if (contacts.length) editEvent(contacts[0].id);
}

function editEvent(id) {
  const c = contacts.find(x => x.id === id); if (!c) return;
  playSound('edit');
  document.getElementById('formTitle').textContent = '✏️ עריכת אירוע';
  document.getElementById('editingId').value = id;
  document.getElementById('btn-delete-form').style.display = 'block';
  document.getElementById('inp-name').value = c.name || '';
  document.getElementById('inp-date').value = c.date || '';
  document.getElementById('inp-type').value = c.type || 'birthday';
  document.getElementById('inp-custom-type').value = c.customType || '';
  document.getElementById('inp-custom-type').style.display = c.type === 'custom' ? 'block' : 'none';
  document.getElementById('inp-phone').value = c.phone || '';
  document.getElementById('inp-gender').value = c.gender || '';
  document.getElementById('inp-notes').value = c.notes || '';
  document.getElementById('inp-budget').value = c.budget || '';
  document.getElementById('inp-gift-status').value = c.giftStatus || 'pending';

  // group
  const knownGroups = ['משפחה','חברים','עבודה','צבא','טיול','לימודים','שכנים'];
  if (knownGroups.includes(c.group)) {
    document.getElementById('inp-group-select').value = c.group;
    document.getElementById('inp-group-custom').style.display = 'none';
  } else if (c.group) {
    document.getElementById('inp-group-select').value = 'custom';
    document.getElementById('inp-group-custom').value = c.group;
    document.getElementById('inp-group-custom').style.display = 'block';
  }

  // open sections if data exists
  if (c.phone || c.group || c.notes || c.gender) {
    document.getElementById('collapse-extra').classList.add('open');
    document.getElementById('btn-extra').classList.add('open');
  }
  if (c.giftIdea || c.budget) {
    document.getElementById('collapse-gift').classList.add('open');
    document.getElementById('btn-gift').classList.add('open');
  }

  setGiftIdea(c.giftIdea || '');
  openScreen('screen-add-event');
}

function deleteCurrentEvent() {
  const id = parseInt(document.getElementById('editingId').value);
  if (!id) return;
  if (!confirm('למחוק את האירוע לצמיתות?')) return;
  contacts = contacts.filter(c => c.id !== id);
  save(); playSound('delete'); clearForm(); openScreen('screen-main');
}

// ========== EVENT DETAIL SCREEN ==========
let _detailId = null;
function openEventDetail(id) {
  _detailId = id;
  const c = contacts.find(x => x.id === id); if (!c) return;
  const calc = calcDays(c.date, getRecurrence(c.type));
  const [bg, fg] = avatarColor(c.name);

  const storeLinks = c.giftIdea ? activeStores.map(s =>
    '<a href="https://www.google.com/search?q=' + encodeURIComponent(c.giftIdea + ' ' + s) + '" target="_blank" class="store-link">🔍 ' + s + '</a>'
  ).join('') : '';

  const html =
    '<div style="padding:8px 0;">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">' +
    '<div class="avatar avatar-md" style="background:' + bg + ';color:' + fg + ';">' + (c.name||'?')[0].toUpperCase() + '</div>' +
    '<div><div style="font-size:18px;font-weight:600;">' + (c.name||'') + '</div>' +
    '<div style="font-size:13px;color:var(--accent);margin-top:2px;">' + getLabel(c.type, c.customType) + '</div>' +
    '<div style="margin-top:5px;">' + countdownBadge(calc.daysLeft, calc.isOver) + '</div>' +
    '</div></div>' +
    '<div class="card" style="margin-bottom:12px;">' +
    (c.phone ? '<div class="detail-row"><span class="detail-label">📱 טלפון</span><a href="tel:' + c.phone + '" style="color:var(--accent);">' + c.phone + '</a></div>' : '') +
    (c.group ? '<div class="detail-row"><span class="detail-label">🏷️ קבוצה</span><span>' + c.group + '</span></div>' : '') +
    '<div class="detail-row"><span class="detail-label">📅 תאריך</span><span>' + (c.date||'') + '</span></div>' +
    ((c.notifications||[]).length ? '<div class="detail-row"><span class="detail-label">🔔 תזכורות</span><span style="color:var(--accent);">' + c.notifications.length + '</span></div>' : '') +
    (c.notes ? '<div style="padding:8px 0;font-size:12px;color:var(--muted);font-style:italic;">💡 ' + c.notes + '</div>' : '') +
    '</div>' +
    ((c.giftIdea || c.budget) ?
      '<div class="gift-box" style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;">' +
      '<span class="gift-title">🎁 ' + (c.giftIdea||'') + (c.budget?' | '+c.budget+' ₪':'') + '</span>' +
      '<button onclick="toggleGiftStatus(' + c.id + ');renderMain();" style="background:' + (c.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';color:white;border:none;padding:4px 10px;border-radius:var(--radius-full);font-size:12px;cursor:pointer;">' + (c.giftStatus==='paid'?'✅ נקנה':'⏳ לביצוע') + '</button>' +
      '</div><div class="store-links">' + storeLinks + '</div></div>'
      : '') +
    '<div class="greet-box" style="margin-bottom:14px;"><div class="greet-label">💬 ברכה מוכנה</div>' +
    '<div class="greet-text">' + buildGreeting(c) + '</div>' +
    '<div class="greet-actions">' +
    '<button class="greet-btn" onclick="sendWhatsApp(' + c.id + ')">📱 וואטסאפ</button>' +
    '<button class="greet-btn secondary" onclick="copyGreeting(' + c.id + ')">📋 העתק</button>' +
    '</div></div>' +
    '<div style="display:flex;gap:8px;">' +
    (c.phone ? '<button class="card-btn" style="flex:1;" onclick="window.open(\'tel:' + c.phone + '\')">📱 התקשר</button>' : '') +
    '<button class="card-btn" style="flex:1;" onclick="openScreen(\'screen-notifications\')">🔔 תזכורות</button>' +
    '<button class="card-btn" style="flex:1;color:var(--red);border-color:rgba(239,68,68,0.3);" onclick="if(confirm(\'מחק?\'))deleteEventDirect(' + c.id + ')">🗑️ מחק</button>' +
    '</div></div>';

  document.getElementById('eventDetailContent').innerHTML = html;
  openScreen('screen-event-detail');
}

function editCurrentEvent() { if (_detailId) editEvent(_detailId); }

function deleteEventDirect(id) {
  contacts = contacts.filter(c => c.id !== id);
  save(); playSound('delete'); openScreen('screen-main');
}

// ========== SEARCH ==========
let searchGroupFilter = '';
function renderSearchFilters() {
  const groups = ['', ...new Set(contacts.map(c => c.group).filter(Boolean))];
  document.getElementById('searchFilterRow').innerHTML = groups.map(g =>
    '<div class="chip' + (searchGroupFilter === g ? ' active' : '') + '" onclick="setSearchGroup(\'' + g.replace(/'/g,'\\\'') + '\')">' + (g||'הכל') + '</div>'
  ).join('');
}

function setSearchGroup(g) { searchGroupFilter = g; renderSearchFilters(); onSearch(); }

function onSearch() {
  const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  const cont = document.getElementById('searchResults');

  let list = contacts.map(c => ({ ...c, ...calcDays(c.date, getRecurrence(c.type)) }));
  if (searchGroupFilter) list = list.filter(c => c.group === searchGroupFilter);
  if (q) list = list.filter(c => (c.name||'').toLowerCase().includes(q) || getLabel(c.type, c.customType).includes(q) || (c.group||'').toLowerCase().includes(q));

  list.sort((a,b) => { if (a.daysLeft===null) return 1; if (b.daysLeft===null) return -1; return a.daysLeft-b.daysLeft; });

  if (!list.length && !q && !searchGroupFilter) {
    cont.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);"><div style="font-size:36px;margin-bottom:12px;">🔍</div><div>הקלד שם, סוג אירוע<br>או שם קבוצה</div></div>';
    return;
  }

  let html = list.length ? '<div style="font-size:11px;color:var(--muted2);margin-bottom:10px;">' + list.length + ' תוצאות</div>' : '';
  html += list.map(c => {
    const [bg, fg] = avatarColor(c.name);
    return '<div class="event-card" onclick="openEventDetail(' + c.id + ')" style="cursor:pointer;">' +
      '<div class="event-card-main">' +
      '<div class="avatar avatar-sm" style="background:' + bg + ';color:' + fg + ';">' + (c.name||'?')[0].toUpperCase() + '</div>' +
      '<div style="flex:1;"><div style="font-weight:600;">' + highlight(c.name||'',q) + '</div>' +
      '<div style="font-size:12px;color:var(--accent);">' + getLabel(c.type, c.customType) + '</div></div>' +
      urgencyBadge(c.daysLeft, c.isOver) +
      '</div></div>';
  }).join('');

  if (q && !list.find(c => (c.name||'').toLowerCase() === q)) {
    html += '<div class="add-suggestion"><div class="add-suggestion-title">לא מצאת את מי שחיפשת?</div>' +
      '<button class="btn-primary" onclick="addFromSearch(\'' + q.replace(/'/g,'\\\'') + '\')">➕ הוסף "' + q + '" כאיש קשר חדש</button></div>';
  }

  cont.innerHTML = html || '<div style="text-align:center;padding:30px;color:var(--muted);">לא נמצאו תוצאות</div>';
}

function highlight(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  return text.slice(0,idx) + '<span style="color:#a5b4fc;font-weight:600;">' + text.slice(idx,idx+q.length) + '</span>' + text.slice(idx+q.length);
}

function addFromSearch(name) {
  document.getElementById('inp-name').value = name;
  document.getElementById('formTitle').textContent = 'אירוע חדש';
  document.getElementById('editingId').value = '';
  document.getElementById('btn-delete-form').style.display = 'none';
  openScreen('screen-add-event');
}

// ========== CONTACTS SCREEN ==========
function renderContactsList() {
  const q = (document.getElementById('contactsSearch').value || '').toLowerCase();
  const cont = document.getElementById('contactsList');

  const groups = ['', ...new Set(contacts.map(c => c.group).filter(Boolean))];
  document.getElementById('contactsFilterRow').innerHTML = groups.map(g =>
    '<div class="chip' + (activeGroupFilter === g ? ' active' : '') + '" onclick="setGroupFilter(\'' + g.replace(/'/g,'\\\'') + '\');renderContactsList();">' + (g||'הכל') + '</div>'
  ).join('');

  let list = contacts.filter(c => !q || (c.name||'').toLowerCase().includes(q));
  if (activeGroupFilter) list = list.filter(c => c.group === activeGroupFilter);

  // group by group
  const byGroup = {};
  list.forEach(c => {
    const g = c.group || 'ללא קבוצה';
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(c);
  });

  let html = '';
  Object.entries(byGroup).forEach(([group, items]) => {
    html += '<div class="section-lbl">' + group + ' — ' + items.length + '</div>';
    html += items.map(c => {
      const calc = calcDays(c.date, getRecurrence(c.type));
      const [bg, fg] = avatarColor(c.name);
      return '<div class="contact-row" onclick="openEventDetail(' + c.id + ')">' +
        '<div class="avatar avatar-sm" style="background:' + bg + ';color:' + fg + ';width:36px;height:36px;font-size:14px;">' + (c.name||'?')[0].toUpperCase() + '</div>' +
        '<div style="flex:1;"><div style="font-size:13px;font-weight:500;">' + (c.name||'') + '</div>' +
        '<div style="font-size:11px;color:var(--muted);">' + getLabel(c.type, c.customType) + (c.date ? ' — ' + c.date : '') + '</div></div>' +
        (calc.daysLeft !== null ? urgencyBadge(calc.daysLeft, calc.isOver) : '') +
        '<span class="contact-row-arrow">›</span></div>';
    }).join('');
  });

  cont.innerHTML = html || '<div style="text-align:center;padding:20px;color:var(--muted);">לא נמצאו אנשי קשר</div>';
}

// ========== GREETINGS ==========
function renderGreetings() {
  const items = [
    { key:'birthday_male', label:'🎉 יום הולדת — זכר' },
    { key:'birthday_female', label:'🎉 יום הולדת — נקבה' },
    { key:'birthday_other', label:'🎉 יום הולדת — כללי' },
    { key:'memorial', label:'🕯️ אזכרה' },
    { key:'anniversary', label:'💍 יום נישואין' },
    { key:'wedding', label:'💒 חתונה' },
  ];
  document.getElementById('greetingsList').innerHTML = items.map(item =>
    '<div class="card" style="margin-bottom:10px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
    '<span style="font-size:13px;font-weight:500;">' + item.label + '</span>' +
    '<button onclick="editGreeting(\'' + item.key + '\')" style="font-size:11px;color:var(--accent);background:transparent;border:none;cursor:pointer;">✏️ ערוך</button>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--muted);line-height:1.6;">' + (greetings[item.key]||'') + '</div>' +
    '</div>'
  ).join('');
}

function editGreeting(key) {
  const current = greetings[key] || '';
  const newVal = prompt('ערוך ברכה:', current);
  if (newVal !== null) {
    greetings[key] = newVal;
    localStorage.setItem('ls_v1_greetings', JSON.stringify(greetings));
    renderGreetings();
  }
}

// ========== STORES ==========
const ALL_STORES = ['Amazon','KSP','זאפ','IVORY','BUG','Etsy','ASOS','iDigital','Walmart'];

function renderStores() {
  document.getElementById('storeTagsContainer').innerHTML = ALL_STORES.map(s =>
    '<div class="gift-tag' + (activeStores.includes(s) ? ' selected' : '') + '" onclick="toggleStore(this,\'' + s + '\')">' + s + '</div>'
  ).join('');
}

function toggleStore(el, name) {
  const idx = activeStores.indexOf(name);
  if (idx === -1) { activeStores.push(name); el.classList.add('selected'); }
  else { activeStores.splice(idx,1); el.classList.remove('selected'); }
}

function addCustomStore() {
  const name = document.getElementById('inp-custom-store').value.trim();
  if (!name) return;
  if (!activeStores.includes(name)) activeStores.push(name);
  document.getElementById('inp-custom-store').value = '';
  renderStores();
}

function saveStores() {
  localStorage.setItem('ls_v1_stores', JSON.stringify(activeStores));
  alert('החנויות נשמרו ✅');
}

// ========== SETTINGS ==========
function toggleSetting(key, el) {
  settings[key] = !settings[key];
  if (settings[key]) el.classList.add('on'); else el.classList.remove('on');
  saveAllSettings();
  renderMain();
}

function saveUserSettings() {
  settings.defaultFilter = document.getElementById('defaultFilter').value;
  settings.defaultSort = document.getElementById('defaultSort').value;
  saveAllSettings(); renderMain();
  alert('הגדרות נשמרו ✅');
  openScreen('screen-main');
}

function toggleCustomNotif(el) {
  el.classList.toggle('on');
  const show = el.classList.contains('on');
  document.getElementById('customNotifTags').style.display = show ? 'block' : 'none';
}

// ========== APPEARANCE ==========
const THEMES = [
  { name:'סגול', key:'purple', from:'#6366f1', to:'#8b5cf6' },
  { name:'כחול', key:'blue', from:'#3b82f6', to:'#06b6d4' },
  { name:'ירוק', key:'green', from:'#10b981', to:'#34d399' },
  { name:'כתום', key:'amber', from:'#f59e0b', to:'#fbbf24' },
  { name:'אדום', key:'red', from:'#ef4444', to:'#f97316' },
  { name:'ורוד', key:'pink', from:'#ec4899', to:'#a855f7' },
];

function initAppearanceScreen() {
  const grid = document.getElementById('themeGrid');
  if (!grid) return;
  grid.innerHTML = THEMES.map(t =>
    '<div onclick="selectTheme(\'' + t.key + '\')" style="border:' + (settings.theme===t.key?'2px solid var(--accent)':'1px solid var(--border)') + ';border-radius:var(--radius-sm);padding:10px 6px;text-align:center;cursor:pointer;">' +
    '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,' + t.from + ',' + t.to + ');margin:0 auto 5px;"></div>' +
    '<div style="font-size:10px;color:' + (settings.theme===t.key?'#a5b4fc':'var(--muted)') + ';">' + t.name + (settings.theme===t.key?' ✓':'') + '</div>' +
    '</div>'
  ).join('');
}

function selectTheme(key) {
  settings.theme = key; initAppearanceScreen();
  const t = THEMES.find(x => x.key === key);
  if (t) document.documentElement.style.setProperty('--accent', t.from);
}

function setMode(mode) {
  settings.mode = mode;
  ['dark','light','auto'].forEach(m => {
    const el = document.getElementById('mode-' + m);
    if (el) el.style.border = m === mode ? '2px solid var(--accent)' : '1px solid var(--border)';
  });
}

function saveAppearance() {
  saveAllSettings();
  alert('המראה נשמר ✅');
  openScreen('screen-settings');
}

// ========== IMPORT ==========
function importFromPhone() {
  alert('פתח את אנשי הקשר בטלפון ← שתף ← בחר "לא שכחתי"');
}

function importICS(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const events = parseICS(text);
    let added = 0, skipped = 0;
    events.forEach(ev => {
      const exists = contacts.find(c => c.name === ev.name && c.date === ev.date);
      if (exists) { skipped++; return; }
      contacts.push({ id: Date.now() + added, ...ev, notifications: [] });
      added++;
    });
    save(); renderMain();
    alert('יובאו ' + added + ' אירועים! (' + skipped + ' דולגו)');
    openScreen('screen-main');
  };
  reader.readAsText(file);
}

function parseICS(text) {
  const events = [];
  const blocks = text.split('BEGIN:VEVENT');
  blocks.slice(1).forEach(block => {
    const getSafe = key => { const m = block.match(new RegExp(key + '[^:]*:([^\r\n]+)')); return m ? m[1].trim() : ''; };
    let summary = getSafe('SUMMARY');
    let dtstart = getSafe('DTSTART');
    if (!summary || !dtstart) return;
    // clean date
    dtstart = dtstart.replace(/T.*/, '');
    if (dtstart.length === 8) dtstart = dtstart.slice(0,4)+'-'+dtstart.slice(4,6)+'-'+dtstart.slice(6,8);
    // detect type
    let type = 'birthday';
    if (/אזכרה|יאר/.test(summary)) type = 'memorial';
    else if (/נישואין|חתונה/.test(summary)) type = 'anniversary';
    // clean name
    summary = summary.replace(/יום הולדת של?|'s birthday/gi,'').replace(/Birthday/gi,'').trim();
    events.push({ name: summary, date: dtstart, type, group: '', notes: '' });
  });
  return events;
}

function importFacebook(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      let added = 0;
      // try various facebook export formats
      const birthdays = data.birthday_posts || data.friends || [];
      birthdays.forEach(item => {
        const name = item.name || item.title || '';
        const bday = item.birthday || item.date || '';
        if (!name || !bday) return;
        const exists = contacts.find(c => c.name === name);
        if (exists) return;
        contacts.push({ id: Date.now() + added, name, date: bday, type: 'birthday', group: 'חברים', notes: '', notifications: [] });
        added++;
      });
      save(); renderMain();
      alert('יובאו ' + added + ' חברים מפייסבוק!');
      openScreen('screen-main');
    } catch (err) {
      alert('שגיאה בקריאת הקובץ. וודא שזה קובץ JSON תקין מפייסבוק');
    }
  };
  reader.readAsText(file);
}

function connectGoogleCalendar() {
  alert('חיבור לגוגל קלנדר ידרוש שרת backend. בגרסה הנוכחית — השתמש בייבוא ICS מגוגל.');
}

// ========== EXPORT / BACKUP ==========
function exportJSON() {
  const data = { version: 1, contacts, settings, greetings, exported: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'lo-shachachti-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}

function restoreBackup(input) {
  const file = input.files[0]; if (!file) return;
  if (!confirm('שחזור יחליף את כל הנתונים הנוכחיים. להמשיך?')) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      contacts = data.contacts || [];
      if (data.settings) { settings = Object.assign({}, defaultSettings, data.settings); saveAllSettings(); }
      if (data.greetings) { greetings = data.greetings; localStorage.setItem('ls_v1_greetings', JSON.stringify(greetings)); }
      save(); renderMain();
      alert('שוחזר בהצלחה ✅');
      openScreen('screen-main');
    } catch (err) { alert('שגיאה בקריאת קובץ הגיבוי'); }
  };
  reader.readAsText(file);
}

function exportCSV() {
  const rows = [['שם','תאריך','סוג','קבוצה','טלפון','תקציב','סטטוס מתנה','הערות']];
  contacts.forEach(c => rows.push([c.name||'',c.date||'',getLabel(c.type,c.customType),c.group||'',c.phone||'',c.budget||'',c.giftStatus||'',c.notes||'']));
  const csv = rows.map(r => r.map(f => '"' + String(f).replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'lo-shachachti-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

function confirmDeleteAll() {
  if (!confirm('מחיקת כל הנתונים לצמיתות?!\nלא ניתן לשחזר ללא גיבוי.')) return;
  contacts = []; save(); renderMain(); openScreen('screen-main');
  alert('כל הנתונים נמחקו');
}

// ========== BUDGET SUMMARY ==========
function renderBudgetSummary() {
  const el = document.getElementById('screen-budget-summary');
  if (!el) return;
  const paid = contacts.filter(c => c.giftStatus === 'paid');
  const pending = contacts.filter(c => c.giftStatus !== 'paid' && c.budget);
  const paidTotal = paid.reduce((s,c) => s + (parseInt(c.budget)||0), 0);
  const pendingTotal = pending.reduce((s,c) => s + (parseInt(c.budget)||0), 0);
  const existing = document.getElementById('budgetSummaryContent');
  if (!existing) return;
  existing.innerHTML =
    '<div class="stat-grid"><div class="stat-card"><div class="stat-num green">' + paidTotal + '₪</div><div class="stat-label">✅ שולם (' + paid.length + ')</div></div>' +
    '<div class="stat-card"><div class="stat-num" style="color:var(--amber);">' + pendingTotal + '₪</div><div class="stat-label">⏳ פתוח (' + pending.length + ')</div></div></div>' +
    paid.map(c => '<div class="detail-row"><span>' + (c.name||'') + '</span><span style="color:var(--green);">' + (parseInt(c.budget)||0) + '₪</span></div>').join('') +
    pending.map(c => '<div class="detail-row"><span>' + (c.name||'') + '</span><span style="color:var(--amber);">' + (parseInt(c.budget)||0) + '₪</span></div>').join('');
}

// ========== NOTIFICATIONS ==========
function scheduleNotifs(c) {
  if (!settings.notifEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(reg => {
    const today = new Date(); today.setHours(0,0,0,0);
    const ev = new Date(c.date);
    const notifs = [];
    if (settings.defaultDayBefore) notifs.push({ days: 1, time: '09:00', label: 'מחר — ' + (c.name||'') });
    if (settings.defaultWeekBefore) notifs.push({ days: 7, time: '09:00', label: 'בעוד שבוע — ' + (c.name||'') });
    notifs.forEach(n => {
      let eventDate = new Date(today.getFullYear(), ev.getMonth(), ev.getDate());
      if (eventDate < today) eventDate.setFullYear(today.getFullYear() + 1);
      const notifDate = new Date(eventDate);
      notifDate.setDate(notifDate.getDate() - n.days);
      const [h, m] = (n.time||'09:00').split(':').map(Number);
      notifDate.setHours(h, m, 0, 0);
      const ms = notifDate - new Date();
      if (ms < 0) return;
      setTimeout(() => {
        reg.showNotification('לא שכחתי 🔔', {
          body: n.label + ' — ' + getLabel(c.type, c.customType),
          icon: 'icon-192.png', tag: 'notif-' + c.id, dir: 'rtl',
        });
      }, ms);
    });
  });
}

function requestNotifPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') contacts.forEach(c => scheduleNotifs(c));
    });
  }
}

// ========== MODAL ==========
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ========== SCROLL TO TOP ==========
window.addEventListener('scroll', () => {
  const btn = document.getElementById('scrollTopBtn');
  if (btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

// ========== INIT ==========
window.addEventListener('DOMContentLoaded', () => {
  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => requestNotifPermission()).catch(() => {});
  }

  // Init form
  initGiftTags();
  document.getElementById('inp-gift-idea').addEventListener('input', updateGiftDisplay);

  // Init appearance
  initAppearanceScreen();
  const t = THEMES.find(x => x.key === settings.theme);
  if (t) document.documentElement.style.setProperty('--accent', t.from);

  // Appearance mode cards style
  ['dark','light','auto'].forEach(m => {
    const el = document.getElementById('mode-' + m);
    if (el) el.style.cssText += ';flex:1;border:' + (settings.mode===m?'2px solid var(--accent)':'1px solid var(--border)') + ';border-radius:var(--radius-sm);padding:8px 5px;cursor:pointer;';
  });

  // Budget summary screen placeholder
  const backupScreen = document.getElementById('screen-backup');
  if (backupScreen && !document.getElementById('screen-budget-summary')) {
    const budgetScreen = document.createElement('div');
    budgetScreen.className = 'screen';
    budgetScreen.id = 'screen-budget-summary';
    budgetScreen.innerHTML =
      '<div class="topbar"><button class="back-btn" onclick="openScreen(\'screen-backup\')">← חזרה</button><span style="font-size:15px;font-weight:600;">💰 סיכום תקציב</span></div>' +
      '<div style="padding:12px 0;" id="budgetSummaryContent"></div>';
    document.body.insertBefore(budgetScreen, document.getElementById('scrollTopBtn'));
  }

  // Print report screen
  if (!document.getElementById('screen-print-report')) {
    const printScreen = document.createElement('div');
    printScreen.className = 'screen';
    printScreen.id = 'screen-print-report';
    printScreen.innerHTML =
      '<div class="topbar"><button class="back-btn" onclick="openScreen(\'screen-backup\')">← חזרה</button><span style="font-size:15px;font-weight:600;">🖨️ הדפס דוח</span></div>' +
      '<div style="padding:12px 0;">' +
      '<div class="section-lbl">טווח תאריכים</div>' +
      '<div class="form-grid-2">' +
      '<div><label class="form-label">מתאריך</label><input type="date" class="form-input" id="printFrom"></div>' +
      '<div><label class="form-label">עד תאריך</label><input type="date" class="form-input" id="printTo"></div>' +
      '</div>' +
      '<button class="btn-primary" onclick="printReport()">🖨️ הדפס</button>' +
      '</div>';
    document.body.insertBefore(printScreen, document.getElementById('scrollTopBtn'));
  }

  // My greetings screen
  if (!document.getElementById('screen-my-greetings')) {
    const mgScreen = document.createElement('div');
    mgScreen.className = 'screen';
    mgScreen.id = 'screen-my-greetings';
    mgScreen.innerHTML =
      '<div class="topbar"><button class="back-btn" onclick="openScreen(\'screen-system-settings\')">← חזרה</button><span style="font-size:15px;font-weight:600;">📝 ברכות אישיות</span></div>' +
      '<div style="padding:12px 0;">' +
      ['ברכה 1','ברכה 2','ברכה 3','ברכה 4','ברכה 5'].map((label,i) =>
        '<label class="form-label">' + label + '</label>' +
        '<textarea class="form-textarea" id="my-greet-' + i + '" placeholder="כתוב ברכה אישית...">' + (myGreetings[i]||'') + '</textarea>'
      ).join('') +
      '<button class="btn-primary" onclick="saveMyGreetings()">💾 שמור</button>' +
      '</div>';
    document.body.insertBefore(mgScreen, document.getElementById('scrollTopBtn'));
  }

  // Render main
  renderMain();
});

function saveMyGreetings() {
  myGreetings = [0,1,2,3,4].map(i => document.getElementById('my-greet-'+i).value);
  localStorage.setItem('ls_v1_my_greetings', JSON.stringify(myGreetings));
  alert('הברכות האישיות נשמרו ✅');
}

function printReport() {
  const from = document.getElementById('printFrom').value;
  const to = document.getElementById('printTo').value;
  let list = contacts;
  if (from) list = list.filter(c => c.date >= from);
  if (to)   list = list.filter(c => c.date <= to);
  list.sort((a,b) => (a.date||'').localeCompare(b.date||''));
  const win = window.open('');
  win.document.write('<html dir="rtl"><body style="font-family:sans-serif;padding:20px;"><h2>לא שכחתי — דוח</h2>');
  win.document.write('<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;"><tr><th>שם</th><th>תאריך</th><th>סוג</th><th>קבוצה</th><th>תקציב</th></tr>');
  list.forEach(c => win.document.write('<tr><td>' + (c.name||'') + '</td><td>' + (c.date||'') + '</td><td>' + getLabel(c.type,c.customType) + '</td><td>' + (c.group||'') + '</td><td>' + (c.budget||'') + '</td></tr>'));
  win.document.write('</table></body></html>');
  win.print();
}

// ========== APPEARANCE FIX ==========
function setMode(mode) {
  settings.mode = mode;
  document.querySelectorAll('.appearance-mode-card').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('mode-' + mode);
  if (el) el.classList.add('active');
  if (mode === 'light') document.body.classList.add('light-mode');
  else document.body.classList.remove('light-mode');
  saveSetting('mode', mode);
}

function saveAppearance() {
  saveAllSettings();
  if (settings.largeFont) document.body.classList.add('large-font');
  else document.body.classList.remove('large-font');
  if (settings.mode === 'light') document.body.classList.add('light-mode');
  else document.body.classList.remove('light-mode');
  alert('המראה נשמר ✅');
  openScreen('screen-settings');
}

// fix toggleSetting for largeFont
const _origToggle = toggleSetting;
// override toggleSetting to handle appearance
function toggleSetting(key, el) {
  settings[key] = !settings[key];
  if (settings[key]) el.classList.add('on'); else el.classList.remove('on');
  saveAllSettings();
  if (key === 'largeFont') {
    if (settings.largeFont) document.body.classList.add('large-font');
    else document.body.classList.remove('large-font');
  }
  if (key !== 'largeFont' && key !== 'animations' && key !== 'sounds' && key !== 'confetti') renderMain();
}

// ========== SEARCH FIX — show all groups + contacts in group ==========
function renderSearchFilters() {
  const allGroups = [...new Set(contacts.map(c => c.group).filter(Boolean))];
  document.getElementById('searchFilterRow').innerHTML =
    ['', ...allGroups].map(g =>
      '<div class="chip' + (searchGroupFilter === g ? ' active' : '') + '" onclick="setSearchGroup(\'' + g.replace(/'/g,"\\'") + '\')">' + (g || 'הכל') + '</div>'
    ).join('');
}

// ========== HERO LABEL FIX ==========
function renderHero(enriched) {
  const upcoming = enriched.filter(c => c.daysLeft !== null).sort((a,b) => a.daysLeft - b.daysLeft);
  if (!upcoming.length) { document.getElementById('heroWidget').innerHTML = ''; return; }
  const c = upcoming[0];
  const [bg, fg] = avatarColor(c.name);
  document.getElementById('heroWidget').innerHTML =
    '<div class="hero-card" onclick="openEventDetail(' + c.id + ')" style="cursor:pointer;">' +
    '<div class="hero-label">האירוע הקרוב</div>' +
    '<div style="display:flex;align-items:center;gap:12px;margin-top:4px;">' +
    '<div class="avatar avatar-sm" style="background:' + bg + ';color:' + fg + ';">' + (c.name||'?')[0].toUpperCase() + '</div>' +
    '<div><div class="hero-name">' + (c.name||'') + '</div>' +
    '<div style="font-size:11px;color:#818cf8;margin-top:2px;">' + getLabel(c.type, c.customType) + '</div></div>' +
    '</div>' +
    '<span class="hero-badge">' + (c.daysLeft === 0 ? '🎉 היום!' : c.daysLeft === 1 ? '🔥 מחר!' : '📅 עוד ' + c.daysLeft + ' ימים') + '</span>' +
    '</div>';
  if (enriched.some(x => x.daysLeft === 0)) setTimeout(triggerConfetti, 500);
}

// ========== GREETINGS — ALL EVENT TYPES + 5 VARIANTS ==========
const GREETING_VARIANTS = {
  birthday: [
    'יום הולדת שמח {name}! שהשנה תביא לך בריאות, אושר והצלחה 🎂',
    'מזל טוב {name}! עוד שנה של הצלחות ושמחות 🎉',
    '{name} היקר/ה, יום הולדת שמח! שכל חלומותיך יתגשמו ✨',
    'שנה שמחה ובריאה {name}! 🥳',
    'יום הולדת שמח! שתחגוג עוד הרבה שנים {name} 🎈',
  ],
  memorial: [
    'חושב עליכם היום ביום האזכרה. מחבק מרחוק 🕯️',
    'זכרו יהיה ברוך לעד 🕯️',
    'זיכרון לברכה. מחשבותינו אתכם 🕯️',
    'בעצב ובכבוד, מציין/ת את יום האזכרה 🕯️',
    'לנצח בלבנו 🕯️',
  ],
  anniversary: [
    'יום נישואין שמח {name}! שתמשיכו לאהוב ולצמוח יחד 💍',
    'מזל טוב על {n} שנות נישואין! 💍',
    'שנה נוספת של אהבה ושמחה {name}! 💑',
    'יום נישואין שמח! שתמשיכו יחד לנצח 💍',
    'ברכות חמות ליום הנישואין! 💞',
  ],
  wedding: [
    'מזל טוב {name}! שתתחילו את דרכם המשותפת באהבה ובאושר 💒',
    'ברכות לחתונה! יום מרגש ומיוחד 💒',
    'מזל טוב לחתן ולכלה! 🥂',
    'שתהיה חתונה שמחה ויפה! 🎊',
    'ברכות מכל הלב ליום המיוחד! 💒',
  ],
  barmitzvah: [
    'מזל טוב על בר/בת המצווה! ✡️',
    'ברכות לאבן הדרך המיוחדת! ✡️',
    'מזל טוב! יום גדול ומשמעותי ✨',
    'ברכות חמות לאירוע המיוחד! ✡️',
    'מזל טוב! שתמשיך בדרך טובה ✡️',
  ],
  friends: [
    'מחכה לפגישה! 😊',
    'יהיה כיף לראות אותך! 🤗',
    'מצפה למפגש! 👋',
    'יאללה נתראה! 😄',
    'מחכה בקוצר רוח! 🎉',
  ],
  trip: [
    'טיסה טובה! ✈️ שתהיה חופשה נהדרת',
    'נסיעה טובה! 🌍 תהנה/י',
    'חופשה מענגת! ✈️',
    'שתחזור/י בריא/ה ושלם/ה! 🧳',
    'טיול נעים! 🏖️',
  ],
  car: [
    'בהצלחה בטסט! 🚗',
    'יעבור חלק! 🔧',
    'בהצלחה! 🚙',
    'הכל יהיה בסדר גמור! 🔑',
    'יצא מהטסט עם פס ירוק! ✅',
  ],
  medical: [
    'בהצלחה בתור! 🏥 הבריאות קודמת',
    'שיהיה בסדר! 💊',
    'בריאות מעל הכל! 🏥',
    'שתרגיש/י טוב! 💙',
    'בהצלחה! שיהיה בשורות טובות 🌿',
  ],
  holiday: [
    'חג שמח! 🎊',
    'מועדים לשמחה! 🕎',
    'חג שמח וכשר! ✨',
    'ברכות לחג! 🎉',
    'שיהיה חג מאושר! 🌟',
  ],
  graduation: [
    'מזל טוב על הסיום! 🎓 עתיד מזהיר לפניך',
    'ברכות על הגמר! 🎓',
    'מזל טוב! כל הכבוד על ההשגה 🎓',
    'ברכות חמות על סיום הלימודים! 📚',
    'מזל טוב! הצלחה בדרך הבאה 🌟',
  ],
  custom: [
    'מזל טוב! 🎉',
    'ברכות! ✨',
    'כל הכבוד! 👏',
    'שיהיה בהצלחה! 🌟',
    'ברכות חמות! 💙',
  ],
};

// track which variant index to use per contact
const greetVariantIndex = {};

function buildGreeting(c) {
  const type = c.type || 'custom';
  const name = c.name || '';
  const variants = GREETING_VARIANTS[type] || GREETING_VARIANTS.custom;
  const idx = greetVariantIndex[c.id] || 0;
  return variants[idx].replace(/{name}/g, name).replace(/{n}/g, '');
}

function nextGreetVariant(id, btnEl) {
  const c = contacts.find(x => x.id === id); if (!c) return;
  const type = c.type || 'custom';
  const variants = GREETING_VARIANTS[type] || GREETING_VARIANTS.custom;
  const cur = greetVariantIndex[id] || 0;
  greetVariantIndex[id] = (cur + 1) % variants.length;
  // update text in DOM
  const textEl = document.getElementById('greet-text-' + id);
  if (textEl) textEl.textContent = buildGreeting(c);
  playSound('greet');
}

// override buildEventCard to use new greeting system with variant button
function buildEventCard(c) {
  const [bg, fg] = avatarColor(c.name);
  const letter = (c.name||'?')[0].toUpperCase();
  const hasGift = c.giftIdea || c.budget;
  const notifCount = (c.notifications || []).length;
  const storeLinksHtml = c.giftIdea ? activeStores.map(s =>
    '<a href="https://www.google.com/search?q=' + encodeURIComponent(c.giftIdea + ' ' + s) + '" target="_blank" class="store-link">🔍 ' + s + '</a>'
  ).join('') : '';
  const giftHtml = hasGift ? (
    '<div class="gift-box">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
    '<span class="gift-title">🎁 ' + (c.giftIdea||'') + (c.budget?' | '+c.budget+' ₪':'') + '</span>' +
    '<button onclick="event.stopPropagation();toggleGiftStatus(' + c.id + ')" style="background:' + (c.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';color:white;border:none;padding:3px 9px;border-radius:var(--radius-full);font-size:11px;cursor:pointer;">' +
    (c.giftStatus==='paid'?'✅ נקנה':'⏳ לביצוע') + '</button>' +
    '</div>' +
    '<div class="store-links">' + storeLinksHtml + '</div>' +
    '</div>'
  ) : '';
  return '<div class="event-card" id="card-' + c.id + '">' +
    '<div class="event-card-main">' +
    '<div class="avatar avatar-sm" style="background:' + bg + ';color:' + fg + ';">' + letter + '</div>' +
    '<div style="flex:1;min-width:0;">' +
    '<div style="font-weight:600;font-size:16px;">' + (c.name||'') + '</div>' +
    '<div style="font-size:12px;color:var(--accent);margin-top:1px;">' + getLabel(c.type, c.customType) + '</div>' +
    '<div style="margin-top:4px;">' + countdownBadge(c.daysLeft, c.isOver) + '</div>' +
    '</div>' +
    urgencyBadge(c.daysLeft, c.isOver) +
    '</div>' +
    '<div class="event-card-actions">' +
    '<button class="card-btn share" onclick="event.stopPropagation();shareEvent(' + c.id + ')">📱 שתף</button>' +
    '<button class="card-btn edit" onclick="event.stopPropagation();editEvent(' + c.id + ')">✏️ ערוך</button>' +
    '<button class="card-btn" onclick="event.stopPropagation();toggleDetails(' + c.id + ',this)">⚙️ עוד ▼</button>' +
    '</div>' +
    '<div class="details-panel" id="details-' + c.id + '">' +
    (c.group ? '<div class="detail-row"><span class="detail-label">🏷️ קבוצה</span><span>' + c.group + '</span></div>' : '') +
    (c.phone ? '<div class="detail-row"><span class="detail-label">📱 טלפון</span><a href="tel:' + c.phone + '" style="color:var(--accent);">' + c.phone + '</a></div>' : '') +
    (c.notes ? '<div style="font-size:12px;font-style:italic;color:var(--muted);padding:6px 0;border-bottom:1px solid var(--border);">💡 ' + c.notes + '</div>' : '') +
    (notifCount ? '<div class="detail-row"><span class="detail-label">🔔 תזכורות</span><span style="color:var(--accent);">' + notifCount + '</span></div>' : '') +
    giftHtml +
    '<div class="greet-box">' +
    '<div class="greet-label" style="display:flex;justify-content:space-between;align-items:center;"><span>💬 ברכה מוכנה</span><button onclick="nextGreetVariant(' + c.id + ',this)" style="font-size:10px;color:#a5b4fc;background:rgba(99,102,241,0.15);border:1px solid var(--accent-border);border-radius:var(--radius-full);padding:2px 9px;cursor:pointer;">הבא ›</button></div>' +
    '<div class="greet-text" id="greet-text-' + c.id + '">' + buildGreeting(c) + '</div>' +
    '<div class="greet-actions">' +
    '<button class="greet-btn" onclick="sendWhatsApp(' + c.id + ')">📱 וואטסאפ</button>' +
    '<button class="greet-btn secondary" onclick="copyGreeting(' + c.id + ')">📋 העתק</button>' +
    '</div></div>' +
    '</div>' +
    '<button class="details-toggle" onclick="toggleDetails(' + c.id + ',this)">▼ פרטים נוספים</button>' +
    '</div>';
}

// override renderGreetings to show all event types
function renderGreetings() {
  const types = [
    {key:'birthday', label:'🎉 יום הולדת'},
    {key:'memorial', label:'🕯️ אזכרה'},
    {key:'anniversary', label:'💍 יום נישואין'},
    {key:'wedding', label:'💒 חתונה'},
    {key:'barmitzvah', label:'✡️ בר/בת מצווה'},
    {key:'friends', label:'👥 מפגש חברים'},
    {key:'trip', label:'✈️ טיול'},
    {key:'car', label:'🚗 טסט לרכב'},
    {key:'medical', label:'🏥 תור רפואי'},
    {key:'holiday', label:'🎊 חג'},
    {key:'graduation', label:'🎓 סיום לימודים'},
    {key:'custom', label:'✨ אחר'},
  ];
  const el = document.getElementById('greetingsList');
  if (!el) return;
  el.innerHTML = types.map(t => {
    const variants = GREETING_VARIANTS[t.key] || [];
    return '<div class="card" style="margin-bottom:10px;">' +
      '<div style="font-size:13px;font-weight:500;margin-bottom:8px;">' + t.label + '</div>' +
      variants.map((v,i) =>
        '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px;padding-bottom:7px;border-bottom:1px solid var(--border);">' +
        '<span style="font-size:10px;color:var(--muted);width:16px;flex-shrink:0;margin-top:3px;">' + (i+1) + '</span>' +
        '<div style="flex:1;font-size:12px;color:var(--muted);line-height:1.6;">' + v + '</div>' +
        '<button onclick="editVariant(\'' + t.key + '\',' + i + ')" style="font-size:10px;color:var(--accent);background:transparent;border:none;cursor:pointer;flex-shrink:0;">✏️</button>' +
        '</div>'
      ).join('') +
      '</div>';
  }).join('');
}

function editVariant(type, idx) {
  const current = GREETING_VARIANTS[type][idx];
  const newVal = prompt('ערוך ברכה ' + (idx+1) + ':', current);
  if (newVal !== null) {
    GREETING_VARIANTS[type][idx] = newVal;
    renderGreetings();
  }
}

// ========== BUDGET SETTINGS ==========
function renderBudgetSettings() {
  const from = (document.getElementById('budgetFrom') || {}).value || '';
  const to = (document.getElementById('budgetTo') || {}).value || '';
  let list = contacts.filter(c => c.budget);
  if (from) list = list.filter(c => (c.date||'') >= from);
  if (to)   list = list.filter(c => (c.date||'') <= to);

  const paid = list.filter(c => c.giftStatus === 'paid');
  const pending = list.filter(c => c.giftStatus !== 'paid');
  const paidTotal = paid.reduce((s,c) => s+(parseInt(c.budget)||0), 0);
  const pendingTotal = pending.reduce((s,c) => s+(parseInt(c.budget)||0), 0);

  const statsEl = document.getElementById('budgetStatsGrid');
  if (statsEl) {
    statsEl.innerHTML =
      '<div class="stat-card"><div class="stat-num green">' + paidTotal + '₪</div><div class="stat-label">✅ שולם (' + paid.length + ')</div></div>' +
      '<div class="stat-card"><div class="stat-num" style="color:var(--amber);">' + pendingTotal + '₪</div><div class="stat-label">⏳ פתוח (' + pending.length + ')</div></div>';
  }

  const listEl = document.getElementById('budgetDetailList');
  if (listEl) {
    listEl.innerHTML = '<div style="font-size:11px;color:var(--muted2);margin-bottom:8px;">סה"כ: ' + (paidTotal+pendingTotal) + '₪</div>' +
      [...paid, ...pending].map(c =>
        '<div class="detail-row"><span>' + (c.name||'') + '</span>' +
        '<span style="display:flex;gap:8px;align-items:center;">' +
        '<span style="color:' + (c.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';">' + (parseInt(c.budget)||0) + '₪</span>' +
        '<button onclick="toggleGiftStatus(' + c.id + ');renderBudgetSettings();" style="font-size:10px;background:' + (c.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';color:white;border:none;padding:2px 8px;border-radius:var(--radius-full);cursor:pointer;">' + (c.giftStatus==='paid'?'✅':'⏳') + '</button>' +
        '</span></div>'
      ).join('');
  }
}

function printBudgetReport() {
  const list = contacts.filter(c => c.budget);
  const paidTotal = list.filter(c=>c.giftStatus==='paid').reduce((s,c)=>s+(parseInt(c.budget)||0),0);
  const total = list.reduce((s,c)=>s+(parseInt(c.budget)||0),0);
  const win = window.open('');
  win.document.write('<html dir="rtl"><body style="font-family:sans-serif;padding:20px;"><h2>לא שכחתי — דוח תקציב</h2>');
  win.document.write('<p>שולם: <b>' + paidTotal + '₪</b> | סה"כ: <b>' + total + '₪</b></p>');
  win.document.write('<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;"><tr><th>שם</th><th>תאריך</th><th>תקציב</th><th>סטטוס</th></tr>');
  list.forEach(c => win.document.write('<tr><td>'+(c.name||'')+'</td><td>'+(c.date||'')+'</td><td>'+(c.budget||'')+'₪</td><td>'+(c.giftStatus==='paid'?'✅ נקנה':'⏳ לביצוע')+'</td></tr>'));
  win.document.write('</table></body></html>'); win.print();
}

function exportBudgetCSV() {
  const list = contacts.filter(c => c.budget);
  const rows = [['שם','תאריך','תקציב','סטטוס']];
  list.forEach(c => rows.push([c.name||'',c.date||'',(c.budget||'')+'₪',c.giftStatus==='paid'?'נקנה':'לביצוע']));
  const csv = rows.map(r => r.map(f => '"'+String(f).replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='budget-'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
}

function recalcBudget() {
  renderBudgetSettings();
  alert('חישוב תקציב עודכן ✅');
}

// ========== INIT OVERRIDES ==========
// Apply saved appearance on load
document.addEventListener('DOMContentLoaded', () => {
  if (settings.mode === 'light') document.body.classList.add('light-mode');
  if (settings.largeFont) document.body.classList.add('large-font');
  // update appearance screen mode cards
  ['dark','light','auto'].forEach(m => {
    const el = document.getElementById('mode-' + m);
    if (el && settings.mode === m) el.classList.add('active');
  });
  // init budget screen
  const budgetScreen = document.getElementById('screen-budget-settings');
  if (budgetScreen) budgetScreen.addEventListener('click', () => {});
});

// override openScreen to init budget settings
const _origOpenScreen = openScreen;
function openScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'screen-main') renderMain();
  if (id === 'screen-contacts') renderContactsList();
  if (id === 'screen-greetings') renderGreetings();
  if (id === 'screen-stores') renderStores();
  if (id === 'screen-budget-settings') setTimeout(renderBudgetSettings, 50);
  if (id === 'screen-search') { setTimeout(() => document.getElementById('searchInput').focus(), 100); renderSearchFilters(); }
  if (id === 'screen-appearance') initAppearanceScreen();
}
