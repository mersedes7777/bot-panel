import { useState, useEffect } from "react";

const API = "https://web-production-ca50a.up.railway.app";

// ── Дизайн-токены ──
const T = {
  bg: "#0B0D12", surface: "#13161D", surface2: "#1A1E27", line: "#252A35",
  text: "#F5F7FA", dim: "#8B92A0", faint: "#5A616E",
  brand: "#6D5EF6", brandSoft: "#6D5EF61A", brand2: "#9D7BFF",
  green: "#2BD980", red: "#FF5C5C", amber: "#FFB020", cyan: "#3DD6E8",
};

const STATUS = {
  new:{l:"Новый",c:"#5B8DEF"}, accepted:{l:"Принят",c:"#9D7BFF"}, cooking:{l:"Готовится",c:"#FFB020"},
  delivering:{l:"В пути",c:"#3DD6E8"}, done:{l:"Выполнен",c:"#2BD980"}, rejected:{l:"Отклонён",c:"#FF5C5C"},
};
const TOKEN_PRICE = { deepseek:0.14, "claude-haiku":1.0, "claude-sonnet":3.0 };

const FONT = "'Inter','SF Pro Display',-apple-system,sans-serif";
const INP = {background:T.bg,border:`1px solid ${T.line}`,borderRadius:11,padding:"12px 14px",color:T.text,fontSize:16,outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color .2s",fontFamily:FONT};

// Стабильные компоненты вне App — не пересоздаются при ререндере (фокус не слетает)
function Field({style={},...p}) {
  return <input {...p} style={{...INP,...style}}
    onFocus={e=>e.target.style.borderColor=T.brand}
    onBlur={e=>e.target.style.borderColor=T.line}/>;
}
function Btn({children,onClick,kind="primary",size="md",style={},...p}) {
  const sizes={sm:{padding:"7px 13px",fontSize:12.5},md:{padding:"10px 18px",fontSize:13.5},lg:{padding:"13px 22px",fontSize:15}};
  const kinds={
    primary:{background:`linear-gradient(135deg,${T.brand},${T.brand2})`,color:"#fff",boxShadow:`0 4px 16px ${T.brand}40`},
    ghost:{background:T.surface2,color:T.text,border:`1px solid ${T.line}`},
    danger:{background:"#FF5C5C18",color:T.red,border:"1px solid #FF5C5C30"},
    subtle:{background:"transparent",color:T.dim},
  };
  return <button onClick={onClick} style={{borderRadius:11,border:"none",cursor:"pointer",fontWeight:650,letterSpacing:.1,transition:"transform .15s",...sizes[size],...kinds[kind],...style}} {...p}>{children}</button>;
}
function Card({children,style={},...p}) {
  return <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:18,padding:18,...style}} {...p}>{children}</div>;
}

