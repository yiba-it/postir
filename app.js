/* ============================================
   POSTIR — App Logic
   ============================================ */

(function () {
  'use strict';

  const CGI_BIN = '/api';

  /* ---------- Translations ---------- */
  const T = {
    ar: {
      nav_how: 'كيف يعمل',
      nav_generate: 'المولّد',
      nav_features: 'المميزات',
      nav_pricing: 'الأسعار',
      hero_line1: 'وفّر 3,000 ريال شهرياً',
      hero_line2: 'على صناعة المحتوى',
      hero_line3: 'لأصحاب المشاريع والمتاجر السعودية',
      hero_sub: 'بدل مصمم محتوى بـ 3,000 ريال — بوستر يجهّز 30 بوست باللهجة الخليجية بـ 10 ريال فقط.',
      hero_icp: 'مطاعم، صالونات، متاجر، عقارات — كلهم يستخدمون بوستر',
      hero_cta: 'جرّب 3 بوستات مجاناً',
      trust_no_signup: 'بدون تسجيل أو بطاقة ائتمان',
      trust_seconds: 'جاهز خلال ثوانٍ',
      trust_dialect: 'لهجة خليجية أصيلة',
      how_tag: 'الخطوات',
      how_title: 'كيف يعمل بوستر؟',
      how_desc: 'من الصفر لـ 30 بوست جاهز في أقل من دقيقة',
      step1_title: 'وصّف نشاطك',
      step1_desc: 'أدخل اسم نشاطك التجاري ونوعه وجمهورك المستهدف. بوستر يفهم السوق السعودي ويتكيف مع مجالك.',
      step2_title: 'الذكاء الاصطناعي يشتغل',
      step2_desc: 'خوارزمياتنا تحلل السوق السعودي وتنشئ محتوى مخصص بلهجتك، مع هاشتاقات رائجة ومناسبات سعودية.',
      step3_title: 'انشر واستمتع',
      step3_desc: 'استلم المحتوى جاهز لكل منصة: انستقرام، تويتر، سناب شات، تيك توك والمزيد. انسخ وانشر مباشرة!',
      gen_tag: 'المولّد',
      gen_title: 'اصنع محتواك الآن',
      gen_desc: 'أدخل بيانات نشاطك وخلّ الذكاء الاصطناعي يسوي الباقي',
      form_name_label: 'اسم النشاط التجاري',
      form_name_placeholder: 'مثال: مطعم الديرة',
      form_type_label: 'نوع النشاط',
      form_type_placeholder: 'اختر نوع النشاط',
      type_restaurant: 'مطعم / كافيه',
      type_retail: 'متجر / تجزئة',
      type_salon: 'صالون / تجميل',
      type_realestate: 'عقارات',
      type_tech: 'تقنية / برمجيات',
      type_health: 'صحة / طب',
      type_education: 'تعليم / تدريب',
      type_tourism: 'سياحة / سفر',
      type_fitness: 'رياضة / لياقة',
      type_other: 'أخرى',
      form_audience_label: 'الجمهور المستهدف',
      form_audience_placeholder: 'مثال: عائلات سعودية في الرياض',
      form_platforms_label: 'المنصات',
      form_tone_label: 'نبرة المحتوى',
      tone_friendly: 'ودّي وقريب',
      tone_professional: 'احترافي ورسمي',
      tone_humorous: 'فكاهي ومرح',
      tone_inspirational: 'ملهم وتحفيزي',
      tone_luxury: 'فاخر وراقي',
      form_lang_label: 'لغة المحتوى',
      lang_both: 'عربي + إنجليزي',
      lang_ar: 'عربي فقط',
      lang_en: 'إنجليزي فقط',
      form_posts_label: 'عدد البوستات',
      form_generate: 'اصنع المحتوى',
      loading_text: 'الذكاء الاصطناعي يصنع محتواك...',
      loading_sub: 'يتم تحليل السوق وكتابة محتوى مخصص لنشاطك',
      results_title: 'المحتوى جاهز!',
      results_new: 'طلب جديد',
      upsell_title: 'عجبك المحتوى؟ احصل على 30 بوست كامل!',
      upsell_desc: 'النسخة التجريبية تعطيك 3 بوستات. اشترك واحصل على محتوى شهر كامل بـ 10 ريال فقط.',
      upsell_cta: 'شوف الأسعار',
      trusted_label: 'موثوق من قبل أنشطة تجارية سعودية',
      testimonial1_text: '"وفّر علينا وقت كثير! المحتوى يجي جاهز بلهجتنا وما يحتاج تعديل. ممتاز للمطاعم."',
      testimonial1_name: 'فهد العتيبي',
      testimonial1_role: 'صاحب مطعم - الرياض',
      testimonial2_text: '"كنت أدفع لمصمم محتوى 3000 ريال شهرياً. الحين بـ 10 ريال أحصل على نفس الجودة أو أفضل!"',
      testimonial2_name: 'نورة القحطاني',
      testimonial2_role: 'صاحبة متجر إلكتروني - جدة',
      testimonial3_text: '"أكثر شي عجبني إنه يعرف المناسبات السعودية ويجهز محتوى مناسب. خدمة ذكية فعلاً."',
      testimonial3_name: 'عبدالله الشمري',
      testimonial3_role: 'مدير تسويق - الدمام',
      feat_tag: 'المميزات',
      feat_title: 'ليش بوستر مختلف؟',
      feat_desc: 'صُمم خصيصاً للسوق السعودي - مو مجرد ترجمة',
      feat1_title: 'جمهورك يحس إنك تكلمه شخصياً',
      feat1_desc: 'المحتوى يُكتب باللهجة السعودية الحقيقية — مو فصحى جامدة ولا ترجمة آلية. كلام طبيعي يبني ثقة مع متابعينك.',
      feat2_title: 'وصول أكبر لجمهورك السعودي',
      feat2_desc: 'هاشتاقات رائجة ومحلية تُضاف تلقائياً — تزيد مشاهداتك وتوصلك للجمهور الصح.',
      feat3_title: 'ما يفوتك أي مناسبة سعودية',
      feat3_desc: 'رمضان، اليوم الوطني، يوم التأسيس — محتوى جاهز لكل مناسبة يهتم فيها جمهورك.',
      feat4_title: 'استهدف كل جمهورك بلغته',
      feat4_desc: 'عربي وإنجليزي في نفس الوقت — وصّل رسالتك لكل عميل باللغة اللي يفضّلها.',
      feat5_title: 'بوست واحد لكل منصاتك',
      feat5_desc: 'انستقرام، تويتر، سناب، تيك توك، لينكدإن وفيسبوك — كل منصة بأسلوبها المناسب تلقائياً.',
      feat6_title: 'رمضان على الأبواب — محتواك جاهز؟',
      feat6_desc: 'محتوى رمضاني مخصص مع تهاني وعروض مناسبة للشهر الكريم. جهّز محتواك قبل لا يبدأ.',
      price_tag: 'الأسعار',
      price_title: 'خطط بسيطة وواضحة',
      price_desc: 'ادفع حسب احتياجك - بدون التزامات',
      plan_free_name: 'تجربة مجانية',
      plan_free_sub: 'جرّب قبل ما تشتري',
      price_sar: 'ر.س',
      plan_free_f1: '3 بوستات تجريبية',
      plan_free_f2: 'منصتين',
      plan_free_f3: 'بدون تسجيل',
      plan_free_cta: 'جرّب الحين',
      popular_badge: 'الأكثر طلباً',
      plan_ppu_name: 'باقة البداية',
      plan_ppu_sub: '1 ريال فقط لكل بوست',
      plan_ppu_f1: '10 بوستات',
      plan_ppu_f2: 'كل المنصات',
      plan_ppu_f3: 'عربي + إنجليزي',
      plan_ppu_f4: 'هاشتاقات ذكية',
      plan_ppu_cta: 'اشتري الحين',
      plan_ppu_note: 'دفع لمرة واحدة - بدون اشتراك',
      pro_badge: 'PRO',
      plan_pro_name: 'الباقة الشهرية',
      plan_pro_sub: 'وفّر أكثر من 2,900 ريال شهرياً',
      price_month: '/شهر',
      plan_pro_f1: 'بوستات غير محدودة',
      plan_pro_f2: 'كل المنصات',
      plan_pro_f3: 'عربي + إنجليزي',
      plan_pro_f4: 'هاشتاقات ذكية',
      plan_pro_f5: 'تقويم مناسبات سعودية',
      plan_pro_f6: 'أولوية في التوليد',
      plan_pro_cta: 'اشترك الحين',
      plan_pro_note: 'إلغاء في أي وقت',
      payment_loading: 'جاري تجهيز الدفع...',
      payment_error: 'حدث خطأ في الدفع. يرجى المحاولة مرة أخرى.',
      footer_tagline: 'محتوى ذكي للأنشطة التجارية السعودية',
      footer_product: 'منتج من',
      footer_made: 'صُنع في السعودية',
      footer_pdpl: 'متوافق مع نظام حماية البيانات الشخصية (PDPL). بياناتك آمنة ولا نشاركها مع أي طرف ثالث.',
      compare_tag: 'المقارنة',
      compare_title: 'ليش ما تستخدم الحلول الثانية؟',
      compare_desc: 'شوف الفرق بنفسك',
      price_anchor: 'مصمم محتوى = 3,000+ ريال/شهر',
      faq_tag: 'أسئلة شائعة',
      faq_title: 'عندك سؤال؟',
      faq1_q: 'وش إذا المحتوى ما عجبني؟',
      faq1_a: 'جرّب 3 بوستات مجاناً بدون تسجيل أو بطاقة ائتمان. إذا ما عجبك، ما تخسر شي.',
      faq2_q: 'ليش ما أستخدم ChatGPT بداله؟',
      faq2_a: 'ChatGPT يكتب بالفصحى ويحتاج تعديل. بوستر مصمم للسوق السعودي — لهجة خليجية، هاشتاقات، ومحتوى جاهز لكل منصة.',
      faq3_q: 'بياناتي آمنة؟',
      faq3_a: 'متوافق مع PDPL. بياناتك لا تُخزّن. الدفع آمن عبر Airwallex.',
      faq4_q: 'كم بوست أقدر أسوي بالنسخة المجانية؟',
      faq4_a: '3 بوستات لمنصتين. إذا عجبك، باقة البداية تعطيك 10 بوستات بـ 10 ريال.',
      copy_ar: 'نسخ العربي',
      copy_en: 'نسخ الإنجليزي',
      copied: 'تم النسخ!',
      day_label: 'يوم',
      error_platforms: 'الرجاء اختيار منصة واحدة على الأقل',
      error_api: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    },
    en: {
      nav_how: 'How It Works',
      nav_generate: 'Generator',
      nav_features: 'Features',
      nav_pricing: 'Pricing',
      hero_line1: 'Save 3,000 SAR Monthly',
      hero_line2: 'On Content Creation',
      hero_line3: 'For Saudi Business Owners',
      hero_sub: 'Instead of paying a content creator 3,000 SAR — Postir generates 30 posts in Gulf dialect for just 10 SAR.',
      hero_icp: 'Restaurants, salons, stores, real estate — they all use Postir',
      hero_cta: 'Try 3 Posts Free',
      trust_no_signup: 'No signup or credit card',
      trust_seconds: 'Ready in seconds',
      trust_dialect: 'Authentic Gulf dialect',
      how_tag: 'Steps',
      how_title: 'How Does Postir Work?',
      how_desc: 'From zero to 30 ready posts in less than a minute',
      step1_title: 'Describe Your Business',
      step1_desc: 'Enter your business name, type, and target audience. Postir understands the Saudi market and adapts to your industry.',
      step2_title: 'AI Gets to Work',
      step2_desc: 'Our algorithms analyze the Saudi market and create tailored content in your dialect, with trending hashtags and Saudi events.',
      step3_title: 'Publish & Enjoy',
      step3_desc: 'Get ready-to-post content for every platform: Instagram, X, Snapchat, TikTok, and more. Copy and post directly!',
      gen_tag: 'Generator',
      gen_title: 'Create Your Content Now',
      gen_desc: 'Enter your business details and let AI do the rest',
      form_name_label: 'Business Name',
      form_name_placeholder: 'e.g. Al Deira Restaurant',
      form_type_label: 'Business Type',
      form_type_placeholder: 'Select business type',
      type_restaurant: 'Restaurant / Cafe',
      type_retail: 'Retail / Store',
      type_salon: 'Salon / Beauty',
      type_realestate: 'Real Estate',
      type_tech: 'Technology / Software',
      type_health: 'Health / Medical',
      type_education: 'Education / Training',
      type_tourism: 'Tourism / Travel',
      type_fitness: 'Sports / Fitness',
      type_other: 'Other',
      form_audience_label: 'Target Audience',
      form_audience_placeholder: 'e.g. Saudi families in Riyadh',
      form_platforms_label: 'Platforms',
      form_tone_label: 'Content Tone',
      tone_friendly: 'Friendly & Casual',
      tone_professional: 'Professional & Formal',
      tone_humorous: 'Humorous & Fun',
      tone_inspirational: 'Inspirational & Motivating',
      tone_luxury: 'Luxurious & Premium',
      form_lang_label: 'Content Language',
      lang_both: 'Arabic + English',
      lang_ar: 'Arabic Only',
      lang_en: 'English Only',
      form_posts_label: 'Number of Posts',
      form_generate: 'Generate Content',
      loading_text: 'AI is crafting your content...',
      loading_sub: 'Analyzing the market and writing tailored content for your business',
      results_title: 'Your Content is Ready!',
      results_new: 'New Request',
      upsell_title: 'Loved the content? Get 30 full posts!',
      upsell_desc: 'The free demo gives you 3 posts. Subscribe and get a full month of content for just 10 SAR.',
      upsell_cta: 'View Pricing',
      trusted_label: 'Trusted by Saudi Businesses',
      testimonial1_text: '"Saved us so much time! Content comes ready in our dialect and needs no editing. Perfect for restaurants."',
      testimonial1_name: 'Fahad Al-Otaibi',
      testimonial1_role: 'Restaurant Owner - Riyadh',
      testimonial2_text: '"I used to pay a content creator 3000 SAR monthly. Now for 10 SAR I get the same quality or better!"',
      testimonial2_name: 'Noura Al-Qahtani',
      testimonial2_role: 'E-commerce Owner - Jeddah',
      testimonial3_text: '"What I loved most is it knows Saudi events and prepares matching content. Truly smart service."',
      testimonial3_name: 'Abdullah Al-Shammari',
      testimonial3_role: 'Marketing Manager - Dammam',
      feat_tag: 'Features',
      feat_title: 'Why Is Postir Different?',
      feat_desc: 'Built specifically for the Saudi market - not just translation',
      feat1_title: 'Your Audience Feels You\'re Speaking to Them',
      feat1_desc: 'Content written in real Saudi dialect — not stiff formal Arabic or machine translation. Natural copy that builds trust with your followers.',
      feat2_title: 'Greater Reach to Your Saudi Audience',
      feat2_desc: 'Trending local hashtags added automatically — boost your views and reach the right people.',
      feat3_title: 'Never Miss a Saudi Occasion',
      feat3_desc: 'Ramadan, National Day, Founding Day — content ready for every occasion your audience cares about.',
      feat4_title: 'Reach Every Customer in Their Language',
      feat4_desc: 'Arabic and English simultaneously — deliver your message to every customer in their preferred language.',
      feat5_title: 'One Post for All Your Platforms',
      feat5_desc: 'Instagram, X, Snapchat, TikTok, LinkedIn & Facebook — each platform gets content in its own style automatically.',
      feat6_title: 'Ramadan Is Coming — Is Your Content Ready?',
      feat6_desc: 'Custom Ramadan content with greetings and seasonal offers. Prepare your content before it starts.',
      price_tag: 'Pricing',
      price_title: 'Simple & Clear Plans',
      price_desc: 'Pay as you need - no commitments',
      plan_free_name: 'Free Trial',
      plan_free_sub: 'Try before you buy',
      price_sar: 'SAR',
      plan_free_f1: '3 Sample Posts',
      plan_free_f2: '2 Platforms',
      plan_free_f3: 'No Registration',
      plan_free_cta: 'Try Now',
      popular_badge: 'Most Popular',
      plan_ppu_name: 'Starter Pack',
      plan_ppu_sub: 'Just 1 SAR per post',
      plan_ppu_f1: '10 Posts',
      plan_ppu_f2: 'All Platforms',
      plan_ppu_f3: 'Arabic + English',
      plan_ppu_f4: 'Smart Hashtags',
      plan_ppu_cta: 'Buy Now',
      plan_ppu_note: 'One-time payment - no subscription',
      pro_badge: 'PRO',
      plan_pro_name: 'Monthly Pro',
      plan_pro_sub: 'Save over 2,900 SAR monthly',
      price_month: '/month',
      plan_pro_f1: 'Unlimited Posts',
      plan_pro_f2: 'All Platforms',
      plan_pro_f3: 'Arabic + English',
      plan_pro_f4: 'Smart Hashtags',
      plan_pro_f5: 'Saudi Events Calendar',
      plan_pro_f6: 'Priority Generation',
      plan_pro_cta: 'Subscribe Now',
      plan_pro_note: 'Cancel anytime',
      payment_loading: 'Preparing payment...',
      payment_error: 'Payment error. Please try again.',
      footer_tagline: 'Smart content for Saudi businesses',
      footer_product: 'A product by',
      footer_made: 'Made in Saudi Arabia',
      footer_pdpl: 'Compliant with the Personal Data Protection Law (PDPL). Your data is safe and never shared with third parties.',
      compare_tag: 'Comparison',
      compare_title: 'Why Not Use Other Solutions?',
      compare_desc: 'See the difference yourself',
      price_anchor: 'Content creator = 3,000+ SAR/month',
      faq_tag: 'FAQ',
      faq_title: 'Got a Question?',
      faq1_q: 'What if I don\'t like the content?',
      faq1_a: 'Try 3 posts free with no signup or credit card. If you don\'t like it, you lose nothing.',
      faq2_q: 'Why not just use ChatGPT?',
      faq2_a: 'ChatGPT writes formal Arabic and needs heavy editing for social media. Postir is built for Saudi market — Gulf dialect, local hashtags, and platform-ready content.',
      faq3_q: 'Is my data safe?',
      faq3_a: 'PDPL compliant. Your data is never stored. Payments secured via Airwallex.',
      faq4_q: 'How many posts can I create for free?',
      faq4_a: '3 posts for 2 platforms. If you like it, the Starter Pack gives you 10 posts for just 10 SAR.',
      copy_ar: 'Copy Arabic',
      copy_en: 'Copy English',
      copied: 'Copied!',
      day_label: 'Day',
      error_platforms: 'Please select at least one platform',
      error_api: 'An error occurred. Please try again.',
    }
  };

  let currentLang = 'ar';

  /* ---------- DOM Refs ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const langToggle = $('#langToggle');
  const langLabel = $('#langLabel');
  const form = $('#generatorForm');
  const genLoading = $('#genLoading');
  const genResults = $('#genResults');
  const resultsGrid = $('#resultsGrid');
  const upsellCard = $('#upsellCard');
  const generateBtn = $('#generateBtn');
  const loadingPercent = $('#loadingPercent');
  const newGenBtn = $('#newGenBtn');
  const demoCta = $('#demoCta');
  const pricingDemoBtn = $('#pricingDemoBtn');
  const mobileMenuBtn = $('#mobileMenuBtn');
  const mobileNavOverlay = $('#mobileNavOverlay');
  const siteHeader = $('#siteHeader');

  /* ---------- Language Toggle ---------- */
  function setLang(lang) {
    currentLang = lang;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    langLabel.textContent = lang === 'ar' ? 'EN' : 'عربي';

    // Update all data-i18n elements
    $$('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (T[lang][key]) {
        el.textContent = T[lang][key];
      }
    });

    // Update placeholders
    $$('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (T[lang][key]) {
        el.placeholder = T[lang][key];
      }
    });

    // Update select options
    $$('select option[data-i18n]').forEach(opt => {
      const key = opt.getAttribute('data-i18n');
      if (T[lang][key]) {
        opt.textContent = T[lang][key];
      }
    });
  }

  langToggle.addEventListener('click', () => {
    setLang(currentLang === 'ar' ? 'en' : 'ar');
  });

  /* ---------- Mobile Menu ---------- */
  mobileMenuBtn.addEventListener('click', () => {
    mobileNavOverlay.classList.toggle('hidden');
    document.body.style.overflow = mobileNavOverlay.classList.contains('hidden') ? '' : 'hidden';
  });

  $$('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNavOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Header Scroll ---------- */
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    siteHeader.classList.toggle('scrolled', y > 50);
    lastScroll = y;
  }, { passive: true });

  /* ---------- Scroll Reveal (IntersectionObserver) ---------- */
  const revealSelectors = '.section-header, .step-card, .bento-card, .price-card, .testimonial-card, .generator-card';
  const revealElements = $$(revealSelectors);
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  revealElements.forEach((el, i) => {
    el.classList.add('reveal-item');
    el.style.transitionDelay = `${(i % 6) * 0.06}s`;
    revealObserver.observe(el);
  });

  /* ---------- Number Counter Animation ---------- */
  function animateCounters() {
    $$('.stat-number[data-target], .price-value[data-target]').forEach(el => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (el.dataset.counted) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !el.dataset.counted) {
            el.dataset.counted = 'true';
            let current = 0;
            const step = Math.max(1, Math.floor(target / 60));
            const duration = 1500;
            const fps = 60;
            const increment = target / (duration / (1000 / fps));

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = Math.floor(current).toLocaleString('en-US');
            }, 1000 / fps);

            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(el);
    });
  }
  animateCounters();

  /* ---------- Phone Post Carousel ---------- */
  const phonePosts = $$('.phone-post');
  let currentPost = 0;

  function cyclePhonePosts() {
    phonePosts.forEach(p => p.classList.remove('active'));
    currentPost = (currentPost + 1) % phonePosts.length;
    phonePosts[currentPost].classList.add('active');
  }

  setInterval(cyclePhonePosts, 3500);

  /* ---------- Platform Pill Toggles ---------- */
  $$('.pill-toggle').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
    });
  });

  /* ---------- Demo Mode ---------- */
  function fillDemo() {
    $('#businessName').value = 'مطعم الديرة';
    $('#businessType').value = 'restaurant';
    $('#targetAudience').value = 'عائلات سعودية في الرياض';
    $('#contentTone').value = 'friendly';
    $('#contentLang').value = 'both';
    $('#numPosts').value = '30';

    // Activate Instagram and X
    $$('.pill-toggle').forEach(p => p.classList.remove('active'));
    const igPill = document.querySelector('[data-platform="instagram"]');
    const xPill = document.querySelector('[data-platform="x"]');
    if (igPill) igPill.classList.add('active');
    if (xPill) xPill.classList.add('active');

    // Scroll to generator
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });

    // Auto-submit as demo after scrolling
    setTimeout(() => {
      submitGenerator('demo');
    }, 800);
  }

  if (demoCta) demoCta.addEventListener('click', fillDemo);
  if (pricingDemoBtn) pricingDemoBtn.addEventListener('click', fillDemo);

  /* ---------- Form Submission ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitGenerator('paid');
  });

  function getSelectedPlatforms() {
    return Array.from($$('.pill-toggle.active')).map(p => p.dataset.platform);
  }

  function submitGenerator(mode) {
    const platforms = getSelectedPlatforms();
    if (platforms.length === 0) {
      alert(T[currentLang].error_platforms);
      return;
    }

    const payload = {
      business_name: $('#businessName').value.trim(),
      business_type: $('#businessType').value,
      target_audience: $('#targetAudience').value.trim(),
      platforms: platforms,
      tone: $('#contentTone').value,
      language: $('#contentLang').value,
      num_posts: parseInt($('#numPosts').value, 10),
      mode: mode
    };

    // Show loading
    form.classList.add('hidden');
    genResults.classList.add('hidden');
    genLoading.classList.remove('hidden');

    // Animate loading percent
    let pct = 0;
    const pctInterval = setInterval(() => {
      pct += Math.random() * 8;
      if (pct > 90) pct = 90;
      loadingPercent.textContent = Math.floor(pct) + '%';
    }, 200);

    fetch(`${CGI_BIN}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(data => {
      clearInterval(pctInterval);
      loadingPercent.textContent = '100%';

      setTimeout(() => {
        genLoading.classList.add('hidden');
        renderResults(data.posts || [], mode);
        genResults.classList.remove('hidden');
      }, 500);
    })
    .catch(err => {
      clearInterval(pctInterval);
      genLoading.classList.add('hidden');
      form.classList.remove('hidden');
      alert(T[currentLang].error_api);
      console.error(err);
    });
  }

  /* ---------- Render Results ---------- */
  const platformIcons = {
    instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    snapchat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-3.2 0-5.8 2.3-6 5.5-.1 1.4.2 2.5.2 2.5l-1.8.7c-.4.2-.5.5-.3.8.2.3.5.4.8.3l1.5-.6s-.2 1.8.8 3.2c.7 1 1.8 1.7 1.8 1.7s-1.5.5-2.5.8c-1 .3-1 .8-.4 1.1.6.3 2.2.4 3.2.4.8 0 1.5.5 2.1 1.2.5.6 1.2.9 2.1.9s1.6-.3 2.1-.9c.6-.7 1.3-1.2 2.1-1.2 1 0 2.6-.1 3.2-.4.6-.3.6-.8-.4-1.1-1-.3-2.5-.8-2.5-.8s1.1-.7 1.8-1.7c1-1.4.8-3.2.8-3.2l1.5.6c.3.1.6 0 .8-.3.2-.3.1-.6-.3-.8l-1.8-.7s.3-1.1.2-2.5C17.8 4.3 15.2 2 12 2z"/></svg>',
    tiktok: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.89 2.89 2.89 0 012.88-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.69 4.61V13.4a8.27 8.27 0 005.75 2.33V12.3a4.85 4.85 0 01-3.77-1.85V6.69z"/></svg>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
  };

  const platformClasses = {
    instagram: 'ig',
    x: 'x-plat',
    snapchat: 'snap',
    tiktok: 'tt',
    linkedin: 'li',
    facebook: 'fb'
  };

  const platformNames = {
    instagram: 'Instagram',
    x: 'X (Twitter)',
    snapchat: 'Snapchat',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    facebook: 'Facebook'
  };

  function renderResults(posts, mode) {
    resultsGrid.innerHTML = '';

    posts.forEach((post, i) => {
      const card = document.createElement('div');
      card.className = 'result-post';
      card.style.animationDelay = `${i * 0.1}s`;

      const platform = post.platform || 'instagram';
      const icon = platformIcons[platform] || platformIcons.instagram;
      const cls = platformClasses[platform] || 'ig';
      const name = platformNames[platform] || platform;
      const dayLabel = T[currentLang].day_label;

      let bodyHtml = '';

      if (post.text_ar) {
        bodyHtml += `<p class="result-text-ar">${escapeHtml(post.text_ar)}</p>`;
      }
      if (post.text_en) {
        bodyHtml += `<p class="result-text-en">${escapeHtml(post.text_en)}</p>`;
      }

      // Hashtags
      const allTags = [
        ...(post.hashtags_ar || []),
        ...(post.hashtags_en || [])
      ];
      if (allTags.length > 0) {
        bodyHtml += `<div class="result-hashtags">${allTags.map(t => `<span class="result-tag">${escapeHtml(t)}</span>`).join(' ')}</div>`;
      }

      // Copy buttons
      let copyBtns = '';
      if (post.text_ar) {
        const copyArLabel = T[currentLang].copy_ar;
        copyBtns += `<button class="copy-btn" data-copy="${escapeAttr(post.text_ar + '\n' + (post.hashtags_ar || []).join(' '))}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          ${copyArLabel}
        </button>`;
      }
      if (post.text_en) {
        const copyEnLabel = T[currentLang].copy_en;
        copyBtns += `<button class="copy-btn" data-copy="${escapeAttr(post.text_en + '\n' + (post.hashtags_en || []).join(' '))}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          ${copyEnLabel}
        </button>`;
      }

      card.innerHTML = `
        <div class="result-post-header">
          <div class="result-platform-info">
            <div class="result-platform-icon ${cls}">${icon}</div>
            <span style="font-size:0.85rem;font-weight:600;color:var(--text-primary)">${name}</span>
          </div>
          <span class="result-day-badge">${dayLabel} ${post.day || (i + 1)}</span>
        </div>
        <div class="result-post-body">${bodyHtml}</div>
        <div class="result-post-actions">${copyBtns}</div>
      `;

      resultsGrid.appendChild(card);
    });

    // Bind copy buttons
    $$('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        copyToClipboard(text).then(() => {
          const origText = btn.innerHTML;
          btn.classList.add('copied');
          const svgPart = btn.querySelector('svg').outerHTML;
          btn.innerHTML = svgPart + ' ' + T[currentLang].copied;
          setTimeout(() => {
            btn.innerHTML = origText;
            btn.classList.remove('copied');
          }, 2000);
        });
      });
    });

    // Show upsell if demo mode
    if (mode === 'demo') {
      upsellCard.classList.remove('hidden');
    } else {
      upsellCard.classList.add('hidden');
    }
  }

  /* ---------- New Generation ---------- */
  newGenBtn.addEventListener('click', () => {
    genResults.classList.add('hidden');
    form.classList.remove('hidden');
    loadingPercent.textContent = '0%';
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Helpers ---------- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Initialize ---------- */
  setLang('ar');

  /* ---------- Airwallex Payment Integration ---------- */
  let airwallexReady = false;
  let airwallexPayments = null;

  // Load Airwallex SDK dynamically
  (function loadAirwallexSDK() {
    const script = document.createElement('script');
    script.src = 'https://static.airwallex.com/components/sdk/v1/index.js';
    script.async = true;
    script.onload = async () => {
      try {
        const sdk = await window.AirwallexComponentsSDK.init({
          env: 'prod',
          enabledElements: ['payments'],
        });
        airwallexPayments = sdk.payments;
        airwallexReady = true;
      } catch (e) {
        console.warn('Airwallex SDK init failed:', e);
      }
    };
    document.head.appendChild(script);
  })();

  async function initiatePayment(plan) {
    const btn = plan === 'ppu' ? $('#payPpuBtn') : $('#payProBtn');
    const origText = btn.textContent;
    btn.textContent = T[currentLang].payment_loading;
    btn.disabled = true;

    try {
      const currentUrl = window.location.href.split('#')[0];
      const res = await fetch(`${CGI_BIN}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
          return_url: currentUrl + '#payment-success'
        })
      });

      if (!res.ok) throw new Error('Payment API error');
      const data = await res.json();

      if (airwallexReady && airwallexPayments) {
        // Redirect to Airwallex Hosted Payment Page
        airwallexPayments.redirectToCheckout({
          env: 'prod',
          mode: 'payment',
          intent_id: data.intent_id,
          client_secret: data.client_secret,
          currency: data.currency,
          country_code: 'SA',
          successUrl: currentUrl + '?payment=success&plan=' + plan,
          appearance: {
            mode: 'dark',
            variables: {
              colorBrand: '#B9FF66',
              colorText: '#FFFFFF',
              colorBackground: '#0B0F19'
            }
          },
          locale: currentLang === 'ar' ? 'en' : 'en',
          logoUrl: '',
          submitType: plan === 'pro' ? 'subscribe' : 'pay'
        });
      } else {
        // Fallback: open Airwallex checkout in new window
        alert(T[currentLang].payment_error);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert(T[currentLang].payment_error);
    } finally {
      btn.textContent = origText;
      btn.disabled = false;
    }
  }

  // Bind payment buttons
  const payPpuBtn = $('#payPpuBtn');
  const payProBtn = $('#payProBtn');
  if (payPpuBtn) payPpuBtn.addEventListener('click', () => initiatePayment('ppu'));
  if (payProBtn) payProBtn.addEventListener('click', () => initiatePayment('pro'));

  // Handle payment success return
  if (window.location.search.includes('payment=success')) {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const successMsg = currentLang === 'ar'
      ? (plan === 'pro' ? 'تم الاشتراك بنجاح! يمكنك الآن توليد بوستات غير محدودة.' : 'تم الدفع بنجاح! يمكنك الآن توليد 10 بوستات.')
      : (plan === 'pro' ? 'Subscription successful! You can now generate unlimited posts.' : 'Payment successful! You can now generate 10 posts.');

    // Show success banner
    const banner = document.createElement('div');
    banner.className = 'payment-success-banner';
    banner.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9FF66" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${successMsg}</span>
    `;
    document.body.prepend(banner);
    setTimeout(() => banner.classList.add('show'), 100);
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 500);
    }, 6000);

    // Clean URL
    history.replaceState(null, '', window.location.pathname);
  }

})();
