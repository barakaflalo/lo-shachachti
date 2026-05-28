// ===== לא שכחתי v2 — app.js =====

// ========== STORAGE ==========
let events = JSON.parse(localStorage.getItem('ls2_events') || '[]');
let settings = Object.assign({
  showStats:true, showHero:true, showBudget:false, showCalendar:true,
  sounds:true, confetti:true, largeFont:false, animations:true,
  notifEnabled:true, notifSound:true, notifVibrate:false,
  notifDayBefore:true, notifWeekBefore:false, giftReminder:true, giftReminderDays:14,
  defaultFilter:'30', defaultSort:'date',
  theme:'purple', mode:'dark',
  customColor:null, isFirstTime:true,
  activeStores:['Amazon','KSP','זאפ'],
  quietStart:'23:00', quietEnd:'08:00',
}, JSON.parse(localStorage.getItem('ls2_settings') || '{}'));

let greetings = Object.assign({
  birthday:['יום הולדת שמח {name}! שהשנה תביא לך בריאות, אושר והצלחה 🎂','מזל טוב {name}! עוד שנה של הצלחות ושמחות 🎉','{name} היקר/ה, יום הולדת שמח! שכל חלומותיך יתגשמו ✨','שנה שמחה ובריאה {name}! 🥳','יום הולדת שמח! שתחגוג עוד הרבה שנים {name} 🎈'],
  memorial:['חושב עליכם היום ביום האזכרה. מחבק מרחוק 🕯️','זכרו יהיה ברוך לעד 🕯️','זיכרון לברכה. מחשבותינו אתכם 🕯️','בעצב ובכבוד, מציין/ת את יום האזכרה 🕯️','לנצח בלבנו 🕯️'],
  anniversary:['יום נישואין שמח {name}! שתמשיכו לאהוב ולצמוח יחד 💍','מזל טוב! עוד שנה של אהבה 💍','שנה נוספת של אהבה ושמחה {name}! 💑','יום נישואין שמח! שתמשיכו יחד לנצח 💍','ברכות חמות ליום הנישואין! 💞'],
  wedding:['מזל טוב {name}! שתתחילו את דרכם המשותפת באהבה ובאושר 💒','ברכות לחתונה! יום מרגש ומיוחד 💒','מזל טוב לחתן ולכלה! 🥂','שתהיה חתונה שמחה ויפה! 🎊','ברכות מכל הלב ליום המיוחד! 💒'],
  barmitzvah:['מזל טוב על בר/בת המצווה! ✡️','ברכות לאבן הדרך המיוחדת! ✡️','מזל טוב! יום גדול ומשמעותי ✨','ברכות חמות לאירוע המיוחד! ✡️','מזל טוב! שתמשיך בדרך טובה ✡️'],
  friends:['מחכה לפגישה! 😊','יהיה כיף לראות אותך! 🤗','מצפה למפגש! 👋','יאללה נתראה! 😄','מחכה בקוצר רוח! 🎉'],
  trip:['טיסה טובה {name}! ✈️ שתהיה חופשה נהדרת','נסיעה טובה! 🌍 תהנה/י','חופשה מענגת! ✈️','שתחזור/י בריא/ה ושלם/ה! 🧳','טיול נעים {name}! 🏖️'],
  car:['בהצלחה בטסט! 🚗','יעבור חלק! 🔧','בהצלחה! 🚙','הכל יהיה בסדר גמור! 🔑','יצא מהטסט עם פס ירוק! ✅'],
  medical:['בהצלחה בתור! 🏥 הבריאות קודמת','שיהיה בסדר! 💊','בריאות מעל הכל! 🏥','שתרגיש/י טוב! 💙','בהצלחה! שיהיה בשורות טובות 🌿'],
  holiday:['חג שמח! 🎊','מועדים לשמחה! 🕎','חג שמח וכשר! ✨','ברכות לחג! 🎉','שיהיה חג מאושר {name}! 🌟'],
  graduation:['מזל טוב על הסיום {name}! 🎓 עתיד מזהיר לפניך','ברכות על הגמר! 🎓','מזל טוב! כל הכבוד על ההשגה 🎓','ברכות חמות על סיום הלימודים! 📚','מזל טוב! הצלחה בדרך הבאה 🌟'],
  custom:['מזל טוב! 🎉','ברכות! ✨','כל הכבוד! 👏','שיהיה בהצלחה! 🌟','ברכות חמות! 💙'],
}, JSON.parse(localStorage.getItem('ls2_greetings') || '{}'));

let myGreetings = JSON.parse(localStorage.getItem('ls2_my_greetings') || '["","","","",""]');
const greetVariants = {};

function saveEvents() { localStorage.setItem('ls2_events', JSON.stringify(events)); }
function saveSettings() { localStorage.setItem('ls2_settings', JSON.stringify(settings)); }
function saveGreetings() { localStorage.setItem('ls2_greetings', JSON.stringify(greetings)); }

// ========== CONSTANTS ==========
const EVENT_LABELS = {
  birthday:'🎉 יום הולדת', wedding:'💒 חתונה', anniversary:'💍 יום נישואין',
  memorial:'🕯️ אזכרה', barmitzvah:'✡️ בר/בת מצווה', friends:'👥 מפגש',
  trip:'✈️ טיול', car:'🚗 טסט רכב', medical:'🏥 תור רפואי',
  holiday:'🎊 חג', graduation:'🎓 סיום לימודים', custom:'✨ אירוע'
};
const FIXED_GROUPS = ['משפחה','חברים','עבודה','צבא','טיול','לימודים','שכנים'];
const YEARLY = ['birthday','anniversary','memorial','holiday','barmitzvah','graduation'];
const ALL_STORES = ['Amazon','KSP','זאפ','IVORY','BUG','Etsy','ASOS','iDigital','Walmart','eBay','AliExpress'];
const GIFT_OPTIONS = [
  {e:'⌚',l:'שעון'},{e:'👕',l:'בגדים'},{e:'👟',l:'נעליים'},{e:'🖼️',l:'תמונה'},
  {e:'📱',l:'סלולר'},{e:'🎮',l:'גיימינג'},{e:'📚',l:'ספרים'},{e:'💄',l:'קוסמטיקה'},
  {e:'🌸',l:'פרחים'},{e:'🍫',l:'שוקולד'},{e:'🍷',l:'יין'},{e:'☕',l:'קפה'},
  {e:'🎒',l:'תיק'},{e:'💍',l:'תכשיטים'},{e:'🏠',l:'לבית'},{e:'🎵',l:'אוזניות'},
  {e:'📺',l:'טלוויזיה'},{e:'✈️',l:'חוויה'},{e:'💆',l:'ספא'},{e:'🎟️',l:'כרטיסים'},
  {e:'💰',l:'גיפט קארד'},{e:'🧴',l:'טיפוח'}
];
const AVATAR_COLORS = [
  ['#1e1b4b','#a5b4fc'],['#042c53','#93c5fd'],['#052e16','#86efac'],
  ['#451a03','#fed7aa'],['#2e1065','#c4b5fd'],['#0c1e3c','#93c5fd'],
  ['#1a0a2e','#c084fc'],['#0c2615','#4ade80'],
];
const THEMES = [
  {name:'סגול', key:'purple', from:'#6366f1', to:'#8b5cf6', rgb:'99,102,241', light:'#a5b4fc'},
  {name:'כחול', key:'blue', from:'#3b82f6', to:'#06b6d4', rgb:'59,130,246', light:'#93c5fd'},
  {name:'ירוק', key:'green', from:'#10b981', to:'#34d399', rgb:'16,185,129', light:'#6ee7b7'},
  {name:'כתום', key:'amber', from:'#f59e0b', to:'#fbbf24', rgb:'245,158,11', light:'#fcd34d'},
  {name:'אדום', key:'red', from:'#ef4444', to:'#f97316', rgb:'239,68,68', light:'#fca5a5'},
  {name:'ורוד', key:'pink', from:'#ec4899', to:'#a855f7', rgb:'236,72,153', light:'#f9a8d4'},
  {name:'טורקיז', key:'teal', from:'#14b8a6', to:'#06b6d4', rgb:'20,184,166', light:'#5eead4'},
  {name:'זהב', key:'gold', from:'#d97706', to:'#f59e0b', rgb:'217,119,6', light:'#fbbf24'},
  {name:'לילך', key:'violet', from:'#7c3aed', to:'#9333ea', rgb:'124,58,237', light:'#c4b5fd'},
  {name:'כחול כהה', key:'navy', from:'#1d4ed8', to:'#2563eb', rgb:'29,78,216', light:'#93c5fd'},
  {name:'ניאון', key:'lime', from:'#65a30d', to:'#84cc16', rgb:'101,163,13', light:'#bef264'},
  {name:'מותאם', key:'custom', from:'#6366f1', to:'#8b5cf6', rgb:'99,102,241', light:'#a5b4fc', custom:true},
];

// ========== UTILS ==========
function getLabel(type, custom) { return EVENT_LABELS[type] || custom || '✨ אירוע'; }
function avatarColor(name) {
  const i = ((name || 'A').charCodeAt(0) - 65) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.max(0, i)];
}
function avatarHTML(ev, size) {
  const cls = 'avatar ' + (size || 'av-sm');
  if (ev.photo && ev.photo.startsWith('data:')) {
    return '<div class="' + cls + '"><img src="' + ev.photo + '"></div>';
  }
  if (ev.emoji) {
    const [bg] = avatarColor(ev.name);
    return '<div class="' + cls + '" style="background:' + bg + ';font-size:' + (size === 'av-lg' ? '24px' : size === 'av-md' ? '20px' : '16px') + ';">' + ev.emoji + '</div>';
  }
  const [bg, fg] = avatarColor(ev.name);
  return '<div class="' + cls + '" style="background:' + bg + ';color:' + fg + ';">' + (ev.name || '?')[0].toUpperCase() + '</div>';
}

function getRecurrence(type) { return YEARLY.includes(type) ? 'yearly' : 'once'; }
function calcDays(ev) {
  if (!ev.date) return { daysLeft: null, isOver: false };
  const today = new Date(); today.setHours(0,0,0,0);
  // פרסור ידני כדי למנוע בעיות טיימזון
  const parts = ev.date.split('-');
  const evYear = parseInt(parts[0]), evMonth = parseInt(parts[1])-1, evDay = parseInt(parts[2]);
  if (getRecurrence(ev.type) === 'yearly') {
    let next = new Date(today.getFullYear(), evMonth, evDay);
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    return { daysLeft: Math.round((next - today) / 86400000), isOver: false, nextDate: next };
  }
  const d = new Date(evYear, evMonth, evDay);
  const diff = Math.round((d - today) / 86400000);
  return { daysLeft: diff >= 0 ? diff : null, isOver: diff < 0 };
}

function countdownHTML(daysLeft, isOver) {
  if (isOver || daysLeft === null) return '<span class="cd-far">עבר</span>';
  if (daysLeft === 0) return '<span class="cd-today">🎉 היום!</span>';
  if (daysLeft === 1) return '<span class="cd-today">🔥 מחר!</span>';
  if (daysLeft <= 7) return '<span class="cd-soon">⚡ עוד ' + daysLeft + ' ימים</span>';
  if (daysLeft <= 30) return '<span class="cd-normal">📅 עוד ' + daysLeft + ' ימים</span>';
  return '<span class="cd-far">📅 עוד ' + daysLeft + ' ימים</span>';
}

function urgencyBadge(daysLeft, isOver) {
  if (isOver || daysLeft === null) return '<span class="badge badge-gray">עבר</span>';
  if (daysLeft === 0) return '<span class="badge badge-red">היום!</span>';
  if (daysLeft === 1) return '<span class="badge badge-red">מחר</span>';
  if (daysLeft <= 7) return '<span class="badge badge-amber">' + daysLeft + ' ימים</span>';
  if (daysLeft <= 30) return '<span class="badge badge-purple">' + daysLeft + ' ימים</span>';
  return '<span class="badge badge-gray">' + daysLeft + ' ימים</span>';
}

function buildGreeting(ev) {
  const type = ev.type || 'custom';
  const variants = greetings[type] || greetings.custom;
  const idx = greetVariants[ev.id] || 0;
  let text = variants[idx] || variants[0];
  return text.replace(/{name}/g, ev.name || '');
}

function nextVariant(id) {
  const ev = events.find(e => e.id === id); if (!ev) return;
  const variants = greetings[ev.type] || greetings.custom;
  greetVariants[id] = ((greetVariants[id] || 0) + 1) % variants.length;
  const el = document.getElementById('greet-text-' + id);
  if (el) el.textContent = buildGreeting(ev);
  playSound('greet');
}

