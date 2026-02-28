/* ============================================
   POSTIR — App Logic
   ============================================ */

'use strict';

// ---- CONFIG ----
const CONFIG = {
  freeLimit: 5,
  apiEndpoint: '/api/generate',
  paymentEndpoint: '/api/payment',
};

// ---- STATE ----
const state = {
  usageCount: parseInt(localStorage.getItem('postir_usage') || '0', 10),
  isPro: localStorage.getItem('postir_pro') === 'true',
  selectedTone: 'casual',
  currentPlan: null,
  currentPrice: null,
  isGenerating: false,
};

// ---- DOM REFS ----
const $ = id => document.getElementById(id);

const dom = {
  header:           $('siteHeader'),
  hamburger:        $('hamburger'),
  headerNav:        $('headerNav'),
  businessDesc:     $('businessDesc'),
  descCount:        $('descCount'),
  postType:         $('postType'),
  platform:         $('platform'),
  toneGrid:         $('toneGrid'),
  customHashtags:   $('customHashtags'),
  generateBtn:      $('generateBtn'),
  btnText:          document.querySelector('#generateBtn .btn-text'),
  btnLoading:       document.querySelector('#generateBtn .btn-loading'),
  freeCounterText:  $('freeCounterText'),
  freeCounter:      $('freeCounter'),
  outputPlaceholder:$('outputPlaceholder'),
  outputContent:    $('outputContent'),
  outputLoading:    $('outputLoading'),
  outputActions:    $('outputActions'),
  platformBadge:    $('platformBadge'),
  generatedText:    $('generatedText'),
  hashtagsSection:  $('hashtagsSection'),
  emojiSection:     $('emojiSection'),
  copyBtn:          $('copyBtn'),
  regenerateBtn:    $('regenerateBtn'),

  upgradeModal:     $('upgradeModal'),
  closeUpgradeModal:$('closeUpgradeModal'),
  cancelUpgradeBtn: $('cancelUpgradeBtn'),
  upgradeToProBtn:  $('upgradeToProBtn'),

  paymentModal:     $('paymentModal'),
  closePaymentModal:$('closePaymentModal'),
  paymentSummary:   $('paymentSummary'),
  payEmail:         $('payEmail'),
  payName:          $('payName'),
  confirmPayBtn:    $('confirmPayBtn'),

  successModal:     $('successModal'),
  successModalBody: $('successModalBody'),
  closeSuccessModal:$('closeSuccessModal'),
};

// ---- INIT ----
function init() {
  updateFreeCounter();
  setupEventListeners();
  setupScrollHeader();
}

// ---- SCROLL HEADER ----
function setupScrollHeader() {
  const handler = () => {
    dom.header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', handler, { passive: true });
}

// ---- FREE COUNTER ----
function updateFreeCounter() {
  if (state.isPro) {
    dom.freeCounter.style.display = 'none';
    return;
  }
  const remaining = Math.max(0, CONFIG.freeLimit - state.usageCount);
  dom.freeCounterText.innerHTML = `لديك <strong>${remaining}</strong> استخدامات مجانية`;
}

// ---- EVENT LISTENERS ----
function setupEventListeners() {
  // Char counter
  dom.businessDesc.addEventListener('input', () => {
    const len = dom.businessDesc.value.length;
    dom.descCount.textContent = len;
    if (len > 500) dom.businessDesc.value = dom.businessDesc.value.slice(0, 500);
  });

  // Tone buttons
  dom.toneGrid.addEventListener('click', e => {
    const btn = e.target.closest('.tone-btn');
    if (!btn) return;
    dom.toneGrid.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedTone = btn.dataset.tone;
  });

  // Generate
  dom.generateBtn.addEventListener('click', handleGenerate);

  // Copy
  dom.copyBtn.addEventListener('click', handleCopy);

  // Regenerate
  dom.regenerateBtn.addEventListener('click', handleGenerate);

  // Hamburger
  dom.hamburger.addEventListener('click', () => {
    dom.headerNav.classList.toggle('open');
  });

  // Close nav on link click
  dom.headerNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => dom.headerNav.classList.remove('open'));
  });

  // Modals
  dom.closeUpgradeModal.addEventListener('click', closeUpgradeModal);
  dom.cancelUpgradeBtn.addEventListener('click', closeUpgradeModal);
  dom.upgradeToProBtn.addEventListener('click', () => openPaymentModal('pro', 49));
  dom.closePaymentModal.addEventListener('click', closePaymentModal);
  dom.confirmPayBtn.addEventListener('click', handlePayment);
  dom.closeSuccessModal.addEventListener('click', closeSuccessModal);

  // Plan buttons
  document.querySelectorAll('.plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      const price = parseInt(btn.dataset.price || '0', 10);
      if (plan === 'free') {
        document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
      } else {
        openPaymentModal(plan, price);
      }
    });
  });

  // Click outside modal
  [dom.upgradeModal, dom.paymentModal, dom.successModal].forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}

