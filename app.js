/* ============================================
   POSTIR V2 — App Logic
   ============================================ */

(function () {
  'use strict';

  const CGI_BIN = '/api';
  const SUPABASE_URL = 'https://onnwfvuscdabyiigbgsi.supabase.co';
  const SUPABASE_ANON = 'sb_publishable_jZCyUjs49w2U_vF60n9kTg_PkCkZLs_';

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
      hero_cta: 'جرّب مجاناً',
      trust_signup: 'سجّل مجاناً واحصل على 3 رموز',
      trust_seconds: 'جاهز خلال ثوانِ',
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
      feat_desc: 'صُمّم خصيصاً للسوق السعودي - مو مجرد ترجمة',
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
      plan_free_name: 'مجاني',
      plan_free_sub: 'ابدأ الحين بدون دفع',
      price_sar: 'ر.س',
      plan_free_f1: '3 رموز (نص فقط)',
      plan_free_f2: 'كل المنصات',
      plan_free_f3: 'يتطلب تسجيل',
      plan_free_cta: 'سجّل مجاناً',
      popular_badge: 'الأكثر طلباً',
      plan_ppu_name: 'باقة البداية',
      plan_ppu_sub: 'نص + صور + ريلز',
      plan_ppu_f1: '10 رموز',
      plan_ppu_f2: 'نص + صور + ريلز',
      plan_ppu_f3: 'كل المنصات',
      plan_ppu_f4: 'هاشتاقات ذكية',
      plan_ppu_cta: 'اشتري الحين',
      plan_ppu_note: 'دفع لمرة واحدة - بدون اشتراك',
      pro_badge: 'PRO',
      plan_pro_name: 'الباقة الشهرية',
      plan_pro_sub: 'كل شيء بدون حدود',
      price_month: '/شهر',
      plan_pro_f1: 'رموز غير محدودة',
      plan_pro_f2: 'نص + صور + ريلز',
      plan_pro_f3: 'كل المنصات',
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
      faq1_a: 'جرّب 3 رموز مجاناً بعد التسجيل. إذا ما عجبك، ما تخسر شي.',
      faq2_q: 'ليش ما أستخدم ChatGPT بداله؟',
      faq2_a: 'ChatGPT يكتب بالفصحى ويحتاج تعديل. بوستر مصمم للسوق السعودي — لهجة خليجية، هاشتاقات، ومحتوى جاهز لكل منصة.',
      faq3_q: 'بياناتي آمنة؟',
      faq3_a: 'متوافق مع PDPL. بياناتك لا تُخزّن. الدفع آمن عبر Airwallex.',
      faq4_q: 'كم رمز أحصل مجاناً؟',
      faq4_a: '3 رموز عند التسجيل للنص فقط. باقة البداية تعطيك 10 رموز بـ 10 ريال تشمل الصور والريلز.',
      copy_ar: 'نسخ العربي',
      copy_en: 'نسخ الإنجليزي',
      copied: 'تم النسخ!',
      day_label: 'يوم',
      error_platforms: 'الرجاء اختيار منصة واحدة على الأقل',
      error_api: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      header_login: 'سجّل دخول',
      header_logout: 'خروج',
      modal_login: 'تسجيل الدخول',
      modal_signup: 'إنشاء حساب',
      modal_welcome: 'مرحباً بك في بوستر',
      modal_signup_welcome: 'أنشئ حسابك مجاناً',
      modal_email: 'البريد الإلكتروني',
      modal_email_ph: 'you@example.com',
      modal_password: 'كلمة المرور',
      modal_password_ph: '••••••••',
      modal_password_new_ph: '6 أحرف على الأقل',
      modal_login_submit: 'دخول',
      modal_signup_submit: 'إنشاء الحساب',
      modal_no_account: 'ما عندك حساب؟',
      modal_create: 'أنشئ حساباً',
      modal_have_account: 'عندك حساب؟',
      modal_login_link: 'سجّل دخول',
      modal_free_tokens: 'تحصل على 3 رموز مجانية عند التسجيل',
      tab_text: 'بوست نصي',
      tab_image: 'صورة',
      tab_video: 'ريل فيديو',
      img_prompt_label: 'وصف الصورة المطلوبة',
      img_prompt_placeholder: 'مثال: صورة احترافية لمطعم عائلي في جو رمضاني دافئ',
      img_platform_label: 'المنصة',
      img_style_label: 'أسلوب التصميم',
      img_style_realistic: 'واقعي',
      img_style_illustration: 'رسوم توضيحية',
      img_style_minimalist: 'مينيمال',
      img_style_luxury: 'فاخر',
      img_generate: 'اصنع الصورة',
      img_ready: 'الصورة جاهزة!',
      vid_generate: 'اصنع الريل',
      vid_ready: 'الريل جاهز!',
      dash_history: 'السجل',
      tokens_remaining: 'رموز متبقية',
      slide_label: 'شريحة',
      payment_soon: 'الدفع قادم قريباً — سنتواصل معك عند الإطلاق!',
      upgrade_title: 'رموزك انتهت!',
      upgrade_desc: 'اشترِ باقة للحصول على المزيد من الرموز.',
      upgrade_cta: 'اشترِ الحين',
      auth_required_title: 'سجّل دخولك للمتابعة',
      auth_required_desc: 'تحتاج لحساب لاستخدام المولّد.',
      login_success: 'مرحباً! تم تسجيل الدخول بنجاح.',
      signup_success: 'تم إنشاء الحساب! حصلت على 3 رموز مجانية.',
      error_login: 'خطأ في البريد أو كلمة المرور.',
      error_signup: 'حدث خطأ في إنشاء الحساب.',
      error_email_exists: 'هذا البريد مسجل مسبقاً.',
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
      hero_cta: 'Try Free',
      trust_signup: 'Sign up free & get 3 tokens',
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
      plan_free_name: 'Free',
      plan_free_sub: 'Start now without paying',
      price_sar: 'SAR',
      plan_free_f1: '3 Tokens (Text only)',
      plan_free_f2: 'All Platforms',
      plan_free_f3: 'Registration required',
      plan_free_cta: 'Sign Up Free',
      popular_badge: 'Most Popular',
      plan_ppu_name: 'Starter Pack',
      plan_ppu_sub: 'Text + Images + Reels',
      plan_ppu_f1: '10 Tokens',
      plan_ppu_f2: 'Text + Images + Reels',
      plan_ppu_f3: 'All Platforms',
      plan_ppu_f4: 'Smart Hashtags',
      plan_ppu_cta: 'Buy Now',
      plan_ppu_note: 'One-time payment - no subscription',
      pro_badge: 'PRO',
      plan_pro_name: 'Monthly Pro',
      plan_pro_sub: 'Everything without limits',
      price_month: '/month',
      plan_pro_f1: 'Unlimited Tokens',
      plan_pro_f2: 'Text + Images + Reels',
      plan_pro_f3: 'All Platforms',
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
      faq1_a: 'Try 3 free tokens after signing up. If you don\'t like it, you lose nothing.',
      faq2_q: 'Why not just use ChatGPT?',
      faq2_a: 'ChatGPT writes formal Arabic and needs heavy editing. Postir is built for the Saudi market — Gulf dialect, local hashtags, and platform-ready content.',
      faq3_q: 'Is my data safe?',
      faq3_a: 'PDPL compliant. Your data is never stored. Payments secured via Airwallex.',
      faq4_q: 'How many free tokens do I get?',
      faq4_a: '3 tokens on signup for text only. The Starter Pack gives 10 tokens for 10 SAR including images and reels.',
      copy_ar: 'Copy Arabic',
      copy_en: 'Copy English',
      copied: 'Copied!',
      day_label: 'Day',
      error_platforms: 'Please select at least one platform',
      error_api: 'An error occurred. Please try again.',
      header_login: 'Sign In',
      header_logout: 'Sign Out',
      modal_login: 'Sign In',
      modal_signup: 'Create Account',
      modal_welcome: 'Welcome to Postir',
      modal_signup_welcome: 'Create Your Free Account',
      modal_email: 'Email Address',
      modal_email_ph: 'you@example.com',
      modal_password: 'Password',
      modal_password_ph: '••••••••',
      modal_password_new_ph: 'Minimum 6 characters',
      modal_login_submit: 'Sign In',
      modal_signup_submit: 'Create Account',
      modal_no_account: 'No account?',
      modal_create: 'Create one',
      modal_have_account: 'Have an account?',
      modal_login_link: 'Sign In',
      modal_free_tokens: 'Get 3 free tokens on signup',
      tab_text: 'Text Post',
      tab_image: 'Image',
      tab_video: 'Video Reel',
      img_prompt_label: 'Describe the image you want',
      img_prompt_placeholder: 'e.g. Professional family restaurant atmosphere during Ramadan',
      img_platform_label: 'Platform',
      img_style_label: 'Design Style',
      img_style_realistic: 'Realistic',
      img_style_illustration: 'Illustration',
      img_style_minimalist: 'Minimalist',
      img_style_luxury: 'Luxury',
      img_generate: 'Generate Image',
      img_ready: 'Image Ready!',
      vid_generate: 'Generate Reel',
      vid_ready: 'Reel Ready!',
      dash_history: 'History',
      tokens_remaining: 'tokens remaining',
      slide_label: 'Slide',
      payment_soon: 'Payment coming soon — we\'ll contact you at launch!',
      upgrade_title: 'Out of tokens!',
      upgrade_desc: 'Purchase a plan to get more tokens.',
      upgrade_cta: 'Buy Now',
      auth_required_title: 'Sign In to Continue',
      auth_required_desc: 'You need an account to use the generator.',
      login_success: 'Welcome back! You are signed in.',
      signup_success: 'Account created! You received 3 free tokens.',
      error_login: 'Invalid email or password.',
      error_signup: 'Error creating account.',
      error_email_exists: 'This email is already registered.',
    }
  };

  let currentLang = 'ar';

  /* ---------- Auth State ---------- */
  let authState = {
    user: null,
    access_token: null,
    refresh_token: null,
    tokens: 0,
    plan: 'free'
  };

  /* ---------- DOM Refs ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const langToggle = $('#langToggle');
  const langLabel = $('#langLabel');
  const form = $('#generatorForm');
  const genLoading = $('#genLoading');
  const genResults = $('#genResults');
  const imageResults = $('#imageResults');
  const videoResults = $('#videoResults');
  const resultsGrid = $('#resultsGrid');
  const upsellCard = $('#upsellCard');
  const generateBtn = $('#generateBtn');
  const loadingPercent = $('#loadingPercent');
  const newGenBtn = $('#newGenBtn');
  const newImageBtn = $('#newImageBtn');
  const newVideoBtn = $('#newVideoBtn');
  const pricingDemoBtn = $('#pricingDemoBtn');
  const mobileMenuBtn = $('#mobileMenuBtn');
  const mobileNavOverlay = $('#mobileNavOverlay');
  const siteHeader = $('#siteHeader');

  // Auth UI
  const authBtnsLoggedOut = $('#authBtnsLoggedOut');
  const authBtnsLoggedIn = $('#authBtnsLoggedIn');
  const headerLoginBtn = $('#headerLoginBtn');
  const logoutBtn = $('#logoutBtn');
  const userEmailDisplay = $('#userEmailDisplay');
  const headerTokenCount = $('#headerTokenCount');
  const tokenIndicator = $('#tokenIndicator');
  const tokenIndicatorText = $('#tokenIndicatorText');

  // Auth Modal
  const authModalBackdrop = $('#authModalBackdrop');
  const authModalClose = $('#authModalClose');
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');
  const loginPanel = $('#loginPanel');
  const signupPanel = $('#signupPanel');
  const loginError = $('#loginError');
  const signupError = $('#signupError');

  // Dashboard
  const dashboardBar = $('#dashboardBar');
  const dashPlanName = $('#dashPlanName');
  const dashTokenInfo = $('#dashTokenInfo');
  const dashHistoryBtn = $('#dashHistoryBtn');
  const dashCloseBtn = $('#dashCloseBtn');

  // History Modal
  const historyModalBackdrop = $('#historyModalBackdrop');
  const historyModalClose = $('#historyModalClose');
  const historyList = $('#historyList');

  // Image/Video forms
  const imageForm = $('#imageForm');
  const videoForm = $('#videoForm');
  const generateImageBtn = $('#generateImageBtn');
  const generateVideoBtn = $('#generateVideoBtn');
  const imageResultCard = $('#imageResultCard');
  const videoSlidesContainer = $('#videoSlidesContainer');

  // Tabs
  const genTabBtns = $$('.gen-tab');

  /* ============================================
     LANGUAGE
     ============================================ */
  function setLang(lang) {
    currentLang = lang;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    langLabel.textContent = lang === 'ar' ? 'EN' : '\u0639\u0631\u0628\u064a';

    $$('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (T[lang][key]) el.textContent = T[lang][key];
    });

    $$('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (T[lang][key]) el.placeholder = T[lang][key];
    });

    $$('select option[data-i18n]').forEach(opt => {
      const key = opt.getAttribute('data-i18n');
      if (T[lang][key]) opt.textContent = T[lang][key];
    });

    updateTokenIndicator();
  }

  langToggle.addEventListener('click', () => setLang(currentLang === 'ar' ? 'en' : 'ar'));

  /* ============================================
     MOBILE MENU
     ============================================ */
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

  /* ============================================
     HEADER SCROLL
     ============================================ */
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ============================================
     SCROLL REVEAL
     ============================================ */
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

  /* ============================================
     NUMBER COUNTER
     ============================================ */
  function animateCounters() {
    $$('.stat-number[data-target], .price-value[data-target]').forEach(el => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (el.dataset.counted) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !el.dataset.counted) {
            el.dataset.counted = 'true';
            let current = 0;
            const duration = 1500;
            const fps = 60;
            const increment = target / (duration / (1000 / fps));
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) { current = target; clearInterval(timer); }
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

  /* ============================================
     PHONE CAROUSEL
     ============================================ */
  const phonePosts = $$('.phone-post');
  let currentPost = 0;
  function cyclePhonePosts() {
    phonePosts.forEach(p => p.classList.remove('active'));
    currentPost = (currentPost + 1) % phonePosts.length;
    phonePosts[currentPost].classList.add('active');
  }
  setInterval(cyclePhonePosts, 3500);

  /* ============================================
     PLATFORM PILLS
     ============================================ */
  $$('.pill-toggle').forEach(pill => {
    pill.addEventListener('click', () => pill.classList.toggle('active'));
  });

  /* ============================================
     AUTH MODAL
     ============================================ */
  function openAuthModal(tab) {
    authModalBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    switchAuthTab(tab || 'login');
    clearAuthErrors();
  }

  function closeAuthModal() {
    authModalBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function switchAuthTab(tab) {
    $$('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.modalTab === tab));
    loginPanel.classList.toggle('hidden', tab !== 'login');
    signupPanel.classList.toggle('hidden', tab !== 'signup');
    clearAuthErrors();
  }

  function clearAuthErrors() {
    loginError.textContent = '';
    loginError.classList.add('hidden');
    signupError.textContent = '';
    signupError.classList.add('hidden');
  }

  function showAuthError(el, msg) {
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  if (headerLoginBtn) headerLoginBtn.addEventListener('click', () => openAuthModal('login'));
  if (authModalClose) authModalClose.addEventListener('click', closeAuthModal);
  authModalBackdrop.addEventListener('click', (e) => {
    if (e.target === authModalBackdrop) closeAuthModal();
  });

  $$('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.modalTab));
  });

  $$('.modal-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => switchAuthTab(btn.dataset.modalTab));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      closeHistoryModal();
    }
  });

  /* ---------- Password toggle ---------- */
  function setupPasswordToggle(btnId, inputId) {
    const btn = $(btnId);
    const input = $(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.querySelector('svg').innerHTML = isText
        ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
        : '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    });
  }
  setupPasswordToggle('#loginPasswordToggle', '#loginPassword');
  setupPasswordToggle('#signupPasswordToggle', '#signupPassword');

  /* ============================================
     AUTH API CALLS
     ============================================ */
  async function apiSignup(email, password) {
    const res = await fetch(`${CGI_BIN}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'signup_error');
    }
    return res.json();
  }

  async function apiLogin(email, password) {
    const res = await fetch(`${CGI_BIN}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'login_error');
    }
    return res.json();
  }

  async function apiGetMe(token) {
    const res = await fetch(`${CGI_BIN}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('auth_expired');
    return res.json();
  }

  async function apiRefreshToken(refreshToken) {
    const res = await fetch(`${CGI_BIN}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!res.ok) throw new Error('refresh_failed');
    return res.json();
  }

  function getAuthHeader() {
    return authState.access_token
      ? { 'Authorization': `Bearer ${authState.access_token}` }
      : {};
  }

  async function ensureValidToken() {
    if (!authState.access_token) return false;
    try {
      await apiGetMe(authState.access_token);
      return true;
    } catch {
      if (authState.refresh_token) {
        try {
          const data = await apiRefreshToken(authState.refresh_token);
          authState.access_token = data.access_token;
          authState.refresh_token = data.refresh_token || authState.refresh_token;
          localStorage.setItem('postir_access_token', authState.access_token);
          localStorage.setItem('postir_refresh_token', authState.refresh_token);
          return true;
        } catch {
          logout();
          return false;
        }
      }
      logout();
      return false;
    }
  }

  /* ============================================
     AUTH STATE MANAGEMENT
     ============================================ */
  function onLoginSuccess(data) {
    authState.user = data.user || { email: data.email };
    authState.access_token = data.access_token;
    authState.refresh_token = data.refresh_token;
    authState.tokens = data.tokens || 0;
    authState.plan = data.plan || 'free';

    localStorage.setItem('postir_access_token', authState.access_token);
    localStorage.setItem('postir_refresh_token', authState.refresh_token || '');

    updateAuthUI();
    closeAuthModal();
  }

  function logout() {
    authState = { user: null, access_token: null, refresh_token: null, tokens: 0, plan: 'free' };
    localStorage.removeItem('postir_access_token');
    localStorage.removeItem('postir_refresh_token');
    updateAuthUI();
  }

  function updateAuthUI() {
    const loggedIn = !!authState.user;
    authBtnsLoggedOut.classList.toggle('hidden', loggedIn);
    authBtnsLoggedIn.classList.toggle('hidden', !loggedIn);

    if (loggedIn) {
      const email = authState.user.email || '';
      userEmailDisplay.textContent = email;
      headerTokenCount.textContent = authState.tokens;
      dashPlanName.textContent = getPlanLabel(authState.plan);
      dashTokenInfo.textContent = authState.plan === 'pro'
        ? (currentLang === 'ar' ? '\u063a\u064a\u0631 \u0645\u062d\u062f\u0648\u062f' : 'Unlimited')
        : `${authState.tokens} ${T[currentLang].tokens_remaining}`;
      dashboardBar.classList.remove('hidden');
      tokenIndicator.classList.remove('hidden');
    } else {
      dashboardBar.classList.add('hidden');
      tokenIndicator.classList.add('hidden');
    }
    updateTokenIndicator();
  }

  function getPlanLabel(plan) {
    const labels = {
      ar: { free: '\u0645\u062c\u0627\u0646\u064a', starter: '\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u062f\u0627\u064a\u0629', pro: 'Pro' },
      en: { free: 'Free', starter: 'Starter', pro: 'Pro' }
    };
    return (labels[currentLang] || labels.ar)[plan] || plan;
  }

  function updateTokenIndicator() {
    if (!authState.user) return;
    const t = authState.tokens;
    const unlimited = authState.plan === 'pro';
    tokenIndicator.classList.remove('low', 'empty');

    if (unlimited) {
      tokenIndicatorText.textContent = currentLang === 'ar' ? '\u0631\u0645\u0648\u0632 \u063a\u064a\u0631 \u0645\u062d\u062f\u0648\u062f\u0629' : 'Unlimited tokens';
    } else {
      tokenIndicatorText.textContent = `${t} ${T[currentLang].tokens_remaining}`;
      if (t === 0) tokenIndicator.classList.add('empty');
      else if (t <= 1) tokenIndicator.classList.add('low');
    }
  }

  /* ============================================
     AUTH FORM SUBMISSIONS
     ============================================ */
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('#loginSubmitBtn');
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value;
      clearAuthErrors();
      btn.disabled = true;
      btn.querySelector('span').textContent = '...';

      try {
        const data = await apiLogin(email, password);
        onLoginSuccess(data);
        showToast(T[currentLang].login_success, 'success');
      } catch (err) {
        showAuthError(loginError, T[currentLang].error_login);
      } finally {
        btn.disabled = false;
        btn.querySelector('span').textContent = T[currentLang].modal_login_submit;
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('#signupSubmitBtn');
      const email = $('#signupEmail').value.trim();
      const password = $('#signupPassword').value;
      clearAuthErrors();
      btn.disabled = true;
      btn.querySelector('span').textContent = '...';

      try {
        const data = await apiSignup(email, password);
        onLoginSuccess(data);
        showToast(T[currentLang].signup_success, 'success');
      } catch (err) {
        const msg = err.message.includes('exists') || err.message.includes('registered')
          ? T[currentLang].error_email_exists
          : T[currentLang].error_signup;
        showAuthError(signupError, msg);
      } finally {
        btn.disabled = false;
        btn.querySelector('span').textContent = T[currentLang].modal_signup_submit;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      showToast(currentLang === 'ar' ? '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c' : 'Signed out', 'info');
    });
  }

  /* ============================================
     SESSION RESTORE ON LOAD
     ============================================ */
  async function restoreSession() {
    const storedAccess = localStorage.getItem('postir_access_token');
    const storedRefresh = localStorage.getItem('postir_refresh_token');
    if (!storedAccess) return;

    authState.access_token = storedAccess;
    authState.refresh_token = storedRefresh;

    try {
      const data = await apiGetMe(storedAccess);
      authState.user = data.user || { email: data.email };
      authState.tokens = data.tokens || 0;
      authState.plan = data.plan || 'free';
      updateAuthUI();
    } catch {
      if (storedRefresh) {
        try {
          const refreshed = await apiRefreshToken(storedRefresh);
          authState.access_token = refreshed.access_token;
          authState.refresh_token = refreshed.refresh_token || storedRefresh;
          localStorage.setItem('postir_access_token', authState.access_token);
          localStorage.setItem('postir_refresh_token', authState.refresh_token);
          const data = await apiGetMe(authState.access_token);
          authState.user = data.user || { email: data.email };
          authState.tokens = data.tokens || 0;
          authState.plan = data.plan || 'free';
          updateAuthUI();
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }
  }

  /* ============================================
     CONTENT TABS
     ============================================ */
  let activeTab = 'text';

  function switchGenTab(tab) {
    activeTab = tab;
    genTabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));

    // Hide all forms & results
    form.classList.toggle('hidden', tab !== 'text');
    imageForm.classList.toggle('hidden', tab !== 'image');
    videoForm.classList.toggle('hidden', tab !== 'video');
    genResults.classList.add('hidden');
    imageResults.classList.add('hidden');
    videoResults.classList.add('hidden');
    genLoading.classList.add('hidden');
  }

  genTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      // For image/video tabs, check auth first
      if ((tab === 'image' || tab === 'video') && !authState.user) {
        openAuthModal('signup');
        showToast(T[currentLang].auth_required_title, 'info');
        return;
      }
      // Check plan for image/video
      if (tab === 'image' && authState.plan === 'free' && authState.user) {
        switchGenTab(tab);
        return;
      }
      if (tab === 'video' && authState.plan === 'free' && authState.user) {
        switchGenTab(tab);
        return;
      }
      switchGenTab(tab);
    });
  });

  /* ============================================
     TOKEN GATE CHECK
     ============================================ */
  function checkTokenGate(cost) {
    if (!authState.user) {
      openAuthModal('signup');
      return false;
    }
    if (authState.plan === 'pro') return true; // unlimited
    if (authState.tokens < cost) {
      showUpgradePrompt();
      return false;
    }
    return true;
  }

  function showUpgradePrompt() {
    // Show upgrade in the generator card
    const card = $('.generator-card');
    // Temporarily show a notice
    const existing = card.querySelector('.upgrade-prompt');
    if (existing) return;
    const prompt = document.createElement('div');
    prompt.className = 'upgrade-prompt';
    prompt.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFB547" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      <h4>${T[currentLang].upgrade_title}</h4>
      <p>${T[currentLang].upgrade_desc}</p>
      <a href="#pricing" class="btn btn-secondary" onclick="this.closest('.upgrade-prompt').remove()">${T[currentLang].upgrade_cta}</a>
    `;
    card.appendChild(prompt);
    setTimeout(() => prompt.remove(), 8000);
  }

  /* ============================================
     TEXT GENERATOR FORM
     ============================================ */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkTokenGate(1)) return;
    submitGenerator();
  });

  function getSelectedPlatforms() {
    return Array.from($$('.pill-toggle.active')).map(p => p.dataset.platform);
  }

  function submitGenerator() {
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
      mode: authState.user ? 'paid' : 'demo'
    };

    form.classList.add('hidden');
    genResults.classList.add('hidden');
    genLoading.classList.remove('hidden');

    let pct = 0;
    const pctInterval = setInterval(() => {
      pct += Math.random() * 8;
      if (pct > 90) pct = 90;
      loadingPercent.textContent = Math.floor(pct) + '%';
    }, 200);

    const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };

    fetch(`${CGI_BIN}/generate`, { method: 'POST', headers, body: JSON.stringify(payload) })
      .then(res => { if (!res.ok) throw new Error('API error'); return res.json(); })
      .then(data => {
        clearInterval(pctInterval);
        loadingPercent.textContent = '100%';
        if (data.tokens_remaining !== undefined) {
          authState.tokens = data.tokens_remaining;
          updateAuthUI();
        }
        setTimeout(() => {
          genLoading.classList.add('hidden');
          renderTextResults(data.posts || [], data.tokens_remaining);
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

  /* ============================================
     IMAGE GENERATOR FORM
     ============================================ */
  if (imageForm) {
    imageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!checkTokenGate(1)) return;

      const payload = {
        prompt: $('#imgPrompt').value.trim(),
        platform: $('#imgPlatform').value,
        business_name: $('#imgBusiness').value.trim(),
        style: $('#imgStyle').value,
        language: $('#imgLang').value
      };

      imageForm.classList.add('hidden');
      imageResults.classList.add('hidden');
      genLoading.classList.remove('hidden');

      let pct = 0;
      const pctInterval = setInterval(() => {
        pct += Math.random() * 5;
        if (pct > 85) pct = 85;
        loadingPercent.textContent = Math.floor(pct) + '%';
      }, 300);

      try {
        const valid = await ensureValidToken();
        if (!valid) { throw new Error('auth_expired'); }

        const res = await fetch(`${CGI_BIN}/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('image_api_error');
        const data = await res.json();

        clearInterval(pctInterval);
        loadingPercent.textContent = '100%';
        if (data.tokens_remaining !== undefined) {
          authState.tokens = data.tokens_remaining;
          updateAuthUI();
        }

        setTimeout(() => {
          genLoading.classList.add('hidden');
          renderImageResult(data, data.tokens_remaining);
          imageResults.classList.remove('hidden');
        }, 400);
      } catch (err) {
        clearInterval(pctInterval);
        genLoading.classList.add('hidden');
        imageForm.classList.remove('hidden');
        if (err.message === 'auth_expired') {
          openAuthModal('login');
        } else {
          alert(T[currentLang].error_api);
        }
        console.error(err);
      }
    });
  }

  /* ============================================
     VIDEO GENERATOR FORM
     ============================================ */
  if (videoForm) {
    videoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!checkTokenGate(3)) return;

      const payload = {
        business_name: $('#vidBusiness').value.trim(),
        business_type: $('#vidType').value,
        target_audience: $('#vidAudience').value.trim(),
        platform: $('#vidPlatform').value,
        tone: $('#vidTone').value,
        language: $('#vidLang').value
      };

      videoForm.classList.add('hidden');
      videoResults.classList.add('hidden');
      genLoading.classList.remove('hidden');

      let pct = 0;
      const pctInterval = setInterval(() => {
        pct += Math.random() * 4;
        if (pct > 85) pct = 85;
        loadingPercent.textContent = Math.floor(pct) + '%';
      }, 300);

      try {
        const valid = await ensureValidToken();
        if (!valid) throw new Error('auth_expired');

        const res = await fetch(`${CGI_BIN}/video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('video_api_error');
        const data = await res.json();

        clearInterval(pctInterval);
        loadingPercent.textContent = '100%';
        if (data.tokens_remaining !== undefined) {
          authState.tokens = data.tokens_remaining;
          updateAuthUI();
        }

        setTimeout(() => {
          genLoading.classList.add('hidden');
          renderVideoResult(data, data.tokens_remaining);
          videoResults.classList.remove('hidden');
        }, 400);
      } catch (err) {
        clearInterval(pctInterval);
        genLoading.classList.add('hidden');
        videoForm.classList.remove('hidden');
        if (err.message === 'auth_expired') {
          openAuthModal('login');
        } else {
          alert(T[currentLang].error_api);
        }
        console.error(err);
      }
    });
  }

  /* ============================================
     RENDER: TEXT RESULTS
     ============================================ */
  const platformIcons = {
    instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    snapchat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-3.2 0-5.8 2.3-6 5.5-.1 1.4.2 2.5.2 2.5l-1.8.7c-.4.2-.5.5-.3.8.2.3.5.4.8.3l1.5-.6s-.2 1.8.8 3.2c.7 1 1.8 1.7 1.8 1.7s-1.5.5-2.5.8c-1 .3-1 .8-.4 1.1.6.3 2.2.4 3.2.4.8 0 1.5.5 2.1 1.2.5.6 1.2.9 2.1.9s1.6-.3 2.1-.9c.6-.7 1.3-1.2 2.1-1.2 1 0 2.6-.1 3.2-.4.6-.3.6-.8-.4-1.1-1-.3-2.5-.8-2.5-.8s1.1-.7 1.8-1.7c1-1.4.8-3.2.8-3.2l1.5.6c.3.1.6 0 .8-.3.2-.3.1-.6-.3-.8l-1.8-.7s.3-1.1.2-2.5C17.8 4.3 15.2 2 12 2z"/></svg>',
    tiktok: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.89 2.89 2.89 0 012.88-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.69 4.61V13.4a8.27 8.27 0 005.75 2.33V12.3a4.85 4.85 0 01-3.77-1.85V6.69z"/></svg>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
  };

  const platformClasses = { instagram: 'ig', x: 'x-plat', snapchat: 'snap', tiktok: 'tt', linkedin: 'li', facebook: 'fb' };
  const platformNames = { instagram: 'Instagram', x: 'X (Twitter)', snapchat: 'Snapchat', tiktok: 'TikTok', linkedin: 'LinkedIn', facebook: 'Facebook' };

  function renderTextResults(posts, tokensRemaining) {
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
      if (post.text_ar) bodyHtml += `<p class="result-text-ar">${escapeHtml(post.text_ar)}</p>`;
      if (post.text_en) bodyHtml += `<p class="result-text-en">${escapeHtml(post.text_en)}</p>`;
      const allTags = [...(post.hashtags_ar || []), ...(post.hashtags_en || [])];
      if (allTags.length > 0) {
        bodyHtml += `<div class="result-hashtags">${allTags.map(t => `<span class="result-tag">${escapeHtml(t)}</span>`).join(' ')}</div>`;
      }
      let copyBtns = '';
      if (post.text_ar) {
        copyBtns += `<button class="copy-btn" data-copy="${escapeAttr(post.text_ar + '\n' + (post.hashtags_ar || []).join(' '))}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          ${T[currentLang].copy_ar}
        </button>`;
      }
      if (post.text_en) {
        copyBtns += `<button class="copy-btn" data-copy="${escapeAttr(post.text_en + '\n' + (post.hashtags_en || []).join(' '))}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          ${T[currentLang].copy_en}
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

    bindCopyBtns(resultsGrid);

    // Tokens badge
    const badge = $('#tokensRemainingBadge');
    if (tokensRemaining !== undefined) {
      badge.textContent = `${tokensRemaining} ${T[currentLang].tokens_remaining}`;
      badge.classList.remove('hidden');
    }

    // Show upsell if not logged in or no tokens
    if (!authState.user) {
      upsellCard.classList.remove('hidden');
    } else {
      upsellCard.classList.add('hidden');
    }
  }

  /* ============================================
     RENDER: IMAGE RESULT
     ============================================ */
  function renderImageResult(data, tokensRemaining) {
    imageResultCard.innerHTML = '';

    if (data.image_data) {
      const img = document.createElement('img');
      img.src = `data:${data.mime_type || 'image/png'};base64,${data.image_data}`;
      img.alt = data.alt_text || '';
      img.loading = 'lazy';
      imageResultCard.appendChild(img);
    }

    if (data.alt_text) {
      const altDiv = document.createElement('div');
      altDiv.className = 'image-alt-text';
      altDiv.textContent = data.alt_text;
      imageResultCard.appendChild(altDiv);
    }

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'image-result-actions';

    if (data.image_data) {
      const dlBtn = document.createElement('a');
      dlBtn.className = 'copy-btn';
      dlBtn.href = `data:${data.mime_type || 'image/png'};base64,${data.image_data}`;
      dlBtn.download = 'postir-image.png';
      dlBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ${currentLang === 'ar' ? '\u062a\u062d\u0645\u064a\u0644' : 'Download'}`;
      actionsDiv.appendChild(dlBtn);
    }

    imageResultCard.appendChild(actionsDiv);

    const badge = $('#imgTokensBadge');
    if (tokensRemaining !== undefined) {
      badge.textContent = `${tokensRemaining} ${T[currentLang].tokens_remaining}`;
      badge.classList.remove('hidden');
    }
  }

  /* ============================================
     RENDER: VIDEO SLIDES
     ============================================ */
  function renderVideoResult(data, tokensRemaining) {
    videoSlidesContainer.innerHTML = '';

    // Meta bar
    if (data.total_duration || data.platform) {
      const meta = document.createElement('div');
      meta.className = 'video-reel-meta';
      meta.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        ${data.platform ? `<span>${data.platform}</span>` : ''}
        ${data.total_duration ? `<span>${data.total_duration}s</span>` : ''}
        ${currentLang === 'ar' ? `<span>${(data.slides || []).length} \u0634\u0631\u0627\u0626\u062d</span>` : `<span>${(data.slides || []).length} slides</span>`}
      `;
      videoSlidesContainer.appendChild(meta);
    }

    const slides = data.slides || [];
    slides.forEach((slide, i) => {
      const card = document.createElement('div');
      card.className = 'slide-card';
      let bodyHtml = '';
      if (slide.text_ar) bodyHtml += `<p class="slide-text-ar">${escapeHtml(slide.text_ar)}</p>`;
      if (slide.text_en) bodyHtml += `<p class="slide-text-en">${escapeHtml(slide.text_en)}</p>`;
      if (slide.visual_keyword) {
        bodyHtml += `<span class="slide-keyword">${escapeHtml(slide.visual_keyword)}</span>`;
      }
      if (slide.video_url) {
        bodyHtml += `<video class="slide-video-preview" src="${escapeHtml(slide.video_url)}" controls muted playsinline></video>`;
      }
      card.innerHTML = `
        <div class="slide-card-header">
          <div class="slide-number">
            <span>${i + 1}</span>
            ${T[currentLang].slide_label} ${i + 1}
          </div>
          ${slide.duration_seconds ? `<span class="slide-duration">${slide.duration_seconds}s</span>` : ''}
        </div>
        <div class="slide-body">${bodyHtml}</div>
      `;
      videoSlidesContainer.appendChild(card);
    });

    const badge = $('#vidTokensBadge');
    if (tokensRemaining !== undefined) {
      badge.textContent = `${tokensRemaining} ${T[currentLang].tokens_remaining}`;
      badge.classList.remove('hidden');
    }
  }

  /* ============================================
     NEW REQUEST BUTTONS
     ============================================ */
  if (newGenBtn) {
    newGenBtn.addEventListener('click', () => {
      genResults.classList.add('hidden');
      form.classList.remove('hidden');
      loadingPercent.textContent = '0%';
      document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (newImageBtn) {
    newImageBtn.addEventListener('click', () => {
      imageResults.classList.add('hidden');
      imageForm.classList.remove('hidden');
    });
  }

  if (newVideoBtn) {
    newVideoBtn.addEventListener('click', () => {
      videoResults.classList.add('hidden');
      videoForm.classList.remove('hidden');
    });
  }

  /* ============================================
     DASHBOARD BAR
     ============================================ */
  if (dashCloseBtn) {
    dashCloseBtn.addEventListener('click', () => {
      dashboardBar.classList.add('hidden');
    });
  }

  if (dashHistoryBtn) {
    dashHistoryBtn.addEventListener('click', openHistoryModal);
  }

  /* ============================================
     HISTORY MODAL
     ============================================ */
  function openHistoryModal() {
    historyModalBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadHistory();
  }

  function closeHistoryModal() {
    historyModalBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (historyModalClose) historyModalClose.addEventListener('click', closeHistoryModal);
  historyModalBackdrop.addEventListener('click', (e) => {
    if (e.target === historyModalBackdrop) closeHistoryModal();
  });

  async function loadHistory() {
    historyList.innerHTML = '<div class="history-loading"><svg class="spin-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B9FF66" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></div>';

    try {
      const valid = await ensureValidToken();
      if (!valid) { historyList.innerHTML = `<div class="history-empty">${currentLang === 'ar' ? '\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644' : 'Please sign in'}</div>`; return; }

      const res = await fetch(`${CGI_BIN}/usage`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error('history_error');
      const data = await res.json();
      renderHistory(data.history || data.items || []);
    } catch {
      historyList.innerHTML = `<div class="history-empty">${currentLang === 'ar' ? '\u0644\u0627 \u064a\u0645\u0643\u0646 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0633\u062c\u0644 \u0627\u0644\u0622\u0646' : 'Unable to load history'}</div>`;
    }
  }

  function renderHistory(items) {
    if (!items || items.length === 0) {
      historyList.innerHTML = `<div class="history-empty">${currentLang === 'ar' ? '\u0644\u0627 \u064a\u0648\u062c\u062f \u0633\u062c\u0644 \u0628\u0639\u062f' : 'No history yet'}</div>`;
      return;
    }
    const typeIcons = {
      text: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      image: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
      video: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'
    };
    historyList.innerHTML = items.map(item => {
      const icon = typeIcons[item.type] || typeIcons.text;
      const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US') : '';
      return `
        <div class="history-item">
          <div class="history-item-icon">${icon}</div>
          <div class="history-item-body">
            <div class="history-item-title">${escapeHtml(item.business_name || item.title || '\u2014')}</div>
            <div class="history-item-meta">${item.type || 'text'} \u00b7 ${dateStr}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ============================================
     PRICING BUTTONS
     ============================================ */
  $$('.pricing-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      if (!authState.user && plan !== 'free') {
        openAuthModal('signup');
        return;
      }
      if (!authState.user && plan === 'free') {
        openAuthModal('signup');
        return;
      }
      if (plan === 'free') {
        // Scroll to generator
        document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      initiatePayment(plan);
    });
  });

  async function initiatePayment(plan) {
    const btn = plan === 'starter' ? $('#payPpuBtn') : $('#payProBtn');
    if (!btn) return;
    const origText = btn.textContent;
    btn.textContent = T[currentLang].payment_loading;
    btn.disabled = true;

    try {
      const valid = await ensureValidToken();
      if (!valid) {
        openAuthModal('login');
        return;
      }
      const res = await fetch(`${CGI_BIN}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ plan })
      });
      if (!res.ok) throw new Error('payment_error');
      const data = await res.json();
      // For now show "coming soon"
      showToast(T[currentLang].payment_soon, 'info');
    } catch (err) {
      showToast(T[currentLang].payment_error, 'error');
      console.error(err);
    } finally {
      btn.textContent = origText;
      btn.disabled = false;
    }
  }

  /* ============================================
     DEMO FLOW (hero CTA)
     ============================================ */
  function fillDemo() {
    // If not logged in, open auth modal first
    if (!authState.user) {
      openAuthModal('signup');
      return;
    }
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
  }

  $$('a[href="#generator"].btn').forEach(a => a.addEventListener('click', (e) => {
    // just scroll
  }));

  // Pricing demo btn now handled by pricing-plan-btn class above

  /* ============================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ============================================ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile nav if open
        mobileNavOverlay.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  });

  /* ============================================
     HELPERS
     ============================================ */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
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

  function bindCopyBtns(container) {
    container.querySelectorAll('.copy-btn').forEach(btn => {
      if (btn.tagName === 'A') return; // skip download links
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        copyToClipboard(text).then(() => {
          const origText = btn.innerHTML;
          btn.classList.add('copied');
          const svgPart = btn.querySelector('svg') ? btn.querySelector('svg').outerHTML : '';
          btn.innerHTML = svgPart + ' ' + T[currentLang].copied;
          setTimeout(() => {
            btn.innerHTML = origText;
            btn.classList.remove('copied');
          }, 2000);
        });
      });
    });
  }

  /* ============================================
     TOAST NOTIFICATIONS
     ============================================ */
  function showToast(message, type) {
    const existing = document.querySelectorAll('.postir-toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'postir-toast';
    const colors = { success: '#B9FF66', error: '#FF6B6B', info: '#A0AEC0' };
    const color = colors[type] || colors.info;
    toast.style.cssText = `
      position: fixed;
      top: calc(var(--header-h) + 16px);
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      z-index: 9999;
      padding: 12px 24px;
      background: rgba(17,22,35,0.95);
      border: 1px solid ${color};
      border-radius: 100px;
      color: ${color};
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
      opacity: 0;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ============================================
     AIRWALLEX PAYMENT (V1 compat)
     ============================================ */
  let airwallexReady = false;
  let airwallexPayments = null;

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

  /* ============================================
     PAYMENT SUCCESS RETURN
     ============================================ */
  if (window.location.search.includes('payment=success')) {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const successMsg = currentLang === 'ar'
      ? (plan === 'pro' ? '\u062a\u0645 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0646\u062c\u0627\u062d! \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u062a\u0648\u0644\u064a\u062f \u0628\u0648\u0633\u062a\u0627\u062a \u063a\u064a\u0631 \u0645\u062d\u062f\u0648\u062f\u0629.' : '\u062a\u0645 \u0627\u0644\u062f\u0641\u0639 \u0628\u0646\u062c\u0627\u062d! \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u062a\u0648\u0644\u064a\u062f 10 \u0631\u0645\u0648\u0632.')
      : (plan === 'pro' ? 'Subscription successful! You can now generate unlimited content.' : 'Payment successful! You now have 10 tokens.');

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
    history.replaceState(null, '', window.location.pathname);
  }

  /* ============================================
     INITIALIZE
     ============================================ */
  setLang('ar');
  restoreSession();

})();