// ========== SCREEN NAV ==========
function openScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
  const map = {
    'screen-main': renderMain,
    'screen-contacts': renderContacts,
    'screen-search': initSearch,
    'screen-greetings': renderGreetings,
    'screen-my-greetings': renderMyGreetings,
    'screen-stores': renderStores,
    'screen-budget-settings': renderBudgetSettings,
    'screen-print': initPrint,
    'screen-guide': renderGuide,
    'screen-appearance': renderAppearance,
  };
  if (map[id]) map[id]();
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ========== SOUNDS ==========
let _actx = null;
function getACtx() { if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)(); return _actx; }
function playSound(type) {
  if (!settings.sounds) return;
  try {
    const ctx = getACtx();
    const g = ctx.createGain(); g.gain.value = 0.15; g.connect(ctx.destination);
    const play = (freq, start, dur) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.frequency.value = freq;
      og.gain.setValueAtTime(0.3, ctx.currentTime + start);
      og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      o.connect(og); og.connect(g);
      o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.05);
    };
    if (type === 'save') { play(520, 0, 0.12); play(660, 0.14, 0.18); }
    if (type === 'delete') { play(380, 0, 0.1); play(220, 0.12, 0.18); }
    if (type === 'greet') { play(880, 0, 0.1); play(1100, 0.12, 0.15); }
  } catch(e) {}
}

// ========== CONFETTI ==========
function triggerConfetti() {
  if (!settings.confetti) return;
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const pieces = Array.from({length:80}, () => ({
    x: Math.random()*canvas.width, y: -10,
    w: 7+Math.random()*7, h: 7+Math.random()*7,
    color: 'hsl('+Math.floor(Math.random()*360)+',90%,60%)',
    vx: (Math.random()-0.5)*4, vy: 2+Math.random()*3,
    rot: Math.random()*360, rotV: (Math.random()-0.5)*8,
  }));
  let frame = 0;
  const draw = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.rot+=p.rotV;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    if (++frame < 120) requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  };
  draw();
}

// ========== MAIN RENDER ==========
let calYear, calMonth, activeGroupFilter = '';

function renderMain() {
  const today = new Date();
  if (calYear === undefined) { calYear = today.getFullYear(); calMonth = today.getMonth(); }
  const enriched = events.map(ev => ({ ...ev, ...calcDays(ev) }));

  // stats
  const statsEl = document.getElementById('main-stats');
  if (settings.showStats) {
    const u30 = enriched.filter(e => e.daysLeft !== null && e.daysLeft <= 30).length;
    const budgetTotal = events.reduce((s,e) => s+(parseInt(e.budget)||0), 0);
    statsEl.style.display = '';
    statsEl.innerHTML =
      '<div class="stat-card"><div class="stat-num">' + u30 + '</div><div class="stat-label">אירועים ב-30 יום</div></div>' +
      (settings.showBudget ? '<div class="stat-card"><div class="stat-num green">' + budgetTotal + '₪</div><div class="stat-label">תקציב מתנות</div></div>' :
       '<div class="stat-card"><div class="stat-num">' + events.length + '</div><div class="stat-label">סה"כ אירועים</div></div>');
  } else { statsEl.style.display = 'none'; }

  // calendar
  const calEl = document.getElementById('main-calendar');
  if (settings.showCalendar) { calEl.style.display = ''; renderCalendar(enriched); }
  else calEl.style.display = 'none';

  // hero
  const heroEl = document.getElementById('main-hero');
  if (settings.showHero) { heroEl.style.display = ''; renderHero(enriched); }
  else heroEl.style.display = 'none';

  // filter/sort bar
  renderFilterBar();

  // group filters
  renderGroupFilters(enriched);

  // events list
  renderEventsList(enriched);

  // today events popup
  const todayEvents = enriched.filter(e => e.daysLeft === 0);
  if (todayEvents.length) {
    setTimeout(() => {
      triggerConfetti();
      showTodayModal(todayEvents);
    }, 1000);
  }
}

function renderCalendar(enriched) {
  const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  const today = new Date();
  const first = new Date(calYear, calMonth, 1).getDay();
  const days = new Date(calYear, calMonth+1, 0).getDate();

  // build event days map
  const evDays = {};
  enriched.forEach(ev => {
    if (!ev.date) return;
    const d = new Date(ev.date);
    let y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    if (getRecurrence(ev.type) === 'yearly') y = calYear;
    if (y === calYear && m === calMonth) {
      if (!evDays[day]) evDays[day] = [];
      evDays[day].push(ev);
    }
  });
  // welcome day
  const isWelcome = settings.isFirstTime && events.length === 0;
  const todayDay = today.getFullYear() === calYear && today.getMonth() === calMonth ? today.getDate() : -1;

  let grid = '';
  for (let i = 0; i < first; i++) grid += '<div class="cal-day"></div>';
  for (let d = 1; d <= days; d++) {
    const isToday = d === todayDay;
    const hasEv = evDays[d];
    const isUrgent = hasEv && hasEv.some(e => e.daysLeft !== null && e.daysLeft <= 7);
    let cls = 'cal-day';
    if (isToday && isWelcome) cls += ' welcome-day';
    else if (isToday) cls += ' today';
    if (hasEv) cls += ' has-event';
    if (isUrgent) cls += ' urgent';
    grid += '<div class="' + cls + '" onclick="onCalDay(' + d + ',' + calMonth + ',' + calYear + ')">' + d + '</div>';
  }

  document.getElementById('main-calendar').innerHTML =
    '<div class="cal-wrap">' +
    '<div class="cal-header">' +
    '<span class="cal-nav" onclick="changeMonth(-1)">›</span>' +
    '<span>' + months[calMonth] + ' ' + calYear + '</span>' +
    '<span class="cal-nav" onclick="changeMonth(1)">‹</span>' +
    '</div>' +
    '<div class="cal-days-header"><div class="cal-day-name">א</div><div class="cal-day-name">ב</div><div class="cal-day-name">ג</div><div class="cal-day-name">ד</div><div class="cal-day-name">ה</div><div class="cal-day-name">ו</div><div class="cal-day-name">ש</div></div>' +
    '<div class="cal-grid">' + grid + '</div>' +
    '</div>';
}

function changeMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar(events.map(ev => ({ ...ev, ...calcDays(ev) })));
}

function onCalDay(d, m, y) {
  const today = new Date();
  const isWelcome = settings.isFirstTime && events.length === 0;
  if (isWelcome && d === today.getDate() && m === today.getMonth() && y === today.getFullYear()) {
    openModal('modal-welcome-guide'); return;
  }
  const dayEvents = events.filter(ev => {
    if (!ev.date) return false;
    const ed = new Date(ev.date);
    const ey = getRecurrence(ev.type) === 'yearly' ? y : ed.getFullYear();
    return ey === y && ed.getMonth() === m && ed.getDate() === d;
  });
  if (!dayEvents.length) return;
  const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  document.getElementById('cal-popup-title').textContent = '📅 ' + d + ' ' + months[m];
  document.getElementById('cal-popup-list').innerHTML = dayEvents.map(ev => {
    const calc = calcDays(ev);
    return '<div class="cal-popup-header" style="margin-bottom:8px;">' +
      '<div style="display:flex;align-items:center;gap:8px;">' + avatarHTML(ev, 'av-sm') +
      '<div><div style="font-size:13px;font-weight:500;">' + ev.name + '</div>' +
      '<div style="font-size:11px;color:var(--acc-light);">' + getLabel(ev.type, ev.customType) + '</div></div></div>' +
      countdownHTML(calc.daysLeft, calc.isOver) + '</div>';
  }).join('');
  document.getElementById('cal-popup').classList.add('open');
}

function closeCalPopup() { document.getElementById('cal-popup').classList.remove('open'); }

function showTodayModal(todayEvents) {
  document.getElementById('today-modal-title').textContent = todayEvents.length === 1 ? '🎉 היום יש אירוע!' : '🎉 היום יש ' + todayEvents.length + ' אירועים!';
  document.getElementById('today-modal-events').innerHTML = todayEvents.map(ev =>
    '<div class="card" style="margin-bottom:8px;display:flex;align-items:center;gap:10px;">' +
    avatarHTML(ev, 'av-sm') +
    '<div><div style="font-size:14px;font-weight:600;">' + ev.name + '</div>' +
    '<div style="font-size:12px;color:var(--acc-light);">' + getLabel(ev.type, ev.customType) + '</div></div>' +
    '</div>'
  ).join('');
  openModal('modal-today');
}

function renderHero(enriched) {
  const upcoming = enriched.filter(e => e.daysLeft !== null).sort((a,b) => a.daysLeft - b.daysLeft);
  const heroEl = document.getElementById('main-hero');
  if (!upcoming.length && events.length === 0 && settings.isFirstTime) {
    heroEl.innerHTML = '<div class="hero-welcome" onclick="openModal(\'modal-welcome-guide\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
      '<div style="font-size:28px;">🎉</div>' +
      '<div><div style="font-size:14px;font-weight:600;">ברוך הבא ל"לא שכחתי"!</div>' +
      '<div style="font-size:11px;color:var(--acc-light);">לחץ לקבלת מדריך קצר</div></div>' +
      '</div>' +
      '<span style="background:rgba(var(--acc-rgb),0.3);color:var(--acc-light);font-size:10px;padding:3px 10px;border-radius:var(--rf);display:inline-block;">📖 איך מתחילים?</span>' +
      '</div>';
    return;
  }
  if (!upcoming.length) { heroEl.innerHTML = ''; return; }
  const ev = upcoming[0];
  heroEl.innerHTML = '<div class="hero-card" onclick="openDetail(' + ev.id + ')">' +
    '<div class="hero-label">האירוע הקרוב</div>' +
    '<div style="display:flex;align-items:center;gap:12px;margin-top:5px;">' +
    avatarHTML(ev, 'av-sm') +
    '<div><div class="hero-name">' + ev.name + '</div>' +
    '<div style="font-size:11px;color:#818cf8;margin-top:2px;">' + getLabel(ev.type, ev.customType) + '</div></div>' +
    '</div>' +
    '<span class="hero-badge">' + (ev.daysLeft === 0 ? '🎉 היום!' : ev.daysLeft === 1 ? '🔥 מחר!' : '📅 עוד ' + ev.daysLeft + ' ימים') + '</span>' +
    '</div>';
}

function renderGroupFilters(enriched) {
  const userGroups = [...new Set(enriched.map(e => e.group).filter(g => g && !FIXED_GROUPS.includes(g)))];
  const allGroups = ['', ...FIXED_GROUPS, ...userGroups];
  document.getElementById('main-group-filters').innerHTML = allGroups.map(g =>
    '<div class="chip' + (activeGroupFilter === g ? ' active' : '') + '" onclick="setGroupFilter(\'' + g.replace(/'/g,"\\'") + '\')">' + (g || 'הכל') + '</div>'
  ).join('');
}

function setGroupFilter(g) {
  activeGroupFilter = g;
  const enriched = events.map(ev => ({ ...ev, ...calcDays(ev) }));
  renderGroupFilters(enriched);
  renderEventsList(enriched);
}

function renderEventsList(enriched) {
  let list = [...enriched];
  if (activeGroupFilter) list = list.filter(e => e.group === activeGroupFilter);
  const filter = settings.defaultFilter || '30';
  if (filter === '30') list = list.filter(e => e.daysLeft !== null && e.daysLeft <= 30);
  else if (filter === 'future') list = list.filter(e => !e.isOver && e.daysLeft !== null);
  else if (filter === 'past') list = list.filter(e => e.isOver);
  // all — show everything
  const sortBy = settings.defaultSort || 'date';
  if (sortBy === 'name') { list.sort((a,b) => (a.name||'').localeCompare(b.name||'','he')); }
  else if (sortBy === 'group') { list.sort((a,b) => (a.group||'').localeCompare(b.group||'','he')); }
  else list.sort((a,b) => {
    if (a.daysLeft === null && b.daysLeft === null) return 0;
    if (a.daysLeft === null) return 1;
    if (b.daysLeft === null) return -1;
    return a.daysLeft - b.daysLeft;
  });

  const el = document.getElementById('main-events-list');
  if (!list.length) {
    if (!events.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">עדיין אין אירועים</div><div class="empty-sub">לחץ "הוסף אירוע" כדי להתחיל</div></div>';
    } else {
      el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);">לא נמצאו אירועים בטווח זה</div>';
    }
    return;
  }
  el.innerHTML = list.map(ev => buildCard(ev)).join('');
}

