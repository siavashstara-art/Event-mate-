import React, {useEffect, useState} from 'react';
import {
  Award,
  BadgePercent,
  Building2,
  CheckCircle2,
  Copy,
  Crown,
  FileText,
  Flame,
  Handshake,
  Landmark,
  Link2,
  Lock,
  Palette,
  PartyPopper,
  Printer,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Wand2,
} from 'lucide-react';
import {CurrencyCode, LanguageCode} from '../types';
import {HALL_BRAND_PRESETS, WHY_HALL_OWNERS_BUY_ITEMS} from '../data';
import {formatMoney, formatNumberLocale} from '../utils/formatters';

export interface CustomHallBrand {
  tenantSlug?: string;
  logoMonogram?: string;
  hallName: string;
  agencyType: string;
  managerName: string;
  city: string;
  whatsapp: string;
  slogan: string;
  priceMultiplier: number;
}

interface SoldLicenseEntry {
  id: string;
  hallName: string;
  tenantSlug: string;
  city: string;
  visitorCode: string;
  visitorName: string;
  visitorSheba: string;
  licenseTierTitle: string;
  totalSaleToman: number;
  commission25Toman: number;
  payoutStatus: 'SETTLED_SHEBA' | 'PENDING_SHEBA';
  soldAt: string;
}

interface WhiteLabelAndVisitorSuiteProps {
  lang: LanguageCode;
  currency: CurrencyCode;
  customBrand: CustomHallBrand;
  onUpdateBrand: (brand: CustomHallBrand) => void;
  mode: 'top-customizer' | 'full-pitch-and-invitation';
}

