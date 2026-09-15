/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Menu, Search, Gift, Play, Pause, ChevronLeft, ChevronRight,
  Apple, PlayCircle, Star, Monitor, Backpack, Swords, RefreshCw,
  Sparkles, Shield, Award, Gem, BookOpen, Copy, Check, X,
} from 'lucide-react';
import { motion } from 'motion/react';
import mabinogiBg from '../public/mabinogi_bg.png';

// ---------------------------------------------------------------
// Type declaration for window.AF_SMART_SCRIPT
// Required to use the Smart Script library loaded via CDN in index.html
// ---------------------------------------------------------------
declare global {
  interface Window {
    AF_SMART_SCRIPT: {
      generateOneLinkURL: (params: {
        oneLinkURL: string;
        afParameters: Record<string, unknown>;
      }) => { clickURL: string } | null;
      generateDirectClickURL: (params: {
        afParameters: Record<string, unknown>;
        platform: string;
        app_id: string;
        redirectURL: string;
      }) => { clickURL: string } | null;
      fireImpressionsLink: () => void;
      version: string;
    };
  }
}

// ---------------------------------------------------------------
// Smart Script configuration
// ---------------------------------------------------------------
const ONE_LINK_URL = 'https://nx-mbng-demo.onelink.me/JawM';

const PLATFORMS = {
  ios: {
    platformName: 'ios',
    appid: 'id1111742921',
    redirectURL: 'https://apps.apple.com/kr/app/id1111742921',
  },
  android: {
    platformName: 'android',
    appid: 'com.xptest.mbng',
    redirectURL: 'https://play.google.com/store/apps/details?id=com.nexon.devcat.mm',
  },
  galaxy: {
    platformName: 'android', // Galaxy Store also uses android as platformName
    appid: 'com.xptest.mbng.galaxy',
    redirectURL:
      'https://apps.samsung.com/appquery/appDetail.as?appId=com.nexon.devcat.mmgalaxy',
  },
  nativepc: {
    platformName: 'nativepc',
    appid: '11117429211111',
    redirectURL: 'https://mabinogimobile.nexon.com/Support/DownLoad',
  },
} as const;

type PlatformKey = keyof typeof PLATFORMS;

// CTA button label definitions
const CTA_LABELS: Record<PlatformKey, string> = {
  ios:      'App Store',
  android:  'Google Play',
  galaxy:   'Galaxy Store',
  nativepc: 'PC버전',
};

// ---------------------------------------------------------------
// Static mock content (visual only — modeled after the current
// mabinogimobile.nexon.com portal layout, 1주년 페스티벌 테마로 각색)
// ---------------------------------------------------------------
const GNB_ITEMS = ['에린 소식', '게임 소개', '커뮤니티', '랭킹', '미디어', '크리에이터즈', '고객지원', '넥슨 쇼핑'];

const HERO_SLIDES = [
  {
    tag: '이벤트',
    title: ['감사의 마음을 모아', '1주년 페스티벌'],
    desc: '에린에서의 지난 1년을 함께한 모험가님들께 감사드리며, 다양한 기념 미션과 선물을 준비했습니다!',
  },
  {
    tag: '이벤트',
    title: ['1주년', '스페셜 위크'],
    desc: '매일 접속하고 스페셜 위크 미션을 클리어해 특별한 보상을 받아보세요.',
  },
  {
    tag: '업데이트',
    title: ['1주년 기념', '업데이트 안내'],
    desc: '신규 서버 <클라> 오픈 및 주요 업데이트 소식을 확인해보세요.',
  },
  {
    tag: '이벤트',
    title: ['최대 33만원 상당 혜택', '1주년 혜택 페스타'],
    desc: '넥슨 현대카드 Ed.2 마비노기 모바일팩 등 다양한 혜택을 만나보세요.',
  },
];

const NEWS_TABS = ['전체', '공지사항', '이벤트', '업데이트', '에린 노트'];

const NEWS_ITEMS = [
  { category: '공지사항 · 안내', title: "'마비노기 모바일 1주년 커넥터(Beta)' 기능 안내", date: '2026.09.09', hasImage: false },
  { category: '공지사항 · 안내', title: '시즌 별 룬 효과 적용 규칙 변경 안내', date: '2026.09.09', hasImage: false },
  { category: '이벤트 · 진행중', title: '1주년 페스티벌 이벤트 상세 안내', date: '2026.09.02', hasImage: true },
];

const COMMUNITY_TABS = ['길드 모집', '스크린샷', '공략 게시판'];