function buildCard(ev) {
  const storeLinks = ev.giftIdea ? (settings.activeStores||['Amazon','KSP','זאפ']).map(s =>
    '<a href="https://www.google.com/search?q=' + encodeURIComponent(ev.giftIdea + ' ' + s) + '" target="_blank" class="store-link">🔍 ' + s + '</a>'
  ).join('') : '';

  const giftHtml = (ev.giftIdea || ev.budget) ? (
    '<div class="gift-box"><div style="display:flex;justify-content:space-between;align-items:center;">' +
    '<span style="font-size:11px;color:var(--green);">🎁 ' + (ev.giftIdea||'') + (ev.budget ? ' | ' + ev.budget + '₪' : '') + '</span>' +
    '<button onclick="event.stopPropagation();toggleGift(' + ev.id + ')" style="background:' + (ev.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';color:white;border:none;padding:3px 9px;border-radius:var(--rf);font-size:11px;cursor:pointer;">' + (ev.giftStatus==='paid'?'✅ נקנה':'⏳ לביצוע') + '</button>' +
    '</div><div class="store-links">' + storeLinks + '</div></div>'
  ) : '';

  return '<div class="event-card new-card" id="card-' + ev.id + '">' +
    '<div class="event-card-main">' +
    '<div onclick="openDetail(' + ev.id + ')" style="display:flex;align-items:center;gap:10px;flex:1;cursor:pointer;">' +
    avatarHTML(ev, 'av-sm') +
    '<div style="flex:1;"><div style="font-weight:600;font-size:16px;">' + ev.name + '</div>' +
    '<div style="font-size:12px;color:var(--accent);">' + getLabel(ev.type, ev.customType) + '</div>' +
    '<div style="margin-top:4px;">' + countdownHTML(ev.daysLeft, ev.isOver) + '</div></div>' +
    '</div>' + urgencyBadge(ev.daysLeft, ev.isOver) +
    '</div>' +
    '<div class="event-actions">' +
    '<button class="card-btn share" onclick="shareEvent(' + ev.id + ')">📱 שתף</button>' +
    '<button class="card-btn" onclick="editEvent(' + ev.id + ')">✏️ ערוך</button>' +
    '<button class="card-btn" onclick="toggleDetails(' + ev.id + ',this)">⚙️ עוד ▼</button>' +
    '</div>' +
    '<div class="details-panel" id="dp-' + ev.id + '">' +
    (ev.group ? '<div class="detail-row"><span class="detail-label">🏷️ קבוצה</span><span>' + ev.group + '</span></div>' : '') +
    (ev.phone ? '<div class="detail-row"><span class="detail-label">📱 טלפון</span><a href="tel:' + ev.phone + '" style="color:var(--acc-light);">' + ev.phone + '</a></div>' : '') +
    (ev.phone2 ? '<div class="detail-row"><span class="detail-label">📱 טלפון 2</span><a href="tel:' + ev.phone2 + '" style="color:var(--acc-light);">' + ev.phone2 + '</a></div>' : '') +
    (ev.email ? '<div class="detail-row"><span class="detail-label">✉️ מייל</span><a href="mailto:' + ev.email + '" style="color:var(--acc-light);">' + ev.email + '</a></div>' : '') +
    (ev.notes ? '<div style="font-size:12px;color:var(--muted);padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">💡 ' + ev.notes + '</div>' : '') +
    giftHtml +
    // חלון 1 — ברכות קבועות
    '<div class="greet-box" style="margin-bottom:8px;">' +
    '<div class="greet-label"><span>💬 ברכות קבועות</span><button class="greet-next-btn" onclick="nextVariant(' + ev.id + ')">הבא ›</button></div>' +
    '<div class="greet-text" id="greet-text-' + ev.id + '">' + buildGreeting(ev) + '</div>' +
    '<div class="greet-actions">' +
    '<button class="greet-btn" onclick="sendWhatsApp(' + ev.id + ')">📱 וואטסאפ</button>' +
    '<button class="greet-btn sec" onclick="copyGreet(' + ev.id + ')">📋 העתק</button>' +
    '</div></div>' +
    // חלון 2 — ברכות אישיות + חופשי
    '<div class="greet-box">' +
    '<div class="greet-label"><span>📝 ברכה אישית</span>' +
    (myGreetings.some(g=>g) ? '<button class="greet-next-btn" onclick="nextMyGreet(' + ev.id + ')">הבא ›</button>' : '') +
    '</div>' +
    '<div class="greet-text" id="my-greet-text-' + ev.id + '">' + (myGreetings.find(g=>g) ? myGreetings.find(g=>g).replace(/{name}/g, ev.name||'') : 'לחץ ✏️ לכתיבת ברכה חופשית') + '</div>' +
    '<textarea id="free-greet-ta-' + ev.id + '" class="form-textarea" style="min-height:55px;margin-bottom:8px;display:none;" placeholder="כתוב ברכה חופשית..."></textarea>' +
    '<div class="greet-actions">' +
    '<button class="greet-btn" onclick="sendMyGreetOrFree(' + ev.id + ')">📱 וואטסאפ</button>' +
    '<button class="greet-btn sec" onclick="copyMyGreetOrFree(' + ev.id + ')">📋 העתק</button>' +
    '<button class="greet-btn sec" onclick="toggleFreeGreet(' + ev.id + ')" style="flex:0;padding:8px 10px;">✏️</button>' +
    '</div></div>' +
    '</div></div>';
}

function toggleDetails(id, btn) {
  const p = document.getElementById('dp-' + id);
  p.classList.toggle('open');
  btn.textContent = p.classList.contains('open') ? '▲ הסתר' : '⚙️ עוד ▼';
}

// ========== DETAIL ==========
let _detailId = null;
function openDetail(id) {
  _detailId = id;
  const ev = events.find(e => e.id === id); if (!ev) return;
  const calc = calcDays(ev);
  const storeLinks = ev.giftIdea ? (settings.activeStores||['Amazon','KSP','זאפ']).map(s =>
    '<a href="https://www.google.com/search?q=' + encodeURIComponent(ev.giftIdea + ' ' + s) + '" target="_blank" class="store-link">🔍 ' + s + '</a>'
  ).join('') : '';

  document.getElementById('detail-content').innerHTML =
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">' +
    avatarHTML(ev, 'av-lg') +
    '<div><div style="font-size:20px;font-weight:600;">' + ev.name + '</div>' +
    '<div style="font-size:13px;color:var(--accent);margin-top:2px;">' + getLabel(ev.type, ev.customType) + '</div>' +
    '<div style="margin-top:5px;">' + countdownHTML(calc.daysLeft, calc.isOver) + '</div></div>' +
    '</div>' +
    '<div class="card" style="margin-bottom:12px;">' +
    '<div class="detail-row"><span class="detail-label">📅 תאריך</span><span>' + (ev.date||'') + '</span></div>' +
    (ev.group ? '<div class="detail-row"><span class="detail-label">🏷️ קבוצה</span><span>' + ev.group + '</span></div>' : '') +
    (ev.phone ? '<div class="detail-row"><span class="detail-label">📱 טלפון</span><a href="tel:' + ev.phone + '" style="color:var(--acc-light);">' + ev.phone + '</a></div>' : '') +
    (ev.phone2 ? '<div class="detail-row"><span class="detail-label">📱 טלפון 2</span><a href="tel:' + ev.phone2 + '" style="color:var(--acc-light);">' + ev.phone2 + '</a></div>' : '') +
    (ev.email ? '<div class="detail-row"><span class="detail-label">✉️ מייל</span><a href="mailto:' + ev.email + '" style="color:var(--acc-light);">' + ev.email + '</a></div>' : '') +
    (ev.notes ? '<div class="detail-row"><span class="detail-label">💡 הערות</span><span style="color:var(--muted);">' + ev.notes + '</span></div>' : '') +
    '</div>' +
    ((ev.giftIdea||ev.budget) ? '<div class="gift-box" style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:12px;color:var(--green);">🎁 ' + (ev.giftIdea||'') + (ev.budget?' | '+ev.budget+'₪':'') + '</span><button onclick="toggleGift(' + ev.id + ');renderMain();" style="background:' + (ev.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';color:white;border:none;padding:4px 10px;border-radius:var(--rf);font-size:12px;cursor:pointer;">' + (ev.giftStatus==='paid'?'✅ נקנה':'⏳ לביצוע') + '</button></div><div class="store-links">' + storeLinks + '</div></div>' : '') +
    '<div class="greet-box" style="margin-bottom:14px;"><div class="greet-label"><span>💬 ברכה</span><button class="greet-next-btn" onclick="nextVariant(' + ev.id + ');updateDetailGreet(' + ev.id + ')">הבא ›</button></div><div class="greet-text" id="greet-text-' + ev.id + '">' + buildGreeting(ev) + '</div><div class="greet-actions"><button class="greet-btn" onclick="sendWhatsApp(' + ev.id + ')">📱 וואטסאפ</button><button class="greet-btn sec" onclick="copyGreet(' + ev.id + ')">📋 העתק</button></div></div>' +
    '<div style="display:flex;gap:8px;">' +
    (ev.phone ? '<button class="card-btn" style="flex:1;" onclick="window.location.href=\'tel:' + ev.phone + '\'">📱 התקשר</button>' : '') +
    '<button class="card-btn" style="flex:1;" onclick="shareEvent(' + ev.id + ')">📤 שתף</button>' +
    '<button class="card-btn" style="flex:1;color:var(--red);border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);" onclick="deleteEventDirect(' + ev.id + ')">🗑️ מחק</button>' +
    '</div>';

  openScreen('screen-detail');
}

function updateDetailGreet(id) {
  const ev = events.find(e => e.id === id); if (!ev) return;
  const el = document.getElementById('greet-text-' + id);
  if (el) el.textContent = buildGreeting(ev);
}

function editCurrentDetail() { if (_detailId) editEvent(_detailId); }

function deleteEventDirect(id) {
  if (!confirm('מחק את האירוע לצמיתות?')) return;
  events = events.filter(e => e.id !== id);
  saveEvents(); playSound('delete'); openScreen('screen-main');
}

// ========== FORM ==========
let selectedGiftTags = [];
let _formPhoto = null, _formEmoji = null;

function openAddForm(group) {
  document.getElementById('form-title').textContent = 'אירוע חדש';
  document.getElementById('editing-id').value = '';
  document.getElementById('btn-delete-form').style.display = 'none';
  clearForm();
  if (group) {
    const sel = document.getElementById('inp-group-select');
    if ([...sel.options].find(o => o.value === group)) sel.value = group;
  }
  openScreen('screen-add');
}

function clearForm() {
  ['inp-name','inp-date','inp-phone','inp-phone2','inp-email','inp-notes','inp-budget','inp-gift-idea','inp-custom-type','inp-group-custom'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('inp-type').value = 'birthday';
  document.getElementById('inp-gender').value = 'male';
  document.getElementById('inp-group-select').value = '';
  document.getElementById('inp-gift-status').value = 'pending';
  document.getElementById('inp-custom-type').style.display = 'none';
  document.getElementById('inp-group-custom').style.display = 'none';
  document.getElementById('sound-label').textContent = 'ברירת מחדל';
  const trimBox = document.getElementById('sound-trim-box');
  if (trimBox) trimBox.style.display = 'none';
  selectedGiftTags = []; _formPhoto = null; _formEmoji = null; _soundBlob = null;
  if (_soundAudio) { _soundAudio.pause(); _soundAudio = null; }
  document.querySelectorAll('.gift-tag').forEach(t => t.classList.remove('selected'));
  document.getElementById('gift-selected-display').style.display = 'none';
  document.getElementById('form-avatar').innerHTML = '?';
  document.getElementById('form-avatar').style.cssText = 'background:#1e1b4b;color:var(--acc-light);border:2px dashed rgba(var(--acc-rgb),0.4);';
  ['extra','gift'].forEach(id => {
    document.getElementById('collapse-' + id).classList.remove('open');
    document.getElementById('btn-' + id).classList.remove('open');
  });
}

function cancelForm() { clearForm(); setTimeout(() => openScreen('screen-main'), 50); }

function onTypeChange() {
  const t = document.getElementById('inp-type').value;
  document.getElementById('inp-custom-type').style.display = t === 'custom' ? 'block' : 'none';
}

function onGroupChange() {
  const v = document.getElementById('inp-group-select').value;
  document.getElementById('inp-group-custom').style.display = v === 'custom' ? 'block' : 'none';
}

function toggleCollapse(id) {
  const btn = document.getElementById('btn-' + id);
  const content = document.getElementById('collapse-' + id);
  content.classList.toggle('open');
  btn.classList.toggle('open');
  const arrow = btn.querySelector('span:last-child');
  if (arrow) arrow.textContent = content.classList.contains('open') ? '▲' : '▼';
}

function initGiftTags() {
  const c = document.getElementById('gift-tags-container'); if (!c) return;
  c.innerHTML = GIFT_OPTIONS.map(o =>
    '<div class="gift-tag" data-label="' + o.l + '" onclick="toggleGiftTag(this,\'' + o.l + '\')">' + o.e + ' ' + o.l + '</div>'
  ).join('');
}

function toggleGiftTag(el, label) {
  const i = selectedGiftTags.indexOf(label);
  if (i === -1) { selectedGiftTags.push(label); el.classList.add('selected'); }
  else { selectedGiftTags.splice(i,1); el.classList.remove('selected'); }
  updateGiftDisplay();
}

function updateGiftDisplay() {
  const custom = document.getElementById('inp-gift-idea').value;
  const all = [...selectedGiftTags, ...(custom ? [custom] : [])];
  const d = document.getElementById('gift-selected-display');
  if (all.length) { d.style.display = 'block'; d.textContent = '🎁 נבחר: ' + all.join(' · '); }
  else d.style.display = 'none';
}

function getGiftIdea() {
  const custom = document.getElementById('inp-gift-idea').value;
  return [...selectedGiftTags, ...(custom ? [custom] : [])].join(', ');
}

function saveEvent() {
  // קרא ערכים בצורה בטוחה לאייפון
  const nameEl = document.getElementById('inp-name');
  const dateEl = document.getElementById('inp-date');
  const name = nameEl ? nameEl.value.trim() : '';
  const date = dateEl ? dateEl.value : '';
  if (!name || !date) { alert('שם ותאריך הם שדות חובה'); return; }

  const gSel = document.getElementById('inp-group-select').value;
  const groupCustomEl = document.getElementById('inp-group-custom');
  const group = gSel === 'custom' ? (groupCustomEl ? groupCustomEl.value.trim() : '') : gSel;

  const getVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const getSelVal = id => { const el = document.getElementById(id); return el ? el.value : ''; };

  const data = {
    name, date,
    type: getSelVal('inp-type'),
    customType: getVal('inp-custom-type'),
    gender: getSelVal('inp-gender') || 'male',
    phone: getVal('inp-phone'),
    phone2: getVal('inp-phone2'),
    email: getVal('inp-email'),
    group,
    notes: getVal('inp-notes'),
    budget: getVal('inp-budget'),
    giftIdea: getGiftIdea(),
    giftStatus: getSelVal('inp-gift-status') || 'pending',
    photo: _formPhoto || null,
    emoji: _formEmoji || null,
    customSound: _soundBlob || null,
  };

  const editId = document.getElementById('editing-id').value;
  if (editId) {
    const i = events.findIndex(e => e.id === parseInt(editId));
    if (i !== -1) events[i] = { ...events[i], ...data };
  } else {
    data.id = Date.now();
    data.notifications = [];
    events.unshift(data);
    if (settings.isFirstTime) { settings.isFirstTime = false; saveSettings(); }
    scheduleNotif(data);
  }
  saveEvents();
  playEventSound(data);
  clearForm();
  // נווט למסך הראשי בצורה בטוחה לכל דפדפן
  setTimeout(() => openScreen('screen-main'), 50);
  return false;
}

function saveAndEdit() {
  saveEvent();
  if (events.length) {
    editEvent(events[0].id);
    document.getElementById('collapse-extra').classList.add('open');
    document.getElementById('btn-extra').classList.add('open');
  }
}

function editEvent(id) {
  const ev = events.find(e => e.id === id); if (!ev) return;
  document.getElementById('form-title').textContent = '✏️ עריכת אירוע';
  document.getElementById('editing-id').value = id;
  document.getElementById('btn-delete-form').style.display = 'block';
  document.getElementById('inp-name').value = ev.name || '';
  document.getElementById('inp-date').value = ev.date || '';
  document.getElementById('inp-type').value = ev.type || 'birthday';
  document.getElementById('inp-custom-type').value = ev.customType || '';
  document.getElementById('inp-custom-type').style.display = ev.type === 'custom' ? 'block' : 'none';
  document.getElementById('inp-gender').value = ev.gender || 'male';
  document.getElementById('inp-phone').value = ev.phone || '';
  document.getElementById('inp-phone2').value = ev.phone2 || '';
  document.getElementById('inp-email').value = ev.email || '';
  document.getElementById('inp-notes').value = ev.notes || '';
  document.getElementById('inp-budget').value = ev.budget || '';
  document.getElementById('inp-gift-status').value = ev.giftStatus || 'pending';
  const known = ['משפחה','חברים','עבודה','צבא','טיול','לימודים','שכנים'];
  if (known.includes(ev.group)) { document.getElementById('inp-group-select').value = ev.group; }
  else if (ev.group) {
    document.getElementById('inp-group-select').value = 'custom';
    document.getElementById('inp-group-custom').value = ev.group;
    document.getElementById('inp-group-custom').style.display = 'block';
  }
  _formPhoto = ev.photo || null; _formEmoji = ev.emoji || null;
  _soundBlob = ev.customSound || null;
  if (_soundBlob) document.getElementById('sound-label').textContent = 'צליל שמור ✅';
  updateFormAvatar();
  if (ev.giftIdea || ev.budget) { document.getElementById('collapse-gift').classList.add('open'); document.getElementById('btn-gift').classList.add('open'); }
  if (ev.phone || ev.notes || ev.email) { document.getElementById('collapse-extra').classList.add('open'); document.getElementById('btn-extra').classList.add('open'); }
  openScreen('screen-add');
}

function deleteCurrentEvent() {
  const id = parseInt(document.getElementById('editing-id').value);
  if (!id || !confirm('מחק?')) return;
  events = events.filter(e => e.id !== id);
  saveEvents(); playSound('delete'); clearForm(); openScreen('screen-main');
}

// ========== PHOTO ==========
function updateFormAvatar() {
  const el = document.getElementById('form-avatar');
  if (_formPhoto) {
    el.innerHTML = '<img src="' + _formPhoto + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
    el.style.cssText = 'border:2px solid var(--acc-border);';
  } else if (_formEmoji) {
    el.innerHTML = _formEmoji;
    el.style.cssText = 'background:#1e1b4b;font-size:24px;border:2px solid var(--acc-border);';
  } else {
    const name = document.getElementById('inp-name').value || '?';
    const [bg, fg] = avatarColor(name);
    el.innerHTML = name[0].toUpperCase();
    el.style.cssText = 'background:' + bg + ';color:' + fg + ';border:2px dashed rgba(var(--acc-rgb),0.4);';
  }
}

function triggerCamera() {
  closeModal('modal-photo');
  const i = document.getElementById('photo-input');
  i.setAttribute('capture', 'environment');
  i.click();
}

function triggerGallery() {
  closeModal('modal-photo');
  const i = document.getElementById('photo-input');
  i.removeAttribute('capture');
  i.click();
}

function openEmojiPicker() {
  closeModal('modal-photo');
  const emoji = prompt('הכנס אמוג\'י:', '😊');
  if (emoji) { _formEmoji = emoji; _formPhoto = null; updateFormAvatar(); }
}

function removePhoto() {
  closeModal('modal-photo');
  _formPhoto = null; _formEmoji = null; updateFormAvatar();
}

function onPhotoSelected(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { _formPhoto = e.target.result; _formEmoji = null; updateFormAvatar(); };
  reader.readAsDataURL(file);
}

// ========== צליל מותאם אישית ==========
let _soundBlob = null; // blob זמני לפני שמירה
let _soundAudio = null; // אובייקט אודיו נוכחי

function onSoundSelected(input) {
  const file = input.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('הקובץ גדול מדי. בחר קובץ עד 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    _soundBlob = e.target.result; // base64
    document.getElementById('sound-label').textContent = file.name + ' (טרם נחתך)';
    // הצג כלי חיתוך
    const trimBox = document.getElementById('sound-trim-box');
    if (trimBox) trimBox.style.display = 'block';
    // נגן לתצוגה מקדימה
    if (_soundAudio) _soundAudio.pause();
    _soundAudio = new Audio(_soundBlob);
    _soundAudio.play().catch(()=>{});
  };
  reader.readAsDataURL(file);
}

function playCurrentSound() {
  const editId = document.getElementById('editing-id').value;
  let src = _soundBlob;
  if (!src && editId) {
    const ev = events.find(e => e.id === parseInt(editId));
    src = ev ? ev.customSound : null;
  }
  if (!src) { playSound('greet'); return; }
  if (_soundAudio) _soundAudio.pause();
  _soundAudio = new Audio(src);
  _soundAudio.play().catch(()=>{ playSound('greet'); });
}

function trimAndSaveSound() {
  if (!_soundBlob) { alert('בחר קובץ קודם'); return; }
  const startEl = document.getElementById('sound-start');
  const endEl = document.getElementById('sound-end');
  const start = parseFloat(startEl ? startEl.value : 0) || 0;
  const end = parseFloat(endEl ? endEl.value : 15) || 15;
  if (end - start > 15) { alert('מקסימום 15 שניות'); return; }
  if (end <= start) { alert('זמן סיום חייב להיות אחרי ההתחלה'); return; }

  // חתוך באמצעות AudioContext
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  // המר base64 ל-ArrayBuffer
  const b64 = _soundBlob.split(',')[1];
  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);

  audioCtx.decodeAudioData(buffer, decoded => {
    const sampleRate = decoded.sampleRate;
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.min(Math.floor(end * sampleRate), decoded.length);
    const length = endSample - startSample;
    const trimmed = audioCtx.createBuffer(decoded.numberOfChannels, length, sampleRate);
    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      const data = decoded.getChannelData(ch).slice(startSample, endSample);
      trimmed.copyToChannel(data, ch);
    }
    // המר בחזרה ל-WAV base64
    const wav = audioBufferToWav(trimmed);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const reader = new FileReader();
    reader.onload = e2 => {
      _soundBlob = e2.target.result;
      document.getElementById('sound-label').textContent = start + 's — ' + end + 's (מוכן)';
      const trimBox = document.getElementById('sound-trim-box');
      if (trimBox) trimBox.style.display = 'none';
      // נגן לאישור
      if (_soundAudio) _soundAudio.pause();
      _soundAudio = new Audio(_soundBlob);
      _soundAudio.play().catch(()=>{});
    };
    reader.readAsDataURL(blob);
  }, () => alert('שגיאה בקריאת הקובץ. נסה פורמט אחר (MP3/WAV)'));
}

// המרת AudioBuffer ל-WAV
function audioBufferToWav(buffer) {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * numCh * 2);
  const view = new DataView(arrayBuffer);
  const writeStr = (offset, str) => { for (let i=0;i<str.length;i++) view.setUint8(offset+i, str.charCodeAt(i)); };
  writeStr(0,'RIFF');
  view.setUint32(4, 36+length*numCh*2, true);
  writeStr(8,'WAVE'); writeStr(12,'fmt ');
  view.setUint32(16,16,true); view.setUint16(20,1,true);
  view.setUint16(22,numCh,true); view.setUint32(24,sampleRate,true);
  view.setUint32(28,sampleRate*numCh*2,true); view.setUint16(32,numCh*2,true);
  view.setUint16(34,16,true); writeStr(36,'data');
  view.setUint32(40,length*numCh*2,true);
  let offset = 44;
  for (let i=0;i<length;i++) {
    for (let ch=0;ch<numCh;ch++) {
      const s = Math.max(-1,Math.min(1,buffer.getChannelData(ch)[i]));
      view.setInt16(offset, s<0?s*0x8000:s*0x7FFF, true);
      offset += 2;
    }
  }
  return arrayBuffer;
}

