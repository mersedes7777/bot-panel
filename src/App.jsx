import { useState, useEffect } from "react";

// ════════════════════════════════════════
// АДРЕС ТВОЕГО СЕРВЕРА (Railway)
const API = "https://web-production-c4310.up.railway.app";
// ════════════════════════════════════════

const C = { bg:"#0a0e17", card:"#111827", border:"#1f2937", text:"#f9fafb", muted:"#6b7280", accent:"#6366f1", green:"#10b981", red:"#ef4444", yellow:"#f59e0b" };

const STATUS = {
  new:{l:"Новый",c:"#3b82f6"}, accepted:{l:"Принят",c:"#8b5cf6"}, cooking:{l:"Готовится",c:"#f59e0b"},
  delivering:{l:"Доставка",c:"#06b6d4"}, done:{l:"Выполнен",c:"#10b981"}, rejected:{l:"Отклонён",c:"#ef4444"},
};
const TOKEN_PRICE = { deepseek:0.14, "claude-haiku":1.0, "claude-sonnet":3.0 };

export default function App() {
  const [pwd, setPwd] = useState(localStorage.getItem("adminPwd") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [logged, setLogged] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [page, setPage] = useState("overview");
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("info");
  const [flash, setFlash] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [mob, setMob] = useState(false);

  useEffect(() => { const f = () => setMob(window.innerWidth < 768); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);

  const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: mob?16:20 };
  const input = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 12px", color: C.text, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };
  const btn = (v="p") => ({ padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: v==="p"?C.accent:v==="g"?C.green:v==="r"?"#ef444422":"#1f2937", color: v==="r"?C.red:"#fff" });
  const fl = (m) => { setFlash(m); setTimeout(() => setFlash(""), 2500); };

  // ── API запросы ──
  const apiGet = async (path) => {
    const r = await fetch(API + path, { headers: { "X-Admin-Password": pwd } });
    if (!r.ok) throw new Error("api error");
    return r.json();
  };
  const apiPost = async (path, body) => {
    const r = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Password": pwd }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error("api error");
    return r.json();
  };

  // ── Логин ──
  const doLogin = async () => {
    setLoginErr("");
    try {
      const r = await fetch(API + "/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login: loginInput, password: passInput }) });
      if (r.ok) {
        const data = await r.json();
        const headerToken = loginInput ? `${loginInput}:${passInput}` : passInput;
        setPwd(headerToken);
        setRole(data.role || "admin");
        localStorage.setItem("adminPwd", headerToken);
        localStorage.setItem("role", data.role || "admin");
        setLogged(true);
      } else {
        setLoginErr("Неверный логин или пароль");
      }
    } catch {
      setLoginErr("Сервер недоступен");
    }
  };

  // авто-логин если токен сохранён (проверяем что данные грузятся)
  useEffect(() => {
    if (pwd && !logged) {
      fetch(API + "/api/clients", { headers: { "X-Admin-Password": pwd } })
        .then(r => { if (r.ok) setLogged(true); });
    }
  }, []);

  // ── Загрузка данных ──
  const loadData = async () => {
    setLoading(true);
    try {
      const [cl, or] = await Promise.all([apiGet("/api/clients"), apiGet("/api/orders")]);
      setClients(cl.clients || []);
      setOrders(or.orders || []);
    } catch { fl("Ошибка загрузки"); }
    setLoading(false);
  };

  useEffect(() => { if (logged) loadData(); }, [logged]);

  const loadMenu = async (clientId) => {
    try { const r = await apiGet("/api/menu/" + clientId); setMenu(r.menu || []); } catch { setMenu([]); }
  };

  const tokenCost = (c) => ((c.tokens || 0) / 1e6 * (TOKEN_PRICE[c.config?.ai_model] || 0.14));
  const totalIncome = clients.filter(c => c.status === "active").reduce((s, c) => s + (c.plan_price || 0), 0);
  const totalCost = clients.reduce((s, c) => s + tokenCost(c), 0);
  const newOrders = orders.filter(o => o.status === "new").length;

  // ── ЛОГИН ЭКРАН ──
  if (!logged) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", padding: 20 }}>
      <div style={{ ...card, width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
        <h1 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Bot<span style={{ color: C.accent }}>SaaS</span></h1>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 24px" }}>Панель управления</p>
        <input type="text" placeholder="Логин" value={loginInput} onChange={e => setLoginInput(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} style={{ ...input, marginBottom: 10, textAlign: "center" }} />
        <input type="password" placeholder="Пароль" value={passInput} onChange={e => setPassInput(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} style={{ ...input, marginBottom: 12, textAlign: "center" }} />
        {loginErr && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{loginErr}</div>}
        <button onClick={doLogin} style={{ ...btn(), width: "100%" }}>Войти</button>
      </div>
    </div>
  );

  const NAV = [
    { id:"overview", icon:"▦", label:"Обзор" },
    { id:"orders", icon:"🧾", label:"Заказы", badge:newOrders },
    { id:"clients", icon:"◈", label:"Клиенты" },
    { id:"stats", icon:"📊", label:"Статистика" },
  ];

  const content = (<>
    {flash && <div style={{ position:"fixed", top:20, right:20, left:mob?20:"auto", background:C.green, color:"#fff", padding:"12px 18px", borderRadius:10, fontSize:13, fontWeight:600, zIndex:300, textAlign:"center" }}>{flash}</div>}
    {loading && <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", background:C.accent, color:"#fff", padding:"8px 16px", borderRadius:10, fontSize:12, zIndex:300 }}>Загрузка…</div>}

    {/* ОБЗОР */}
    {page === "overview" && <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px" }}>Обзор</h1><p style={{ color:C.muted, fontSize:14, margin:0 }}>Живые данные</p></div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={btn("x")} onClick={loadData}>🔄 Обновить</button>
          {role==="admin" && <button style={btn()} onClick={async()=>{
            fl("Переподключаю всех ботов...");
            try{ const r=await apiPost("/api/reconnect-webhook",{base_url:API});
              const ok=r.results?.filter(x=>x.ok).length||0;
              fl(`✅ Переподключено ботов: ${ok}/${r.results?.length||0}`); }
            catch{ fl("Ошибка"); }
          }}>🔗 Переподключить ботов</button>}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[{l:"Доход/мес",v:`$${totalIncome}`,c:C.accent},{l:"Расход AI",v:`$${totalCost.toFixed(2)}`,c:C.red},{l:"Прибыль",v:`$${(totalIncome-totalCost).toFixed(2)}`,c:C.green},{l:"Клиентов",v:clients.length,c:C.yellow}].map(s=>(
          <div key={s.l} style={{ ...card, borderTop:`3px solid ${s.c}` }}><div style={{ fontSize:11, color:s.c, fontWeight:600, textTransform:"uppercase", marginBottom:6 }}>{s.l}</div><div style={{ fontSize:mob?22:26, fontWeight:800 }}>{s.v}</div></div>))}
      </div>
      <div style={card}>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Последние заказы</div>
        {orders.length === 0 && <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:20 }}>Заказов пока нет</div>}
        {orders.slice(0,6).map(o => { const st = STATUS[o.status] || STATUS.new; return (
          <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}`, gap:8 }}>
            <div style={{ minWidth:0 }}><span style={{ fontWeight:600 }}>№{o.order_number}</span> <span style={{ color:C.muted, fontSize:13 }}>{(o.items_text||"").split("\n")[0]}</span></div>
            <span style={{ fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20, color:st.c, background:st.c+"22", whiteSpace:"nowrap" }}>{st.l}</span></div>);})}
      </div>
    </div>}

    {/* ЗАКАЗЫ */}
    {page === "orders" && <div>
      <h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px" }}>Заказы</h1>
      <p style={{ color:C.muted, fontSize:14, margin:"0 0 16px" }}>Реальные заказы из ботов</p>
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", overflowX:"auto" }}>
        {["all","new","accepted","cooking","delivering","done","rejected"].map(f=>(
          <button key={f} onClick={()=>setOrderFilter(f)} style={{ ...btn(orderFilter===f?"p":"x"), fontSize:12, padding:"7px 12px", whiteSpace:"nowrap" }}>{f==="all"?"Все":STATUS[f].l}</button>))}
      </div>
      <div style={{ display:"grid", gap:12 }}>
        {orders.filter(o=>orderFilter==="all"||o.status===orderFilter).map(o=>{ const st=STATUS[o.status]||STATUS.new; return(
          <div key={o.id} style={{ ...card, borderLeft:`3px solid ${st.c}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>Заказ №{o.order_number} <span style={{ color:C.muted, fontWeight:400, fontSize:13 }}>{o.clients?.name}</span></span>
              <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, color:st.c, background:st.c+"22" }}>{st.l}</span></div>
            <div style={{ fontSize:13, color:"#d1d5db", whiteSpace:"pre-wrap", lineHeight:1.6 }}>{o.items_text}</div>
            <div style={{ display:"flex", gap:6, marginTop:12, flexWrap:"wrap" }}>
              {Object.keys(STATUS).map(s=>(<button key={s} onClick={async()=>{ await apiPost("/api/update-order-status",{order_id:o.id,status:s}); setOrders(orders.map(x=>x.id===o.id?{...x,status:s}:x)); fl(`Заказ №${o.order_number}: ${STATUS[s].l}`); }}
                style={{ ...btn(o.status===s?"p":"x"), fontSize:11, padding:"5px 10px" }}>{STATUS[s].l}</button>))}
            </div>
          </div>);})}
      </div>
    </div>}

    {/* КЛИЕНТЫ */}
    {page === "clients" && !selected && <div>
      <h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px" }}>Клиенты</h1>
      <p style={{ color:C.muted, fontSize:14, margin:"0 0 20px" }}>Заведения из базы</p>
      <div style={{ display:"grid", gap:12 }}>
        {clients.map(c=>(<div key={c.id} style={{ ...card, cursor:"pointer" }} onClick={()=>{ setSelected(c); setTab("info"); loadMenu(c.id); }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", minWidth:0 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:"#1f2937", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{c.emoji}</div>
              <div style={{ minWidth:0 }}><div style={{ fontSize:15, fontWeight:700 }}>{c.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>{c.city} · {c.plan} · {c.config?.ai_model||"—"}</div></div>
            </div>
            <div style={{ display:"flex", gap:16, textAlign:"right", flexShrink:0 }}>
              <div><div style={{ fontWeight:700 }}>{c.dialogs_count}</div><div style={{ fontSize:11, color:C.muted }}>диал.</div></div>
              <div><div style={{ fontWeight:700, color:C.green }}>{c.orders_count}</div><div style={{ fontSize:11, color:C.muted }}>зак.</div></div>
            </div>
          </div></div>))}
      </div>
    </div>}

    {/* ДЕТАЛИ КЛИЕНТА */}
    {page === "clients" && selected && (()=>{ const c=selected;
      const TABS=[{id:"info",l:"Основное"},{id:"menu",l:"Меню"},{id:"bot",l:"Промпт"},{id:"channel",l:"Подключение"}];
      return(<div>
        <button onClick={()=>setSelected(null)} style={{ ...btn("x"), marginBottom:16 }}>← Назад</button>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"#1f2937", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{c.emoji}</div>
          <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>{c.name}</h1></div>
        <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
          {TABS.map(t=>(<div key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"9px 14px", cursor:"pointer", fontSize:13, fontWeight:tab===t.id?600:400, color:tab===t.id?C.accent:C.muted, borderBottom:`2px solid ${tab===t.id?C.accent:"transparent"}`, marginBottom:-1, whiteSpace:"nowrap" }}>{t.l}</div>))}
        </div>

        {tab==="info" && <div style={card}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Информация</div>
          {[["Название",c.name],["Город",c.city],["Тариф",`${c.plan} ($${c.plan_price}/мес)`],["Статус",c.status],["AI модель",c.config?.ai_model||"—"]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
              <span style={{ color:C.muted }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span></div>))}
        </div>}

        {tab==="menu" && <div style={card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600 }}>Меню ({menu.length})</div>
            <button style={{ ...btn(), padding:"6px 12px", fontSize:12 }} onClick={()=>setAddingItem(true)}>+ Позиция</button>
          </div>
          {addingItem && <div style={{ background:C.bg, borderRadius:10, padding:12, marginBottom:14, border:`1px solid ${C.border}` }}>
            <input id="ni-name" placeholder="Название блюда" style={{ ...input, marginBottom:8 }}/>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <input id="ni-price" placeholder="Цена" type="number" style={{ ...input }}/>
              <input id="ni-cat" placeholder="Категория" style={{ ...input }}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={btn()} onClick={async()=>{
                const name=document.getElementById("ni-name").value.trim();
                const price=+document.getElementById("ni-price").value||0;
                const cat=document.getElementById("ni-cat").value.trim()||"Прочее";
                if(!name){ fl("Введите название"); return; }
                await apiPost("/api/add-menu-item",{client_id:c.id,name,price,category:cat});
                fl("Позиция добавлена! Бот уже знает."); setAddingItem(false); loadMenu(c.id);
              }}>Добавить</button>
              <button style={btn("x")} onClick={()=>setAddingItem(false)}>Отмена</button>
            </div>
          </div>}
          {menu.length===0 && !addingItem && <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:20 }}>Меню пустое</div>}
          {menu.map(m=>(<div key={m.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.border}`, opacity:m.available?1:0.5 }}>
            <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:14 }}>{m.name}</div><div style={{ fontSize:11, color:C.muted }}>{m.category}{!m.available&&" · СТОП"}</div></div>
            <input style={{ ...input, width:70, flex:"none", padding:"6px 8px" }} defaultValue={m.price} onBlur={async(e)=>{ await apiPost("/api/update-menu-item",{id:m.id,price:+e.target.value,available:m.available}); fl("Цена обновлена"); }}/>
            <div onClick={async()=>{ const nv=!m.available; await apiPost("/api/update-menu-item",{id:m.id,price:m.price,available:nv}); setMenu(menu.map(x=>x.id===m.id?{...x,available:nv}:x)); }}
              style={{ width:38, height:22, borderRadius:11, background:m.available?C.green:C.border, cursor:"pointer", position:"relative", flexShrink:0 }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:m.available?19:3, transition:"0.2s" }}/></div>
            <div onClick={async()=>{ if(confirm("Удалить позицию?")){ await apiPost("/api/delete-menu-item",{id:m.id}); setMenu(menu.filter(x=>x.id!==m.id)); fl("Удалено"); } }}
              style={{ cursor:"pointer", color:C.red, fontSize:18, flexShrink:0, padding:"0 4px" }}>×</div>
          </div>))}
        </div>}

        {tab==="bot" && <div style={card}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Промпт бота</div>
          <textarea defaultValue={c.config?.prompt||""} rows={16} id="prompt-area" style={{ ...input, resize:"vertical", lineHeight:1.6, fontFamily:"inherit" }}/>
          <button style={{ ...btn(), marginTop:10 }} onClick={async()=>{ const v=document.getElementById("prompt-area").value; await apiPost("/api/update-prompt",{client_id:c.id,prompt:v}); fl("Промпт сохранён! Бот уже использует новый."); }}>💾 Сохранить промпт</button>
        </div>}

        {tab==="channel" && <div style={{ display:"grid", gap:16 }}>
          <div style={card}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Адрес сервера</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>Если адрес сервера сменился — впиши новый и переподключи бота одной кнопкой.</div>
            <input id="base-url" defaultValue={API} style={{ ...input, marginBottom:10 }} placeholder="https://...up.railway.app"/>
            <button style={btn()} onClick={async()=>{
              const base=document.getElementById("base-url").value.trim();
              fl("Переподключаю...");
              try{ const r=await apiPost("/api/reconnect-webhook",{client_id:c.id,base_url:base});
                const ok=r.results?.every(x=>x.ok); fl(ok?"✅ Бот переподключён!":"⚠️ Проверьте токен"); }
              catch{ fl("Ошибка переподключения"); }
            }}>🔗 Переподключить webhook</button>
          </div>
          <div style={card}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Сменить токен бота</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>После revoke в BotFather вставь новый токен — он сохранится и webhook поставится автоматически.</div>
            <input id="new-token" type="password" style={{ ...input, marginBottom:10 }} placeholder="Новый токен от BotFather"/>
            <button style={btn()} onClick={async()=>{
              const tok=document.getElementById("new-token").value.trim();
              const base=document.getElementById("base-url")?.value.trim()||API;
              if(!tok){ fl("Введите токен"); return; }
              fl("Сохраняю...");
              try{ const r=await apiPost("/api/update-token",{client_id:c.id,token:tok,base_url:base});
                fl(r.webhook?"✅ Токен обновлён и бот подключён!":"Токен сохранён, webhook не поставился"); }
              catch{ fl("Ошибка"); }
            }}>💾 Сохранить токен и подключить</button>
          </div>
        </div>}
      </div>);})()}

    {/* СТАТИСТИКА */}
    {page === "stats" && <div>
      <h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px" }}>Статистика</h1>
      <p style={{ color:C.muted, fontSize:14, margin:"0 0 20px" }}>Финансы по клиентам</p>
      <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[{l:"Доход",v:`$${totalIncome}`,c:C.accent},{l:"Расход AI",v:`$${totalCost.toFixed(2)}`,c:C.red},{l:"Прибыль",v:`$${(totalIncome-totalCost).toFixed(2)}`,c:C.green}].map(s=>(
          <div key={s.l} style={{ ...card, borderTop:`3px solid ${s.c}` }}><div style={{ fontSize:11, color:s.c, fontWeight:600, textTransform:"uppercase", marginBottom:6 }}>{s.l}</div><div style={{ fontSize:28, fontWeight:800 }}>{s.v}</div></div>))}
      </div>
      <div style={card}>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>По клиентам</div>
        <div style={{ overflowX:"auto" }}><div style={{ minWidth:480 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr", gap:8, paddingBottom:10, borderBottom:`1px solid ${C.border}`, fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase" }}>
            <div>Клиент</div><div>Заказов</div><div>Расход AI</div><div>Прибыль</div></div>
          {clients.map(c=>{ const cost=tokenCost(c); const profit=(c.plan_price||0)-cost; return(
            <div key={c.id} style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr", gap:8, padding:"12px 0", borderBottom:`1px solid ${C.border}`, fontSize:13, alignItems:"center" }}>
              <div style={{ fontWeight:600 }}>{c.emoji} {c.name}</div><div>{c.orders_count}</div>
              <div style={{ color:C.red }}>${cost.toFixed(2)}</div><div style={{ color:C.green, fontWeight:700 }}>${profit.toFixed(2)}</div>
            </div>);})}
        </div></div>
      </div>
    </div>}
  </>);

  // МОБИЛЬНАЯ
  if (mob) return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',sans-serif", paddingBottom:70 }}>
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:C.card, zIndex:100 }}>
        <div style={{ fontSize:17, fontWeight:800 }}>Bot<span style={{ color:C.accent }}>SaaS</span></div>
        <div onClick={()=>{ localStorage.removeItem("adminPwd"); localStorage.removeItem("role"); setLogged(false); }} style={{ color:C.muted, fontSize:13 }}>Выйти</div></div>
      <div style={{ padding:16 }}>{content}</div>
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.card, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around", padding:"6px 0", zIndex:100 }}>
        {NAV.map(n=>(<div key={n.id} onClick={()=>{ setPage(n.id); setSelected(null); }} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer", color:page===n.id?C.accent:C.muted, position:"relative", padding:"4px 10px" }}>
          <span style={{ fontSize:17 }}>{n.icon}</span><span style={{ fontSize:9 }}>{n.label}</span>
          {n.badge>0&&<span style={{ position:"absolute", top:0, right:2, background:C.red, color:"#fff", fontSize:8, fontWeight:700, borderRadius:10, padding:"1px 4px" }}>{n.badge}</span>}</div>))}
      </div>
    </div>);

  // ДЕСКТОП
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',sans-serif", display:"flex" }}>
      <div style={{ width:210, background:C.card, borderRight:`1px solid ${C.border}`, position:"fixed", top:0, left:0, height:"100vh", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px", borderBottom:`1px solid ${C.border}` }}><div style={{ fontSize:17, fontWeight:800 }}>Bot<span style={{ color:C.accent }}>SaaS</span></div></div>
        <div style={{ flex:1, paddingTop:8 }}>{NAV.map(n=>(<div key={n.id} onClick={()=>{ setPage(n.id); setSelected(null); }} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 20px", cursor:"pointer", color:page===n.id?"#fff":C.muted, background:page===n.id?"#1f2937":"transparent", borderLeft:`3px solid ${page===n.id?C.accent:"transparent"}`, fontSize:14, fontWeight:page===n.id?600:400 }}>
          <span>{n.icon}</span>{n.label}{n.badge>0&&<span style={{ marginLeft:"auto", background:C.red, color:"#fff", fontSize:10, fontWeight:700, borderRadius:10, padding:"1px 7px" }}>{n.badge}</span>}</div>))}</div>
        <div onClick={()=>{ localStorage.removeItem("adminPwd"); localStorage.removeItem("role"); setLogged(false); }} style={{ padding:"14px 20px", borderTop:`1px solid ${C.border}`, color:C.muted, fontSize:13, cursor:"pointer" }}>← Выйти</div>
      </div>
      <div style={{ marginLeft:210, flex:1, padding:28 }}>{content}</div>
    </div>);
}
