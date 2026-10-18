import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext, Fragment } from "react";

// ════════════════════════════════════════════════════════════
//  ChatAIbot — панель управления (админка + кабинет клиента)
// ════════════════════════════════════════════════════════════
const API = (import.meta.env && import.meta.env.VITE_API_URL) || "https://api.neurokaldristal.ru";

const CSS = `
:root{
  --bg:#0A0C10;--side:#0D1015;--card:#12151B;--card2:#161A21;--raised:#181C24;--input:#0F1217;
  --line:#1E222B;--line2:#262B35;--line3:#1B1F27;
  --text:#ECEEF2;--dim:#A4AAB6;--faint:#858B98;--mute:#5C6270;
  --accent:#2F63E6;--accent-h:#3A6EF0;--accent-soft:rgba(47,99,230,.16);--accent-text:#8DA9F1;
  --ok:#34D399;--ok-soft:rgba(52,211,153,.12);--warn:#F5B544;--warn-soft:rgba(245,181,68,.14);
  --bad:#F87171;--bad-soft:rgba(248,113,113,.14);--sky:#7DD3FC;
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text)}
body{font-family:'Manrope','Segoe UI',system-ui,-apple-system,sans-serif;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:var(--accent-text);text-decoration:none}a:hover{color:#B7C9F7}
button,input,select,textarea{font-family:inherit;color:inherit}
:focus-visible{outline:2px solid var(--accent-text);outline-offset:2px}
input::placeholder,textarea::placeholder{color:var(--faint)}
::-webkit-scrollbar{width:9px;height:9px}::-webkit-scrollbar-thumb{background:#262B35;border-radius:6px}::-webkit-scrollbar-track{background:transparent}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace}
.app{display:flex;min-height:100vh}
.side{width:240px;flex-shrink:0;background:var(--side);border-right:1px solid var(--line3);display:flex;flex-direction:column;gap:4px;padding:20px 14px;position:sticky;top:0;height:100vh;overflow-y:auto}
.main{flex:1;min-width:0;padding:28px 36px 56px}
.wrap{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
.brand{display:flex;align-items:center;gap:12px;padding:4px 10px 22px}
.brand-logo{width:36px;height:36px;border-radius:11px;background:linear-gradient(135deg,#8B5CF6,#3B82F6);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
.tile{width:38px;height:38px;border-radius:11px;background:#1B2029;color:#C9CED8;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-transform:uppercase}
.nav-a{display:flex;align-items:center;gap:12px;min-height:44px;padding:0 12px;border-radius:10px;font-size:14px;font-weight:600;color:var(--dim);cursor:pointer;border:0;background:transparent;width:100%;text-align:left}
.nav-a:hover{background:#141820;color:var(--text)}
.nav-a.on{color:var(--accent-text);background:var(--accent-soft);font-weight:700}
.nav-badge{margin-left:auto;min-width:20px;height:20px;padding:0 6px;border-radius:10px;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px}
.card.tight{padding:16px}
.h1{margin:0;font-size:28px;font-weight:800;letter-spacing:-.6px}
.h2{margin:0;font-size:16px;font-weight:800;letter-spacing:-.2px}
.h3{margin:0;font-size:15px;font-weight:800}
.sub{font-size:14px;color:var(--dim);margin:0}
.muted{color:var(--faint)}
.dim{color:var(--dim)}
.row{display:flex;align-items:center;gap:10px}
.between{display:flex;align-items:center;justify-content:space-between;gap:12px}
.wrapflex{display:flex;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line2);background:var(--raised);color:var(--text);font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,opacity .15s}
.btn:hover{background:#1E232D}
.btn:disabled{opacity:.55;cursor:default}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:800}
.btn.primary:hover{background:var(--accent-h)}
.btn.soft{background:var(--accent-soft);border-color:transparent;color:var(--accent-text);font-weight:800}
.btn.danger{background:transparent;border-color:rgba(248,113,113,.45);color:var(--bad)}
.btn.danger:hover{background:var(--bad-soft)}
.btn.ghost{background:transparent;border-color:transparent;color:var(--dim)}
.btn.ghost:hover{color:var(--text);background:#141820}
.btn.sm{min-height:36px;padding:0 12px;font-size:13px;border-radius:9px}
.btn.block{width:100%}
.inp{width:100%;min-height:44px;padding:0 12px;border-radius:10px;background:var(--input);border:1px solid var(--line2);color:var(--text);font-size:14px;font-weight:600;outline:none}
.inp:focus{border-color:var(--accent)}
textarea.inp{padding:10px 12px;line-height:1.55;resize:vertical;min-height:88px;font-weight:500}
select.inp{padding:0 10px}
.lbl{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:var(--dim)}
.hint{font-size:12.5px;line-height:1.5;color:var(--faint);font-weight:500}
.chip{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:0 14px;border-radius:20px;border:1px solid var(--line2);background:transparent;color:var(--dim);font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
.chip.on{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-text)}
.seg{display:inline-flex;padding:4px;gap:4px;border-radius:12px;background:var(--card);border:1px solid var(--line);flex-wrap:wrap}
.seg button{min-height:36px;padding:0 14px;border-radius:9px;border:0;background:transparent;color:var(--dim);font-size:13.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.seg button.on{background:#232833;color:var(--text);font-weight:800}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:8px;font-size:12px;font-weight:800;white-space:nowrap}
.dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;display:inline-block}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:14px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:10px;min-width:0}
.kpi-l{font-size:13px;font-weight:600;color:var(--dim)}
.kpi-v{font-size:28px;font-weight:800;letter-spacing:-.8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kpi-s{font-size:12.5px;color:var(--faint);display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center}
.up{color:var(--ok);font-weight:800}.down{color:var(--bad);font-weight:800}
.cols{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}
.col{display:flex;flex-direction:column;gap:16px;min-width:0}
.list-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--line3)}
.list-row:first-child{border-top:0}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);overflow-x:auto}
.tabs button{min-height:44px;padding:0 14px;border:0;background:transparent;color:var(--dim);font-size:14px;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}
.tabs button.on{color:var(--text);font-weight:800;border-bottom-color:var(--accent)}
.switch{width:56px;height:44px;border:0;padding:0;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.switch .tr{position:relative;display:block;width:40px;height:24px;border-radius:12px;background:#2A2F3A;transition:background .15s}
.switch .kn{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:9px;background:#A4AAB6;transition:left .15s,background .15s}
.switch.on .tr{background:var(--accent)}
.switch.on .kn{left:19px;background:#fff}
.switch:disabled{opacity:.5;cursor:default}
.draft{border:1.5px dashed var(--warn);background:rgba(245,181,68,.06);border-radius:14px}
.toast{position:fixed;top:18px;right:18px;z-index:500;background:#1B2029;border:1px solid var(--line2);color:var(--text);padding:12px 16px;border-radius:12px;font-size:14px;font-weight:700;box-shadow:0 14px 40px rgba(0,0,0,.45);display:flex;gap:10px;align-items:center;max-width:min(420px,calc(100vw - 32px));animation:tin .2s ease}
@keyframes tin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.overlay{position:fixed;inset:0;background:rgba(5,6,9,.66);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px;animation:tin .15s ease}
.modal{width:100%;max-width:520px;max-height:calc(100vh - 32px);overflow:auto;background:var(--card);border:1px solid var(--line2);border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:16px;box-shadow:0 30px 80px rgba(0,0,0,.5)}
.skel{background:linear-gradient(90deg,#141820,#1A1F28,#141820);background-size:200% 100%;animation:sk 1.2s linear infinite;border-radius:10px}
@keyframes sk{from{background-position:200% 0}to{background-position:-200% 0}}
.spin{width:18px;height:18px;border:2px solid #2A2F3A;border-top-color:var(--accent-text);border-radius:50%;animation:sp .7s linear infinite;display:inline-block}
@keyframes sp{to{transform:rotate(360deg)}}
.tbl-row{display:grid;align-items:center}
.banner{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:14px 18px;border-radius:12px}
.mtop{display:none}
.mtabs{display:none}
.scroll-x{overflow-x:auto}
.empty{padding:30px 16px;text-align:center;color:var(--dim);font-size:14px;line-height:1.5}
.bubble{padding:10px 12px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.only-m{display:none}
.kpis5{grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr))}
.act-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:14px}
.sec-t{font-size:12px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--dim);margin:0}
.ord-wrap{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:16px;align-items:start}
.ord-board{display:grid;grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));gap:12px;align-items:start}
.ord-col{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px;min-height:220px}
.ord-card{display:flex;flex-direction:column;gap:8px;width:100%;text-align:left;padding:14px;border-radius:12px;border:1px solid var(--line2);background:var(--card2);color:var(--text);cursor:pointer;font-size:14px}
.ord-card:hover{border-color:#343B48}
.ord-card.on{border:2px solid var(--accent);padding:13px}
.ord-aside{position:sticky;top:20px}
.dlg-grid{display:grid;grid-template-columns:300px minmax(0,1fr) 290px;height:calc(100vh - 170px);min-height:560px;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.dlg-grid>*{min-height:0;min-width:0}
.dlg-list{display:flex;flex-direction:column;border-right:1px solid var(--line);min-height:0}
.dlg-row{display:flex;gap:12px;align-items:flex-start;width:100%;padding:14px 16px;border:0;border-bottom:1px solid var(--line3);background:transparent;text-align:left;cursor:pointer;color:var(--text);font-size:14px}
.dlg-row:hover{background:#141820}
.dlg-row.on{background:var(--accent-soft)}
.dlg-chat{display:flex;flex-direction:column;min-height:0;min-width:0}
.dlg-aside{border-left:1px solid var(--line);padding:18px;overflow-y:auto;display:flex;flex-direction:column;gap:18px}
.dlg-info{display:none !important}
.msgs{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:6px;min-height:0}
.daysep{align-self:center;font-size:12px;font-weight:700;color:var(--dim);background:#1A1F28;padding:4px 10px;border-radius:8px;margin:10px 0 6px}
.fullchat{position:fixed;inset:0;z-index:80;background:var(--bg);display:flex;flex-direction:column}
.hscroll{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none}
.hscroll::-webkit-scrollbar{display:none}
.cat-row{display:flex;align-items:center;gap:14px;padding:12px 20px;border-top:1px solid var(--line3);cursor:pointer}
.cat-row:hover{background:#141820}
.cat-row.on{background:var(--accent-soft)}
.ph{width:52px;height:52px;border-radius:10px;background:#1B2029;color:var(--faint);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.savebar{position:sticky;bottom:16px;z-index:40;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 16px;border-radius:14px;background:#1B2029;border:1px solid var(--line2);box-shadow:0 14px 40px rgba(0,0,0,.45)}
.cab-2{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:16px;align-items:start}
@media (max-width:1240px){
  .dlg-grid{grid-template-columns:280px minmax(0,1fr)}
  .dlg-aside{display:none !important}
  .dlg-info{display:inline-flex !important}
}
@media (max-width:1180px){
  .ord-wrap{grid-template-columns:minmax(0,1fr)}
  .ord-aside{display:none}
  .cab-2{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:860px){
  .side{display:none}
  .main{padding:14px 16px 96px}
  .wrap{gap:16px}
  .h1{font-size:25px}
  .mtop{display:flex;align-items:center;gap:12px;padding:12px 16px;position:sticky;top:0;z-index:50;background:rgba(10,12,16,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line3)}
  .mtabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;z-index:60;padding:6px 8px calc(8px + env(safe-area-inset-bottom));background:rgba(13,16,21,.97);border-top:1px solid var(--line3);backdrop-filter:blur(12px)}
  .mtabs button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:52px;border:0;background:transparent;color:var(--dim);font-size:11.5px;font-weight:700;cursor:pointer}
  .mtabs button.on{color:var(--accent-text);font-weight:800}
  .mtabs .mb{position:absolute;top:3px;left:calc(50% + 6px);min-width:18px;height:18px;padding:0 5px;border-radius:9px;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}
  .kpi{padding:14px}
  .kpi-v{font-size:22px}
  .kpis,.kpis5{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .act-grid{gap:12px}
  .savebar{bottom:84px}
  .cat-row{padding:12px 14px;gap:12px}
  .msgs{padding:14px 14px}
  .card{padding:16px}
  .hide-m{display:none !important}
  .only-m{display:flex}
  .toast{left:16px;right:16px;top:12px}
  .modal{max-height:calc(100vh - 24px);padding:18px}
  .overlay.sheet{align-items:flex-end;padding:0}
  .overlay.sheet .modal{border-radius:18px 18px 0 0;max-width:none;padding-bottom:calc(18px + env(safe-area-inset-bottom))}
}
`;

// ── Иконки (линейные, без эмодзи) ──
const ICONS = {
  home: "M3 10.5 12 4l9 6.5|M5 9.5V20h14V9.5",
  bag: "M5 8h14l-1 12H6z|M9 8V6.5a3 3 0 0 1 6 0V8",
  chat: "M4 5h16v11H10l-6 4z",
  chart: "M5 20V11M12 20V5M19 20v-6",
  box: "M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z|M3.5 7.5 12 11.5l8.5-4M12 11.5v9",
  sliders: "M4 7h9M17 7h3M4 17h3M11 17h9|C15 7 2|C9 17 2",
  grid: "R4 4 7 7|R13 4 7 7|R4 13 7 7|R13 13 7 7",
  users: "C9 8.5 3.5|M3 20a6 6 0 0 1 12 0|M16 5.5a3.2 3.2 0 0 1 0 6.2M18 14.5a5.5 5.5 0 0 1 3 5.5",
  pulse: "M3 12h4l2.5-6 5 12 2.5-6h4",
  search: "C11 11 6.5|m20 20-4-4",
  plus: "M12 5v14M5 12h14",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  upload: "M12 15V4M7 9l5-5 5 5M5 20h14",
  check: "m5 12.5 4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6 6 18",
  left: "m15 5-7 7 7 7",
  right: "m9 6 6 6-6 6",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z|M10 20.5a2 2 0 0 0 4 0",
  edit: "M4 20h4L19 9l-4-4L4 16z|m13.5 6.5 4 4",
  user: "C12 8 3.5|M5 20a7 7 0 0 1 14 0",
  alert: "M12 4 2.8 19.5h18.4z|M12 10v4.5M12 17.5v.01",
  shield: "M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6z",
  send: "M12 19V5M6 11l6-6 6 6",
  plane: "M21 4 3 11l6 2.5L11.5 20l3-5 5.5 4z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  image: "R3.5 5 17 14 2|C9 10 1.6|m20.5 16-5-5-8 8",
  moon: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
  logout: "M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4|M10 16l-4-4 4-4M6 12h10",
  menu: "M4 7h16M4 12h16M4 17h16",
  refresh: "M20 11a8 8 0 0 0-14.5-4.5L4 8|M4 4v4h4|M4 13a8 8 0 0 0 14.5 4.5L20 16|M20 20v-4h-4",
  arrow: "M5 12h14M13 6l6 6-6 6",
  trash: "M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13",
  clock: "C12 12 8|M12 8v4l3 2",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1|M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  bot: "R5 8 14 11 3|M12 4v4|C9 13.5 1|C15 13.5 1|M9 17h6",
  pause: "M9 6v12M15 6v12",
  play: "M8 5v14l11-7z",
  hand: "M8 11V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3 14a1.5 1.5 0 0 1 2.4-1.8L8 15",
  question: "M4 5h16v11H10l-6 4z|M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4",
  copy: "R8 8 12 12 2|M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3",
  star: "m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z",
  db: "E12 6 7 2.5|M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6|M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5",
  server: "R4 4 16 7 2|R4 13 16 7 2|M8 7.5h.01M8 16.5h.01",
  sparkle: "M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M6.5 17.5 9 15M15 9l2.5-2.5",
  eye: "M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z|C12 12 3",
};

function Icon({ name, size = 20, sw = 1.8, style }) {
  const spec = ICONS[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, ...style }}>
      {spec.split("|").map((p, i) => {
        if (p.startsWith("C")) { const [cx, cy, r] = p.slice(1).split(" ").map(Number); return <circle key={i} cx={cx} cy={cy} r={r} />; }
        if (p.startsWith("R")) { const [x, y, w, h, rx] = p.slice(1).split(" ").map(Number); return <rect key={i} x={x} y={y} width={w} height={h} rx={rx || 1.5} />; }
        if (p.startsWith("E")) { const [cx, cy, rx, ry] = p.slice(1).split(" ").map(Number); return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} />; }
        return <path key={i} d={p} />;
      })}
    </svg>
  );
}

// ── Форматирование ──
const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_S = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const WDAYS = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const WD_S = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const MSK_OFFSET = 3 * 3600 * 1000;

function msk(ts) { const t = typeof ts === "number" ? ts : Date.parse(ts); return isNaN(t) ? null : new Date(t + MSK_OFFSET); }
function pad(n) { return String(n).padStart(2, "0"); }
function hhmm(ts) { const d = msk(ts); return d ? `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` : ""; }
function dayMonth(ts) { const d = msk(ts); return d ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : ""; }
function dayKey(ts) { const d = msk(ts); return d ? `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` : ""; }
function isToday(ts) { return dayKey(ts) === dayKey(Date.now()); }
function whenShort(ts) { if (!ts) return ""; return isToday(ts) ? hhmm(ts) : `${dayMonth(ts)}, ${hhmm(ts)}`; }
function todayTitle() { const d = msk(Date.now()); return `${WDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; }
function dateLabel(iso) { const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number); return `${d} ${MONTHS_S[m - 1]}`; }
function minsAgo(ts) { if (!ts && ts !== 0) return null; const t = typeof ts === "number" ? ts : Date.parse(ts); if (isNaN(t)) return null; return Math.max(0, Math.round((Date.now() - t) / 60000)); }
function agoText(ts) {
  const m = minsAgo(ts); if (m === null) return "";
  if (m < 1) return "только что"; if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} ч ${m % 60 ? (m % 60) + " мин" : ""}`.trim();
  return `${Math.floor(h / 24)} дн`;
}
function plural(n, one, few, many) { n = Math.abs(Math.round(n)); if (n % 10 === 1 && n % 100 !== 11) return one; if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) return few; return many; }
function num(n) { return Math.round(Number(n) || 0).toLocaleString("ru-RU"); }
function rub(n) { return `${num(n)} ₽`; }
function rubShort(n) { n = Number(n) || 0; if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1).replace(".", ",").replace(",0", "")} млн ₽`; if (Math.abs(n) >= 1e4) return `${(n / 1e3).toFixed(1).replace(".", ",").replace(",0", "")}к`; return rub(n); }
function secs(ms) { ms = Number(ms) || 0; return ms < 1000 ? `${Math.round(ms)} мс` : `${(ms / 1000).toFixed(1).replace(".", ",")} с`; }
function pctDelta(cur, prev) { if (!prev) return null; return Math.round(((cur - prev) / prev) * 100); }
function bytes(n) { n = Number(n) || 0; if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2).replace(".", ",")} ГБ`; if (n >= 1024 ** 2) return `${Math.round(n / 1024 ** 2)} МБ`; return `${Math.max(1, Math.round(n / 1024))} КБ`; }
function initials(name) { const w = String(name || "?").replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/); return ((w[0] || "?")[0] + (w[1] ? w[1][0] : (w[0] || "")[1] || "")).toUpperCase(); }
function cleanText(t) { return String(t || "").replace(/\[(ФОТО:[^\]]+|ОПЕРАТОР|оператор|ЧЕРНОВИК[^\]]*)\]/g, "").replace(/ЗАКАЗ ПРИНЯТ|ЗАЯВКА ПРИНЯТА/g, "").trim(); }
function tgLink(username) { return username ? `https://t.me/${String(username).replace(/^@/, "")}` : null; }

const MODE = {
  trainee: { label: "Стажёр", text: "Бот готовит каждый ответ, вы одобряете в один клик. Для первых дней, пока привыкаете." },
  mixed: { label: "Смешанный", text: "Простые вопросы бот закрывает сам. Сложные — присылает вам черновик ответа.", rec: true },
  auto: { label: "Автопилот", text: "Бот всегда отвечает сам. Вам приходят только заказы и просьбы позвать человека." },
};
const RULES = { delivery: "Доставка вне условий", discount: "Скидки и торг", missing: "Товара нет в каталоге", complaint: "Жалобы и возвраты", unsure: "Бот не уверен в ответе", big: "Крупный заказ" };
const ORDER_ST = {
  order: { new: "Новый", accepted: "Принят", cooking: "Собирается", delivering: "В пути", done: "Выполнен", rejected: "Отклонён" },
  lead: { new: "Новая", accepted: "Связались", cooking: "В работе", delivering: "В работе", done: "Закрыта", rejected: "Отказ" },
};
const ST_COLOR = { new: "var(--accent-text)", accepted: "#A4AAB6", cooking: "var(--warn)", delivering: "var(--sky)", done: "var(--ok)", rejected: "var(--bad)" };

// ── Контекст ──
const Ctx = createContext(null);
const useApp = () => useContext(Ctx);