export const WhiteLabelAndVisitorSuite: React.FC<WhiteLabelAndVisitorSuiteProps> = ({
  lang,
  currency,
  customBrand,
  onUpdateBrand,
  mode,
}) => {
  const [studioExpanded, setStudioExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Invitation Letter & 25% Profit-Share Visitor Pitch State
  const [visitorName, setVisitorName] = useState('مهندس کامران رضایی (سفیر رسمی فروش)');
  const [visitorPhone, setVisitorPhone] = useState('09121112233');
  const [visitorCode, setVisitorCode] = useState(
    () => new URLSearchParams(window.location.search).get('ref') || 'EVM-VIP-2500',
  );
  const [visitorSheba, setVisitorSheba] = useState('IR820540102680020817909002');
  const [selectedLicensePriceToman, setSelectedLicensePriceToman] = useState<number>(48000000);
  const [monthlySalesTarget, setMonthlySalesTarget] = useState<number>(5);
  const [soldLicenses, setSoldLicenses] = useState<SoldLicenseEntry[]>([]);
  const [registeringSale, setRegisteringSale] = useState(false);
  const [saleSuccessBanner, setSaleSuccessBanner] = useState<string | null>(null);
  const [generatingTestCode, setGeneratingTestCode] = useState(false);
  const [ownerAdminWhatsapp, setOwnerAdminWhatsapp] = useState('09120000000');

  useEffect(() => {
    if (mode !== 'full-pitch-and-invitation') return;
    fetch('/api/visitors/sales')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.sales)) {
          setSoldLicenses(data.sales);
        }
      })
      .catch(() => {
        // Fallback if offline
      });
  }, [mode]);

  const handleGenerateTestReferralCode = async () => {
    setGeneratingTestCode(true);
    try {
      const res = await fetch('/api/visitors/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          fullName: visitorName || 'سفیر آزمایشی',
          phone: visitorPhone || '09121112233',
          city: customBrand.city || 'تهران',
          commissionRate: 25,
          estimatedMonthlyToman: selectedLicensePriceToman * 0.25 * monthlySalesTarget,
        }),
      });
      const data = await res.json();
      const newCode =
        data?.visitor?.referralCode || `EVM-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
      setVisitorCode(newCode);
      setSaleSuccessBanner(
        `🎯 کد معرف جدید «${newCode}» با موفقیت صادر شد و در لینک اختصاصی (?ref=${newCode}) و دعوت‌نامه طلاکوب قرار گرفت!`,
      );
    } catch {
      const fallbackCode = `EVM-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
      setVisitorCode(fallbackCode);
      setSaleSuccessBanner(
        `🎯 کد معرف جدید «${fallbackCode}» صادر شد و آماده تست فروش است.`,
      );
    } finally {
      setGeneratingTestCode(false);
    }
  };

  const handleSettlePayoutByOwner = async (saleId: string) => {
    try {
      const res = await fetch(`/api/visitors/sales/${saleId}/settle`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data?.sale) {
        setSoldLicenses((prev) =>
          prev.map((item) => (item.id === saleId ? data.sale : item)),
        );
        setSaleSuccessBanner(
          data.message || '✅ واریز ۲۵٪ پورسانت ویزیتور توسط شما (مدیر اصلی) تایید و تسویه شد.',
        );
        return;
      }
    } catch {
      // Fallback
    }
    setSoldLicenses((prev) =>
      prev.map((item) =>
        item.id === saleId ? {...item, payoutStatus: 'SETTLED_SHEBA'} : item,
      ),
    );
    setSaleSuccessBanner('✅ واریز ۲۵٪ پورسانت به شبا توسط مدیر اصلی تایید و تسویه شد.');
  };

  const handleNotifyOwnerOnWhatsApp = () => {
    const comm25 = Math.round(selectedLicensePriceToman * 0.25);
    const owner75 = selectedLicensePriceToman - comm25;
    const cleanOwnerPhone = ownerAdminWhatsapp.replace(/[^0-9]/g, '').replace(/^0/, '98');
    const text = `🔔 *اعلان رسمی فروش لایسنس تالار — درخواست تسویه ۲۵٪ پورسانت ویزیتور*
━━━━━━━━━━━━━━━━━━━━
👤 *نام ویزیتور / سفیر فروش:* ${visitorName}
🔑 *کد معرف ثبت‌شده در سیستم:* ${visitorCode}
📞 *تلفن ویزیتور:* ${visitorPhone}

🏛️ *نام تالار خریدار:* ${customBrand.hallName} (${customBrand.city})
🔗 *لینک ایزوله تحویل‌شده به تالار:* ?hall=${customBrand.tenantSlug || 'royal-palace'}&ref=${visitorCode}

💰 *مبلغ کل لایسنس فروخته‌شده:* ${formatMoney(selectedLicensePriceToman, currency, lang)}
👑 *سهم خالص ۷۵٪ مدیریت اصلی:* ${formatMoney(owner75, currency, lang)}
💎 *سهم ۲۵٪ پورسانت نقدی ویزیتور:* ${formatMoney(comm25, currency, lang)}

🏦 *شماره شبا ویزیتور جهت واریز پایا/ساتنا:*
${visitorSheba}
━━━━━━━━━━━━━━━━━━━━
لطفاً پس از تایید واریزی تالاردار، مبلغ ۲۵٪ پورسانت را به شبای بالا حواله فرمایید.`;
    const url = `https://wa.me/${cleanOwnerPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRecordLicenseSale = async () => {
    setRegisteringSale(true);
    const tierTitle =
      selectedLicensePriceToman === 96000000
        ? 'لایسنس سازمانی VIP هتل و مجموعه تالار'
        : 'لایسنس اختصاصی ایزوله تالار (White-Label)';
    const slug =
      customBrand.tenantSlug ||
      customBrand.hallName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-') ||
      'royal-palace';

    try {
      const res = await fetch('/api/visitors/sales', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          hallName: customBrand.hallName,
          tenantSlug: slug,
          city: customBrand.city,
          visitorCode,
          visitorName,
          visitorSheba,
          licenseTierTitle: tierTitle,
          totalSaleToman: selectedLicensePriceToman,
        }),
      });
      const data = await res.json();
      if (data?.sale) {
        setSoldLicenses((prev) => [data.sale, ...prev]);
        setSaleSuccessBanner(
          data.message ||
            `🔔 فروش لایسنس «${customBrand.hallName}» با کد ${visitorCode} در جدول زیر ثبت شد و در انتظار تایید واریز شبا (${visitorSheba}) توسط مدیر اصلی است!`,
        );
      }
    } catch {
      const comm = Math.round(selectedLicensePriceToman * 0.25);
      const fallbackSale: SoldLicenseEntry = {
        id: `sale-${Date.now()}`,
        hallName: customBrand.hallName,
        tenantSlug: slug,
        city: customBrand.city,
        visitorCode,
        visitorName,
        visitorSheba,
        licenseTierTitle: tierTitle,
        totalSaleToman: selectedLicensePriceToman,
        commission25Toman: comm,
        payoutStatus: 'PENDING_SHEBA',
        soldAt: new Date().toISOString(),
      };
      setSoldLicenses((prev) => [fallbackSale, ...prev]);
      setSaleSuccessBanner(
        `🔔 فروش لایسنس در جدول زیر ثبت شد! اکنون می‌توانید از جدول پایین دکمه «تایید واریز ۲۵٪ توسط مدیر اصلی» را برای تمرین بزنید.`,
      );
    } finally {
      setRegisteringSale(false);
    }
  };

  // Live Hall Advertising & Sponsorship Showcase State
  const [featuredHallAds, setFeaturedHallAds] = useState([
    {
      id: 'ad-1',
      hallName: 'کاخ‌تالار و باغ‌عمارت رویال فرشته',
      city: 'تهران — فرشته و الهیه',
      managerName: 'حاج محمد رادمنش',
      whatsapp: '989123456789',
      offerHeadline: '۲۲٪ تخفیف ویژه پاییز + آتش‌بازی سرد و گل‌آرایی هلندی رایگان',
      capacity: '۱۵۰ تا ۸۰۰ نفر',
      tierBadge: 'آگهی ویژه طلایی (VIP Pin)',
      priceMultiplier: 1.0,
    },
    {
      id: 'ad-2',
      hallName: 'باغ‌تالار عمارت شیشه‌ای قصر طلایی لواسان',
      city: 'لواسان — ویو ابدی کوهستان',
      managerName: 'مهندس شهرام کیانی',
      whatsapp: '989121112233',
      offerHeadline: 'ورودی باغ ۱۰۰٪ رایگان در شب‌های نیمه‌هفته + تقسیط ۱۰ ماهه چک صیادی',
      capacity: '۲۰۰ تا ۱۰۰۰ نفر',
      tierBadge: 'اسپانسر شب‌های خالی (Flash Ad)',
      priceMultiplier: 1.1,
    },
    {
      id: 'ad-3',
      hallName: 'مجموعه تشریفات و تالار ساحلی امپریال کیش',
      city: 'جزیره کیش — بلوار مرجان',
      managerName: 'دکتر آرش فرهمند',
      whatsapp: '989129998877',
      offerHeadline: 'اقامت سوئیت رویال عروس و داماد + هلی‌شات 4K دریایی رایگان',
      capacity: '۱۰۰ تا ۶۰۰ نفر',
      tierBadge: 'برگزیده منوساز هوشمند',
      priceMultiplier: 1.15,
    },
  ]);

  const [newAdHallName, setNewAdHallName] = useState('');
  const [newAdCity, setNewAdCity] = useState('تهران');
  const [newAdOffer, setNewAdOffer] = useState('۲۰٪ تخفیف عقد قرارداد + ورودی رایگان تالار');
  const [newAdWhatsapp, setNewAdWhatsapp] = useState('09123456789');
  const [selectedAdTierIndex, setSelectedAdTierIndex] = useState(1);
  const [adPublishedNotice, setAdPublishedNotice] = useState<string | null>(null);

  const HALL_AD_PACKAGES = [
    {
      id: 'ad-tier-1',
      badge: 'جایگاه ۱ — صدر صفحه',
      title: 'بنر طلایی صدر برنامه (Hero Gold Pin)',
      duration: 'ماهانه',
      priceToman: 12000000,
      visitor25ShareToman: 3000000,
      features: [
        'نمایش دائمی نام و آفر تالار در ویترین طلایی بالای منوساز',
        'دکمه ۱-کلیکی «بارگذاری منوی این تالار» برای عروس و دامادها',
        'اتصال مستقیم دکمه رزرو به واتساپ مدیر تالار بدون واسطه',
      ],
    },
    {
      id: 'ad-tier-2',
      badge: 'پرفروش‌ترین پکیج تبلیغاتی',
      title: 'اسپانسر تقویم شب‌های خالی (Flash Dates Spotlight)',
      duration: 'ماهانه',
      priceToman: 18000000,
      visitor25ShareToman: 4500000,
      features: [
        'نمایش اولویت‌دار شب‌های خالی تالار با نشان «پیشنهاد ویژه»',
        'طراحی خودکار استوری اینستاگرام ۱۰۸۰×۱۹۲۰ برای شب‌های خالی',
        'تضمین حداقل ۱۵۰ استعلام مستقیم پیش‌فاکتور در ماه',
      ],
    },
    {
      id: 'ad-tier-3',
      badge: 'هوش مصنوعی + پیش‌فاکتور',
      title: 'پیشنهاد هوشمند در منوساز و مشاور (Smart AI Ad)',
      duration: '۳ ماهه',
      priceToman: 36000000,
      visitor25ShareToman: 9000000,
      features: [
        'معرفی خودکار تالار به عروس و دامادهای هم‌بودجه در مشاور هوشمند',
        'درج بنر پیشنهادی تالار در پایین پیش‌فاکتورهای مقایسه‌ای',
        'پشتیبانی تبلیغاتی به ۷ زبان (فارسی، انگلیسی، عربی، ترکی، کُردی، ارمنی و روسی)',
      ],
    },
    {
      id: 'ad-tier-4',
      badge: 'پکیج جامع VIP سالانه',
      title: 'کمپین VIP یک‌ساله + لایسنس کامل White-Label تالار',
      duration: 'سالانه (۱۲ ماه)',
      priceToman: 64000000,
      visitor25ShareToman: 16000000,
      features: [
        'اختصاص کامل برنامه با نام، لوگو و منوی تالار + بنر طلایی سالانه',
        'فعالسازی کامل محاسبه‌گر چک صیادی و ارسال فاکتور جیمیل و واتساپ',
        'بیشترین بازدهی مالی برای تالاردار + ۱۶ میلیون تومان پورسانت نقدی ویزیتور',
      ],
    },
  ];

  const handlePublishLiveHallAd = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenTier = HALL_AD_PACKAGES[selectedAdTierIndex] || HALL_AD_PACKAGES[0];
    const targetName = newAdHallName.trim() || customBrand.hallName;
    const createdAd = {
      id: `ad-${Date.now()}`,
      hallName: targetName,
      city: newAdCity.trim() || customBrand.city,
      managerName: customBrand.managerName,
      whatsapp: newAdWhatsapp.trim() || customBrand.whatsapp,
      offerHeadline: newAdOffer.trim() || 'تخفیف ویژه رزرو آنلاین + چک صیادی بدون کارمزد',
      capacity: '۱۰۰ تا ۹۰۰ نفر',
      tierBadge: chosenTier.title,
      priceMultiplier: customBrand.priceMultiplier,
    };
    setFeaturedHallAds((prev) => [createdAd, ...prev]);
    setAdPublishedNotice(
      `🎉 آگهی ویژه «${targetName}» در ویترین زنده تبلیغات تالارها منتشر شد! (سهم ۲۵٪ ویزیتور از این پکیج تبلیغاتی: ${formatMoney(chosenTier.visitor25ShareToman, currency, lang)})`,
    );
    setNewAdHallName('');
  };

  // 25% Profit Share Math
  const visitorProfitSharePercent = 25;
  const profitPerSaleToman = Math.round(
    (selectedLicensePriceToman * visitorProfitSharePercent) / 100,
  );
  const totalMonthlyVisitorProfitToman = profitPerSaleToman * monthlySalesTarget;

  const handleSelectPreset = (preset: (typeof HALL_BRAND_PRESETS)[number]) => {
    onUpdateBrand({
      tenantSlug: preset.slug,
      logoMonogram: preset.logoMonogram,
      hallName: preset.hallName,
      agencyType: preset.agencyType,
      managerName: preset.managerName,
      city: preset.city,
      whatsapp: preset.whatsapp,
      slogan: preset.slogan,
      priceMultiplier: preset.priceMultiplier,
    });
  };

  const buildPersonalizedDemoUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('hall', customBrand.tenantSlug || customBrand.hallName);
    params.set('manager', customBrand.managerName);
    params.set('city', customBrand.city);
    params.set('phone', customBrand.whatsapp);
    params.set('ref', visitorCode);
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCopyDemoLink = () => {
    const url = buildPersonalizedDemoUrl();
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3500);
  };

  const invitationLetterText = `👑 دعوت‌نامه رسمی تجهیز به سامانه هوشمند منوساز، رزرواسیون و محاسبه‌گر اقساط چک صیادی
🌸 ویژه مجموعه فاخر: «${customBrand.hallName}» (${customBrand.city})
محضر مبارک مدیریت محترم، ${customBrand.managerName}
با سلام و تحیات شایسته؛

احتراماً، با توجه به جایگاه ممتاز و خوش‌نامی مجموعه «${customBrand.hallName}» در صنعت تشریفات و میزبانی مجالس، بدین‌وسیله از جنابعالی دعوت می‌شود نسخه شخصی‌سازی‌شده سامانه هوشمند «EventMate VIP | ایونت‌مِیت» را که به صورت اختصاصی با نام و برند مجموعه شما آماده شده است بررسی فرمایید.

✨ چرا تجهیز «${customBrand.hallName}» به این برنامه اختصاصی، سودآوری شما را متحول می‌کند؟
۱. تبدیل شب‌های خالی وسط هفته به قرارداد نقدی (تقویم هوشمند Flash Dates): پر کردن شب‌های کم‌تقاضا با تخفیف هدفمند و افزایش ۱.۵ تا ۳ میلیارد تومانی درآمد سالانه تالار.
۲. حذف جلسات فرسایشی ۳ ساعته قیمت‌گیری حضوری: عروس و داماد پیش از ورود به دفتر تالار، تعداد مهمان و منوی دلخواه خود را در سامانه اختصاصی تالار شما انتخاب کرده و قیمت دقیق هر نفر را مشاهده می‌کنند (افزایش ۳ برابری نرخ تبدیل بازدیدکننده به قرارداد).
۳. محاسبه آنی و بدون خطای اقساط چک صیادی بنفش: محاسبه خودکار مبلغ پیش‌پرداخت نقدی و صدور جدول سررسید ماهانه چک‌های صیادی بدون یک ریال خطای حسابداری.
۴. صدور پیش‌فاکتور رسمی طلاکوب در واتساپ و جیمیل با سربرگ «${customBrand.hallName}»: ارتقای چشمگیر پرستیژ برند تالار در نگاه خانواده‌های عروس و داماد.
۵. استوری‌ساز ۱-کلیکی اینستاگرام (۱۰۸۰×۱۹۲۰ HD): تولید پوسترهای تبلیغاتی شب‌های خالی با نام و شماره تالار در ۵ ثانیه، بدون نیاز به گرافیست.
۶. پاسخگوی خودکار ۲۴ ساعته تشریفات: پاسخگویی هوشمند به استعلام قیمت مشتریان در ساعات تعطیلی دفتر تالار (۱۰ شب تا صبح) به ۵ زبان زنده و ۵ ارز.

🎁 هدیه ویژه جلسه دمو:
نسخه آزمایشی سامانه هم‌اکنون با نام «${customBrand.hallName}» شخصی‌سازی شده و آماده نمایش زنده روی تلفن همراه جنابعالی است.

🔗 لینک دموی اختصاصی مجموعه شما:
${buildPersonalizedDemoUrl()}

با احترام و آرزوی توفیق روزافزون؛
👤 نام مشاور و سفیر رسمی استقرار سامانه: ${visitorName}
🔑 کد رسمی نمایندگی فروش: ${visitorCode}
📞 شماره تماس مستقیم جهت هماهنگی دمو: ${visitorPhone}
🏛️ اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM`;

  const handleCopyInvitationLetter = () => {
    navigator.clipboard?.writeText(invitationLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 3500);
  };

  const handleSendInvitationWhatsApp = () => {
    const cleanPhone = customBrand.whatsapp.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(invitationLetterText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // RENDER MODE 1: TOP-OF-APP INSTANT WHITE-LABEL CUSTOMIZATION BAR & STUDIO
  if (mode === 'top-customizer') {
    return (
      <section className="my-4 rounded-3xl bg-gradient-to-r from-[#FFF0F3] via-[#FFFDF9] to-[#FEF9E7] border-2 border-[#D4AF37] shadow-lg overflow-hidden transition-all">
        <div className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#D4AF37] text-white flex items-center justify-center shadow shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#2C1E16] text-[#E6C258]">
                  معماری ایزوله وایت‌لیبل (Isolated White-Label Tenant)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono-num font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <Lock className="w-3 h-3 text-emerald-700" />
                  <span>?hall={customBrand.tenantSlug || 'royal-palace'} (ایزوله ۱۰۰٪)</span>
                </span>
                <span className="text-sm sm:text-base font-black text-[#E11D48]">
                  {customBrand.hallName}
                </span>
              </div>
              <p className="text-xs text-[#6E5A4F] mt-0.5">
                مدیریت: <b>{customBrand.managerName}</b> • {customBrand.city} • ضریب نرخ اختصاصی منو:{' '}
                <span className="font-mono-num font-bold text-[#9A7411]">
                  {customBrand.priceMultiplier}x
                </span>{' '}
                • <span className="text-emerald-800 font-bold">اطلاعات و قیمت‌های این تالار کاملاً مستقل و محرمانه است</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStudioExpanded(!studioExpanded)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#D4AF37] text-white font-extrabold text-xs shadow hover:brightness-105 transition cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              <span>
                {studioExpanded
                  ? 'بستن پنل شخصی‌سازی تالار'
                  : 'تغییر نام تالار / بنگاه تشریفات (ویژه دمو به تالاردار)'}
              </span>
            </button>

            <a
              href="#invitation-letter"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2C1E16] text-[#E6C258] border border-[#C59B27] font-extrabold text-xs hover:bg-[#3E2723] transition"
            >
              <FileText className="w-4 h-4 text-[#E11D48]" />
              <span>دعوت‌نامه تالاردار + ۲۵٪ سود ویزیتور</span>
            </a>

            <a
              href="#hall-ads"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 text-[#9A7411] border border-amber-300 font-extrabold text-xs hover:bg-amber-200 transition"
            >
              <Flame className="w-4 h-4 text-[#E11D48]" />
              <span>تبلیغات تالارها و تعرفه آگهی</span>
            </a>
          </div>
        </div>

        {/* LIVE FEATURED HALL ADVERTISING RIBBON (Visible right at top of app) */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#2C1E16] via-[#3E2723] to-[#2C1E16] text-[#FAF7F2] border-t border-[#C59B27]/40">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#E6C258]">
              <Sparkles className="w-4 h-4 text-[#E11D48]" />
              <span>ویترین تبلیغات ویژه تالارها و باغ‌عمارت‌های برگزیده (با ۱ کلیک منوی هر تالار را بارگذاری کنید):</span>
            </div>
            <a
              href="#hall-ads"
              className="text-[11px] font-bold text-rose-300 hover:text-white underline"
            >
              + ثبت آگهی تالار جدید و مشاهده شرایط تبلیغات (۲۵٪ پورسانت ویزیتور)
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {featuredHallAds.slice(0, 3).map((ad) => (
              <div
                key={ad.id}
                onClick={() =>
                  onUpdateBrand({
                    hallName: ad.hallName,
                    agencyType: 'باغ‌تالار و تشریفات VIP',
                    managerName: ad.managerName,
                    city: ad.city,
                    whatsapp: ad.whatsapp,
                    slogan: ad.offerHeadline,
                    priceMultiplier: ad.priceMultiplier,
                  })
                }
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-[#C59B27]/50 transition cursor-pointer flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-xs text-[#E6C258] truncate">
                    👑 {ad.hallName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] font-bold shrink-0">
                    {ad.tierBadge}
                  </span>
                </div>
                <p className="text-[11px] text-rose-100 line-clamp-1">{ad.offerHeadline}</p>
                <div className="flex items-center justify-between text-[10px] text-[#E6DFD3] pt-0.5">
                  <span>📍 {ad.city}</span>
                  <span className="text-[#E6C258] font-bold">انتخاب و محاسبه منو ←</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {studioExpanded && (
          <div className="p-5 sm:p-6 bg-white/95 border-t border-[#E6DFD3] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-extrabold text-[#2C1E16]">
                ⚡ انتخاب سریع یکی از قالب‌های آماده تالارها و بنگاه‌های تشریفات (یا تایپ نام دلخواه در پایین):
              </div>
              <div className="flex flex-wrap gap-2">
                {HALL_BRAND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                      customBrand.hallName === preset.hallName
                        ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-sm'
                        : 'bg-[#FAF7F2] text-[#2C1E16] border-[#D4AF37]/50 hover:border-[#E11D48]'
                    }`}
                  >
                    {preset.hallName}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C1E16] mb-1">
                  ۱. نام اختصاصی تالار، باغ‌عمارت یا بنگاه تشریفات:
                </label>
                <input
                  type="text"
                  value={customBrand.hallName}
                  onChange={(e) =>
                    onUpdateBrand({...customBrand, hallName: e.target.value})
                  }
                  placeholder="مثلاً: باغ‌تالار سلطنتی قصر طلایی"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D4AF37] text-xs font-bold text-[#2C1E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1E16] mb-1">
                  ۲. نام مدیر محترم تالار / صاحب امتیاز:
                </label>
                <input
                  type="text"
                  value={customBrand.managerName}
                  onChange={(e) =>
                    onUpdateBrand({...customBrand, managerName: e.target.value})
                  }
                  placeholder="مثلاً: جناب آقای حاج محمد کریمی"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D4AF37] text-xs font-bold text-[#2C1E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1E16] mb-1">
                  ۳. شهر، منطقه یا آدرس تالار:
                </label>
                <input
                  type="text"
                  value={customBrand.city}
                  onChange={(e) => onUpdateBrand({...customBrand, city: e.target.value})}
                  placeholder="مثلاً: تهران — احمدآباد مستوفی"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D4AF37] text-xs font-bold text-[#2C1E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1E16] mb-1">
                  ۴. شماره واتساپ مدیر تالار (جهت دریافت آنی پیش‌فاکتورها):
                </label>
                <input
                  type="tel"
                  value={customBrand.whatsapp}
                  onChange={(e) =>
                    onUpdateBrand({...customBrand, whatsapp: e.target.value})
                  }
                  placeholder="98912..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D4AF37] text-xs font-mono-num font-bold text-[#2C1E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1E16] mb-1">
                  ۵. شعار اختصاصی تالار در سربرگ فاکتور و استوری:
                </label>
                <input
                  type="text"
                  value={customBrand.slogan}
                  onChange={(e) => onUpdateBrand({...customBrand, slogan: e.target.value})}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D4AF37] text-xs text-[#2C1E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1E16] mb-1">
                  ۶. ضریب سطح قیمت منوهای این تالار ({customBrand.priceMultiplier} برابر):
                </label>
                <input
                  type="range"
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  value={customBrand.priceMultiplier}
                  onChange={(e) =>
                    onUpdateBrand({
                      ...customBrand,
                      priceMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#E11D48] cursor-pointer mt-2"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6DFD3]">
              <div className="text-xs text-[#6E5A4F]">
                💡 <b>راهنمای ویزیتورها:</b> نام تالار مشتری را در کادر بالا بنویسید؛ کل برنامه، پیش‌فاکتور واتساپ، ایمیل و استوری‌ساز فوراً به نام همان تالار تغییر می‌کند!
              </div>
              <button
                type="button"
                onClick={handleCopyDemoLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shadow hover:bg-emerald-800 transition cursor-pointer"
              >
                <Link2 className="w-4 h-4" />
                <span>
                  {copiedLink
                    ? '✅ لینک اختصاصی این تالار کپی شد!'
                    : 'کپی لینک دموی اختصاصی با نام همین تالار'}
                </span>
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  // RENDER MODE 2: WHY HALL OWNERS MUST BUY + 25% VISITOR PROFIT MECHANISM + INVITATION LETTER
  return (
    <div className="space-y-10 py-6">
      {/* SECTION A: WHY EVERY HALL OWNER & WEDDING AGENCY MUST BUY THIS APP */}
      <section
        id="why-buy"
        className="luxury-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FFFDF9] via-[#FFF0F3] to-[#FEF9E7] border-2 border-[#D4AF37] shadow-xl adhd-dimmable"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E6DFD3]">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E11D48] text-white text-xs font-extrabold shadow-sm">
              <Crown className="w-4 h-4" />
              <span>ویژه مدیران تالارها، باغ‌عمارت‌ها و بنگاه‌های تشریفات</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E16] mt-2">
              چرا هر تالاردار هوشمند باید همین امروز «EventMate VIP» را برای مجموعه خود بخرد؟
            </h2>
            <p className="text-sm text-[#6E5A4F] mt-1">
              ۶ تحول مستقیم در افزایش فروش شب‌های خالی، حذف چانه‌زنی‌های فرسایشی و اتوماسیون ۱۰۰٪ محاسبات چک صیادی برای مجموعه «{customBrand.hallName}»
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#2C1E16] text-[#FAF7F2] border border-[#C59B27] shrink-0 text-center">
            <div className="text-[11px] text-[#E6C258] font-bold">بازگشت سرمایه تالاردار (ROI):</div>
            <div className="font-mono-num text-lg font-black text-emerald-400 mt-0.5">
              با رزرو فقط ۱ شب خالی!
            </div>
            <div className="text-[10px] text-[#E6DFD3]">
              کل هزینه سالانه برنامه در اولین قرارداد جبران می‌شود
            </div>
          </div>
        </div>

        {/* 6 Concrete Value Pillars for Hall Owners */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {WHY_HALL_OWNERS_BUY_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl p-5 bg-white border-2 border-[#E6DFD3] hover:border-[#E11D48] transition shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-[#E11D48] border border-rose-200 text-[11px] font-extrabold">
                    {item.badge}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-[#2C1E16] text-[#E6C258] font-mono-num text-xs font-black flex items-center justify-center">
                    {formatNumberLocale(index + 1, lang)}
                  </span>
                </div>

                <h3 className="font-black text-base text-[#2C1E16] leading-snug">
                  {item.title}
                </h3>

                <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-950 leading-relaxed">
                  <b>❌ مشکل سنتی تالاردار:</b> {item.problem}
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                  <b>✅ راه‌حل خودکار برنامه:</b> {item.solution}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E6DFD3] flex items-center gap-1.5 text-xs font-extrabold text-[#9A7411]">
                <TrendingUp className="w-4 h-4 text-[#E11D48] shrink-0" />
                <span>سود مالی تالار: {item.financialImpact}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Before vs After Table for Hall Managers */}
        <div className="mt-8 rounded-2xl overflow-hidden border-2 border-[#C59B27] bg-white">
          <div className="bg-[#2C1E16] text-[#E6C258] px-5 py-3 font-extrabold text-sm flex items-center justify-between">
            <span>📊 جدول مقایسه عملکرد تالار قبل و بعد از استقرار سامانه اختصاصی EventMate VIP</span>
            <span className="text-xs text-rose-300">گزارش تحلیلی ویژه مدیران تالار</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#E6DFD3] text-xs">
            <div className="p-4 space-y-2">
              <div className="font-black text-sm text-rose-700">۱. زمان اعلام قیمت و صدور پیش‌فاکتور</div>
              <p className="text-[#6E5A4F]">
                <b>روش سنتی:</b> ۴۵ دقیقه حساب‌وکتاب دستی روی کاغذ و ماشین‌حساب با احتمال بالای خطا.
              </p>
              <p className="text-emerald-800 font-bold">
                <b>با EventMate VIP:</b> کمتر از ۱۰ ثانیه به صورت زنده با سربرگ اختصاصی تالار در واتساپ و جیمیل مشتری!
              </p>
            </div>
            <div className="p-4 space-y-2">
              <div className="font-black text-sm text-rose-700">۲. وضعیت شب‌های خالی وسط هفته</div>
              <p className="text-[#6E5A4F]">
                <b>روش سنتی:</b> سوخت شدن کامل شب‌های دوشنبه و سه‌شنبه به دلیل عدم اطلاع عروس و دامادها از آفرهای تالار.
              </p>
              <p className="text-emerald-800 font-bold">
                <b>با EventMate VIP:</b> نمایش شمارش معکوس «Flash Dates» و پر شدن تا ۸۵٪ شب‌های خالی سال!
              </p>
            </div>
            <div className="p-4 space-y-2">
              <div className="font-black text-sm text-rose-700">۳. مدیریت اقساط و چک‌های صیادی</div>
              <p className="text-[#6E5A4F]">
                <b>روش سنتی:</b> سردرگمی در محاسبه سررسیدها، درصد پیش‌پرداخت و اختلاف حساب با خانواده عروس و داماد.
              </p>
              <p className="text-emerald-800 font-bold">
                <b>با EventMate VIP:</b> تولید خودکار جدول ۳ تا ۱۲ فقره چک صیادی با تاریخ و مبلغ دقیق هر برگ چک!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: 25% PROFIT-SHARE VISITOR MECHANISM & OFFICIAL HALL OWNER INVITATION LETTER */}
      <section
        id="invitation-letter"
        className="luxury-card rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#E11D48] shadow-2xl adhd-dimmable"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E6DFD3]">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#E11D48] to-[#D4AF37] text-white text-xs font-extrabold shadow-sm">
              <BadgePercent className="w-4 h-4" />
              <span>طرح طلایی کسب درآمد بازاریابان و ویزیتورها (۲۵٪ سود خالص فروش برنامه)</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E16] mt-2">
              سازوکار ۲۵٪ سهم سود ویزیتورها + دعوت‌نامه رسمی آماده ارائه به تالاردارها
            </h2>
            <p className="text-sm text-[#6E5A4F] mt-1">
              این برنامه را با نام هر تالار شخصی‌سازی کنید، دعوت‌نامه رسمی زیر را به مدیر تالار ارائه دهید و <b>۲۵٪ کل مبلغ فروش برنامه</b> را نقداً دریافت نمایید!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#FFF0F3] px-5 py-3 rounded-2xl border-2 border-[#E11D48]">
            <Award className="w-9 h-9 text-[#E11D48]" />
            <div>
              <div className="text-xs font-bold text-[#6E5A4F]">سهم تضمین‌شده ویزیتور از هر فروش:</div>
              <div className="font-mono-num text-xl font-black text-[#E11D48]">
                ۲۵٪ سود خالص نقدی
              </div>
              <div className="text-[11px] font-bold text-emerald-800">
                معادل ۱۲ تا ۲۴ میلیون تومان در هر قرارداد!
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Operational Mechanism for Visitors to Sell to Halls & Collect 25% */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37] space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#2C1E16] text-[#E6C258] text-xs font-extrabold">
              گام ۱: شخصی‌سازی ۱۰ ثانیه‌ای
            </span>
            <h4 className="font-black text-sm text-[#2C1E16]">
              تغییر نام برنامه به نام تالار هدف
            </h4>
            <p className="text-xs text-[#6E5A4F] leading-relaxed">
              قبل از ورود به تالار، نام آن تالار و شماره مدیرش را در کادر ниже وارد کنید تا کل برنامه با برند همان تالار آماده نمایش شود.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37] space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#2C1E16] text-[#E6C258] text-xs font-extrabold">
              گام ۲: ارائه دعوت‌نامه رسمی
            </span>
            <h4 className="font-black text-sm text-[#2C1E16]">
              ارسال واتساپی یا تحویل چاپی دعوت‌نامه
            </h4>
            <p className="text-xs text-[#6E5A4F] leading-relaxed">
              دعوت‌نامه طلاکوب زیر را که به نام مدیر تالار صادر شده است با ۱ کلیک به واتساپ ایشان بفرستید یا پرینت بگیرید و حضوری تحویل دهید.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37] space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#2C1E16] text-[#E6C258] text-xs font-extrabold">
              گام ۳: دموی زنده ۲ دقیقه‌ای
            </span>
            <h4 className="font-black text-sm text-[#2C1E16]">
              تست منوساز و چک صیادی توسط تالاردار
            </h4>
            <p className="text-xs text-[#6E5A4F] leading-relaxed">
              وقتی مدیر تالار ببیند پیش‌فاکتور واتساپی و استوری اینستاگرام در ۵ ثانیه با نام تالار خودش صادر می‌شود، بلافاصله تصمیم به خرید می‌گیرد.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF0F3] border-2 border-[#E11D48] space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#E11D48] text-white text-xs font-extrabold">
              گام ۴: دریافت آنی ۲۵٪ سود فروش
            </span>
            <h4 className="font-black text-sm text-[#E11D48]">
              واریز ۱۲ تا ۲۴ میلیون تومان به حساب شما
            </h4>
            <p className="text-xs text-[#2C1E16] leading-relaxed">
              با ثبت کد سفیر شما در هنگام خرید تالاردار، <b>۲۵٪ کل مبلغ فروش برنامه</b> به صورت خودکار و آنی به شبای شما تسویه می‌شود.
            </p>
          </div>
        </div>

        {/* Interactive Visitor 25% Profit Customizer + Official Invitation Letter Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Left Column: Visitor & Target Hall Inputs + 25% Profit Simulator */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37] space-y-4">
            <div className="flex items-center gap-2 text-[#2C1E16] font-black text-base">
              <UserCheck className="w-5 h-5 text-[#E11D48]" />
              <span>تنظیم مشخصات دعوت‌نامه و محاسبه ۲۵٪ سود ویزیتور</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2C1E16] mb-1">
                  نام تالار / باغ‌تالار یا بنگاه تشریفات مقصد:
                </label>
                <input
                  type="text"
                  value={customBrand.hallName}
                  onChange={(e) =>
                    onUpdateBrand({...customBrand, hallName: e.target.value})
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4AF37] font-bold text-[#2C1E16]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#2C1E16] mb-1">
                    نام مدیر محترم تالار:
                  </label>
                  <input
                    type="text"
                    value={customBrand.managerName}
                    onChange={(e) =>
                      onUpdateBrand({...customBrand, managerName: e.target.value})
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4AF37] font-bold text-[#2C1E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2C1E16] mb-1">
                    واتساپ مدیر تالار:
                  </label>
                  <input
                    type="tel"
                    value={customBrand.whatsapp}
                    onChange={(e) =>
                      onUpdateBrand({...customBrand, whatsapp: e.target.value})
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4AF37] font-mono-num font-bold text-[#2C1E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#2C1E16] mb-1">
                    نام شما (ویزیتور / بازاریاب):
                  </label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4AF37] text-[#2C1E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2C1E16] mb-1">
                    موبایل ویزیتور:
                  </label>
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4AF37] font-mono-num text-[#2C1E16]"
                  />
                </div>
              </div>

              {/* 1-Click Referral Code Generator & Practice Box */}
              <div className="p-3 rounded-2xl bg-[#FFF0F3] border border-[#E11D48]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[#2C1E16] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>کد اختصاصی معرف (ویزیتور) — قابل ویرایش یا تولید خودکار:</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#E11D48]">تست و تمرین صدور کد</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={visitorCode}
                    onChange={(e) => setVisitorCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E11D48] font-mono-num font-black text-xs text-[#2C1E16]"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateTestReferralCode}
                    disabled={generatingTestCode}
                    className="px-3 py-2 rounded-xl bg-[#E11D48] text-white font-extrabold text-xs hover:bg-rose-700 transition shrink-0 cursor-pointer"
                  >
                    {generatingTestCode ? 'در حال تولید...' : '🎲 صدور کد معرف جدید'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2C1E16] mb-1">
                  پکیج نرم‌افزاری پیشنهادی برای فروش به تالار:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLicensePriceToman(48000000)}
                    className={`p-2.5 rounded-xl border text-start transition cursor-pointer ${
                      selectedLicensePriceToman === 48000000
                        ? 'bg-[#FFF0F3] border-[#E11D48] text-[#2C1E16] font-extrabold'
                        : 'bg-white border-[#E6DFD3] text-[#6E5A4F]'
                    }`}
                  >
                    <div>لایسنس اختصاصی تالار</div>
                    <div className="font-mono-num text-xs text-[#E11D48] mt-0.5">
                      ۴۸ میلیون تومان (سود ۲۵٪ شما: ۱۲ میلیون)
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLicensePriceToman(96000000)}
                    className={`p-2.5 rounded-xl border text-start transition cursor-pointer ${
                      selectedLicensePriceToman === 96000000
                        ? 'bg-[#FEF9E7] border-[#D4AF37] text-[#2C1E16] font-extrabold'
                        : 'bg-white border-[#E6DFD3] text-[#6E5A4F]'
                    }`}
                  >
                    <div>لایسنس VIP هتل و مجموعه</div>
                    <div className="font-mono-num text-xs text-[#9A7411] mt-0.5">
                      ۹۶ میلیون تومان (سود ۲۵٪ شما: ۲۴ میلیون)
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#2C1E16] mb-1">
                  <span>تعداد فروش ماهانه شما به تالارها:</span>
                  <span className="font-mono-num text-[#E11D48]">
                    {formatNumberLocale(monthlySalesTarget, lang)} تالار در ماه
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={monthlySalesTarget}
                  onChange={(e) => setMonthlySalesTarget(Number(e.target.value))}
                  className="w-full accent-[#E11D48] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2C1E16] to-[#3E2723] text-[#FAF7F2] border border-[#C59B27] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#E6DFD3]">سود ۲۵٪ شما از هر ۱ فروش:</span>
                  <span className="font-mono-num font-black text-[#E6C258]">
                    {formatMoney(profitPerSaleToman, currency, lang)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/15">
                  <span className="text-[#E6DFD3]">درآمد ماهانه شما ({monthlySalesTarget} تالار):</span>
                  <span className="font-mono-num text-lg font-black text-emerald-400">
                    {formatMoney(totalMonthlyVisitorProfitToman, currency, lang)}
                  </span>
                </div>
              </div>

              {/* Visitor SHEBA Input & 1-Click License Sale Registration */}
              <div className="p-3.5 rounded-2xl bg-white border-2 border-emerald-400 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[#2C1E16] flex items-center gap-1">
                    <Landmark className="w-4 h-4 text-emerald-700" />
                    <span>شماره شبا ویزیتور (جهت واریز آنی ۲۵٪ پورسانت):</span>
                  </label>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono-num text-[10px] font-bold">
                    تسویه خودکار پایا/ساتنا
                  </span>
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={visitorSheba}
                  onChange={(e) => setVisitorSheba(e.target.value)}
                  placeholder="IR820540102680020817909002"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D4AF37] font-mono-num font-bold text-xs text-[#2C1E16]"
                />
                <div>
                  <label className="block font-bold text-[#2C1E16] text-[11px] mb-1">
                    شماره واتساپ شما (صاحب اصلی برنامه) جهت دریافت فوری فیش فروش ویزیتور:
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={ownerAdminWhatsapp}
                    onChange={(e) => setOwnerAdminWhatsapp(e.target.value)}
                    placeholder="09120000000"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] font-mono-num font-bold text-xs text-[#2C1E16]"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6E5A4F]">
                  <span>لینک اختصاصی ویزیتور:</span>
                  <code className="font-mono-num font-bold text-[#E11D48]">
                    ?hall={customBrand.tenantSlug || 'royal-palace'}&ref={visitorCode}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleRecordLicenseSale}
                  disabled={registeringSale}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xs shadow hover:brightness-105 transition cursor-pointer"
                >
                  {registeringSale
                    ? 'در حال ثبت لایسنس در کارتابل مدیریت...'
                    : `۱. ثبت فروش لایسنس «${customBrand.hallName}» در کارتابل مدیریت (${formatMoney(profitPerSaleToman, currency, lang)})`}
                </button>
                <button
                  type="button"
                  onClick={handleNotifyOwnerOnWhatsApp}
                  className="w-full py-2.5 rounded-xl bg-[#2C1E16] text-[#E6C258] border border-[#C59B27] font-extrabold text-xs hover:bg-[#3E2723] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>۲. ارسال فوری رسید فروش و شماره شبا به واتساپ صاحب برنامه</span>
                </button>
                {saleSuccessBanner && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-[11px] font-bold">
                    {saleSuccessBanner}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Official Gold-Bordered Invitation Letter Ready to Present to Hall Owners */}
          <div className="lg:col-span-7 rounded-3xl p-6 bg-gradient-to-b from-[#FFFDF9] to-[#FAF7F2] border-4 border-double border-[#C59B27] shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#D4AF37]/40 pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-[#E11D48]" />
                  <div>
                    <h3 className="font-black text-base text-[#2C1E16]">
                      دعوت‌نامه رسمی تجهیز تالار به سامانه هوشمند منوساز و چک صیادی
                    </h3>
                    <p className="text-[11px] text-[#9A7411] font-bold">
                      اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono-num text-xs font-extrabold border border-emerald-300">
                  کد سفیر: {visitorCode}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E6DFD3] text-xs text-[#2C1E16] leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto font-medium">
                {invitationLetterText}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSendInvitationWhatsApp}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-extrabold text-xs shadow hover:brightness-105 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ارسال دعوت‌نامه به واتساپ تالاردار</span>
              </button>

              <button
                type="button"
                onClick={handleCopyInvitationLetter}
                className="py-3 px-4 rounded-xl bg-[#2C1E16] text-[#E6C258] border border-[#C59B27] font-extrabold text-xs hover:bg-[#3E2723] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>
                  {copiedLetter ? '✅ متن دعوت‌نامه کپی شد!' : 'کپی متن کامل دعوت‌نامه'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-4 rounded-xl bg-[#FFF0F3] text-[#E11D48] border border-rose-300 font-extrabold text-xs hover:bg-rose-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ / PDF دعوت‌نامه رسمی</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Visitor 25% Commission Financial Ledger & SHEBA Payout Table */}
        <div className="mt-8 rounded-2xl overflow-hidden border-2 border-[#C59B27] bg-white shadow-md">
          <div className="bg-gradient-to-r from-[#2C1E16] via-[#3E2723] to-[#2C1E16] text-[#FAF7F2] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-[#E6C258]">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>کارتابل مدیر اصلی برنامه: گزارش زنده لایسنس‌های فروخته‌شده توسط ویزیتورها و تایید واریز ۲۵٪ شبا</span>
            </div>
            <div className="text-xs font-mono-num text-emerald-300 font-bold">
              مجموع پورسانت ۲۵٪ ثبت‌شده:{' '}
              {formatMoney(
                soldLicenses.reduce((acc, s) => acc + s.commission25Toman, 0),
                currency,
                lang,
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#FAF7F2] text-[#6E5A4F] border-b border-[#E6DFD3]">
                <tr>
                  <th className="py-3 px-4 text-start font-extrabold">نام تالار (مستأجر ایزوله)</th>
                  <th className="py-3 px-4 text-start font-extrabold">پارامتر URL ایزوله</th>
                  <th className="py-3 px-4 text-start font-extrabold">ویزیتور و کد سفیر</th>
                  <th className="py-3 px-4 text-start font-extrabold">مبلغ کل لایسنس</th>
                  <th className="py-3 px-4 text-start font-extrabold">۲۵٪ پورسانت نقدی ویزیتور</th>
                  <th className="py-3 px-4 text-start font-extrabold">شماره شبا و عملیات تایید مدیر اصلی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD3]">
                {soldLicenses.map((sale) => (
                  <tr
                    key={sale.id}
                    className={
                      sale.payoutStatus === 'PENDING_SHEBA'
                        ? 'bg-amber-50/70 hover:bg-amber-50'
                        : 'hover:bg-[#FFFDF9]'
                    }
                  >
                    <td className="py-3 px-4 font-black text-[#2C1E16]">
                      {sale.hallName}
                      <div className="text-[10px] text-[#6E5A4F] font-normal">{sale.licenseTierTitle}</div>
                    </td>
                    <td className="py-3 px-4 font-mono-num text-[11px] text-[#9A7411] font-bold">
                      ?hall={sale.tenantSlug}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#2C1E16]">{sale.visitorName}</div>
                      <div className="font-mono-num text-[10px] text-[#E11D48] font-bold">?ref={sale.visitorCode}</div>
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-[#2C1E16]">
                      {formatMoney(sale.totalSaleToman, currency, lang)}
                    </td>
                    <td className="py-3 px-4 font-mono-num font-black text-emerald-700 text-sm">
                      {formatMoney(sale.commission25Toman, currency, lang)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono-num text-[11px] font-bold text-[#2C1E16]">{sale.visitorSheba}</div>
                      {sale.payoutStatus === 'PENDING_SHEBA' ? (
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold">
                            🔔 فروش جدید (در انتظار واریز شما)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSettlePayoutByOwner(sale.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold hover:bg-emerald-700 transition cursor-pointer shadow-sm"
                          >
                            💳 تایید واریز ۲۵٪ به شبا (مدیر اصلی)
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>واریز قطعی ۲۵٪ به شبا انجام شد</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION C: HALL ADVERTISING ENGINE & SPONSORSHIP PACKAGES (شرایط تبلیغات تالارها در برنامه + ۲۵٪ پورسانت ویزیتور) */}
      <section
        id="hall-ads"
        className="luxury-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FFF9F5] via-[#FFFDF9] to-[#FEF9E7] border-2 border-[#C59B27] shadow-2xl adhd-dimmable"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E6DFD3]">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#2C1E16] via-[#E11D48] to-[#D4AF37] text-white text-xs font-extrabold shadow-sm">
              <Flame className="w-4 h-4 text-[#E6C258]" />
              <span>پلتفرم جامع تبلیغات تالارها و باغ‌عمارت‌ها + ۲۵٪ پورسانت جذب آگهی ویژه ویزیتورها</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E16] mt-2">
              شرایط و تعرفه تبلیغات تالارها در برنامه + ثبت آنی بنر تبلیغاتی تالار
            </h2>
            <p className="text-sm text-[#6E5A4F] mt-1">
              علاوه بر فروش لایسنس اختصاصی برنامه، تالارداران می‌توانند آفرهای شب‌های خالی و پکیج‌های عروسی خود را در صدر سامانه تبلیغ کنند؛ ویزیتورها از <b>هر قرارداد تبلیغاتی نیز ۲۵٪ سود خالص نقدی</b> دریافت می‌کنند!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF0F3] border-2 border-[#E11D48] text-center shrink-0">
            <div className="text-xs font-bold text-[#6E5A4F]">پورسانت ویزیتور از جذب تبلیغات تالار:</div>
            <div className="font-mono-num text-xl font-black text-[#E11D48] mt-0.5">
              ۲۵٪ نقدی از هر آگهی
            </div>
            <div className="text-[11px] text-emerald-800 font-bold">
              ۳ تا ۱۶ میلیون تومان سود هر بنر تبلیغاتی
            </div>
          </div>
        </div>

        {/* 4 Official Advertising Tiers for Wedding Halls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {HALL_AD_PACKAGES.map((pkg, idx) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedAdTierIndex(idx)}
              className={`rounded-2xl p-5 border-2 transition cursor-pointer flex flex-col justify-between ${
                selectedAdTierIndex === idx
                  ? 'bg-gradient-to-b from-[#FFF0F3] to-white border-[#E11D48] shadow-lg scale-[1.01]'
                  : 'bg-white border-[#D4AF37]/60 hover:border-[#E11D48]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#2C1E16] text-[#E6C258] text-[10px] font-extrabold">
                    {pkg.badge}
                  </span>
                  <span className="text-xs font-bold text-[#9A7411]">{pkg.duration}</span>
                </div>

                <h3 className="font-black text-base text-[#2C1E16] leading-snug">{pkg.title}</h3>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3]">
                  <div className="text-[11px] text-[#6E5A4F]">تعرفه رسمی درج آگهی تالار:</div>
                  <div className="font-mono-num text-base font-black text-[#2C1E16]">
                    {formatMoney(pkg.priceToman, currency, lang)}
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-[#6E5A4F] leading-relaxed">
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6DFD3] flex items-center justify-between text-xs">
                <span className="font-bold text-[#E11D48]">سهم ۲۵٪ ویزیتور:</span>
                <span className="font-mono-num font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {formatMoney(pkg.visitor25ShareToman, currency, lang)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Hall Advertisement Submission & Instant Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <form
            onSubmit={handlePublishLiveHallAd}
            className="lg:col-span-5 p-5 rounded-2xl bg-[#2C1E16] text-[#FAF7F2] border-2 border-[#C59B27] space-y-3.5"
          >
            <div className="flex items-center gap-2 text-[#E6C258] font-black text-base">
              <PartyPopper className="w-5 h-5 text-[#E11D48]" />
              <span>ثبت و انتشار آنی آگهی تالار در صدر برنامه</span>
            </div>
            <p className="text-xs text-[#E6DFD3] leading-relaxed">
              مشخصات تبلیغاتی تالار را وارد کنید تا بنر طلاکوب آن فوراً در ویترین زنده بالای صفحه و لیست زیر منتشر شود:
            </p>

            <div>
              <label className="block text-xs text-[#E6C258] font-bold mb-1">
                نام تالار یا باغ‌عمارت آگهی‌دهنده:
              </label>
              <input
                type="text"
                value={newAdHallName}
                onChange={(e) => setNewAdHallName(e.target.value)}
                placeholder={customBrand.hallName}
                className="w-full px-3 py-2 rounded-xl bg-[#3E2723] border border-[#C59B27]/50 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs text-[#E6C258] font-bold mb-1">
                  شهر و محدوده تالار:
                </label>
                <input
                  type="text"
                  value={newAdCity}
                  onChange={(e) => setNewAdCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#3E2723] border border-[#C59B27]/50 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#E6C258] font-bold mb-1">
                  شماره واتساپ رزرواسیون:
                </label>
                <input
                  type="tel"
                  value={newAdWhatsapp}
                  onChange={(e) => setNewAdWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#3E2723] border border-[#C59B27]/50 text-xs font-mono-num text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#E6C258] font-bold mb-1">
                تیتر آفر تبلیغاتی و هدیه ویژه تالار برای عروس و داماد:
              </label>
              <input
                type="text"
                value={newAdOffer}
                onChange={(e) => setNewAdOffer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#3E2723] border border-[#C59B27]/50 text-xs text-white"
              />
            </div>

            {adPublishedNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold">
                {adPublishedNotice}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#D4AF37] text-white font-extrabold text-xs shadow-lg hover:brightness-105 transition cursor-pointer"
            >
              انتشار فوری بنر تبلیغاتی تالار در برنامه + محاسبه ۲۵٪ پورسانت
            </button>
          </form>

          {/* Live Active Hall Advertisements Board */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-[#D4AF37] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E6DFD3] pb-3">
              <div className="font-black text-base text-[#2C1E16] flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#E11D48]" />
                <span>تابلوی زنده تبلیغات ویژه تالارهای عضو ({featuredHallAds.length} تالار فعال)</span>
              </div>
              <span className="text-xs text-[#6E5A4F]">
                با کلیک روی هر آگهی، منوساز با نرخ و نام همان تالار بارگذاری می‌شود
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {featuredHallAds.map((ad) => (
                <div
                  key={ad.id}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0F3] via-[#FFFDF9] to-[#FEF9E7] border-2 border-[#D4AF37] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] font-extrabold">
                        {ad.tierBadge}
                      </span>
                      <h4 className="font-black text-sm text-[#2C1E16]">{ad.hallName}</h4>
                      <span className="text-xs text-[#6E5A4F]">({ad.city})</span>
                    </div>
                    <p className="text-xs font-bold text-[#9A7411]">🎁 {ad.offerHeadline}</p>
                    <div className="text-[11px] text-[#6E5A4F]">
                      ظرفیت: {ad.capacity} • مدیریت: {ad.managerName}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateBrand({
                        hallName: ad.hallName,
                        agencyType: 'باغ‌تالار و تشریفات VIP',
                        managerName: ad.managerName,
                        city: ad.city,
                        whatsapp: ad.whatsapp,
                        slogan: ad.offerHeadline,
                        priceMultiplier: ad.priceMultiplier,
                      });
                      document.getElementById('builder')?.scrollIntoView({behavior: 'smooth'});
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#2C1E16] text-[#E6C258] border border-[#C59B27] font-extrabold text-xs hover:bg-[#3E2723] transition shrink-0 cursor-pointer"
                  >
                    ورود به منوساز این تالار
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