function playEventSound(ev) {
  if (ev && ev.customSound) {
    const audio = new Audio(ev.customSound);
    audio.play().catch(()=>{ playSound('save'); });
  } else {
    playSound('save');
  }
}

// ========== GIFT ==========
function toggleGift(id) {
  const ev = events.find(e => e.id === id); if (!ev) return;
  ev.giftStatus = ev.giftStatus === 'paid' ? 'pending' : 'paid';
  saveEvents(); renderMain();
}

// ========== SHARE ==========
function sendWhatsApp(id) {
  const ev = events.find(e => e.id === id); if (!ev) return;
  playSound('greet');
  const text = buildGreeting(ev);
  const phone = (ev.phone || '').replace(/\D/g,'');
  const url = phone ? 'https://wa.me/972' + phone.replace(/^0/,'') + '?text=' + encodeURIComponent(text) : 'https://wa.me/?text=' + encodeURIComponent(text);
  window.open(url, '_blank');
}

function copyGreet(id) {
  const ev = events.find(e => e.id === id); if (!ev) return;
  playSound('greet');
  navigator.clipboard.writeText(buildGreeting(ev)).then(() => alert('הברכה הועתקה! 📋'));
}

function shareEvent(id) {
  const ev = events.find(e => e.id === id); if (!ev) return;
  const calc = calcDays(ev);
  const text = '🔔 ' + ev.name + ' — ' + getLabel(ev.type, ev.customType) +
    (calc.daysLeft !== null ? ' (בעוד ' + calc.daysLeft + ' ימים)' : '') +
    '\n\nלא שכחתי: https://barakaflalo.github.io/lo-shachachti';
  if (navigator.share) navigator.share({ text }).catch(()=>{});
  else navigator.clipboard.writeText(text).then(() => alert('הועתק! 📋'));
}