function makeApi(token, onLogout) {
  async function req(method, path, body) {
    let r;
    try {
      r = await fetch(API + path, { method, headers: { "Content-Type": "application/json", "X-Admin-Password": token || "" }, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (e) { throw new Error("Сервер недоступен. Проверьте интернет."); }
    if (r.status === 401) { onLogout && onLogout(); throw new Error("Сессия закончилась — войдите снова"); }
    let data = null;
    try { data = await r.json(); } catch (e) { data = null; }
    if (!r.ok) throw new Error((data && (typeof data.detail === "string" ? data.detail : "Ошибка")) || `Ошибка сервера (${r.status})`);
    return data;
  }
  return {
    get: (p) => req("GET", p),
    post: (p, b) => req("POST", p, b || {}),
    download: async (p, filename) => {
      const r = await fetch(API + p, { headers: { "X-Admin-Password": token || "" } });
      if (!r.ok) throw new Error("Не удалось скачать файл");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    },
  };
}

// Загрузка данных страницы: без мигания при фоновом обновлении.
// live — как часто страница сама обновляется, когда на сервере что-то поменялось:
//   false — никогда (аналитика, каталог, настройки), число — не чаще раза в N мс.
function useLoad(fn, deps, live = 0) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const seq = useRef(0);
  const lastRun = useRef(0);
  const timer = useRef(null);
  const run = useCallback(async (silent) => {
    const my = ++seq.current;
    lastRun.current = Date.now();
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const d = await fn();
      if (my === seq.current) setState({ data: d, error: null, loading: false });
    } catch (e) {
      if (my === seq.current) setState((s) => ({ data: s.data, error: e.message || String(e), loading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { run(false); }, [run]);
  const { pulse } = useApp();
  const prevPulse = useRef(pulse);
  useEffect(() => {
    if (live !== false && prevPulse.current && pulse && prevPulse.current !== pulse) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => run(true), Math.max(0, lastRun.current + (live || 0) - Date.now()));
    }
    prevPulse.current = pulse;
  }, [pulse]); // eslint-disable-line
  useEffect(() => () => clearTimeout(timer.current), []);
  return { ...state, reload: () => run(true), setData: (d) => setState((s) => ({ ...s, data: typeof d === "function" ? d(s.data) : d })) };
}

// ── Базовые элементы ──
function Btn({ kind = "", size, block, icon, children, loading, ...p }) {
  return (
    <button type="button" className={`btn ${kind} ${size || ""} ${block ? "block" : ""}`} disabled={loading || p.disabled} {...p}>
      {loading ? <span className="spin" /> : icon ? <Icon name={icon} size={size === "sm" ? 16 : 18} sw={2} /> : null}
      {children}
    </button>
  );
}

function Switch({ on, onChange, label, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={label} className={`switch ${on ? "on" : ""}`} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange && onChange(!on); }}>
      <span className="tr"><span className="kn" /></span>
    </button>
  );
}

function Seg({ value, options, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

function Chip({ on, children, onClick }) {
  return (
    <button type="button" className={`chip ${on ? "on" : ""}`} aria-pressed={!!on} onClick={onClick}>
      {on && <Icon name="check" size={15} sw={2.6} />}{children}
    </button>
  );
}

function Pill({ color, bg, children, dot }) {
  return <span className="pill" style={{ color, background: bg || "#181C24" }}>{dot && <span className="dot" style={{ background: dot }} />}{children}</span>;
}

function Modal({ title, onClose, children, footer, sheet, wide }) {
  useEffect(() => {
    const f = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);
  return (
    <div className={`overlay ${sheet ? "sheet" : ""}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={wide ? { maxWidth: 720 } : null}>
        <div className="between">
          <h2 className="h2" style={{ fontSize: 18 }}>{title}</h2>
          {onClose && <button type="button" className="btn ghost sm" aria-label="Закрыть" onClick={onClose}><Icon name="x" size={18} /></button>}
        </div>
        {children}
        {footer && <div className="row" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </div>
  );
}

function Confirm({ title, text, ok = "Да", danger, onOk, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onClose} footer={<>
      <Btn onClick={onClose}>Отмена</Btn>
      <Btn kind={danger ? "danger" : "primary"} loading={busy} onClick={async () => { setBusy(true); try { await onOk(); onClose(); } catch (e) { setBusy(false); } }}>{ok}</Btn>
    </>}>
      <p className="sub" style={{ lineHeight: 1.55 }}>{text}</p>
    </Modal>
  );
}

function Empty({ icon = "sparkle", title, text, action }) {
  return (
    <div className="empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: "#161A21", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)" }}><Icon name={icon} size={20} /></span>
      {title && <div style={{ fontWeight: 800, color: "var(--text)" }}>{title}</div>}
      {text && <div style={{ maxWidth: 420 }}>{text}</div>}
      {action}
    </div>
  );
}

function Skeleton({ h = 120, style }) { return <div className="skel" style={{ height: h, ...style }} />; }

function PageSkeleton() {
  return (
    <div className="wrap">
      <Skeleton h={54} style={{ maxWidth: 360 }} />
      <div className="kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={118} />)}</div>
      <Skeleton h={320} />
    </div>
  );
}

function ErrorBox({ error, onRetry }) {
  return (
    <div className="card" style={{ borderColor: "rgba(248,113,113,.35)" }}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <span style={{ color: "var(--bad)" }}><Icon name="alert" /></span>
        <div style={{ flex: 1 }}>
          <div className="h3">Не получилось загрузить</div>
          <div className="hint" style={{ marginTop: 4 }}>{error}</div>
        </div>
        {onRetry && <Btn size="sm" onClick={onRetry} icon="refresh">Повторить</Btn>}
      </div>
    </div>
  );
}

function PageHead({ title, sub, right, back }) {
  return (
    <header className="between" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: "1 1 380px" }}>
        {back}
        <h1 className="h1">{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div className="row" style={{ flexWrap: "wrap" }}>{right}</div>}
    </header>
  );
}

function Delta({ cur, prev, suffix = "", invert, unit = "%" }) {
  if (prev === null || prev === undefined || prev === 0) return null;
  const d = unit === "%" ? pctDelta(cur, prev) : cur - prev;
  if (d === null) return null;
  const good = invert ? d < 0 : d > 0;
  if (d === 0) return <span className="muted">как раньше{suffix}</span>;
  return <span className={good ? "up" : "down"}>{d > 0 ? "▲" : "▼"} {unit === "%" ? `${Math.abs(d)}%` : `${num(Math.abs(d))}${unit}`}{suffix}</span>;
}

function Kpi({ label, value, children }) {
  return (
    <div className="kpi">
      <div className="kpi-l">{label}</div>
      <div className="kpi-v">{value}</div>
      {children && <div className="kpi-s">{children}</div>}
    </div>
  );
}

// ── Графики ──
function Bars({ data, height = 190, highlightLast = true, fmt = (v) => v, labelEvery, tipFmt, ariaLabel }) {
  const max = Math.max(1, ...data.map((d) => d.v));
  const n = data.length;
  const every = labelEvery || (n > 20 ? 7 : 1);
  return (
    <div role="img" aria-label={ariaLabel}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: n > 20 ? 3 : 6, height, borderBottom: "1px solid #2A2F3A" }}>
        {data.map((d, i) => {
          const last = highlightLast && i === n - 1;
          return (
            <div key={i} title={tipFmt ? tipFmt(d) : `${d.label}: ${fmt(d.v)}`} style={{ flex: "1 1 0", minWidth: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 5 }}>
              {last && d.v > 0 && <span style={{ fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>{fmt(d.v)}</span>}
              <div style={{ width: "100%", height: `${Math.max(d.v > 0 ? 2 : 0, (d.v / max) * (last ? 82 : 88))}%`, background: last ? "var(--accent-text)" : "var(--accent)", borderRadius: "4px 4px 0 0" }} />
            </div>
          );
        })}
      </div>
      <div aria-hidden="true" style={{ display: "flex", gap: n > 20 ? 3 : 6, marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: "1 1 0", minWidth: 0, textAlign: "center", fontSize: 11, color: i === n - 1 ? "var(--text)" : "var(--faint)", fontWeight: i === n - 1 ? 800 : 600, whiteSpace: "nowrap", overflow: "visible" }}>
            {(n - 1 - i) % every === 0 ? d.short || "" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ cur, prev, dates, height = 240 }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const n = cur.length;
  const max = Math.max(1, ...cur, ...(prev || []));
  const raw = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const norm = raw / mag;
  const stepV = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const top = Math.max(1, stepV * 4);
  const tickLabel = (t) => (t >= 1000 ? `${(t / 1000).toFixed(t % 1000 ? 1 : 0).replace(".", ",")}к` : String(Math.round(t)));
  const y = (v) => 230 - (v / top) * 210;
  const x = (i) => (n > 1 ? (i * 1000) / (n - 1) : 500);
  const pts = (arr) => arr.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const ticks = [0, 1, 2, 3, 4].map((i) => stepV * i);
  const labIdx = n <= 8 ? dates.map((_, i) => i) : [0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round(((n - 1) * 3) / 4), n - 1];
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };
  return (
    <div style={{ position: "relative", paddingLeft: 44, paddingRight: 8 }}>
      <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, height, width: 40, fontSize: 11.5, color: "var(--faint)" }}>
        {ticks.map((t) => <span key={t} style={{ position: "absolute", right: 6, top: (y(t) / 240) * height - 7 }}>{tickLabel(t)}</span>)}
      </div>
      <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ position: "relative" }}>
        <svg viewBox="0 0 1000 240" preserveAspectRatio="none" role="img" aria-label="Выручка по дням: этот период и прошлый" style={{ display: "block", width: "100%", height, overflow: "visible" }}>
          {ticks.map((t) => <line key={t} x1="0" x2="1000" y1={y(t)} y2={y(t)} stroke={t === 0 ? "#2A2F3A" : "#1E232D"} strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
          {prev && <polyline points={pts(prev)} fill="none" stroke="#6B7280" strokeWidth="2" strokeDasharray="6 5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
          <polyline points={pts(cur)} fill="none" stroke="var(--accent-text)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1="10" y2="230" stroke="#3A404C" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
        </svg>
        {hover !== null && (
          <div style={{ position: "absolute", top: 4, left: `${(x(hover) / 1000) * 100}%`, transform: `translateX(${hover > n / 2 ? "-105%" : "5%"})`, background: "#1B2029", border: "1px solid var(--line2)", borderRadius: 10, padding: "8px 10px", fontSize: 12.5, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 2 }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>{dateLabel(dates[hover])}</div>
            <div className="row" style={{ gap: 6 }}><span className="dot" style={{ background: "var(--accent-text)" }} />{rub(cur[hover])}</div>
            {prev && <div className="row" style={{ gap: 6, color: "var(--dim)" }}><span className="dot" style={{ background: "#6B7280" }} />{rub(prev[hover])} · раньше</div>}
          </div>
        )}
      </div>
      <div aria-hidden="true" style={{ position: "relative", height: 22, marginTop: 8, fontSize: 11.5, color: "var(--faint)" }}>
        {labIdx.map((i, k) => <span key={i} style={{ position: "absolute", left: `${(x(i) / 1000) * 100}%`, transform: k === 0 ? "none" : k === labIdx.length - 1 ? "translateX(-100%)" : "translateX(-50%)", whiteSpace: "nowrap" }}>{dateLabel(dates[i])}</span>)}
      </div>
    </div>
  );
}

function ShareBar({ pct, color = "var(--accent)" }) {
  return <span aria-hidden="true" style={{ display: "block", height: 8, borderRadius: 4, background: "#1A1F28", position: "relative", overflow: "hidden", flex: 1, minWidth: 30 }}><span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.max(0, Math.min(100, pct))}%`, borderRadius: 4, background: color }} /></span>;
}

function Heatmap({ heat }) {
  const max = Math.max(1, ...heat.flat());
  const alphas = [0.07, 0.2, 0.36, 0.56, 0.82];
  const color = (v) => { const lv = v === 0 ? 0 : Math.min(5, Math.ceil((v / max) * 5)); return lv === 5 ? "var(--accent-text)" : `rgba(47,99,230,${alphas[lv]})`; };
  const days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  return (
    <div className="scroll-x">
      <div role="img" aria-label="Когда клиенты пишут: дни недели и часы" style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 480 }}>
        {heat.map((row, d) => (
          <div key={d} style={{ display: "grid", gridTemplateColumns: "28px repeat(24, minmax(12px, 1fr))", gap: 3, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--dim)", fontWeight: 600 }}>{days[d]}</span>
            {row.map((v, h) => <span key={h} title={`${days[d]}, ${h}:00–${h + 1}:00 — ${v} ${plural(v, "диалог", "диалога", "диалогов")}`} style={{ height: 22, borderRadius: 4, background: color(v) }} />)}
          </div>
        ))}
        <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "28px repeat(24, minmax(12px, 1fr))", gap: 3, fontSize: 11, color: "var(--faint)", paddingTop: 4 }}>
          <span />{Array.from({ length: 24 }, (_, h) => <span key={h}>{h % 3 === 0 ? h : ""}</span>)}
        </div>
      </div>
    </div>
  );
}

// Сжатие фото перед загрузкой — быстрее и дешевле по трафику
function resizeImage(file, max = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Это не картинка"));
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}


// ════════════════ Каркас: меню, вход, маршруты ════════════════
function parseHash() {
  return (window.location.hash || "").replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean).map(decodeURIComponent);
}
function hashQuery() {
  const q = (window.location.hash || "").split("?")[1] || "";
  return Object.fromEntries(q.split("&").filter(Boolean).map((kv) => { const [k, v] = kv.split("="); return [decodeURIComponent(k), decodeURIComponent(v || "")]; }));
}

function useFonts() {
  useEffect(() => {
    if (document.getElementById("cab-fonts")) return;
    const pre = document.createElement("link"); pre.rel = "preconnect"; pre.href = "https://fonts.gstatic.com"; pre.crossOrigin = "anonymous";
    const l = document.createElement("link"); l.id = "cab-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(pre); document.head.appendChild(l);
    document.title = "ChatAIbot — панель";
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.content = "#0A0C10";
  }, []);
}

function Login({ onDone }) {
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch(API + "/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login: login.trim(), password: pass }) });
      if (!r.ok) setErr(r.status === 401 ? "Неверный логин или пароль" : "Сервер не отвечает, попробуйте чуть позже");
      else { const d = await r.json(); onDone(login.trim() ? `${login.trim()}:${pass}` : pass, d); }
    } catch (e2) { setErr("Сервер недоступен. Проверьте интернет."); }
    setBusy(false);
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "radial-gradient(900px 500px at 70% -10%, rgba(47,99,230,.16), transparent 70%), var(--bg)" }}>
      <form onSubmit={submit} className="card" style={{ width: "100%", maxWidth: 400, padding: 30, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 30px 80px rgba(0,0,0,.45)" }}>
        <div className="row" style={{ gap: 12 }}>
          <span className="brand-logo"><Icon name="chat" size={19} sw={2} /></span>
          <div><div style={{ fontWeight: 800, fontSize: 19, letterSpacing: -.3 }}>ChatAIbot</div><div className="hint">Панель управления ботами</div></div>
        </div>
        <h1 className="h2" style={{ fontSize: 20, marginTop: 6 }}>Вход</h1>
        <label className="lbl">Логин<input className="inp" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus /></label>
        <label className="lbl">Пароль<input className="inp" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} /></label>
        {err && <div role="alert" className="banner" style={{ background: "var(--bad-soft)", color: "var(--bad)", fontSize: 13.5, fontWeight: 700, padding: "10px 12px" }}>{err}</div>}
        <Btn kind="primary" block loading={busy} type="submit">Войти</Btn>
        <div className="hint">Клиенты входят по логину, который выдал администратор.</div>
      </form>
    </div>
  );
}

function NavItem({ icon, label, on, onClick, badge, badgeKind }) {
  return (
    <button type="button" className={`nav-a ${on ? "on" : ""}`} aria-current={on ? "page" : undefined} onClick={onClick}>
      <Icon name={icon} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && <span className="nav-badge" style={badgeKind === "warn" ? { background: "rgba(245,181,68,.18)", color: "var(--warn)" } : badgeKind === "plain" ? { background: "transparent", color: "var(--faint)" } : { background: "var(--accent)", color: "#fff" }}>{badge}</span>}
    </button>
  );
}

function Sidebar({ scope, page, cid, badges, onLogout }) {
  const { nav, me, isAdmin } = useApp();
  if (scope === "admin") {
    const ok = badges?.system_ok !== false;
    return (
      <nav className="side" aria-label="Разделы админки">
        <div className="brand"><span className="brand-logo"><Icon name="chat" size={18} sw={2} /></span><div><div style={{ fontWeight: 800, fontSize: 15 }}>ChatAIbot</div><div className="hint" style={{ fontSize: 12 }}>Админ-панель</div></div></div>
        <NavItem icon="grid" label="Обзор" on={page === "overview"} onClick={() => nav("admin")} />
        <NavItem icon="users" label="Клиенты" on={page === "clients" || page === "bot"} onClick={() => nav("admin/clients")} badge={badges?.clients} badgeKind="plain" />
        <NavItem icon="pulse" label="Система" on={page === "system"} onClick={() => nav("admin/system")} badge={badges?.warnings} badgeKind="warn" />
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => nav("admin/system")} className="card tight" style={{ textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, background: "var(--card)" }}>
          <span className="row" style={{ gap: 8, fontSize: 13, fontWeight: 800 }}><span className="dot" style={{ background: ok ? "var(--ok)" : "var(--warn)" }} />{ok ? "Система работает" : "Есть предупреждения"}</span>
          <span className="hint">{ok ? "Боты на связи, база и ИИ отвечают." : "Откройте «Система», чтобы посмотреть детали."}</span>
        </button>
        <div className="row" style={{ padding: "12px 10px 0" }}>
          <span className="tile" style={{ width: 32, height: 32, borderRadius: 16, fontSize: 12 }}>{initials(me?.login || "A")}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 800 }}>{me?.login === "admin" ? "Админ" : me?.login}</div><div className="hint" style={{ fontSize: 12 }}>владелец сервиса</div></div>
          <button type="button" className="btn ghost sm" onClick={onLogout} aria-label="Выйти"><Icon name="logout" size={18} /></button>
        </div>
      </nav>
    );
  }
  const name = badges?.name || me?.client?.name || "Кабинет";
  const paused = badges?.status === "paused";
  return (
    <nav className="side" aria-label="Разделы кабинета">
      <div className="brand"><span className="tile">{initials(name)}</span><div style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.25 }}>{name}</div><div className="hint" style={{ fontSize: 12 }}>кабинет · ChatAIbot</div></div></div>
      <NavItem icon="home" label="Сегодня" on={page === "today"} onClick={() => nav(`c/${cid}/today`)} />
      <NavItem icon="bag" label="Заказы" on={page === "orders"} onClick={() => nav(`c/${cid}/orders`)} badge={badges?.new_orders} />
      <NavItem icon="chat" label="Диалоги" on={page === "dialogs"} onClick={() => nav(`c/${cid}/dialogs`)} badge={badges?.waiting} badgeKind="warn" />
      <NavItem icon="chart" label="Аналитика" on={page === "analytics"} onClick={() => nav(`c/${cid}/analytics`)} />
      <NavItem icon="box" label="Каталог" on={page === "catalog"} onClick={() => nav(`c/${cid}/catalog`)} />
      <NavItem icon="sliders" label="Настройки бота" on={page === "settings"} onClick={() => nav(`c/${cid}/settings`)} />
      <div style={{ flex: 1 }} />
      <div className="card tight" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="row" style={{ gap: 8, fontSize: 13, fontWeight: 800 }}><span className="dot" style={{ background: paused ? "var(--bad)" : "var(--ok)" }} />{paused ? "Бот на паузе" : "Бот на связи"}</span>
        <span className="hint">Режим «{MODE[badges?.mode || "auto"].label}». {paused ? "Клиенты получают «напишем позже»." : MODE[badges?.mode || "auto"].text.split(".")[0] + "."}</span>
        <button type="button" className="btn ghost sm" style={{ justifyContent: "flex-start", padding: 0, color: "var(--accent-text)", minHeight: 30 }} onClick={() => nav(`c/${cid}/settings`)}>Изменить режим</button>
      </div>
      <div className="row" style={{ padding: "12px 10px 0" }}>
        {isAdmin ? (
          <button type="button" className="btn sm block" onClick={() => nav(`admin/bot/${cid}`)}><Icon name="left" size={16} />В админку</button>
        ) : (<>
          <span className="tile" style={{ width: 32, height: 32, borderRadius: 16, fontSize: 12 }}>{initials(me?.login)}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis" }}>{me?.login}</div><div className="hint" style={{ fontSize: 12 }}>владелец</div></div>
          <button type="button" className="btn ghost sm" onClick={onLogout} aria-label="Выйти"><Icon name="logout" size={18} /></button>
        </>)}
      </div>
    </nav>
  );
}

