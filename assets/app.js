(()=> {
  const tg = window.Telegram?.WebApp;
  const urlParams = new URLSearchParams(location.search);
  const DEV_DEBUG = urlParams.get('debug') === '1';
  try { tg?.ready(); tg?.expand(); } catch {};

  /* ================= I18N ================= */
  const i18n = {
    ru: {
      lang:'RU', theme:'Тема', themeLight:'Светлая', themeDark:'Тёмная', themeAuto:'Авто',
      welcome:'Добро пожаловать на <span class="brand">Тестмаркет</span>',
      pick:'Выберите, что хотите сделать',
      actPremium:'Купить Premium', actBuyStars:'Купить Stars', actSellStars:'Продать Stars',
      placeholder:'Выберите действие, чтобы продолжить.',
      toWhom:'Кому купить Premium', self:'Себе', other:'Другому',
      yourUsername:'Ваш username',
      username:'Username получателя (@username)',
      months:'Срок подписки', currency:'Валюта оплаты', price:'Цена',
      howManyBuy:'Сколько Stars купить', howManySell:'Сколько Stars продать',
      minStarsHint:'Минимум 50 звёзд',
      payoutCurrency:'Валюта получения', payoutAddress:'Адрес для получения',
      currencyTON:'TON', currencyUSDT_TON:'USDT (TON)',
      totalPay:'Итог к оплате', youGet:'Вы получите',
      faq:'FAQ', supportTitle:'Контакты поддержки', writeSupport:'Написать в поддержку',
      errMinStars:'Минимальное количество 50 звёзд',
      errBadUsername:'Введите корректное имя пользователя',
      errPremiumActive:'Премиум уже активирован',
      noticeTransfer:'Оплата на указанный адрес пройдёт в течение нескольких минут.',
      btnPay:'Оплатить', btnTransfer:'Передать {n} звёзд'
    },
    en: {
      lang:'EN', theme:'Theme', themeLight:'Light', themeDark:'Dark', themeAuto:'Auto',
      welcome:'Welcome to <span class="brand">Testmarket</span>',
      pick:'Choose what you want to do',
      actPremium:'Buy Premium', actBuyStars:'Buy Stars', actSellStars:'Sell Stars',
      placeholder:'Select an action to continue.',
      toWhom:'Who will get Premium', self:'Myself', other:'Someone else',
      yourUsername:'Your username',
      username:'Recipient username (@username)',
      months:'Subscription period', currency:'Payment currency', price:'Price',
      howManyBuy:'How many Stars to buy', howManySell:'How many Stars to sell',
      minStarsHint:'Minimum is 50 stars',
      payoutCurrency:'Payout currency', payoutAddress:'Payout address',
      currencyTON:'TON', currencyUSDT_TON:'USDT (TON)',
      totalPay:'Total to pay', youGet:'You will receive',
      faq:'FAQ', supportTitle:'Support contacts', writeSupport:'Message support',
      errMinStars:'Minimum amount is 50 stars',
      errBadUsername:'Please enter a valid username',
      errPremiumActive:'Premium already active',
      noticeTransfer:'The payout to the specified address will be processed within a few minutes.',
      btnPay:'Pay', btnTransfer:'Transfer {n} stars'
    }
  };

  const faqI18n = {
    ru: [
      {q: 'Что такое Telegram Stars?', a: 'Внутренняя валюта Telegram для цифровых товаров и сервисов.'},
      {q: 'Как оплатить в TON?', a: 'Сейчас заглушка. Позже подключим TON Connect / кошельки.'},
      {q: 'Как оплатить картой?', a: 'Пока заглушка. Будет подключён провайдер (3-D Secure).'},
      {q: 'Сколько ждать зачисления?', a: 'Обычно секунды; в редких случаях — до 10 минут.'},
      {q: 'Оплата прошла, но ничего не получил', a: 'Напишите нам: укажите @username и время оплаты — поможем.'}
    ],
    en: [
      {q: 'What are Telegram Stars?', a: 'Telegram\'s in-app currency for digital goods and services.'},
      {q: 'How to pay with TON?', a: 'Currently a stub. We will add TON Connect / wallets later.'},
      {q: 'How to pay by card?', a: 'Stub for now. A 3-D Secure provider will be connected.'},
      {q: 'How long does it take?', a: 'Usually seconds; in rare cases up to 10 minutes.'},
      {q: 'Payment done but received nothing', a: 'Message us with your @username and payment time — we will help.'}
    ]
  };

  /* ================= STATE ================= */
  const state = {
    action: null,
    theme: localStorage.getItem('tm_theme') || 'light',
    lang:  localStorage.getItem('tm_lang')  || 'ru',
    form: {}
  };

  const PRICES = {
    premium: {
      '3':  { TON:15, RUB:1290, USD:3.99, EUR:3.59, USDT_TON:3.99 },
      '6':  { TON:28, RUB:2490, USD:7.49, EUR:6.99, USDT_TON:7.49 },
      '12': { TON:50, RUB:4590, USD:13.99, EUR:12.99, USDT_TON:13.99 }
    },
    starBuyRate:  { TON:.00002,  RUB:.12, USD:.0025, EUR:.0023, USDT_TON:.0025 },
    starSellRate: { TON:.000018, USDT_TON:.0022 } // RUB удалён по твоему запросу
  };

  /* ================= REFS ================= */
  const el = {
    root: document.documentElement,
    burgerBtn:     document.getElementById('burgerBtn'),
    sidebar:       document.getElementById('sidebar'),
    backdrop:      document.getElementById('backdrop'),
    closeSidebar:  document.getElementById('closeSidebar'),
    langBtn:       document.getElementById('langBtn'),
    langLabel:     document.getElementById('langLabel'),
    langMenu:      document.getElementById('langMenu'),
    themeBtn:      document.getElementById('themeBtn'),
    themeLabel:    document.getElementById('themeLabel'),
    themeMenu:     document.getElementById('themeMenu'),
    themeLight:    document.getElementById('themeLight'),
    themeDark:     document.getElementById('themeDark'),
    themeAuto:     document.getElementById('themeAuto'),
    welcomeTitle:  document.getElementById('welcomeTitle'),
    pickerLabel:   document.getElementById('pickerLabel'),
    actionPicker:  document.getElementById('actionPicker'),
    actionMenu:    document.getElementById('actionMenu'),
    actPremium:    document.getElementById('actPremium'),
    actBuyStars:   document.getElementById('actBuyStars'),
    actSellStars:  document.getElementById('actSellStars'),
    formArea:      document.getElementById('formArea'),
    formPlaceholder: document.getElementById('formPlaceholder'),
    faqTitle:      document.getElementById('faqTitle'),
    faqList:       document.getElementById('faqList'),
    supportTitle:  document.getElementById('supportTitle'),
    supportBtn:    document.getElementById('supportBtn'),
    notice:        document.getElementById('notice'),
    noticeText:    document.getElementById('noticeText'),
    noticeClose:   document.getElementById('noticeClose'),
    fakeBtn:       document.getElementById('fakeMainButton'),
  };

  /* =============== THEME/LANG =============== */
  function applyTheme(t){
    state.theme = t; localStorage.setItem('tm_theme', t);
    if (t==='auto'){
      const d = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      el.root.setAttribute('data-theme', d ? 'dark' : 'light');
    } else {
      el.root.setAttribute('data-theme', t);
    }
    try{
      const isDark = (el.root.getAttribute('data-theme') === 'dark');
      tg?.setHeaderColor?.(isDark ? '#0b0f14' : '#ffffff');
      tg?.setBackgroundColor?.(isDark ? '#0b0f14' : '#ffffff');
    }catch{}
  }
  applyTheme(state.theme);

  function safeSet(node, setter){ if (node) try{setter(node)}catch{} }

  function renderFAQ(){
    const list = faqI18n[state.lang] || faqI18n.ru;
    if (!el.faqList) return;
    el.faqList.innerHTML = list.map(item => (
      `<details><summary>${item.q}</summary><p>${item.a}</p></details>`
    )).join('');
  }

  function applyLang(l){
    const tx = i18n[l] || i18n.ru;
    state.lang = l; localStorage.setItem('tm_lang', l);

    // labels
    safeSet(el.langLabel,  n=> n.textContent = tx.lang);
    safeSet(el.themeLabel, n=> n.textContent = tx.theme);
    safeSet(el.themeLight, n=> n.textContent = tx.themeLight);
    safeSet(el.themeDark,  n=> n.textContent = tx.themeDark);
    safeSet(el.themeAuto,  n=> n.textContent = tx.themeAuto);

    safeSet(el.welcomeTitle,   n=> n.innerHTML   = tx.welcome);
    safeSet(el.pickerLabel,    n=> n.textContent = tx.pick);
    safeSet(el.actPremium,     n=> n.textContent = tx.actPremium);
    safeSet(el.actBuyStars,    n=> n.textContent = tx.actBuyStars);
    safeSet(el.actSellStars,   n=> n.textContent = tx.actSellStars);
    safeSet(el.formPlaceholder,n=> n.textContent = tx.placeholder);
    safeSet(el.faqTitle,       n=> n.textContent = tx.faq);
    safeSet(el.supportTitle,   n=> n.textContent = tx.supportTitle);
    safeSet(el.supportBtn,     n=> n.textContent = tx.writeSupport);
    safeSet(el.noticeText,     n=> n.textContent = tx.noticeTransfer);

    document.documentElement.setAttribute('lang', l);
    renderFAQ();

    // перерисовать активную форму на новом языке
    const current = state.action;
    state.action = null; // чтобы selectAction точно перерисовал
    if (current) selectAction(current);
    else renderForm();
  }
  applyLang(state.lang);

  /* =============== SIDEBAR =============== */
  function openSidebar(open){
    if(open){
      el.sidebar?.classList.add('open');
      el.sidebar?.setAttribute('aria-hidden','false');
      if (el.backdrop){ el.backdrop.hidden = false; el.backdrop.setAttribute('aria-open','true'); }
      try{ tg?.MainButton?.hide(); tg?.MainButton?.offClick?.(payNow); }catch{}
      hideFakeMainButton();
    }else{
      el.sidebar?.classList.remove('open');
      el.sidebar?.setAttribute('aria-hidden','true');
      el.backdrop?.removeAttribute('aria-open');
      if (el.backdrop) el.backdrop.hidden = true;
      updateMainButton();
    }
  }
  el.burgerBtn?.addEventListener('click', ()=> openSidebar(true));
  el.backdrop?.addEventListener('click', ()=> openSidebar(false));
  el.closeSidebar?.addEventListener('click', ()=> openSidebar(false));

  /* =============== MENUS =============== */
  function toggleMenu(menuEl, open){
    document.querySelectorAll('.menu').forEach(m=>{ m.setAttribute('hidden',''); m.removeAttribute('aria-open'); });
    if(open){ menuEl.removeAttribute('hidden'); menuEl.setAttribute('aria-open','true'); }
  }
  el.langBtn?.addEventListener('click', ()=>{
    const isOpen = el.langMenu?.hasAttribute('aria-open');
    toggleMenu(el.langMenu, !isOpen);
  });
  el.themeBtn?.addEventListener('click', ()=>{
    const isOpen = el.themeMenu?.hasAttribute('aria-open');
    toggleMenu(el.themeMenu, !isOpen);
  });
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.control')){
      document.querySelectorAll('.menu').forEach(m=>{ m.setAttribute('hidden',''); m.removeAttribute('aria-open'); });
    }
  });
  el.langMenu?.addEventListener('click', (e)=>{
    const btn = e.target.closest('.menu-item'); if(!btn) return;
    const l = btn.dataset.lang;
    if (l){
      el.langMenu.querySelectorAll('.menu-item').forEach(mi=>mi.classList.toggle('active', mi===btn));
      applyLang(l); toggleMenu(el.langMenu, false);
    }
  });
  el.themeMenu?.addEventListener('click', (e)=>{
    const btn = e.target.closest('.menu-item'); if(!btn) return;
    const th = btn.dataset.theme;
    if (th){ applyTheme(th); toggleMenu(el.themeMenu, false); }
  });

  /* =============== ACTION PICKER =============== */
  function togglePicker(){
    const open = !el.actionMenu?.hasAttribute('aria-open');
    if(open){ el.actionMenu.removeAttribute('hidden'); el.actionMenu.setAttribute('aria-open','true'); }
    else    { el.actionMenu.removeAttribute('aria-open'); el.actionMenu.setAttribute('hidden',''); }
  }
  el.actionPicker?.addEventListener('click', togglePicker);
  el.actionMenu?.addEventListener('click', (e)=>{
    const it = e.target.closest('.picker-item'); if(!it) return;
    selectAction(it.dataset.action);
    el.actionMenu.removeAttribute('aria-open'); el.actionMenu.setAttribute('hidden','');
  });

  function selectAction(act){
    state.action = act; state.form = {};
    renderForm(); updateMainButton();
  }
  function tx(){ return i18n[state.lang] || i18n.ru; }

  /* =============== FORMS =============== */
  function renderForm(){
    const w = el.formArea;
    if (!w) return;
    w.classList.remove('placeholder');
    if (state.action === 'premium_buy')      w.innerHTML = premiumFormHTML();
    else if (state.action === 'stars_buy')   w.innerHTML = starsBuyFormHTML();
    else if (state.action === 'stars_sell')  w.innerHTML = starsSellFormHTML();
    else {
      w.classList.add('placeholder');
      w.innerHTML = `<p>${tx().placeholder}</p>`;
      try{ tg?.MainButton?.hide(); tg?.MainButton?.offClick?.(payNow); }catch{}
      hideFakeMainButton();
      return;
    }
    attachFormHandlers();
  }

  function premiumFormHTML(){
    const t = tx();
    const me = (tg?.initDataUnsafe?.user?.username) ? '@' + tg.initDataUnsafe.user.username : (state.lang==='ru' ? '(в Telegram)' : '(in Telegram)');
    return `
      <div class="form-grid">
        <div class="row cols-2">
          <div class="radio-group">
            <label>${t.toWhom}</label>
            <div class="radio-line">
              <label><input type="radio" name="to" value="self" checked> ${t.self}</label>
              <label><input type="radio" name="to" value="other"> ${t.other}</label>
            </div>
          </div>
          <div class="input">
            <label for="username">${t.username}</label>
            <input id="username" type="text" placeholder="@username" disabled>
            <div class="help" id="yourNameHint">${t.yourUsername}: ${me}</div>
            <div class="error" id="userErr" hidden></div>
          </div>
        </div>
        <div class="row cols-2">
          <div class="select">
            <label for="months">${t.months}</label>
            <select id="months">
              <option value="" selected disabled>—</option>
              <option value="3">3</option>
              <option value="6">6</option>
              <option value="12">12</option>
            </select>
          </div>
          <div class="select">
            <label for="currency">${t.currency}</label>
            <select id="currency">
              <option value="" selected disabled>—</option>
              <option value="TON">${t.currencyTON}</option>
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="USDT_TON">${t.currencyUSDT_TON}</option>
            </select>
          </div>
        </div>
        <div class="card"><div id="priceLine" class="mt-8">${t.price}: —</div></div>
      </div>`;
  }

  function starsBuyFormHTML(){
    const t = tx();
    return `
      <div class="form-grid">
        <div class="row cols-2">
          <div class="input">
            <label for="starsAmount">${t.howManyBuy}</label>
            <input id="starsAmount" type="number" min="1" step="1" placeholder="500">
          </div>
          <div class="select">
            <label for="currency">${t.currency}</label>
            <select id="currency">
              <option value="" selected disabled>—</option>
              <option value="TON">${t.currencyTON}</option>
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="USDT_TON">${t.currencyUSDT_TON}</option>
            </select>
          </div>
        </div>
        <div class="card"><div id="priceLine" class="mt-8">${t.totalPay}: —</div></div>
      </div>`;
  }

  function starsSellFormHTML(){
    const t = tx();
    return `
      <div class="form-grid">
        <div class="row cols-2">
          <div class="input">
            <label for="starsAmount">${t.howManySell}</label>
            <input id="starsAmount" type="number" min="1" step="1" placeholder="500">
            <div class="help">${t.minStarsHint}</div>
            <div class="error" id="sellErr" hidden></div>
          </div>
          <div class="select">
            <label for="currency">${t.payoutCurrency}</label>
            <select id="currency">
              <option value="" selected disabled>—</option>
              <option value="TON">${t.currencyTON}</option>
              <option value="USDT_TON">${t.currencyUSDT_TON}</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="input" id="addressRow" hidden>
            <label for="payoutAddress">${t.payoutAddress}</label>
            <input id="payoutAddress" type="text" placeholder="ton:// or 0:...">
          </div>
        </div>
        <div class="card"><div id="priceLine" class="mt-8">${t.youGet}: —</div></div>
      </div>`;
  }

  function attachFormHandlers(){
    if (state.action === 'premium_buy'){
      const radios   = document.querySelectorAll('input[name="to"]');
      const username = document.getElementById('username');
      const months   = document.getElementById('months');
      const currency = document.getElementById('currency');
      const priceLine= document.getElementById('priceLine');
      const userErr  = document.getElementById('userErr');
      const yourHint = document.getElementById('yourNameHint');

      function validateUsername(value){
        if (!value || !/^@?[a-zA-Z0-9_]{5,}$/.test(value)) {
          userErr.textContent = tx().errBadUsername;
          userErr.hidden = false;
          return false;
        }
        userErr.hidden = true;
        return true;
      }

      async function checkPremiumActiveMock(un){
        await new Promise(r=>setTimeout(r,120));
        return false; // заглушка
        // TODO: подключим реальный бекенд: return fetch('/api/checkPremium', { ... })
      }

      radios.forEach(r=>r.addEventListener('change', async ()=>{
        const val = document.querySelector('input[name="to"]:checked').value;
        state.form.to = val;
        if (username) username.disabled = (val!=='other');
        if (val === 'self'){ userErr.hidden = true; if (yourHint) yourHint.style.display = 'block'; }
        else { if (yourHint) yourHint.style.display = 'none'; }
        updateMainButton();
      }));

      username?.addEventListener('input', async ()=>{
        state.form.username = username.value.trim();
        const ok = validateUsername(state.form.username);
        if (ok){
          const active = await checkPremiumActiveMock(state.form.username);
          if (active){ userErr.textContent = tx().errPremiumActive; userErr.hidden = false; }
          else userErr.hidden = true;
        }
        updateMainButton();
      });

      function recalcPrice(){
        const m   = state.form.months;
        const cur = state.form.currency;
        const t   = tx();
        if (m && cur && PRICES.premium[m]?.[cur] != null){
          state.form.amount = PRICES.premium[m][cur];
          priceLine.textContent = `${t.price}: ${state.form.amount} ${String(cur).replace('_TON','')}`;
        } else {
          state.form.amount = null;
          priceLine.textContent = `${t.price}: —`;
        }
        updateMainButton();
      }

      months?.addEventListener('change', ()=>{ state.form.months = months.value; recalcPrice(); });
      currency?.addEventListener('change', ()=>{ state.form.currency = currency.value; recalcPrice(); });
    }

    if (state.action === 'stars_buy'){
      const amount   = document.getElementById('starsAmount');
      const currency = document.getElementById('currency');
      const priceLine= document.getElementById('priceLine');

      function recalc(){
        const stars = parseInt(amount?.value ?? '0', 10) || 0;
        state.form.stars = stars;
        const cur = state.form.currency;
        const t   = tx();
        if (!stars || !cur){
          state.form.amount = null;
          priceLine.textContent = `${t.totalPay}: —`;
          updateMainButton(); return;
        }
        const rate = PRICES.starBuyRate[cur];
        if (!rate){ state.form.amount = null; priceLine.textContent = '—'; }
        else {
          const total = +(stars * rate).toFixed(6);
          state.form.amount = total;
          priceLine.textContent = `${t.totalPay}: ${total} ${String(cur).replace('_TON','')}`;
        }
        updateMainButton();
      }

      amount?.addEventListener('input', ()=> recalc());
      currency?.addEventListener('change', ()=>{ state.form.currency = currency.value; recalc(); });
    }

    if (state.action === 'stars_sell'){
      const amount   = document.getElementById('starsAmount');
      const currency = document.getElementById('currency');
      const priceLine= document.getElementById('priceLine');
      const addrRow  = document.getElementById('addressRow');
      const addrInp  = document.getElementById('payoutAddress');
      const sellErr  = document.getElementById('sellErr');

      function validate(){
        const t = tx();
        const stars = parseInt(amount?.value ?? '0', 10) || 0;
        const cur = state.form.currency;
        const addr = (addrInp?.value || '').trim();
        let ok = true;
        if (stars < 50){ sellErr.textContent = t.errMinStars; sellErr.hidden = false; ok = false; }
        else sellErr.hidden = true;
        if (!cur) ok = false;
        if (cur && addrRow && !addrRow.hidden){ if (!addr) ok = false; }
        return ok;
      }

      function recalc(){
        const t = tx();
        const stars = parseInt(amount?.value ?? '0', 10) || 0;
        state.form.stars = stars;
        const cur = state.form.currency;
        if (!stars || !cur){
          state.form.amount = null;
          priceLine.textContent = `${t.youGet}: —`;
          updateMainButton(); return;
        }
        const rate = PRICES.starSellRate[cur];
        if (!rate){ state.form.amount = null; priceLine.textContent = '—'; }
        else {
          const total = +(stars * rate).toFixed(6);
          state.form.amount = total;
          priceLine.textContent = `${t.youGet}: ${total} ${String(cur).replace('_TON','')}`;
        }
        updateMainButton();
      }

      amount?.addEventListener('input', ()=>{ validate(); recalc(); });
      currency?.addEventListener('change', ()=>{
        state.form.currency = currency.value;
        if (addrRow){
          addrRow.hidden = !state.form.currency; // показываем после выбора валюты
          if (addrInp){
            addrInp.placeholder = (state.form.currency==='TON')
              ? 'ton:// or 0:...'
              : (state.lang==='ru' ? 'Адрес USDT (TON)' : 'USDT (TON) address');
          }
        }
        validate(); recalc();
      });
      addrInp?.addEventListener('input', ()=>{ state.form.address = addrInp.value.trim(); updateMainButton(); });
    }
  }

  /* =============== MAIN BUTTON / FAKE =============== */
  let fakeBtn = null;
  function ensureFakeBtn(){
    if (fakeBtn) return fakeBtn;
    fakeBtn = el.fakeBtn || document.createElement('button');
    fakeBtn.id = 'fakeMainButton';
    document.body.appendChild(fakeBtn);
    fakeBtn.addEventListener('click', payNow);
    return fakeBtn;
  }
  function showFakeMainButton(text){
    const btn = ensureFakeBtn();
    btn.textContent = text || tx().btnPay;
    btn.style.display = 'block';
  }
  function hideFakeMainButton(){ if (fakeBtn) fakeBtn.style.display = 'none'; }

  function updateMainButton(){
    const t = tx();
    let ok = false, label = t.btnPay;

    if (state.action === 'premium_buy'){
      const to = state.form.to || 'self';
      const usernameOk = (to==='self') || (to==='other' && /^@?[a-zA-Z0-9_]{5,}$/.test(state.form.username||''));
      ok = !!(usernameOk && state.form.months && state.form.currency && state.form.amount != null);
      if (ok) label = (state.lang==='ru') ? `Оплатить ${state.form.amount} ${String(state.form.currency).replace('_TON','')}`
                                          : `Pay ${state.form.amount} ${String(state.form.currency).replace('_TON','')}`;
    }

    if (state.action === 'stars_buy'){
      ok = !!(state.form.stars > 0 && state.form.currency && state.form.amount != null);
      if (ok) label = (state.lang==='ru') ? `Оплатить ${state.form.amount} ${String(state.form.currency).replace('_TON','')}`
                                          : `Pay ${state.form.amount} ${String(state.form.currency).replace('_TON','')}`;
    }

    if (state.action === 'stars_sell'){
      const isValid = (state.form.stars >= 50) && !!state.form.currency &&
                      (!document.getElementById('addressRow')?.hidden ? !!(state.form.address && state.form.address.length>5) : true);
      ok = isValid && state.form.amount != null;
      if (ok) label = (t.btnTransfer || 'Передать {n} звёзд').replace('{n}', state.form.stars);
    }

    try{
      if (tg){
        if (ok && el.sidebar?.getAttribute('aria-hidden')!=='false'){
          tg.MainButton.offClick?.(payNow);
          tg.MainButton.setText(label);
          tg.MainButton.show();
          tg.MainButton.onClick(payNow);
        } else {
          tg.MainButton.hide();
          tg.MainButton.offClick?.(payNow);
        }
      } else if (DEV_DEBUG){
        if (ok && el.sidebar?.getAttribute('aria-hidden')!=='false') showFakeMainButton(label);
        else hideFakeMainButton();
      }
    }catch{}
  }

  /* =============== NOTICE + PAY =============== */
  function showNotice(msg){
    if (!el.notice) return;
    el.noticeText.textContent = msg || tx().noticeTransfer;
    el.notice.removeAttribute('hidden');
  }
  el.noticeClose?.addEventListener('click', ()=> el.notice?.setAttribute('hidden',''));

  function payNow(){
    const {action, form} = state;
    if (!form) return;

    if (action === 'stars_sell'){
      showNotice(tx().noticeTransfer);
      return;
    }

    const summary = { action, ...form };
    if (form.currency === 'TON')
      alert((state.lang==='ru' ? 'Откроем TON-кошелёк (заглушка).' : 'Open TON wallet (stub).') + '\n\n' + JSON.stringify(summary, null, 2));
    else
      alert((state.lang==='ru' ? 'Откроем платёжную страницу (заглушка).' : 'Open payment page (stub).') + '\n\n' + JSON.stringify(summary, null, 2));
  }

  /* =============== SUPPORT BTN =============== */
  (function setupSupport(){
    let supportUsername = 'fightingkitty';
    let supportUrl = 'https://t.me/' + supportUsername;
    try{
      const url = new URL(window.location.href);
      const sup = url.searchParams.get('support');
      if (sup){ supportUsername = sup.replace(/^@/, ''); supportUrl = 'https://t.me/' + supportUsername; }
    }catch{}
    el.supportBtn?.addEventListener('click', ()=>{
      if (tg?.openTelegramLink) tg.openTelegramLink(supportUrl);
      else window.open(supportUrl, '_blank');
    });
  })();

  // init
  renderFAQ();
  selectAction(null);
  document.addEventListener('keydown', (e)=>{
    if (e.key==='Escape'){
      openSidebar(false);
      document.querySelectorAll('.menu').forEach(m=>{ m.setAttribute('hidden',''); m.removeAttribute('aria-open'); });
      el.actionMenu?.setAttribute('hidden',''); el.actionMenu?.removeAttribute('aria-open');
    }
  });
})();
