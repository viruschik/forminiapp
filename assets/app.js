(()=>{
  const tg = window.Telegram?.WebApp;
  tg?.ready(); tg?.expand();

  const state = { action:null, theme:localStorage.getItem('tm_theme')||'light', lang:'ru', form:{} };

  const PRICES = {
    premium: {'3':{TON:15,RUB:1290,USD:3.99,EUR:3.59}, '6':{TON:28,RUB:2490,USD:7.49,EUR:6.99}, '12':{TON:50,RUB:4590,USD:13.99,EUR:12.99}},
    starBuyRate: { TON:0.00002, RUB:0.12, USD:0.0025, EUR:0.0023 },
    starSellRate:{ TON:0.000018, RUB:0.10 },
    defaultCurrency:'TON',
  };

  const el = {
    root:document.documentElement,
    burgerBtn:document.getElementById('burgerBtn'),
    sidebar:document.getElementById('sidebar'),
    backdrop:document.getElementById('backdrop'),
    langBtn:document.getElementById('langBtn'),
    langMenu:document.getElementById('langMenu'),
    themeBtn:document.getElementById('themeBtn'),
    themeMenu:document.getElementById('themeMenu'),
    actionPicker:document.getElementById('actionPicker'),
    actionMenu:document.getElementById('actionMenu'),
    formArea:document.getElementById('formArea'),
    payArea:document.getElementById('payArea'),
    payBtn:document.getElementById('payBtn'),
    supportBtn:document.getElementById('supportBtn'),
    supportLink:document.getElementById('supportLink'),
  };

  function applyTheme(t){
    state.theme=t; localStorage.setItem('tm_theme',t);
    if(t==='auto'){const m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches; el.root.setAttribute('data-theme', m?'dark':'light');}
    else el.root.setAttribute('data-theme',t);
    try{ tg?.setHeaderColor?.(t==='dark'?'#0b0f14':'#ffffff'); tg?.setBackgroundColor?.(t==='dark'?'#0b0f14':'#ffffff'); }catch{}
  }
  applyTheme(state.theme);

  function openSidebar(open){ if(open){el.sidebar.classList.add('open'); el.sidebar.setAttribute('aria-hidden','false'); el.backdrop.hidden=false;} else {el.sidebar.classList.remove('open'); el.sidebar.setAttribute('aria-hidden','true'); el.backdrop.hidden=true;} }
  el.burgerBtn.addEventListener('click',()=>openSidebar(true));
  el.backdrop.addEventListener('click',()=>openSidebar(false));

  function toggleMenu(m){const h=m.hasAttribute('hidden'); document.querySelectorAll('.menu').forEach(x=>x.setAttribute('hidden','')); if(h) m.removeAttribute('hidden');}
  el.langBtn.addEventListener('click',()=>toggleMenu(el.langMenu));
  el.themeBtn.addEventListener('click',()=>toggleMenu(el.themeMenu));
  document.addEventListener('click',(e)=>{ if(!e.target.closest('.controls')) document.querySelectorAll('.menu').forEach(m=>m.setAttribute('hidden','')); });
  el.themeMenu.addEventListener('click',(e)=>{ const btn=e.target.closest('.menu-item'); if(!btn) return; const theme=btn.dataset.theme; if(theme) applyTheme(theme); });

  el.supportBtn.addEventListener('click',()=>{
    const link=el.supportLink.getAttribute('href');
    if(link&&link!=='#'){ if(tg?.openTelegramLink) tg.openTelegramLink(link); else window.open(link,'_blank'); }
    else alert('Укажите username поддержки внизу боковой панели.');
  });

  function togglePicker(){const hid=el.actionMenu.hasAttribute('hidden'); document.querySelectorAll('.picker-menu').forEach(m=>m.setAttribute('hidden','')); if(hid) el.actionMenu.removeAttribute('hidden'); el.actionPicker.setAttribute('aria-expanded', String(hid));}
  el.actionPicker.addEventListener('click',togglePicker);
  el.actionMenu.addEventListener('click',(e)=>{const it=e.target.closest('.picker-item'); if(!it) return; selectAction(it.dataset.action); el.actionMenu.setAttribute('hidden',''); el.actionPicker.setAttribute('aria-expanded','false');});

  function selectAction(a){ state.action=a; state.form={}; renderForm(); updatePayButton(); }

  function renderForm(){
    const w=el.formArea; w.classList.remove('placeholder'); el.payArea.hidden=false;
    if(state.action==='premium_buy') w.innerHTML=premiumFormHTML();
    else if(state.action==='stars_buy') w.innerHTML=starsBuyFormHTML();
    else if(state.action==='stars_sell') w.innerHTML=starsSellFormHTML();
    else { w.classList.add('placeholder'); w.innerHTML='<p>Выберите действие, чтобы продолжить.</p>'; el.payArea.hidden=true; return; }
    attachFormHandlers();
  }

  function premiumFormHTML(){return `
    <div class="form-grid">
      <div class="row cols-2">
        <div class="radio-group">
          <label>Кому купить Premium</label>
          <div class="radio-line">
            <label><input type="radio" name="to" value="self" checked> Себе</label>
            <label><input type="radio" name="to" value="other"> Другому</label>
          </div>
        </div>
        <div class="input">
          <label for="username">Username получателя (@username)</label>
          <input id="username" type="text" placeholder="@username" disabled>
        </div>
      </div>
      <div class="row cols-2">
        <div class="select">
          <label for="months">Срок подписки</label>
          <select id="months">
            <option value="" selected disabled>Выберите срок</option>
            <option value="3">3 месяца</option>
            <option value="6">6 месяцев</option>
            <option value="12">12 месяцев</option>
          </select>
        </div>
        <div class="select">
          <label for="currency">Валюта оплаты</label>
          <select id="currency">
            <option value="" selected disabled>Выберите валюту</option>
            <option value="TON">TON</option>
            <option value="RUB">RUB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      <div class="card"><div id="priceLine" class="mt-8">Цена: —</div></div>
    </div>`;}

  function starsBuyFormHTML(){return `
    <div class="form-grid">
      <div class="row cols-2">
        <div class="input">
          <label for="starsAmount">Сколько Stars купить</label>
          <input id="starsAmount" type="number" min="1" step="1" placeholder="Например, 500">
        </div>
        <div class="select">
          <label for="currency">Валюта оплаты</label>
          <select id="currency">
            <option value="" selected disabled>Выберите валюту</option>
            <option value="TON">TON</option>
            <option value="RUB">RUB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      <div class="card"><div id="priceLine" class="mt-8">Итог к оплате: —</div></div>
    </div>`;}

  function starsSellFormHTML(){return `
    <div class="form-grid">
      <div class="row cols-2">
        <div class="input">
          <label for="starsAmount">Сколько Stars продать</label>
          <input id="starsAmount" type="number" min="1" step="1" placeholder="Например, 500">
        </div>
        <div class="select">
          <label for="currency">Валюта получения</label>
          <select id="currency">
            <option value="" selected disabled>Выберите валюту</option>
            <option value="TON">TON</option>
            <option value="RUB">RUB</option>
          </select>
        </div>
      </div>
      <div class="card"><div id="priceLine" class="mt-8">Вы получите: —</div></div>
    </div>`;}

  function attachFormHandlers(){
    if(state.action==='premium_buy'){
      const radios=document.querySelectorAll('input[name="to"]');
      const username=document.getElementById('username');
      const months=document.getElementById('months');
      const currency=document.getElementById('currency');
      const priceLine=document.getElementById('priceLine');
      radios.forEach(r=>r.addEventListener('change',()=>{
        const val=document.querySelector('input[name="to"]:checked').value;
        state.form.to=val; username.disabled=(val!=='other'); updatePayButton();
      }));
      username.addEventListener('input',()=>{ state.form.username=username.value.trim(); updatePayButton(); });
      months.addEventListener('change',()=>{ state.form.months=months.value; recalc(); });
      currency.addEventListener('change',()=>{ state.form.currency=currency.value; recalc(); });
      function recalc(){
        const m=state.form.months, cur=state.form.currency;
        if(m&&cur&&PRICES.premium[m]?.[cur]!=null){
          state.form.amount=PRICES.premium[m][cur];
          priceLine.textContent=`Цена: ${state.form.amount} ${cur}`;
        } else { state.form.amount=null; priceLine.textContent='Цена: —'; }
        updatePayButton();
      }
    }
    if(state.action==='stars_buy'||state.action==='stars_sell'){
      const amount=document.getElementById('starsAmount');
      const currency=document.getElementById('currency');
      const priceLine=document.getElementById('priceLine');
      amount.addEventListener('input',()=>{ state.form.stars=parseInt(amount.value,10)||0; recalc(); });
      currency.addEventListener('change',()=>{ state.form.currency=currency.value; recalc(); });
      function recalc(){
        const stars=state.form.stars||0, cur=state.form.currency;
        if(!stars||!cur){ state.form.amount=null; priceLine.textContent=(state.action==='stars_buy')?'Итог к оплате: —':'Вы получите: —'; updatePayButton(); return; }
        const rate=(state.action==='stars_buy')?PRICES.starBuyRate[cur]:PRICES.starSellRate[cur];
        if(!rate){ state.form.amount=null; priceLine.textContent='Недоступная валюта'; }
        else { const total=+(stars*rate).toFixed(6); state.form.amount=total; priceLine.textContent=(state.action==='stars_buy')?`Итог к оплате: ${total} ${cur}`:`Вы получите: ${total} ${cur}`; }
        updatePayButton();
      }
    }
  }

  function updatePayButton(){
    let ok=false, label='Оплатить';
    if(state.action==='premium_buy'){
      const to=state.form.to||'self';
      const otherOk=(to==='self')||(to==='other' && /^@?[a-zA-Z0-9_]{5,}$/.test(state.form.username||''));
      ok=!!(otherOk && state.form.months && state.form.currency && state.form.amount!=null);
      if(ok) label=`Оплатить ${state.form.amount} ${state.form.currency}`;
    }
    if(state.action==='stars_buy'||state.action==='stars_sell'){
      ok=!!(state.form.stars>0 && state.form.currency && state.form.amount!=null);
      if(ok) label=(state.action==='stars_buy')?`Оплатить ${state.form.amount} ${state.form.currency}`:`Получить ${state.form.amount} ${state.form.currency}`;
    }
    el.payBtn.disabled=!ok; el.payBtn.textContent=label;
    try{
      if(tg){
        if(ok){ tg.MainButton.setText(label); tg.MainButton.show(); tg.MainButton.onClick(payNow); }
        else { tg.MainButton.hide(); tg.MainButton.offClick(payNow); }
      }
    }catch{}
  }

  el.payBtn.addEventListener('click', payNow);
  function payNow(){
    const {action,form}=state; if(!form?.amount) return;
    const summary={action, ...form};
    if(form.currency==='TON') alert('Откроем TON-кошелёк (заглушка).\n\n'+JSON.stringify(summary,null,2));
    else alert('Откроем платёжную страницу (заглушка).\n\n'+JSON.stringify(summary,null,2));
  }

  selectAction(null);
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'){ openSidebar(false); document.querySelectorAll('.menu,.picker-menu').forEach(m=>m.setAttribute('hidden','')); } });
  try{ const url=new URL(window.location.href); const sup=url.searchParams.get('support'); if(sup){ const u=sup.startswith('@')?sup:('@'+sup); el.supportLink.textContent=u; el.supportLink.href='https://t.me/'+u.replace('@',''); } }catch{}
})();