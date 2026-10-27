import React, { useEffect, useMemo, useState } from 'react';
import {
  Shirt, LayoutDashboard, Grid2X2, Sparkles, CalendarDays, Search, Plus,
  Heart, SlidersHorizontal, ChevronDown, ArrowUpRight, Menu, X, Trash2,
  Pencil, Check, LogOut, CircleHelp, Leaf, Sun, CloudSun, Moon, WandSparkles,
  Footprints, BriefcaseBusiness, GraduationCap, PartyPopper, RotateCcw
} from 'lucide-react';

const starter = [
  { id:'c1', name:'Linen button-down', category:'Tops', color:'Ivory', season:'Summer', occasion:'Casual', emoji:'👔', bg:'#e9e1d5', wears:8, favorite:true },
  { id:'c2', name:'Tailored wide-leg pants', category:'Bottoms', color:'Black', season:'All season', occasion:'Work', emoji:'👖', bg:'#d9d5cf', wears:12, favorite:false },
  { id:'c3', name:'Everyday white sneakers', category:'Shoes', color:'White', season:'All season', occasion:'Casual', emoji:'👟', bg:'#e7e7e2', wears:21, favorite:true },
  { id:'c4', name:'Soft knit cardigan', category:'Outerwear', color:'Oatmeal', season:'Winter', occasion:'Casual', emoji:'🧥', bg:'#d9c9b5', wears:5, favorite:false },
  { id:'c5', name:'Classic black tee', category:'Tops', color:'Black', season:'All season', occasion:'Casual', emoji:'👕', bg:'#d3d0cb', wears:16, favorite:false },
  { id:'c6', name:'Satin midi skirt', category:'Bottoms', color:'Sage', season:'Spring', occasion:'Date night', emoji:'👗', bg:'#d6ddd0', wears:3, favorite:true },
  { id:'c7', name:'Structured tote', category:'Accessories', color:'Tan', season:'All season', occasion:'Work', emoji:'👜', bg:'#e0d0bb', wears:11, favorite:false },
  { id:'c8', name:'Gold hoop earrings', category:'Accessories', color:'Gold', season:'All season', occasion:'Any', emoji:'✨', bg:'#e8dfc8', wears:18, favorite:false }
];
const initialOutfits = [
  { id:'o1', name:'Everyday ease', occasion:'Casual', pieces:['c1','c2','c3'], day:'Today', worn:false },
  { id:'o2', name:'Soft evening', occasion:'Date night', pieces:['c5','c6'], day:'Friday', worn:false },
];
const categoryEmoji = { Tops:'👚', Bottoms:'👖', Shoes:'👟', Outerwear:'🧥', Accessories:'👜', Dresses:'👗' };
const read = (key, fallback) => { try { const x=localStorage.getItem(key); return x ? JSON.parse(x) : fallback; } catch { return fallback; } };

