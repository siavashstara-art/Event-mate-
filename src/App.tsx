import React, {useEffect, useMemo, useState} from 'react';
import {
  Accessibility,
  CalendarHeart,
  Check,
  CheckCircle2,
  Crown,
  Download,
  FileCheck2,
  Flame,
  Gift,
  Globe,
  Heart,
  Mail,
  MessageCircle,
  PartyPopper,
  PhoneCall,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  Wallet,
  X,
} from 'lucide-react';
import {
  AccessibilitySettings,
  CurrencyCode,
  FlashDateOffer,
  LanguageCode,
  MenuCategory,
  ServingStyleId,
  VenuePackage,
} from './types';
import {
  CURRENCIES,
  FLASH_DATES,
  HALL_BRAND_PRESETS,
  LANGUAGES,
  MENU_ITEMS,
  SERVING_STYLES,
  UI_TEXT,
  VENUE_PACKAGES,
} from './data';
import {
  formatMoney,
  formatNumberLocale,
  generateSayyadiSchedule,
} from './utils/formatters';
import {AccessibilityPanel} from './components/AccessibilityPanel';
import {GmailInvoiceModal} from './components/GmailInvoiceModal';
import {StoryMakerAnalytics} from './components/StoryMakerAnalytics';
import {MarketerAndAndroidHub} from './components/MarketerAndAndroidHub';
import {
  CustomHallBrand,
  WhiteLabelAndVisitorSuite,
} from './components/WhiteLabelAndVisitorSuite';
import {
  FamilySplitState,
  HallValueAndCreativeSuite,
  SayyadiInquiryState,
} from './components/HallValueAndCreativeSuite';
import {HallBenefitsAndVisitorPlaybook} from './components/HallBenefitsAndVisitorPlaybook';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export default function App() {
  // Language & Currency State
  const [lang, setLang] = useState<LanguageCode>('FA');
  const [currency, setCurrency] = useState<CurrencyCode>('IRT');
  const [liveRates, setLiveRates] = useState<Record<CurrencyCode, number> | undefined>(
    undefined,
  );

  // Accessibility & ADHD State
  const [a11yOpen, setA11yOpen] = useState(false);
  const [a11y, setA11y] = useState<AccessibilitySettings>({
    fontScale: 100,
    highContrast: false,
    adhdFocusMode: false,
    adhdReadingGuide: false,
    motorLargeTargets: false,
    readableSpacing: false,
    voiceRate: 1.0,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readingGuideY, setReadingGuideY] = useState<number>(260);

  // Menu Builder & Sayyadi Calculator State
  const [guestCount, setGuestCount] = useState<number>(300);
  const [servingStyleId, setServingStyleId] = useState<ServingStyleId>('imperial_buffet');
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('main');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([
    'main-baghali-mahiche',
    'main-soltani-kebab',
    'app-salad-bar',
    'app-fingerfood-vip',
    'fp-tropical-fruits',
    'fp-french-pastry-cake',
    'cer-dutch-floral',
    'cer-lighting-music',
  ]);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [installmentMonths, setInstallmentMonths] = useState<number>(6);
  const [selectedFlashDate, setSelectedFlashDate] = useState<FlashDateOffer | null>(
    FLASH_DATES[0],
  );

  // White-Label Custom Hall / Agency Branding State (Isolated per ?hall=royal-palace tenant)
  const [customBrand, setCustomBrand] = useState<CustomHallBrand>(() => {
    const params = new URLSearchParams(window.location.search);
    const hallParam = (params.get('hall') || '').trim();
    const matchedPreset =
      HALL_BRAND_PRESETS.find(
        (p) =>
          p.slug.toLowerCase() === hallParam.toLowerCase() ||
          p.hallName === hallParam,
      ) || HALL_BRAND_PRESETS[0];

    const tenantSlug =
      matchedPreset.slug === hallParam.toLowerCase()
        ? matchedPreset.slug
        : hallParam
          ? hallParam.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'custom-hall'
          : matchedPreset.slug;

    try {
      const savedIsolated = localStorage.getItem(`eventmate_tenant_${tenantSlug}`);
      if (savedIsolated && !hallParam) {
        return JSON.parse(savedIsolated) as CustomHallBrand;
      }
    } catch {
      // Ignore storage error
    }

    return {
      tenantSlug,
      logoMonogram: matchedPreset.logoMonogram,
      hallName:
        hallParam && hallParam.toLowerCase() !== matchedPreset.slug
          ? hallParam
          : matchedPreset.hallName,
      agencyType: matchedPreset.agencyType,
      managerName: params.get('manager') || matchedPreset.managerName,
      city: params.get('city') || matchedPreset.city,
      whatsapp: params.get('phone') || matchedPreset.whatsapp,
      slogan: matchedPreset.slogan,
      priceMultiplier: matchedPreset.priceMultiplier,
    };
  });

  // New Value Drivers & Creative Memorial Modules State
  const [inflationShieldEnabled, setInflationShieldEnabled] = useState<boolean>(true);
  const [weatherInsuranceEnabled, setWeatherInsuranceEnabled] = useState<boolean>(true);
  const [barakatCharityEnabled, setBarakatCharityEnabled] = useState<boolean>(true);
  const [sayyadiInquiry, setSayyadiInquiry] = useState<SayyadiInquiryState>({
    sayyadiId: '1405889040591820',
    nationalId: '0012345678',
    statusColor: 'WHITE',
    statusLabel: 'وضعیت سفید (خوش‌حساب ممتاز — فاقد هرگونه چک برگشتی)',
    creditScore: 895,
    bouncedCount: 0,
    hallRecommendation:
      'مورد تایید ۱۰۰٪ تالار — مجاز به تقسیط کامل ۳ تا ۱۲ ماهه با چک صیادی بنفش.',
  });
  const [familySplit, setFamilySplit] = useState<FamilySplitState>({
    couplePercent: 50,
    groomFamilyPercent: 30,
    brideFamilyPercent: 20,
  });

  // Customer & Contract Details
  const [customerName, setCustomerName] = useState('امیرحسین و سارا (عروس و داماد VIP)');
  const [customerPhone, setCustomerPhone] = useState('09123456789');
  const [hallManagerWhatsapp, setHallManagerWhatsapp] = useState(
    () => new URLSearchParams(window.location.search).get('phone') || '989123456789',
  );

  const handleUpdateBrand = (nextBrand: CustomHallBrand) => {
    const slug =
      nextBrand.tenantSlug ||
      nextBrand.hallName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-') ||
      'royal-palace';
    const enriched = {...nextBrand, tenantSlug: slug};
    setCustomBrand(enriched);
    if (enriched.whatsapp) {
      setHallManagerWhatsapp(enriched.whatsapp);
    }
    try {
      localStorage.setItem(`eventmate_tenant_${slug}`, JSON.stringify(enriched));
    } catch {
      // Ignore storage error
    }
  };
  const [savedTrackingCode, setSavedTrackingCode] = useState<string | null>(null);
  const [savingContract, setSavingContract] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  // Modals State
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  // Offline/AI Banquet Concierge State
  const [conciergeQuery, setConciergeQuery] = useState('');
  const [conciergeReply, setConciergeReply] = useState<string | null>(null);
  const [conciergeLoading, setConciergeLoading] = useState(false);

  const currentLangMeta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const t = UI_TEXT[lang];

  // Sync HTML dir/lang, isolated Hall page title, and Accessibility classes
  useEffect(() => {
    document.documentElement.dir = currentLangMeta.dir;
    document.documentElement.lang = lang.toLowerCase();
    document.title = `${customBrand.hallName} | سامانه منوساز و چک صیادی EventMate VIP`;
  }, [lang, currentLangMeta, customBrand.hallName]);

  useEffect(() => {
    document.body.classList.toggle('a11y-high-contrast', a11y.highContrast);
    document.body.classList.toggle('a11y-adhd-focus', a11y.adhdFocusMode);
    document.body.classList.toggle('a11y-readable-spacing', a11y.readableSpacing);
    document.body.classList.toggle('a11y-motor-large', Boolean(a11y.motorLargeTargets));
    document.documentElement.style.fontSize = `${a11y.fontScale}%`;
  }, [a11y]);

  useEffect(() => {
    if (!a11y.adhdReadingGuide) return;
    const onMove = (e: MouseEvent) => setReadingGuideY(e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches?.[0]) setReadingGuideY(e.touches[0].clientY);
    };
    window.addEventListener('mousemove', onMove, {passive: true});
    window.addEventListener('touchmove', onTouch, {passive: true});
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [a11y.adhdReadingGuide]);

  // Fetch live exchange rates from server.ts
  useEffect(() => {
    fetch('/api/rates')
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) {
          setLiveRates(data.rates);
        }
      })
      .catch(() => {
        // Fallback already in CURRENCIES
      });
  }, []);

  // Capture PWA Install Prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Core Banquet Cost & Sayyadi Installment Calculations
  const servingStyle = useMemo(
    () => SERVING_STYLES.find((s) => s.id === servingStyleId) || SERVING_STYLES[0],
    [servingStyleId],
  );

  const selectedItems = useMemo(
    () => MENU_ITEMS.filter((item) => selectedItemIds.includes(item.id)),
    [selectedItemIds],
  );

  const calculation = useMemo(() => {
    const perGuestFoodSum = selectedItems
      .filter((i) => i.pricingType === 'per_guest')
      .reduce((acc, item) => acc + item.priceToman, 0);

    const fixedCeremonialSum = selectedItems
      .filter((i) => i.pricingType === 'fixed_event')
      .reduce((acc, item) => acc + item.priceToman, 0);

    const styledFoodPerGuest = Math.round(
      (perGuestFoodSum * servingStyle.multiplier + servingStyle.serviceFeePerGuestToman) *
        customBrand.priceMultiplier,
    );

    const rawTotalToman =
      styledFoodPerGuest * guestCount +
      Math.round(fixedCeremonialSum * customBrand.priceMultiplier);
    const discountPercent = selectedFlashDate ? selectedFlashDate.discountPercent : 0;
    const discountAmountToman = Math.round((rawTotalToman * discountPercent) / 100);
    const finalTotalToman = Math.max(0, rawTotalToman - discountAmountToman);
    const finalPerGuestToman = Math.round(finalTotalToman / Math.max(1, guestCount));

    const downPaymentToman = Math.round((finalTotalToman * downPaymentPercent) / 100);
    const remainingForChecksToman = Math.max(0, finalTotalToman - downPaymentToman);
    const eachCheckToman =
      installmentMonths > 0 ? Math.round(remainingForChecksToman / installmentMonths) : 0;

    const checks = generateSayyadiSchedule(remainingForChecksToman, installmentMonths);

    return {
      rawTotalToman,
      discountPercent,
      discountAmountToman,
      finalTotalToman,
      finalPerGuestToman,
      downPaymentToman,
      remainingForChecksToman,
      eachCheckToman,
      checks,
    };
  }, [
    selectedItems,
    servingStyle,
    guestCount,
    selectedFlashDate,
    downPaymentPercent,
    installmentMonths,
    customBrand.priceMultiplier,
  ]);

  const toggleMenuItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleApplyPackage = (pkg: VenuePackage) => {
    setGuestCount(pkg.baseGuestCount);
    setServingStyleId(pkg.servingStyle);
    setSelectedItemIds(pkg.includedItemIds);
    setInstallmentMonths(pkg.sayyadiMonths);
    setCelebrationBanner(
      `🎉 پکیج «${pkg.title[lang]}» برای ${formatNumberLocale(pkg.baseGuestCount, lang)} مهمان بارگذاری شد!`,
    );
    setTimeout(() => setCelebrationBanner(null), 5000);
    document.getElementById('builder')?.scrollIntoView({behavior: 'smooth'});
  };

  const handleSelectFlashDate = (offer: FlashDateOffer) => {
    setSelectedFlashDate(offer);
    setCelebrationBanner(
      `🌸 شب تخفیف‌دار «${offer.persianDate}» (${offer.discountPercent}٪ تخفیف + ${offer.giftBonus[lang]}) روی فاکتور شما اعمال شد!`,
    );
    setTimeout(() => setCelebrationBanner(null), 5000);
    document.getElementById('builder')?.scrollIntoView({behavior: 'smooth'});
  };

  // Voice Reader for Visually Impaired Users
  const handleSpeakInvoice = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const speechText =
      lang === 'FA'
        ? `به سامانه ایونت‌میت خوش آمدید. خلاصه پیش‌فاکتور رسمی جشن عروسی شما برای ${guestCount} نفر مهمان، با سبک پذیرایی ${servingStyle.title.FA}. هزینه تمام‌شده هر نفر، ${formatMoney(calculation.finalPerGuestToman, currency, lang)}. جمع کل قرارداد پس از تخفیف، ${formatMoney(calculation.finalTotalToman, currency, lang)}. مبلغ پیش‌پرداخت نقدی، ${formatMoney(calculation.downPaymentToman, currency, lang)}، و مانده در ${installmentMonths} فقره چک صیادی، هر برگ چک به مبلغ ${formatMoney(calculation.eachCheckToman, currency, lang)} می‌باشد.`
        : lang === 'KU'
          ? `بەخێربێن بۆ سیستەمی ئیڤێنت مەیت. کورتەی پێش‌فاکتۆری ئاهەنگی زەماوەند بۆ ${guestCount} میوان. تێچووی هەر کەسێک ${formatMoney(calculation.finalPerGuestToman, currency, lang)}. کۆی گشتی گرێبەست ${formatMoney(calculation.finalTotalToman, currency, lang)}. پێشەکی کاش ${formatMoney(calculation.downPaymentToman, currency, lang)} و ${installmentMonths} چەکی سەیادی هەر یەک بە بڕی ${formatMoney(calculation.eachCheckToman, currency, lang)}.`
          : lang === 'HY'
            ? `Բարի գալուստ EventMate VIP: Հարսանեկան նախահաշիվ ${guestCount} հյուրի համար: Մեկ անձի արժեքը՝ ${formatMoney(calculation.finalPerGuestToman, currency, lang)}: Պայմանագրի ընդհանուր գումարը՝ ${formatMoney(calculation.finalTotalToman, currency, lang)}, կանխավճարը՝ ${formatMoney(calculation.downPaymentToman, currency, lang)}, և ${installmentMonths} Սայադի չեկ՝ յուրաքանչյուրը ${formatMoney(calculation.eachCheckToman, currency, lang)}:`
            : lang === 'AR'
              ? `ملخص فاتورة الحفل الرسمي في إيفنت ميت لعدد ${guestCount} ضيف. تكلفة الفرد ${formatMoney(calculation.finalPerGuestToman, currency, lang)}. إجمالي العقد ${formatMoney(calculation.finalTotalToman, currency, lang)}. الدفعة الأولى ${formatMoney(calculation.downPaymentToman, currency, lang)}، وعدد ${installmentMonths} شيكات بقيمة ${formatMoney(calculation.eachCheckToman, currency, lang)} لكل شيك.`
              : `EventMate VIP Official Wedding Proforma Invoice for ${guestCount} guests with ${servingStyle.title.EN}. Final cost per guest is ${formatMoney(calculation.finalPerGuestToman, currency, lang)}. Total contract is ${formatMoney(calculation.finalTotalToman, currency, lang)}. Cash down payment is ${formatMoney(calculation.downPaymentToman, currency, lang)}, with ${installmentMonths} Sayyadi check installments of ${formatMoney(calculation.eachCheckToman, currency, lang)} each.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = currentLangMeta.voiceLang;
    utterance.rate = a11y.voiceRate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Send Official Proforma to Hall Manager WhatsApp
  const handleSendWhatsApp = () => {
    const itemLines = selectedItems.map((i) => `✅ ${i.name[lang]}`).join('\n');
    const checkLines = calculation.checks
      .slice(0, 6)
      .map(
        (c) =>
          `• چک ${c.checkNumber} (${c.dueDatePersian}): ${formatMoney(c.amountToman, currency, lang)}`,
      )
      .join('\n');

    const coupleCheckShareToman = Math.round(
      (calculation.eachCheckToman * familySplit.couplePercent) / 100,
    );
    const groomFamCheckShareToman = Math.round(
      (calculation.eachCheckToman * familySplit.groomFamilyPercent) / 100,
    );
    const brideFamCheckShareToman = Math.max(
      0,
      calculation.eachCheckToman - coupleCheckShareToman - groomFamCheckShareToman,
    );

    const message = `👑 *پیش‌فاکتور رسمی جشن عروسی و تشریفات — ${customBrand.hallName}*