function shareApp() {
  const text = '🔔 "לא שכחתי" — האפליקציה שתזכיר לך כל יום הולדת ואירוע!\nhttps://barakaflalo.github.io/lo-shachachti';
  if (navigator.share) navigator.share({ text }).catch(()=>{});
  else navigator.clipboard.writeText(text).then(() => alert('הקישור הועתק! 📋'));
}

// ========== SEARCH ==========
let searchGroupFilter = '';

function initSearch() {
  searchGroupFilter = '';
  renderSearchFilters();
  document.getElementById('search-input').value = '';
  // הצג את כל האירועים מיד
  const list = events.map(e => ({...e,...calcDays(e)})).sort((a,b) => {
    if (a.daysLeft===null) return 1; if (b.daysLeft===null) return -1; return a.daysLeft-b.daysLeft;
  });
  const cont = document.getElementById('search-results');
  if (!list.length) {
    cont.innerHTML = '<div class="empty-state"><div style="font-size:36px;margin-bottom:12px;">🔍</div><div>אין אירועים עדיין</div></div>';
  } else {
    cont.innerHTML = '<div class="section-lbl">כל האירועים — ' + list.length + '</div>' + list.map(e => searchRow(e, '')).join('');
  }
  setTimeout(() => document.getElementById('search-input').focus(), 100);
}

