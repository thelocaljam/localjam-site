// .github/scripts/gig-reminder.js
// Reads content/site.json, finds PUBLIC gigs that are REMIND_DAYS_BEFORE days away,
// and sends a reminder email to your Brevo list. Runs daily via GitHub Actions.
const fs = require('fs');

const API          = process.env.BREVO_API_KEY;
const LIST         = parseInt(process.env.BREVO_LIST_ID || '0', 10);
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_NAME  = process.env.SENDER_NAME || 'The Local Jam';
const SITE         = (process.env.SITE_URL || '').replace(/\/+$/, '');
const FB = 'https://www.facebook.com/profile.php?id=100095570163921';
const IG = 'https://www.instagram.com/thelocaljamband/';
const YT = 'https://www.youtube.com/@thelocaljam';
const HEADER_IMG   = process.env.HEADER_IMAGE_URL || '';
const DAYS         = parseInt(process.env.REMIND_DAYS_BEFORE || '2', 10);

if (!API || !LIST || !SENDER_EMAIL) {
  console.log('⚠️  Missing BREVO_API_KEY / BREVO_LIST_ID / SENDER_EMAIL — skipping. Fill these in first.');
  process.exit(0);
}

const data  = JSON.parse(fs.readFileSync('content/site.json', 'utf8'));
const shows = (data.shows && data.shows.list) || [];

const now = new Date();                                   // runner TZ is America/New_York (set in the workflow)
const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + DAYS);
const pad = n => String(n).padStart(2, '0');
const targetStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;

const gigs = shows.filter(s => s && s.date === targetStr && s.tag !== 'private');
if (!gigs.length) { console.log(`No public gigs on ${targetStr} — nothing to send.`); process.exit(0); }

const WD = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MO = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const niceDate = ymd => { const [y,m,d] = ymd.split('-').map(Number); const dt = new Date(y, m-1, d); return `${WD[dt.getDay()]}, ${MO[dt.getMonth()]} ${dt.getDate()}`; };
const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function buildEmail(g) {
  const dateLine = niceDate(g.date);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EDE5D3;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">We're playing ${esc(dateLine)} — hope to see you there!</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDE5D3;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;border-radius:14px;overflow:hidden;">
${HEADER_IMG ? `<tr><td style="padding:0;line-height:0;"><a href="${SITE}"><img src="${HEADER_IMG}" alt="The Local Jam" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>` : ''}
<tr><td style="padding:34px 36px 4px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
  <div style="font-family:'Courier New',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#E39A2E;font-weight:bold;">Coming up</div>
  <h1 style="margin:12px 0 0;font-size:27px;line-height:1.15;color:#232A20;font-weight:800;">We're playing ${esc(dateLine)} 🎸</h1>
</td></tr>
<tr><td style="padding:20px 36px 0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F1E4;border:1px solid #E39A2E;border-radius:12px;"><tr><td style="padding:18px 20px;text-align:center;">
    <div style="font-size:20px;font-weight:800;color:#232A20;">${esc(g.venue || '')}</div>
    <div style="font-size:15px;color:#5E6353;margin-top:5px;">${esc(g.loc || '')}${g.time ? ` &middot; ${esc(g.time)}` : ''}</div>
  </td></tr></table>
</td></tr>
<tr><td style="padding:22px 40px 0;font-family:Arial,Helvetica,sans-serif;text-align:center;font-size:16px;line-height:1.6;color:#4a5147;">
  Come on out, grab a drink, and sing along. Hope to see you there!
</td></tr>
<tr><td align="center" style="padding:26px 36px 6px;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#E39A2E" style="border-radius:100px;">
    <a href="${SITE}/#shows" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#17211B;text-decoration:none;border-radius:100px;">See all our shows &rarr;</a>
  </td></tr></table>
</td></tr>
<tr><td style="padding:26px 36px;background:#17211B;font-family:Arial,Helvetica,sans-serif;text-align:center;">
  <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:1px;">THE LOCAL JAM</div>
  <div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:6px;">A Hudson Valley cover band &middot; Since 2017</div>
  <div style="margin-top:14px;"><a href="${SITE}" style="color:#E39A2E;font-size:13px;text-decoration:none;">Website</a>&nbsp;&middot;&nbsp;<a href="${FB}" style="color:#E39A2E;font-size:13px;text-decoration:none;">Facebook</a>&nbsp;&middot;&nbsp;<a href="${IG}" style="color:#E39A2E;font-size:13px;text-decoration:none;">Instagram</a>&nbsp;&middot;&nbsp;<a href="${YT}" style="color:#E39A2E;font-size:13px;text-decoration:none;">YouTube</a></div>
  <div style="font-size:11px;color:rgba(255,255,255,.45);margin-top:16px;"><a href="{{ unsubscribe }}" style="color:rgba(255,255,255,.6);">Unsubscribe</a></div>
</td></tr>
</table></td></tr></table></body></html>`;
}

async function sendCampaign(subject, htmlContent, tag) {
  const create = await fetch('https://api.brevo.com/v3/emailCampaigns', {
    method: 'POST',
    headers: { 'api-key': API, 'content-type': 'application/json', 'accept': 'application/json' },
    body: JSON.stringify({
      name: `Gig reminder — ${tag}`.slice(0, 120),
      subject, type: 'classic',
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      htmlContent,
      recipients: { listIds: [LIST] }
    })
  });
  const cj = await create.json().catch(() => ({}));
  if (!create.ok) { console.error('❌ Create campaign failed:', create.status, JSON.stringify(cj)); process.exit(1); }
  const send = await fetch(`https://api.brevo.com/v3/emailCampaigns/${cj.id}/sendNow`, {
    method: 'POST', headers: { 'api-key': API, 'accept': 'application/json' }
  });
  if (!send.ok) { console.error('❌ sendNow failed:', send.status, await send.text().catch(() => '')); process.exit(1); }
  console.log(`✅ Sent reminder #${cj.id}: ${subject}`);
}

(async () => {
  for (const g of gigs) {
    const subject = `🎸 We're playing ${niceDate(g.date)} — hope to see you there!`;
    await sendCampaign(subject, buildEmail(g), `${g.date} ${g.venue || ''}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