🔒 *شناسه ایزوله تالار:* ?hall=${customBrand.tenantSlug || 'royal-palace'}
🌸 *مدیریت محترم: ${customBrand.managerName} (${customBrand.city})*
🏛️ *${customBrand.slogan}*
────────────────────
👰🤵 *میزبان:* ${customerName}
📞 *تلفن تماس:* ${customerPhone}
📅 *تاریخ انتخابی:* ${selectedFlashDate ? `${selectedFlashDate.persianDate} (${selectedFlashDate.discountPercent}% تخفیف)` : 'پاییز ۱۴۰۵'}
👥 *تعداد مهمانان:* ${formatNumberLocale(guestCount, lang)} نفر
🍽️ *سبک پذیرایی:* ${servingStyle.title[lang] || servingStyle.title.FA}
────────────────────
💎 *هزینه هر نفر:* ${formatMoney(calculation.finalPerGuestToman, currency, lang)}
💰 *جمع کل قرارداد:* *${formatMoney(calculation.finalTotalToman, currency, lang)}*
💵 *پیش‌پرداخت نقدی (${downPaymentPercent}%):* ${formatMoney(calculation.downPaymentToman, currency, lang)}
📝 *اقساط چک صیادی (${installmentMonths} ماهه):* هر چک *${formatMoney(calculation.eachCheckToman, currency, lang)}*
────────────────────
🛡️ *استعلام اعتبار چک صیادی:* ${sayyadiInquiry.statusLabel} (امتیاز ${sayyadiInquiry.creditScore}/1000)
🔒 *ضمانت قیمت ضدتورم منو:* ${inflationShieldEnabled ? 'فعال (تضمین ۱۰۰٪ ثبات قیمت مواد اولیه تا شب مراسم)' : 'غیرفعال'}
👨‍👩‍👧‍👦 *تسهیم هزینه بین خانواده‌ها:*
• سهم عروس و داماد (${familySplit.couplePercent}%): هر چک ${formatMoney(coupleCheckShareToman, currency, lang)}
• سهم خانواده داماد (${familySplit.groomFamilyPercent}%): هر چک ${formatMoney(groomFamCheckShareToman, currency, lang)}
• سهم خانواده عروس (${familySplit.brideFamilyPercent}%): هر چک ${formatMoney(brideFamCheckShareToman, currency, lang)}
────────────────────
✨ *منوی انتخابی مجلس:*
${itemLines}
────────────────────
🏦 *برنامه چک‌های صیادی بنفش:*
${checkLines}`;

    const cleanPhone = hallManagerWhatsapp.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Save Contract to Express Backend (/api/reservations)
  const handleSaveReservation = async () => {
    setSavingContract(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          tenantId: customBrand.tenantSlug || 'royal-palace',
          customerName,
          customerPhone,
          eventDate: selectedFlashDate ? selectedFlashDate.persianDate : '1405/08/15',
          guestCount,
          servingStyle: servingStyle.title[lang] || servingStyle.title.FA,
          totalToman: calculation.finalTotalToman,
          downPaymentToman: calculation.downPaymentToman,
          installmentMonths,
          eachCheckToman: calculation.eachCheckToman,
          selectedItems: selectedItems.map((i) => i.name[lang] || i.name.FA),
          inflationShieldEnabled,
          sayyadiStatusColor: sayyadiInquiry.statusColor,
        }),
      });
      const data = (await res.json()) as {
        reservation?: {trackingCode: string};
      };
      const code = data.reservation?.trackingCode || `EVM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSavedTrackingCode(code);
      setCelebrationBanner(`🎊 قرارداد رسمی عروسی شما با کد رهگیری ${code} ثبت شد!`);
    } catch {
      const fallbackCode = `EVM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSavedTrackingCode(fallbackCode);
    } finally {
      setSavingContract(false);
    }
  };

  // Ask Smart Offline/AI Banquet Concierge
  const handleAskConcierge = async (e: React.FormEvent) => {
    e.preventDefault();
    setConciergeLoading(true);
    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          query: conciergeQuery || 'پیشنهاد منوی عروسی باشکوه و شرایط چک صیادی',
          guestCount,
          budgetToman: calculation.finalTotalToman,
          lang,
        }),
      });
      const data = (await res.json()) as {reply?: string};
      setConciergeReply(data.reply || null);
    } catch {
      setConciergeReply(
        `👑 مشاور هوشمند EventMate VIP: برای ${formatNumberLocale(guestCount, lang)} مهمان، ترکیب باقالی‌پلو با گردن و چلوکباب سلطانی با ۶ فقره چک صیادی هر یک به مبلغ ${formatMoney(calculation.eachCheckToman, currency, lang)} بهترین انتخاب اشرافی است.`,
      );
    } finally {
      setConciergeLoading(false);
    }
  };

  // Handle 1-Click PWA Install
  const handleInstallPwaClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setPwaModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#E11D48] selection:text-white">
      {/* 1. TOP FESTIVE WEDDING RIBBON & LANGUAGE/CURRENCY/A11Y BAR */}
      <div className="bg-gradient-to-r from-[#2C1E16] via-[#4A1525] to-[#2C1E16] text-[#FAF7F2] border-b border-[#D4AF37]/50 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold">
            <PartyPopper className="w-4 h-4 text-[#F43F5E] shrink-0" />
            <span className="text-[#E6C258]">{t.appSubtitle}</span>
            <span className="hidden md:inline text-rose-200">
              • جشن عروسی رویایی با تقسیط چک صیادی بنفش و تخفیف شب‌های خالی
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 5-Language Switcher */}
            <div
              className="flex items-center bg-[#3E2723] rounded-xl p-0.5 border border-[#C59B27]/40"
              role="group"
              aria-label="Language Switcher"
            >
              <Globe className="w-3.5 h-3.5 text-[#E6C258] mx-1.5" />
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    lang === l.code
                      ? 'bg-gradient-to-r from-[#E11D48] to-[#D4AF37] text-white shadow'
                      : 'text-[#E6DFD3] hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* 5-Currency Switcher */}
            <div
              className="flex items-center bg-[#3E2723] rounded-xl p-0.5 border border-[#C59B27]/40"
              role="group"
              aria-label="Currency Switcher"
            >
              <Wallet className="w-3.5 h-3.5 text-[#E6C258] mx-1.5" />
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`px-2 py-1 rounded-lg font-mono-num font-bold text-[11px] transition cursor-pointer ${
                    currency === c.code
                      ? 'bg-[#E6C258] text-[#1E130D] shadow'
                      : 'text-[#E6DFD3] hover:text-white'
                  }`}
                >
                  {c.code === 'IRT' ? 'تومان' : c.code}
                </button>
              ))}
            </div>

            {/* Accessibility & ADHD Quick Trigger */}
            <button
              onClick={() => setA11yOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8215] text-[#1E130D] font-extrabold text-[11px] shadow hover:brightness-105 transition cursor-pointer"
            >
              <Accessibility className="w-4 h-4" />
              <span>{lang === 'FA' ? 'دسترسی‌پذیری و ADHD' : 'Accessibility & ADHD'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STICKY FESTIVE WEDDING NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b-2 border-[#D4AF37]/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E11D48] via-[#D4AF37] to-[#2C1E16] p-0.5 shadow-md">
              <div className="w-full h-full rounded-[14px] bg-[#FFFDF9] flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#E11D48] group-hover:scale-110 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-[#2C1E16] tracking-tight">
                  {customBrand.hallName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-[#E11D48] border border-rose-200">
                  شخصی‌سازی‌شده VIP
                </span>
              </div>
              <p className="text-[11px] text-[#6E5A4F] font-medium">
                {customBrand.slogan}
              </p>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-extrabold text-[#2C1E16]">
            <a
              href="#builder"
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0F3] hover:text-[#E11D48] transition"
            >
              🎂 {t.navBuilder}
            </a>
            <a
              href="#value-drivers"
              className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              🛡️ استعلام چک + تقسیم هزینه + یادگاری خلاقانه
            </a>
            <a
              href="#flash-dates"
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0F3] hover:text-[#E11D48] transition"
            >
              🔥 {t.navFlashDates}
            </a>
            <a
              href="#packages"
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0F3] hover:text-[#E11D48] transition"
            >
              👑 {t.navPackages}
            </a>
            <a
              href="#analytics"
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0F3] hover:text-[#E11D48] transition"
            >
              📸 {t.navAnalytics}
            </a>
            <a
              href="#hall-deliverables"
              className="px-3 py-2 rounded-xl bg-amber-50 text-[#9A7411] border border-amber-300 hover:bg-amber-100 transition"
            >
              🎁 تالاردار چه به دست می‌آورد؟
            </a>
            <a
              href="#visitor-playbook"
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#2C1E16] to-[#4A1525] text-[#E6C258] border border-[#D4AF37] hover:brightness-110 transition"
            >
              🧭 راهکار ویزیتورها + فرمول طلایی
            </a>
            <a
              href="#invitation-letter"
              className="px-3 py-2 rounded-xl bg-rose-50 text-[#E11D48] border border-rose-200 hover:bg-rose-100 transition"
            >
              💌 دعوت‌نامه + ۲۵٪ سود ویزیتور
            </a>
            <a
              href="#hall-ads"
              className="px-3 py-2 rounded-xl bg-amber-100 text-[#2C1E16] border border-[#D4AF37] hover:bg-amber-200 transition"
            >
              📢 تبلیغات تالارها
            </a>
            <a
              href="#android-ci"
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0F3] hover:text-[#E11D48] transition"
            >
              🤖 {t.navAndroidCi}
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallPwaClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0F3] text-[#E11D48] border border-rose-300 font-extrabold text-xs hover:bg-rose-100 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t.ctaInstallPwa}</span>
              <span className="sm:hidden">نصب اپ</span>
            </button>

            <button
              onClick={() => setVipModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#D4AF37] text-white font-extrabold text-xs shadow-md hover:brightness-105 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>پنل تالارداران و VIP</span>
            </button>
          </div>
        </div>

        {/* Dedicated Quick-Access Sub-Menu Bar for Hall Deliverables & Visitor Playbook (All Screens) */}
        <div className="bg-[#FAF7F2] border-t border-[#E6DFD3] px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#hall-deliverables"
                className="px-3 py-1.5 rounded-xl bg-[#2C1E16] text-[#E6C258] font-extrabold hover:bg-[#3E2723] transition flex items-center gap-1.5 shadow-sm"
              >
                <span>🎁 تالاردارها در صورت خرید این برنامه چه چیزی به دست می‌آورند؟ (۸ دستاورد + سود یک‌شبه)</span>
              </a>
              <a
                href="#visitor-playbook"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-extrabold hover:brightness-105 transition flex items-center gap-1.5 shadow-sm"
              >
                <span>🧭 راهکار و راهنمای ویزیتورها: ابتدا کدام قابلیت‌ها را معرفی نمایند؟</span>
              </a>
              <a
                href="#golden-formula"
                className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold hover:bg-emerald-200 transition flex items-center gap-1"
              >
                <span>🔑 آموزش فرمول طلایی فروش (۱۲ میلیون نقد + ۲ چک)</span>
              </a>
            </div>
            <a
              href="#invitation-letter"
              className="text-[11px] font-extrabold text-[#9A7411] hover:text-[#E11D48] transition"
            >
              ثبت فروش لایسنس و دریافت ۲۵٪ شبا ←
            </a>
          </div>
        </div>
      </header>

      {/* Celebration Toast Banner */}
      {celebrationBanner && (
        <div className="sticky top-[68px] z-30 bg-gradient-to-r from-[#E11D48] via-[#D4AF37] to-[#E11D48] text-white px-4 py-2.5 text-center text-xs sm:text-sm font-extrabold shadow-lg flex items-center justify-center gap-2">
          <PartyPopper className="w-5 h-5 shrink-0" />
          <span>{celebrationBanner}</span>
          <button
            onClick={() => setCelebrationBanner(null)}
            className="ms-3 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ADHD Visual Reading Focus Ruler (خط‌کش نوری تمرکز مطالعه ویژه ADHD) */}
      {a11y.adhdReadingGuide && (
        <div
          style={{top: `${Math.max(40, readingGuideY - 22)}px`}}
          className="fixed inset-x-0 h-12 pointer-events-none z-50 bg-amber-300/25 border-y-2 border-[#E11D48] shadow-lg transition-all duration-75"
          aria-hidden="true"
        />
      )}

      {/* QUICK OVERSIGHT SUMMARY CARDS SECTION (ABOVE MAIN CONTENT) */}
      <section
        aria-label={
          lang === 'FA'
            ? 'خلاصه مدیریتی برآورد هزینه، تعداد مهمانان و مانده اقساط'
            : 'Executive Summary: Total Estimated Cost, Guests, and Remaining Installment Balance'
        }
        className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-1"
      >
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E5A4F]">
          <div className="flex items-center gap-2 font-semibold text-[#2C1E16]">
            <span>
              {lang === 'FA'
                ? 'نمای سریع وضعیت مالی و ظرفیت قرارداد (به‌روزرسانی زنده)'
                : 'Live Contract Oversight Summary'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#9A7411]">
              {customBrand.hallName} ({customBrand.city})
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono-num tabular-nums">
            <span>
              {lang === 'FA' ? 'پیش‌پرداخت نقدی:' : 'Down Payment:'}{' '}
              {formatNumberLocale(downPaymentPercent, lang)}%
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'FA' ? 'تخفیف شب انتخابی:' : 'Date Discount:'}{' '}
              {formatNumberLocale(calculation.discountPercent, lang)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Estimated Cost */}
          <div className="rounded-2xl bg-white border border-[#D4AF37]/50 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-[#6E5A4F]">
                <span className="font-semibold text-[#2C1E16]">
                  {lang === 'FA' ? 'هزینه کل تخمینی مراسم' : 'Total Estimated Cost'}
                </span>
                <Wallet className="w-4 h-4 text-[#E11D48] shrink-0" />
              </div>

              <div className="mt-2 font-mono-num tabular-nums text-2xl sm:text-3xl font-black text-[#2C1E16] tracking-tight">
                {formatMoney(calculation.finalTotalToman, currency, lang, liveRates)}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#6E5A4F] font-mono-num tabular-nums">
                <span>
                  {lang === 'FA' ? 'سرانه هر نفر:' : 'Per guest:'}{' '}
                  <strong className="text-[#E11D48]">
                    {formatMoney(calculation.finalPerGuestToman, currency, lang, liveRates)}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {formatNumberLocale(selectedItems.length, lang)}{' '}
                  {lang === 'FA' ? 'آیتم منو' : 'menu items'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E6DFD3] flex items-center justify-between gap-2 text-xs">
              <span className="text-[#6E5A4F] font-mono-num tabular-nums truncate">
                {calculation.discountAmountToman > 0
                  ? `${lang === 'FA' ? 'سود تخفیف:' : 'Saved:'} ${formatMoney(
                      calculation.discountAmountToman,
                      currency,
                      lang,
                      liveRates,
                    )}`
                  : lang === 'FA'
                    ? 'بدون تخفیف تاریخ'
                    : 'Standard date rate'}
              </span>
              <a
                href="#builder"
                className="font-bold text-[#E11D48] hover:underline whitespace-nowrap shrink-0"
              >
                {lang === 'FA' ? 'جزئیات منو ←' : 'Menu details →'}
              </a>
            </div>
          </div>

          {/* Card 2: Number of Guests */}
          <div className="rounded-2xl bg-white border border-[#D4AF37]/50 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-[#6E5A4F]">
                <span className="font-semibold text-[#2C1E16]">
                  {lang === 'FA' ? 'تعداد مهمانان مراسم' : 'Number of Guests'}
                </span>
                <Users className="w-4 h-4 text-[#9A7411] shrink-0" />
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-num tabular-nums text-2xl sm:text-3xl font-black text-[#2C1E16] tracking-tight">
                  {formatNumberLocale(guestCount, lang)}
                </span>
                <span className="text-xs font-semibold text-[#6E5A4F]">
                  {lang === 'FA' ? 'نفر مهمان دعوت‌شده' : 'invited guests'}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#6E5A4F]">
                <span className="font-medium text-[#2C1E16]">
                  {servingStyle.title[lang] || servingStyle.title.FA}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {selectedFlashDate
                    ? selectedFlashDate.persianDate
                    : lang === 'FA'
                      ? 'پاییز ۱۴۰۵'
                      : 'Autumn 2026'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E6DFD3] flex items-center justify-between gap-2">
              <span className="text-xs text-[#6E5A4F]">
                {lang === 'FA' ? 'تنظیم سریع ظرفیت:' : 'Quick adjust:'}
              </span>
              <div className="flex items-center gap-1 font-mono-num tabular-nums">
                <button
                  type="button"
                  onClick={() => setGuestCount((prev) => Math.max(50, prev - 50))}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#FFF0F3] text-[#2C1E16] border border-[#E6DFD3] text-xs font-bold transition cursor-pointer whitespace-nowrap"
                  aria-label="Decrease guests by 50"
                >
                  -50
                </button>
                <button
                  type="button"
                  onClick={() => setGuestCount(300)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#FFF0F3] text-[#2C1E16] border border-[#E6DFD3] text-xs font-bold transition cursor-pointer whitespace-nowrap"
                >
                  {formatNumberLocale(300, lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setGuestCount((prev) => Math.min(1000, prev + 50))}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#FFF0F3] text-[#2C1E16] border border-[#E6DFD3] text-xs font-bold transition cursor-pointer whitespace-nowrap"
                  aria-label="Increase guests by 50"
                >
                  +50
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Remaining Installment Balance */}
          <div className="rounded-2xl bg-white border border-[#D4AF37]/50 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-[#6E5A4F]">
                <span className="font-semibold text-[#2C1E16]">
                  {lang === 'FA'
                    ? 'مانده اقساط چک صیادی بنفش'
                    : 'Remaining Installment Balance'}
                </span>
                <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
              </div>

              <div className="mt-2 font-mono-num tabular-nums text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
                {formatMoney(
                  calculation.remainingForChecksToman,
                  currency,
                  lang,
                  liveRates,
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#6E5A4F] font-mono-num tabular-nums">
                <span>
                  {formatNumberLocale(installmentMonths, lang)}{' '}
                  {lang === 'FA' ? 'چک ×' : 'checks ×'}{' '}
                  <strong className="text-[#2C1E16]">
                    {formatMoney(calculation.eachCheckToman, currency, lang, liveRates)}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {lang === 'FA' ? 'پیش‌پرداخت:' : 'Down:'}{' '}
                  {formatMoney(calculation.downPaymentToman, currency, lang, liveRates)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E6DFD3] flex items-center justify-between gap-2">
              <span className="text-xs text-[#6E5A4F] whitespace-nowrap">
                {lang === 'FA' ? 'تعداد اقساط:' : 'Installments:'}
              </span>
              <div className="flex items-center gap-1 font-mono-num tabular-nums">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInstallmentMonths(m)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      installmentMonths === m
                        ? 'bg-[#2C1E16] text-[#E6C258]'
                        : 'bg-[#FAF7F2] text-[#2C1E16] border border-[#E6DFD3] hover:border-[#D4AF37]'
                    }`}
                  >
                    {formatNumberLocale(m, lang)} {lang === 'FA' ? 'ماهه' : 'mo'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6">
        {/* 2.2. ALWAYS-VISIBLE 1-CLICK ACCESSIBILITY (معلولان) & ADHD FOCUS BAR */}
        <div className="mt-4 p-3 sm:px-5 rounded-2xl bg-[#2C1E16] text-[#FAF7F2] border-2 border-[#C59B27] shadow-md flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#E6C258]">
            <Accessibility className="w-4 h-4 text-[#E11D48] shrink-0" />
            <span>نوار سریع دسترس‌پذیری معلولان و تمرکز ADHD (فعالسازی ۱-کلیکی):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setA11y((prev) => ({...prev, adhdFocusMode: !prev.adhdFocusMode}))}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                a11y.adhdFocusMode
                  ? 'bg-[#E11D48] text-white border-white shadow'
                  : 'bg-[#3E2723] text-[#FAF7F2] border-[#C59B27]/50 hover:border-[#E6C258]'
              }`}
            >
              🧠 {a11y.adhdFocusMode ? 'حالت تمرکز ADHD: فعال ✓' : 'حالت تمرکز ADHD (ضد شلوغی)'}
            </button>

            <button
              type="button"
              onClick={() =>
                setA11y((prev) => ({...prev, adhdReadingGuide: !prev.adhdReadingGuide}))
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                a11y.adhdReadingGuide
                  ? 'bg-[#E6C258] text-[#1E130D] border-white shadow'
                  : 'bg-[#3E2723] text-[#FAF7F2] border-[#C59B27]/50 hover:border-[#E6C258]'
              }`}
            >
              📏 {a11y.adhdReadingGuide ? 'خط‌کش تمرکز ADHD: فعال ✓' : 'خط‌کش نوری مطالعه (ADHD)'}
            </button>

            <button
              type="button"
              onClick={() =>
                setA11y((prev) => ({...prev, motorLargeTargets: !prev.motorLargeTargets}))
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                a11y.motorLargeTargets
                  ? 'bg-emerald-600 text-white border-white shadow'
                  : 'bg-[#3E2723] text-[#FAF7F2] border-[#C59B27]/50 hover:border-[#E6C258]'
              }`}
            >
              🖐️ {a11y.motorLargeTargets ? 'دکمه‌های بزرگ حرکتی: فعال ✓' : 'معلولیت حرکتی (دکمه‌های بزرگ)'}
            </button>

            <button
              type="button"
              onClick={() => setA11y((prev) => ({...prev, highContrast: !prev.highContrast}))}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                a11y.highContrast
                  ? 'bg-white text-black border-black shadow'
                  : 'bg-[#3E2723] text-[#FAF7F2] border-[#C59B27]/50 hover:border-[#E6C258]'
              }`}
            >
              👁️ {a11y.highContrast ? 'کنتراست کم‌بینایان: فعال ✓' : 'کم‌بینایان (کنتراست بالا)'}
            </button>

            <button
              type="button"
              onClick={isSpeaking ? handleStopSpeaking : handleSpeakInvoice}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#AA8215] text-[#1E130D] shadow hover:brightness-105 transition cursor-pointer"
            >
              🔊 {isSpeaking ? 'توقف خوانش صوتی' : 'خوانش صوتی نابینایان'}
            </button>
          </div>
        </div>

        {/* ADHD 3-STEP CALM SUMMARY BAR (Shown when ADHD Focus Mode is active) */}
        {a11y.adhdFocusMode && (
          <div className="my-3 p-4 rounded-2xl bg-amber-50 border-2 border-[#2C1E16] text-[#2C1E16] grid grid-cols-1 md:grid-cols-3 gap-3 adhd-spotlight">
            <div className="p-3 rounded-xl bg-white border border-[#C59B27]">
              <div className="text-xs font-bold text-[#E11D48]">گام ۱ (تعداد مهمان و سبک):</div>
              <div className="font-extrabold text-sm mt-0.5">
                {formatNumberLocale(guestCount, lang)} نفر • {servingStyle.title[lang]}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#C59B27]">
              <div className="text-xs font-bold text-[#9A7411]">گام ۲ (جمع کل و هزینه هر نفر):</div>
              <div className="font-mono-num font-extrabold text-sm mt-0.5">
                کل: {formatMoney(calculation.finalTotalToman, currency, lang)} (هر نفر:{' '}
                {formatMoney(calculation.finalPerGuestToman, currency, lang)})
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#C59B27]">
              <div className="text-xs font-bold text-emerald-700">گام ۳ (اقساط چک صیادی):</div>
              <div className="font-mono-num font-extrabold text-sm mt-0.5">
                {formatNumberLocale(installmentMonths, lang)} برگ چک ×{' '}
                {formatMoney(calculation.eachCheckToman, currency, lang)}
              </div>
            </div>
          </div>
        )}

        {/* 2.5. INSTANT WHITE-LABEL CUSTOMIZATION BAR FOR HALLS & WEDDING AGENCIES */}
        <WhiteLabelAndVisitorSuite
          lang={lang}
          currency={currency}
          customBrand={customBrand}
          onUpdateBrand={handleUpdateBrand}
          mode="top-customizer"
        />

        {/* 3. JOYFUL, FESTIVE WEDDING CELEBRATION HERO SECTION */}
        <section className="my-6 rounded-[32px] wedding-festive-header border-2 border-[#D4AF37]/60 shadow-2xl overflow-hidden relative p-6 sm:p-10">
          {/* Decorative Festive Floating Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-rose-300 shadow-sm">
                <Heart className="w-4 h-4 text-[#E11D48] fill-[#E11D48]" />
                <span className="text-xs font-extrabold text-[#E11D48]">
                  {t.heroBadge}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C1E16] leading-tight">
                <span className="text-[#E11D48]">جشن عروسی رویایی‌تان</span> را با منوساز زنده،{' '}
                <span className="underline decoration-[#D4AF37] decoration-4 underline-offset-8">
                  تخفیف شب‌های خالی
                </span>{' '}
                و اقساط چک صیادی بسازید! 🎉
              </h1>

              <p className="text-sm sm:text-base text-[#4E342E] leading-relaxed font-medium">
                {t.heroDesc}
              </p>

              {/* Festive Quick Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-white/90 border border-rose-200 shadow-sm">
                  <div className="text-xs text-[#6E5A4F] font-bold">تخفیف شب‌های خالی</div>
                  <div className="font-mono-num text-lg font-black text-[#E11D48] mt-0.5">
                    تا ۲۸٪ هدیه جشن
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-[#D4AF37]/50 shadow-sm">
                  <div className="text-xs text-[#6E5A4F] font-bold">اقساط چک صیادی</div>
                  <div className="font-mono-num text-lg font-black text-[#9A7411] mt-0.5">
                    ۳ تا ۱۲ ماهه (۰٪)
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-emerald-200 shadow-sm">
                  <div className="text-xs text-[#6E5A4F] font-bold">سود فروش ویزیتورها</div>
                  <div className="font-mono-num text-lg font-black text-emerald-700 mt-0.5">
                    ۲۵٪ سود خالص فروش
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-sm">
                  <div className="text-xs text-[#6E5A4F] font-bold">خوانش صوتی فاکتور</div>
                  <div className="text-sm font-black text-[#2C1E16] mt-1">
                    ویژه کم‌بینایان و ADHD
                  </div>
                </div>
              </div>

              {/* Hero CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#builder"
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#D4AF37] text-white font-black text-sm shadow-xl hover:scale-[1.02] transition"
                >
                  <PartyPopper className="w-5 h-5" />
                  <span>{t.ctaStartBuilder}</span>
                </a>

                <a
                  href="#marketers"
                  className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-white text-[#2C1E16] border-2 border-[#D4AF37] font-extrabold text-xs sm:text-sm shadow-md hover:bg-[#FFF0F3] transition"
                >
                  <Gift className="w-5 h-5 text-[#E11D48]" />
                  <span>{t.ctaMarketerClub}</span>
                </a>

                <button
                  onClick={handleSpeakInvoice}
                  className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-[#2C1E16] text-[#E6C258] font-bold text-xs shadow-md hover:bg-[#3E2723] transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-[#F43F5E]" />
                  <span>خوانش صوتی جشن و فاکتور</span>
                </button>
              </div>
            </div>

            {/* Right Visual Collage: Radiant Wedding Celebration */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                  alt="Royal Wedding Celebration Hall"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1E16]/85 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#E6C258]">
                    <Sparkles className="w-4 h-4 text-[#F43F5E]" />
                    <span>کاخ‌تالارها و باغ‌عمارت‌های ۵ ستاره ایران و جهان</span>
                  </div>
                  <div className="text-lg font-black mt-0.5">
                    گل‌آرایی رز هلندی، آتش‌بازی سرد، استیج کنسرتی FBNM و منوی سلطنتی
                  </div>
                  <div className="mt-2 flex items-center justify-between bg-white/15 backdrop-blur-md rounded-xl px-3.5 py-2 border border-white/25 text-xs">
                    <span>هزینه هر نفر در پکیج فعلی شما:</span>
                    <span className="font-mono-num font-black text-[#E6C258] text-sm">
                      {formatMoney(calculation.finalPerGuestToman, currency, lang)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SMART FLASH DATES CALENDAR (شب‌های خالی تالار با تخفیف لحظه آخری) */}
        <section id="flash-dates" className="py-8 adhd-dimmable">
          <div className="luxury-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FFF0F3] via-[#FFFDF9] to-[#FEF9E7] border-2 border-rose-300 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E11D48] text-white text-xs font-extrabold shadow">
                  <CalendarHeart className="w-4 h-4" />
                  <span>حراج شاد شب‌های خالی تالار (Flash Wedding Dates)</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E16] mt-2">
                  {t.flashDatesTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#6E5A4F] mt-1">{t.flashDatesSub}</p>
              </div>
              {selectedFlashDate && (
                <button
                  onClick={() => setSelectedFlashDate(null)}
                  className="self-start px-4 py-2 rounded-xl bg-white border border-rose-300 text-xs font-bold text-[#E11D48] hover:bg-rose-50 cursor-pointer"
                >
                  حذف تخفیف تاریخ ({selectedFlashDate.discountPercent}%)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FLASH_DATES.map((offer) => {
                const isSelected = selectedFlashDate?.id === offer.id;
                return (
                  <div
                    key={offer.id}
                    onClick={() => handleSelectFlashDate(offer)}
                    className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FFF0F3] to-[#FFFBEB] border-[#E11D48] shadow-lg ring-2 ring-[#E11D48]/30'
                        : 'bg-white border-[#E6DFD3] hover:border-[#D4AF37] hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-[#E11D48]">
                          {offer.dayName[lang]}
                        </span>
                        <span className="px-3 py-1 rounded-full font-mono-num text-xs font-black bg-gradient-to-r from-[#E11D48] to-[#D4AF37] text-white shadow-sm">
                          {formatNumberLocale(offer.discountPercent, lang)}% OFF
                        </span>
                      </div>

                      <div className="font-black text-base text-[#2C1E16]">
                        📅 {offer.persianDate}
                      </div>
                      <div className="text-xs font-bold text-[#9A7411]">
                        🏛️ {offer.venueName[lang]}
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-xs text-[#2C1E16] font-medium">
                        🎁 {offer.giftBonus[lang]}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E6DFD3] flex items-center justify-between text-xs font-extrabold">
                      <span className="text-emerald-700">
                        ظرفیت باقی‌مانده: {formatNumberLocale(offer.capacityLeft, lang)} شب
                      </span>
                      <span className="text-[#E11D48] flex items-center gap-1">
                        {isSelected ? '✓ اعمال‌شده روی فاکتور' : 'انتخاب و اعمال تخفیف ←'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. LIVE MENU BUILDER & SAYYADI CHECK INSTALLMENT CALCULATOR */}
        <section id="builder" className="py-6 adhd-spotlight">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT/RIGHT BUILDER CONTROLS (7 COLUMNS) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Guest Count & Serving Style */}
              <div className="luxury-card rounded-3xl p-6 bg-white border-2 border-[#D4AF37]/60 shadow-lg space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#D4AF37] text-white flex items-center justify-center shadow">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-[#2C1E16]">
                        ۱. {t.guestCountLabel}
                      </h2>
                      <p className="text-xs text-[#6E5A4F]">
                        تغییر تعداد مهمانان در لحظه هزینه هر نفر و اقساط چک صیادی را به‌روز می‌کند
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FFF0F3] to-[#FEF9E7] border border-[#E11D48]/40 font-mono-num text-xl font-black text-[#E11D48]">
                    {formatNumberLocale(guestCount, lang)}{' '}
                    <span className="text-xs font-bold text-[#2C1E16]">نفر مهمان</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full h-3 rounded-lg accent-[#E11D48] cursor-pointer"
                  aria-label="Guest Count Slider"
                />

                <div className="flex flex-wrap gap-2">
                  {[100, 200, 300, 400, 500, 700, 1000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setGuestCount(preset)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono-num text-xs font-extrabold border transition cursor-pointer ${
                        guestCount === preset
                          ? 'bg-[#E11D48] text-white border-[#E11D48] shadow'
                          : 'bg-[#FAF7F2] text-[#2C1E16] border-[#E6DFD3] hover:border-[#D4AF37]'
                      }`}
                    >
                      {formatNumberLocale(preset, lang)} نفر
                    </button>
                  ))}
                </div>

                {/* Serving Style Selector */}
                <div className="pt-4 border-t border-[#E6DFD3] space-y-3">
                  <h3 className="font-extrabold text-sm text-[#2C1E16]">
                    ۲. {t.servingStyleLabel}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SERVING_STYLES.map((style) => {
                      const active = servingStyleId === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => setServingStyleId(style.id)}
                          className={`p-4 rounded-2xl border-2 text-start transition cursor-pointer flex flex-col justify-between ${
                            active
                              ? 'bg-gradient-to-b from-[#FFF0F3] to-white border-[#E11D48] shadow-md'
                              : 'bg-[#FAF7F2] border-[#E6DFD3] hover:border-[#D4AF37]'
                          }`}
                        >
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2C1E16] text-[#E6C258] mb-2">
                              {style.badge[lang]}
                            </span>
                            <div className="font-extrabold text-xs sm:text-sm text-[#2C1E16]">
                              {style.title[lang]}
                            </div>
                            <p className="text-[11px] text-[#6E5A4F] mt-1 leading-relaxed">
                              {style.subtitle[lang]}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-[#E6DFD3] text-[11px] font-mono-num font-bold text-[#E11D48]">
                            سرویس و شارژ: +{formatMoney(style.serviceFeePerGuestToman, currency, lang, liveRates)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2: Interactive Menu & Ceremonial Items Selector */}
              <div className="luxury-card rounded-3xl p-6 bg-white border-2 border-[#D4AF37]/60 shadow-lg space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#9A7411] text-white flex items-center justify-center shadow">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#2C1E16]">
                      ۳. انتخاب زنده غذاهای اصلی، پیش‌غذا، میوه و تشریفات عروسی
                    </h2>
                    <p className="text-xs text-[#6E5A4F]">
                      روی هر آیتم کلیک کنید تا به پیش‌فاکتور عروسی شما اضافه یا کسر شود
                    </p>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      {id: 'main', label: `🍖 ${t.catMain}`},
                      {id: 'appetizer', label: `🥗 ${t.catAppetizer}`},
                      {id: 'fruit_pastry', label: `🎂 ${t.catFruitPastry}`},
                      {id: 'ceremonial', label: `✨ ${t.catCeremonial}`},
                    ] as Array<{id: MenuCategory; label: string}>
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition cursor-pointer ${
                        activeCategory === tab.id
                          ? 'bg-gradient-to-r from-[#E11D48] to-[#D4AF37] text-white border-transparent shadow-md'
                          : 'bg-[#FAF7F2] text-[#2C1E16] border-[#E6DFD3] hover:bg-[#FFF0F3]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MENU_ITEMS.filter((item) => item.category === activeCategory).map((item) => {
                    const checked = selectedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleMenuItem(item.id)}
                        className={`rounded-2xl overflow-hidden border-2 transition cursor-pointer flex flex-col justify-between ${
                          checked
                            ? 'bg-gradient-to-b from-[#FFF0F3] to-white border-[#E11D48] shadow-md'
                            : 'bg-[#FAF7F2] border-[#E6DFD3] hover:border-[#D4AF37]'
                        }`}
                      >
                        <div>
                          <div className="relative h-36 w-full overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name[lang]}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                              {item.popular && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#E11D48] text-white shadow">
                                  ★ محبوب عروس و دامادها
                                </span>
                              )}
                            </div>
                            <div
                              className={`absolute bottom-2.5 left-2.5 w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow ${
                                checked
                                  ? 'bg-[#E11D48] text-white'
                                  : 'bg-white/90 text-[#2C1E16]'
                              }`}
                            >
                              {checked ? <Check className="w-5 h-5" /> : '+'}
                            </div>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <div className="font-extrabold text-sm text-[#2C1E16]">
                              {item.name[lang]}
                            </div>
                            <p className="text-xs text-[#6E5A4F] leading-relaxed">
                              {item.description[lang]}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 pb-4 pt-2 border-t border-[#E6DFD3]/70 flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold text-[#6E5A4F]">
                            {item.pricingType === 'per_guest'
                              ? 'به ازای هر نفر'
                              : 'پکیج کامل کل مجلس'}
                          </span>
                          <span className="font-mono-num font-black text-sm text-[#E11D48]">
                            {formatMoney(item.priceToman, currency, lang, liveRates)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT/LEFT STICKY OFFICIAL PROFORMA INVOICE & SAYYADI CHECK CALCULATOR (5 COLUMNS) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
              <div className="luxury-card rounded-3xl overflow-hidden bg-[#FFFDF9] border-2 border-[#D4AF37] shadow-2xl">
                {/* Invoice Header */}
                <div className="bg-gradient-to-r from-[#2C1E16] via-[#4A1525] to-[#2C1E16] text-white p-5 border-b border-[#D4AF37]">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#E11D48] text-white text-[11px] font-extrabold">
                      پیش‌فاکتور زنده و رسمی عروسی
                    </span>
                    <span className="font-mono-num text-xs text-[#E6C258]">
                      {savedTrackingCode || 'EVM-VIP-LIVE'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#FAF7F2] mt-2">
                    {t.invoiceTitle}
                  </h3>
                  <p className="text-xs text-[#E6C258] mt-0.5">
                    محاسبه آنی بر اساس {formatNumberLocale(guestCount, lang)} مهمان و{' '}
                    {formatNumberLocale(selectedItems.length, lang)} آیتم تشریفاتی
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Host Info Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6E5A4F] mb-1">
                        نام عروس و داماد / میزبان:
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4AF37]/50 text-xs font-bold text-[#2C1E16]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#6E5A4F] mb-1">
                        واتساپ مدیر تالار (جهت ارسال):
                      </label>
                      <input
                        type="tel"
                        value={hallManagerWhatsapp}
                        onChange={(e) => setHallManagerWhatsapp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4AF37]/50 text-xs font-mono-num font-bold text-[#2C1E16]"
                      />
                    </div>
                  </div>

                  {/* Key Financial Numbers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#FFF0F3] border border-rose-200">
                      <div className="text-[11px] font-bold text-[#6E5A4F]">
                        {t.perGuestCost}
                      </div>
                      <div className="font-mono-num text-lg font-black text-[#E11D48] mt-0.5">
                        {formatMoney(calculation.finalPerGuestToman, currency, lang, liveRates)}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FEF9E7] border border-[#D4AF37]/60">
                      <div className="text-[11px] font-bold text-[#6E5A4F]">
                        {t.totalContractCost}
                      </div>
                      <div className="font-mono-num text-lg font-black text-[#2C1E16] mt-0.5">
                        {formatMoney(calculation.finalTotalToman, currency, lang, liveRates)}
                      </div>
                    </div>
                  </div>

                  {selectedFlashDate && (
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between font-bold">
                      <span>
                        🎉 سود شما از تخفیف {selectedFlashDate.persianDate} ({selectedFlashDate.discountPercent}%):
                      </span>
                      <span className="font-mono-num">
                        {formatMoney(calculation.discountAmountToman, currency, lang, liveRates)}
                      </span>
                    </div>
                  )}

                  {/* Sayyadi Installment Sliders */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{t.downPaymentPercentLabel}:</span>
                        <span className="font-mono-num text-[#E11D48]">
                          {formatNumberLocale(downPaymentPercent, lang)}% (
                          {formatMoney(calculation.downPaymentToman, currency, lang, liveRates)})
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={60}
                        step={5}
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="w-full accent-[#E11D48] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span>{t.installmentMonthsLabel}:</span>
                        <span className="font-mono-num text-[#9A7411]">
                          {formatNumberLocale(installmentMonths, lang)} فقره چک صیادی بنفش
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[3, 6, 8, 10, 12].map((m) => (
                          <button
                            key={m}
                            onClick={() => setInstallmentMonths(m)}
                            className={`py-1.5 rounded-xl font-mono-num text-xs font-extrabold border transition cursor-pointer ${
                              installmentMonths === m
                                ? 'bg-[#2C1E16] text-[#E6C258] border-[#C59B27]'
                                : 'bg-white text-[#2C1E16] border-[#E6DFD3]'
                            }`}
                          >
                            {formatNumberLocale(m, lang)} ماهه
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E6DFD3] flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#2C1E16]">
                        {t.eachCheckAmount}:
                      </span>
                      <span className="font-mono-num text-base font-black text-[#E11D48]">
                        {formatMoney(calculation.eachCheckToman, currency, lang, liveRates)}
                      </span>
                    </div>

                    {/* Active Value Drivers Summary inside Sticky Invoice */}
                    <div className="pt-2 border-t border-[#E6DFD3] space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6E5A4F] font-bold">استعلام رنگ چک صیادی:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-extrabold ${
                            sayyadiInquiry.statusColor === 'WHITE'
                              ? 'bg-emerald-100 text-emerald-900'
                              : sayyadiInquiry.statusColor === 'YELLOW'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {sayyadiInquiry.statusColor === 'WHITE'
                            ? '⚪ وضعیت سفید (تایید تالار)'
                            : sayyadiInquiry.statusColor === 'YELLOW'
                              ? '🟡 وضعیت زرد (نیاز به ضامن)'
                              : '🔴 وضعیت قرمز'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6E5A4F] font-bold">تسهیم هزینه خانواده‌ها:</span>
                        <span className="font-mono-num font-bold text-[#2C1E16]">
                          زوج {familySplit.couplePercent}% | داماد {familySplit.groomFamilyPercent}% | عروس {familySplit.brideFamilyPercent}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6E5A4F] font-bold">ضمانت قیمت ضدتورم منو:</span>
                        <button
                          type="button"
                          onClick={() => setInflationShieldEnabled(!inflationShieldEnabled)}
                          className={`px-2 py-0.5 rounded-full font-extrabold cursor-pointer ${
                            inflationShieldEnabled
                              ? 'bg-[#2C1E16] text-[#E6C258]'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {inflationShieldEnabled ? '🔒 قفل قیمت فعال ✓' : 'غیرفعال (کلیک برای قفل)'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Generated Purple Sayyadi Checks Schedule Preview */}
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    <div className="text-xs font-extrabold text-[#2C1E16] flex items-center justify-between">
                      <span>🏦 جدول سررسید چک‌های صیادی بنفش:</span>
                      <span className="text-[11px] text-emerald-700">بدون بهره در جشنواره</span>
                    </div>
                    {calculation.checks.map((chk) => (
                      <div
                        key={chk.checkNumber}
                        className="px-3 py-2 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-purple-950">
                            چک {formatNumberLocale(chk.checkNumber, lang)}:
                          </span>{' '}
                          <span className="text-[#6E5A4F]">{chk.dueDatePersian}</span>
                          <div className="font-mono-num text-[10px] text-purple-700">
                            شناسه صیادی: {chk.sayyadiId}
                          </div>
                        </div>
                        <span className="font-mono-num font-extrabold text-purple-950">
                          {formatMoney(chk.amountToman, currency, lang, liveRates)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons: Voice Readout, WhatsApp, Gmail, Server Save */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={isSpeaking ? handleStopSpeaking : handleSpeakInvoice}
                      className="w-full py-3 rounded-xl bg-[#F4EFE6] hover:bg-[#E6DFD3] text-[#2C1E16] border border-[#C59B27] font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-[#E11D48]" />
                          <span>{t.stopSpeakBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-[#E11D48]" />
                          <span>{t.speakInvoiceBtn}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSendWhatsApp}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-extrabold text-xs shadow-lg hover:brightness-105 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{t.sendWhatsappBtn}</span>
                    </button>

                    <button
                      onClick={() => setGmailModalOpen(true)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#D4AF37] text-white font-extrabold text-xs shadow-lg hover:brightness-105 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{t.sendGmailBtn}</span>
                    </button>

                    <button
                      onClick={handleSaveReservation}
                      disabled={savingContract}
                      className="w-full py-2.5 rounded-xl bg-[#2C1E16] text-[#E6C258] font-bold text-xs hover:bg-[#3E2723] flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>
                        {savingContract ? 'در حال ثبت در سرور...' : t.saveServerBtn}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5.5. NEW VALUE DRIVERS FOR HALL OWNERS + 6 CREATIVE MEMORIAL MODULES */}
        <HallValueAndCreativeSuite
          lang={lang}
          currency={currency}
          hallName={customBrand.hallName}
          guestCount={guestCount}
          finalTotalToman={calculation.finalTotalToman}
          downPaymentToman={calculation.downPaymentToman}
          remainingForChecksToman={calculation.remainingForChecksToman}
          installmentMonths={installmentMonths}
          eachCheckToman={calculation.eachCheckToman}
          inflationShieldEnabled={inflationShieldEnabled}
          onToggleInflationShield={setInflationShieldEnabled}
          sayyadiInquiry={sayyadiInquiry}
          onUpdateSayyadiInquiry={setSayyadiInquiry}
          familySplit={familySplit}
          onUpdateFamilySplit={setFamilySplit}
          weatherInsuranceEnabled={weatherInsuranceEnabled}
          onToggleWeatherInsurance={setWeatherInsuranceEnabled}
          barakatCharityEnabled={barakatCharityEnabled}
          onToggleBarakatCharity={setBarakatCharityEnabled}
        />

        {/* 6. SHOWCASE OF 10 AUTHENTIC VENUE & CATERING PACKAGES (UNSPLASH VERIFIED) */}
        <section id="packages" className="py-10 adhd-dimmable">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-[#9A7411] text-xs font-extrabold border border-amber-300">
              <Crown className="w-4 h-4 text-[#E11D48]" />
              <span>۱۰ پکیج واقعی عروسی، نامزدی، باغ‌عمارت و کترینگ VIP</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E16] mt-2">
              {t.packagesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5A4F] mt-1">{t.packagesSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VENUE_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="luxury-card rounded-3xl overflow-hidden bg-white border-2 border-[#E6DFD3] hover:border-[#E11D48] shadow-lg hover:shadow-2xl transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.title[lang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#2C1E16]/90 text-[#E6C258] text-xs font-extrabold backdrop-blur-sm">
                      {pkg.categoryBadge[lang]}
                    </div>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[#2C1E16] font-mono-num text-xs font-black flex items-center gap-1 shadow">
                      <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                      <span>{pkg.rating}</span>
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-[#E11D48] text-white text-xs font-extrabold shadow">
                      اقساط {formatNumberLocale(pkg.sayyadiMonths, lang)} ماهه چک صیادی
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="text-xs font-bold text-[#9A7411]">
                      📍 {pkg.location[lang]} • ظرفیت: {pkg.capacityRange}
                    </div>
                    <h3 className="font-black text-base text-[#2C1E16] leading-snug">
                      {pkg.title[lang]}
                    </h3>
                    <p className="text-xs text-[#6E5A4F] leading-relaxed">
                      {pkg.highlights[lang]}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-[#E6DFD3] space-y-3 bg-[#FAF7F2]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6E5A4F]">نرخ پایه هر نفر:</span>
                    <span className="font-mono-num text-base font-black text-[#E11D48]">
                      {formatMoney(pkg.pricePerGuestToman, currency, lang, liveRates)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleApplyPackage(pkg)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#D4AF37] text-white font-extrabold text-xs shadow hover:brightness-105 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PartyPopper className="w-4 h-4" />
                    <span>{t.applyPackageBtn}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. OFFLINE + AI SMART BANQUET CONCIERGE (/api/concierge) */}
        <section className="py-6 adhd-dimmable">
          <div className="luxury-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#2C1E16] via-[#3E2723] to-[#2C1E16] text-[#FAF7F2] border-2 border-[#C59B27] shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C59B27]/20 text-[#E6C258] text-xs font-bold border border-[#C59B27]/40">
                  <MessageCircle className="w-4 h-4" />
                  <span>پاسخگوی خودکار ۲۴ ساعته تشریفات (مجهز به موتور آفلاین + هوش مصنوعی در سرور)</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  مشاور هوشمند انتخاب منوی عروسی و بودجه‌بندی چک صیادی
                </h3>
                <p className="text-xs sm:text-sm text-[#E6DFD3]">
                  سؤال خود را درباره ترکیب غذاها، تشریفات گل‌آرایی یا نحوه تقسیط چک صیادی بپرسید تا بلافاصله پاسخ دقیق دریافت کنید:
                </p>
              </div>

              <form onSubmit={handleAskConcierge} className="lg:col-span-5 flex gap-2">
                <input
                  type="text"
                  value={conciergeQuery}
                  onChange={(e) => setConciergeQuery(e.target.value)}
                  placeholder="مثلاً: بهترین منو برای ۳۵۰ نفر با ۶ چک صیادی چیست؟"
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-[#C59B27]/60 text-xs sm:text-sm text-white placeholder-[#D7CCC8] focus:outline-none focus:border-[#E6C258]"
                />
                <button
                  type="submit"
                  disabled={conciergeLoading}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#D4AF37] text-white font-extrabold text-xs shadow-lg hover:brightness-105 transition cursor-pointer shrink-0"
                >
                  {conciergeLoading ? 'در حال محاسبه...' : 'دریافت مشاوره'}
                </button>
              </form>
            </div>

            {conciergeReply && (
              <div className="mt-5 p-4 rounded-2xl bg-white/10 border border-[#E6C258]/50 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-[#FFFDF9]">
                {conciergeReply}
              </div>
            )}
          </div>
        </section>

        {/* 8. RECHARTS ANALYTICS & 1-CLICK HD STORY MAKER */}
        <StoryMakerAnalytics
          lang={lang}
          currency={currency}
          guestCount={guestCount}
          perGuestToman={calculation.finalPerGuestToman}
          totalToman={calculation.finalTotalToman}
          downPaymentToman={calculation.downPaymentToman}
          installmentMonths={installmentMonths}
          eachCheckToman={calculation.eachCheckToman}
          selectedNames={selectedItems.map((i) => i.name[lang] || i.name.FA)}
        />

        {/* 8.2. WHAT HALL OWNERS GET UPON PURCHASING + VISITOR STEP-BY-STEP PLAYBOOK & GOLDEN FORMULA */}
        <HallBenefitsAndVisitorPlaybook
          lang={lang}
          currency={currency}
          hallName={customBrand.hallName}
          onQuickApplyDemoHall={(nextHall, nextManager, nextCity, nextPhone) => {
            handleUpdateBrand({
              ...customBrand,
              hallName: nextHall,
              managerName: nextManager,
              city: nextCity,
              whatsapp: nextPhone,
            });
          }}
        />

        {/* 8.5. WHY HALL OWNERS MUST BUY + 25% VISITOR PROFIT MECHANISM & INVITATION LETTER */}
        <WhiteLabelAndVisitorSuite
          lang={lang}
          currency={currency}
          customBrand={customBrand}
          onUpdateBrand={handleUpdateBrand}
          mode="full-pitch-and-invitation"
        />

        {/* 9. B2B HALL MARKETER COMMISSION CLUB & SECURE ANDROID APK/AAB CI ENGINE */}
        <MarketerAndAndroidHub lang={lang} currency={currency} />
      </main>

      {/* 10. ROYAL FOOTER */}
      <footer className="mt-12 bg-[#2C1E16] text-[#FAF7F2] border-t-4 border-[#C59B27] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-start">
            <div className="text-lg font-black text-[#E6C258] flex items-center justify-center md:justify-start gap-2">
              <Crown className="w-5 h-5 text-[#E11D48]" />
              <span>EventMate VIP | ایونت‌مِیت</span>
            </div>
            <p className="text-xs text-[#E6DFD3]">
              اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM
            </p>
            <p className="text-[11px] text-[#B09B8E]">
              پکیج رسمی اندروید: com.eventmate.vip • پشتیبانی از ۷ زبان زنده (فارسی، انگلیسی، عربی، ترکی، کُردی، ارمنی و روسی) • دسترس‌پذیری معلولان و ADHD
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              onClick={() => setA11yOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#3E2723] text-[#E6C258] border border-[#C59B27]/40 hover:bg-[#4E342E] cursor-pointer"
            >
              پنل دسترسی‌پذیری و خوانش صوتی
            </button>
            <button
              onClick={() => setGmailModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#3E2723] text-white border border-[#C59B27]/40 hover:bg-[#4E342E] cursor-pointer"
            >
              ارسال فاکتور با Gmail
            </button>
            <button
              onClick={handleInstallPwaClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#D4AF37] text-white font-bold cursor-pointer"
            >
              نصب وب‌اپلیکیشن (PWA)
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AccessibilityPanel
        isOpen={a11yOpen}
        onClose={() => setA11yOpen(false)}
        settings={a11y}
        onUpdateSettings={setA11y}
        lang={lang}
        currency={currency}
        guestCount={guestCount}
        perGuestToman={calculation.finalPerGuestToman}
        totalToman={calculation.finalTotalToman}
        downPaymentToman={calculation.downPaymentToman}
        installmentMonths={installmentMonths}
        eachCheckToman={calculation.eachCheckToman}
        selectedNames={selectedItems.map((i) => i.name[lang] || i.name.FA)}
        isSpeaking={isSpeaking}
        onSpeakInvoice={handleSpeakInvoice}
        onStopSpeaking={handleStopSpeaking}
      />

      <GmailInvoiceModal
        isOpen={gmailModalOpen}
        onClose={() => setGmailModalOpen(false)}
        lang={lang}
        currency={currency}
        customerName={customerName}
        eventDate={selectedFlashDate ? selectedFlashDate.persianDate : 'پاییز ۱۴۰۵'}
        guestCount={guestCount}
        servingStyleTitle={servingStyle.title[lang] || servingStyle.title.FA}
        perGuestToman={calculation.finalPerGuestToman}
        totalToman={calculation.finalTotalToman}
        downPaymentToman={calculation.downPaymentToman}
        installmentMonths={installmentMonths}
        eachCheckToman={calculation.eachCheckToman}
        selectedItemNames={selectedItems.map((i) => i.name[lang] || i.name.FA)}
        checks={calculation.checks}
      />

      {/* VIP Hall Subscription Modal */}
      {vipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E130D]/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-[#FFFDF9] border-2 border-[#D4AF37] shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-[#E11D48]" />
                <h3 className="font-black text-lg text-[#2C1E16]">
                  اشتراک اختصاصی تالارداران و باغ‌عمارت‌ها (EventMate VIP SaaS)
                </h3>
              </div>
              <button
                onClick={() => setVipModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#FAF7F2] text-[#2C1E16]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#2C1E16]">
              <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-rose-300">
                <div className="font-black text-[#E11D48] text-base">
                  پکیج سالانه تالار و باغ‌تالار: ۴۸,۰۰۰,۰۰۰ تومان / سال
                </div>
                <p className="text-xs text-[#6E5A4F] mt-1">
                  شامل منوساز اختصاصی با لوگوی تالار شما، تقویم شب‌های خالی (Flash Dates)، محاسبه‌گر چک صیادی، استوری‌ساز HD و ارسال مستقیم پیش‌فاکتور به واتساپ و جیمیل.
                </p>
                <div className="mt-2 font-bold text-emerald-800 text-xs">
                  💎 سهم سود ویزیتور / بازاریاب معرف تالار: ۲۵٪ نقدی آنی (۱۲,۰۰۰,۰۰۰ تومان) + ۱۰٪ تمدید سالانه
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FEF9E7] border border-[#D4AF37]">
                <div className="font-black text-[#9A7411] text-base">
                  پکیج سازمانی هتل‌های ۵ ستاره و مجموعه‌های زنجیره‌ای: ۹۶,۰۰۰,۰۰۰ تومان / سال
                </div>
                <p className="text-xs text-[#6E5A4F] mt-1">
                  پشتیبانی از ۵ زبان و ۵ ارز زنده، اپلیکیشن اختصاصی اندروید و اتصال مستقیم به CRM مجموعه.
                </p>
                <div className="mt-2 font-bold text-emerald-800 text-xs">
                  💎 سهم سود ویزیتور / بازاریاب معرف هتل: ۲۵٪ نقدی آنی (۲۴,۰۰۰,۰۰۰ تومان) + ۱۲٪ تمدید سالانه
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <a
                href="#marketers"
                onClick={() => setVipModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#D4AF37] text-white font-extrabold text-xs"
              >
                مشاهده باشگاه بازاریابان و دریافت کد سفیر
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click PWA Install Guide Modal for iOS / Android / Desktop */}
      {pwaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E130D]/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-2 border-[#D4AF37] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-[#E11D48]" />
                <h3 className="font-black text-base text-[#2C1E16]">
                  نصب ۱-کلیکی EventMate VIP روی آیفون و اندروید
                </h3>
              </div>
              <button
                onClick={() => setPwaModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#2C1E16] leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#FFF0F3] border border-rose-200">
                <b>📱 در آیفون و آیپد (Safari):</b> روی دکمه <b>Share</b> (مربع با فلش رو به بالا در پایین مرورگر) بزنید و گزینه <b>Add to Home Screen</b> را انتخاب کنید.
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FEF9E7] border border-[#D4AF37]/50">
                <b>🤖 در اندروید و کروم:</b> از منوی سه نقطه بالای مرورگر گزینه <b>Install App (نصب برنامه)</b> را انتخاب کنید یا از بخش پایینی صفحه خروجی مستقیم <b>APK</b> را دریافت نمایید.
              </div>
            </div>
            <button
              onClick={() => setPwaModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#2C1E16] text-[#E6C258] font-bold text-xs"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