function MobileBars({ scope, page, cid, badges, onLogout }) {
  const { nav, isAdmin } = useApp();
  const [more, setMore] = useState(false);
  const tabs = scope === "admin"
    ? [["grid", "Обзор", "overview", "admin"], ["users", "Клиенты", "clients", "admin/clients"], ["pulse", "Система", "system", "admin/system", badges?.warnings, "warn"]]
    : [["home", "Сегодня", "today", `c/${cid}/today`], ["bag", "Заказы", "orders", `c/${cid}/orders`, badges?.new_orders], ["chat", "Диалоги", "dialogs", `c/${cid}/dialogs`, badges?.waiting, "warn"]];
  const name = scope === "admin" ? "ChatAIbot" : (badges?.name || "Кабинет");
  const paused = badges?.status === "paused";
  return (<>
    <div className="mtop">
      {scope === "admin" ? <span className="brand-logo"><Icon name="chat" size={18} sw={2} /></span> : <span className="tile">{initials(name)}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
        {scope === "admin"
          ? <div className="hint" style={{ fontSize: 12 }}>админка</div>
          : <div className="row" style={{ gap: 6, fontSize: 12, color: "var(--dim)" }}><span className="dot" style={{ width: 7, height: 7, background: paused ? "var(--bad)" : "var(--ok)" }} />{paused ? "Бот на паузе" : `Бот на связи · «${MODE[badges?.mode || "auto"].label}»`}</div>}
      </div>
      {scope === "cab" && isAdmin && <button type="button" className="btn sm" onClick={() => nav(`admin/bot/${cid}`)}><Icon name="left" size={16} />Админка</button>}
      {scope === "admin" && badges && <button type="button" onClick={() => nav("admin/system")} className="pill" style={{ border: 0, cursor: "pointer", minHeight: 36, background: badges.warnings ? "var(--warn-soft)" : "var(--ok-soft)", color: badges.warnings ? "var(--warn)" : "var(--ok)" }}>{badges.warnings ? `${badges.warnings} ${plural(badges.warnings, "предупреждение", "предупреждения", "предупреждений")}` : "всё работает"}</button>}
    </div>
    <nav className="mtabs" aria-label="Разделы">
      {tabs.map(([ic, l, pg, path, b, bk]) => (
        <button key={pg} type="button" className={page === pg || (pg === "clients" && page === "bot") ? "on" : ""} aria-current={page === pg ? "page" : undefined} onClick={() => nav(path)}>
          <Icon name={ic} size={22} />{l}
          {b > 0 && <span className="mb" style={bk === "warn" ? { background: "var(--warn)", color: "#1A1305" } : { background: "var(--accent)", color: "#fff" }}>{b}</span>}
        </button>
      ))}
      <button type="button" className={["analytics", "catalog", "settings"].includes(page) ? "on" : ""} onClick={() => setMore(true)}><Icon name="menu" size={22} />Ещё</button>
    </nav>
    {more && (
      <Modal title="Ещё" sheet onClose={() => setMore(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {scope === "cab" && <>
            <NavItem icon="chart" label="Аналитика" on={page === "analytics"} onClick={() => { setMore(false); nav(`c/${cid}/analytics`); }} />
            <NavItem icon="box" label="Каталог" on={page === "catalog"} onClick={() => { setMore(false); nav(`c/${cid}/catalog`); }} />
            <NavItem icon="sliders" label="Настройки бота" on={page === "settings"} onClick={() => { setMore(false); nav(`c/${cid}/settings`); }} />
          </>}
          {scope === "cab" && isAdmin && <NavItem icon="left" label="Вернуться в админку" onClick={() => { setMore(false); nav(`admin/bot/${cid}`); }} />}
          <NavItem icon="logout" label="Выйти" onClick={() => { setMore(false); onLogout(); }} />
        </div>
      </Modal>
    )}
  </>);
}

export default function App() {
  useFonts();
  const [token, setToken] = useState(() => { try { return localStorage.getItem("adminPwd") || ""; } catch (e) { return ""; } });
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState(parseHash());
  const [toastMsg, setToastMsg] = useState(null);
  const [pulse, setPulse] = useState("");
  const [badges, setBadges] = useState(null);
  const toastTimer = useRef(null);

  const logout = useCallback(() => {
    try { localStorage.removeItem("adminPwd"); localStorage.removeItem("role"); } catch (e) { /* */ }
    setToken(""); setMe(null); setBadges(null);
    window.location.hash = "";
  }, []);
  const api = useMemo(() => makeApi(token, logout), [token, logout]);
  const nav = useCallback((path) => { window.location.hash = "#/" + path; window.scrollTo(0, 0); }, []);
  const toast = useCallback((msg, kind = "ok") => {
    setToastMsg({ msg, kind, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), kind === "bad" ? 5000 : 3200);
  }, []);

  useEffect(() => { const f = () => setRoute(parseHash()); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);
  useEffect(() => {
    document.body.style.background = "#0A0C10";
    if (!token) { setChecking(false); return; }
    setChecking(true);
    api.get("/api/me").then(setMe).catch(() => { /* выход сделает makeApi при 401 */ }).finally(() => setChecking(false));
  }, [token]); // eslint-disable-line

  const isAdmin = me?.role === "admin";
  let scope = "admin", cid = null;
  if (me) {
    if (!isAdmin) { scope = "cab"; cid = me.client_id; }
    else if (route[0] === "c" && route[1]) { scope = "cab"; cid = route[1]; }
  }
  const page = scope === "admin"
    ? (route[0] === "admin" ? (route[1] || "overview") : "overview")
    : ((route[0] === "c" ? route[2] : null) || "today");

  // «Пульс»: раз в 15 секунд спрашиваем, поменялось ли что-то (без нагрузки на базу).
  // В открытых диалогах — каждые 5 секунд, чтобы переписка шла почти вживую.
  const fast = scope === "cab" && route[2] === "dialogs";
  useEffect(() => {
    if (!me || (scope === "cab" && !cid)) return;
    let alive = true;
    const path = scope === "cab" ? `/api/pulse?client_id=${encodeURIComponent(cid)}` : "/api/pulse";
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      try { const r = await api.get(path); if (alive) setPulse(r.v); } catch (e) { /* */ }
    };
    tick();
    const t = setInterval(tick, fast ? 5000 : 15000);
    const onVis = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [me, scope, cid, api, fast]);

  // Во вкладке браузера видно, сколько ждёт ответа
  useEffect(() => {
    if (!me) return;
    const n = scope === "cab" ? (badges?.new_orders || 0) + (badges?.waiting || 0) : (badges?.attention || 0);
    const name = scope === "cab" ? (badges?.name || "Кабинет") : "Админка";
    document.title = `${n ? `(${n}) ` : ""}${name} — ChatAIbot`;
  }, [me, scope, badges]);

  const loadBadges = useCallback(() => {
    if (!me || (scope === "cab" && !cid)) return;
    api.get(scope === "cab" ? `/api/c/${encodeURIComponent(cid)}/badges` : "/api/admin/badges").then(setBadges).catch(() => {});
  }, [me, scope, cid, api]);
  useEffect(() => { setBadges(null); loadBadges(); }, [scope, cid]); // eslint-disable-line
  useEffect(() => { if (pulse) loadBadges(); }, [pulse]); // eslint-disable-line

  if (!token || (!me && !checking)) {
    return (<><style>{CSS}</style><Login onDone={(tok) => { try { localStorage.setItem("adminPwd", tok); } catch (e) { /* */ } setToken(tok); }} /></>);
  }
  if (!me) return (<><style>{CSS}</style><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spin" /></div></>);

  let body = null;
  if (scope === "admin") {
    if (page === "clients") body = <AdminClients />;
    else if (page === "bot") body = <AdminBot cid={route[2]} tab={route[3] || "bot"} />;
    else if (page === "system") body = <AdminSystem />;
    else body = <AdminOverview />;
  } else {
    if (page === "orders") body = <CabOrders cid={cid} />;
    else if (page === "dialogs") body = <CabDialogs cid={cid} lid={route[3]} />;
    else if (page === "analytics") body = <CabAnalytics cid={cid} />;
    else if (page === "catalog") body = <CabCatalog cid={cid} />;
    else if (page === "settings") body = <CabSettings cid={cid} />;
    else body = <CabToday cid={cid} />;
  }

  const ctx = { api, me, nav, toast, pulse, isAdmin, cid, scope, badges, reloadBadges: loadBadges, route };
  return (
    <Ctx.Provider value={ctx}>
      <style>{CSS}</style>
      {toastMsg && (
        <div className="toast" role="status" key={toastMsg.id}>
          <span style={{ color: toastMsg.kind === "bad" ? "var(--bad)" : "var(--ok)" }}><Icon name={toastMsg.kind === "bad" ? "alert" : "check"} size={18} sw={2.4} /></span>
          <span>{toastMsg.msg}</span>
        </div>
      )}
      <div className="app">
        <Sidebar scope={scope} page={page} cid={cid} badges={badges} onLogout={logout} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {scope === "cab" && isAdmin && (
            <div className="hide-m" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 36px", background: "var(--accent-soft)", borderBottom: "1px solid rgba(47,99,230,.3)", fontSize: 13.5 }}>
              <Icon name="eye" size={18} />
              <span style={{ flex: 1 }}>Вы смотрите кабинет клиента «{badges?.name || "…"}» — так его видит владелец бизнеса.</span>
              <button type="button" className="btn sm soft" onClick={() => nav(`admin/bot/${cid}`)}>Вернуться в админку</button>
            </div>
          )}
          {me && !me.schema && isAdmin && (
            <div style={{ padding: "10px 36px", background: "var(--warn-soft)", borderBottom: "1px solid rgba(245,181,68,.35)", fontSize: 13.5, color: "var(--warn)", fontWeight: 700 }}>
              База ещё не обновлена: запустите SQL-файл update-v2.sql в Supabase — тогда заработают черновики, лента событий и состояние системы.
            </div>
          )}
          <MobileBars scope={scope} page={page} cid={cid} badges={badges} onLogout={logout} />
          <main className="main">{body}</main>
        </div>
      </div>
    </Ctx.Provider>
  );
}


// ════════════════ АДМИНКА ════════════════
const EV_KIND = {
  order: { icon: "bag", color: "var(--ok)", bg: "var(--ok-soft)" },
  done: { icon: "check", color: "var(--ok)", bg: "var(--ok-soft)" },
  handoff: { icon: "user", color: "var(--bad)", bg: "var(--bad-soft)" },
  draft: { icon: "edit", color: "var(--warn)", bg: "var(--warn-soft)" },
  error: { icon: "alert", color: "var(--bad)", bg: "var(--bad-soft)" },
  system: { icon: "shield", color: "var(--dim)", bg: "#1B2029" },
  info: { icon: "sparkle", color: "var(--dim)", bg: "#1B2029" },
};

function EventFeed({ events, showClient, empty = "Пока тихо — события появятся здесь." }) {
  if (!events || !events.length) return <div className="hint" style={{ padding: "12px 0" }}>{empty}</div>;
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {events.map((e) => {
        const k = EV_KIND[e.kind] || EV_KIND.info;
        return (
          <li key={e.id} style={{ display: "grid", gridTemplateColumns: "50px 30px minmax(0,1fr)", gap: 10, padding: "10px 0", borderTop: "1px solid var(--line3)", alignItems: "start" }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--faint)", paddingTop: 6 }}>{isToday(e.created_at) ? hhmm(e.created_at) : dayMonth(e.created_at).replace(/ (\S{3})\S*/, " $1")}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: k.bg, color: k.color, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={k.icon} size={15} sw={2} /></span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>{showClient && e.client ? <span style={{ color: "var(--dim)" }}>{e.client} · </span> : null}{e.title}</span>
              {e.text && <span className="hint" style={{ fontSize: 12.5 }}>{e.text}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function SystemMini({ s, onOpen }) {
  if (!s) return null;
  const e = s.egress;
  const rows = [
    { name: "Сервер", vendor: "Railway", ok: true, state: "Работает", note: `Версия ${s.version} · запущен ${whenShort(s.started_at)}` },
    e ? { name: "База", vendor: "Supabase", ok: e.pct_projected < 80, warn: e.pct_projected >= 80, state: `Прогноз ${Math.round(e.pct_projected)}%`, note: `Трафик ${bytes(e.used)} из ${bytes(e.limit)} за ${e.days_passed} ${plural(e.days_passed, "день", "дня", "дней")}`, bar: e }
      : { name: "База", vendor: "Supabase", ok: true, state: "Отвечает", note: "Обновите базу (SQL), чтобы видеть трафик" },
    { name: "ИИ", vendor: "DeepSeek", ok: (s.ai?.errors_24h || 0) < 3, warn: (s.ai?.errors_24h || 0) >= 3, state: (s.ai?.errors_24h || 0) >= 3 ? "Сбои" : "Отвечает", note: s.ai?.avg_ms ? `В среднем ${secs(s.ai.avg_ms)} · ошибок за сутки: ${s.ai.errors_24h}` : "Ещё не было запросов после перезапуска" },
    { name: "Telegram", vendor: s.telegram?.total ? `${s.telegram.ok} из ${s.telegram.total} ботов` : "проверка через 10 минут", ok: !s.telegram?.total || s.telegram.ok === s.telegram.total, state: !s.telegram?.total ? "—" : s.telegram.ok === s.telegram.total ? "На связи" : "Есть сбой", note: s.telegram?.checked_at ? `Проверено в ${hhmm(s.telegram.checked_at * 1000)}` : "Вебхуки проверяются каждые 30 минут" },
    { name: "Резервная копия", vendor: "настройки", ok: !!s.backup?.ok, warn: s.backup && !s.backup.ok, state: s.backup?.ok ? "Сохранена" : s.backup ? "Не отправлена" : "Ещё не было", note: s.backup?.at ? `${whenShort(s.backup.at)} · каждую ночь в 02:30` : "Каждую ночь в 02:30 — в Telegram" },
  ];
  return (
    <section className="card" aria-labelledby="sys-mini" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div className="between" style={{ paddingBottom: 6 }}><h2 id="sys-mini" className="h2">Состояние системы</h2><span className="hint">{s.ok ? "всё в порядке" : "есть предупреждения"}</span></div>
      {rows.map((r) => (
        <div key={r.name} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "11px 0", borderTop: "1px solid var(--line3)" }}>
          <div className="row" style={{ gap: 10 }}>
            <span className="dot" style={{ width: 10, height: 10, background: r.warn ? "var(--warn)" : r.ok ? "var(--ok)" : "var(--faint)", boxShadow: `0 0 0 4px ${r.warn ? "rgba(245,181,68,.2)" : r.ok ? "rgba(52,211,153,.18)" : "transparent"}` }} />
            <span style={{ fontSize: 14, fontWeight: 800 }}>{r.name}</span>
            <span className="hint" style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.vendor}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: r.warn ? "var(--warn)" : r.ok ? "var(--ok)" : "var(--faint)", whiteSpace: "nowrap" }}>{r.state}</span>
          </div>
          {r.bar && <EgressBar e={r.bar} />}
          <span className="hint" style={{ paddingLeft: 20 }}>{r.note}</span>
        </div>
      ))}
      <button type="button" className="btn ghost sm" style={{ alignSelf: "flex-start", color: "var(--accent-text)", paddingLeft: 0 }} onClick={onOpen}>Подробнее о системе <Icon name="arrow" size={16} /></button>
    </section>
  );
}

function EgressBar({ e }) {
  const used = Math.min(100, e.pct_used), proj = Math.min(100, e.pct_projected);
  const warn = e.pct_projected >= 80;
  return (
    <div role="img" aria-label={`Трафик базы: потрачено ${e.pct_used}% лимита, прогноз к концу цикла ${e.pct_projected}%`} style={{ position: "relative", height: 8, margin: "4px 0 2px 20px", borderRadius: 4, background: "#1E232D" }}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${used}%`, borderRadius: 4, background: warn ? "var(--warn)" : "var(--ok)" }} />
      <span style={{ position: "absolute", left: `${used}%`, top: 0, bottom: 0, width: `${Math.max(0, proj - used)}%`, background: `repeating-linear-gradient(135deg, ${warn ? "rgba(245,181,68,.35)" : "rgba(52,211,153,.3)"} 0 4px, transparent 4px 8px)` }} />
      <span style={{ position: "absolute", left: `calc(${proj}% - 1px)`, top: -4, bottom: -4, width: 2, borderRadius: 1, background: warn ? "var(--warn)" : "var(--ok)" }} />
    </div>
  );
}

function attentionAction(a, nav) {
  if (a.kind === "handoff") return ["Открыть диалог", () => nav(`c/${a.client_id}/dialogs${a.dialog_id ? "/" + a.dialog_id : ""}`)];
  if (a.kind === "draft") return ["Посмотреть", () => nav(`c/${a.client_id}/dialogs`)];
  if (a.kind === "pay") return ["Оплата", () => nav(`admin/bot/${a.client_id}/pay`)];
  if (a.kind === "webhook") return ["Проверить", () => nav(`admin/bot/${a.client_id}/connect`)];
  return ["Открыть", () => nav(`admin/bot/${a.client_id}`)];
}
const ATT_LABEL = { handoff: "Срочно", draft: "Ждёт", pay: "Оплата", webhook: "Сбой" };

function AdminOverview() {
  const { api, nav } = useApp();
  const { data, error, loading, reload } = useLoad(() => api.get("/api/admin/overview"), [], 30000);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const k = data.kpi;
  const profitPct = k.mrr ? Math.round((k.profit / k.mrr) * 100) : 0;
  const bars = data.orders_by_day.map((d) => ({ v: d.count, label: dateLabel(d.date), short: dateLabel(d.date) }));
  const aiMax = Math.max(1, ...data.ai_by_client.map((x) => x.cost));
  return (
    <div className="wrap">
      <PageHead title="Обзор" sub={todayTitle()} right={<>
        <form className="hide-m" onSubmit={(e) => { e.preventDefault(); nav(`admin/clients?q=${encodeURIComponent(q)}`); }} style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: 13, color: "var(--faint)" }}><Icon name="search" size={18} /></span>
          <input className="inp" style={{ paddingLeft: 38, width: 240 }} placeholder="Найти клиента" aria-label="Найти клиента" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <Btn kind="primary" icon="plus" onClick={() => setCreating(true)}>Подключить бота</Btn>
      </>} />
      <section className="kpis" aria-label="Главные цифры">
        <Kpi label="Доход в месяц" value={rub(k.mrr)}>платят {k.paying} {plural(k.paying, "клиент", "клиента", "клиентов")} из {k.clients}</Kpi>
        <Kpi label="Расходы" value={rub(k.expenses)}>ИИ {rub(k.ai_cost)} · сервер {k.server_cost ? rub(k.server_cost) : "—"}</Kpi>
        <Kpi label="Прибыль" value={rub(k.profit)}>{k.mrr ? `${profitPct}% от дохода остаётся тебе` : "пока нет платящих клиентов"}</Kpi>
        <Kpi label="Заказов через ботов" value={num(k.orders_30)}><Delta cur={k.orders_30} prev={k.orders_prev} /><span>за 30 дней · оборот {rubShort(k.turnover_30)}</span></Kpi>
      </section>
      <div className="cols">
        <div className="col" style={{ flex: "3 1 560px" }}>
          <section className="card" aria-labelledby="att-t" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="between"><h2 id="att-t" className="h2">Требует внимания</h2><span className="hint">{data.attention.length ? `${data.attention.length} ${plural(data.attention.length, "задача", "задачи", "задач")}` : "всё спокойно"}</span></div>
            {!data.attention.length && <div className="hint" style={{ padding: "6px 0" }}>Никто не ждёт ответа, оплаты в порядке, боты на связи.</div>}
            {data.attention.map((a, i) => {
              const [label, act] = attentionAction(a, nav);
              const bad = a.level === "bad";
              return (
                <div key={i} className="row" style={{ flexWrap: "wrap", gap: 14, padding: 14, borderRadius: 12, background: "var(--card2)", border: "1px solid var(--line)" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 10, background: bad ? "var(--bad-soft)" : "var(--warn-soft)", color: bad ? "var(--bad)" : "var(--warn)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={a.kind === "handoff" ? "user" : a.kind === "draft" ? "edit" : "alert"} /></span>
                  <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: .4, textTransform: "uppercase", color: bad ? "var(--bad)" : "var(--warn)" }}>{ATT_LABEL[a.kind] || "Важно"}</span>
                      <span style={{ fontSize: 14.5, fontWeight: 700 }}>{a.title}</span>
                    </div>
                    <div className="hint" style={{ fontSize: 13 }}>{a.minutes != null && (a.kind === "handoff" || a.kind === "draft") ? `Ждёт ${agoText(Date.now() - a.minutes * 60000)} · ` : ""}{a.text}</div>
                  </div>
                  <Btn onClick={act}>{label}</Btn>
                </div>
              );
            })}
          </section>
          <section className="card" aria-labelledby="ord-t" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="between" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
              <div><h2 id="ord-t" className="h2">Заказы через всех ботов</h2><div className="hint" style={{ marginTop: 4 }}>{dateLabel(data.orders_by_day[0].date)} — {dateLabel(data.orders_by_day[29].date)}, по дням</div></div>
              <div className="row" style={{ alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 22, fontWeight: 800 }}>{num(k.orders_30)}</span><span style={{ fontSize: 12.5 }}><Delta cur={k.orders_30} prev={k.orders_prev} suffix=" к прошлым 30 дням" /></span></div>
            </div>
            <Bars data={bars} height={170} ariaLabel={`Заказы по дням за 30 дней, всего ${k.orders_30}`} fmt={(v) => `${v}`} tipFmt={(d) => `${d.label}: ${d.v} ${plural(d.v, "заказ", "заказа", "заказов")}`} />
          </section>
          <section className="card" aria-labelledby="ai-t" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="between" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
              <div><h2 id="ai-t" className="h2">Расход ИИ по клиентам</h2><div className="hint" style={{ marginTop: 4 }}>за 30 дней · всего {rub(k.ai_cost)}{k.mrr ? ` — это ${Math.max(0, Math.round((k.ai_cost / k.mrr) * 100))}% от дохода` : ""}</div></div>
              <span className="hint hide-m">доля — сколько ИИ съедает от тарифа клиента</span>
            </div>
            <div role="table" aria-label="Расход ИИ по клиентам">
              {data.ai_by_client.filter((x) => x.tokens > 0).map((x) => (
                <div key={x.client_id} role="row" className="tbl-row" style={{ gridTemplateColumns: "minmax(0,170px) minmax(0,1fr) 70px 110px", gap: 12, minHeight: 32, fontSize: 13.5 }}>
                  <button type="button" role="rowheader" onClick={() => nav(`admin/bot/${x.client_id}`)} style={{ border: 0, background: "transparent", padding: 0, textAlign: "left", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13.5 }}>{x.name}</button>
                  <span role="cell"><ShareBar pct={(x.cost / aiMax) * 100} /></span>
                  <span role="cell" style={{ textAlign: "right", fontWeight: 800 }}>{rub(x.cost)}</span>
                  <span role="cell" className="hint">{x.plan_price > 0 ? `${((x.cost / x.plan_price) * 100).toFixed(1).replace(".", ",")}% тарифа` : x.status === "paused" ? "пауза" : "без оплаты"}</span>
                </div>
              ))}
              {!data.ai_by_client.some((x) => x.tokens > 0) && <div className="hint">Расход появится, когда боты начнут отвечать.</div>}
            </div>
          </section>
        </div>
        <div className="col" style={{ flex: "2 1 340px" }}>
          <SystemMini s={data.system} onOpen={() => nav("admin/system")} />
          <section className="card" aria-labelledby="feed-t" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div className="between" style={{ paddingBottom: 8 }}><h2 id="feed-t" className="h2">Лента событий</h2><span className="hint">все боты</span></div>
            <EventFeed events={data.events} showClient />
          </section>
        </div>
      </div>
      {creating && <CreateBot onClose={() => setCreating(false)} />}
    </div>
  );
}

function CreateBot({ onClose }) {
  const { api, nav, toast } = useApp();
  const [f, setF] = useState({ name: "", token: "", city: "", business_type: "order", bot_mode: "auto", plan: "Старт", plan_price: "", staff_chat_id: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    if (!f.name.trim() || !f.token.trim()) { toast("Нужны название и токен бота", "bad"); return; }
    setBusy(true);
    try {
      const r = await api.post("/api/create-client", { ...f, base_url: API });
      toast(r.webhook ? "Бот подключён и уже отвечает" : "Бот создан, но вебхук не встал — проверьте токен", r.webhook ? "ok" : "bad");
      onClose();
      nav(`admin/bot/${r.client_id}`);
    } catch (e) { toast(e.message, "bad"); }
    setBusy(false);
  };
  return (
    <Modal title="Подключить бота" onClose={onClose} footer={<><Btn onClick={onClose}>Отмена</Btn><Btn kind="primary" loading={busy} onClick={submit}>Подключить</Btn></>}>
      <label className="lbl">Название бизнеса<input className="inp" value={f.name} onChange={set("name")} placeholder="Например, Цветочная Лавка" /></label>
      <label className="lbl">Токен бота от @BotFather<input className="inp" value={f.token} onChange={set("token")} placeholder="1234567890:AA…" autoComplete="off" /></label>
      <div className="wrapflex" style={{ gap: 12 }}>
        <label className="lbl" style={{ flex: "1 1 200px" }}>Город и ниша<input className="inp" value={f.city} onChange={set("city")} placeholder="Москва · цветы" /></label>
        <label className="lbl" style={{ flex: "1 1 200px" }}>Что делает бот<select className="inp" value={f.business_type} onChange={set("business_type")}><option value="order">Принимает заказы</option><option value="lead">Собирает заявки</option></select></label>
      </div>
      <div className="wrapflex" style={{ gap: 12 }}>
        <label className="lbl" style={{ flex: "1 1 140px" }}>Тариф<input className="inp" value={f.plan} onChange={set("plan")} /></label>
        <label className="lbl" style={{ flex: "1 1 140px" }}>Цена, ₽ в месяц<input className="inp" inputMode="numeric" value={f.plan_price} onChange={set("plan_price")} placeholder="2 900" /></label>
        <label className="lbl" style={{ flex: "1 1 160px" }}>Режим<select className="inp" value={f.bot_mode} onChange={set("bot_mode")}>{Object.entries(MODE).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}</select></label>
      </div>
      <label className="lbl">ID группы для заказов (можно позже)<input className="inp" value={f.staff_chat_id} onChange={set("staff_chat_id")} placeholder="-100…" /></label>
      <div className="hint">После подключения бот сразу начнёт отвечать. Инструкцию и каталог настроите в карточке бота.</div>
    </Modal>
  );
}

const CLIENT_STATE = {
  ok: { label: "На связи", color: "var(--text)", dot: "var(--ok)" },
  wait: { label: "Ждёт менеджера", color: "var(--bad)", dot: "var(--bad)" },
  paused: { label: "Пауза", color: "var(--faint)", dot: "#5C6270" },
  off: { label: "Не подключён", color: "var(--faint)", dot: "#5C6270" },
  error: { label: "Нет сообщений", color: "var(--bad)", dot: "var(--bad)" },
};

function modePill(mode) {
  const m = mode || "auto";
  const st = m === "mixed" ? { bg: "var(--accent-soft)", c: "var(--accent-text)" } : m === "trainee" ? { bg: "var(--warn-soft)", c: "var(--warn)" } : { bg: "#1B2029", c: "var(--dim)" };
  return <span className="pill" style={{ background: st.bg, color: st.c, borderRadius: 13, padding: "4px 10px" }}>{MODE[m].label}</span>;
}

function paidInfo(paid_until) {
  if (!paid_until) return { text: "—", note: "", color: "var(--faint)" };
  const d = new Date(paid_until + "T00:00:00Z");
  const today = new Date(dayKey(Date.now()) + "T00:00:00Z");
  const left = Math.round((d - today) / 864e5);
  const text = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  if (left < 0) return { text, note: `просрочено на ${-left} дн.`, color: "var(--bad)", left };
  if (left <= 3) return { text, note: left === 0 ? "сегодня" : `через ${left} ${plural(left, "день", "дня", "дней")}`, color: "var(--warn)", left };
  return { text, note: `через ${left} ${plural(left, "день", "дня", "дней")}`, color: "var(--text)", left };
}

function AdminClients() {
  const { api, nav } = useApp();
  const { data, error, loading, reload } = useLoad(() => api.get("/api/admin/clients"), [], false);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("gmv");
  const [q, setQ] = useState(hashQuery().q || "");
  const [creating, setCreating] = useState(false);
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const all = data.clients;
  const isTrial = (c) => /проб/i.test(c.plan || "");
  const att = (c) => c.state === "wait" || c.state === "error" || (paidInfo(c.paid_until).left ?? 99) <= 3;
  const counts = { all: all.length, att: all.filter(att).length, trial: all.filter(isTrial).length, paused: all.filter((c) => c.status === "paused").length };
  let rows = all.filter((c) => filter === "all" || (filter === "att" && att(c)) || (filter === "trial" && isTrial(c)) || (filter === "paused" && c.status === "paused"));
  if (q.trim()) { const ql = q.trim().toLowerCase(); rows = rows.filter((c) => (c.name || "").toLowerCase().includes(ql) || (c.city || "").toLowerCase().includes(ql)); }
  const sorters = { gmv: (a, b) => b.gmv_30 - a.gmv_30, orders: (a, b) => b.orders_30 - a.orders_30, ai: (a, b) => b.ai_cost - a.ai_cost, paid: (a, b) => (a.paid_until || "9999").localeCompare(b.paid_until || "9999"), name: (a, b) => (a.name || "").localeCompare(b.name || "", "ru") };
  rows = [...rows].sort(sorters[sort]);
  const paying = all.filter((c) => c.status === "active" && c.plan_price > 0).length;
  const cols = "minmax(0,2.05fr) minmax(0,1.05fr) minmax(0,1.05fr) minmax(0,.7fr) minmax(0,1.1fr) minmax(0,.85fr) minmax(0,.8fr) minmax(0,1.05fr) minmax(0,1.5fr)";
  return (
    <div className="wrap">
      <PageHead title="Клиенты" sub={`${all.length} ${plural(all.length, "бот", "бота", "ботов")} · ${paying} ${plural(paying, "платит", "платят", "платят")} · ${counts.trial} на пробном · ${counts.paused} на паузе`} right={<>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: 13, color: "var(--faint)" }}><Icon name="search" size={18} /></span>
          <input className="inp" style={{ paddingLeft: 38, width: 240, maxWidth: "100%" }} placeholder="Название или город" aria-label="Поиск клиента" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Btn kind="primary" icon="plus" onClick={() => setCreating(true)}>Подключить бота</Btn>
      </>} />
      <div className="between" style={{ flexWrap: "wrap" }}>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          {[["all", "Все"], ["att", "Требуют внимания"], ["trial", "Пробный"], ["paused", "Пауза"]].map(([k, l]) => (
            <button key={k} type="button" className={`chip ${filter === k ? "on" : ""}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l} · {counts[k]}</button>
          ))}
        </div>
        <label className="row" style={{ gap: 8, fontSize: 13, color: "var(--faint)" }}>Сортировка
          <select className="inp" style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="gmv">по обороту за 30 дней</option><option value="orders">по заказам</option><option value="paid">по дате оплаты</option><option value="ai">по расходу ИИ</option><option value="name">по названию</option>
          </select>
        </label>
      </div>
      <div className="card hide-m" style={{ padding: 0, overflow: "hidden" }}>
        <div className="scroll-x">
          <div role="table" aria-label="Клиенты и их боты" style={{ minWidth: 1040, fontSize: 13.5 }}>
            <div role="row" className="tbl-row" style={{ gridTemplateColumns: cols, color: "var(--faint)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .4, borderBottom: "1px solid var(--line)" }}>
              {["Бизнес", "Тариф", "Режим бота", "Заказы", "Оборот ▾", "Конверсия", "Расход ИИ", "Оплачен до", "Состояние"].map((h, i) => (
                <div key={h} role="columnheader" style={{ padding: i === 0 ? "14px 18px" : "14px 12px", textAlign: [3, 4, 5, 6].includes(i) ? "right" : "left", color: i === 4 ? "var(--text)" : undefined }}>{h}</div>
              ))}
            </div>
            {rows.map((c) => {
              const p = paidInfo(c.paid_until);
              const st = CLIENT_STATE[c.state] || CLIENT_STATE.ok;
              return (
                <div key={c.id} role="row" className="tbl-row" onClick={() => nav(`admin/bot/${c.id}`)} style={{ gridTemplateColumns: cols, borderBottom: "1px solid var(--line3)", cursor: "pointer" }}>
                  <div role="rowheader" className="row" style={{ padding: "12px 18px", gap: 12, minWidth: 0 }}>
                    <span className="tile" style={{ width: 36, height: 36, borderRadius: 10, fontSize: 12.5 }}>{initials(c.name)}</span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <a href={`#/admin/bot/${c.id}`} onClick={(e) => e.stopPropagation()} style={{ color: "var(--text)", fontWeight: 700, fontSize: 14 }}>{c.name}</a>
                      <span className="hint" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.city}</span>
                    </span>
                  </div>
                  <div role="cell" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontWeight: 700 }}>{c.plan || "—"}</span><span className="hint">{c.plan_price ? `${num(c.plan_price)} ₽/мес` : c.business_type === "lead" ? "свой бот" : "бесплатно"}</span></div>
                  <div role="cell" style={{ padding: 12 }}>{c.status === "paused" ? <span className="muted">—</span> : modePill(c.bot_mode)}</div>
                  <div role="cell" style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>{c.orders_30 || "—"}</div>
                  <div role="cell" style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>{c.gmv_30 ? rub(c.gmv_30) : "—"}</div>
                  <div role="cell" style={{ padding: 12, textAlign: "right", color: "var(--dim)" }}>{c.conversion != null ? `${c.conversion}%` : "—"}</div>
                  <div role="cell" style={{ padding: 12, textAlign: "right", color: "var(--dim)" }}>{rub(c.ai_cost)}</div>
                  <div role="cell" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ color: p.color, fontWeight: 600 }}>{p.text}</span><span style={{ fontSize: 12, color: p.color === "var(--text)" ? "var(--faint)" : p.color }}>{p.note}</span></div>
                  <div role="cell" style={{ padding: "12px 14px 12px 12px" }}><span className="row" style={{ gap: 8, fontWeight: 700, color: st.color, whiteSpace: "nowrap" }}><span className="dot" style={{ width: 10, height: 10, background: st.dot }} />{st.label}</span></div>
                </div>
              );
            })}
            <div role="row" className="tbl-row" style={{ gridTemplateColumns: cols, background: "var(--input)", fontWeight: 800 }}>
              <div role="rowheader" style={{ padding: "14px 18px" }}>Итого за 30 дней</div>
              <div role="cell" style={{ padding: "14px 12px" }}>{num(data.totals.mrr)} ₽<span className="muted" style={{ fontWeight: 500 }}>/мес</span></div>
              <div role="cell" /><div role="cell" style={{ padding: "14px 12px", textAlign: "right" }}>{num(data.totals.orders_30)}</div>
              <div role="cell" style={{ padding: "14px 12px", textAlign: "right" }}>{rub(data.totals.gmv_30)}</div><div role="cell" />
              <div role="cell" style={{ padding: "14px 12px", textAlign: "right" }}>{rub(data.totals.ai_cost)}</div><div role="cell" /><div role="cell" />
            </div>
          </div>
        </div>
      </div>
      <div className="only-m" style={{ flexDirection: "column", gap: 10 }}>
        {rows.map((c) => {
          const p = paidInfo(c.paid_until); const st = CLIENT_STATE[c.state] || CLIENT_STATE.ok;
          return (
            <button key={c.id} type="button" className="card tight" onClick={() => nav(`admin/bot/${c.id}`)} style={{ textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="row"><span className="tile" style={{ width: 36, height: 36 }}>{initials(c.name)}</span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800 }}>{c.name}</div><div className="hint">{c.plan}{c.plan_price ? ` · ${num(c.plan_price)} ₽/мес` : ""}</div></div><span className="row" style={{ gap: 6, fontSize: 12.5, fontWeight: 800, color: st.color }}><span className="dot" style={{ background: st.dot }} />{st.label}</span></div>
              <div className="between" style={{ fontSize: 13 }}><span className="dim">{c.orders_30} {plural(c.orders_30, "заказ", "заказа", "заказов")} · {c.gmv_30 ? rubShort(c.gmv_30) : "—"}</span><span style={{ color: p.color }}>{c.paid_until ? `до ${p.text}` : ""}</span></div>
            </button>
          );
        })}
      </div>
      {!rows.length && <Empty icon="users" title="Никого не нашли" text="Измените фильтр или поиск." />}
      <p className="hint">Оборот — сумма заказов, которые боты оформили для клиента за 30 дней. Нажмите на клиента, чтобы открыть его бота.</p>
      {creating && <CreateBot onClose={() => setCreating(false)} />}
    </div>
  );
}

// ── Карточка бота клиента ──
function AdminBot({ cid, tab }) {
  const { api, nav, toast } = useApp();
  const { data, error, loading, reload, setData } = useLoad(() => api.get(`/api/admin/client/${encodeURIComponent(cid)}`), [cid], false);
  const [confirm, setConfirm] = useState(null);
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const c = data.client;
  const paused = c.status === "paused";
  const tg = (data.channels || []).find((x) => x.type === "telegram");
  const p = paidInfo(c.paid_until);
  const setPause = async (on) => {
    await api.post(`/api/admin/client/${cid}/update`, { status: on ? "paused" : "active" });
    toast(on ? "Бот на паузе — клиенты получат «напишем позже»" : "Бот снова отвечает клиентам");
    reload();
  };
  const tabs = [["bot", "Бот"], ["connect", "Подключение"], ["pay", "Оплата и доступ"]];
  return (
    <div className="wrap">
      <nav aria-label="Навигация" className="row" style={{ gap: 6, fontSize: 13 }}>
        <a href="#/admin/clients" style={{ color: "var(--dim)", fontWeight: 700 }}>Клиенты</a><span className="muted">/</span><span className="muted">{c.name}</span>
      </nav>
      <header className="between" style={{ flexWrap: "wrap" }}>
        <div className="row" style={{ gap: 14, minWidth: 0 }}>
          <span className="tile" style={{ width: 56, height: 56, borderRadius: 14, fontSize: 18 }}>{initials(c.name)}</span>
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <h1 className="h1" style={{ fontSize: 26 }}>{c.name}</h1>
              {paused ? <Pill color="var(--bad)" bg="var(--bad-soft)" dot="var(--bad)">На паузе</Pill>
                : tg?.enabled ? <Pill color="var(--ok)" bg="var(--ok-soft)" dot="var(--ok)">Бот на связи</Pill>
                : <Pill color="var(--faint)" dot="#5C6270">Не подключён</Pill>}
            </div>
            <div className="sub" style={{ marginTop: 4 }}>{[c.city, c.plan && `тариф ${c.plan}`, c.paid_until && `оплачен до ${p.text}`].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Btn kind="primary" icon="eye" onClick={() => nav(`c/${cid}/today`)}>Открыть кабинет клиента</Btn>
          <Btn icon={paused ? "play" : "pause"} onClick={() => paused ? setPause(false) : setConfirm("pause")}>{paused ? "Включить бота" : "Пауза"}</Btn>
        </div>
      </header>
      <div className="tabs" role="tablist">
        {tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => nav(`admin/bot/${cid}/${k}`)}>{l}</button>)}
        <button type="button" role="tab" aria-selected={false} onClick={() => nav(`c/${cid}/orders`)}>Заказы</button>
        <button type="button" role="tab" aria-selected={false} onClick={() => nav(`c/${cid}/dialogs`)}>Диалоги</button>
        <button type="button" role="tab" aria-selected={false} onClick={() => nav(`c/${cid}/catalog`)}>Каталог</button>
      </div>
      {tab === "connect" ? <BotConnect cid={cid} data={data} reload={reload} />
        : tab === "pay" ? <BotPay cid={cid} data={data} reload={reload} />
        : <BotMain cid={cid} data={data} setData={setData} reload={reload} />}
      {confirm === "pause" && <Confirm title="Поставить бота на паузу?" text="Бот перестанет отвечать. Клиенты получат сообщение «Сейчас не можем ответить — напишем вам чуть позже». Их сообщения будут видны в кабинете." ok="Поставить на паузу" danger onOk={() => setPause(true)} onClose={() => setConfirm(null)} />}
    </div>
  );
}

function ModePicker({ value, onChange, name = "mode" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 12 }}>
      {Object.entries(MODE).map(([k, m]) => {
        const on = value === k;
        return (
          <label key={k} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: "16px 16px 16px 48px", borderRadius: 12, border: on ? "2px solid var(--accent)" : "1px solid var(--line2)", background: on ? "var(--accent-soft)" : "var(--input)", cursor: "pointer", minHeight: 120 }}>
            <input type="radio" name={name} value={k} checked={on} onChange={() => onChange(k)} style={{ position: "absolute", left: 16, top: 17, width: 18, height: 18, margin: 0, accentColor: "var(--accent)" }} />
            <span className="row" style={{ gap: 8 }}><span style={{ fontSize: 15, fontWeight: 800 }}>{m.label}</span>{m.rec && <span className="pill" style={{ background: "#1E232D", color: "var(--dim)", fontSize: 11.5 }}>советуем</span>}</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--dim)" }}>{m.text}</span>
          </label>
        );
      })}
    </div>
  );
}