export default function App() {
  const [pwd, setPwd] = useState(localStorage.getItem("adminPwd") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [logged, setLogged] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState("overview");
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("info");
  const [toast, setToast] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState("");
  const [mob, setMob] = useState(false);

  useEffect(() => { const f=()=>setMob(window.innerWidth<860); f(); addEventListener("resize",f); return()=>removeEventListener("resize",f); }, []);

  const notify = (m) => { setToast(m); setTimeout(()=>setToast(""), 2600); };

  // ── API ──
  const apiGet = async (p) => { const r = await fetch(API+p,{headers:{"X-Admin-Password":pwd}}); if(!r.ok) throw 0; return r.json(); };
  const apiPost = async (p,b) => { const r = await fetch(API+p,{method:"POST",headers:{"Content-Type":"application/json","X-Admin-Password":pwd},body:JSON.stringify(b)}); if(!r.ok) throw 0; return r.json(); };

  const doLogin = async () => {
    setLoginErr(""); setBusy(true);
    try {
      const r = await fetch(API+"/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({login:loginInput,password:passInput})});
      if (r.ok) {
        const d = await r.json();
        const tok = loginInput ? `${loginInput}:${passInput}` : passInput;
        setPwd(tok); setRole(d.role||"admin");
        localStorage.setItem("adminPwd",tok); localStorage.setItem("role",d.role||"admin");
        setLogged(true);
      } else setLoginErr("Неверный логин или пароль");
    } catch { setLoginErr("Сервер недоступен"); }
    setBusy(false);
  };

  useEffect(() => { if(pwd && !logged) fetch(API+"/api/clients",{headers:{"X-Admin-Password":pwd}}).then(r=>{if(r.ok)setLogged(true);}); }, []);

  const loadData = async () => {
    setLoading(true);
    try { const [c,o]=await Promise.all([apiGet("/api/clients"),apiGet("/api/orders")]); setClients(c.clients||[]); setOrders(o.orders||[]); }
    catch { notify("Не удалось загрузить данные"); }
    setLoading(false);
  };
  useEffect(() => { if(logged) loadData(); }, [logged]);
  const loadMenu = async (id) => { try{ const r=await apiGet("/api/menu/"+id); setMenu(r.menu||[]); }catch{ setMenu([]); } };

  const tokenCost = (c) => ((c.tokens||0)/1e6*(TOKEN_PRICE[c.config?.ai_model]||0.14));
  const income = clients.filter(c=>c.status==="active").reduce((s,c)=>s+(c.plan_price||0),0);
  const cost = clients.reduce((s,c)=>s+tokenCost(c),0);
  const newOrders = orders.filter(o=>o.status==="new").length;
  const isAdmin = role==="admin";

  // Примитивы Btn/Card/Field вынесены наружу модуля (фокус не слетает)
  const inp = INP;
  const fontStack = FONT;

  // ── ЛОГИН ──
  if (!logged) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:fontStack,padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${T.brand}22,transparent 70%)`,top:-200,right:-150,filter:"blur(40px)"}}/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${T.cyan}14,transparent 70%)`,bottom:-180,left:-120,filter:"blur(40px)"}}/>
      <Card style={{width:"100%",maxWidth:380,padding:36,position:"relative",zIndex:1,boxShadow:"0 30px 80px rgba(0,0,0,.5)"}}>
        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:6}}>
          <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#9D4EDD,#5B8DEF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 6px 18px #6D5EF655"}}>💬</div>
          <div style={{fontSize:21,fontWeight:800,letterSpacing:-.5}}>ChatAIbot</div>
        </div>
        <p style={{color:T.dim,fontSize:13.5,margin:"0 0 28px",lineHeight:1.5}}>Панель управления ботами</p>
        <div style={{marginBottom:11}}><input placeholder="Логин" value={loginInput} onChange={e=>setLoginInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={inp}/></div>
        <div style={{marginBottom:18}}><input type="password" placeholder="Пароль" value={passInput} onChange={e=>setPassInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={inp}/></div>
        {loginErr && <div style={{color:T.red,fontSize:13,marginBottom:16,padding:"9px 12px",background:"#FF5C5C12",borderRadius:9,border:"1px solid #FF5C5C25"}}>{loginErr}</div>}
        <Btn onClick={doLogin} size="lg" style={{width:"100%",opacity:busy?.7:1}}>{busy?"Входим…":"Войти"}</Btn>
      </Card>
    </div>
  );

  const NAV = [
    {id:"overview",ic:"◫",l:"Обзор"},
    {id:"orders",ic:"☰",l:"Заказы",badge:newOrders},
    {id:"clients",ic:"◆",l:isAdmin?"Клиенты":"Заведение"},
    {id:"stats",ic:"◷",l:"Статистика"},
  ];

  const Stat = ({label,value,accent,sub}) => (
    <Card style={{position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${accent},transparent)`}}/>
      <div style={{fontSize:11.5,color:T.dim,fontWeight:600,letterSpacing:.4,textTransform:"uppercase",marginBottom:9}}>{label}</div>
      <div style={{fontSize:mob?26:32,fontWeight:800,letterSpacing:-1,lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:12,color:T.faint,marginTop:6}}>{sub}</div>}
    </Card>
  );

  const Pill = ({s}) => { const st=STATUS[s]||STATUS.new; return <span style={{fontSize:11.5,fontWeight:650,padding:"4px 11px",borderRadius:20,color:st.c,background:st.c+"1A",border:`1px solid ${st.c}30`,whiteSpace:"nowrap"}}>{st.l}</span>; };

  // ── КОНТЕНТ ──
  const Body = (
    <>
      {toast && <div style={{position:"fixed",top:22,right:mob?16:28,left:mob?16:"auto",zIndex:400,background:T.surface2,color:T.text,padding:"13px 20px",borderRadius:13,fontSize:13.5,fontWeight:600,border:`1px solid ${T.line}`,boxShadow:"0 14px 40px rgba(0,0,0,.45)",display:"flex",alignItems:"center",gap:9,animation:"sl .3s ease"}}>
        <span style={{color:T.green}}>●</span>{toast}</div>}
      {loading && <div style={{position:"fixed",top:22,left:"50%",transform:"translateX(-50%)",zIndex:400,background:T.brand,color:"#fff",padding:"8px 18px",borderRadius:20,fontSize:12.5,fontWeight:600}}>Загрузка…</div>}

      {/* ОБЗОР */}
      {page==="overview" && <div>
        <Header title="Обзор" sub={isAdmin?"Сводка по всем заведениям":"Сводка по вашему заведению"}
          right={<div style={{display:"flex",gap:9}}>
            <Btn kind="ghost" size="md" onClick={loadData}>Обновить</Btn>
            {isAdmin && <Btn size="md" onClick={async()=>{ notify("Переподключаю ботов…"); try{ const r=await apiPost("/api/reconnect-webhook",{base_url:API}); notify(`Подключено: ${r.results?.filter(x=>x.ok).length||0}/${r.results?.length||0}`); }catch{ notify("Ошибка"); } }}>Переподключить ботов</Btn>}
          </div>}/>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:14,marginBottom:18}}>
          {isAdmin ? <>
            <Stat label="Доход / мес" value={`$${income}`} accent={T.brand}/>
            <Stat label="Расход AI" value={`$${cost.toFixed(2)}`} accent={T.red}/>
            <Stat label="Прибыль" value={`$${(income-cost).toFixed(2)}`} accent={T.green}/>
            <Stat label="Заведений" value={clients.length} accent={T.amber}/>
          </> : <>
            <Stat label="Заказов" value={clients.reduce((s,c)=>s+(c.orders_count||0),0)} accent={T.green}/>
            <Stat label="Диалогов" value={clients.reduce((s,c)=>s+(c.dialogs_count||0),0)} accent={T.brand}/>
            <Stat label="Новых" value={newOrders} accent={T.amber}/>
            <Stat label="В работе" value={orders.filter(o=>["cooking","delivering","accepted"].includes(o.status)).length} accent={T.cyan}/>
          </>}
        </div>
        <Card>
          <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>Последние заказы</div>
          <div style={{fontSize:12.5,color:T.dim,marginBottom:16}}>Свежие обращения клиентов</div>
          {orders.length===0 && <Empty text="Заказов пока нет"/>}
          {orders.slice(0,6).map(o=>(
            <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:`1px solid ${T.line}`,gap:10}}>
              <div style={{minWidth:0,display:"flex",alignItems:"center",gap:11}}>
                <div style={{width:34,height:34,borderRadius:9,background:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:T.dim,flexShrink:0}}>№{o.order_number}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{((o.items_text||"").split("\n").filter(l=>l.trim()&&!/^(спасибо|ваш заказ|ваша заявка|📋)/i.test(l.trim()))[0])||(o.items_text||"").split("\n")[0]||"Заказ"}</div>
                  {isAdmin && <div style={{fontSize:11.5,color:T.faint}}>{o.clients?.name}</div>}
                </div>
              </div>
              <Pill s={o.status}/>
            </div>
          ))}
        </Card>
      </div>}

      {/* ЗАКАЗЫ */}
      {page==="orders" && <div>
        <Header title="Заказы" sub="Управление статусами"/>
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {["all",...Object.keys(STATUS)].map(f=>(
            <button key={f} onClick={()=>setOrderFilter(f)} style={{padding:"8px 15px",borderRadius:20,border:`1px solid ${orderFilter===f?T.brand:T.line}`,background:orderFilter===f?T.brandSoft:"transparent",color:orderFilter===f?T.brand2:T.dim,fontSize:12.5,fontWeight:600,cursor:"pointer",transition:"all .15s"}}>{f==="all"?"Все":STATUS[f].l}</button>))}
        </div>
        <div style={{display:"grid",gap:13}}>
          {orders.filter(o=>orderFilter==="all"||o.status===orderFilter).map(o=>{ const st=STATUS[o.status]||STATUS.new; return(
            <Card key={o.id} style={{borderLeft:`3px solid ${st.c}`,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:11,gap:10}}>
                <div><div style={{fontSize:16,fontWeight:750,letterSpacing:-.3}}>Заказ №{o.order_number}</div>
                  {isAdmin && <div style={{fontSize:12,color:T.faint,marginTop:2}}>{o.clients?.name}</div>}</div>
                <Pill s={o.status}/>
              </div>
              <div style={{fontSize:13.5,color:"#C8CDD6",whiteSpace:"pre-wrap",lineHeight:1.65,background:T.bg,borderRadius:11,padding:13,border:`1px solid ${T.line}`}}>{o.items_text}</div>
              <div style={{display:"flex",gap:7,marginTop:13,flexWrap:"wrap"}}>
                {Object.keys(STATUS).map(s=>(<button key={s} onClick={async()=>{ await apiPost("/api/update-order-status",{order_id:o.id,status:s}); setOrders(orders.map(x=>x.id===o.id?{...x,status:s}:x)); notify(`Заказ №${o.order_number} — ${STATUS[s].l}`); }}
                  style={{padding:"6px 12px",borderRadius:9,border:`1px solid ${o.status===s?STATUS[s].c:T.line}`,background:o.status===s?STATUS[s].c+"1A":"transparent",color:o.status===s?STATUS[s].c:T.dim,fontSize:11.5,fontWeight:600,cursor:"pointer"}}>{STATUS[s].l}</button>))}
              </div>
            </Card>);})}
          {orders.filter(o=>orderFilter==="all"||o.status===orderFilter).length===0 && <Empty text="Нет заказов в этой категории"/>}
        </div>
      </div>}

      {/* КЛИЕНТЫ */}
      {page==="clients" && !selected && <div>
        <Header title={isAdmin?"Заведения":"Ваше заведение"} sub={isAdmin?"Подключённые бизнесы":"Управление и меню"}/>
        <div style={{display:"grid",gap:13}}>
          {clients.map(c=>(
            <Card key={c.id} hover style={{cursor:"pointer"}} onClick={()=>{setSelected(c);setTab("info");loadMenu(c.id);}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                <div style={{display:"flex",gap:14,alignItems:"center",minWidth:0}}>
                  <div style={{width:50,height:50,borderRadius:14,background:`linear-gradient(135deg,${T.surface2},${T.bg})`,border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{c.emoji}</div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:750,letterSpacing:-.3}}>{c.name}</div>
                    <div style={{fontSize:12.5,color:T.dim,marginTop:2}}>{c.city} · {c.plan} · {c.config?.ai_model||"—"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:22,flexShrink:0}}>
                  <Metric v={c.dialogs_count} l="диалогов"/>
                  <Metric v={c.orders_count} l="заказов" accent={T.green}/>
                  <div style={{color:T.faint,fontSize:18,alignSelf:"center"}}>›</div>
                </div>
              </div>
            </Card>))}
        </div>
      </div>}

      {/* ДЕТАЛИ */}
      {page==="clients" && selected && (()=>{ const c=selected;
        const TABS=[{id:"info",l:"О заведении"},{id:"menu",l:"Меню"},...(isAdmin?[{id:"bot",l:"Промпт"},{id:"channel",l:"Подключение"}]:[])];
        return(<div>
          <Btn kind="subtle" onClick={()=>setSelected(null)} style={{marginBottom:14,paddingLeft:0}}>‹ Назад</Btn>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
            <div style={{width:54,height:54,borderRadius:15,background:`linear-gradient(135deg,${T.surface2},${T.bg})`,border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{c.emoji}</div>
            <div><div style={{fontSize:22,fontWeight:800,letterSpacing:-.5}}>{c.name}</div><div style={{fontSize:13,color:T.dim}}>{c.city}</div></div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:22,borderBottom:`1px solid ${T.line}`,overflowX:"auto"}}>
            {TABS.map(t=>(<div key={t.id} onClick={()=>setTab(t.id)} style={{padding:"11px 16px",cursor:"pointer",fontSize:13.5,fontWeight:tab===t.id?700:500,color:tab===t.id?T.text:T.dim,borderBottom:`2px solid ${tab===t.id?T.brand:"transparent"}`,marginBottom:-1,whiteSpace:"nowrap",transition:"color .15s"}}>{t.l}</div>))}
          </div>

          {tab==="info" && <Card>
            {[["Название",c.name],["Город",c.city],["Тариф",`${c.plan} · $${c.plan_price}/мес`],["Статус",c.status==="active"?"Активен":c.status],["AI-модель",c.config?.ai_model||"—"]].map(([l,v],i,a)=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<a.length-1?`1px solid ${T.line}`:"none"}}>
                <span style={{color:T.dim,fontSize:13.5}}>{l}</span><span style={{fontWeight:650,fontSize:14}}>{v}</span></div>))}
          </Card>}

          {tab==="menu" && <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div><div style={{fontSize:15,fontWeight:700}}>Меню</div><div style={{fontSize:12.5,color:T.dim}}>{menu.length} позиций · бот обновляется сразу</div></div>
              <Btn size="sm" onClick={()=>setAddingItem(true)}>+ Добавить</Btn>
            </div>
            {addingItem && <div style={{background:T.bg,borderRadius:13,padding:16,marginBottom:16,border:`1px solid ${T.brand}40`}}>
              <Field id="ni-name" placeholder="Название позиции" style={{marginBottom:10}}/>
              <div style={{display:"flex",gap:10,marginBottom:12}}>
                <Field id="ni-price" placeholder="Цена, ₽" type="number"/>
                <Field id="ni-cat" placeholder="Категория"/>
              </div>
              <div style={{display:"flex",gap:9}}>
                <Btn size="sm" onClick={async()=>{ const name=document.getElementById("ni-name").value.trim(); const price=+document.getElementById("ni-price").value||0; const cat=document.getElementById("ni-cat").value.trim()||"Прочее"; if(!name){notify("Введите название");return;} await apiPost("/api/add-menu-item",{client_id:c.id,name,price,category:cat}); notify("Позиция добавлена"); setAddingItem(false); loadMenu(c.id); }}>Сохранить</Btn>
                <Btn size="sm" kind="ghost" onClick={()=>setAddingItem(false)}>Отмена</Btn>
              </div>
            </div>}
            {menu.length===0 && !addingItem && <Empty text="Меню пустое — добавьте первую позицию"/>}
            {Object.entries(menu.reduce((acc,m)=>{ const k=m.category||"Прочее"; (acc[k]=acc[k]||[]).push(m); return acc; },{})).map(([cat,items])=>(
              <div key={cat} style={{marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:700,color:T.brand2,textTransform:"uppercase",letterSpacing:.5,margin:"6px 0 4px"}}>{cat} <span style={{color:T.faint}}>· {items.length}</span></div>
                {items.map(m=>(<div key={m.id} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 0",borderBottom:`1px solid ${T.line}`,opacity:m.available?1:0.45}}>
                  <label style={{cursor:"pointer",flexShrink:0}} title="Загрузить фото">
                    {m.photo_url
                      ? <img src={m.photo_url} alt="" style={{width:44,height:44,borderRadius:10,objectFit:"cover",border:`1px solid ${T.line}`}}/>
                      : <div style={{width:44,height:44,borderRadius:10,background:T.bg,border:`1px dashed ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.faint,fontSize:18}}>📷</div>}
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{
                      const file=e.target.files[0]; if(!file) return;
                      if(file.size>5*1024*1024){ notify("Фото слишком большое (макс 5МБ)"); return; }
                      notify("Загружаю фото…");
                      const reader=new FileReader();
                      reader.onload=async()=>{
                        const localPreview=reader.result;
                        // сразу показываем выбранное фото (мгновенно)
                        setMenu(prev=>prev.map(x=>x.id===m.id?{...x,photo_url:localPreview}:x));
                        try{ const r=await apiPost("/api/upload-photo",{id:m.id,photo:localPreview});
                          const finalUrl=(r&&r.url)?r.url+"?t="+Date.now():localPreview;
                          setMenu(prev=>prev.map(x=>x.id===m.id?{...x,photo_url:finalUrl}:x)); notify("Фото загружено ✓"); }
                        catch{ notify("Ошибка загрузки"); }
                      };
                      reader.readAsDataURL(file);
                    }}/>
                  </label>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600}}>{m.name}</div>{!m.available&&<div style={{fontSize:11.5,color:T.amber}}>в стоп-листе</div>}</div>
                  <Field defaultValue={m.price} style={{width:70,padding:"7px 9px",textAlign:"right"}} onBlur={async(e)=>{ await apiPost("/api/update-menu-item",{id:m.id,price:+e.target.value,available:m.available}); notify("Цена обновлена"); }}/>
                  <Toggle on={m.available} onClick={async()=>{ const nv=!m.available; await apiPost("/api/update-menu-item",{id:m.id,price:m.price,available:nv}); setMenu(menu.map(x=>x.id===m.id?{...x,available:nv}:x)); }}/>
                  <div onClick={async()=>{ if(confirm("Удалить позицию?")){ await apiPost("/api/delete-menu-item",{id:m.id}); setMenu(menu.filter(x=>x.id!==m.id)); notify("Удалено"); } }} style={{cursor:"pointer",color:T.faint,fontSize:20,flexShrink:0,padding:"0 2px"}} onMouseEnter={e=>e.currentTarget.style.color=T.red} onMouseLeave={e=>e.currentTarget.style.color=T.faint}>×</div>
                </div>))}
              </div>
            ))}
          </Card>}

          {tab==="bot" && <div style={{display:"grid",gap:14}}>
            <Card>
            <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>Промпт ассистента</div>
            <div style={{fontSize:12.5,color:T.dim,marginBottom:14}}>Характер и логика бота. Сохранение применяется мгновенно.</div>
            <textarea defaultValue={c.config?.prompt||""} rows={15} id="prompt-area" style={{...inp,resize:"vertical",lineHeight:1.7,fontFamily:fontStack}} onFocus={e=>e.target.style.borderColor=T.brand} onBlur={e=>e.target.style.borderColor=T.line}/>
            <Btn onClick={async()=>{ await apiPost("/api/update-prompt",{client_id:c.id,prompt:document.getElementById("prompt-area").value}); notify("Промпт сохранён"); }} style={{marginTop:12}}>Сохранить промпт</Btn>
            </Card>
            <Card>
              <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>🧠 Анализ диалогов (AI)</div>
              <div style={{fontSize:12.5,color:T.dim,marginBottom:14}}>AI изучит реальные переписки бота с клиентами и подскажет, что улучшить в промпте.</div>
              <Btn kind="ghost" onClick={async()=>{
                setAnalyzing(true); setReport("");
                try{ const r=await apiPost("/api/analyze-dialogs",{client_id:c.id}); setReport(r.report); }
                catch{ notify("Не удалось проанализировать"); }
                setAnalyzing(false);
              }} style={{opacity:analyzing?.6:1}}>{analyzing?"Анализирую…":"Запустить анализ"}</Btn>
              {report && <div style={{marginTop:16}}>
                <div style={{padding:16,background:T.bg,borderRadius:12,border:`1px solid ${T.line}`,fontSize:13.5,lineHeight:1.6,whiteSpace:"pre-wrap",color:"#C8CDD6"}}>{report}</div>
                <Btn kind="ghost" size="sm" onClick={()=>{ navigator.clipboard.writeText(report); notify("Скопировано ✓"); }} style={{marginTop:10}}>📋 Скопировать</Btn>
              </div>}
            </Card>
          </div>}

          {tab==="channel" && <div style={{display:"grid",gap:14}}>
            <Card>
              <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>Адрес сервера</div>
              <div style={{fontSize:12.5,color:T.dim,marginBottom:13}}>Сменился адрес — впишите и переподключите бота.</div>
              <Field id="base-url" defaultValue={API} style={{marginBottom:12}}/>
              <Btn onClick={async()=>{ const base=document.getElementById("base-url").value.trim(); notify("Переподключаю…"); try{ const r=await apiPost("/api/reconnect-webhook",{client_id:c.id,base_url:base}); notify(r.results?.every(x=>x.ok)?"Бот переподключён":"Проверьте токен"); }catch{ notify("Ошибка"); } }}>Переподключить webhook</Btn>
            </Card>
            <Card>
              <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>Сменить токен бота</div>
              <div style={{fontSize:12.5,color:T.dim,marginBottom:13}}>После revoke в BotFather — вставьте новый, webhook поставится сам.</div>
              <Field id="new-token" type="password" placeholder="Новый токен" style={{marginBottom:12}}/>
              <Btn onClick={async()=>{ const tok=document.getElementById("new-token").value.trim(); const base=document.getElementById("base-url")?.value.trim()||API; if(!tok){notify("Введите токен");return;} notify("Сохраняю…"); try{ const r=await apiPost("/api/update-token",{client_id:c.id,token:tok,base_url:base}); notify(r.webhook?"Токен обновлён, бот подключён":"Токен сохранён"); }catch{ notify("Ошибка"); } }}>Сохранить и подключить</Btn>
            </Card>
          </div>}
        </div>);})()}

      {/* СТАТИСТИКА */}
      {page==="stats" && <div>
        <Header title="Статистика" sub={isAdmin?"Финансы и нагрузка":"Активность вашего заведения"}/>
        {isAdmin ? <>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:14,marginBottom:18}}>
            <Stat label="Доход" value={`$${income}`} accent={T.brand}/>
            <Stat label="Расход AI" value={`$${cost.toFixed(2)}`} accent={T.red}/>
            <Stat label="Прибыль" value={`$${(income-cost).toFixed(2)}`} accent={T.green}/>
          </div>
          <Card>
            <div style={{fontSize:15,fontWeight:700,marginBottom:18}}>По заведениям</div>
            <div style={{overflowX:"auto"}}><div style={{minWidth:460}}>
              <Row head cells={["Заведение","Заказов","Расход","Прибыль"]}/>
              {clients.map(c=>{ const ct=tokenCost(c); return <Row key={c.id} cells={[`${c.emoji} ${c.name}`,c.orders_count,`$${ct.toFixed(2)}`,`$${((c.plan_price||0)-ct).toFixed(2)}`]} colors={[T.text,T.dim,T.red,T.green]}/>; })}
            </div></div>
          </Card>
        </> : <>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:14,marginBottom:18}}>
            <Stat label="Заказов всего" value={clients.reduce((s,c)=>s+(c.orders_count||0),0)} accent={T.green}/>
            <Stat label="Диалогов" value={clients.reduce((s,c)=>s+(c.dialogs_count||0),0)} accent={T.brand}/>
            <Stat label="Новых" value={newOrders} accent={T.amber}/>
          </div>
          <Card>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>Заказы по статусам</div>
            {Object.keys(STATUS).map(s=>{ const cnt=orders.filter(o=>o.status===s).length; const max=Math.max(...Object.keys(STATUS).map(x=>orders.filter(o=>o.status===x).length),1); return(
              <div key={s} style={{marginBottom:13}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span style={{color:STATUS[s].c,fontWeight:600}}>{STATUS[s].l}</span><span style={{fontWeight:700}}>{cnt}</span></div>
                <div style={{height:7,background:T.bg,borderRadius:4,overflow:"hidden"}}><div style={{height:7,width:`${cnt/max*100}%`,background:STATUS[s].c,borderRadius:4,transition:"width .5s"}}/></div>
              </div>);})}
          </Card>
        </>}
      </div>}
    </>
  );

  // ── вспомогательные компоненты ──
  function Header({title,sub,right}) { return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,gap:12,flexWrap:"wrap"}}>
      <div><h1 style={{fontSize:mob?24:28,fontWeight:800,margin:"0 0 4px",letterSpacing:-.8}}>{title}</h1><p style={{color:T.dim,fontSize:13.5,margin:0}}>{sub}</p></div>
      {right}
    </div>); }
  function Metric({v,l,accent}) { return <div style={{textAlign:"right"}}><div style={{fontWeight:750,fontSize:16,color:accent||T.text}}>{v}</div><div style={{fontSize:11,color:T.faint}}>{l}</div></div>; }
  function Empty({text}) { return <div style={{color:T.faint,fontSize:13.5,textAlign:"center",padding:"36px 0"}}>{text}</div>; }
  function Toggle({on,onClick}) { return <div onClick={onClick} style={{width:42,height:24,borderRadius:13,background:on?`linear-gradient(135deg,${T.green},#1FB868)`:T.line,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}><div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?21:3,transition:"left .2s",boxShadow:"0 2px 5px rgba(0,0,0,.3)"}}/></div>; }
  function Row({head,cells,colors=[]}) { return (
    <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr 1fr",gap:8,padding:head?"0 0 11px":"13px 0",borderBottom:`1px solid ${T.line}`,fontSize:head?11:13.5,color:head?T.faint:T.text,fontWeight:head?600:500,textTransform:head?"uppercase":"none",letterSpacing:head?.4:0,alignItems:"center"}}>
      {cells.map((x,i)=><div key={i} style={{color:colors[i]||"inherit",fontWeight:i===0?650:(i===3?700:500)}}>{x}</div>)}
    </div>); }

  const logout = () => { localStorage.removeItem("adminPwd"); localStorage.removeItem("role"); setLogged(false); setPwd(""); };

  // ── МОБИЛЬНЫЙ ──
  if (mob) return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:fontStack,paddingBottom:78}}>
      <style>{`@keyframes sl{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}`}</style>
      <div style={{padding:"16px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:T.bg+"F0",backdropFilter:"blur(12px)",zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,borderRadius:9,background:`linear-gradient(135deg,${T.brand},${T.brand2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>◆</div><span style={{fontSize:17,fontWeight:800,letterSpacing:-.4}}>ChatAIbot</span></div>
        <span onClick={logout} style={{color:T.dim,fontSize:13,cursor:"pointer"}}>Выйти</span>
      </div>
      <div style={{padding:18}}>{Body}</div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.surface+"F5",backdropFilter:"blur(14px)",borderTop:`1px solid ${T.line}`,display:"flex",justifyContent:"space-around",padding:"9px 0 11px",zIndex:100}}>
        {NAV.map(n=>(<div key={n.id} onClick={()=>{setPage(n.id);setSelected(null);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",color:page===n.id?T.brand2:T.faint,position:"relative",padding:"3px 14px",transition:"color .15s"}}>
          <span style={{fontSize:19}}>{n.ic}</span><span style={{fontSize:10,fontWeight:600}}>{n.l}</span>
          {n.badge>0&&<span style={{position:"absolute",top:-1,right:6,background:T.red,color:"#fff",fontSize:9,fontWeight:700,borderRadius:10,padding:"1px 5px"}}>{n.badge}</span>}</div>))}
      </div>
    </div>);

  // ── ДЕСКТОП ──
  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:fontStack,display:"flex"}}>
      <style>{`@keyframes sl{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}} *::-webkit-scrollbar{width:8px;height:8px}*::-webkit-scrollbar-thumb{background:${T.line};border-radius:4px}`}</style>
      <div style={{width:236,background:T.surface,borderRight:`1px solid ${T.line}`,position:"fixed",top:0,left:0,height:"100vh",display:"flex",flexDirection:"column",padding:"0 0 18px"}}>
        <div style={{padding:"24px 22px",display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${T.brand},${T.brand2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 6px 18px ${T.brand}45`}}>◆</div>
          <span style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>ChatAIbot</span>
        </div>
        <div style={{flex:1,padding:"10px 14px"}}>
          {NAV.map(n=>(<div key={n.id} onClick={()=>{setPage(n.id);setSelected(null);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,marginBottom:3,cursor:"pointer",color:page===n.id?T.text:T.dim,background:page===n.id?T.brandSoft:"transparent",fontSize:14,fontWeight:page===n.id?650:500,transition:"all .15s",position:"relative"}}
            onMouseEnter={e=>{if(page!==n.id)e.currentTarget.style.background=T.surface2;}} onMouseLeave={e=>{if(page!==n.id)e.currentTarget.style.background="transparent";}}>
            <span style={{fontSize:17,color:page===n.id?T.brand2:T.faint}}>{n.ic}</span>{n.l}
            {n.badge>0&&<span style={{marginLeft:"auto",background:T.red,color:"#fff",fontSize:10.5,fontWeight:700,borderRadius:10,padding:"2px 8px"}}>{n.badge}</span>}</div>))}
        </div>
        <div style={{padding:"0 14px"}}>
          <div style={{padding:"12px 14px",borderRadius:12,background:T.surface2,marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${T.brand},${T.brand2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{isAdmin?"A":"К"}</div>
            <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:650}}>{isAdmin?"Администратор":"Заведение"}</div><div style={{fontSize:11,color:T.faint}}>{isAdmin?"полный доступ":"ваш кабинет"}</div></div>
          </div>
          <div onClick={logout} style={{padding:"11px 14px",borderRadius:11,color:T.dim,fontSize:13.5,cursor:"pointer",fontWeight:500,transition:"color .15s"}} onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.dim}>Выйти из панели</div>
        </div>
      </div>
      <div style={{marginLeft:236,flex:1,padding:"32px 38px",maxWidth:1200}}>{Body}</div>
    </div>);
}
