(()=>{
  const tg = window.Telegram?.WebApp;
  const DEV_DEBUG = new URLSearchParams(location.search).get('debug') === '1';
  try{ tg?.ready(); tg?.expand(); }catch{}

  const i18n = {
    ru:{ lang:'RU', theme:'Тема', themeLight:'Светлая', themeDark:'Тёмная', themeAuto:'Авто',
      langRu:'Русский', langEn:'English',
      welcome:'Добро пожаловать на <span class="brand">Тестмаркет</span>',
      pick:'Выберите, что хотите сделать',
      actPremium:'Купить Premium', actBuyStars:'Купить Stars', actSellStars:'Продать Stars',
      placeholder:'Выберите действие, чтобы продолжить.',
      toWhom:'Кому купить Premium', self:'Себе', other:'Другому',
      username:'Username получателя (@username)', yourUsername:'Ваш @username',
      months:'Срок подписки', currency:'Валюта оплаты', price:'Цена',
      howManyBuy:'Сколько Stars купить', howManySell:'Сколько Stars продать',
      payoutCurrency:'Валюта получения', payoutAddress:'Адрес для выплаты',
      totalPay:'Итог к оплате', youGet:'Вы получите', faq:'FAQ',
      supportTitle:'Контакты поддержки', writeSupport:'Написать в поддержку',
      minStars:'Минимальное количество 50 звёзд', invalidUsername:'Введите корректное имя пользователя',
      userNotFound:'Пользователь не найден', premiumActive:'Премиум уже активирован', needAddress:'Укажите адрес для выплаты',
      btnPay:'Оплатить', btnTransferStars:(n)=>`Передать ${n} звёзд`,
      toastPayout:'Оплата на указанный адрес пройдёт в течение нескольких минут.',
      q1:'Что такое Telegram Stars?', a1:'Внутренняя валюта Telegram для цифровых товаров и сервисов.',
      q2:'Как оплатить в TON?', a2:'Пока заглушка. Позже подключим TON Connect / кошельки.',
      q3:'Как оплатить картой?', a3:'Сейчас заглушка. Будет подключён провайдер (эквайер) с 3‑D Secure.',
      q4:'Сколько ждать зачисления?', a4:'Обычно секунды; в исключениях — до 10 минут.',
      q5:'Оплата прошла, но ничего не получил', a5:'Напишите нам: укажите @username и время оплаты — разберёмся.'
    },
    en:{ lang:'EN', theme:'Theme', themeLight:'Light', themeDark:'Dark', themeAuto:'Auto',
      langRu:'Russian', langEn:'English',
      welcome:'Welcome to <span class="brand">Testmarket</span>',
      pick:'Choose what you want to do',
      actPremium:'Buy Premium', actBuyStars:'Buy Stars', actSellStars:'Sell Stars',
      placeholder:'Select an action to continue.',
      toWhom:'Who will get Premium', self:'Myself', other:'Someone else',
      username:'Recipient username (@username)', yourUsername:'Your @username',
      months:'Subscription period', currency:'Payment currency', price:'Price',
      howManyBuy:'How many Stars to buy', howManySell:'How many Stars to sell',
      payoutCurrency:'Payout currency', payoutAddress:'Payout address',
      totalPay:'Total to pay', youGet:'You will receive', faq:'FAQ',
      supportTitle:'Support contacts', writeSupport:'Message support',
      minStars:'Minimum is 50 stars', invalidUsername:'Enter a valid username',
      userNotFound:'User not found', premiumActive:'Premium is already active', needAddress:'Enter the payout address',
      btnPay:'Pay', btnTransferStars:(n)=>`Transfer ${n} Stars`,
      toastPayout:'Payout to the specified address will be processed within a few minutes.',
      q1:'What are Telegram Stars?', a1:'Telegram\'s internal currency for digital goods and services.',
      q2:'How to pay in TON?', a2:'Temporary stub. We\'ll add TON Connect / wallets later.',
      q3:'How to pay by card?', a3:'Temporary stub. A provider (acquirer) with 3‑D Secure will be added.',
      q4:'How long does it take?', a4:'Usually seconds; in rare cases — up to 10 minutes.',
      q5:'Payment went through but I got nothing', a5:'Message us with your @username and payment time — we\'ll sort it out.'
    }
  };

  const state={ action:null, theme:localStorage.getItem('tm_theme')||'light', lang:localStorage.getItem('tm_lang')||'ru', form:{} };

  const PRICES={
    premium:{'3':{TON:15,USDT_TON:4.10,RUB:1290,USD:3.99,EUR:3.59},
             '6':{TON:28,USDT_TON:7.80,RUB:2490,USD:7.49,EUR:6.99},
             '12':{TON:50,USDT_TON:14.5,RUB:4590,USD:13.99,EUR:12.99}},
    starBuyRate:{TON:.00002,USDT_TON:.000022,RUB:.12,USD:.0025,EUR:.0023},
    starSellRate:{TON:.000018,USDT_TON:.000020}
  };

  const el={
    root:document.documentElement, burgerBtn:byId('burgerBtn'), sidebar:byId('sidebar'), backdrop:byId('backdrop'), closeSidebar:byId('closeSidebar'),
    langBtn:byId('langBtn'),langLabel:byId('langLabel'),langMenu:byId('langMenu'),langRu:byId('langRu'),langEn:byId('langEn'),
    themeBtn:byId('themeBtn'),themeLabel:byId('themeLabel'),themeMenu:byId('themeMenu'),themeLight:byId('themeLight'),themeDark:byId('themeDark'),themeAuto:byId('themeAuto'),
    welcomeTitle:byId('welcomeTitle'),pickerLabel:byId('pickerLabel'),actionPicker:byId('actionPicker'),actionMenu:byId('actionMenu'),
    actPremium:byId('actPremium'),actBuyStars:byId('actBuyStars'),actSellStars:byId('actSellStars'),
    formArea:byId('formArea'),formPlaceholder:byId('formPlaceholder'),
    faqTitle:byId('faqTitle'),q1:byId('q1'),a1:byId('a1'),q2:byId('q2'),a2:byId('a2'),q3:byId('q3'),a3:byId('a3'),q4:byId('q4'),a4:byId('a4'),q5:byId('q5'),a5:byId('a5'),
    supportTitle:byId('supportTitle'),supportBtn:byId('supportBtn'),
    toast:byId('toast'),toastText:byId('toastText'),toastClose:byId('toastClose')
  };
  function byId(id){return document.getElementById(id)}

  function applyTheme(t){
    state.theme=t; localStorage.setItem('tm_theme',t);
    if(t==='auto'){ const d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches; el.root.setAttribute('data-theme',d?'dark':'light'); }
    else el.root.setAttribute('data-theme',t);
    try{ tg?.setHeaderColor?.(t==='dark'?'#0b0f14':'#ffffff'); tg?.setBackgroundColor?.(t==='dark'?'#0b0f14':'#ffffff'); }catch{}
  }
  applyTheme(state.theme);

  function safe(n,f){ if(n) try{f(n)}catch{} }
  function tx(){ return i18n[state.lang]||i18n.ru }

  function applyLang(l){
    const t=tx(); state.lang=l; localStorage.setItem('tm_lang',l);
    safe(el.langLabel,n=>n.textContent=t.lang);
    safe(el.themeLabel,n=>n.textContent=t.theme);
    safe(el.themeLight,n=>n.textContent=t.themeLight);
    safe(el.themeDark,n=>n.textContent=t.themeDark);
    safe(el.themeAuto,n=>n.textContent=t.themeAuto);
    safe(el.langRu,n=>n.textContent=t.langRu);
    safe(el.langEn,n=>n.textContent=t.langEn);
    safe(el.welcomeTitle,n=>n.innerHTML=t.welcome);
    safe(el.pickerLabel,n=>n.textContent=t.pick);
    safe(el.actPremium,n=>n.textContent=t.actPremium);
    safe(el.actBuyStars,n=>n.textContent=t.actBuyStars);
    safe(el.actSellStars,n=>n.textContent=t.actSellStars);
    safe(el.formPlaceholder,n=>n.textContent=t.placeholder);
    // FAQ
    safe(el.faqTitle,n=>n.textContent=t.faq);
    safe(el.q1,n=>n.textContent=t.q1); safe(el.a1,n=>n.textContent=t.a1);
    safe(el.q2,n=>n.textContent=t.q2); safe(el.a2,n=>n.textContent=t.a2);
    safe(el.q3,n=>n.textContent=t.q3); safe(el.a3,n=>n.textContent=t.a3);
    safe(el.q4,n=>n.textContent=t.q4); safe(el.a4,n=>n.textContent=t.a4);
    safe(el.q5,n=>n.textContent=t.q5); safe(el.a5,n=>n.textContent=t.a5);
    safe(el.supportTitle,n=>n.textContent=t.supportTitle);
    safe(el.supportBtn,n=>n.textContent=t.writeSupport);
    if(state.action) renderForm();
  }
  applyLang(state.lang);

  function openSidebar(open){
    if(open){ el.sidebar.classList.add('open'); el.sidebar.setAttribute('aria-hidden','false'); el.backdrop.hidden=false; el.backdrop.setAttribute('aria-open','true'); try{tg?.MainButton?.hide()}catch{}; if(!tg&&DEV_DEBUG) hideFakeMainButton(); }
    else { el.sidebar.classList.remove('open'); el.sidebar.setAttribute('aria-hidden','true'); el.backdrop.removeAttribute('aria-open'); el.backdrop.hidden=true; updateMainButton(); }
  }
  el.burgerBtn?.addEventListener('click',()=>openSidebar(true));
  el.backdrop?.addEventListener('click',()=>openSidebar(false));
  el.closeSidebar?.addEventListener('click',()=>openSidebar(false));

  function toggleMenu(menuEl,open){ document.querySelectorAll('.menu').forEach(m=>{m.setAttribute('hidden','');m.removeAttribute('aria-open')}); if(open){menuEl.removeAttribute('hidden');menuEl.setAttribute('aria-open','true')} }
  el.langBtn?.addEventListener('click',()=>{ const o=el.langMenu.hasAttribute('aria-open'); toggleMenu(el.langMenu,!o) });
  el.themeBtn?.addEventListener('click',()=>{ const o=el.themeMenu.hasAttribute('aria-open'); toggleMenu(el.themeMenu,!o) });
  document.addEventListener('click',(e)=>{ if(!e.target.closest('.control')) document.querySelectorAll('.menu').forEach(m=>{m.setAttribute('hidden','');m.removeAttribute('aria-open')}) });
  el.langMenu?.addEventListener('click',(e)=>{ const btn=e.target.closest('.menu-item'); if(!btn) return; const l=btn.dataset.lang; if(l){ el.langMenu.querySelectorAll('.menu-item').forEach(mi=>mi.classList.toggle('active',mi===btn)); applyLang(l); toggleMenu(el.langMenu,false);} });
  el.themeMenu?.addEventListener('click',(e)=>{ const btn=e.target.closest('.menu-item'); if(!btn) return; const th=btn.dataset.theme; if(th){ applyTheme(th); toggleMenu(el.themeMenu,false);} });

  function togglePicker(){ const open=!el.actionMenu.hasAttribute('aria-open'); if(open){el.actionMenu.removeAttribute('hidden');el.actionMenu.setAttribute('aria-open','true')} else {el.actionMenu.removeAttribute('aria-open');el.actionMenu.setAttribute('hidden','')} }
  el.actionPicker?.addEventListener('click',togglePicker);
  el.actionMenu?.addEventListener('click',(e)=>{ const it=e.target.closest('.picker-item'); if(!it) return; selectAction(it.dataset.action); el.actionMenu.removeAttribute('aria-open'); el.actionMenu.setAttribute('hidden',''); });

  function selectAction(act){ state.action=act; state.form={}; renderForm(); updateMainButton(); }
  const getSelfUsername = () => tg?.initDataUnsafe?.user?.username ? '@'+tg.initDataUnsafe.user.username : '';

  function renderForm(){
    const w=el.formArea; w.classList.remove('placeholder');
    if(state.action==='premium_buy') w.innerHTML=premiumFormHTML();
    else if(state.action==='stars_buy') w.innerHTML=starsBuyFormHTML();
    else if(state.action==='stars_sell') w.innerHTML=starsSellFormHTML();
    else { w.classList.add('placeholder'); w.innerHTML=`<p>${tx().placeholder}</p>`; try{tg?.MainButton?.hide()}catch{}; if(DEV_DEBUG) hideFakeMainButton(); return; }
    attachFormHandlers();
  }

  function premiumFormHTML(){
    const t=tx(), selfName=getSelfUsername();
    return `<div class="form-grid">
      <div class="row cols-2">
        <div class="radio-group"><label>${t.toWhom}</label>
          <div class="radio-line">
            <label><input type="radio" name="to" value="self" checked> ${t.self}</label>
            <label><input type="radio" name="to" value="other"> ${t.other}</label>
          </div>
        </div>
        <div class="input">
          <label for="username">${t.username}</label>
          <input id="username" type="text" placeholder="@username" disabled>
          <div id="selfUsername" class="info" style="display:${selfName?'block':'none'};">${t.yourUsername}: ${selfName||''}</div>
          <div id="userError" class="error" style="display:none;"></div>
        </div>
      </div>
      <div class="row cols-2">
        <div class="select"><label for="months">${t.months}</label>
          <select id="months"><option value="" selected disabled>—</option><option value="3">3</option><option value="6">6</option><option value="12">12</option></select>
        </div>
        <div class="select"><label for="currency">${t.currency}</label>
          <select id="currency"><option value="" selected disabled>—</option><option value="TON">TON</option><option value="USDT_TON">USDT (TON)</option><option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
        </div>
      </div>
      <div class="card"><div id="priceLine" class="mt-8">${t.price}: —</div></div>
    </div>`;
  }

  function starsBuyFormHTML(){
    const t=tx();
    return `<div class="form-grid">
      <div class="row cols-2">
        <div class="input"><label for="starsAmount">${t.howManyBuy}</label><input id="starsAmount" type="number" min="1" step="1" placeholder="500"></div>
        <div class="select"><label for="currency">${t.currency}</label>
          <select id="currency"><option value="" selected disabled>—</option><option value="TON">TON</option><option value="USDT_TON">USDT (TON)</option><option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
        </div>
      </div>
      <div class="card"><div id="priceLine" class="mt-8">${t.totalPay}: —</div></div>
    </div>`;
  }

  function starsSellFormHTML(){
    const t=tx();
    return `<div class="form-grid">
      <div class="row cols-2">
        <div class="input"><label for="starsAmount">${t.howManySell}</label>
          <input id="starsAmount" type="number" min="1" step="1" placeholder="Минимум 50 звёзд">
          <div id="starsError" class="error" style="display:none;"></div>
        </div>
        <div class="select"><label for="currency">${t.payoutCurrency}</label>
          <select id="currency"><option value="" selected disabled>—</option><option value="TON">TON</option><option value="USDT_TON">USDT (TON)</option></select>
        </div>
      </div>
      <div class="row">
        <div class="input"><label for="payoutAddr">${t.payoutAddress}</label>
          <input id="payoutAddr" type="text" placeholder="EQ... / UQ..." disabled>
          <div id="addrError" class="error" style="display:none;"></div>
        </div>
      </div>
      <div class="card"><div id="priceLine" class="mt-8">${t.youGet}: —</div></div>
    </div>`;
  }

  const USER_RE=/^@?[a-zA-Z0-9_]{5,}$/;
  const TON_ADDR_RE=/^(E|U)Q[A-Za-z0-9_-]{46,}$/;
  function fakeCheckUser(name){ return new Promise(res=>{ setTimeout(()=>{
      if(!USER_RE.test(name)) return res({ok:false,reason:'invalid'});
      const n=name.replace(/^@/,''); if(n.toLowerCase().includes('nonexist')) return res({ok:false,reason:'not_found'});
      if(n.toLowerCase().includes('premium')) return res({ok:false,reason:'premium_active'}); res({ok:true}); },300) }) }

  function attachFormHandlers(){
    const t=tx();
    if(state.action==='premium_buy'){
      const radios=document.querySelectorAll('input[name="to"]');
      const username=byId('username'); const selfUsername=byId('selfUsername'); const userError=byId('userError');
      const months=byId('months'); const currency=byId('currency'); const priceLine=byId('priceLine');
      function setUserError(msg){ userError.textContent=msg||''; userError.style.display=msg?'block':'none' }
      radios.forEach(r=>r.addEventListener('change',()=>{
        const val=document.querySelector('input[name="to"]:checked').value; state.form.to=val;
        const selfName=getSelfUsername();
        if(val==='self'){ username.disabled=true; username.value=''; selfUsername.style.display=selfName?'block':'none'; setUserError('');
          if(selfName && selfName.toLowerCase().includes('premium')) setUserError(t.premiumActive);
        } else { username.disabled=false; selfUsername.style.display='none'; }
        updateMainButton();
      }));
      username?.addEventListener('input',async()=>{
        const name=username.value.trim(); state.form.username=name; setUserError(''); if(!name) return updateMainButton();
        const resp=await fakeCheckUser(name);
        if(!resp.ok){ if(resp.reason==='invalid') setUserError(t.invalidUsername); if(resp.reason==='not_found') setUserError(t.userNotFound); if(resp.reason==='premium_active') setUserError(t.premiumActive); }
        updateMainButton();
      });
      function recalcPrice(){ const m=state.form.months, cur=state.form.currency;
        if(m && cur && PRICES.premium[m]?.[cur]!=null){ state.form.amount=PRICES.premium[m][cur]; priceLine.textContent=`${t.price}: ${state.form.amount} ${String(cur).replace('_',' ').toUpperCase()}`; }
        else{ state.form.amount=null; priceLine.textContent=`${t.price}: —`; } updateMainButton();
      }
      months?.addEventListener('change',()=>{ state.form.months=months.value; recalcPrice(); });
      currency?.addEventListener('change',()=>{ state.form.currency=currency.value; recalcPrice(); });
    }

    if(state.action==='stars_buy'){
      const amount=byId('starsAmount'); const currency=byId('currency'); const priceLine=byId('priceLine');
      function recalc(){ const stars=parseInt(amount?.value??'0',10)||0; state.form.stars=stars; const cur=state.form.currency;
        if(!stars||!cur){ state.form.amount=null; priceLine.textContent=`${t.totalPay}: —`; updateMainButton(); return; }
        const rate=PRICES.starBuyRate[cur]; if(!rate){ state.form.amount=null; priceLine.textContent='—'; }
        else{ const total=+(stars*rate).toFixed(6); state.form.amount=total; priceLine.textContent=`${t.totalPay}: ${total} ${String(cur).replace('_',' ').toUpperCase()}`; }
        updateMainButton(); }
      amount?.addEventListener('input',recalc); currency?.addEventListener('change',()=>{ state.form.currency=currency.value; recalc(); });
    }

    if(state.action==='stars_sell'){
      const amount=byId('starsAmount'); const currency=byId('currency'); const priceLine=byId('priceLine'); const addr=byId('payoutAddr'); const starsErr=byId('starsError'); const addrErr=byId('addrError');
      function setStarsError(m){ starsErr.textContent=m||''; starsErr.style.display=m?'block':'none' }
      function setAddrError(m){ addrErr.textContent=m||''; addrErr.style.display=m?'block':'none' }
      function recalc(){ const stars=parseInt(amount?.value??'0',10)||0; state.form.stars=stars; const cur=state.form.currency;
        if(!stars||!cur){ state.form.amount=null; priceLine.textContent=`${t.youGet}: —`; updateMainButton(); return; }
        const rate=PRICES.starSellRate[cur]; if(!rate){ state.form.amount=null; priceLine.textContent='—'; }
        else{ const total=+(stars*rate).toFixed(6); state.form.amount=total; priceLine.textContent=`${t.youGet}: ${total} ${String(cur).replace('_',' ').toUpperCase()}`; }
        updateMainButton(); }
      amount?.addEventListener('input',()=>{ if((parseInt(amount.value||'0',10)||0) < 50) setStarsError(t.minStars); else setStarsError(''); recalc(); });
      currency?.addEventListener('change',()=>{ state.form.currency=currency.value; addr.disabled=!state.form.currency; recalc(); });
      addr?.addEventListener('input',()=>{ state.form.address=addr.value.trim(); setAddrError(''); updateMainButton(); });
    }
  }

  let fakeBtn=null; function ensureFakeBtn(){ if(fakeBtn) return fakeBtn; fakeBtn=byId('fakeMainButton'); if(!fakeBtn){ fakeBtn=document.createElement('button'); fakeBtn.id='fakeMainButton'; document.body.appendChild(fakeBtn) } fakeBtn.addEventListener('click',payNow); return fakeBtn }
  function showFakeMainButton(text){ const b=ensureFakeBtn(); b.textContent=text||tx().btnPay; b.style.display='block' }
  function hideFakeMainButton(){ if(fakeBtn) fakeBtn.style.display='none' }

  function updateMainButton(){
    const t=tx(); let ok=false, label=t.btnPay;
    if(state.action==='premium_buy'){ const to=state.form.to||'self'; let userOk=true; const name=state.form.username||''; if(to==='other') userOk=!!name && /^@?[a-zA-Z0-9_]{5,}$/.test(name);
      ok=!!(userOk && state.form.months && state.form.currency && state.form.amount!=null);
      if(ok) label=(state.lang==='ru')?`Оплатить ${state.form.amount} ${String(state.form.currency).replace('_',' ').toUpperCase()}`:`Pay ${state.form.amount} ${String(state.form.currency).replace('_',' ').toUpperCase()}`;
    }
    if(state.action==='stars_buy'){ ok=!!(state.form.stars>0 && state.form.currency && state.form.amount!=null);
      if(ok) label=(state.lang==='ru')?`Оплатить ${state.form.amount} ${String(state.form.currency).replace('_',' ').toUpperCase()}`:`Pay ${state.form.amount} ${String(state.form.currency).replace('_',' ').toUpperCase()}`; }
    if(state.action==='stars_sell'){ const starsOk=(state.form.stars||0)>=50; let addrOk=!!state.form.address; if(addrOk) addrOk=/^(E|U)Q[A-Za-z0-9_-]{46,}$/.test(state.form.address);
      ok=!!(starsOk && state.form.currency && state.form.amount!=null && addrOk); const n=state.form.stars||0; label=t.btnTransferStars(n); }
    try{
      if(tg){ if(ok && el.sidebar.getAttribute('aria-hidden')!=='false'){ tg.MainButton.setText(label); tg.MainButton.show(); tg.MainButton.onClick(payNow); }
              else { tg.MainButton.hide(); tg.MainButton.offClick(payNow); } }
      else if(DEV_DEBUG){ if(ok && el.sidebar.getAttribute('aria-hidden')!=='false') showFakeMainButton(label); else hideFakeMainButton(); }
    }catch{}
  }

  function showToast(text){ if(!el.toast) return; el.toastText.textContent=text||tx().toastPayout; el.toast.hidden=false; }
  el.toastClose?.addEventListener('click',()=>{ el.toast.hidden=true });

  function payNow(){
    const t=tx(); const {action,form}=state;
    if(action==='stars_sell'){ alert((state.lang==='ru'?'Откроем окно передачи звёзд (заглушка).':'Open stars transfer (stub).')); showToast(t.toastPayout); return; }
    alert((state.lang==='ru'?'Откроем платёжную страницу (заглушка).':'Open payment page (stub).')+'\n\n'+JSON.stringify({action,...form},null,2));
  }

  (function setupSupport(){
    let supportUsername='fightingkitty'; let supportUrl='https://t.me/'+supportUsername;
    try{ const url=new URL(window.location.href); const sup=url.searchParams.get('support'); if(sup){ supportUsername=sup.replace(/^@/,''); supportUrl='https://t.me/'+supportUsername; } }catch{}
    el.supportBtn?.addEventListener('click',()=>{ if(tg?.openTelegramLink) tg.openTelegramLink(supportUrl); else window.open(supportUrl,'_blank'); });
  })();

  selectAction(null);
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'){ openSidebar(false); document.querySelectorAll('.menu').forEach(m=>{m.setAttribute('hidden','');m.removeAttribute('aria-open')}); el.actionMenu.setAttribute('hidden',''); el.actionMenu.removeAttribute('aria-open'); } });
})();