const COMMUNITY_ITEMS = [
  '[라사] Lv.7 1주년 기념 길드원 모집! (26/36)',
  '[던컨] Lv.6 페스티벌 함께할 길드원 모집중!!',
  '[아이라] Lv.7 신규 서버 <클라> 길드원 모집 (34/36)',
  '[유화] Lv.5 초보 환영 길드원 모집합니다',
  '[던컨] Lv.7 혜택 페스타 함께해요! [함선완료]',
  '[아이라] Lv.6 즉시가입 미션, 자유, 매너',
];

const VIDEO_ITEMS = [
  '1주년 페스티벌 하이라이트',
  '신규 서버 <클라> 소개 영상',
  '1주년 기념 캐릭터 스토리',
  '혜택 페스타 이벤트 안내 영상',
];

const GUIDE_ITEMS = [
  { icon: Backpack, label: '자동 세팅' },
  { icon: Swords, label: '전투 가이드' },
  { icon: RefreshCw, label: '아이템 전환하기' },
  { icon: Sparkles, label: '소울스트림' },
  { icon: Shield, label: '마도 저항/압력' },
  { icon: Award, label: '초월 각인' },
  { icon: Gem, label: '보석 가이드' },
  { icon: BookOpen, label: '연금술' },
];

export default function App() {
  const [activeNav, setActiveNav] = useState(GNB_ITEMS[0]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [activeNewsTab, setActiveNewsTab] = useState(NEWS_TABS[0]);
  const [activeCommunityTab, setActiveCommunityTab] = useState(COMMUNITY_TABS[0]);

  const [ctaLinks, setCtaLinks] = useState<Partial<Record<PlatformKey, string>>>({});

  // Impression debug panel
  const [impressionURL, setImpressionURL] = useState<string | null>(null);
  const [showImpression, setShowImpression] = useState(false);

  // CTA click panels — persists after mouse leave, supports multiple open panels
  const [ctaPanels, setCtaPanels] = useState<Array<{ id: number; label: string; url: string; zIndex: number }>>([]);
  const [zCounter, setZCounter] = useState(120);

  const openCtaPanel = (label: string, url: string) => {
    setZCounter((prev) => {
      const newZ = prev + 1;
      setCtaPanels((panels) => {
        // If panel for this platform already open, bring to front
        const exists = panels.find((p) => p.label === label);
        if (exists) {
          return panels.map((p) => p.label === label ? { ...p, zIndex: newZ } : p);
        }
        return [...panels, { id: Date.now(), label, url, zIndex: newZ }];
      });
      return newZ;
    });
  };

  const closeCtaPanel = (id: number) => {
    setCtaPanels((panels) => panels.filter((p) => p.id !== id));
  };

  const bringToFront = (id: number) => {
    setZCounter((prev) => {
      const newZ = prev + 1;
      setCtaPanels((panels) => panels.map((p) => p.id === id ? { ...p, zIndex: newZ } : p));
      return newZ;
    });
  };

  // Clipboard copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Hero carousel auto-advance (visual only)
  useEffect(() => {
    if (heroPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroPaused]);

  useEffect(() => {
    // Verify window.AF_SMART_SCRIPT is available
    if (!window.AF_SMART_SCRIPT) {
      console.error('[SmartScript] window.AF_SMART_SCRIPT is not available. Check the CDN script tag in index.html.');
      return;
    }

    // ---------------------------------------------------------------
    // Attribution parameter definitions
    // Reads UTM parameters from the incoming URL, falls back to defaultValue
    // ---------------------------------------------------------------

    // utm_medium → af_channel mapping:
    // Integrated sources (SRN) manage their own channel attribution,
    // so af_channel is only set from utm_medium for non-integrated sources.
    const INTEGRATED_SOURCES = new Set([
      'googleads_int',
      'metaweb_int',
      'tiktokweb_int',
      'snapchat_int',
    ]);
    const utmSource = new URLSearchParams(window.location.search).get('utm_source') ?? '';
    const channelKeys = INTEGRATED_SOURCES.has(utmSource)
      ? ['inchnl']
      : ['inchnl', 'utm_medium'];

    const afParameters: Record<string, unknown> = {
      mediaSource:      { keys: ['utm_source'],                        defaultValue: 'game_media_source' },
      campaign:         { keys: ['utm_campaign', 'campaign_name'],     defaultValue: 'game_landing_page' },
      channel:          { keys: channelKeys },
      ad:               { keys: ['utm_content', 'ad_name'],            defaultValue: 'game_ad_name' },
      adSet:            { keys: ['utm_term', 'adset_name'],             defaultValue: 'game_adset_name' },
      afSub2:           { keys: ['fbclid'] },
      googleClickIdKey: 'af_sub4',
      afCustom: [
        // Required for cross-platform attribution. Included in impression link only.
        { paramKey: 'af_xplatform', keys: [], defaultValue: 'true' },
        { paramKey: 'af_media_type', keys: ['utm_medium'] },
      ],
    };

    // ---------------------------------------------------------------
    // Step A: Fire impression (runs automatically on page load)
    // ---------------------------------------------------------------
    const olResult = window.AF_SMART_SCRIPT.generateOneLinkURL({
      oneLinkURL: ONE_LINK_URL,
      afParameters,
    });

    if (olResult) {
      // Reconstruct the actual impression URL using the same logic as fireImpressionsLink() internally:
      // Smart Script: new URL(clickURL) → replace hostname with impressions.onelink.me
      try {
        const impressionUrlObj = new URL(olResult.clickURL);
        impressionUrlObj.hostname = 'impressions.onelink.me';
        setImpressionURL(impressionUrlObj.href);
      } catch {
        setImpressionURL(olResult.clickURL);
      }
      setShowImpression(true);
      // 1000ms setTimeout is a temporary bug fix from the official sample
      setTimeout(() => {
        window.AF_SMART_SCRIPT.fireImpressionsLink();
        console.log('[SmartScript] Impression fired');
      }, 1000);
    } else {
      console.warn('[SmartScript] generateOneLinkURL returned null. Impression was not fired.');
    }

    // ---------------------------------------------------------------
    // Step B: Remove af_xplatform from afParameters
    // Not needed in Direct Click URLs — including it would cause confusion
    // ---------------------------------------------------------------
    const customParams = afParameters.afCustom as Array<{ paramKey: string }>;
    const xplatformIndex = customParams.findIndex((item) => item.paramKey === 'af_xplatform');
    if (xplatformIndex !== -1) {
      customParams.splice(xplatformIndex, 1);
    }

    // ---------------------------------------------------------------
    // Step C: Generate Direct Click URL for each platform and save to state
    // ---------------------------------------------------------------
    const links: Partial<Record<PlatformKey, string>> = {};

    (Object.keys(PLATFORMS) as PlatformKey[]).forEach((key) => {
      const p = PLATFORMS[key];
      const result = window.AF_SMART_SCRIPT.generateDirectClickURL({
        afParameters,
        platform: p.platformName,
        app_id:   p.appid,
        redirectURL: p.redirectURL,
      });

      if (result) {
        links[key] = result.clickURL;
        console.log(`[SmartScript] ${key} link:`, result.clickURL);
      } else {
        console.warn(`[SmartScript] generateDirectClickURL returned null for platform: ${key}`);
      }
    });

    // Update state in one call — reflected in each <a> tag's href
    setCtaLinks(links);
  }, []); // Runs once on mount

  const slide = HERO_SLIDES[activeSlide];

  const ctaButtonConfig: Array<{ key: PlatformKey; icon: React.ElementType; sub: string }> = [
    { key: 'ios', icon: Apple, sub: 'App Store에서' },
    { key: 'android', icon: PlayCircle, sub: 'Google Play에서' },
    { key: 'galaxy', icon: Star, sub: '다운로드하기' },
    { key: 'nativepc', icon: Monitor, sub: 'PC버전' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] font-sans select-none">
      {/* ============================================================
          Top account bar
      ============================================================ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto h-9 flex items-center justify-between px-4">
          <button className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-black transition-colors">
            <Menu size={14} />
            메뉴
          </button>
          <div className="text-base font-black tracking-tighter text-black">NEXON</div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <Gift size={14} className="cursor-pointer hover:text-gray-800" />
            <button className="hover:underline">회원가입</button>
            <button className="px-3 py-1 border border-black rounded-full font-bold text-black hover:bg-gray-50 transition-colors">
              로그인
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          Game sub-GNB
      ============================================================ */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto h-16 flex items-center justify-between px-4 gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-gray-900">마비노기</div>
              <div className="text-[10px] text-gray-500 -mt-0.5">모바일</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-700 overflow-x-auto">
            {GNB_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                  activeNav === item
                    ? 'text-[#05a77b] border-[#05a77b] font-bold'
                    : 'border-transparent hover:text-black'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <Search size={18} className="text-gray-500 cursor-pointer hover:text-black" />
            <button className="bg-[#00E699] hover:bg-[#00cf8a] text-white font-black px-6 py-2 rounded-full shadow-[0_4px_14px_0_rgba(0,230,153,0.39)] transition-all transform hover:scale-105 active:scale-95 text-[12px] tracking-tight whitespace-nowrap">
              GAME START
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          Hero event banner (carousel, visual only)
      ============================================================ */}
      <section className="relative w-full h-[380px] overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mabinogiBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto h-full flex flex-col justify-center px-4">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg"
          >
            <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded text-[12px] font-bold mb-4">
              {slide.tag}
            </span>
            <h2 className="text-4xl font-black text-white leading-tight mb-4 drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]">
              {slide.title[0]}<br />{slide.title[1]}
            </h2>
            <p className="text-[13px] text-white/80 leading-relaxed max-w-md">
              {slide.desc}
            </p>
          </motion.div>
        </div>

        {/* Play/pause + slide counter */}
        <div className="absolute right-4 bottom-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5 text-white text-[12px] font-mono">
          <button onClick={() => setHeroPaused((p) => !p)} className="hover:text-emerald-400">
            {heroPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <span>{String(activeSlide + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}</span>
        </div>
      </section>

      {/* Thumbnail nav strip below hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto flex items-center px-4">
          <button
            onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="text-gray-400 hover:text-black p-2 shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 grid grid-cols-4 gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`text-left py-3 border-b-2 transition-colors ${
                  i === activeSlide ? 'border-[#05a77b]' : 'border-transparent'
                }`}
              >
                <div className={`text-[10px] font-bold mb-1 ${i === activeSlide ? 'text-[#05a77b]' : 'text-gray-400'}`}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className={`text-[12px] truncate ${i === activeSlide ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                  {s.title.join(' ')}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="text-gray-400 hover:text-black p-2 shrink-0"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ============================================================
          Main content
      ============================================================ */}
      <main className="max-w-[1200px] mx-auto px-4 py-12 space-y-16">

        {/* 에린 소식 + 커뮤니티 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 에린 소식 */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-4">에린 소식</h3>
            <div className="flex gap-2 mb-4">
              {NEWS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveNewsTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    activeNewsTab === tab
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {NEWS_ITEMS.map((item, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div
                    className={`h-28 flex items-center justify-center ${
                      item.hasImage ? 'bg-cover bg-center' : 'bg-gradient-to-br from-indigo-900 to-purple-900'
                    }`}
                    style={item.hasImage ? { backgroundImage: `url(${mabinogiBg})` } : undefined}
                  >
                    {!item.hasImage && <Sparkles size={28} className="text-white/70" />}
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] text-gray-400 mb-1">{item.category}</div>
                    <div className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 mb-2">{item.title}</div>
                    <div className="text-[11px] text-gray-400">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 커뮤니티 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">커뮤니티</h3>
            <div className="flex gap-2 mb-4">
              {COMMUNITY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCommunityTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    activeCommunityTab === tab
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-100 shadow-sm mb-4">
              {COMMUNITY_ITEMS.map((text, i) => (
                <div key={i} className="px-4 py-3 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer truncate">
                  <span className="text-[10px] text-gray-400 mr-2">길드 모집 홍보</span>
                  {text}
                </div>
              ))}
            </div>
            <div className="bg-[#12142c] rounded-xl p-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-white/70" />
              </div>
              <div className="text-[11px] text-white/60 space-y-1 mb-4">
                <div>· 넥슨ID 찾기</div>
                <div>· 비밀번호 찾기</div>
                <div>· 회원가입</div>
              </div>
              <button className="w-full bg-[#00cf8a] hover:bg-[#00b87a] text-white font-bold py-2.5 rounded-lg transition-colors">
                로그인
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            다운로드 배너 — AppsFlyer Direct Click URL CTA
        ============================================================ */}
        <div>
          <div className="flex flex-wrap justify-center gap-3">
            {ctaButtonConfig.map(({ key, icon: Icon, sub }) => (
              <a
                key={key}
                href={ctaLinks[key] ?? '#'}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => ctaLinks[key] && openCtaPanel(CTA_LABELS[key], ctaLinks[key]!)}
                className={`flex items-center gap-3 bg-black text-white rounded-full px-6 py-3 hover:bg-gray-800 transition-all active:scale-95 ${
                  key === 'galaxy' ? 'border border-pink-500/40' : ''
                }`}
              >
                <Icon size={20} className={key === 'galaxy' ? 'text-pink-500' : ''} />
                <div className="text-left leading-tight">
                  <div className="text-[9px] opacity-70">{sub}</div>
                  <div className="text-[13px] font-bold">{CTA_LABELS[key]}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 공식 영상 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">공식 영상</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {VIDEO_ITEMS.map((title, i) => (
              <div key={i} className="cursor-pointer group">
                <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <Play size={16} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>
                <div className="text-[12px] text-gray-700 font-medium leading-snug line-clamp-2">
                  [마비노기 모바일] {title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 가이드 둘러보기 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">가이드 둘러보기</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {GUIDE_ITEMS.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-[#2d3654] flex items-center justify-center group-hover:bg-[#3a4570] transition-colors">
                  <Icon size={24} className="text-white/90" />
                </div>
                <div className="text-[11px] text-gray-600 text-center leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
          <div className="flex gap-4">
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>운영정책</span>
          </div>
          <div>© 2026 NEXON Korea Corp. &amp; devCAT CO., LTD. All Rights reserved.</div>
        </div>
      </footer>

      {/* ============================================================
          Impression URL debug panel
          Shown on page load, dismissed via close button
      ============================================================ */}
      {showImpression && impressionURL && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
        >
          <div className="pointer-events-auto w-[680px] max-w-[90vw] bg-gray-950/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/40 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-bold text-base tracking-wide">IMPRESSION FIRED</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => impressionURL && handleCopy(impressionURL, 'impression')}
                  className="text-gray-400 hover:text-emerald-400 transition-colors p-1 rounded-lg hover:bg-white/10"
                  title="Copy URL"
                >
                  {copiedKey === 'impression' ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
                <button
                  onClick={() => setShowImpression(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Full URL display */}
            <div className="bg-black/50 rounded-xl p-4 border border-gray-700">
              <div className="text-[12px] text-gray-500 font-mono mb-2 uppercase tracking-widest">Impression URL</div>
              <p className="text-emerald-300 font-mono text-[13px] leading-relaxed break-all">
                {impressionURL}
              </p>
            </div>

            {/* Parsed parameters (af_js_web and af_ss_ver excluded) */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(() => {
                try {
                  const urlObj = new URL(impressionURL);
                  const EXCLUDE = new Set(['af_js_web', 'af_ss_ver']);
                  const params = Array.from(urlObj.searchParams.entries()).filter(([k]) => !EXCLUDE.has(k));
                  return params.map(([k, v]) => (
                    <div key={k} className="flex gap-2 bg-white/5 rounded-lg px-3 py-2 text-[13px]">
                      <span className="text-gray-400 font-mono shrink-0">{k}</span>
                      <span className="text-white font-mono truncate">{v}</span>
                    </div>
                  ));
                } catch {
                  return null;
                }
              })()}
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================
          CTA click panels
          Opens on mouse enter, persists until closed via X button
          Each platform has its own panel with independent z-index
      ============================================================ */}
      {ctaPanels.map((panel) => (
        <motion.div
          key={panel.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          style={{ zIndex: panel.zIndex }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          onClick={() => bringToFront(panel.id)}
        >
          <div className="pointer-events-auto w-[680px] max-w-[90vw] bg-gray-950/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-500/40 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="text-blue-400 font-bold text-base tracking-wide">
                  CLICK URL &nbsp;·&nbsp; {panel.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(panel.url, `cta-${panel.id}`)}
                  className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-white/10"
                  title="Copy URL"
                >
                  {copiedKey === `cta-${panel.id}` ? <Check size={18} className="text-blue-400" /> : <Copy size={18} />}
                </button>
                <button
                  onClick={() => closeCtaPanel(panel.id)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Full URL display */}
            <div className="bg-black/50 rounded-xl p-4 border border-gray-700">
              <div className="text-[12px] text-gray-500 font-mono mb-2 uppercase tracking-widest">Direct Click URL</div>
              <p className="text-blue-300 font-mono text-[13px] leading-relaxed break-all">
                {panel.url}
              </p>
            </div>

            {/* Parsed parameters (af_js_web and af_ss_ver excluded) */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(() => {
                try {
                  const urlObj = new URL(panel.url);
                  const EXCLUDE = new Set(['af_js_web', 'af_ss_ver']);
                  const params = Array.from(urlObj.searchParams.entries()).filter(([k]) => !EXCLUDE.has(k));
                  return params.map(([k, v]) => (
                    <div key={k} className="flex gap-2 bg-white/5 rounded-lg px-3 py-2 text-[13px]">
                      <span className="text-gray-400 font-mono shrink-0">{k}</span>
                      <span className="text-white font-mono truncate">{decodeURIComponent(v)}</span>
                    </div>
                  ));
                } catch {
                  return null;
                }
              })()}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