function App() {
  const [items,setItems] = useState(()=>read('ww_items', starter));
  const [outfits,setOutfits] = useState(()=>read('ww_outfits', initialOutfits));
  const [active,setActive] = useState('Overview');
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('All items');
  const [sort,setSort] = useState('Recently added');
  const [onlyFav,setOnlyFav] = useState(false);
  const [modal,setModal] = useState('');
  const [editItem,setEditItem] = useState(null);
  const [toast,setToast] = useState('');
  const [mobileNav,setMobileNav] = useState(false);
  const [occasion,setOccasion] = useState('College');
  const [demo,setDemo] = useState(()=>read('ww_demo', false));
  const [form,setForm] = useState({name:'',category:'Tops',color:'Ivory',season:'All season',occasion:'Casual',emoji:'👚',bg:'#e9e1d5'});
  const [outfitForm,setOutfitForm] = useState({name:'',occasion:'Casual',pieces:[]});

  useEffect(()=>{ localStorage.setItem('ww_items',JSON.stringify(items)); },[items]);
  useEffect(()=>{ localStorage.setItem('ww_outfits',JSON.stringify(outfits)); },[outfits]);
  useEffect(()=>{ localStorage.setItem('ww_demo',JSON.stringify(demo)); },[demo]);
  useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(''),2800);return()=>clearTimeout(t);} },[toast]);

  const filtered = useMemo(()=>{
    let list=items.filter(i=>(category==='All items'||i.category===category) && (!onlyFav||i.favorite) &&
      (i.name+' '+i.category+' '+i.color+' '+i.occasion).toLowerCase().includes(query.toLowerCase()));
    if(sort==='Most worn') list.sort((a,b)=>b.wears-a.wears);
    if(sort==='Least worn') list.sort((a,b)=>a.wears-b.wears);
    if(sort==='Name A–Z') list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  },[items,category,onlyFav,query,sort]);

  const totalWears=items.reduce((n,i)=>n+i.wears,0);
  const categories=[...new Set(items.map(i=>i.category))];
  const recommendation = useMemo(()=>{
    const tops=items.filter(i=>i.category==='Tops');
    const bottoms=items.filter(i=>i.category==='Bottoms'||i.category==='Dresses');
    const shoes=items.filter(i=>i.category==='Shoes');
    let picks=[];
    if(bottoms.length) picks.push(bottoms[0]);
    if(tops.length) picks.push([...tops].sort((a,b)=>a.wears-b.wears)[0]);
    if(shoes.length) picks.push(shoes[0]);
    if(!picks.length) picks=items.slice(0,3);
    return picks;
  },[items,occasion]);

  function startDemo(){
    setDemo(true);
    setItems(read('ww_items',starter));
    setOutfits(read('ww_outfits',initialOutfits));
    setToast('Demo wardrobe ready — changes save in this browser.');
  }
  function openAdd(){setEditItem(null);setForm({name:'',category:'Tops',color:'Ivory',season:'All season',occasion:'Casual',emoji:'👚',bg:'#e9e1d5'});setModal('item');}
  function openEdit(item){setEditItem(item);setForm({...item});setModal('item');}
  function saveItem(e){
    e.preventDefault();
    if(!form.name.trim()){setToast('Please enter a clothing item name.');return;}
    if(editItem) setItems(items.map(i=>i.id===editItem.id?{...i,...form,name:form.name.trim()}:i));
    else setItems([{...form,id:crypto.randomUUID(),name:form.name.trim(),wears:0,favorite:false},...items]);
    setModal('');setToast(editItem?'Item updated successfully.':'Added to your wardrobe.');
  }
  function deleteItem(item){
    if(!confirm(`Delete "${item.name}" from your wardrobe?`))return;
    setItems(items.filter(i=>i.id!==item.id));
    setOutfits(outfits.map(o=>({...o,pieces:o.pieces.filter(id=>id!==item.id)})));
    setToast('Clothing item deleted.');
  }
  function toggleFav(id){setItems(items.map(i=>i.id===id?{...i,favorite:!i.favorite}:i));}
  function openOutfit(){setOutfitForm({name:'',occasion:'Casual',pieces:[]});setModal('outfit');}
  function saveOutfit(e){
    e.preventDefault();
    if(!outfitForm.name.trim()||outfitForm.pieces.length===0){setToast('Add an outfit name and choose at least one item.');return;}
    setOutfits([{...outfitForm,id:crypto.randomUUID(),day:'Not scheduled',worn:false},...outfits]);setModal('');setToast('Outfit saved.');
  }
  function wearOutfit(outfit){
    const wornIds=outfit.pieces;
    setItems(items.map(i=>wornIds.includes(i.id)?{...i,wears:i.wears+1}:i));
    setOutfits(outfits.map(o=>o.id===outfit.id?{...o,worn:true}:o));
    setToast('Outfit marked as worn. Wear counts updated.');
  }
  const nav=[['Overview',LayoutDashboard],['My wardrobe',Grid2X2],['Outfit studio',Sparkles],['Planner',CalendarDays]];
  const isWardrobe=active==='My wardrobe';
  const isOutfits=active==='Outfit studio';
  const isPlanner=active==='Planner';

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Shirt size={21}/></div><div><div className="brand-name">wardrobewise</div><div className="brand-sub">YOUR CLOSET, CONSIDERED</div></div><button className="icon-button mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(([label,Icon])=><button key={label} className={`nav-link ${active===label?'active':''}`} onClick={()=>{setActive(label);setMobileNav(false);}}><Icon size={18}/><span>{label}</span>{label==='My wardrobe'&&<span className="nav-count">{items.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Leaf size={16}/></div><div><b>Wear what you own.</b><p>Small choices, lighter footprint.</p></div></div><button className="nav-link help-link" onClick={()=>setModal('help')}><CircleHelp size={18}/> Help & tips</button><div className="profile"><div className="avatar">W</div><div className="profile-info"><b>{demo?'Demo wardrobe':'Your wardrobe'}</b><span>{demo?'Local demo mode':'Welcome to WardrobeWise'}</span></div><button className="icon-button" onClick={()=>{setDemo(false);setToast('Demo label reset. Your local data remains saved.');}} title="Reset demo label"><LogOut size={16}/></button></div></div>
    </aside>
    {mobileNav&&<button className="mobile-scrim" onClick={()=>setMobileNav(false)} aria-label="Close menu"/>}
    <main className="main">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div><div className="topbar-right"><div className="date-chip"><Sun size={15}/> A little more intentional</div><button className="avatar avatar-small" title="Current workspace">W</button></div></header>
      <div className="content">
        {active==='Overview'&&<Overview items={items} outfits={outfits} totalWears={totalWears} onNavigate={setActive} onAdd={openAdd} recommendation={recommendation} onOutfit={openOutfit}/>}
        {isWardrobe&&<section>
          <div className="page-heading"><div><div className="eyebrow">THE COLLECTION</div><h1>My wardrobe<span className="heading-period">.</span></h1><p className="muted">Every piece has a place. Find your next favorite.</p></div><button className="btn btn-primary" onClick={openAdd}><Plus size={17}/> Add an item</button></div>
          <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your closet..." aria-label="Search wardrobe"/></div><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter by category"><option>All items</option>{['Tops','Bottoms','Shoes','Outerwear','Accessories','Dresses'].map(c=><option key={c}>{c}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort items"><option>Recently added</option><option>Most worn</option><option>Least worn</option><option>Name A–Z</option></select><button className={`btn btn-filter ${onlyFav?'selected':''}`} onClick={()=>setOnlyFav(!onlyFav)}><Heart size={16} fill={onlyFav?'currentColor':'none'}/> Favorites</button></div>
          <div className="collection-summary"><span><b>{filtered.length}</b> pieces showing</span><span>Across <b>{categories.length}</b> categories</span></div>
          {filtered.length?<div className="clothing-grid">{filtered.map(item=><ClothingCard key={item.id} item={item} onEdit={()=>openEdit(item)} onDelete={()=>deleteItem(item)} onFav={()=>toggleFav(item.id)}/>)}</div>:<EmptyState title="Nothing in this corner yet" message="Try another search or add a new piece to your collection." action="Add a piece" onClick={openAdd}/>}
        </section>}
        {isOutfits&&<section>
          <div className="page-heading"><div><div className="eyebrow">PUT IT TOGETHER</div><h1>Outfit studio<span className="heading-period">.</span></h1><p className="muted">Make more combinations from what you already own.</p></div><button className="btn btn-primary" onClick={openOutfit}><Plus size={17}/> Create outfit</button></div>
          <div className="outfit-intro"><div className="outfit-intro-icon"><WandSparkles size={22}/></div><div><b>Your closet, a little more creative.</b><p>Save combinations, revisit favorites, and track what you wear.</p></div></div>
          {outfits.length?<div className="outfit-grid">{outfits.map(o=><OutfitCard key={o.id} outfit={o} items={items} onWear={()=>wearOutfit(o)} onDelete={()=>{setOutfits(outfits.filter(x=>x.id!==o.id));setToast('Outfit removed.');}}/>)}</div>:<EmptyState title="Your first outfit is waiting" message="Pick pieces from your wardrobe and save a combination." action="Create outfit" onClick={openOutfit}/>}
          <div className="section-heading spaced"><div><div className="eyebrow">A LITTLE INSPIRATION</div><h2>Try this combination</h2></div><span className="soft-badge"><Sparkles size={13}/> Rule-based pick</span></div>
          <div className="recommendation-row">{recommendation.map(i=><div className="mini-piece" key={i.id}><span className="mini-emoji" style={{background:i.bg}}>{i.emoji||'👚'}</span><div><b>{i.name}</b><small>{i.category} · {i.color}</small></div></div>)}</div>
        </section>}
        {isPlanner&&<section>
          <div className="page-heading"><div><div className="eyebrow">PLAN AHEAD</div><h1>Outfit planner<span className="heading-period">.</span></h1><p className="muted">A little less deciding, a little more doing.</p></div><button className="btn btn-primary" onClick={openOutfit}><Plus size={17}/> Plan an outfit</button></div>
          <div className="planner-banner"><div><div className="eyebrow light">YOUR WEEK, WELL DRESSED</div><h2>Make room for getting ready<br/>without the rush.</h2><p>Save an outfit now; thank yourself later.</p></div><CalendarDays size={54} strokeWidth={1.1}/></div>
          <div className="section-heading spaced"><div><div className="eyebrow">YOUR LINE-UP</div><h2>Saved outfit plans</h2></div><span className="soft-badge">{outfits.length} outfits</span></div>
          <div className="planner-list">{outfits.map(o=><div className="planner-row" key={o.id}><div className="planner-day"><CalendarDays size={18}/><span>{o.day||'Unscheduled'}</span></div><div className="planner-outfit"><b>{o.name}</b><span>{o.occasion} · {o.pieces.length} pieces</span></div><div className="planner-pieces">{o.pieces.slice(0,4).map(id=>{const i=items.find(x=>x.id===id);return i?<span key={id} style={{background:i.bg}}>{i.emoji}</span>:null})}</div><span className={`status ${o.worn?'status-done':''}`}>{o.worn?'Worn':'Planned'}</span></div>)}</div>
        </section>}
      </div>
      <footer className="footer"><span>WARDROBEWISE © 2026</span><span>Made for a more considered closet <Heart size={12}/></span></footer>
    </main>
    {modal==='item'&&<Modal title={editItem?'Edit clothing item':'Add to your wardrobe'} onClose={()=>setModal('')}><form className="form-grid" onSubmit={saveItem}>
      <label className="full">Item name<input required autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Linen relaxed shirt"/></label>
      <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value,emoji:categoryEmoji[e.target.value]||'👚'})}>{['Tops','Bottoms','Shoes','Outerwear','Accessories','Dresses'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Color<input required value={form.color} onChange={e=>setForm({...form,color:e.target.value})} placeholder="e.g. Sage green"/></label>
      <label>Season<select value={form.season} onChange={e=>setForm({...form,season:e.target.value})}>{['All season','Summer','Monsoon','Spring','Autumn','Winter'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Best for<select value={form.occasion} onChange={e=>setForm({...form,occasion:e.target.value})}>{['Casual','College','Work','Date night','Party','Travel','Any'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="full">Card color<div className="color-picker">{['#e9e1d5','#d9d5cf','#d6ddd0','#e0d0bb','#d6c9d7','#d3d0cb'].map(c=><button type="button" key={c} className={`color-dot ${form.bg===c?'color-active':''}`} style={{background:c}} onClick={()=>setForm({...form,bg:c})} aria-label={`Select color ${c}`}/>)}</div></label>
      <div className="modal-actions full"><button type="button" className="btn btn-secondary" onClick={()=>setModal('')}>Cancel</button><button className="btn btn-primary" type="submit"><Check size={16}/>{editItem?'Save changes':'Add item'}</button></div>
    </form></Modal>}
    {modal==='outfit'&&<Modal title="Create an outfit" onClose={()=>setModal('')}><form className="form-grid" onSubmit={saveOutfit}>
      <label className="full">Outfit name<input required autoFocus value={outfitForm.name} onChange={e=>setOutfitForm({...outfitForm,name:e.target.value})} placeholder="e.g. Coffee with friends"/></label>
      <label className="full">Occasion<select value={outfitForm.occasion} onChange={e=>setOutfitForm({...outfitForm,occasion:e.target.value})}>{['Casual','College','Work','Date night','Party','Travel'].map(x=><option key={x}>{x}</option>)}</select></label>
      <div className="full"><div className="field-title">Choose pieces <span>{outfitForm.pieces.length} selected</span></div><div className="piece-picker">{items.map(i=><button type="button" key={i.id} className={`piece-option ${outfitForm.pieces.includes(i.id)?'piece-selected':''}`} onClick={()=>setOutfitForm({...outfitForm,pieces:outfitForm.pieces.includes(i.id)?outfitForm.pieces.filter(x=>x!==i.id):[...outfitForm.pieces,i.id]})}><span style={{background:i.bg}}>{i.emoji}</span><small>{i.name}</small>{outfitForm.pieces.includes(i.id)&&<Check size={15}/>}</button>)}</div></div>
      <div className="modal-actions full"><button type="button" className="btn btn-secondary" onClick={()=>setModal('')}>Cancel</button><button className="btn btn-primary" type="submit"><Check size={16}/>Save outfit</button></div>
    </form></Modal>}
    {modal==='help'&&<Modal title="A few helpful tips" onClose={()=>setModal('')}><div className="help-content"><p><b>Start with what you own.</b> Add a few basics first, then build outfits from them.</p><p><b>Use favorites.</b> Save pieces you reach for often to find them quickly.</p><p><b>Try the recommendation.</b> WardrobeWise ranks a simple combination from your saved pieces; it is a rule-based demo, not a trained AI model.</p><p><b>About demo mode.</b> This browser demo stores its data in localStorage. The Express/MongoDB backend is a separate setup.</p><button className="btn btn-primary" onClick={()=>setModal('')}>Got it</button></div></Modal>}
    {toast&&<div className="toast"><Check size={17}/>{toast}</div>}
  </div>;
}

function Overview({items,outfits,totalWears,onNavigate,onAdd,recommendation,onOutfit}){
  const least=[...items].sort((a,b)=>a.wears-b.wears).slice(0,3);
  return <section>
    <div className="welcome-row"><div><div className="eyebrow">TUESDAY, OCTOBER 27</div><h1>A wardrobe that <em>works for you.</em></h1><p className="muted">A little intention goes a long way. Let's make getting dressed feel easier.</p></div><button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Add an item</button></div>
    <div className="hero-banner"><div className="hero-copy"><span className="hero-kicker"><Sparkles size={14}/> YOUR DAILY EDIT</span><h2>Less “I have nothing<br/>to wear.” More <i>you.</i></h2><p>Find fresh combinations in the pieces you already love.</p><button className="btn btn-light" onClick={()=>onNavigate('Outfit studio')}>Explore outfit studio <ArrowUpRight size={16}/></button></div><div className="hero-art"><div className="sun-disc"/><div className="hero-caption">THE ART OF<br/>RE-WEARING</div><div className="fashion-emoji">✳</div><div className="hero-fabric fabric-one"/><div className="hero-fabric fabric-two"/></div></div>
    <div className="stats-grid"><Stat label="WARDROBE PIECES" value={items.length} note="Your collection" icon={Shirt}/><Stat label="SAVED OUTFITS" value={outfits.length} note="Ready when you are" icon={Sparkles}/><Stat label="TOTAL WEARS" value={totalWears} note="More life per piece" icon={RotateCcw}/><Stat label="FAVORITES" value={items.filter(i=>i.favorite).length} note="Your go-to pieces" icon={Heart}/></div>
    <div className="dashboard-columns"><div className="panel"><div className="section-heading"><div><div className="eyebrow">YOUR COLLECTION</div><h2>Recently loved</h2></div><button className="text-button" onClick={()=>onNavigate('My wardrobe')}>View wardrobe <ArrowUpRight size={14}/></button></div><div className="recent-grid">{items.slice(0,3).map(i=><div className="recent-item" key={i.id} onClick={()=>onNavigate('My wardrobe')} role="button" tabIndex="0"><div className="recent-image" style={{background:i.bg}}><span>{i.emoji}</span>{i.favorite&&<Heart size={14} fill="#8f554f" color="#8f554f"/>}</div><b>{i.name}</b><small>{i.category} · {i.color}</small></div>)}</div></div>
    <div className="panel insight-panel"><div className="section-heading"><div><div className="eyebrow">A GENTLE NUDGE</div><h2>Give these a spin</h2></div><span className="insight-spark"><Sparkles size={17}/></span></div><p className="muted small-copy">Your least-worn pieces deserve another moment in the spotlight.</p><div className="least-list">{least.map(i=><div className="least-item" key={i.id}><span style={{background:i.bg}}>{i.emoji}</span><div><b>{i.name}</b><small>{i.wears} wears logged</small></div><span className="wear-tag">Re-wear</span></div>)}</div><button className="text-button" onClick={()=>onNavigate('Outfit studio')}>Find a new combination <ArrowUpRight size={14}/></button></div></div>
    <div className="bottom-promo"><div className="promo-icon"><CalendarDays size={21}/></div><div><b>Tomorrow-you says thank you.</b><p>Plan an outfit now and make tomorrow morning that little bit easier.</p></div><button className="btn btn-secondary" onClick={onOutfit}>Plan an outfit <ArrowUpRight size={15}/></button></div>
  </section>;
}
function Stat({label,value,note,icon:Icon}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><Icon size={17}/></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>}
function ClothingCard({item,onEdit,onDelete,onFav}){
  return <article className="clothing-card"><div className="clothing-visual" style={{background:item.bg||'#e9e1d5'}}><div className="item-topline"><span className="category-pill">{item.category}</span><button className={`favorite-button ${item.favorite?'is-favorite':''}`} onClick={onFav} aria-label={item.favorite?'Remove favorite':'Add favorite'}><Heart size={16} fill={item.favorite?'currentColor':'none'}/></button></div><span className="clothing-emoji">{item.emoji||'👚'}</span><div className="visual-label">{item.color}</div></div><div className="clothing-info"><div><h3>{item.name}</h3><p>{item.season} · {item.occasion}</p></div><div className="wear-count"><RotateCcw size={13}/>{item.wears} wears</div></div><div className="card-actions"><button onClick={onEdit}><Pencil size={14}/> Edit</button><button onClick={onDelete}><Trash2 size={14}/> Delete</button></div></article>;
}
function OutfitCard({outfit,items,onWear,onDelete}){
  const pieces=outfit.pieces.map(id=>items.find(i=>i.id===id)).filter(Boolean);
  return <article className="outfit-card"><div className="outfit-visual">{pieces.slice(0,3).map((p,i)=><div key={p.id} style={{background:p.bg,transform:`rotate(${(i-1)*5}deg)`}}>{p.emoji}</div>)}{!pieces.length&&<span>✳</span>}</div><div className="outfit-details"><div className="outfit-tags"><span>{outfit.occasion}</span><span>{outfit.day||'Unscheduled'}</span></div><h3>{outfit.name}</h3><p>{pieces.length} pieces · {outfit.worn?'Worn before':'Ready to wear'}</p><div className="outfit-card-actions"><button className="btn btn-secondary btn-sm" onClick={onWear} disabled={!pieces.length||outfit.worn}>{outfit.worn?'Already worn':'Mark as worn'}</button><button className="icon-button" onClick={onDelete} aria-label="Delete outfit"><Trash2 size={16}/></button></div></div></article>;
}
function EmptyState({title,message,action,onClick}){return <div className="empty-state"><div className="empty-icon"><Shirt size={25}/></div><h3>{title}</h3><p>{message}</p><button className="btn btn-primary" onClick={onClick}><Plus size={16}/>{action}</button></div>}
function Modal({title,onClose,children}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={19}/></button></div>{children}</div></div>}

export default App;