function RulesBox({ mode, rules, setRules, wait, setWait, fallback, setFallback, stats, bigLimit, setBigLimit }) {
  return (
    <div className="card tight" style={{ background: "var(--input)", display: "flex", flexDirection: "column", gap: 12 }}>
      {mode === "mixed" && <>
        <div className="between" style={{ flexWrap: "wrap" }}><span style={{ fontSize: 14, fontWeight: 800 }}>Что бот отдаёт вам на одобрение</span>{stats && <span className="hint">{stats}</span>}</div>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }} role="group" aria-label="Что уходит на одобрение">
          {Object.entries(RULES).map(([k, l]) => <Chip key={k} on={rules.includes(k)} onClick={() => setRules(rules.includes(k) ? rules.filter((x) => x !== k) : [...rules, k])}>{k === "big" ? `Заказ дороже ${num(bigLimit || 20000)} ₽` : l}</Chip>)}
        </div>
        {setBigLimit && rules.includes("big") && (
          <label className="row" style={{ flexWrap: "wrap", gap: 10, fontSize: 14, fontWeight: 600 }}>Крупный заказ — от
            <input className="inp" inputMode="numeric" style={{ width: 130, minHeight: 40 }} value={bigLimit} onChange={(e) => setBigLimit(e.target.value.replace(/[^\d]/g, ""))} aria-label="Сумма крупного заказа" /> ₽
          </label>
        )}
        <span className="hint">Всё остальное — цены, наличие, доставку по условиям — бот отвечает сам.</span>
      </>}
      {mode === "trainee" && <><span style={{ fontSize: 14, fontWeight: 800 }}>Все ответы — сначала вам</span><span className="hint" style={{ fontSize: 13.5 }}>Бот пишет черновик, вы нажимаете «Отправить» или правите текст. Через неделю посмотрите, сколько черновиков ушло без правок, — обычно после этого переходят на «Смешанный».</span></>}
      {mode === "auto" && <><span style={{ fontSize: 14, fontWeight: 800 }}>Черновиков нет</span><span className="hint" style={{ fontSize: 13.5 }}>Бот отвечает сам всегда. Вам приходят только новые заказы и просьбы клиента позвать человека.</span></>}
      {mode !== "auto" && (
        <div className="row" style={{ flexWrap: "wrap", gap: 10, paddingTop: 12, borderTop: "1px solid var(--line)", fontSize: 14 }}>
          <label htmlFor="s-wait" style={{ fontWeight: 600 }}>Если вы не ответили за</label>
          <select id="s-wait" className="inp" style={{ width: "auto", minHeight: 40 }} value={String(wait)} onChange={(e) => setWait(Number(e.target.value))}>{[5, 10, 15, 30, 60].map((m) => <option key={m} value={m}>{m} минут</option>)}</select>
          <span style={{ fontWeight: 600 }}>, бот</span>
          <select aria-label="Что сделает бот" className="inp" style={{ width: "auto", minHeight: 40, maxWidth: "100%" }} value={fallback} onChange={(e) => setFallback(e.target.value)}>
            <option value="hold">напишет клиенту «Уточняю, вернусь через пару минут»</option>
            <option value="send">отправит свой черновик</option>
          </select>
        </div>
      )}
    </div>
  );
}

function BotMain({ cid, data, setData, reload }) {
  const { api, toast, nav } = useApp();
  const c = data.client;
  const [mode, setMode] = useState(c.bot_mode || "auto");
  const [rules, setRules] = useState(c.approval_rules || []);
  const [wait, setWait] = useState(c.draft_wait_min ?? 10);
  const [fallback, setFallback] = useState(c.draft_fallback || "hold");
  const [prompt, setPrompt] = useState(data.prompt || "");
  const [busy, setBusy] = useState("");
  const [history, setHistory] = useState(null);
  const [fix, setFix] = useState(null);
  const modeDirty = mode !== (c.bot_mode || "auto") || JSON.stringify(rules) !== JSON.stringify(c.approval_rules || []) || wait !== (c.draft_wait_min ?? 10) || fallback !== (c.draft_fallback || "hold");
  const saveMode = async () => {
    setBusy("mode");
    try { await api.post(`/api/c/${cid}/settings`, { bot_mode: mode, approval_rules: rules, draft_wait_min: wait, draft_fallback: fallback }); toast(`Режим «${MODE[mode].label}» сохранён`); reload(); }
    catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const savePrompt = async () => {
    setBusy("prompt");
    try { await api.post("/api/update-prompt", { client_id: cid, prompt }); toast("Инструкция сохранена — бот уже работает по-новому"); reload(); }
    catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const analyze = async () => {
    setBusy("an");
    try { const r = await api.post(`/api/admin/client/${cid}/analyze`); setData((d) => ({ ...d, analysis: r })); toast("Диалоги разобраны"); }
    catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const s = data.stats;
  const an = data.analysis;
  const FK = { error: ["Ошибка", "var(--warn)", "var(--warn-soft)"], demand: ["Спрос", "var(--accent-text)", "var(--accent-soft)"], idea: ["Идея", "var(--dim)", "#1B2029"], ok: ["Решено", "var(--ok)", "var(--ok-soft)"] };
  return (
    <div className="cols">
      <div className="col" style={{ flex: "3 1 560px" }}>
        <section className="card" aria-labelledby="mode-t" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="between"><h2 id="mode-t" className="h2">Режим работы бота</h2>{modeDirty && <Btn kind="primary" size="sm" loading={busy === "mode"} onClick={saveMode}>Сохранить режим</Btn>}</div>
          {!data.schema && <div className="hint" style={{ color: "var(--warn)" }}>Режимы заработают после обновления базы (SQL-файл).</div>}
          <ModePicker value={mode} onChange={setMode} name="admin-mode" />
          <RulesBox mode={mode} rules={rules} setRules={setRules} wait={wait} setWait={setWait} fallback={fallback} setFallback={setFallback} />
        </section>
        <section className="card" aria-labelledby="pr-t" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="between" style={{ flexWrap: "wrap" }}><h2 id="pr-t" className="h2">Инструкция бота</h2><span className="hint">видит только админ{data.prompts?.length ? ` · ${data.prompts.length} ${plural(data.prompts.length, "прошлая версия", "прошлые версии", "прошлых версий")}` : ""}</span></div>
          <textarea className="inp mono" aria-label="Инструкция бота" rows={12} value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ fontSize: 13, lineHeight: 1.65, minHeight: 240 }} />
          <div className="row" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
            {data.prompts?.length > 0 && <Btn onClick={() => setHistory([])}>История версий</Btn>}
            <Btn kind="primary" disabled={prompt === data.prompt} loading={busy === "prompt"} onClick={savePrompt}>Сохранить</Btn>
          </div>
        </section>
        <section className="card" aria-labelledby="an-t" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="between" style={{ flexWrap: "wrap" }}>
            <div><h2 id="an-t" className="h2">Разбор последних диалогов</h2><div className="hint" style={{ marginTop: 4 }}>ИИ проверяет переписки каждую ночь{an?.at ? ` · последний раз ${whenShort(an.at)}` : ""}</div></div>
            <Btn loading={busy === "an"} onClick={analyze} icon="refresh">Проверить сейчас</Btn>
          </div>
          {!an && <div className="hint">Ещё не было разбора. Нажмите «Проверить сейчас», когда у бота наберётся хотя бы 5 диалогов.</div>}
          {an?.summary && <div className="hint" style={{ fontSize: 13.5, color: "var(--dim)" }}>{an.summary}</div>}
          {(an?.findings || []).map((f, i) => {
            const [lab, col, bg] = FK[f.kind] || FK.idea;
            return (
              <div key={i} className="row" style={{ flexWrap: "wrap", gap: 14, padding: 14, borderRadius: 12, background: "var(--card2)", border: "1px solid var(--line)" }}>
                <span className="pill" style={{ background: bg, color: col, textTransform: "uppercase", letterSpacing: .4, fontSize: 11.5 }}>{lab}</span>
                <div style={{ flex: "1 1 240px", minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>{f.title}</div><div className="hint" style={{ marginTop: 3 }}>{f.text}</div></div>
                {f.kind !== "ok" && f.fix && <Btn onClick={() => setFix(f.fix)}>Добавить правило</Btn>}
                {f.kind === "demand" && <Btn onClick={() => nav(`c/${cid}/catalog?new=${encodeURIComponent(f.product || "")}`)}>Добавить товар</Btn>}
              </div>
            );
          })}
        </section>
      </div>
      <div className="col" style={{ flex: "2 1 340px" }}>
        <TestChat cid={cid} mode={mode} />
        <section className="card" aria-labelledby="st-t">
          <h2 id="st-t" className="h2" style={{ marginBottom: 6 }}>Работа бота за 30 дней</h2>
          {[["Диалогов", num(s.dialogs)], ["Ответил сам", s.self_pct != null ? <><span className="hint">{num(s.self)} {plural(s.self, "диалог", "диалога", "диалогов")}</span> {s.self_pct}%</> : "—"], ["Ушло на одобрение", <><span className="hint">{num(s.drafts)} {plural(s.drafts, "черновик", "черновика", "черновиков")}</span> {s.drafts_pct ?? 0}%</>], ["Передано менеджеру", <><span className="hint">{num(s.handoffs)}</span> {s.handoffs_pct ?? 0}%</>], ["Скорость ИИ", s.avg_ms ? secs(s.avg_ms) : "—"], ["Расход ИИ", <><span className="hint">{(s.tokens / 1e6).toFixed(1).replace(".", ",")} млн токенов</span> {rub(s.cost)}</>]].map(([l, v]) => (
            <div key={l} className="between" style={{ padding: "12px 0", borderTop: "1px solid var(--line3)", fontSize: 14 }}><span className="dim">{l}</span><span style={{ fontWeight: 800, display: "flex", gap: 8, alignItems: "baseline" }}>{v}</span></div>
          ))}
        </section>
      </div>
      {history && <PromptHistory list={data.prompts} onClose={() => setHistory(null)} onPick={(t) => { setPrompt(t); setHistory(null); toast("Версия подставлена — нажмите «Сохранить», чтобы вернуть её"); }} />}
      {fix !== null && <FixModal cid={cid} text={fix} onClose={() => setFix(null)} onDone={(np) => { setPrompt(np); setData((d) => ({ ...d, prompt: np })); }} />}
    </div>
  );
}

function FixModal({ cid, text, onClose, onDone }) {
  const { api, toast } = useApp();
  const [t, setT] = useState(text);
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Добавить правило в инструкцию" onClose={onClose} footer={<><Btn onClick={onClose}>Отмена</Btn><Btn kind="primary" loading={busy} onClick={async () => { setBusy(true); try { const r = await api.post(`/api/admin/client/${cid}/apply-fix`, { text: t }); onDone(r.prompt); toast("Правило добавлено — бот уже его учитывает"); onClose(); } catch (e) { toast(e.message, "bad"); setBusy(false); } }}>Добавить</Btn></>}>
      <div className="hint">Правило допишется в конец инструкции. Можно поправить формулировку.</div>
      <textarea className="inp" rows={5} value={t} onChange={(e) => setT(e.target.value)} />
    </Modal>
  );
}

function PromptHistory({ list, onClose, onPick }) {
  const { api, toast } = useApp();
  const [open, setOpen] = useState(null);
  return (
    <Modal title="История версий" onClose={onClose} wide>
      {open ? (<>
        <div className="hint">Версия от {whenShort(open.created_at)}</div>
        <textarea className="inp mono" readOnly rows={14} value={open.prompt} style={{ fontSize: 12.5 }} />
        <div className="row" style={{ justifyContent: "flex-end" }}><Btn onClick={() => setOpen(null)}>Назад</Btn><Btn kind="primary" onClick={() => onPick(open.prompt)}>Вернуть эту версию</Btn></div>
      </>) : (
        <div>{list.map((p) => (
          <button key={p.id} type="button" className="list-row" style={{ width: "100%", background: "transparent", border: 0, borderTop: "1px solid var(--line3)", cursor: "pointer", textAlign: "left", color: "var(--text)" }}
            onClick={async () => { try { setOpen(await api.get(`/api/admin/prompt/${p.id}`)); } catch (e) { toast(e.message, "bad"); } }}>
            <Icon name="clock" size={18} /><span style={{ flex: 1, fontWeight: 700 }}>Версия от {whenShort(p.created_at)}</span><Icon name="right" size={18} />
          </button>
        ))}</div>
      )}
    </Modal>
  );
}

function TestChat({ cid, mode }) {
  const { api } = useApp();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef(null);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs, busy]);
  const send = async (e) => {
    e && e.preventDefault();
    const t = text.trim(); if (!t || busy) return;
    const hist = [...msgs.filter((m) => m.role !== "note").map((m) => ({ role: m.role, content: m.content })), { role: "user", content: t }];
    setMsgs([...msgs, { role: "user", content: t }]); setText(""); setBusy(true);
    try {
      const r = await api.post(`/api/c/${cid}/test-chat`, { history: hist });
      setMsgs((m) => [...m, { role: "assistant", content: r.reply, draft: r.would_draft ? (r.draft_reason || "режим «Стажёр»") : null, order: r.order, photos: r.photos }]);
    } catch (e2) { setMsgs((m) => [...m, { role: "note", content: e2.message }]); }
    setBusy(false);
  };
  return (
    <section className="card" aria-labelledby="tc-t" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="between"><h2 id="tc-t" className="h2">Тест-чат</h2><span className="hint">не попадает в заказы</span></div>
      <div ref={box} style={{ background: "var(--input)", border: "1px solid var(--line)", borderRadius: 12, padding: 12, minHeight: 200, maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {!msgs.length && <div className="hint" style={{ margin: "auto", textAlign: "center" }}>Напишите как покупатель — бот ответит по текущей инструкции и каталогу.</div>}
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="bubble" style={{ alignSelf: "flex-end", maxWidth: "85%", borderRadius: "14px 14px 4px 14px", background: "var(--accent-soft)" }}>{m.content}</div>
        ) : m.role === "note" ? (
          <div key={i} className="hint" style={{ color: "var(--bad)" }}>{m.content}</div>
        ) : m.draft ? (
          <div key={i} className="draft" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6, maxWidth: "95%" }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--warn)", textTransform: "uppercase", letterSpacing: .4 }}>Ушло бы на одобрение</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</span>
            <span className="hint">Причина: {m.draft}</span>
          </div>
        ) : (
          <div key={i} className="bubble" style={{ alignSelf: "flex-start", maxWidth: "90%", borderRadius: "14px 14px 14px 4px", background: "#1A1F28" }}>
            {m.content}
            {(m.order || (m.photos && m.photos.length)) && <div className="hint" style={{ marginTop: 6 }}>{m.order ? "✓ заказ был бы оформлен" : ""}{m.order && m.photos?.length ? " · " : ""}{m.photos?.length ? `+ фото: ${m.photos.join(", ")}` : ""}</div>}
          </div>
        ))}
        {busy && <div className="hint">Бот печатает…</div>}
      </div>
      <form onSubmit={send} className="row">
        <input className="inp" placeholder="Напишите как клиент…" aria-label="Сообщение боту" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn primary" aria-label="Отправить" style={{ width: 48, padding: 0 }} disabled={busy}><Icon name="plane" size={18} /></button>
      </form>
      {msgs.length > 0 && <button type="button" className="btn ghost sm" style={{ alignSelf: "flex-start" }} onClick={() => setMsgs([])}>Очистить</button>}
    </section>
  );
}

function BotConnect({ cid, data, reload }) {
  const { api, toast, nav } = useApp();
  const c = data.client;
  const tg = (data.channels || []).find((x) => x.type === "telegram");
  const [newToken, setNewToken] = useState("");
  const [staff, setStaff] = useState(c.staff_chat_id || "");
  const [info, setInfo] = useState({ name: c.name || "", city: c.city || "", business_type: c.business_type || "order" });
  const [busy, setBusy] = useState("");
  const [del, setDel] = useState(false);
  const wh = data.webhook;
  const run = async (key, fn) => { setBusy(key); try { await fn(); } catch (e) { toast(e.message, "bad"); } setBusy(""); };
  return (
    <div className="cols">
      <div className="col" style={{ flex: "1 1 460px" }}>
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 className="h2">Telegram-бот</h2>
          <div className="between" style={{ flexWrap: "wrap" }}>
            <div><div style={{ fontWeight: 700 }}>Токен</div><div className="mono hint" style={{ marginTop: 3 }}>{tg ? tg.token_mask : "не подключён"}</div></div>
            {wh ? (wh.ok ? <Pill color="var(--ok)" bg="var(--ok-soft)" dot="var(--ok)">Получает сообщения</Pill> : <Pill color="var(--bad)" bg="var(--bad-soft)" dot="var(--bad)">{wh.error || "Не получает сообщения"}</Pill>) : <span className="hint">проверка — раз в 30 минут</span>}
          </div>
          <Btn loading={busy === "wh"} icon="refresh" onClick={() => run("wh", async () => { const r = await api.post("/api/reconnect-webhook", { client_id: cid, base_url: API }); toast(r.results?.every((x) => x.ok) ? "Бот переподключён" : "Telegram не принял — проверьте токен", r.results?.every((x) => x.ok) ? "ok" : "bad"); reload(); })}>Переподключить</Btn>
          <label className="lbl">Новый токен (после смены в @BotFather)<input className="inp" type="password" autoComplete="off" value={newToken} onChange={(e) => setNewToken(e.target.value)} placeholder="1234567890:AA…" /></label>
          <Btn kind="primary" disabled={!newToken.trim()} loading={busy === "tok"} onClick={() => run("tok", async () => { const r = await api.post("/api/update-token", { client_id: cid, token: newToken.trim(), base_url: API }); setNewToken(""); toast(r.webhook ? "Токен обновлён, бот подключён" : "Токен сохранён, но Telegram не принял вебхук", r.webhook ? "ok" : "bad"); reload(); })}>Сохранить токен</Btn>
        </section>
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 className="h2">Группа для заказов</h2>
          <div className="hint">Сюда бот присылает заказы, черновики и просьбы позвать менеджера. Добавьте бота в группу и укажите её ID (начинается с -100).</div>
          <div className="row"><input className="inp" aria-label="ID группы" value={staff} onChange={(e) => setStaff(e.target.value)} placeholder="-100…" /><Btn loading={busy === "staff"} disabled={staff === (c.staff_chat_id || "")} onClick={() => run("staff", async () => { await api.post(`/api/admin/client/${cid}/update`, { staff_chat_id: staff }); toast("Группа сохранена"); reload(); })}>Сохранить</Btn></div>
        </section>
      </div>
      <div className="col" style={{ flex: "1 1 380px" }}>
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 className="h2">О бизнесе</h2>
          <label className="lbl">Название<input className="inp" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /></label>
          <label className="lbl">Город и ниша<input className="inp" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} /></label>
          <label className="lbl">Что делает бот<select className="inp" value={info.business_type} onChange={(e) => setInfo({ ...info, business_type: e.target.value })}><option value="order">Принимает заказы</option><option value="lead">Собирает заявки</option></select></label>
          <Btn kind="primary" loading={busy === "info"} onClick={() => run("info", async () => { await api.post(`/api/admin/client/${cid}/update`, info); toast("Сохранено"); reload(); })}>Сохранить</Btn>
        </section>
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 10, borderColor: "rgba(248,113,113,.3)" }}>
          <h2 className="h2">Удалить бота</h2>
          <div className="hint">Удалятся заказы, диалоги, каталог и настройки. Бот перестанет отвечать. Отменить нельзя.</div>
          <Btn kind="danger" icon="trash" onClick={() => setDel(true)}>Удалить бота</Btn>
        </section>
      </div>
      {del && <Confirm title={`Удалить «${c.name}»?`} text="Все данные бота будут удалены без возможности восстановления." ok="Удалить навсегда" danger onClose={() => setDel(false)} onOk={async () => { await api.post("/api/delete-client", { client_id: cid }); toast("Бот удалён"); nav("admin/clients"); }} />}
    </div>
  );
}

function BotPay({ cid, data, reload }) {
  const { api, toast } = useApp();
  const c = data.client;
  const [f, setF] = useState({ plan: c.plan || "", plan_price: c.plan_price ?? "", paid_until: c.paid_until || "" });
  const [login, setLogin] = useState(data.login || "");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState("");
  const panelUrl = window.location.origin;
  const run = async (key, fn) => { setBusy(key); try { await fn(); } catch (e) { toast(e.message, "bad"); } setBusy(""); };
  const addMonth = () => {
    const base = f.paid_until && f.paid_until > dayKey(Date.now()) ? new Date(f.paid_until + "T00:00:00Z") : new Date(dayKey(Date.now()) + "T00:00:00Z");
    base.setUTCMonth(base.getUTCMonth() + 1);
    setF({ ...f, paid_until: base.toISOString().slice(0, 10) });
  };
  return (
    <div className="cols">
      <section className="card col" style={{ flex: "1 1 420px", gap: 12 }}>
        <h2 className="h2">Тариф и оплата</h2>
        <div className="wrapflex" style={{ gap: 12 }}>
          <label className="lbl" style={{ flex: "1 1 160px" }}>Тариф<input className="inp" value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value })} placeholder="Старт, Бизнес, Про…" /></label>
          <label className="lbl" style={{ flex: "1 1 140px" }}>Цена, ₽ в месяц<input className="inp" inputMode="numeric" value={f.plan_price} onChange={(e) => setF({ ...f, plan_price: e.target.value })} /></label>
        </div>
        <label className="lbl">Оплачен до<div className="row"><input className="inp" type="date" value={f.paid_until || ""} onChange={(e) => setF({ ...f, paid_until: e.target.value })} /><Btn onClick={addMonth}>+ месяц</Btn></div></label>
        <div className="hint">За 3 дня до конца оплаты клиент появится в «Требует внимания», а вам придёт напоминание в Telegram.</div>
        <Btn kind="primary" loading={busy === "pay"} onClick={() => run("pay", async () => { await api.post(`/api/admin/client/${cid}/update`, f); toast("Оплата сохранена"); reload(); })}>Сохранить</Btn>
      </section>
      <section className="card col" style={{ flex: "1 1 420px", gap: 12 }}>
        <h2 className="h2">Доступ в кабинет клиента</h2>
        <div className="hint">Клиент видит только свой бизнес: заказы, диалоги, аналитику, каталог и настройки бота. Инструкцию бота и оплату он не видит.</div>
        <label className="lbl">Логин<input className="inp" autoComplete="off" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="например, lavka" /></label>
        <label className="lbl">{data.login ? "Новый пароль" : "Пароль"}<input className="inp" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="от 4 символов" /></label>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Btn kind="primary" disabled={!login.trim() || pass.length < 4} loading={busy === "login"} onClick={() => run("login", async () => { await api.post(`/api/admin/client/${cid}/login`, { login: login.trim(), password: pass }); toast("Доступ сохранён"); reload(); })}>{data.login ? "Сменить пароль" : "Создать доступ"}</Btn>
          {login && pass && <Btn icon="copy" onClick={async () => { try { await navigator.clipboard.writeText(`Кабинет ChatAIbot: ${panelUrl}\nЛогин: ${login}\nПароль: ${pass}`); toast("Скопировано — отправьте клиенту"); } catch (e) { toast("Не удалось скопировать", "bad"); } }}>Скопировать для клиента</Btn>}
        </div>
        {data.login && <div className="hint">Сейчас логин клиента: <b style={{ color: "var(--text)" }}>{data.login}</b></div>}
      </section>
    </div>
  );
}