// ---- GENERATE ----
async function handleGenerate() {
  const desc = dom.businessDesc.value.trim();
  if (!desc) {
    showToast('⚠️ أدخل وصف نشاطك أولاً');
    dom.businessDesc.focus();
    return;
  }
  if (desc.length < 20) {
    showToast('⚠️ الوصف قصير جداً، أضف تفاصيل أكثر');
    return;
  }

  // Check usage limit
  if (!state.isPro && state.usageCount >= CONFIG.freeLimit) {
    openUpgradeModal();
    return;
  }

  if (state.isGenerating) return;
  state.isGenerating = true;

  setGeneratingUI(true);

  try {
    const payload = {
      description: desc,
      postType:    dom.postType.value,
      platform:    dom.platform.value,
      tone:        state.selectedTone,
      hashtags:    dom.customHashtags.value.trim(),
    };

    const response = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    displayResult(data, dom.platform.value);

    // Increment usage
    state.usageCount++;
    localStorage.setItem('postir_usage', state.usageCount);
    updateFreeCounter();

  } catch (err) {
    console.error('Generate error:', err);
    showToast('❌ حدث خطأ، حاول مرة أخرى');
    resetOutputUI();
  } finally {
    state.isGenerating = false;
    setGeneratingUI(false);
  }
}

function setGeneratingUI(loading) {
  dom.generateBtn.disabled = loading;
  dom.btnText.style.display  = loading ? 'none'  : '';
  dom.btnLoading.style.display = loading ? '' : 'none';

  dom.outputPlaceholder.style.display = 'none';
  dom.outputContent.style.display     = 'none';
  dom.outputLoading.style.display     = loading ? 'flex' : 'none';
  dom.outputActions.style.display     = 'none';
}

function resetOutputUI() {
  dom.outputPlaceholder.style.display = '';
  dom.outputContent.style.display     = 'none';
  dom.outputLoading.style.display     = 'none';
  dom.outputActions.style.display     = 'none';
}

function displayResult(data, platform) {
  const platformLabels = {
    instagram: '📸 إنستغرام',
    twitter:   '🐦 تويتر/X',
    tiktok:    '🎵 تيك توك',
    snapchat:  '👻 سناب شات',
  };

  dom.platformBadge.textContent = platformLabels[platform] || platform;

  dom.generatedText.textContent = data.text || '';

  // Hashtags
  dom.hashtagsSection.innerHTML = '';
  const tags = (data.hashtags || []).slice(0, 10);
  tags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'hashtag-chip';
    chip.textContent = tag.startsWith('#') ? tag : `#${tag}`;
    dom.hashtagsSection.appendChild(chip);
  });

  // Emojis
  dom.emojiSection.textContent = (data.emojis || []).join(' ');

  dom.outputLoading.style.display   = 'none';
  dom.outputContent.style.display   = 'flex';
  dom.outputActions.style.display   = 'flex';
  dom.outputPlaceholder.style.display = 'none';
}

// ---- COPY ----
async function handleCopy() {
  const text = dom.generatedText.textContent;
  const hashtags = [...dom.hashtagsSection.querySelectorAll('.hashtag-chip')]
    .map(c => c.textContent).join(' ');
  const full = [text, hashtags].filter(Boolean).join('\n\n');

  try {
    await navigator.clipboard.writeText(full);
    showToast('✅ تم النسخ!');
  } catch {
    showToast('⚠️ تعذّر النسخ التلقائي');
  }
}

// ---- MODALS ----
function openUpgradeModal() { dom.upgradeModal.classList.add('active'); }
function closeUpgradeModal() { dom.upgradeModal.classList.remove('active'); }

function openPaymentModal(plan, price) {
  state.currentPlan  = plan;
  state.currentPrice = price;

  const labels = { pro: 'برو', business: 'بزنس' };
  dom.paymentSummary.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span>خطة ${labels[plan] || plan}</span>
      <strong style="color:var(--clr-lime)">${price} ريال/شهر</strong>
    </div>
  `;

  closeUpgradeModal();
  dom.paymentModal.classList.add('active');
}
function closePaymentModal() { dom.paymentModal.classList.remove('active'); }

async function handlePayment() {
  const email = dom.payEmail.value.trim();
  const name  = dom.payName.value.trim();

  if (!email || !name) {
    showToast('⚠️ أدخل البريد الإلكتروني والاسم');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('⚠️ البريد الإلكتروني غير صحيح');
    return;
  }

  dom.confirmPayBtn.disabled = true;
  dom.confirmPayBtn.textContent = '⏳ جاري المعالجة...';

  try {
    const res = await fetch(CONFIG.paymentEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan:   state.currentPlan,
        price:  state.currentPrice,
        email,
        name,
        currency: 'SAR',
      }),
    });

    const data = await res.json();

    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else if (data.success) {
      activatePro();
    } else {
      throw new Error(data.error || 'Payment failed');
    }
  } catch (err) {
    console.error('Payment error:', err);
    showToast('❌ فشلت عملية الدفع، حاول مرة أخرى');
  } finally {
    dom.confirmPayBtn.disabled = false;
    dom.confirmPayBtn.textContent = 'الدفع بـ Airwallex';
  }
}

function activatePro() {
  state.isPro = true;
  localStorage.setItem('postir_pro', 'true');
  closePaymentModal();
  const labels = { pro: 'برو', business: 'بزنس' };
  const postsMap = { pro: '١٠٠', business: 'غير محدود' };
  dom.successModalBody.textContent =
    `مرحباً بك في خطة ${labels[state.currentPlan] || state.currentPlan}. تمتع الآن بـ ${postsMap[state.currentPlan] || ''} بوست شهرياً.`;
  dom.successModal.classList.add('active');
  updateFreeCounter();
}

function closeSuccessModal() {
  dom.successModal.classList.remove('active');
  document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
}

// ---- TOAST ----
let toastTimer;
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---- BOOT ----
document.addEventListener('DOMContentLoaded', init);