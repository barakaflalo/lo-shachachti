# 📅 מדריך הגדרת Google Calendar Sync
### לאפליקציה "לא שכחתי" v3.0

---

## מה זה נותן?

- **ייבוא אוטומטי** — כל האירועים מגוגל קלנדר נכנסים לאפליקציה
- **ייצוא** — כפתור 📅 בכל כרטיס שולח ישירות לגוגל
- **מזהה סוגי אירועים** — יום הולדת, אזכרה, תור רפואי, טיול
- **ללא שרת** — הכל ישיר בין הטלפון לגוגל, פרטי לחלוטין

---

## שלב 1 — צור Google Cloud Project

1. כנס ל: https://console.cloud.google.com
2. **Select a project** (ראש הדף) ← **New Project**
3. שם: `lo-shachachti` ← **Create**

---

## שלב 2 — הפעל Google Calendar API

1. תפריט שמאל: **APIs & Services → Library**
2. חפש: `Google Calendar API`
3. לחץ ← **Enable**

---

## שלב 3 — OAuth Consent Screen

1. **APIs & Services → OAuth consent screen**
2. בחר: **External** ← **Create**
3. App name: `לא שכחתי`
4. User support email: האימייל שלך
5. Developer contact: האימייל שלך
6. **Save and Continue** (3 פעמים)
7. שלב **Test users** ← **Add Users** ← הוסף את האימייל שלך
8. **Save and Continue**

---

## שלב 4 — צור OAuth Client ID

1. **APIs & Services → Credentials**
2. **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `lo-shachachti-web`
5. **Authorized JavaScript origins** ← Add URI:
   ```
   https://barakaflalo.github.io
   ```
6. **Authorized redirect URIs** ← Add URI:
   ```
   https://barakaflalo.github.io/lo-shachachti/
   ```
7. **Create**

---

## שלב 5 — העתק Client ID

יופיע חלון. העתק את:
```
Client ID: 123456789-abcdefghijk.apps.googleusercontent.com
```
(ה-Client Secret לא נדרש)

---

## שלב 6 — חבר לאפליקציה

1. פתח: **https://barakaflalo.github.io/lo-shachachti**
2. **הגדרות** ← **סנכרון גוגל קלנדר**
3. **התחבר עם גוגל**
4. קרא את המדריך שיופיע ← **מוכן — התחבר עם גוגל**
5. הזן את ה-Client ID
6. גוגל יבקש הרשאה ← **Allow**
7. חזרה לאפליקציה ← **סנכרן עכשיו** 🎉

---

## שאלות נפוצות

**האם הנתונים שלי בטוחים?**
כן. הנתונים עוברים ישירות בין הטלפון לגוגל. GitHub Pages לא רואה שום מידע.

**רק אני יכול להשתמש?**
בזמן Testing — כן, רק משתמשים שהוספת. לשחרור לציבור צריך verification של גוגל (~5 ימי עסקים).

**הטוקן פג תוקף?**
לאחר ~60 דקות. תצטרך להתחבר מחדש. זה נורמלי.

**אפשר לנתק?**
כן. הגדרות ← סנכרון גוגל קלנדר ← התנתק מגוגל.

---

*לא שכחתי v3.0 · AppNest · ברק אפללו*
*https://barakaflalo.github.io/lo-shachachti*