// ── Система ──
function AdminSystem() {
  const { api, toast } = useApp();
  const { data, error, loading, reload, setData } = useLoad(() => api.get("/api/admin/system"), [], false);
  const [busy, setBusy] = useState("");
  const [st, setSt] = useState(null);
  useEffect(() => { if (data && !st) setSt(data.settings); }, [data]); // eslint-disable-line
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const b = data.brief; const e = b.egress; const ai = data.ai;
  const run = async (key, fn) => { setBusy(key); try { await fn(); } catch (ex) { toast(ex.message, "bad"); } setBusy(""); };
  const whBad = (data.webhooks || []).filter((w) => w.state === "error");
  const comps = [
    { t: "Сервер", v: "Railway", ok: true, label: "Работает", rows: [["Версия", data.version], ["Запущен", whenShort(data.started_at)]] },
    { t: "База данных", v: "Supabase", ok: data.db.ok && (!e || e.pct_projected < 80), warn: e && e.pct_projected >= 80, label: !data.db.ok ? "Не отвечает" : e && e.pct_projected >= 80 ? "Внимание" : "Работает",
      rows: e ? [["Трафик в этом цикле", `${bytes(e.used)} из ${bytes(e.limit)}`], ["Цикл оплаты", `${dateLabel(e.cycle_start)} — ${dateLabel(e.cycle_end)}`], ["Ответ базы", `${data.db.ms} мс`]] : [["Ответ базы", `${data.db.ms} мс`], ["Трафик", "после обновления базы"]], bar: e },
    { t: "ИИ", v: "DeepSeek", ok: ai.errors_24h < 3, warn: ai.errors_24h >= 3, label: ai.errors_24h >= 3 ? "Сбои" : "Отвечает", rows: [["Средний ответ", ai.avg_ms ? secs(ai.avg_ms) : "—"], ["Ошибок за сутки", String(ai.errors_24h)], ["Расход за 30 дней", rub(ai.cost_30)]] },
    { t: "Telegram-боты", v: "вебхуки", ok: !whBad.length, warn: whBad.length > 0, label: (data.webhooks || []).length ? `${data.webhooks.filter((w) => w.ok).length} из ${data.webhooks.filter((w) => w.state !== "off").length}` : "—", rows: [["Последняя проверка", b.telegram?.checked_at ? hhmm(b.telegram.checked_at * 1000) : "—"], ...whBad.slice(0, 3).map((w) => [w.name, w.error || "ошибка"])] },
    { t: "Резервные копии", v: "настройки и каталоги", ok: !!b.backup?.ok, warn: b.backup && !b.backup.ok, label: b.backup?.ok ? "Сохранена" : b.backup ? "Ошибка" : "Ещё не было", rows: [["Последняя", b.backup?.at ? whenShort(b.backup.at) : "—"], ["Размер", b.backup?.size ? bytes(b.backup.size) : "—"], ["Куда", "в Telegram, каждую ночь в 02:30"]] },
    { t: "Панель", v: "Vercel", ok: true, label: "Работает", rows: [["Панель", window.location.host], ["API", API.replace(/^https?:\/\//, "")]] },
  ];
  const warns = [];
  if (e && e.pct_projected >= 80) warns.push(`За ${e.days_passed} ${plural(e.days_passed, "день", "дня", "дней")} цикла база отдала ${bytes(e.used)}. В таком темпе к ${dateLabel(e.cycle_end)} будет ${bytes(e.projected)} — ${Math.round(e.pct_projected)}% лимита. На 100% Supabase ограничит базу, и боты замолчат.`);
  if (ai.errors_24h >= 3) warns.push(`ИИ не ответил ${ai.errors_24h} раз за сутки — клиентов переводили на оператора.`);
  if (whBad.length) warns.push(`${whBad.map((w) => w.name).join(", ")}: бот не получает сообщения.`);
  if (!data.schema) warns.push("База не обновлена: запустите SQL-файл update-v2.sql в Supabase.");
  const saveSettings = () => run("set", async () => { const r = await api.post("/api/admin/system/settings", st); setSt(r.settings); toast("Настройки сохранены"); });
  return (
    <div className="wrap">
      <PageHead title="Система" sub="Всё, от чего зависят боты · проверка вебхуков каждые 30 минут" right={<>
        <Btn loading={busy === "bk"} icon="download" onClick={() => run("bk", async () => { const r = await api.post("/api/admin/system/backup"); toast(r.ok ? "Копия отправлена в Telegram" : (r.error || "Не получилось"), r.ok ? "ok" : "bad"); reload(); })}>Сделать копию</Btn>
        <Btn kind="primary" loading={busy === "chk"} icon="refresh" onClick={() => run("chk", async () => { const r = await api.post("/api/admin/system/check"); setData(r); toast("Проверено"); })}>Проверить сейчас</Btn>
      </>} />
      <div className="banner" style={{ background: warns.length ? "rgba(245,181,68,.07)" : "var(--ok-soft)", border: `1px solid ${warns.length ? "rgba(245,181,68,.35)" : "rgba(52,211,153,.3)"}`, padding: 18 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: warns.length ? "var(--warn-soft)" : "rgba(52,211,153,.16)", color: warns.length ? "var(--warn)" : "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={warns.length ? "alert" : "check"} sw={2} /></span>
        <div style={{ flex: "1 1 300px" }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{warns.length ? `Есть ${warns.length} ${plural(warns.length, "предупреждение", "предупреждения", "предупреждений")}` : "Всё работает"}</div>
          {warns.map((w, i) => <div key={i} className="hint" style={{ fontSize: 13.5, marginTop: 4, color: "var(--dim)" }}>{w}</div>)}
          {!warns.length && <div className="hint" style={{ marginTop: 4 }}>Боты на связи, база и ИИ отвечают, копии сохраняются.</div>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16 }}>
        {comps.map((c) => (
          <section key={c.t} className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="between" style={{ alignItems: "flex-start", paddingBottom: 8 }}>
              <div><h2 className="h2">{c.t}</h2><div className="hint" style={{ marginTop: 2 }}>{c.v}</div></div>
              <Pill color={c.warn ? "var(--warn)" : c.ok ? "var(--ok)" : "var(--faint)"} bg={c.warn ? "var(--warn-soft)" : c.ok ? "var(--ok-soft)" : "#1B2029"} dot={c.warn ? "var(--warn)" : c.ok ? "var(--ok)" : "#5C6270"}>{c.label}</Pill>
            </div>
            {c.bar && <div style={{ padding: "6px 0 10px" }}><div className="between" style={{ fontSize: 12.5, marginBottom: 6 }}><span className="hint">сейчас {Math.round(c.bar.pct_used)}%</span><span style={{ color: c.bar.pct_projected >= 80 ? "var(--warn)" : "var(--ok)", fontWeight: 800 }}>прогноз {Math.round(c.bar.pct_projected)}% к {dateLabel(c.bar.cycle_end)}</span></div><div style={{ marginLeft: -20 }}><EgressBar e={c.bar} /></div></div>}
            {c.rows.map(([l, v]) => <div key={l} className="between" style={{ padding: "9px 0", borderTop: "1px solid var(--line3)", fontSize: 13.5 }}><span className="dim">{l}</span><span style={{ fontWeight: 700, textAlign: "right", wordBreak: "break-all" }}>{v}</span></div>)}
          </section>
        ))}
      </div>
      <div className="cols">
        <section className="card col" style={{ flex: "3 1 520px", gap: 2 }}>
          <div className="between" style={{ paddingBottom: 8 }}><h2 className="h2">Журнал событий</h2><span className="hint">обновления, копии, сбои</span></div>
          <EventFeed events={data.journal} showClient empty="Пока событий нет." />
        </section>
        {st && (
          <section className="card col" style={{ flex: "2 1 360px", gap: 12 }}>
            <h2 className="h2">Сообщать о сбоях</h2>
            <div className="hint">Сообщение придёт в Telegram сразу, без захода в панель.</div>
            <label className="lbl">Куда отправлять (ID чата или группы)
              <div className="row"><input className="inp" value={st.admin_chat_id || ""} onChange={(ev) => setSt({ ...st, admin_chat_id: ev.target.value })} placeholder={data.admin_chat || "ваш Telegram ID"} />
                <Btn loading={busy === "ta"} onClick={() => run("ta", async () => { await api.post("/api/admin/system/settings", st); await api.post("/api/admin/system/test-alert"); toast("Проверочное сообщение отправлено"); })}>Проверить</Btn></div>
            </label>
            {!data.alert_bot && <div className="hint" style={{ color: "var(--warn)" }}>Нет бота для уведомлений: подключите бота «ChatAIbot» (заявки) или задайте ALERT_BOT_TOKEN.</div>}
            {[["silent_bot", "Бот не может ответить клиентам"], ["egress", "Трафик базы выше 80% лимита"], ["webhook", "Бот перестал получать сообщения"], ["slow_ai", "ИИ отвечает медленнее 5 секунд"]].map(([k, l]) => (
              <label key={k} className="row" style={{ minHeight: 40, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={(st.alerts || {})[k] !== false} onChange={(ev) => setSt({ ...st, alerts: { ...(st.alerts || {}), [k]: ev.target.checked } })} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />{l}
              </label>
            ))}
            <div className="wrapflex" style={{ gap: 12, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
              <label className="lbl" style={{ flex: "1 1 120px" }}>Лимит трафика, ГБ<input className="inp" inputMode="decimal" value={st.egress_limit_gb} onChange={(ev) => setSt({ ...st, egress_limit_gb: ev.target.value })} /></label>
              <label className="lbl" style={{ flex: "1 1 120px" }}>День начала цикла<input className="inp" inputMode="numeric" value={st.cycle_day} onChange={(ev) => setSt({ ...st, cycle_day: ev.target.value })} /></label>
              <label className="lbl" style={{ flex: "1 1 120px" }}>ИИ, ₽ за 1 млн токенов<input className="inp" inputMode="decimal" value={st.ai_rub_per_m} onChange={(ev) => setSt({ ...st, ai_rub_per_m: ev.target.value })} /></label>
              <label className="lbl" style={{ flex: "1 1 120px" }}>Сервер, ₽ в месяц<input className="inp" inputMode="numeric" value={st.server_rub} onChange={(ev) => setSt({ ...st, server_rub: ev.target.value })} /></label>
            </div>
            <Btn kind="primary" loading={busy === "set"} onClick={saveSettings}>Сохранить</Btn>
          </section>
        )}
      </div>
    </div>
  );
}


// ════════════════ КАБИНЕТ КЛИЕНТА: сегодня, заказы, диалоги ════════════════
const MOBILE_Q = "(max-width: 860px)";
function useMedia(q) {
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q).matches : false);
  const [m, setM] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    f();
    if (mq.addEventListener) mq.addEventListener("change", f); else mq.addListener(f);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", f); else mq.removeListener(f); };
  }, [q]);
  return m;
}

const WD_IN = ["в прошлое воскресенье", "в прошлый понедельник", "в прошлый вторник", "в прошлую среду", "в прошлый четверг", "в прошлую пятницу", "в прошлую субботу"];
const WD_TO = ["к прошлому воскресенью", "к прошлому понедельнику", "к прошлому вторнику", "к прошлой среде", "к прошлому четвергу", "к прошлой пятнице", "к прошлой субботе"];
const WD_TO_S = ["к прошлому вс", "к прошлому пн", "к прошлому вт", "к прошлой ср", "к прошлому чт", "к прошлой пт", "к прошлой сб"];
function lastWeek(kind) { const d = msk(Date.now()).getUTCDay(); return (kind === "to" ? WD_TO : kind === "tos" ? WD_TO_S : WD_IN)[d]; }
function cap(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
function short(s, n) { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s; }
function dLong(iso) { const [, m, d] = String(iso).slice(0, 10).split("-").map(Number); return `${d} ${MONTHS[m - 1]}`; }
function shiftIso(iso, days) { const t = new Date(String(iso).slice(0, 10) + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + days); return t.toISOString().slice(0, 10); }
function shortWhen(ts) {
  if (!ts) return "";
  if (isToday(ts)) return hhmm(ts);
  if (dayKey(ts) === dayKey(Date.now() - 864e5)) return "вчера";
  const d = msk(ts); return `${d.getUTCDate()} ${MONTHS_S[d.getUTCMonth()]}`;
}
function dayTitle(ts) {
  if (isToday(ts)) return "Сегодня";
  if (dayKey(ts) === dayKey(Date.now() - 864e5)) return "Вчера";
  return dayMonth(ts);
}

// ── Заказы: статусы и разбор текста ──
const bizType = (t) => (t === "lead" ? "lead" : "order");
function stLabel(type, s) { return ORDER_ST[bizType(type)][s] || s; }
const NEXT_STEP = {
  order: { new: ["accepted", "Принять заказ"], accepted: ["cooking", "Начать сборку"], cooking: ["delivering", "Передать курьеру"], delivering: ["done", "Заказ выполнен"] },
  lead: { new: ["accepted", "Связались"], accepted: ["cooking", "Взять в работу"], cooking: ["done", "Закрыть заявку"], delivering: ["done", "Закрыть заявку"] },
};
const BOARD = {
  order: [["new", ["new"], "Новые", "var(--accent-text)"], ["work", ["accepted", "cooking"], "В работе", "var(--warn)"], ["way", ["delivering"], "В пути", "var(--sky)"], ["done", ["done"], "Выполнены", "var(--ok)"]],
  lead: [["new", ["new"], "Новые", "var(--accent-text)"], ["work", ["accepted", "cooking", "delivering"], "В работе", "var(--warn)"], ["done", ["done"], "Закрыты", "var(--ok)"]],
};
const PERIODS = [["today", "Сегодня"], ["7d", "7 дней"], ["30d", "30 дней"], ["90d", "3 месяца"]];

function orderInfo(o) {
  const items = Array.isArray(o.items_json) ? o.items_json.filter((i) => i && i.name) : [];
  const names = items.map((i) => String(i.name).toLowerCase());
  const kv = [], notes = [], extras = [];
  let total = null;
  const raw = String(o.items_text || "");
  for (const line of raw.split("\n")) {
    const ln = line.replace(/^[\s•\-*–—·✓✅▪️🔹]+/u, "").trim();
    if (!ln) continue;
    const low = ln.toLowerCase();
    if (/^(ваш заказ|ваша заявка|состав заказа|состав|заказ|заявка)\s*:?\s*$/.test(low)) continue;
    const tm = low.match(/^(итого|к оплате|сумма заказа|сумма|всего)\s*[:—–-]?\s*([\d\s]+)/);
    if (tm) { const v = parseInt(tm[2].replace(/\s/g, ""), 10); if (!isNaN(v) && v > 0) total = v; continue; }
    if (names.some((n) => low.includes(n))) continue;
    const pm = ln.match(/^(.{2,48}?)\s*[—–:-]\s*([\d\s]{1,9})\s*(₽|руб|р\.)/i);
    if (pm) { extras.push({ k: pm[1].trim(), v: parseInt(pm[2].replace(/\s/g, ""), 10) || 0 }); continue; }
    const km = ln.match(/^([^:]{1,25}[^\d\s:]):\s*(.+)$/);
    if (km) { kv.push({ k: km[1].trim(), v: km[2].trim() }); continue; }
    notes.push(ln);
  }
  const ph = raw.match(/(\+7|8)[\s\-(]*\d{3}[\s\-)]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/);
  const phone = ph ? ph[0].trim() : (kv.find((x) => /телефон/i.test(x.k)) || {}).v || null;
  return { items, kv: kv.filter((x) => !/телефон/i.test(x.k)), notes, extras, total: total ?? Number(o.total_amount || 0), phone };
}
function orderWhat(info, o) {
  if (info.items.length) return info.items.map((i) => `${i.name} × ${i.qty || 1}`).join(", ");
  return short(info.notes[0] || String(o.items_text || "").split("\n")[0] || "—", 80);
}
function orderHint(info) {
  const parts = [];
  const d = info.extras.find((x) => /достав|самовывоз|курьер/i.test(x.k)) || info.kv.find((x) => /достав|самовывоз|получение|способ/i.test(x.k));
  if (d) parts.push(typeof d.v === "string" ? `${d.k}: ${d.v}` : d.k);
  const t = info.notes.find((x) => /самовывоз|достав|\d{1,2}[:.]\d{2}|сегодня|завтра/i.test(x)) || (info.kv.find((x) => /время|когда/i.test(x.k)) || {}).v;
  if (t) parts.push(t);
  return short(parts.join(" · "), 70);
}
function isNight(ts) { const d = msk(ts); return d && d.getUTCHours() < 8; }
function personInitials(name) {
  const w = String(name || "?").replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!w.length) return "?";
  return ((w[0][0] || "") + (w[1] ? w[1][0] : "")).toUpperCase();
}

// ════════ Сегодня ════════
function ActionCard({ tone, icon, title, text, extra, action, primary, onClick }) {
  const st = { accent: ["var(--accent-soft)", "var(--accent-text)"], warn: ["var(--warn-soft)", "var(--warn)"], bad: ["var(--bad-soft)", "var(--bad)"], ok: ["var(--ok-soft)", "var(--ok)"] }[tone];
  return (
    <div className={`card ${tone === "warn" ? "draft" : ""}`} style={{ display: "flex", flexDirection: "column", gap: 14, padding: 18, borderColor: tone === "bad" ? "rgba(248,113,113,.4)" : undefined }}>
      <div className="row" style={{ alignItems: "flex-start", gap: 14 }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: st[0], color: st[1], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={icon} size={19} /></span>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--dim)" }}>{text}</div>
          {extra}
        </div>
      </div>
      {action && <Btn kind={primary ? "primary" : ""} block onClick={onClick} style={{ marginTop: "auto" }}>{action}</Btn>}
    </div>
  );
}

function CountDelta({ cur, prev, mobile }) {
  const d = cur - prev;
  if (mobile) {
    if (!d) return <span>как {lastWeek("in").replace("в прошлое воскресенье", "в прошлое вс")}</span>;
    return <><span className={d > 0 ? "up" : "down"}>{d > 0 ? "▲" : "▼"} на {Math.abs(d)}</span><span>{lastWeek("tos")}</span></>;
  }
  if (!d) return <span>столько же, сколько {lastWeek("in")} к этому часу</span>;
  return <><span className={d > 0 ? "up" : "down"}>{d > 0 ? "▲" : "▼"} на {Math.abs(d)}</span><span>{d > 0 ? "больше" : "меньше"}, чем {lastWeek("in")} к этому часу</span></>;
}

function weekendInsight(byDay) {
  const days = byDay.slice(0, -1).filter((d) => d.revenue > 0);
  const we = days.filter((d) => [0, 6].includes(new Date(d.date + "T12:00:00Z").getUTCDay()));
  const wd = days.filter((d) => ![0, 6].includes(new Date(d.date + "T12:00:00Z").getUTCDay()));
  if (we.length < 2 || wd.length < 4) return null;
  const a = (l) => l.reduce((s, d) => s + d.revenue, 0) / l.length;
  const diff = Math.round((a(we) / a(wd) - 1) * 100);
  if (diff >= 15) return `Выходные сильнее будней на ${diff}% — к субботе и воскресенью готовьте больше товара заранее.`;
  if (diff <= -15) return `Будни сильнее выходных на ${-diff}% — в выходные можно держать меньше запаса.`;
  return null;
}

function CabToday({ cid }) {
  const { api, nav } = useApp();
  const mobile = useMedia(MOBILE_Q);
  const { data, error, loading, reload } = useLoad(() => api.get(`/api/c/${encodeURIComponent(cid)}/today`), [cid], 20000);
  const [q, setQ] = useState("");
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const k = data.kpi;
  const lead = bizType(data.client?.business_type) === "lead";
  const todo = data.todo;
  const cards = [];
  const no = todo.new_orders;
  if (no.length) {
    const first = no.slice(0, 2).map((o) => `${o.user_label || "Покупатель"} · ${rub(o.total)}`).join(" и ");
    cards.push(<ActionCard key="o" tone="accent" icon="bag" primary
      title={lead ? `${no.length} ${plural(no.length, "новая заявка", "новые заявки", "новых заявок")}` : `${no.length} ${plural(no.length, "новый заказ", "новых заказа", "новых заказов")}`}
      text={`${first}${no.length > 2 ? ` и ещё ${no.length - 2}` : ""} ${no.length === 1 ? "ждёт" : "ждут"} подтверждения`}
      action={lead ? "Открыть заявки" : "Открыть заказы"} onClick={() => nav(`c/${cid}/orders`)} />);
  }
  const dr = todo.drafts;
  if (dr.length) {
    const d0 = dr[0];
    cards.push(<ActionCard key="d" tone="warn" icon="edit"
      title={dr.length === 1 ? "Черновик ответа" : `${dr.length} ${plural(dr.length, "черновик", "черновика", "черновиков")} ответа`}
      text={d0.question ? `${d0.user_label || "Покупатель"}: «${short(d0.question, 70)}»` : `${d0.user_label || "Покупатель"} ждёт ответа`}
      extra={<span className="hint">{d0.reason ? `${cap(d0.reason)}. ` : ""}{d0.status === "held" ? "Клиенту уже написали «уточняю»." : "Бот ждёт вашего решения."}</span>}
      action="Проверить черновик" onClick={() => nav(`c/${cid}/dialogs${d0.dialog_id ? "/" + d0.dialog_id : ""}`)} />);
  }
  const ho = todo.handoffs;
  if (ho.length) {
    const h0 = ho[0];
    cards.push(<ActionCard key="h" tone="bad" icon="user"
      title={ho.length > 1 ? `${ho.length} ${plural(ho.length, "клиент ждёт", "клиента ждут", "клиентов ждут")} менеджера` : h0.need === "handoff" ? "Клиент просит менеджера" : "Клиент ждёт ответа"}
      text={`${h0.user_label || "Покупатель"}: «${short(h0.last_text, 80)}»`}
      extra={h0.need_since ? <span style={{ fontSize: 13, fontWeight: 800, color: "var(--bad)" }}>ждёт {agoText(h0.need_since)}</span> : null}
      action="Ответить" onClick={() => nav(`c/${cid}/dialogs/${h0.id}`)} />);
  }
  const todoCount = no.length + dr.length + ho.length;
  const dialogsPct = k.dialogs ? Math.round((k.dialogs_done / k.dialogs) * 100) : 0;
  const by = data.by_day;
  const sum14 = by.reduce((s, d) => s + d.revenue, 0);
  const bars = by.map((d, i) => {
    const dt = new Date(d.date + "T12:00:00Z");
    const last = i === by.length - 1;
    return {
      v: d.revenue, count: d.count, label: dLong(d.date),
      short: mobile ? String(dt.getUTCDate()) : <>{last ? "сегодня" : dt.getUTCDate()}<br /><span style={{ fontWeight: 500, color: "var(--faint)" }}>{WD_S[dt.getUTCDay()]}</span></>,
    };
  });
  const insight = weekendInsight(by);
  const soldQty = data.sold.reduce((s, x) => s + x.qty, 0);
  const soldMax = Math.max(1, ...data.sold.map((x) => x.sum));
  return (
    <div className="wrap">
      <PageHead title="Сегодня" sub={todayTitle()} right={
        <form className="hide-m" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav(`c/${cid}/orders?period=90d&q=${encodeURIComponent(q.trim())}`); }} style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: 13, color: "var(--faint)" }}><Icon name="search" size={18} /></span>
          <input className="inp" style={{ paddingLeft: 38, width: 280 }} placeholder="Заказ, клиент или телефон" aria-label="Найти заказ" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      } />
      <section aria-labelledby="todo-t" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="todo-t" className="h2 row" style={{ gap: 8 }}>Нужно ваше действие{todoCount > 0 && <span className="nav-badge" style={{ marginLeft: 0, background: "var(--bad)", color: "#fff" }}>{todoCount}</span>}</h2>
        {cards.length ? <div className="act-grid">{cards}</div> : (
          <div className="card row" style={{ gap: 14, padding: 18 }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--ok-soft)", color: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="check" sw={2.2} /></span>
            <div><div style={{ fontWeight: 800 }}>Всё спокойно</div><div className="hint" style={{ fontSize: 13.5 }}>Новых {lead ? "заявок" : "заказов"} и вопросов к вам нет — бот справляется сам.</div></div>
          </div>
        )}
      </section>
      <section className="kpis" aria-label="Цифры за сегодня">
        <Kpi label={lead ? "Заявок сегодня" : "Заказов сегодня"} value={num(k.orders)}><CountDelta cur={k.orders} prev={k.orders_week} mobile={mobile} /></Kpi>
        <Kpi label="Выручка" value={rub(k.revenue)}>
          {k.revenue_week ? <><Delta cur={k.revenue} prev={k.revenue_week} /><span>{mobile ? lastWeek("tos") : lastWeek("to")}</span></> : <span>{cap(lastWeek("in"))} к этому часу — 0 ₽</span>}
        </Kpi>
        <Kpi label="Средний чек" value={k.avg ? rub(k.avg) : "—"}>{k.avg_week ? <span>{mobile ? `было ${rub(k.avg_week)}` : `${cap(lastWeek("in"))} ${rub(k.avg_week)}`}</span> : <span>сравнить пока не с чем</span>}</Kpi>
        <Kpi label="Диалогов" value={num(k.dialogs)}><span>{k.dialogs ? `${dialogsPct}% ${mobile ? "стали заказами" : "закончились заказом"}` : "сегодня ещё не писали"}</span></Kpi>
      </section>
      <div className="cols">
        <div className="col" style={{ flex: "3 1 560px" }}>
          <section className="card" aria-labelledby="rev-t" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="between" style={{ alignItems: "flex-start" }}>
              <div><h2 id="rev-t" className="h2">Выручка за 2 недели</h2><div className="hint hide-m" style={{ marginTop: 4 }}>{dLong(by[0].date)} — {dLong(by[by.length - 1].date)}, по дням</div></div>
              <span style={{ fontSize: mobile ? 16 : 22, fontWeight: 800 }}>{rub(sum14)}</span>
            </div>
            <Bars data={bars} height={mobile ? 110 : 180} fmt={rubShort} ariaLabel={`Выручка по дням за 2 недели, всего ${rub(sum14)}`} tipFmt={(d) => `${d.label}: ${rub(d.v)} · ${d.count} ${plural(d.count, "заказ", "заказа", "заказов")}`} />
            {insight && <div className="hint" style={{ fontSize: 13 }}>{insight}</div>}
          </section>
          {data.sold.length > 0 && (
            <section className="card" aria-labelledby="sold-t" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="between" style={{ paddingBottom: 6 }}><h2 id="sold-t" className="h2">Что купили сегодня</h2><span className="hint">{num(soldQty)} шт в {k.orders} {plural(k.orders, "заказе", "заказах", "заказах")}</span></div>
              <div role="table" aria-label="Что купили сегодня">
                {data.sold.map((x) => (
                  <div key={x.name} role="row" className="tbl-row" style={{ gridTemplateColumns: mobile ? "minmax(0,1fr) 46px 90px" : "minmax(0,1fr) 60px 100px minmax(80px,180px)", gap: 12, padding: "9px 0", borderTop: "1px solid var(--line3)", fontSize: 14 }}>
                    <span role="rowheader" style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.name}</span>
                    <span role="cell" className="dim" style={{ textAlign: "right" }}>{x.qty} шт</span>
                    <span role="cell" style={{ textAlign: "right", fontWeight: 800 }}>{rub(x.sum)}</span>
                    {!mobile && <span role="cell"><ShareBar pct={(x.sum / soldMax) * 100} /></span>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="col" style={{ flex: "2 1 340px" }}>
          <section className="card" aria-labelledby="ev-t" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div className="between" style={{ paddingBottom: 8 }}><h2 id="ev-t" className="h2">Что происходило</h2><span className="hint">за сегодня</span></div>
            <EventFeed events={data.events} empty={data.schema ? "Сегодня пока тихо." : "Лента появится после обновления базы."} />
          </section>
        </div>
      </div>
    </div>
  );
}

// ════════ Заказы ════════
function OrderCard({ o, on, onClick, type }) {
  const info = orderInfo(o);
  const hint = orderHint(info);
  return (
    <button type="button" className={`ord-card ${on ? "on" : ""}`} aria-pressed={!!on} onClick={onClick}>
      <span className="between"><b style={{ fontSize: 15 }}>№{o.order_number}</b><span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>{shortWhen(o.created_at)}</span></span>
      <span style={{ fontSize: 13.5, lineHeight: 1.45, color: "var(--dim)" }}>{orderWhat(info, o)}</span>
      <span className="between" style={{ alignItems: "center" }}><b style={{ fontSize: 16 }}>{rub(info.total)}</b>{isNight(o.created_at) && <span className="pill" style={{ background: "#1B2029", color: "var(--dim)", fontSize: 11.5 }}><Icon name="moon" size={13} />ночью</span>}</span>
      <span style={{ borderTop: "1px solid var(--line)", paddingTop: 9, display: "flex", flexDirection: "column", gap: 2 }}>
        <b style={{ fontSize: 13.5 }}>{o.user_label || "Покупатель"}</b>
        {(hint || ["accepted", "cooking", "rejected"].includes(o.status)) && <span className="hint" style={{ fontSize: 12.5, color: o.status === "rejected" ? "var(--bad)" : undefined }}>{o.status === "rejected" ? "Отклонён" : ["accepted", "cooking"].includes(o.status) ? [stLabel(type, o.status), hint].filter(Boolean).join(" · ") : hint}</span>}
      </span>
    </button>
  );
}

function OrderDetail({ cid, o, type, onStatus, inModal }) {
  const { api, nav } = useApp();
  const { data } = useLoad(() => api.get(`/api/c/${encodeURIComponent(cid)}/order/${encodeURIComponent(o.id)}`), [cid, o.id], false);
  const [busy, setBusy] = useState("");
  const [rej, setRej] = useState(false);
  const [showDlg, setShowDlg] = useState(false);
  const info = orderInfo(o);
  const next = NEXT_STEP[bizType(type)][o.status];
  const prev = (data?.customer_orders || [])[0];
  const cnt = data?.orders_count || 0;
  const run = async (st) => { setBusy(st); try { await onStatus(o, st); } catch (e) { /* ошибку уже показали */ } setBusy(""); };
  const st = o.status;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!inModal && (
        <div className="between" style={{ alignItems: "flex-start" }}>
          <h2 className="h2" style={{ fontSize: 20 }}>{type === "lead" ? "Заявка" : "Заказ"} №{o.order_number}</h2>
          <Pill color={ST_COLOR[st]} bg={st === "new" ? "var(--accent-soft)" : "#1B2029"}>{stLabel(type, st)}</Pill>
        </div>
      )}
      <div className="hint" style={{ marginTop: inModal ? -8 : -10 }}>{isToday(o.created_at) ? "сегодня" : dayMonth(o.created_at)}, {hhmm(o.created_at)} · {data?.channel === "vk" ? "через VK" : "через Telegram"} · оформил бот{isNight(o.created_at) ? " ночью" : ""}</div>
      <div style={{ background: "var(--card2)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{o.user_label || "Покупатель"}</div>
        {(info.phone || data?.username) && <div style={{ fontSize: 13.5, color: "var(--dim)" }}>{[info.phone, data?.username ? "@" + String(data.username).replace(/^@/, "") : null].filter(Boolean).join(" · ")}</div>}
        <div className="hint">{!data ? "…" : cnt >= 6 ? "постоянный клиент · 6+ заказов" : cnt > 1 ? `${cnt}-й заказ · прошлый ${dayMonth(prev.created_at)}${prev.items_json?.[0]?.name ? ", " + prev.items_json[0].name : ""}` : "первый заказ"}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {info.items.map((i, n) => (
          <div key={n} className="between" style={{ padding: "9px 0", borderBottom: "1px solid var(--line3)", fontSize: 14 }}><span>{i.name} × {i.qty || 1}</span><b>{rub(i.sum || (i.price || 0) * (i.qty || 1))}</b></div>
        ))}
        {info.extras.map((x, n) => (
          <div key={"e" + n} className="between" style={{ padding: "9px 0", borderBottom: "1px solid var(--line3)", fontSize: 14, color: "var(--dim)" }}><span>{x.k}</span><span>{rub(x.v)}</span></div>
        ))}
        {!info.items.length && !info.extras.length && <div style={{ fontSize: 14, color: "var(--dim)", whiteSpace: "pre-wrap", paddingBottom: 8 }}>{cleanText(o.items_text)}</div>}
        <div className="between" style={{ padding: "12px 0 4px", fontSize: 16 }}><b>К оплате</b><b style={{ fontSize: 18 }}>{rub(info.total)}</b></div>
      </div>
      {(info.kv.length > 0 || info.notes.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(80px,auto) minmax(0,1fr)", gap: "8px 16px", fontSize: 14 }}>
          {info.kv.map((x, n) => <Fragment key={n}><span className="dim">{x.k}</span><b style={{ wordBreak: "break-word" }}>{x.v}</b></Fragment>)}
          {info.notes.map((x, n) => <span key={"n" + n} style={{ gridColumn: "1 / -1", color: "var(--dim)" }}>{x}</span>)}
        </div>
      )}
      {(next || st === "new") && (
        <div className="row" style={{ flexWrap: "wrap" }}>
          {next && <Btn kind="primary" style={{ flex: "1 1 160px" }} loading={busy === next[0]} onClick={() => run(next[0])}>{next[1]}</Btn>}
          {!["done", "rejected"].includes(st) && <Btn kind="danger" style={{ flex: "0 1 auto" }} onClick={() => setRej(true)}>Отклонить</Btn>}
        </div>
      )}
      {["done", "rejected"].includes(st) && (
        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          <Pill color={ST_COLOR[st]} bg={st === "done" ? "var(--ok-soft)" : "var(--bad-soft)"} dot={ST_COLOR[st]}>{stLabel(type, st)}</Pill>
          <Btn size="sm" kind="ghost" loading={busy === "accepted"} onClick={() => run("accepted")}>Вернуть в работу</Btn>
        </div>
      )}
      <div className="hint">Когда вы меняете статус, бот сам пишет покупателю, что с {type === "lead" ? "заявкой" : "заказом"}.</div>
      {data?.dialog_id
        ? <button type="button" className="btn ghost" style={{ justifyContent: "flex-start", paddingLeft: 0, color: "var(--accent-text)" }} onClick={() => nav(`c/${cid}/dialogs/${data.dialog_id}`)}>Открыть переписку <Icon name="arrow" size={16} /></button>
        : o.dialog_text ? (<>
          <button type="button" className="btn ghost sm" style={{ alignSelf: "flex-start", paddingLeft: 0, color: "var(--accent-text)" }} onClick={() => setShowDlg(!showDlg)}>{showDlg ? "Скрыть переписку" : "Показать переписку"}</button>
          {showDlg && <div className="hint" style={{ whiteSpace: "pre-wrap", fontSize: 13, background: "var(--input)", borderRadius: 10, padding: 12, maxHeight: 260, overflow: "auto" }}>{o.dialog_text}</div>}
        </>) : null}
      {rej && <Confirm title={`Отклонить ${type === "lead" ? "заявку" : "заказ"} №${o.order_number}?`} text={`Бот сообщит покупателю, что ${type === "lead" ? "заявку" : "заказ"} не получится выполнить. ${type === "lead" ? "Заявка останется" : "Заказ останется"} в списке отклонённых.`} ok="Отклонить" danger onOk={() => onStatus(o, "rejected")} onClose={() => setRej(false)} />}
    </div>
  );
}

function CabOrders({ cid }) {
  const { api, toast, reloadBadges } = useApp();
  const hq = hashQuery();
  const [period, setPeriod] = useState(PERIODS.some((p) => p[0] === hq.period) ? hq.period : "today");
  const [q, setQ] = useState(hq.q || "");
  const [selId, setSelId] = useState(null);
  const [modal, setModal] = useState(null);
  const [showRej, setShowRej] = useState(false);
  const [tab, setTab] = useState("new");
  const [searchOpen, setSearchOpen] = useState(!!hq.q);
  const mobile = useMedia(MOBILE_Q);
  const narrow = useMedia("(max-width: 1180px)");
  const { data, error, loading, reload, setData } = useLoad(() => api.get(`/api/c/${encodeURIComponent(cid)}/orders?period=${period}`), [cid, period], 10000);
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const type = bizType(data.business_type);
  const W = type === "lead" ? ["заявка", "заявки", "заявок"] : ["заказ", "заказа", "заказов"];
  let rows = data.orders;
  const ql = q.trim().toLowerCase().replace(/^№/, "");
  if (ql) rows = rows.filter((o) => String(o.order_number).includes(ql) || (o.user_label || "").toLowerCase().includes(ql) || (o.items_text || "").toLowerCase().includes(ql) || String(o.user_id || "").includes(ql));
  const rejected = rows.filter((o) => o.status === "rejected");
  const board = BOARD[type].concat(showRej ? [["rej", ["rejected"], "Отклонены", "var(--bad)"]] : []);
  const col = (sts) => rows.filter((o) => sts.includes(o.status));
  const sel = rows.find((o) => o.id === selId) || null;
  const s = data.summary;
  const pLabel = { today: "Сегодня", "7d": "За 7 дней", "30d": "За 30 дней", "90d": "За 3 месяца" }[period];
  const setStatus = async (o, status) => {
    try {
      const r = await api.post(`/api/c/${cid}/order/${o.id}/status`, { status, notify: true });
      setData((d) => ({ ...d, orders: d.orders.map((x) => (x.id === o.id ? { ...x, status } : x)) }));
      toast(`№${o.order_number}: ${stLabel(type, status).toLowerCase()}${r.notified ? " — покупатель получил сообщение" : ""}`);
      reloadBadges();
    } catch (e) { toast(e.message, "bad"); throw e; }
  };
  const open = (o) => { if (narrow) setModal(o.id); else setSelId(o.id === selId ? null : o.id); };
  const modalOrder = rows.find((o) => o.id === modal) || null;
  const exportBtn = <Btn icon="download" onClick={() => api.download(`/api/c/${cid}/export`, `zakazy-${dayKey(Date.now())}.csv`).catch((e) => toast(e.message, "bad"))}>Excel</Btn>;
  const periodSel = (
    <label className="row" style={{ gap: 8, fontSize: 13, color: "var(--faint)" }}><span className="hide-m">Период</span>
      <select className="inp" style={{ width: "auto", fontWeight: 800 }} value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Период">{PERIODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </label>
  );
  const searchBox = (
    <div style={{ position: "relative", flex: mobile ? "1 1 auto" : undefined }}>
      <span style={{ position: "absolute", left: 12, top: 13, color: "var(--faint)" }}><Icon name="search" size={18} /></span>
      <input className="inp" style={{ paddingLeft: 38, width: mobile ? "100%" : 240 }} placeholder="Номер, имя, телефон" aria-label="Поиск заказа" value={q} onChange={(e) => setQ(e.target.value)} autoFocus={mobile && searchOpen} />
    </div>
  );
  const sub = `${pLabel} ${s.count} ${plural(s.count, ...W)}${s.sum ? ` на ${rub(s.sum)}` : ""}${s.new ? ` · ${s.new} ${plural(s.new, "ждёт", "ждут", "ждут")} подтверждения` : ""}`;

  if (mobile) {
    const tabs = type === "lead"
      ? [["new", "Новые", ["new"]], ["work", "В работе", ["accepted", "cooking", "delivering"]], ["done", "Закрыты", ["done", ...(showRej ? ["rejected"] : [])]]]
      : [["new", "Новые", ["new"]], ["work", "В работе", ["accepted", "cooking", "delivering"]], ["done", "Готово", ["done", ...(showRej ? ["rejected"] : [])]]];
    const cur = tabs.find((t) => t[0] === tab) || tabs[0];
    const list = col(cur[2]);
    return (
      <div className="wrap">
        <div className="between">
          <div style={{ minWidth: 0 }}><h1 className="h1">{type === "lead" ? "Заявки" : "Заказы"}</h1><div className="sub" style={{ marginTop: 4 }}>{sub}</div></div>
          <button type="button" className="btn" aria-label="Поиск" style={{ width: 48, padding: 0 }} onClick={() => setSearchOpen(!searchOpen)}><Icon name={searchOpen ? "x" : "search"} size={19} /></button>
        </div>
        {searchOpen && <div className="row">{searchBox}</div>}
        <div className="row" style={{ gap: 8 }}>{periodSel}<div style={{ flex: 1 }} />{exportBtn}</div>
        <div className="seg" role="tablist" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
          {tabs.map(([k, l, sts]) => { const n = col(sts).length; return (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 42 }}>{l}{n > 0 && <span className="nav-badge" style={{ marginLeft: 0, background: k === "new" ? "var(--accent)" : "#2A2F3A", color: "#fff", minWidth: 20, height: 20 }}>{n}</span>}</button>
          ); })}
        </div>
        <div className="hint">На каждом шаге бот сам пишет покупателю, что с {type === "lead" ? "заявкой" : "заказом"}.</div>
        {list.map((o) => <MobileOrderCard key={o.id} o={o} type={type} onStatus={setStatus} onMore={() => setModal(o.id)} />)}
        {!list.length && <Empty icon="bag" title={tab === "new" ? `Новых ${type === "lead" ? "заявок" : "заказов"} нет` : "Пусто"} text={tab === "done" ? "Здесь будут выполненные за выбранный период." : "Как только бот оформит, они появятся здесь."} />}
        {rejected.length > 0 && tab === "done" && <button type="button" className="btn ghost sm" style={{ alignSelf: "flex-start" }} onClick={() => setShowRej(!showRej)}>{showRej ? "Скрыть отклонённые" : `Показать отклонённые · ${rejected.length}`}</button>}
        {modalOrder && <Modal sheet title={`${type === "lead" ? "Заявка" : "Заказ"} №${modalOrder.order_number}`} onClose={() => setModal(null)}><OrderDetail cid={cid} o={modalOrder} type={type} onStatus={setStatus} inModal /></Modal>}
      </div>
    );
  }

  return (
    <div className="wrap" style={{ maxWidth: 1240 }}>
      <PageHead title={type === "lead" ? "Заявки" : "Заказы"} sub={sub} right={<>{periodSel}{searchBox}{exportBtn}</>} />
      {!data.orders.length ? (
        <div className="card"><Empty icon="bag" title={`${type === "lead" ? "Заявок" : "Заказов"} пока нет`} text={`Как только бот оформит ${type === "lead" ? "заявку" : "заказ"}, он появится здесь, а вам придёт сообщение в Telegram.`} /></div>
      ) : (
        <div className="ord-wrap" style={!sel || narrow ? { gridTemplateColumns: "minmax(0,1fr)" } : null}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <div className="ord-board" style={{ "--cols": board.length }}>
              {board.map(([k, sts, label, color]) => {
                const list = col(sts);
                return (
                  <section key={k} className="ord-col" aria-label={label}>
                    <div className="row" style={{ gap: 8, padding: "2px 4px 2px", fontSize: 14 }}><span className="dot" style={{ background: color }} /><b>{label}</b><span className="muted">{list.length}</span></div>
                    {list.map((o) => <OrderCard key={o.id} o={o} type={type} on={sel?.id === o.id} onClick={() => open(o)} />)}
                    {!list.length && <div className="hint" style={{ padding: "6px 4px" }}>{k === "new" ? "Новых нет" : "Пусто"}</div>}
                  </section>
                );
              })}
            </div>
            {(rejected.length > 0 || showRej) && <button type="button" className="btn ghost sm" style={{ alignSelf: "flex-start" }} onClick={() => setShowRej(!showRej)}>{showRej ? "Скрыть отклонённые" : `Показать отклонённые · ${rejected.length}`}</button>}
          </div>
          {sel && !narrow && (
            <aside className="card ord-aside" aria-label="Детали">
              <OrderDetail key={sel.id} cid={cid} o={sel} type={type} onStatus={setStatus} />
            </aside>
          )}
        </div>
      )}
      {modalOrder && narrow && <Modal title={`${type === "lead" ? "Заявка" : "Заказ"} №${modalOrder.order_number}`} onClose={() => setModal(null)}><OrderDetail cid={cid} o={modalOrder} type={type} onStatus={setStatus} inModal /></Modal>}
    </div>
  );
}

function MobileOrderCard({ o, type, onStatus, onMore }) {
  const info = orderInfo(o);
  const next = NEXT_STEP[type][o.status];
  const [busy, setBusy] = useState("");
  const [rej, setRej] = useState(false);
  const hint = orderHint(info);
  const run = async (st) => { setBusy(st); try { await onStatus(o, st); } catch (e) { /* toast уже показан */ } setBusy(""); };
  return (
    <article className="card tight" style={{ display: "flex", flexDirection: "column", gap: 10, borderColor: o.status === "new" ? "rgba(47,99,230,.55)" : undefined }}>
      <div className="between"><span className="row" style={{ gap: 8 }}><b className="mono" style={{ fontSize: 13 }}>№{o.order_number}</b><span className="mono hint">{shortWhen(o.created_at)}</span>{isNight(o.created_at) && <Icon name="moon" size={14} style={{ color: "var(--faint)" }} />}</span><Pill color={ST_COLOR[o.status]} dot={ST_COLOR[o.status]}>{stLabel(type, o.status)}</Pill></div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{o.user_label || "Покупатель"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
        {info.items.slice(0, 4).map((i, n) => <div key={n} className="between"><span>{i.name} × {i.qty || 1}</span><b>{rub(i.sum || (i.price || 0) * (i.qty || 1))}</b></div>)}
        {info.items.length > 4 && <div className="hint">и ещё {info.items.length - 4}</div>}
        {info.extras.slice(0, 2).map((x, n) => <div key={"e" + n} className="between dim"><span>{x.k}</span><span>{rub(x.v)}</span></div>)}
        {!info.items.length && <div className="dim">{orderWhat(info, o)}</div>}
      </div>
      <div className="between" style={{ borderTop: "1px solid var(--line)", paddingTop: 8 }}><b>К оплате</b><b style={{ fontSize: 18 }}>{rub(info.total)}</b></div>
      {hint && <div className="hint" style={{ fontSize: 13 }}>{hint}</div>}
      <div className="row" style={{ gap: 8 }}>
        <Btn style={{ flex: 1 }} onClick={onMore}>Подробнее</Btn>
        {info.phone ? <a className="btn" style={{ flex: 1 }} href={`tel:${info.phone.replace(/[^\d+]/g, "")}`}><Icon name="phone" size={17} />Позвонить</a> : null}
      </div>
      {next && (
        <div className="row" style={{ gap: 8 }}>
          <Btn kind="primary" style={{ flex: 2 }} loading={busy === next[0]} onClick={() => run(next[0])}>{o.status === "new" ? (type === "lead" ? "Связались" : "Принять") : next[1]}</Btn>
          {o.status === "new" && <Btn kind="danger" style={{ flex: 1 }} onClick={() => setRej(true)}>Отклонить</Btn>}
        </div>
      )}
      {rej && <Confirm title={`Отклонить №${o.order_number}?`} text="Бот сообщит покупателю, что не получится выполнить." ok="Отклонить" danger onOk={() => onStatus(o, "rejected")} onClose={() => setRej(false)} />}
    </article>
  );
}

// ════════ Диалоги ════════
const DSTATE = {
  handoff: { label: "Просит менеджера", color: "var(--bad)", bg: "var(--bad-soft)" },
  manual: { label: "Ждёт ответа", color: "var(--bad)", bg: "var(--bad-soft)" },
  draft: { label: "Черновик ждёт вас", color: "var(--warn)", bg: "var(--warn-soft)" },
  taken: { label: "Ведёте вы", color: "var(--accent-text)", bg: "var(--accent-soft)" },
  order: { label: "Заказ", color: "var(--accent-text)", bg: "var(--accent-soft)" },
  bot: { label: "Ведёт бот", color: "var(--dim)", bg: "#1B2029" },
  idle: { label: "Не оформил", color: "var(--faint)", bg: "#15181E" },
};
// «Ведёт бот» — только живые разговоры; затихшие больше суток назад — отдельно
const dlgState = (d) => (d.state === "bot" && Date.now() - Date.parse(d.updated_at) > 864e5 ? "idle" : d.state);
const WAIT_STATES = ["draft", "handoff", "manual"];
const QUICK = ["Уточню и вернусь через 10 минут", "Да, всё получится", "Сейчас уточню у коллег и напишу", "Спасибо за заказ!"];
const CHANNEL = { tg: "Telegram", vk: "VK", biz: "Telegram Business" };

function DialogRow({ d, on, onClick, lead }) {
  const state = dlgState(d);
  const st = DSTATE[state] || DSTATE.bot;
  const label = state === "order" ? (d.order_number ? `${lead ? "Заявка" : "Заказ"} №${d.order_number}` : lead ? "Оставил заявку" : "Оформил заказ") : state === "idle" && lead ? "Без заявки" : st.label;
  return (
    <button type="button" className={`dlg-row ${on ? "on" : ""}`} aria-current={on ? "true" : undefined} onClick={onClick}>
      <span className="tile" style={{ width: 40, height: 40, borderRadius: 20, fontSize: 14 }}>{personInitials(d.user_label)}</span>
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <span className="between" style={{ gap: 8 }}><b style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14.5 }}>{d.user_label}</b><span className="mono" style={{ fontSize: 11.5, color: "var(--faint)", flexShrink: 0 }}>{shortWhen(d.updated_at)}</span></span>
        <span style={{ fontSize: 13, color: "var(--dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.last_text || "…"}</span>
        <span className="row" style={{ gap: 6 }}><span className="pill" style={{ color: st.color, background: st.bg, padding: "3px 8px", fontSize: 11.5 }}>{label}</span>{d.channel !== "tg" && <span className="hint" style={{ fontSize: 11.5 }}>{CHANNEL[d.channel]}</span>}</span>
      </span>
    </button>
  );
}

function CabDialogs({ cid, lid }) {
  const { api, nav, badges } = useApp();
  const mobile = useMedia(MOBILE_Q);
  const [limit, setLimit] = useState(100);
  const { data, error, loading, reload } = useLoad(() => api.get(`/api/c/${encodeURIComponent(cid)}/dialogs?limit=${limit}`), [cid, limit], 8000);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [info, setInfo] = useState(false);
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const lead = bizType(badges?.business_type) === "lead";
  const all = data.dialogs;
  let list = all.filter((d) => filter === "all" || (filter === "wait" && WAIT_STATES.includes(d.state)) || (filter === "bot" && dlgState(d) === "bot"));
  const ql = q.trim().toLowerCase();
  if (ql) list = list.filter((d) => (d.user_label || "").toLowerCase().includes(ql) || (d.last_text || "").toLowerCase().includes(ql) || (d.username || "").toLowerCase().includes(ql));
  const c = { wait: all.filter((d) => WAIT_STATES.includes(d.state)).length, bot: all.filter((d) => dlgState(d) === "bot").length, all: all.length };
  const todayN = all.filter((d) => isToday(d.updated_at)).length;
  const chips = [["wait", `Ждут вас · ${c.wait}`], ["bot", `Ведёт бот · ${c.bot}`], ["all", data.has_more ? "Все" : `Все · ${c.all}`]];
  const chipRow = (
    <div className="row" style={{ gap: 8, flexWrap: mobile ? "nowrap" : "wrap" }}>
      {chips.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={filter === k} className={`chip ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}
          style={k === "wait" && c.wait > 0 && filter !== k ? { borderColor: "rgba(245,181,68,.6)", color: "var(--warn)" } : k === "wait" && filter === k ? { borderColor: "var(--warn)", background: "var(--warn-soft)", color: "var(--warn)" } : null}>{l}</button>
      ))}
    </div>
  );
  const search = (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: 13, color: "var(--faint)" }}><Icon name="search" size={18} /></span>
      <input className="inp" style={{ paddingLeft: 38 }} placeholder="Имя или текст" aria-label="Поиск по диалогам" value={q} onChange={(e) => setQ(e.target.value)} />
    </div>
  );
  const shown = list;
  const more = data.has_more && !ql && filter !== "wait" ? <button type="button" className="btn ghost block" style={{ borderRadius: 0, color: "var(--accent-text)" }} disabled={loading} onClick={() => setLimit(Math.min(300, limit + 100))}>{loading ? "Загружаю…" : limit >= 300 ? "Показаны последние 300" : "Показать ещё"}</button> : null;
  const empty = <Empty icon="chat" title={all.length ? "Ничего не нашли" : "Диалогов пока нет"} text={all.length ? "Измените фильтр или поиск." : "Когда покупатели напишут боту, переписки появятся здесь."} />;
  const sub = `Сегодня ${todayN} ${plural(todayN, "диалог", "диалога", "диалогов")}${c.wait ? ` · ${c.wait} ${plural(c.wait, "ждёт", "ждут", "ждут")} вас` : " · все отвечены"}`;

  if (mobile) {
    if (lid) return <div className="fullchat"><DialogView key={lid} cid={cid} lid={lid} mobile lead={lead} onBack={() => nav(`c/${cid}/dialogs`)} onChanged={reload} /></div>;
    return (
      <div className="wrap">
        <div><h1 className="h1">Диалоги</h1><div className="sub" style={{ marginTop: 4 }}>{sub}</div></div>
        <div className="hscroll">{chipRow}</div>
        {search}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {shown.map((d) => <DialogRow key={d.id} d={d} lead={lead} onClick={() => nav(`c/${cid}/dialogs/${d.id}`)} />)}
          {more}
          {!list.length && empty}
        </div>
      </div>
    );
  }
  const selId = lid || (list[0] && list[0].id) || null;
  return (
    <div className="wrap" style={{ maxWidth: 1320 }}>
      <PageHead title="Диалоги" sub={sub} right={chipRow} />
      <div className="dlg-grid">
        <div className="dlg-list">
          <div style={{ padding: 12, borderBottom: "1px solid var(--line)" }}>{search}</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {shown.map((d) => <DialogRow key={d.id} d={d} lead={lead} on={d.id === selId} onClick={() => nav(`c/${cid}/dialogs/${d.id}`)} />)}
            {more}
            {!list.length && empty}
          </div>
        </div>
        {selId ? <DialogView key={selId} cid={cid} lid={selId} lead={lead} onChanged={reload} info={info} setInfo={setInfo} /> : <div className="dlg-chat" style={{ alignItems: "center", justifyContent: "center" }}>{empty}</div>}
      </div>
    </div>
  );
}

function DialogView({ cid, lid, mobile, lead, onBack, onChanged, info, setInfo }) {
  const { api, toast, nav, reloadBadges } = useApp();
  const { data, error, loading, reload, setData } = useLoad(() => api.get(`/api/c/${encodeURIComponent(cid)}/dialog/${encodeURIComponent(lid)}`), [cid, lid]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState("");
  const [facts, setFacts] = useState(null);
  const [factsBusy, setFactsBusy] = useState(false);
  const [edit, setEdit] = useState(null);
  const [note, setNote] = useState(null);
  const box = useRef(null);
  const ta = useRef(null);
  const hist = data?.history || [];
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [hist.length, data?.draft?.id, edit !== null]);
  useEffect(() => { if (data && note === null) setNote(data.note || ""); }, [data]); // eslint-disable-line
  const loadFacts = async (force) => {
    setFactsBusy(true);
    try { const r = await api.post(`/api/c/${cid}/dialog/${lid}/facts`, force ? { force: true } : {}); setFacts(r.facts || []); }
    catch (e) { setFacts([]); if (force) toast(e.message, "bad"); }
    setFactsBusy(false);
  };
  useEffect(() => {
    if (!data || facts !== null) return;
    const users = hist.filter((m) => m.role === "user").length;
    if (users >= 2 || (data.dialog.facts && data.dialog.facts.length)) loadFacts(false); else setFacts([]);
  }, [data]); // eslint-disable-line
  if (loading && !data) return <div className="dlg-chat" style={{ alignItems: "center", justifyContent: "center", flex: 1 }}><span className="spin" /></div>;
  if (error && !data) return <div className="dlg-chat" style={{ padding: 20 }}><ErrorBox error={error} onRetry={reload} />{mobile && <Btn onClick={onBack} icon="left">Назад</Btn>}</div>;
  const d = data.dialog;
  const dr = data.draft;
  const manual = data.manual;
  const changed = () => { onChanged && onChanged(); reloadBadges(); };
  const takeover = async (on) => {
    setBusy("take");
    try { await api.post(`/api/c/${cid}/takeover`, { user_id: d.user_id, on }); toast(on ? "Диалог ваш — бот молчит, пока вы его не вернёте" : "Диалог вернули боту"); await reload(); changed(); }
    catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const send = async (e) => {
    e && e.preventDefault();
    const t = text.trim(); if (!t || busy) return;
    setBusy("send");
    try {
      await api.post(`/api/c/${cid}/reply`, { user_id: d.user_id, text: t });
      setText("");
      setData((x) => ({ ...x, manual: true, draft: null, dialog: { ...x.dialog, need: null }, history: [...x.history, { role: "assistant", content: t, by: "manager", ts: new Date().toISOString() }] }));
      if (!manual) toast("Отправлено. Бот молчит в этом диалоге, пока вы не вернёте его");
      changed();
    } catch (e2) { toast(e2.message, "bad"); }
    setBusy("");
  };
  const sendDraft = async (txt) => {
    setBusy("draft");
    try { await api.post(`/api/c/${cid}/draft/${dr.id}/send`, txt ? { text: txt } : {}); toast(txt ? "Исправленный ответ отправлен" : "Ответ отправлен покупателю"); setEdit(null); await reload(); changed(); }
    catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const dismissDraft = async () => {
    setBusy("dismiss");
    try { await api.post(`/api/c/${cid}/draft/${dr.id}/dismiss`); toast("Черновик не отправлен — напишите покупателю сами"); setData((x) => ({ ...x, draft: null })); changed(); setTimeout(() => ta.current && ta.current.focus(), 50); }
    catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const saveNote = async () => {
    if (note === null || note === (data.note || "")) return;
    try { await api.post(`/api/c/${cid}/note`, { user_id: d.user_id, note }); setData((x) => ({ ...x, note })); toast("Заметка сохранена"); }
    catch (e) { toast(e.message, "bad"); }
  };
  const stateText = manual ? ["вы ведёте диалог, бот молчит", "var(--accent-text)"]
    : dr ? ["черновик ждёт вас", "var(--warn)"]
    : d.need === "handoff" ? ["просит менеджера", "var(--bad)"]
    : d.need === "manual" ? ["ждёт вашего ответа", "var(--bad)"]
    : d.completed ? [lead ? "оставил заявку" : "оформил заказ", "var(--ok)"] : ["бот ведёт диалог", "var(--dim)"];
  const uname = d.username ? "@" + String(d.username).replace(/^@/, "") : null;
  const factList = facts || [];
  let lastDay = null;
  const msgs = hist.map((m, i) => {
    const day = m.ts ? dayKey(m.ts) : null;
    const sep = day && day !== lastDay ? <div key={"s" + i} className="daysep">{dayTitle(m.ts)}</div> : null;
    if (day) lastDay = day;
    const mine = m.role === "assistant";
    const mgr = m.by === "manager";
    const meta = m.role === "user" ? `${d.user_label}${m.ts ? " · " + hhmm(m.ts) : ""}`
      : `${mgr ? "Менеджер" : "Бот"}${m.ts ? " · " + hhmm(m.ts) : ""}${mgr ? "" : m.by === "approved" ? " · одобрено вами" : m.by === "auto" ? " · отправлен без одобрения" : m.by === "hold" ? " · попросил подождать" : m.ts ? " · ответил сам" : ""}`;
    return (
      <Fragment key={i}>
        {sep}
        <div style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: mobile ? "86%" : "78%", display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", gap: 3, marginTop: 6 }}>
          <div className="bubble" style={{ borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: mine ? (mgr ? "#232A38" : "rgba(47,99,230,.2)") : "#1A1F28", border: mine && !mgr ? "1px solid rgba(47,99,230,.28)" : "1px solid transparent" }}>{m.content}</div>
          <span style={{ fontSize: 11.5, color: "var(--faint)", padding: "0 4px" }}>{meta}</span>
        </div>
      </Fragment>
    );
  });
  const draftCard = dr && (
    <div className="draft" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
      <div className="between"><span className="row" style={{ gap: 6, fontSize: 12, fontWeight: 800, color: "var(--warn)", textTransform: "uppercase", letterSpacing: .4 }}><Icon name="edit" size={15} />Черновик бота · не отправлен</span><span className="mono hint">{hhmm(dr.created_at)}</span></div>
      {edit === null ? <div style={{ fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{dr.text}</div>
        : <textarea className="inp" rows={4} value={edit} onChange={(e) => setEdit(e.target.value)} aria-label="Текст ответа" autoFocus />}
      {dr.reason && <div className="hint">Почему на одобрение: {dr.reason}</div>}
      {dr.status === "held" && <div className="hint" style={{ color: "var(--warn)" }}>Покупателю уже написали «Уточняю детали — вернусь через пару минут».</div>}
      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        {edit === null ? (<>
          <Btn kind="primary" loading={busy === "draft"} onClick={() => sendDraft(null)} style={mobile ? { flex: 1 } : null}>Отправить</Btn>
          <Btn onClick={() => setEdit(dr.text)} style={mobile ? { flex: 1 } : null}>{mobile ? "Изменить" : "Изменить текст"}</Btn>
          <Btn kind="ghost" loading={busy === "dismiss"} onClick={dismissDraft} style={mobile ? { flex: "1 1 100%" } : null}>Не отправлять</Btn>
        </>) : (<>
          <Btn kind="primary" loading={busy === "draft"} disabled={!edit.trim()} onClick={() => sendDraft(edit.trim())}>Отправить исправленный</Btn>
          <Btn kind="ghost" onClick={() => setEdit(null)}>Отмена</Btn>
        </>)}
      </div>
    </div>
  );
  const aside = (
    <>
      <div><div className="h3" style={{ fontSize: 16 }}>{d.user_label}</div><div className="hint" style={{ marginTop: 2 }}>{[uname, CHANNEL[d.channel]].filter(Boolean).join(" · ")}</div></div>
      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="between"><h3 className="sec-t">Бот понял из диалога</h3>{facts !== null && <button type="button" className="btn ghost sm" style={{ minHeight: 28, padding: "0 6px" }} onClick={() => loadFacts(true)} aria-label="Обновить" disabled={factsBusy}>{factsBusy ? <span className="spin" style={{ width: 14, height: 14 }} /> : <Icon name="refresh" size={15} />}</button>}</div>
        {facts === null || (factsBusy && !factList.length) ? <span className="hint">Читаю переписку…</span>
          : factList.length ? factList.map((f, i) => <div key={i} className="between" style={{ fontSize: 13.5, alignItems: "flex-start", gap: 12 }}><span className="dim" style={{ flexShrink: 0 }}>{f.k}</span><b style={{ textAlign: "right" }}>{f.v}</b></div>)
          : <span className="hint">Пока нечего выделить — покупатель написал мало.</span>}
      </section>
      <section style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
        <h3 className="sec-t">{lead ? "Заявки" : "Заказы"} покупателя</h3>
        {data.orders.length ? data.orders.map((o) => (
          <div key={o.id} style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 13.5 }}>
            <div className="between"><span>№{o.order_number}{o.items_json?.[0]?.name ? ` · ${o.items_json[0].name}` : ""}</span><b>{rub(o.total_amount)}</b></div>
            <span className="hint">{dayMonth(o.created_at)} · {stLabel(lead ? "lead" : "order", o.status).toLowerCase()}</span>
          </div>
        )) : <span className="hint">Ещё не {lead ? "оставлял заявок" : "заказывал"}.</span>}
      </section>
      <section style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
        <h3 className="sec-t">Заметка о покупателе</h3>
        <textarea className="inp" rows={4} placeholder="Видна только вам: любимые цветы, удобное время, особые просьбы" value={note || ""} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} aria-label="Заметка о покупателе" />
      </section>
    </>
  );
  const header = (
    <div className="row" style={{ gap: 12, padding: mobile ? "10px 12px" : "14px 18px", borderBottom: "1px solid var(--line)", background: mobile ? "rgba(10,12,16,.96)" : undefined }}>
      {mobile && <button type="button" className="btn ghost" aria-label="Назад к диалогам" style={{ width: 40, padding: 0 }} onClick={onBack}><Icon name="left" size={22} /></button>}
      <span className="tile" style={{ width: 40, height: 40, borderRadius: 20, fontSize: 14 }}>{personInitials(d.user_label)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.user_label}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{!mobile && [uname, CHANNEL[d.channel]].filter(Boolean).join(" · ") + " · "}<span style={{ color: stateText[1], fontWeight: 700 }}>{stateText[0]}</span></div>
      </div>
      {!mobile && setInfo && <button type="button" className="btn sm dlg-info" onClick={() => setInfo(true)}><Icon name="user" size={16} />О покупателе</button>}
      <Btn size={mobile ? "sm" : undefined} loading={busy === "take"} onClick={() => takeover(!manual)}>{manual ? "Вернуть боту" : mobile ? "Взять на себя" : "Взять диалог на себя"}</Btn>
    </div>
  );
  return (
    <>
      <div className="dlg-chat" style={mobile ? { flex: 1 } : null}>
        {header}
        {mobile && factList.length > 0 && (
          <div className="hscroll" style={{ padding: "8px 12px", borderBottom: "1px solid var(--line3)", alignItems: "center" }}>
            <span className="hint" style={{ flexShrink: 0, fontWeight: 700 }}>Бот понял:</span>
            {factList.map((f, i) => <span key={i} className="pill" style={{ background: "#1B2029", color: "var(--text)", fontSize: 12.5, padding: "6px 10px", flexShrink: 0 }}>{f.v}</span>)}
          </div>
        )}
        <div className="msgs" ref={box} aria-live="polite">
          {!hist.length && <div className="hint" style={{ margin: "auto" }}>Сообщений пока нет.</div>}
          {msgs}
          {draftCard}
          {mobile && (
            <details style={{ marginTop: 14 }}>
              <summary className="hint" style={{ cursor: "pointer", fontWeight: 700 }}>О покупателе: заказы и заметка</summary>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>{aside}</div>
            </details>
          )}
        </div>
        <div style={{ borderTop: "1px solid var(--line)", padding: mobile ? "8px 12px calc(10px + env(safe-area-inset-bottom))" : "12px 18px", display: "flex", flexDirection: "column", gap: 10, background: mobile ? "var(--side)" : undefined }}>
          <div className="hscroll">{QUICK.map((t) => <button key={t} type="button" className="chip" style={{ flexShrink: 0, minHeight: 34, background: "#161A21" }} onClick={() => { setText(t); ta.current && ta.current.focus(); }}>{t}</button>)}</div>
          <form onSubmit={send} className="row" style={{ alignItems: "flex-end" }}>
            <textarea ref={ta} className="inp" rows={1} value={text} onChange={(e) => setText(e.target.value)} aria-label="Ваш ответ покупателю"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !mobile) { e.preventDefault(); send(); } }}
              placeholder={manual ? "Напишите покупателю" : mobile ? "Написать свой ответ" : "Напишите сами — бот замолчит, пока вы ведёте диалог"}
              style={{ minHeight: 46, maxHeight: 160, resize: "none", borderRadius: mobile ? 23 : 10, padding: "12px 14px" }} />
            <button type="submit" className="btn primary" aria-label="Отправить ответ" disabled={!text.trim() || busy === "send"} style={{ width: 48, height: 46, padding: 0, borderRadius: mobile ? 23 : 10, flexShrink: 0 }}>{busy === "send" ? <span className="spin" /> : <Icon name={mobile ? "send" : "plane"} size={19} />}</button>
          </form>
        </div>
      </div>
      {!mobile && <aside className="dlg-aside" aria-label="О покупателе">{aside}</aside>}
      {!mobile && info && <Modal title="О покупателе" onClose={() => setInfo(false)}><div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{aside}</div></Modal>}
    </>
  );
}


// ════════════════ КАБИНЕТ КЛИЕНТА: аналитика, каталог, настройки ════════════════
function Meter({ pct, color = "var(--accent)", h = 10 }) {
  return <div aria-hidden="true" style={{ height: h, borderRadius: h / 2, background: "#1A1F28", overflow: "hidden" }}><div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", borderRadius: h / 2, background: color }} /></div>;
}

function peakInfo(heat) {
  const total = heat.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0);
  if (!total) return null;
  const dayTot = heat.map((r, i) => [i, r.reduce((a, b) => a + b, 0)]).sort((a, b) => b[1] - a[1]);
  const hourTot = Array.from({ length: 24 }, (_, h) => heat.reduce((a, r) => a + r[h], 0));
  let best = -1, bh = 0;
  for (let h = 0; h <= 19; h++) { const s = hourTot.slice(h, h + 5).reduce((a, b) => a + b, 0); if (s > best) { best = s; bh = h; } }
  const D = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const top2 = dayTot.slice(0, 2).map((x) => x[0]).sort((a, b) => a - b);
  return { days: `${D[top2[0]]} и ${D[top2[1]].toLowerCase()}`, from: bh, to: bh + 5, share: Math.round((best / total) * 100) };
}

function CabAnalytics({ cid }) {
  const { api, toast, badges } = useApp();
  const mobile = useMedia(MOBILE_Q);
  const [days, setDays] = useState(30);
  const [table, setTable] = useState(false);
  const { data, error, loading, reload } = useLoad(() => api.get(`/api/c/${encodeURIComponent(cid)}/analytics?days=${days}`), [cid, days], false);
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const k = data.kpi;
  const lead = bizType(badges?.business_type) === "lead";
  const end = data.dates[data.dates.length - 1];
  const f0 = (data.funnel[0] || {}).n || 0;
  const steps = data.funnel.filter((f) => f.key !== "done");
  const doneStep = data.funnel.find((f) => f.key === "done");
  const peak = peakInfo(data.heat);
  const topMax = Math.max(1, ...data.top.map((t) => t.sum));
  const drop = data.drop;
  return (
    <div className="wrap">
      <PageHead title="Аналитика" sub={<>{dLong(data.start)} — {dLong(end)}<span className="hide-m"> · сравнение с {dLong(data.prev_start)} — {dLong(shiftIso(data.start, -1))}</span></>} right={<>
        <Seg value={days} onChange={setDays} options={[[7, "7 дней"], [30, "30 дней"], [90, "3 месяца"]]} label="Период" />
        <Btn icon="download" onClick={() => api.download(`/api/c/${cid}/export`, `zakazy-${dayKey(Date.now())}.csv`).catch((e) => toast(e.message, "bad"))}>{mobile ? "Excel" : "Заказы в Excel"}</Btn>
      </>} />
      {loading && <div className="hint row" style={{ gap: 8 }}><span className="spin" style={{ width: 14, height: 14 }} />Считаю за {days === 90 ? "3 месяца" : `${days} дней`}…</div>}
      <section className="kpis kpis5" aria-label="Главные цифры за период">
        <Kpi label="Выручка" value={rub(k.revenue)}><Delta cur={k.revenue} prev={k.revenue_prev} /><span>было {rub(k.revenue_prev)}</span></Kpi>
        <Kpi label={lead ? "Заявок" : "Заказов"} value={num(k.orders)}><Delta cur={k.orders} prev={k.orders_prev} /><span>было {num(k.orders_prev)}</span></Kpi>
        <Kpi label="Средний чек" value={k.avg ? rub(k.avg) : "—"}><Delta cur={k.avg} prev={k.avg_prev} /><span>было {k.avg_prev ? rub(k.avg_prev) : "—"}</span></Kpi>
        <Kpi label="Конверсия" value={k.conversion != null ? `${k.conversion}%` : "—"}>{k.conversion != null && k.conversion_prev != null ? <><Delta cur={k.conversion} prev={k.conversion_prev} unit=" п.п." /><span>было {k.conversion_prev}%</span></> : <span>из диалога в {lead ? "заявку" : "заказ"}</span>}</Kpi>
        <Kpi label="Ответ бота" value={k.ai_ms ? secs(k.ai_ms) : "—"}><span>{k.ai_ms ? "в среднем за период" : "появится после ответов бота"}</span></Kpi>
      </section>
      <section className="card" aria-labelledby="ln-t" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="between" style={{ flexWrap: "wrap" }}>
          <h2 id="ln-t" className="h2">Выручка по дням</h2>
          <div className="row" style={{ gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "var(--dim)" }}>
            <span className="row" style={{ gap: 6 }}><span style={{ width: 18, height: 3, borderRadius: 2, background: "var(--accent-text)" }} />этот период</span>
            <span className="row" style={{ gap: 6 }}><span style={{ width: 18, borderTop: "2px dashed #6B7280" }} />прошлый период</span>
            <button type="button" className="btn ghost sm" style={{ color: "var(--accent-text)", padding: "0 4px" }} onClick={() => setTable(!table)}>{table ? "Показать графиком" : "Показать таблицей"}</button>
          </div>
        </div>
        {table ? (
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            <div role="table" aria-label="Выручка по дням" style={{ fontSize: 13.5 }}>
              <div role="row" className="tbl-row" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "8px 0", color: "var(--faint)", fontSize: 12, fontWeight: 700, position: "sticky", top: 0, background: "var(--card)" }}><span role="columnheader">День</span><span role="columnheader" style={{ textAlign: "right" }}>Выручка</span><span role="columnheader" style={{ textAlign: "right" }}>Прошлый период</span></div>
              {data.dates.map((dt, i) => (
                <div key={dt} role="row" className="tbl-row" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "7px 0", borderTop: "1px solid var(--line3)" }}>
                  <span role="rowheader">{dLong(dt)}</span><b role="cell" style={{ textAlign: "right" }}>{rub(data.by_day[i])}</b><span role="cell" className="dim" style={{ textAlign: "right" }}>{rub(data.by_day_prev[i])} <span className="muted">· {dLong(shiftIso(dt, -days))}</span></span>
                </div>
              )).reverse()}
            </div>
          </div>
        ) : <LineChart cur={data.by_day} prev={data.by_day_prev} dates={data.dates} height={mobile ? 180 : 240} />}
      </section>
      <div className="cols">
        <section className="card col" aria-labelledby="fn-t" style={{ flex: "1 1 400px", gap: 14 }}>
          <div><h2 id="fn-t" className="h2">Путь до {lead ? "заявки" : "заказа"}</h2><div className="hint" style={{ marginTop: 4 }}>Сколько покупателей дошли до каждого шага</div></div>
          {f0 ? steps.map((f) => {
            const pct = Math.round((f.n / f0) * 100);
            return (
              <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="between" style={{ fontSize: 14 }}><b>{f.label}</b><span><b>{num(f.n)}</b><span className="muted"> · {pct}%</span></span></div>
                <Meter pct={pct} />
              </div>
            );
          }) : <div className="hint">За этот период боту никто не писал.</div>}
          {doneStep && k.orders > 0 && <div style={{ fontSize: 13.5, color: "var(--dim)" }}>Выполнено <b style={{ color: "var(--text)" }}>{num(doneStep.n)}</b> из {num(k.orders)} {lead ? plural(k.orders, "заявки", "заявок", "заявок") : plural(k.orders, "заказа", "заказов", "заказов")} — {Math.round((doneStep.n / k.orders) * 100)}%</div>}
          {drop && drop.lost > 0 && (
            <div style={{ border: "1px solid rgba(245,181,68,.35)", background: "rgba(245,181,68,.07)", borderRadius: 12, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55 }}>
              <b style={{ color: "var(--warn)" }}>Где теряются покупатели:</b> между шагами «{drop.from}» и «{drop.to}» ушли {num(drop.lost)} {plural(drop.lost, "человек", "человека", "человек")} — {drop.pct}%. Откройте такие диалоги и посмотрите, на каком вопросе покупатели замолкают.
            </div>
          )}
          {!data.schema && <div className="hint">Подробные шаги появятся после обновления базы.</div>}
        </section>
        <section className="card col" aria-labelledby="top-t" style={{ flex: "1.3 1 460px", gap: 6 }}>
          <div className="between" style={{ paddingBottom: 6 }}><h2 id="top-t" className="h2">Что покупают</h2><span className="hint">по выручке</span></div>
          {data.top.length ? (
            <div role="table" aria-label="Самые продаваемые товары">
              <div role="row" className="tbl-row" style={{ gridTemplateColumns: mobile ? "minmax(0,1fr) 92px 52px" : "26px minmax(0,1fr) 64px 104px minmax(110px,150px)", gap: 10, padding: "6px 0", color: "var(--faint)", fontSize: 11.5, fontWeight: 800, letterSpacing: .4, textTransform: "uppercase" }}>
                {!mobile && <span role="columnheader">№</span>}<span role="columnheader">Товар</span>{!mobile && <span role="columnheader" style={{ textAlign: "right" }}>Продано</span>}<span role="columnheader" style={{ textAlign: "right" }}>Выручка</span><span role="columnheader" style={{ textAlign: "right" }}>Доля</span>
              </div>
              {data.top.map((t, i) => (
                <div key={t.name} role="row" className="tbl-row" style={{ gridTemplateColumns: mobile ? "minmax(0,1fr) 92px 52px" : "26px minmax(0,1fr) 64px 104px minmax(110px,150px)", gap: 10, padding: "9px 0", borderTop: "1px solid var(--line3)", fontSize: 14 }}>
                  {!mobile && <span role="cell" className="muted">{i + 1}</span>}
                  <span role="rowheader" style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                  {!mobile && <span role="cell" className="dim" style={{ textAlign: "right" }}>{num(t.qty)} шт</span>}
                  <b role="cell" style={{ textAlign: "right" }}>{rub(t.sum)}</b>
                  <span role="cell" className="row" style={{ gap: 8, justifyContent: "flex-end" }}>{!mobile && <span style={{ flex: 1 }}><Meter pct={(t.sum / topMax) * 100} h={8} /></span>}<span className="dim" style={{ fontSize: 12.5, minWidth: 40, textAlign: "right" }}>{String(t.share).replace(".", ",")}%</span></span>
                </div>
              ))}
            </div>
          ) : <div className="hint">Продаж за этот период ещё не было.</div>}
        </section>
      </div>
      <section className="card" aria-labelledby="hm-t" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="between" style={{ flexWrap: "wrap" }}>
          <h2 id="hm-t" className="h2">Когда пишут покупатели</h2>
          <span className="row" aria-hidden="true" style={{ gap: 5, fontSize: 12, color: "var(--faint)" }}>реже{[0.07, 0.2, 0.36, 0.56, 0.82].map((a) => <span key={a} style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(47,99,230,${a})` }} />)}<span style={{ width: 14, height: 14, borderRadius: 3, background: "var(--accent-text)" }} />чаще</span>
        </div>
        <div className="cols" style={{ alignItems: "stretch" }}>
          <div style={{ flex: "3 1 520px", minWidth: 0 }}><Heatmap heat={data.heat} /></div>
          <div className="col" style={{ flex: "1 1 240px", gap: 12 }}>
            {peak && (
              <div style={{ background: "var(--card2)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="hint">Пик</span>
                <b style={{ fontSize: 17 }}>{peak.days}, {pad(peak.from)}:00 — {pad(peak.to)}:00</b>
                <span className="hint">В эти 5 часов приходит {peak.share}% сообщений — держите больше товара наготове.</span>
              </div>
            )}
            <div style={{ background: "var(--card2)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="hint">Ночью, с 00 до 08</span>
              <b style={{ fontSize: 17 }}>{num(data.night_orders)} {plural(data.night_orders, lead ? "заявка" : "заказ", lead ? "заявки" : "заказа", lead ? "заявок" : "заказов")} · {data.night_pct}%</b>
              <span className="hint">{data.night_orders ? "Их принял бот, пока магазин был закрыт." : "Ночью заказов не было."}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ════════ Каталог ════════
function parsePriceInput(v) { const n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; }

function CatThumb({ it }) {
  const n = (it.photos || []).length;
  if (!n) return <span className="ph" aria-label="Нет фото" style={{ background: "transparent", border: "1.5px dashed rgba(245,181,68,.6)", color: "var(--warn)" }}><Icon name="plus" size={18} /></span>;
  return <span className="ph" aria-hidden="true"><Icon name="image" size={20} /></span>;
}

function CabCatalog({ cid }) {
  const { api, toast } = useApp();
  const mobile = useMedia(MOBILE_Q);
  const narrow = useMedia("(max-width: 1180px)");
  const [q, setQ] = useState("");
  const [sq, setSq] = useState("");
  const [selId, setSelId] = useState(null);
  const [stub, setStub] = useState(null);
  const [imp, setImp] = useState(false);
  const { data, error, loading, reload, setData } = useLoad(() => api.get(`/api/c/${encodeURIComponent(cid)}/catalog${sq ? `?q=${encodeURIComponent(sq)}` : ""}`), [cid, sq], false);
  useEffect(() => {
    const n = hashQuery().new;
    if (n !== undefined) { setStub({ id: null, name: n, price: "", category: "", description: "", available: true, photos: [] }); setSelId("new"); }
  }, []);
  useEffect(() => {
    if (!data || (!data.truncated && !sq)) return undefined;
    const t = setTimeout(() => setSq(q.trim()), 450);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line
  if (loading && !data) return <PageSkeleton />;
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  const all = data.items;
  const ql = q.trim().toLowerCase();
  const items = ql && !sq ? all.filter((i) => (i.name || "").toLowerCase().includes(ql) || (i.category || "").toLowerCase().includes(ql)) : all;
  const groups = {};
  items.forEach((i) => { (groups[i.category || "Прочее"] = groups[i.category || "Прочее"] || []).push(i); });
  const catNames = Object.keys(groups).sort((a, b) => (a === "Прочее" ? 1 : b === "Прочее" ? -1 : a.localeCompare(b, "ru")));
  const cats = Array.from(new Set(all.map((i) => i.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ru"));
  const onSale = all.filter((i) => i.available).length;
  const sel = selId === "new" ? stub : all.find((i) => i.id === selId) || null;
  const openNew = (name = "") => { setStub({ id: null, name, price: "", category: "", description: "", available: true, photos: [] }); setSelId("new"); };
  const toggle = async (it, on) => {
    setData((d) => ({ ...d, items: d.items.map((x) => (x.id === it.id ? { ...x, available: on } : x)) }));
    try { await api.post(`/api/c/${cid}/catalog/toggle`, { id: it.id, available: on }); toast(on ? `«${it.name}» снова в продаже` : `«${it.name}» снят с продажи — бот перестал его предлагать`); }
    catch (e) { toast(e.message, "bad"); reload(); }
  };
  const toggleCat = async (cat, on) => {
    setData((d) => ({ ...d, items: d.items.map((x) => ((x.category || "Прочее") === cat ? { ...x, available: on } : x)) }));
    try { await api.post(`/api/c/${cid}/catalog/category`, { category: cat, available: on }); toast(on ? `«${cat}» снова в продаже` : `«${cat}» сняты с продажи`); }
    catch (e) { toast(e.message, "bad"); reload(); }
  };
  const onSaved = (id, fields, wasNew) => {
    if (wasNew) {
      setData((d) => ({ ...d, items: [...d.items, { id, ...fields, photos: [], sold_30: 0 }], total: (d.total || 0) + 1 }));
      setSelId(id); setStub(null);
    } else {
      setData((d) => ({ ...d, items: d.items.map((x) => (x.id === id ? { ...x, ...fields } : x)) }));
    }
    reload();
  };
  const onDeleted = (id) => { setData((d) => ({ ...d, items: d.items.filter((x) => x.id !== id), total: Math.max(0, (d.total || 1) - 1) })); setSelId(null); };
  const onPhotos = (id, photos) => setData((d) => ({ ...d, items: d.items.map((x) => (x.id === id ? { ...x, photos, photo_url: photos[0] || null } : x)) }));
  const editor = sel && <ItemEditor key={sel.id || "new"} cid={cid} item={sel} cats={cats} schema={data.schema} onSaved={onSaved} onDeleted={onDeleted} onPhotos={onPhotos} onClose={() => setSelId(null)} inModal={narrow} />;
  return (
    <div className="wrap">
      <PageHead title="Каталог" sub={<>{num(data.total)} {plural(data.total, "товар", "товара", "товаров")} · в продаже {num(onSale)}<span className="hide-m">. Бот берёт цены, фото и описания отсюда: выключили товар — бот сразу перестаёт его предлагать.</span></>} right={<>
        <div style={{ position: "relative", flex: mobile ? "1 1 100%" : undefined }}>
          <span style={{ position: "absolute", left: 12, top: 13, color: "var(--faint)" }}><Icon name="search" size={18} /></span>
          <input className="inp" style={{ paddingLeft: 38, width: mobile ? "100%" : 220 }} placeholder="Найти товар" aria-label="Найти товар" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Btn icon="upload" onClick={() => setImp(true)}>{mobile ? "Списком" : "Загрузить списком"}</Btn>
        <Btn kind="primary" icon="plus" onClick={() => openNew("")}>Товар</Btn>
      </>} />
      <div className="cab-2" style={!sel || narrow ? { gridTemplateColumns: "minmax(0,1fr)" } : null}>
        <div className="col" style={{ gap: 16 }}>
          {data.tips.length > 0 && !ql && (
            <section className="card" aria-labelledby="tips-t" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="row" style={{ gap: 10, flexWrap: "wrap", paddingBottom: 8 }}><h2 id="tips-t" className="h2">Подсказки по каталогу</h2><span className="hint">по разбору диалогов</span></div>
              {data.tips.map((t, i) => (
                <div key={i} className="row" style={{ gap: 14, padding: "12px 0", borderTop: "1px solid var(--line3)", flexWrap: mobile ? "wrap" : "nowrap" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: t.kind === "photo" ? "var(--warn-soft)" : "var(--accent-soft)", color: t.kind === "photo" ? "var(--warn)" : "var(--accent-text)" }}><Icon name={t.kind === "photo" ? "image" : "question"} size={18} /></span>
                  <div style={{ flex: "1 1 220px", fontSize: 13.5, lineHeight: 1.5, minWidth: 0 }}><b>{t.title}</b>{t.text ? <span className="dim"> {t.text}</span> : null}</div>
                  {t.kind === "photo" ? <Btn size="sm" onClick={() => setSelId(t.item_id)}>Добавить фото</Btn>
                    : <Btn size="sm" kind="soft" onClick={() => openNew(t.product || "")}>{t.product ? `Добавить «${short(t.product, 22)}»` : "Добавить товар"}</Btn>}
                </div>
              ))}
            </section>
          )}
          {data.truncated && !sq && <div className="hint">Товаров много — показаны первые {all.length}. Найдите нужный через поиск.</div>}
          <section className="card" aria-label="Товары" style={{ padding: 0, overflow: "hidden" }}>
            {catNames.map((cat) => {
              const list = groups[cat];
              const anyOn = list.some((i) => i.available);
              return (
                <Fragment key={cat}>
                  <div className="row" style={{ gap: 10, padding: "12px 20px", borderTop: "1px solid var(--line)", background: "var(--card)" }}>
                    <b style={{ fontSize: 14.5 }}>{cat}</b><span className="hint">{list.length} {plural(list.length, "товар", "товара", "товаров")}</span>
                    <span style={{ flex: 1 }} />
                    <Switch on={anyOn} onChange={(v) => toggleCat(cat, v)} label={`Категория «${cat}» в продаже`} />
                  </div>
                  {list.map((it) => {
                    const n = (it.photos || []).length;
                    return (
                      <div key={it.id} className={`cat-row ${sel && sel.id === it.id ? "on" : ""}`} role="button" tabIndex={0} aria-label={`Изменить «${it.name}»`} onClick={() => setSelId(it.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelId(it.id); } }}>
                        <CatThumb it={it} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5, color: it.available ? "var(--text)" : "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div>
                          <div className="hint" style={{ marginTop: 2 }}>{n ? <b style={{ color: "var(--dim)" }}>{n} фото</b> : <b style={{ color: "var(--warn)" }}>Нет фото</b>} · {it.available ? `продано ${num(it.sold_30)} за 30 дней` : "снят с продажи"}</div>
                        </div>
                        <b style={{ whiteSpace: "nowrap", fontSize: 15, color: it.available ? "var(--text)" : "var(--faint)" }}>{rub(it.price)}</b>
                        <Switch on={!!it.available} onChange={(v) => toggle(it, v)} label={`«${it.name}» в продаже`} />
                      </div>
                    );
                  })}
                </Fragment>
              );
            })}
            {!items.length && <Empty icon="box" title={all.length ? "Ничего не нашли" : "Каталог пуст"} text={all.length ? "Попробуйте другое слово." : "Добавьте товары по одному или загрузите списком из Excel — бот сразу начнёт их предлагать."} action={!all.length ? <Btn kind="primary" icon="upload" onClick={() => setImp(true)}>Загрузить списком</Btn> : null} />}
          </section>
        </div>
        {sel && !narrow && <aside className="card" aria-label="Товар" style={{ position: "sticky", top: 20, maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}>{editor}</aside>}
      </div>
      {sel && narrow && <Modal sheet={mobile} wide title={sel.id ? sel.name || "Товар" : "Новый товар"} onClose={() => setSelId(null)}>{editor}</Modal>}
      {imp && <ImportModal cid={cid} onClose={() => setImp(false)} onDone={() => { setImp(false); reload(); }} />}
    </div>
  );
}

function ItemEditor({ cid, item, cats, schema, onSaved, onDeleted, onPhotos, onClose, inModal }) {
  const { api, toast } = useApp();
  const init = { name: item.name || "", price: item.price ? String(item.price) : "", category: item.category || "", description: item.description || "", available: item.available !== false };
  const [f, setF] = useState(init);
  const [photos, setPhotos] = useState(item.photos || []);
  const [busy, setBusy] = useState("");
  const [del, setDel] = useState(false);
  const fileRef = useRef(null);
  const isNew = !item.id;
  const dirty = isNew || JSON.stringify(f) !== JSON.stringify(init);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    if (!f.name.trim()) { toast("Напишите название товара", "bad"); return; }
    setBusy("save");
    try {
      const r = await api.post(`/api/c/${cid}/catalog/save`, { id: item.id || undefined, name: f.name.trim(), price: f.price, category: f.category.trim(), description: f.description, available: f.available });
      toast(isNew ? "Товар добавлен — бот уже может его предлагать" : "Сохранено — бот уже знает новые данные");
      onSaved(r.id || item.id, { name: f.name.trim(), price: parsePriceInput(f.price), category: f.category.trim() || "Прочее", description: f.description, available: f.available }, isNew);
    } catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const upload = async (files) => {
    const list = Array.from(files || []).slice(0, Math.max(0, 10 - photos.length));
    let cur = photos;
    for (const file of list) {
      setBusy("photo");
      try {
        const dataUrl = await resizeImage(file);
        const r = await api.post(`/api/c/${cid}/catalog/photo`, { id: item.id, photo: dataUrl });
        cur = r.photos || [...cur, r.url];
        setPhotos(cur); onPhotos(item.id, cur);
      } catch (e) { toast(e.message, "bad"); break; }
    }
    if (list.length) toast(list.length > 1 ? "Фото загружены" : "Фото загружено");
    setBusy("");
    if (fileRef.current) fileRef.current.value = "";
  };
  const photoAct = async (kind, url) => {
    setBusy(kind + url);
    try {
      const r = await api.post(`/api/c/${cid}/catalog/${kind === "main" ? "photo-main" : "photo-delete"}`, { id: item.id, url });
      setPhotos(r.photos); onPhotos(item.id, r.photos);
      toast(kind === "main" ? "Это фото теперь главное" : "Фото удалено");
    } catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const desc = f.description.trim();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!inModal && (
        <div className="between" style={{ alignItems: "flex-start" }}>
          <h2 className="h2" style={{ fontSize: 19 }}>{isNew ? "Новый товар" : f.name || "Товар"}</h2>
          <span className="row" style={{ gap: 6, fontSize: 13, fontWeight: 800, color: f.available ? "var(--ok)" : "var(--faint)" }}><span className="dot" style={{ background: f.available ? "var(--ok)" : "#5C6270" }} />{f.available ? "В продаже" : "Снят с продажи"}</span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="between"><span className="lbl">Фото</span><span className="hint">{photos.length} из 10</span></div>
        {isNew ? <div className="hint" style={{ padding: "12px 14px", border: "1px dashed var(--line2)", borderRadius: 12 }}>Сначала сохраните товар — потом сможете добавить фото.</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 8 }}>
            {photos.map((u, i) => (
              <div key={u} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 10, overflow: "hidden", background: "#1B2029", border: i === 0 ? "2px solid var(--accent)" : "1px solid var(--line2)" }}>
                <img src={u} alt={`Фото ${i + 1}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <span style={{ position: "absolute", left: 6, bottom: 6, fontSize: 11, fontWeight: 800, background: "rgba(10,12,16,.82)", borderRadius: 6, padding: "2px 6px" }}>{i === 0 ? "Главное" : `Фото ${i + 1}`}</span>
                <span style={{ position: "absolute", right: 4, top: 4, display: "flex", gap: 4 }}>
                  {i > 0 && <button type="button" aria-label="Сделать главным" title="Сделать главным" disabled={!!busy} onClick={() => photoAct("main", u)} style={{ width: 30, height: 30, borderRadius: 8, border: 0, background: "rgba(10,12,16,.82)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="star" size={15} /></button>}
                  <button type="button" aria-label="Удалить фото" title="Удалить" disabled={!!busy} onClick={() => photoAct("del", u)} style={{ width: 30, height: 30, borderRadius: 8, border: 0, background: "rgba(10,12,16,.82)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={15} /></button>
                </span>
              </div>
            ))}
            {photos.length < (schema ? 10 : 1) && (
              <button type="button" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy === "photo"} style={{ aspectRatio: "1 / 1", borderRadius: 10, border: "1.5px dashed var(--line2)", background: "transparent", color: "var(--dim)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 12, fontWeight: 700 }}>
                {busy === "photo" ? <span className="spin" /> : <><Icon name="plus" size={20} />Добавить</>}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple={!!schema} hidden onChange={(e) => upload(e.target.files)} />
          </div>
        )}
        {!isNew && <span className="hint">{schema ? "Бот присылает все фото товара одним сообщением. Первое — главное." : "После обновления базы можно будет добавить до 10 фото."}</span>}
      </div>
      <label className="lbl">Название<input className="inp" value={f.name} onChange={set("name")} placeholder="Например, Пионы 11 шт" /></label>
      <div className="wrapflex" style={{ gap: 12 }}>
        <label className="lbl" style={{ flex: "1 1 120px" }}>Цена, ₽<input className="inp" inputMode="numeric" value={f.price} onChange={set("price")} placeholder="4 500" /></label>
        <label className="lbl" style={{ flex: "1 1 160px" }}>Категория<input className="inp" list={`cats-${cid}`} value={f.category} onChange={set("category")} placeholder="Букеты" /></label>
        <datalist id={`cats-${cid}`}>{cats.map((c) => <option key={c} value={c} />)}</datalist>
      </div>
      <label className="lbl">Описание для бота
        <textarea className="inp" rows={4} value={f.description} onChange={set("description")} disabled={!schema} placeholder="Состав, размер, сколько стоит, чем хорош. Бот перескажет своими словами." />
      </label>
      {!schema && <span className="hint" style={{ marginTop: -8 }}>Описание заработает после обновления базы.</span>}
      <label className="row" style={{ gap: 12, justifyContent: "space-between", fontSize: 14, fontWeight: 700, minHeight: 44 }}>В продаже<Switch on={f.available} onChange={(v) => setF({ ...f, available: v })} label="В продаже" /></label>
      <div style={{ background: "var(--input)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="hint" style={{ fontWeight: 700 }}>Так бот покажет товар в Telegram</span>
        <div className="row" style={{ alignItems: "flex-end", gap: 10 }}>
          <span className="brand-logo" style={{ width: 30, height: 30, borderRadius: 15 }}><Icon name="bot" size={15} /></span>
          <div style={{ background: "#1A1F28", borderRadius: "14px 14px 14px 4px", overflow: "hidden", maxWidth: 360, flex: 1 }}>
            {photos.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, photos.length)}, 1fr)`, gap: 2 }}>{photos.slice(0, 3).map((u) => <img key={u} src={u} alt="" loading="lazy" style={{ width: "100%", height: 84, objectFit: "cover", display: "block" }} />)}</div>}
            <div style={{ padding: "10px 12px", fontSize: 14, lineHeight: 1.5 }}><b>{f.name || "Название"} — {rub(parsePriceInput(f.price))}</b>{desc && <div style={{ color: "var(--dim)" }}>{short(desc, 160)}</div>}</div>
          </div>
        </div>
      </div>
      <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
        <Btn kind="primary" disabled={!dirty} loading={busy === "save"} onClick={save}>{isNew ? "Добавить товар" : "Сохранить"}</Btn>
        {!isNew && dirty && <Btn onClick={() => setF(init)}>Отменить правки</Btn>}
        {isNew && <Btn onClick={onClose}>Отмена</Btn>}
        <span style={{ flex: 1 }} />
        {!isNew && <Btn kind="ghost" style={{ color: "var(--bad)" }} onClick={() => setDel(true)}>Удалить товар</Btn>}
      </div>
      {del && <Confirm title={`Удалить «${item.name}»?`} text="Товар пропадёт из каталога, бот перестанет его предлагать. Если товар временно закончился, лучше просто выключите его." ok="Удалить" danger onClose={() => setDel(false)} onOk={async () => { try { await api.post(`/api/c/${cid}/catalog/delete`, { id: item.id }); toast("Товар удалён"); onDeleted(item.id); } catch (e) { toast(e.message, "bad"); throw e; } }} />}
    </div>
  );
}

function ImportModal({ cid, onClose, onDone }) {
  const { api, toast } = useApp();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const lines = text.split("\n").filter((l) => l.trim() && !/^==.*==$/.test(l.trim())).length;
  const pick = async (file) => {
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      let t;
      try { t = new TextDecoder("utf-8", { fatal: true }).decode(buf); } catch (e) { t = new TextDecoder("windows-1251").decode(buf); }
      setText(t.replace(/^﻿/, ""));
    } catch (e) { toast("Не удалось прочитать файл", "bad"); }
  };
  const submit = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/api/c/${cid}/catalog/import`, { text });
      if (!r.added && !r.updated) toast("Не нашли ни одной строки с ценой — проверьте формат", "bad");
      else { toast(`Готово: добавлено ${r.added}, обновлено ${r.updated}`); onDone(); }
    } catch (e) { toast(e.message, "bad"); }
    setBusy(false);
  };
  return (
    <Modal wide title="Загрузить товары списком" onClose={onClose} footer={<><Btn onClick={onClose}>Отмена</Btn><Btn kind="primary" disabled={!lines} loading={busy} onClick={submit}>{lines ? `Загрузить ${lines} ${plural(lines, "строку", "строки", "строк")}` : "Загрузить"}</Btn></>}>
      <div className="hint" style={{ fontSize: 13.5, lineHeight: 1.55 }}>Скопируйте из Excel или Google Таблиц две колонки — <b style={{ color: "var(--text)" }}>название и цену</b> — и вставьте сюда. Подойдёт и простой список вида «Пионы 11 шт - 4500». Категорию задайте строкой <b className="mono" style={{ color: "var(--text)" }}>== Букеты ==</b> — товары ниже попадут в неё.</div>
      <textarea className="inp mono" rows={10} value={text} onChange={(e) => setText(e.target.value)} aria-label="Список товаров" placeholder={"== Букеты ==\nБукет Нежность\t2500\nПионы 11 шт - 4500\n\n== Розы ==\nРозы 25 шт; 3500"} style={{ fontSize: 13 }} />
      <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
        <Btn size="sm" icon="upload" onClick={() => fileRef.current && fileRef.current.click()}>Выбрать файл .csv или .txt</Btn>
        <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={(e) => pick(e.target.files && e.target.files[0])} />
        <span className="hint">Товар с тем же названием обновится, новые добавятся. Ничего не удаляется.</span>
      </div>
    </Modal>
  );
}

// ════════ Настройки бота ════════
const PAYS = [["card", "Картой курьеру"], ["transfer", "Переводом по номеру"], ["cash", "Наличными"], ["link", "Ссылкой на оплату"]];
function normSettings(s) {
  const t = s.shop_terms || {};
  const tone = s.tone || {};
  const n = s.notify || {};
  return {
    bot_mode: s.bot_mode || "auto",
    approval_rules: Array.isArray(s.approval_rules) ? s.approval_rules : [],
    big_order_limit: String(s.big_order_limit || 20000),
    draft_wait_min: Number(s.draft_wait_min ?? 10),
    draft_fallback: s.draft_fallback || "hold",
    shop_terms: { delivery: t.delivery ?? "", free: t.free ?? "", zone: t.zone ?? "", outside: t.outside ?? "ask", pickup: t.pickup ?? "", hours: t.hours ?? "", night: t.night !== false, payments: Array.isArray(t.payments) ? t.payments : [], extra: t.extra ?? "" },
    tone: { you: tone.you || "vy", style: tone.style || "warm", emoji: tone.emoji !== false },
    greeting: s.greeting || "",
    notify: { order: n.order !== false, draft: n.draft !== false, handoff: n.handoff !== false, daily: !!n.daily, repeat: Number(n.repeat ?? 5) },
  };
}
function toneSample(t) {
  const ty = t.you === "ty";
  if (t.style === "short") return `Есть${t.emoji ? " 👌" : "."} К какому времени ${ty ? "тебе " : ""}привезти?`;
  return `Да, всё есть${t.emoji ? " 🙂" : "!"} Подскажи${ty ? "" : "те"}, к какому времени ${ty ? "тебе" : "вам"} удобно получить заказ?`;
}

function CabSettings({ cid }) {
  const { api, toast, isAdmin, nav, reloadBadges, badges } = useApp();
  const { data, error, loading, reload } = useLoad(() => api.get(`/api/c/${encodeURIComponent(cid)}/settings`), [cid], false);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState("");
  const [pause, setPause] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  useEffect(() => { if (data && !f) setF(normSettings(data.settings)); }, [data]); // eslint-disable-line
  if (error && !data) return <div className="wrap"><ErrorBox error={error} onRetry={reload} /></div>;
  if (!data || !f) return <PageSkeleton />;
  const st = data.settings;
  const orig = normSettings(st);
  const dirty = JSON.stringify(f) !== JSON.stringify(orig);
  const lead = bizType(st.business_type || badges?.business_type) === "lead";
  const paused = st.status === "paused";
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const setT = (k, v) => setF((x) => ({ ...x, shop_terms: { ...x.shop_terms, [k]: v } }));
  const setTone = (k, v) => setF((x) => ({ ...x, tone: { ...x.tone, [k]: v } }));
  const setN = (k, v) => setF((x) => ({ ...x, notify: { ...x.notify, [k]: v } }));
  const t = f.shop_terms;
  const save = async () => {
    setBusy("save");
    try {
      await api.post(`/api/c/${cid}/settings`, { ...f, big_order_limit: parsePriceInput(f.big_order_limit) || 20000 });
      const fresh = await api.get(`/api/c/${encodeURIComponent(cid)}/settings`);
      setF(normSettings(fresh.settings));
      await reload();
      setSavedAt(Date.now());
      toast("Настройки сохранены — бот уже работает по-новому");
      reloadBadges();
    } catch (e) { toast(e.message, "bad"); }
    setBusy("");
  };
  const setStatus = async (status) => {
    try {
      await api.post(`/api/c/${cid}/settings`, { status });
      toast(status === "paused" ? "Бот на паузе — покупатели получат «напишем позже»" : "Бот снова отвечает покупателям");
      await reload(); reloadBadges();
    } catch (e) { toast(e.message, "bad"); throw e; }
  };
  const s = data.stats || {};
  const stats = s.drafts_30 ? `за 30 дней — ${s.drafts_30} ${plural(s.drafts_30, "черновик", "черновика", "черновиков")}${s.avg_answer_min != null ? `, вы отвечали в среднем за ${s.avg_answer_min} мин` : ""}` : null;
  const reps = [5, 10, 0].includes(f.notify.repeat) ? [5, 10, 0] : [5, 10, f.notify.repeat, 0];
  const statusLine = dirty ? <span style={{ color: "var(--warn)", fontWeight: 700 }}>Есть несохранённые изменения</span> : savedAt ? <span className="hint">Сохранено в {hhmm(savedAt)}</span> : <span className="hint">Все изменения сохранены</span>;
  return (
    <div className="wrap">
      <PageHead title="Настройки бота" sub="Как бот отвечает покупателям и когда зовёт вас" right={<><span className="hide-m" style={{ fontSize: 13 }}>{statusLine}</span><Btn kind="primary" disabled={!dirty || !data.schema} loading={busy === "save"} onClick={save}>Сохранить</Btn></>} />
      {!data.schema && <div className="banner" style={{ background: "var(--warn-soft)", color: "var(--warn)", fontWeight: 700, fontSize: 13.5 }}>Режимы, условия и уведомления заработают после обновления базы (SQL-файл). Пока можно только поставить бота на паузу.</div>}
      <section className="card" aria-labelledby="m-t" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 id="m-t" className="h2">Режим работы</h2>
        <ModePicker value={f.bot_mode} onChange={(v) => set("bot_mode", v)} name="cab-mode" />
        <RulesBox mode={f.bot_mode} rules={f.approval_rules} setRules={(v) => set("approval_rules", v)} wait={f.draft_wait_min} setWait={(v) => set("draft_wait_min", v)} fallback={f.draft_fallback} setFallback={(v) => set("draft_fallback", v)} stats={stats} bigLimit={f.big_order_limit} setBigLimit={(v) => set("big_order_limit", v)} />
      </section>
      <div className="cols">
        <div className="col" style={{ flex: "1.2 1 440px" }}>
          <section className="card" aria-labelledby="t-t" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><h2 id="t-t" className="h2">Условия магазина</h2><div className="hint" style={{ marginTop: 4 }}>Бот отвечает покупателям по этим данным — ничего не придумывает</div></div>
            <div className="wrapflex" style={{ gap: 12 }}>
              <label className="lbl" style={{ flex: "1 1 110px" }}>Доставка, ₽<input className="inp" inputMode="numeric" value={t.delivery} onChange={(e) => setT("delivery", e.target.value)} placeholder="500" /></label>
              <label className="lbl" style={{ flex: "1 1 110px" }}>Бесплатно от, ₽<input className="inp" inputMode="numeric" value={t.free} onChange={(e) => setT("free", e.target.value)} placeholder="7 000" /></label>
              <label className="lbl" style={{ flex: "2 1 200px" }}>Куда возим<input className="inp" value={t.zone} onChange={(e) => setT("zone", e.target.value)} placeholder="Москва в пределах МКАД" /></label>
            </div>
            <label className="lbl">Если просят доставку дальше
              <select className="inp" value={t.outside} onChange={(e) => setT("outside", e.target.value)}>
                <option value="ask">Бот скажет, что уточнит у вас{f.bot_mode === "mixed" && f.approval_rules.includes("delivery") ? " — и пришлёт черновик" : ""}</option>
                <option value="no">Бот вежливо откажет и предложит самовывоз</option>
                <option value="">Ничего не говорить об этом</option>
              </select>
            </label>
            <div className="wrapflex" style={{ gap: 12 }}>
              <label className="lbl" style={{ flex: "2 1 220px" }}>Самовывоз<input className="inp" value={t.pickup} onChange={(e) => setT("pickup", e.target.value)} placeholder="ул. Пятницкая, 18 — или оставьте пустым" /></label>
              <label className="lbl" style={{ flex: "1 1 150px" }}>Часы работы<input className="inp" value={t.hours} onChange={(e) => setT("hours", e.target.value)} placeholder="9:00 — 22:00" /></label>
            </div>
            <div className="row" style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "10px 6px 10px 14px", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Принимать {lead ? "заявки" : "заказы"} ночью</div>
                <div className="hint" style={{ marginTop: 2 }}>{!t.hours.trim() ? "Укажите часы работы — тогда бот поймёт, когда у вас ночь." : t.night ? `Бот оформит, а вы увидите утром.${s.night_orders_30 ? ` За 30 дней так пришло ${s.night_orders_30} ${plural(s.night_orders_30, "заказ", "заказа", "заказов")}.` : ""}` : "Ночью бот предложит написать утром."}</div>
              </div>
              <Switch on={t.night} onChange={(v) => setT("night", v)} label="Принимать ночью" />
            </div>
            <div className="lbl">Как можно оплатить
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>{PAYS.map(([k, l]) => <Chip key={k} on={t.payments.includes(k)} onClick={() => setT("payments", t.payments.includes(k) ? t.payments.filter((x) => x !== k) : [...t.payments, k])}>{l}</Chip>)}</div>
            </div>
            <label className="lbl">Что ещё важно знать боту<textarea className="inp" rows={3} value={t.extra} onChange={(e) => setT("extra", e.target.value)} placeholder="Например: открытку подписываем бесплатно, букет собираем за час" /></label>
          </section>
          <section className="card row" aria-labelledby="p-t" style={{ flexWrap: "wrap", gap: 14, borderColor: paused ? "rgba(248,113,113,.35)" : undefined }}>
            <div style={{ flex: "1 1 260px" }}>
              <h2 id="p-t" className="h2">{paused ? "Бот на паузе" : "Пауза"}</h2>
              <div className="hint" style={{ marginTop: 4 }}>{paused ? "Покупатели получают «Сейчас не можем ответить — напишем вам чуть позже». Их сообщения видны в «Диалогах»." : "Бот перестанет отвечать. Покупатели получат: «Сейчас не можем ответить — напишем вам чуть позже»."}</div>
            </div>
            {paused ? <Btn kind="primary" icon="play" onClick={() => setStatus("active").catch(() => {})}>Включить бота</Btn> : <Btn kind="danger" icon="pause" onClick={() => setPause(true)}>Поставить на паузу</Btn>}
          </section>
        </div>
        <div className="col" style={{ flex: "1 1 380px" }}>
          <section className="card" aria-labelledby="tn-t" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 id="tn-t" className="h2">Как бот общается</h2>
            <div className="wrapflex" style={{ gap: 16 }}>
              <div className="lbl">Обращение<Seg value={f.tone.you} onChange={(v) => setTone("you", v)} options={[["vy", "На «вы»"], ["ty", "На «ты»"]]} label="Обращение" /></div>
              <div className="lbl">Тон<Seg value={f.tone.style} onChange={(v) => setTone("style", v)} options={[["warm", "Дружелюбно"], ["short", "Коротко, по делу"]]} label="Тон" /></div>
            </div>
            <label className="row" style={{ justifyContent: "space-between", fontSize: 14, fontWeight: 700, minHeight: 44 }}>Эмодзи в ответах<Switch on={f.tone.emoji} onChange={(v) => setTone("emoji", v)} label="Эмодзи в ответах" /></label>
            <label className="lbl">Первое сообщение<textarea className="inp" rows={2} value={f.greeting} onChange={(e) => set("greeting", e.target.value)} placeholder={`Здравствуйте! Это ${st.name || "наш магазин"}. Чем могу помочь?`} /></label>
            <span className="hint" style={{ marginTop: -6 }}>Бот пришлёт его, когда покупатель впервые откроет бота.</span>
            <div style={{ background: "var(--input)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="hint" style={{ fontWeight: 700 }}>Пример ответа</span>
              <div className="bubble" style={{ alignSelf: "flex-end", background: "var(--accent-soft)", borderRadius: "14px 14px 4px 14px", maxWidth: "85%" }}>Есть в наличии? Нужно к вечеру</div>
              <div className="row" style={{ alignItems: "flex-end", gap: 8 }}>
                <span className="brand-logo" style={{ width: 28, height: 28, borderRadius: 14 }}><Icon name="bot" size={14} /></span>
                <div className="bubble" style={{ background: "#1A1F28", borderRadius: "14px 14px 14px 4px", maxWidth: "88%" }}>{toneSample(f.tone)}</div>
              </div>
            </div>
          </section>
          <section className="card" aria-labelledby="nt-t" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 id="nt-t" className="h2">Уведомления</h2>
            <div className="row" style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: st.staff_chat_id ? "var(--ok-soft)" : "var(--warn-soft)", color: st.staff_chat_id ? "var(--ok)" : "var(--warn)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plane" size={18} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{st.staff_chat_id ? "Telegram-группа для заказов" : "Группа для заказов не подключена"}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: st.staff_chat_id ? "var(--ok)" : "var(--warn)" }}>{st.staff_chat_id ? "подключена — сюда приходят заказы и черновики" : "без неё уведомления не придут — попросите администратора"}</div>
              </div>
              {isAdmin && <Btn size="sm" onClick={() => nav(`admin/bot/${cid}/connect`)}>Изменить</Btn>}
            </div>
            <span className="lbl" style={{ marginTop: 6 }}>Присылать в группу</span>
            {[["order", lead ? "Новая заявка" : "Новый заказ", "сразу"], ["draft", "Черновик на одобрение", "сразу"], ["handoff", "Покупатель зовёт человека", "сразу"], ["daily", "Итоги дня", "в 22:00"]].map(([k, l, w]) => (
              <label key={k} className="between" style={{ minHeight: 42, cursor: "pointer", fontSize: 14 }}>
                <span className="row" style={{ gap: 12 }}><input type="checkbox" checked={!!f.notify[k]} onChange={(e) => setN(k, e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--accent)", margin: 0 }} />{l}</span>
                <span className="hint">{w}</span>
              </label>
            ))}
            <div className="row" style={{ flexWrap: "wrap", gap: 10, borderTop: "1px solid var(--line)", paddingTop: 12, fontSize: 14, fontWeight: 600 }}>
              <label htmlFor="n-rep">Если никто не ответил, напоминать</label>
              <select id="n-rep" className="inp" style={{ width: "auto", minHeight: 40 }} value={String(f.notify.repeat)} onChange={(e) => setN("repeat", Number(e.target.value))}>
                {reps.map((m) => <option key={m} value={String(m)}>{m ? `каждые ${m} минут` : "не напоминать"}</option>)}
              </select>
            </div>
          </section>
        </div>
      </div>
      {dirty && data.schema && (
        <div className="savebar" role="region" aria-label="Несохранённые изменения">
          <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>Есть несохранённые изменения</span>
          <Btn kind="ghost" onClick={() => setF(orig)}>Отменить</Btn>
          <Btn kind="primary" loading={busy === "save"} onClick={save}>Сохранить</Btn>
        </div>
      )}
      {pause && <Confirm title="Поставить бота на паузу?" text="Бот перестанет отвечать. Покупатели получат «Сейчас не можем ответить — напишем вам чуть позже». Их сообщения будут видны в «Диалогах»." ok="Поставить на паузу" danger onOk={() => setStatus("paused")} onClose={() => setPause(false)} />}
    </div>
  );
}