function renderSearchFilters() {
  const userGroups = [...new Set(events.map(e => e.group).filter(g => g && !FIXED_GROUPS.includes(g)))];
  const all = ['', ...FIXED_GROUPS, ...userGroups];
  document.getElementById('search-filters').innerHTML = all.map(g =>
    '<div class="chip' + (searchGroupFilter === g ? ' active' : '') + '" onclick="setSearchGroup(\'' + g.replace(/'/g,"\\'") + '\')">' + (g||'הכל') + '</div>'
  ).join('');
}

function setSearchGroup(g) {
  searchGroupFilter = g;
  renderSearchFilters();
  const q = (document.getElementById('search-input').value || '').trim().toLowerCase();
  if (!g) {
    // הכל — הצג את כל האירועים
    let list = events.map(e => ({...e,...calcDays(e)}));
    if (q) list = list.filter(e => (e.name||'').toLowerCase().includes(q));
    list.sort((a,b) => { if (a.daysLeft===null) return 1; if (b.daysLeft===null) return -1; return a.daysLeft-b.daysLeft; });
    const cont = document.getElementById('search-results');
    if (!list.length) {
      cont.innerHTML = '<div class="empty-state"><div style="font-size:36px;margin-bottom:12px;">🔍</div><div>אין אירועים עדיין</div></div>';
      return;
    }
    cont.innerHTML = '<div class="section-lbl">כל האירועים — ' + list.length + '</div>' + list.map(e => searchRow(e, q)).join('');
  } else {
    const list = events.filter(e => e.group === g).map(e => ({...e,...calcDays(e)}));
    const cont = document.getElementById('search-results');
    if (!list.length) {
      cont.innerHTML = '<div class="empty-state"><div style="font-size:28px;margin-bottom:8px;">👥</div><div style="margin-bottom:14px;">אין אנשים בקבוצה "' + g + '"</div><button class="btn-primary" onclick="openAddForm(\'' + g + '\')" style="max-width:200px;margin:0 auto;">➕ הוסף ל' + g + '</button></div>';
      return;
    }
    cont.innerHTML = '<div class="section-lbl">' + g + ' — ' + list.length + ' אנשים</div>' +
      list.map(e => searchRow(e)).join('');
  }
}
function onSearch() {
  const q = (document.getElementById('search-input').value || '').trim().toLowerCase();
  if (!q && !searchGroupFilter) {
    document.getElementById('search-results').innerHTML = '<div class="empty-state"><div style="font-size:36px;margin-bottom:12px;">🔍</div><div>הקלד שם או בחר קבוצה</div></div>';
    return;
  }
  let list = events.map(e => ({...e,...calcDays(e)}));
  if (searchGroupFilter) list = list.filter(e => e.group === searchGroupFilter);
  if (q) list = list.filter(e => (e.name||'').toLowerCase().includes(q) || getLabel(e.type,e.customType).includes(q));
  list.sort((a,b) => { if (a.daysLeft===null) return 1; if (b.daysLeft===null) return -1; return a.daysLeft-b.daysLeft; });
  const cont = document.getElementById('search-results');
  if (!list.length) {
    cont.innerHTML = '<div class="empty-state"><div style="font-size:28px;margin-bottom:8px;">🤷</div><div style="margin-bottom:14px;">לא נמצא "' + q + '"</div>' +
      (q ? '<div style="background:var(--acc-dim);border:1px dashed var(--acc-border);border-radius:var(--r);padding:12px;text-align:center;"><div style="font-size:12px;color:#818cf8;margin-bottom:8px;">רוצה להוסיף אותו?</div><button class="btn-primary" onclick="addFromSearch(\'' + q + '\')">➕ הוסף "' + q + '"</button></div>' : '') +
      '</div>';
    return;
  }
  cont.innerHTML = '<div class="section-lbl">' + list.length + ' תוצאות</div>' + list.map(e => searchRow(e, q)).join('');
  if (q && !list.find(e => (e.name||'').toLowerCase() === q)) {
    cont.innerHTML += '<div style="background:var(--acc-dim);border:1px dashed var(--acc-border);border-radius:var(--r);padding:12px;text-align:center;margin-top:8px;"><div style="font-size:12px;color:#818cf8;margin-bottom:8px;">לא מצאת את מי שחיפשת?</div><button class="btn-primary" onclick="addFromSearch(\'' + q + '\')">➕ הוסף "' + q + '"</button></div>';
  }
}

function searchRow(e, q) {
  const name = q ? (e.name||'').replace(new RegExp(q,'gi'), m => '<span style="color:var(--acc-light);font-weight:600;">' + m + '</span>') : (e.name||'');
  return '<div class="event-card" onclick="openDetail(' + e.id + ')" style="cursor:pointer;">' +
    '<div class="event-card-main">' + avatarHTML(e,'av-sm') +
    '<div style="flex:1;margin-right:10px;"><div style="font-weight:600;">' + name + '</div>' +
    '<div style="font-size:12px;color:var(--accent);">' + getLabel(e.type,e.customType) + '</div></div>' +
    urgencyBadge(e.daysLeft,e.isOver) + '</div></div>';
}

function addFromSearch(name) {
  openAddForm();
  setTimeout(() => { document.getElementById('inp-name').value = name; }, 50);
}

// ========== CONTACTS ==========
let contactsGroupFilter = '';

function renderContacts() {
  const q = (document.getElementById('contacts-search').value || '').toLowerCase();
  const userGroups = [...new Set(events.map(e => e.group).filter(g => g && !FIXED_GROUPS.includes(g)))];
  const allGroups = ['', ...FIXED_GROUPS, ...userGroups];
  document.getElementById('contacts-filter').innerHTML = allGroups.map(g =>
    '<div class="chip' + (contactsGroupFilter === g ? ' active' : '') + '" onclick="setContactGroup(\'' + g.replace(/'/g,"\\'") + '\')">' + (g||'הכל') + '</div>'
  ).join('');

  let list = events.filter(e => !q || (e.name||'').toLowerCase().includes(q));
  if (contactsGroupFilter) list = list.filter(e => e.group === contactsGroupFilter);

  const cont = document.getElementById('contacts-list');
  if (contactsGroupFilter && !list.length) {
    cont.innerHTML = '<div class="empty-state"><div style="font-size:28px;margin-bottom:8px;">👥</div><div style="margin-bottom:14px;">אין אנשים בקבוצה "' + contactsGroupFilter + '"</div><button class="btn-primary" onclick="openAddForm(\'' + contactsGroupFilter + '\')" style="max-width:220px;margin:0 auto;">➕ הוסף ל' + contactsGroupFilter + '</button></div>';
    return;
  }
  if (!list.length) { cont.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">לא נמצאו אנשי קשר</div>'; return; }

  const byGroup = {};
  list.forEach(e => { const g = e.group||'ללא קבוצה'; if (!byGroup[g]) byGroup[g]=[]; byGroup[g].push(e); });
  cont.innerHTML = Object.entries(byGroup).map(([g, items]) =>
    '<div class="section-lbl">' + g + ' — ' + items.length + '</div>' +
    items.map(e => {
      const calc = calcDays(e);
      return '<div class="contact-row" onclick="openDetail(' + e.id + ')">' +
        avatarHTML(e,'av-sm') +
        '<div style="flex:1;margin-right:10px;"><div style="font-size:13px;font-weight:500;">' + (e.name||'') + '</div>' +
        '<div style="font-size:11px;color:var(--muted);">' + getLabel(e.type,e.customType) + (e.date?' — '+e.date:'') + '</div></div>' +
        (calc.daysLeft !== null ? urgencyBadge(calc.daysLeft,calc.isOver) : '') +
        '<span style="color:var(--acc-light);margin-right:auto;">›</span></div>';
    }).join('')
  ).join('');
}

function setContactGroup(g) { contactsGroupFilter = g; renderContacts(); }

function importFromPhone() {
  if (!('contacts' in navigator && 'ContactsManager' in window)) {
    alert('ייבוא מהטלפון עובד רק בכרום על אנדרואיד 📱\n\nאם אתה על אייפון — יש להשתמש בייבוא ICS בהגדרות מערכת.');
    return;
  }
  navigator.contacts.select(['name','tel','birthday'],{multiple:true}).then(results => {
    if (!results.length) return;
    let added = 0, skipped = 0;
    results.forEach(c => {
      const name = (c.name&&c.name[0]) || '';
      if (!name) return;
      if (events.find(e => e.name === name)) { skipped++; return; }
      const bday = c.birthday ? new Date(c.birthday).toISOString().slice(0,10) : '';
      events.push({ id:Date.now()+added, name, phone:(c.tel&&c.tel[0])||'', date:bday, type:bday?'birthday':'custom', group:'', notes:'', notifications:[] });
      added++;
    });
    saveEvents(); renderContacts(); renderMain();
    alert('✅ יובאו ' + added + ' אנשי קשר' + (skipped?' ('+skipped+' כבר קיימים)':''));
  }).catch(() => alert('לא ניתן לגשת לאנשי הקשר. וודא שנתת הרשאה.'));
}

// ========== SETTINGS ==========
function togSetting(key, el) {
  settings[key] = !settings[key];
  el.classList.toggle('on', settings[key]);
  saveSettings();
  if (key === 'largeFont') { applyFont(); return; }
  if (key !== 'sounds' && key !== 'confetti' && key !== 'animations') renderMain();
}

function applyFont() {
  if (settings.largeFont) {
    const size = settings.fontSizePx || 18;
    document.documentElement.style.fontSize = size + 'px';
    document.body.classList.add('large-font');
  } else {
    document.documentElement.style.fontSize = '16px';
    document.body.classList.remove('large-font');
  }
}

function changeFontSize() {
  const cur = settings.fontSizePx || 18;
  const val = prompt('גודל גופן (14-24):', cur);
  if (!val) return;
  const n = parseInt(val);
  if (n < 14 || n > 24) { alert('הכנס מספר בין 14 ל-24'); return; }
  settings.fontSizePx = n;
  settings.largeFont = true;
  saveSettings(); applyFont();
  // עדכן toggle
  const tog = document.getElementById('tog-font');
  if (tog) tog.classList.add('on');
}

function saveUserSettings() {
  settings.defaultFilter = document.getElementById('default-filter').value;
  settings.defaultSort = document.getElementById('default-sort').value;
  saveSettings(); renderMain(); openScreen('screen-main');
}

function togCustomNotif(el) {
  el.classList.toggle('on');
  document.getElementById('custom-notif-area').style.display = el.classList.contains('on') ? 'block' : 'none';
}

function editGiftReminder() {
  const n = prompt('כמה ימים לפני האירוע?', settings.giftReminderDays || 14);
  if (!n) return;
  settings.giftReminderDays = parseInt(n) || 14;
  saveSettings();
  const l = document.getElementById('gift-reminder-sub');
  if (l) l.textContent = settings.giftReminderDays + ' ימים לפני';
}

function editQuietHours() {
  const s = prompt('שעת התחלה (HH:MM):', settings.quietStart || '23:00');
  if (!s) return;
  const e = prompt('שעת סיום (HH:MM):', settings.quietEnd || '08:00');
  if (!e) return;
  settings.quietStart = s; settings.quietEnd = e; saveSettings();
  const l = document.getElementById('quiet-hours-label');
  if (l) l.textContent = s + ' — ' + e;
}

function addCustomNotif() {
  const days = prompt('כמה ימים לפני?', '');
  if (!days) return;
  const time = prompt('באיזו שעה? (HH:MM)', '09:00');
  if (!time) return;
  if (!settings.customNotifs) settings.customNotifs = [];
  settings.customNotifs.push({ days: parseInt(days), time });
  saveSettings();
  renderCustomNotifs();
}

function renderCustomNotifs() {
  const c = document.getElementById('custom-notif-tags'); if (!c) return;
  c.innerHTML = (settings.customNotifs || []).map((n,i) =>
    '<div class="gift-tag selected">' + n.days + ' ימים — ' + n.time + ' <span onclick="removeCustomNotif(' + i + ')" style="cursor:pointer;">✕</span></div>'
  ).join('');
}

function removeCustomNotif(i) {
  settings.customNotifs.splice(i, 1);
  saveSettings(); renderCustomNotifs();
}

// ========== GREETINGS ==========
function renderGreetings() {
  const types = [
    {key:'birthday',label:'🎉 יום הולדת'},{key:'memorial',label:'🕯️ אזכרה'},
    {key:'anniversary',label:'💍 יום נישואין'},{key:'wedding',label:'💒 חתונה'},
    {key:'barmitzvah',label:'✡️ בר/בת מצווה'},{key:'friends',label:'👥 מפגש'},
    {key:'trip',label:'✈️ טיול'},{key:'car',label:'🚗 טסט רכב'},
    {key:'medical',label:'🏥 תור רפואי'},{key:'holiday',label:'🎊 חג'},
    {key:'graduation',label:'🎓 סיום לימודים'},{key:'custom',label:'✨ אחר'},
  ];
  document.getElementById('greetings-list').innerHTML = types.map(t =>
    '<div class="card" style="margin-bottom:10px;">' +
    '<div style="font-size:13px;font-weight:500;margin-bottom:10px;">' + t.label + '</div>' +
    (greetings[t.key]||[]).map((v,i) =>
      '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px;padding-bottom:7px;border-bottom:1px solid rgba(255,255,255,0.04);">' +
      '<span style="font-size:10px;color:var(--muted);width:16px;flex-shrink:0;margin-top:3px;">' + (i+1) + '</span>' +
      '<div style="flex:1;font-size:12px;color:var(--muted);line-height:1.6;">' + v + '</div>' +
      '<button onclick="editVariant(\'' + t.key + '\',' + i + ')" style="font-size:10px;color:var(--acc-light);background:transparent;border:none;cursor:pointer;flex-shrink:0;">✏️</button>' +
      '</div>'
    ).join('') +
    '</div>'
  ).join('');
}

function editVariant(type, idx) {
  const cur = greetings[type][idx];
  const nv = prompt('ערוך ברכה ' + (idx+1) + ':', cur);
  if (nv !== null) { greetings[type][idx] = nv; saveGreetings(); renderGreetings(); }
}

function renderMyGreetings() {
  document.getElementById('my-greetings-list').innerHTML = myGreetings.map((g,i) =>
    '<div class="form-group"><label class="form-label">ברכה ' + (i+1) + '</label>' +
    '<textarea class="form-textarea" id="my-greet-' + i + '" placeholder="כתוב ברכה אישית...">' + (g||'') + '</textarea></div>'
  ).join('');
}

function saveMyGreetings() {
  myGreetings = [0,1,2,3,4].map(i => document.getElementById('my-greet-'+i).value);
  localStorage.setItem('ls2_my_greetings', JSON.stringify(myGreetings));
  alert('ברכות נשמרו ✅');
}

// ========== STORES ==========
function renderStores() {
  if (!settings.activeStores) settings.activeStores = ['Amazon','KSP','זאפ'];
  const customStores = (settings.customStores || []);
  const allToShow = [...ALL_STORES, ...customStores.filter(s => !ALL_STORES.includes(s))];
  const cont = document.getElementById('stores-container');
  if (!cont) return;
  cont.innerHTML = allToShow.map(s =>
    '<div class="gift-tag' + (settings.activeStores.includes(s) ? ' selected' : '') + '" onclick="toggleStore(this,\'' + s.replace(/'/g,"\\'") + '\')">' + s + '</div>'
  ).join('');
}

function toggleStore(el, name) {
  if (!settings.activeStores) settings.activeStores = [];
  const i = settings.activeStores.indexOf(name);
  if (i === -1) { settings.activeStores.push(name); el.classList.add('selected'); }
  else { settings.activeStores.splice(i,1); el.classList.remove('selected'); }
}

function addCustomStore() {
  const inp = document.getElementById('inp-custom-store');
  const name = inp ? inp.value.trim() : '';
  if (!name) return;
  if (!settings.customStores) settings.customStores = [];
  if (!settings.customStores.includes(name)) settings.customStores.push(name);
  if (!settings.activeStores) settings.activeStores = [];
  if (!settings.activeStores.includes(name)) settings.activeStores.push(name);
  if (inp) inp.value = '';
  saveSettings();
  renderStores();
}

function saveStores() { saveSettings(); alert('חנויות נשמרו ✅'); }
// ========== BUDGET ==========
function renderBudgetSettings() {
  const from = (document.getElementById('budget-from')||{}).value || '';
  const to = (document.getElementById('budget-to')||{}).value || '';
  // מלא רשימת קבוצות
  const groupSel = document.getElementById('budget-group-filter');
  if (groupSel && groupSel.options.length <= 1) {
    const groups = [...new Set(events.map(e=>e.group).filter(Boolean))];
    groups.forEach(g => { const o=document.createElement('option'); o.value=g; o.textContent=g; groupSel.appendChild(o); });
  }
  let list = events.filter(e => e.budget);
  if (from) list = list.filter(e => (e.date||'') >= from);
  if (to) list = list.filter(e => (e.date||'') <= to);
  const paid = list.filter(e => e.giftStatus === 'paid');
  const pending = list.filter(e => e.giftStatus !== 'paid');
  const paidT = paid.reduce((s,e) => s+(parseInt(e.budget)||0), 0);
  const pendT = pending.reduce((s,e) => s+(parseInt(e.budget)||0), 0);
  const statsEl = document.getElementById('budget-stats');
  if (statsEl) statsEl.innerHTML =
    '<div class="stat-card"><div class="stat-num green">' + paidT + '₪</div><div class="stat-label">✅ שולם (' + paid.length + ')</div></div>' +
    '<div class="stat-card"><div class="stat-num" style="color:var(--amber);">' + pendT + '₪</div><div class="stat-label">⏳ פתוח (' + pending.length + ')</div></div>';
  const listEl = document.getElementById('budget-list');
  if (listEl) listEl.innerHTML = [...paid,...pending].map(e =>
    '<div class="detail-row"><span>' + (e.name||'') + '</span><span style="display:flex;gap:8px;align-items:center;">' +
    '<span style="color:' + (e.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';">' + (parseInt(e.budget)||0) + '₪</span>' +
    '<button onclick="toggleGift(' + e.id + ');renderBudgetSettings();" style="font-size:10px;background:' + (e.giftStatus==='paid'?'var(--green)':'var(--amber)') + ';color:white;border:none;padding:2px 8px;border-radius:var(--rf);cursor:pointer;">' + (e.giftStatus==='paid'?'✅':'⏳') + '</button>' +
    '</span></div>'
  ).join('');
}

function printBudgetReport(groupFilter) {
  let list = events.filter(e => e.budget);
  if (groupFilter) list = list.filter(e => e.group === groupFilter);
  const paidTotal = list.filter(e=>e.giftStatus==='paid').reduce((s,e)=>s+(parseInt(e.budget)||0),0);
  const total = list.reduce((s,e)=>s+(parseInt(e.budget)||0),0);
  const win = window.open('');
  win.document.write('<html dir="rtl"><body style="font-family:sans-serif;padding:20px;">');
  win.document.write('<h2>לא שכחתי — דוח תקציב' + (groupFilter ? ' (' + groupFilter + ')' : '') + '</h2>');
  win.document.write('<p>שולם: <b>' + paidTotal + '₪</b> | סה"כ: <b>' + total + '₪</b></p>');
  win.document.write('<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;"><tr><th>שם</th><th>תאריך</th><th>קבוצה</th><th>תקציב</th><th>סטטוס</th></tr>');
  list.forEach(e => win.document.write(
    '<tr><td>'+(e.name||'')+'</td><td>'+(e.date||'')+'</td><td>'+(e.group||'')+'</td><td>'+(e.budget||'')+'₪</td>' +
    '<td>'+(e.giftStatus==='paid'?'✅ נקנה':'⏳ טרם נקנה')+'</td></tr>'
  ));
  win.document.write('</table></body></html>'); win.print();
}

function exportBudgetCSV() {
  const list = events.filter(e => e.budget);
  const rows = [['שם','תאריך','תקציב','סטטוס']];
  list.forEach(e => rows.push([e.name||'',e.date||'',(e.budget||'')+'₪',e.giftStatus==='paid'?'נקנה':'לביצוע']));
  const csv = rows.map(r => r.map(f => '"'+String(f).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'}));
  a.download = 'budget.csv'; a.click();
}

// ========== PRINT ==========
let reportType = 'all';

function initPrint() {
  reportType = 'all';
  document.querySelectorAll('#report-type-row .chip').forEach((c,i) => c.classList.toggle('active', i===0));
  updateReportPreview();
}

function setReportType(el, type) {
  reportType = type;
  document.querySelectorAll('#report-type-row .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  updateReportPreview();
}

function updateReportPreview() {
  const from = (document.getElementById('print-from')||{}).value || '';
  const to = (document.getElementById('print-to')||{}).value || '';
  let list = getReportList(from, to);
  const el = document.getElementById('report-preview');
  if (!el) return;
  el.innerHTML = '<div class="info-box"><div style="font-size:11px;color:var(--acc-light);font-weight:500;margin-bottom:8px;">תצוגה מקדימה — ' + list.length + ' אירועים</div>' +
    list.slice(0,4).map(e => '<div class="detail-row"><span>' + (e.name||'') + '</span><span style="font-size:11px;color:var(--muted);">' + (e.date||'') + '</span></div>').join('') +
    (list.length > 4 ? '<div style="font-size:11px;color:var(--muted);text-align:center;margin-top:6px;">ועוד ' + (list.length-4) + '...</div>' : '') +
    '</div>';
}

function getReportList(from, to) {
  let list = [...events];
  if (from) list = list.filter(e => (e.date||'') >= from);
  if (to) list = list.filter(e => (e.date||'') <= to);
  if (reportType === 'upcoming') list = list.map(e => ({...e,...calcDays(e)})).filter(e => e.daysLeft !== null && e.daysLeft <= 30).sort((a,b) => a.daysLeft-b.daysLeft);
  else if (reportType === 'group') list.sort((a,b) => (a.group||'').localeCompare(b.group||'','he'));
  else if (reportType === 'budget') list = list.filter(e => e.budget);
  return list;
}

function printReport() {
  const from = (document.getElementById('print-from')||{}).value || '';
  const to = (document.getElementById('print-to')||{}).value || '';
  const list = getReportList(from, to);
  const labels = {all:'הכל',upcoming:'קרובים',group:'לפי קבוצה',budget:'תקציב'};
  const win = window.open('');
  win.document.write('<html dir="rtl"><body style="font-family:sans-serif;padding:20px;"><h2>לא שכחתי — דוח ' + labels[reportType] + '</h2>');
  if (from||to) win.document.write('<p style="color:#888;">תקופה: ' + (from||'') + ' — ' + (to||'') + '</p>');
  win.document.write('<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;"><tr><th>שם</th><th>תאריך</th><th>סוג</th><th>קבוצה</th><th>תקציב</th></tr>');
  list.forEach(e => win.document.write('<tr><td>'+(e.name||'')+'</td><td>'+(e.date||'')+'</td><td>'+getLabel(e.type,e.customType)+'</td><td>'+(e.group||'')+'</td><td>'+(e.budget?e.budget+'₪':'')+'</td></tr>'));
  win.document.write('</table></body></html>'); win.print();
}

// ========== BACKUP ==========
function exportJSON() {
  const data = { version:2, events, settings, greetings, exported:new Date().toISOString() };
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  a.download = 'lo-shachachti-' + new Date().toISOString().slice(0,10) + '.json'; a.click();
}

function restoreBackup(input) {
  const file = input.files[0]; if (!file) return;
  if (!confirm('שחזור יחליף את כל הנתונים הנוכחיים. להמשיך?')) return;
  const r = new FileReader();
  r.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      events = d.events || [];
      if (d.settings) { settings = Object.assign(settings, d.settings); saveSettings(); }
      if (d.greetings) { Object.assign(greetings, d.greetings); saveGreetings(); }
      saveEvents(); renderMain(); openScreen('screen-main');
      alert('שוחזר בהצלחה ✅');
    } catch { alert('שגיאה בקריאת קובץ הגיבוי'); }
  };
  r.readAsText(file);
}

function exportCSVAll() {
  const rows = [['שם','תאריך','סוג','קבוצה','טלפון','תקציב','סטטוס','הערות']];
  events.forEach(e => rows.push([e.name||'',e.date||'',getLabel(e.type,e.customType),e.group||'',e.phone||'',e.budget||'',e.giftStatus||'',e.notes||'']));
  const csv = rows.map(r => r.map(f => '"'+String(f).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'}));
  a.download = 'events.csv'; a.click();
}

function importCSV(input) {
  const file = input.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    const lines = e.target.result.split('\n').slice(1);
    let added = 0;
    lines.forEach(line => {
      const cols = line.match(/("([^"]*)"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g);
      if (!cols || cols.length < 2) return;
      const name = (cols[0]||'').replace(/^"|"$/g,'').trim();
      const date = (cols[1]||'').replace(/^"|"$/g,'').trim();
      if (!name || !date) return;
      if (events.find(ev => ev.name === name && ev.date === date)) return;
      events.push({ id:Date.now()+added, name, date, type:'custom', group:'', notes:'', notifications:[] });
      added++;
    });
    saveEvents(); renderMain(); alert('יובאו ' + added + ' שורות');
  };
  r.readAsText(file, 'UTF-8');
}

function importICS(input) {
  const file = input.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    const blocks = e.target.result.split('BEGIN:VEVENT');
    let added = 0, skipped = 0;
    blocks.slice(1).forEach(block => {
      const get = key => { const m = block.match(new RegExp(key+'[^:]*:([^\r\n]+)')); return m ? m[1].trim() : ''; };
      let summary = get('SUMMARY');
      let dtstart = get('DTSTART').replace(/T.*/,'');
      if (!summary || !dtstart) return;
      if (dtstart.length === 8) dtstart = dtstart.slice(0,4)+'-'+dtstart.slice(4,6)+'-'+dtstart.slice(6,8);
      summary = summary.replace(/יום הולדת של?|'s birthday/gi,'').replace(/Birthday/gi,'').trim();
      let type = 'birthday';
      if (/אזכרה|יאר/.test(summary)) type = 'memorial';
      else if (/נישואין|חתונה/.test(summary)) type = 'anniversary';
      if (events.find(ev => ev.name === summary && ev.date === dtstart)) { skipped++; return; }
      events.push({ id:Date.now()+added, name:summary, date:dtstart, type, group:'', notes:'', notifications:[] });
      added++;
    });
    saveEvents(); renderMain(); openScreen('screen-main');
    alert('יובאו ' + added + ' אירועים!' + (skipped?' ('+skipped+' דולגו)':''));
  };
  r.readAsText(file);
}

function importFacebook(input) {
  const file = input.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const items = data.birthday_posts || data.friends || [];
      let added = 0;
      items.forEach(item => {
        const name = item.name || item.title || '';
        const bday = item.birthday || item.date || '';
        if (!name || events.find(ev => ev.name === name)) return;
        events.push({ id:Date.now()+added, name, date:bday, type:'birthday', group:'חברים', notes:'', notifications:[] });
        added++;
      });
      saveEvents(); renderMain(); openScreen('screen-main');
      alert('יובאו ' + added + ' חברים מפייסבוק!');
    } catch { alert('שגיאה בקריאת קובץ ה-JSON'); }
  };
  r.readAsText(file);
}

function confirmDeleteAll() {
  if (!confirm('מחק את כל הנתונים לצמיתות?!')) return;
  events = []; saveEvents(); renderMain(); openScreen('screen-main');
  alert('כל הנתונים נמחקו');
}

// ========== APPEARANCE ==========
function renderAppearance() {
  const grid = document.getElementById('theme-grid'); if (!grid) return;
  grid.innerHTML = THEMES.map(t => {
    const isActive = settings.theme === t.key;
    if (t.custom) {
      return '<div onclick="openCustomColor()" style="border:' + (isActive?'2px solid var(--accent)':'1px solid var(--border)') + ';border-radius:var(--rs);padding:10px 6px;text-align:center;cursor:pointer;position:relative;">' +
        '<div style="width:28px;height:28px;border-radius:50%;background:' + (isActive&&settings.customColor?settings.customColor:'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)') + ';margin:0 auto 5px;"></div>' +
        '<div style="font-size:10px;color:' + (isActive?'var(--acc-light)':'var(--muted)') + ';">' + t.name + (isActive?' ✓':'') + '</div>' +
        '<input type="color" id="custom-color-picker" style="position:absolute;opacity:0;width:100%;height:100%;top:0;left:0;cursor:pointer;" onchange="applyCustomColor(this.value)">' +
        '</div>';
    }
    return '<div onclick="selectTheme(\'' + t.key + '\')" style="border:' + (isActive?'2px solid var(--accent)':'1px solid var(--border)') + ';border-radius:var(--rs);padding:10px 6px;text-align:center;cursor:pointer;">' +
      '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,' + t.from + ',' + t.to + ');margin:0 auto 5px;"></div>' +
      '<div style="font-size:10px;color:' + (isActive?'var(--acc-light)':'var(--muted)') + ';">' + t.name + (isActive?' ✓':'') + '</div>' +
      '</div>';
  }).join('');
  ['dark','light','auto'].forEach(m => {
    const el = document.getElementById('mode-' + m);
    if (el) el.classList.toggle('active', settings.mode === m);
  });
}

function selectTheme(key) {
  settings.theme = key; saveSettings(); applyTheme(key); renderAppearance();
}

function applyTheme(key) {
  if (key === 'custom' && settings.customColor) { applyCustomColor(settings.customColor); return; }
  const t = THEMES.find(x => x.key === key); if (!t) return;
  const r = document.documentElement;
  r.style.setProperty('--accent', t.from);
  r.style.setProperty('--acc-rgb', t.rgb);
  r.style.setProperty('--acc-light', t.light);
  r.style.setProperty('--acc-dim', 'rgba(' + t.rgb + ',0.2)');
  r.style.setProperty('--acc-border', 'rgba(' + t.rgb + ',0.4)');
}

function openCustomColor() { document.getElementById('custom-color-picker').click(); }

function applyCustomColor(hex) {
  settings.theme = 'custom'; settings.customColor = hex; saveSettings();
  const rgb = [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)].join(',');
  const light = '#' + [parseInt(hex.slice(1,3),16)+80,parseInt(hex.slice(3,5),16)+80,parseInt(hex.slice(5,7),16)+80].map(x => Math.min(255,x).toString(16).padStart(2,'0')).join('');
  const r = document.documentElement;
  r.style.setProperty('--accent', hex);
  r.style.setProperty('--acc-rgb', rgb);
  r.style.setProperty('--acc-light', light);
  r.style.setProperty('--acc-dim', 'rgba(' + rgb + ',0.2)');
  r.style.setProperty('--acc-border', 'rgba(' + rgb + ',0.4)');
  renderAppearance();
}

function setMode(mode) {
  settings.mode = mode; saveSettings();
  if (mode === 'light') document.body.classList.add('light-mode');
  else if (mode === 'dark') document.body.classList.remove('light-mode');
  else {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('light-mode', !dark);
  }
  renderAppearance();
}

function saveAppearance() { saveSettings(); openScreen('screen-settings'); }

// ========== GUIDE ==========
const DAILY_TIPS = [
  'לחץ על יום בלוח השנה כדי לראות את האירועים של אותו יום!',
  'לחץ "הבא ›" בברכה כדי לראות 5 וריאנטים שונים!',
  'הוסף תמונה או אמוג\'י לאיש קשר לחוויה יותר אישית 📸',
  'ייצא גיבוי מדי פעם — הגדרות ← גיבוי והדפסה',
  'שנה את צבע האפליקציה — הגדרות ← מראה ← ערכת צבעים 🎨',
  'הוסף קבוצות לאנשי קשר לסינון מהיר במסך הראשי',
  'ייבא ימי הולדת מפייסבוק — הגדרות ← מערכת ← ייבוא 📘',
];

function renderGuide() {
  const tip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
  const el = document.getElementById('daily-tip');
  if (el) el.innerHTML = '<div style="font-size:11px;color:#fbbf24;font-weight:500;margin-bottom:4px;">💡 טיפ יומי</div><div style="font-size:11px;color:var(--muted);">' + tip + '</div>';
}

const CHAPTERS = {
  start: {
    title: '🚀 התחלה מהירה',
    content: () => {
      const steps = [
        ['➕ לחץ "הוסף אירוע"','הכפתור הכחול במסך הראשי'],
        ['📝 הכנס שם ותאריך','שם האדם + תאריך האירוע'],
        ['🎉 בחר סוג אירוע','יום הולדת, אזכרה, חתונה ועוד 11 סוגים'],
        ['👥 בחר קבוצה','משפחה / חברים / עבודה...'],
        ['💾 שמור ותקבל תזכורות!','האפליקציה תזכיר לך לפני כל אירוע'],
      ];
      return '<div style="background:rgba(var(--acc-rgb),0.1);border:1px solid var(--acc-border);border-radius:var(--rs);padding:10px 12px;margin-bottom:14px;text-align:center;font-size:12px;color:var(--acc-light);">תוך 30 שניות תוסיף את האירוע הראשון שלך!</div>' +
        steps.map((s,i) => '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;"><div class="step-num">' + (i+1) + '</div><div><div style="font-size:13px;font-weight:500;">' + s[0] + '</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">' + s[1] + '</div></div></div>').join('') +
        '<div class="tip-card"><div style="font-size:11px;color:#fbbf24;font-weight:500;margin-bottom:4px;">⭐ טיפ חכם</div><div style="font-size:11px;color:var(--muted);">לחץ "שמור וערוך פרטים" להוסיף מיד טלפון, מתנה ותזכורות!</div></div>' +
        '<button class="btn-primary" onclick="openAddForm()">➕ נסה עכשיו!</button>';
    }
  },
  events: {
    title: '🎉 ניהול אירועים',
    content: () => {
      const items = [
        ['🎉 11 סוגי אירועים','יום הולדת, חתונה, אזכרה, טסט, תור רפואי ועוד'],
        ['👥 קבוצות','משפחה / חברים / עבודה — לסינון מהיר'],
        ['📅 לוח שנה','לחץ על יום לראות אירועים. נקודה סגולה = אירוע'],
        ['🔥 האירוע הקרוב','הכרטיס בראש המסך מציג תמיד מה הבא'],
        ['✏️ עריכה','לחץ "עוד ▼" על כרטיס ← "ערוך"'],
        ['🔔 תזכורות','כל אירוע מקבל תזכורת אוטומטית יום לפני'],
      ];
      return items.map(i => '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">' + i[0] + '</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">' + i[1] + '</div></div></div>').join('');
    }
  },
  gifts: {
    title: '🎁 מתנות ותקציב',
    content: () => {
      const items = [
        ['💰 הגדרת תקציב','הכנס תקציב בטופס האירוע'],
        ['🛒 רעיונות למתנה','בחר מ-22 קטגוריות מוכנות'],
        ['✅ מעקב קנייה','לחץ "⏳ לביצוע" כדי לסמן כנקנה'],
        ['🔍 חיפוש מתנות','כפתורי חנויות מפנים ישר לחיפוש'],
        ['📊 דוח תקציב','הגדרות ← הגדרות תקציב'],
      ];
      return items.map(i => '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">' + i[0] + '</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">' + i[1] + '</div></div></div>').join('');
    }
  },
  greetings: {
    title: '💬 ברכות',
    content: () =>
      '<div style="font-size:13px;font-weight:500;margin-bottom:10px;">5 ברכות לכל סוג אירוע</div>' +
      '<div style="font-size:12px;color:var(--muted);line-height:1.7;margin-bottom:12px;">לכל סוג אירוע יש 5 וריאנטים שונים. לחץ "הבא ›" על הכרטיס כדי לעבור ביניהם.</div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">📱 שליחה בוואטסאפ</div><div style="font-size:11px;color:var(--muted);">לחיצה אחת שולחת ישר לוואטסאפ</div></div></div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">✏️ עריכת ברכות</div><div style="font-size:11px;color:var(--muted);">הגדרות ← מערכת ← ברכות קבועות</div></div></div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">📝 ברכות אישיות</div><div style="font-size:11px;color:var(--muted);">כתוב ברכות משלך — עד 5 ברכות</div></div></div>',
  },
  notif: {
    title: '🔔 התראות',
    content: () =>
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">📅 יום לפני</div><div style="font-size:11px;color:var(--muted);">התראה אוטומטית יום לפני כל אירוע</div></div></div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">✏️ מותאם אישית</div><div style="font-size:11px;color:var(--muted);">הגדר כמה ימים לפני ובאיזו שעה</div></div></div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">🎁 תזכורת מתנה</div><div style="font-size:11px;color:var(--muted);">תזכורת שבועיים לפני — לקנות מתנה</div></div></div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">🔕 שעות שקט</div><div style="font-size:11px;color:var(--muted);">הגדר שעות ללא הפרעה</div></div></div>',
  },
  backup: {
    title: '💾 גיבוי וייבוא',
    content: () =>
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">📥 ייבוא ICS</div><div style="font-size:11px;color:var(--muted);">ייבא מגוגל קלנדר, אפל, אאוטלוק</div></div></div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">📘 ייבוא פייסבוק</div><div style="font-size:11px;color:var(--muted);">ייבא ימי הולדת של חברים</div></div></div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">📤 ייצוא גיבוי</div><div style="font-size:11px;color:var(--muted);">שמור קובץ JSON לשחזור מלא</div></div></div>' +
      '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">🔄 שחזור</div><div style="font-size:11px;color:var(--muted);">החלף טלפון? שחזר את כל הנתונים</div></div></div>',
  },
  secrets: {
    title: '⭐ פיצ`רים נסתרים',
    content: () => {
      const items = [
        ['📅 לוח שנה אינטראקטיבי','לחץ על כל יום לראות אירועים'],
        ['💬 5 ברכות לכל אירוע','לחץ "הבא ›" לעבור ביניהן'],
        ['🎨 11 ערכות צבע','כולל color picker חופשי!'],
        ['📸 תמונה לאיש קשר','הוסף תמונה, גלריה, או אמוג\'י'],
        ['🔍 חיפוש לפי קבוצה','לחץ קבוצה בחיפוש לראות את כולם'],
        ['🌓 מצב בהיר/כהה','הגדרות ← מראה'],
        ['🔤 גופן גדול','הגדרות ← משתמש ← גופן גדול'],
      ];
      return '<div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:var(--rs);padding:10px;margin-bottom:12px;font-size:12px;color:var(--muted);text-align:center;">דברים שרוב המשתמשים לא מגלים!</div>' +
        items.map(i => '<div class="detail-row"><div><div style="font-size:13px;font-weight:500;">' + i[0] + '</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">' + i[1] + '</div></div></div>').join('');
    }
  },
};

function openGuideChapter(key) {
  const ch = CHAPTERS[key]; if (!ch) return;
  document.getElementById('chapter-title').textContent = ch.title;
  document.getElementById('chapter-content').innerHTML = ch.content();
  openScreen('screen-guide-chapter');
}

// ========== NOTIFICATIONS ==========
function scheduleNotif(ev) {
  if (!settings.notifEnabled || !('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;
  const notifDays = [];
  if (settings.notifDayBefore) notifDays.push(1);
  if (settings.notifWeekBefore) notifDays.push(7);
  if (settings.giftReminder) notifDays.push(settings.giftReminderDays || 14);
  if (!notifDays.length) return;

  navigator.serviceWorker.ready.then(reg => {
    const today = new Date(); today.setHours(0,0,0,0);
    // חשב את תאריך האירוע הבא בצורה נכונה
    const parts = ev.date.split('-');
    const evMonth = parseInt(parts[1]) - 1;
    const evDay = parseInt(parts[2]);
    const evYear = parseInt(parts[0]);

    notifDays.forEach(n => {
      let eventDate;
      if (getRecurrence(ev.type) === 'yearly') {
        // אירוע שנתי — מצא את המועד הבא
        eventDate = new Date(today.getFullYear(), evMonth, evDay);
        if (eventDate <= today) eventDate.setFullYear(today.getFullYear() + 1);
      } else {
        // אירוע חד פעמי
        eventDate = new Date(evYear, evMonth, evDay);
      }
      const notifDate = new Date(eventDate);
      notifDate.setDate(notifDate.getDate() - n);
      notifDate.setHours(9, 0, 0, 0);
      const ms = notifDate - new Date();
      if (ms < 0) return; // תאריך עבר
      setTimeout(() => {
        reg.showNotification('לא שכחתי 🔔', {
          body: ev.name + ' — ' + getLabel(ev.type, ev.customType) +
            (n === 1 ? ' מחר!' : ' בעוד ' + n + ' ימים'),
          icon: 'icon-192.png', tag: 'ev-' + ev.id + '-' + n, dir: 'rtl',
        });
      }, ms);
    });
  });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  // splash
  setTimeout(() => {
    const s = document.getElementById('splash');
    s.classList.add('hide');
    setTimeout(() => s.style.display = 'none', 500);
  }, 1500);

  // apply theme & mode
  applyTheme(settings.theme || 'purple');
  if (settings.mode === 'light') document.body.classList.add('light-mode');
  if (settings.largeFont) { const sz = settings.fontSizePx || 18; document.documentElement.style.fontSize=sz+'px'; document.body.classList.add('large-font'); }

  // init gift tags
  initGiftTags();
  document.getElementById('inp-gift-idea').addEventListener('input', updateGiftDisplay);
  document.getElementById('inp-name').addEventListener('input', updateFormAvatar);

  // service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then(p => { if (p === 'granted') events.forEach(scheduleNotif); });
      }
    });
  }

  // scroll to top button
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  // עדכן מצב toggle גופן גדול
  const togFont = document.getElementById('tog-font');
  if (togFont && settings.largeFont) togFont.classList.add('on');

  // render main
  renderMain();
});

// ========== ברכה חופשית ==========
function openFreeGreet(id) {
  const el = document.getElementById('free-greet-' + id);
  if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
}

function sendFreeGreet(id) {
  const ev = events.find(e => e.id === id); if (!ev) return;
  const ta = document.getElementById('free-greet-ta-' + id);
  const text = ta ? ta.value.trim() : '';
  if (!text) { alert('הכנס ברכה'); return; }
  playSound('greet');
  const phone = (ev.phone || '').replace(/\D/g,'');
  const url = phone ? 'https://wa.me/972' + phone.replace(/^0/,'') + '?text=' + encodeURIComponent(text) : 'https://wa.me/?text=' + encodeURIComponent(text);
  window.open(url, '_blank');
}

function copyFreeGreet(id) {
  const ta = document.getElementById('free-greet-ta-' + id);
  const text = ta ? ta.value.trim() : '';
  if (!text) { alert('הכנס ברכה'); return; }
  playSound('greet');
  navigator.clipboard.writeText(text).then(() => alert('הועתק! 📋'));
}

function useMyGreeting(id, idx) {
  const g = myGreetings.filter(x=>x)[idx];
  if (!g) return;
  const ev = events.find(e => e.id === id); if (!ev) return;
  // פתח שדה חופשי עם הברכה
  const freeEl = document.getElementById('free-greet-' + id);
  if (freeEl) {
    freeEl.style.display = 'block';
    const ta = document.getElementById('free-greet-ta-' + id);
    if (ta) ta.value = g.replace(/{name}/g, ev.name || '');
  }
}

// ========== סינון ומיון מהיר במסך הראשי ==========
function renderFilterBar() {
  const el = document.getElementById('main-filter-bar');
  if (!el) return;
  const filter = settings.defaultFilter || '30';
  const sort = settings.defaultSort || 'date';
  el.innerHTML =
    '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
    '<div class="chip' + (filter==='30'?' active':'') + '" onclick="setQuickFilter(\'30\')">⏳ 30 יום</div>' +
    '<div class="chip' + (filter==='future'?' active':'') + '" onclick="setQuickFilter(\'future\')">📅 עתידיים</div>' +
    '<div class="chip' + (filter==='all'?' active':'') + '" onclick="setQuickFilter(\'all\')">♾️ הכל</div>' +
    '<div class="chip' + (filter==='past'?' active':'') + '" onclick="setQuickFilter(\'past\')">📂 שעברו</div>' +
    '<div class="chip' + (sort==='date'?' active':'') + '" onclick="setQuickSort(\'date\')">📅 תאריך</div>' +
    '<div class="chip' + (sort==='name'?' active':'') + '" onclick="setQuickSort(\'name\')">🔤 שם</div>' +
    '</div>';
}

function setQuickFilter(f) {
  settings.defaultFilter = f;
  saveSettings();
  const enriched = events.map(ev => ({ ...ev, ...calcDays(ev) }));
  renderFilterBar();
  renderEventsList(enriched);
}

function setQuickSort(s) {
  settings.defaultSort = s;
  saveSettings();
  const enriched = events.map(ev => ({ ...ev, ...calcDays(ev) }));
  renderFilterBar();
  renderEventsList(enriched);
}

// ========== ברכות אישיות בכרטיס ==========
const myGreetCardIdx = {};

function nextMyGreet(id) {
  const filtered = myGreetings.filter(g=>g);
  if (!filtered.length) return;
  myGreetCardIdx[id] = ((myGreetCardIdx[id]||0) + 1) % filtered.length;
  const ev = events.find(e=>e.id===id); if (!ev) return;
  const text = filtered[myGreetCardIdx[id]||0].replace(/{name}/g, ev.name||'');
  const el = document.getElementById('my-greet-text-'+id);
  if (el) el.textContent = text;
  // גם עדכן textarea
  const ta = document.getElementById('free-greet-ta-'+id);
  if (ta && ta.style.display !== 'none') ta.value = text;
  playSound('greet');
}

function toggleFreeGreet(id) {
  const ta = document.getElementById('free-greet-ta-'+id);
  const disp = document.getElementById('my-greet-text-'+id);
  if (!ta) return;
  const isOpen = ta.style.display !== 'none';
  ta.style.display = isOpen ? 'none' : 'block';
  if (disp) disp.style.display = isOpen ? 'block' : 'none';
  if (!isOpen) {
    // מלא textarea עם הטקסט הנוכחי
    const curText = disp ? disp.textContent : '';
    ta.value = curText === 'לחץ ✏️ לכתיבת ברכה חופשית' ? '' : curText;
    ta.focus();
  } else {
    // שמור טקסט חופשי ב-display
    if (disp && ta.value.trim()) disp.textContent = ta.value.trim();
  }
}

function getMyGreetText(id) {
  const ta = document.getElementById('free-greet-ta-'+id);
  const disp = document.getElementById('my-greet-text-'+id);
  if (ta && ta.style.display !== 'none' && ta.value.trim()) return ta.value.trim();
  if (disp && disp.textContent !== 'לחץ ✏️ לכתיבת ברכה חופשית') return disp.textContent;
  return '';
}

function sendMyGreetOrFree(id) {
  const ev = events.find(e=>e.id===id); if (!ev) return;
  const text = getMyGreetText(id);
  if (!text) { alert('אין ברכה. לחץ ✏️ לכתיבת ברכה או בחר ברכה אישית.'); return; }
  playSound('greet');
  const phone = (ev.phone||'').replace(/\D/g,'');
  const url = phone ? 'https://wa.me/972'+phone.replace(/^0/,'')+'?text='+encodeURIComponent(text) : 'https://wa.me/?text='+encodeURIComponent(text);
  window.open(url, '_blank');
}

function copyMyGreetOrFree(id) {
  const text = getMyGreetText(id);
  if (!text) { alert('אין ברכה. לחץ ✏️ לכתיבת ברכה.'); return; }
  playSound('greet');
  navigator.clipboard.writeText(text).then(() => alert('הועתק! 📋'));
}
