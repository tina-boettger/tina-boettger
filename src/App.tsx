/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  ArrowRight,
  ArrowLeft, 
  Linkedin, 
  Mail, 
  Menu, 
  X, 
  Mic2, 
  Lightbulb, 
  Users, 
  Building2,
  Microscope,
  Library,
  ChevronRight,
  Play,
  Pause,
  Minus,
  Plus
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { BLOG_ARTICLE, BLOG_ARTICLES, BLOG_ARTICLE_PATH, ERASURE_ARTICLE_PATH, BlogArticlePage, BlogIndexPage, ErasureArticlePage, PublicationCard } from "./BlogPages";
import ForAgentsPage from "./ForAgentsPage";
import InnerCompassPage from "./inner-compass/InnerCompassPage";
import PrintSummaryPage from "./inner-compass/pages/PrintSummaryPage";
import LegalLinks from "./LegalLinks";
import PhotoCredits from "./PhotoCredits";
import { appAssetUrl, appHref, navigateToAppPath, normalizeRoutePath } from "./lib/routing";
import { buildPersonSchema, buildWebsiteSchema, SITE_URL, usePageSeo } from "./lib/seo";

const NAV_LINKS = (t: any) => [
  { name: t.nav.references, href: "#references" },
  { name: t.nav.topics, href: "#topics" },
  { name: t.nav.blog, href: "#publications" },
  { name: t.nav.about, href: "#about" },
  { name: t.nav.contact, href: "#contact" },
];

const TRANSLATIONS: any = {
  en: {
    nav: {
      about: "About",
      topics: "Topics",
      resources: "Resources",
      blog: "Blog",
      references: "References",
      contact: "Contact",
      button: "Try my Inner Compass"
    },
    hero: {
      headline: "Humanizing the AI Revolution.",
      intro: "Co-founder of Deutsche Telekom's AI community (5,000+ members). Computer scientist. Bridging technical depth with intercultural insight to build systems that balance power and responsibility.",
      cta_keynote: "Inquire for Keynote",
      cta_journey: "My Journey"
    },
    proof: {
      tag: "Moments of Impact",
      headline: "A journey of collaboration."
    },
    moments: [
      { title: "AI Community", image: "/ExplorAItion%20Day.webp" },
      { title: "Digital Gipfel", image: "/Digital%20Gipfel-1.webp" },
      { title: "Digital X", image: "/digital%20x.webp" },
      { title: "Curia e.V. (Femtec Alumnae)", image: "/curia.webp" },
      { title: "DI4 Summit", image: "/Di4.webp" },
      { title: "GAPS Agile Conference", image: "/GAPS-1.webp" },
      { title: "Bearingpoint AI Summit", image: "/BP%20Summit.webp" },
      { title: "FEMWORX", image: "/Femworx-1.webp" },
      { title: "AI Masterclasses", image: "/Workshops.webp" },
      { title: "Hack4Humans", image: "/Hackathon.webp" },
      { title: "Deutsche Telekom", image: "/Deutsche%20Telekom-n.webp" },
      { title: "AI Barcamp", image: "/Ai%20barcamp.webp" },
      { title: "Fraunhofer Research", image: "/Fraunhofer-1.webp" },
    ],
    topics: {
      headline: "Power, Responsibility, Humanity.",
      intro: "Combining technical depth with intercultural insight to explore how we build AI systems that serve everyone.",
      cta: "Inquire for your next event",
      list: [
        {
          title: "Human-Centered AI Leadership",
          description: "Creating spaces where humanity and technology coexist. How to lead teams through the biggest cultural shift of our decade."
        },
        {
          title: "DAIversity & Female AI",
          description: "Bringing diverse perspectives into machine learning research and implementation to build unbiased, inclusive systems."
        },
        {
          title: "The Ethics of Power",
          description: "Exploring how we build AI systems that manage the delicate balance of power, responsibility, and human dignity."
        }
      ]
    },
    about: {
      tag: "My Journey.",
      headline: "Technically Rooted. Human Driven.",
      p1: "I am a computer scientist who started in ML research at Fraunhofer. Today, I lead Deutsche Telekom's 5,000+ member AI community, creating spaces where bold experimentation is the norm.",
      quote: "Drawing from a harsh personal lesson—surviving the devastating Ahrtal flood—I explore the power of the liminal space: the chaotic threshold between what was lost and what is yet to be built.",
      p3: "This perspective drives everything I do in AI. From global hackathons to boardroom sessions, my goal is to ensure AI systems bring together power, responsibility, and humanity.",
      p4: "My intercultural insight, shaped by Indian roots, allows me to bridge the gap between technical complexity and the diverse human experiences AI must serve. I help public authorities and global organizations find confidence in their AI strategy.",
      stats: {
        community: { label: "Community Members", value: "5,000+" },
        roots: { label: "Fraunhofer Roots", value: "Tech Lead" },
        focus: { label: "Advocacy Focus", value: "Public Sector" }
      }
    },
    resources: {
      tag: "Resources",
      headline: "Tools & Presentations.",
      intro: "Explore my interactive tools and request presentations from my recent keynotes.",
      compass_title: "Inner Compass",
      compass_desc: "Discover your AI leadership style and navigate the complexities of human-centered AI with my interactive questionnaire created on Lovable.",
      compass_cta: "Try out my Inner Compass",
      compass_url: "/inner-compass",
      presentations_title: "Presentations",
      presentations_desc: "Request slides and materials from my masterclasses.",
      presentations_cta: "Request Materials"
    },
    contact: {
      tag: "Inquiries",
      headline: "Start the Conversation.",
      intro: "Whether you're looking for a keynote, strategic guidance, or a workshop on human-centered AI, I'm here to help.",
      cta: "Connect on LinkedIn",
      form_info: "For speaking inquiries and collaborations, please use the form or reach out directly via the LinkedIn button.",
      placeholders: {
        name: "Full Name",
        email: "Email Address",
        message: "Tell me about your project or event",
        button: "Send Message"
      }
    },
    blog: {
      tag: "Insights & Writing",
      headline: "Latest Publications.",
      readAll: "Read all"
    },
    footer: {
      tag: "© 2024 Tina Böttger — Human-First AI Leader",
      privacy: "Privacy Policy",
      terms: "Legal Notice"
    }
  },
  de: {
    nav: {
      about: "Über mich",
      topics: "Themen",
      resources: "Ressourcen",
      blog: "Blog",
      references: "Referenzen",
      contact: "Kontakt",
      button: "Finde deinen inneren Kompass"
    },
    hero: {
      headline: "Humanizing the AI Revolution.",
      intro: "Mitgründerin der KI-Community der Deutschen Telekom mit über 5.000 Mitgliedern. Informatikerin. Speakerin. Ich verbinde technische Tiefe mit menschlicher Perspektive — für KI, die wirksam, verantwortungsvoll und nahbar ist.",
      cta_keynote: "Keynote anfragen",
      cta_journey: "Mein Weg"
    },
    proof: {
      tag: "Moments of Impact",
      headline: "Momente, die Wirkung zeigen."
    },
    moments: [
      { title: "KI-Community", image: "/ExplorAItion%20Day.webp" },
      { title: "Digital Gipfel", image: "/Digital%20Gipfel-1.webp" },
      { title: "Digital X", image: "/digital%20x.webp" },
      { title: "Curia e.V. (Femtec Alumnae)", image: "/curia.webp" },
      { title: "DI4 Summit", image: "/Di4.webp" },
      { title: "GAPS Agile Conference", image: "/GAPS-1.webp" },
      { title: "Bearingpoint AI Summit", image: "/BP%20Summit.webp" },
      { title: "FEMWORX", image: "/Femworx-1.webp" },
      { title: "KI-Masterclasses", image: "/Workshops.webp" },
      { title: "Hack4Humans", image: "/Hackathon.webp" },
      { title: "Deutsche Telekom", image: "/Deutsche%20Telekom-n.webp" },
      { title: "AI Barcamp", image: "/Ai%20barcamp.webp" },
      { title: "Fraunhofer Research", image: "/Fraunhofer-1.webp" },
    ],
    topics: {
      tag: "Kern-Themen",
      headline: "Power, Responsibility, Humanity.",
      intro: "KI verändert nicht nur Technologien, sondern Organisationen, Entscheidungen und Zusammenarbeit. Ich zeige, wie wir KI-Systeme und Strategien entwickeln, die Menschen stärken — statt sie zu überfordern.",
      cta: "Keynote für dein Event anfragen",
      list: [
        {
          title: "Human-Centered AI Leadership",
          description: "Wie Führung in Zeiten von KI gelingt: Räume schaffen, in denen Menschen Orientierung finden, Teams experimentieren können und Technologie echten Mehrwert schafft."
        },
        {
          title: "DAIversity & Female AI",
          description: "Warum diverse Perspektiven entscheidend sind, wenn KI fairer, inklusiver und wirksamer werden soll — von Forschung bis Umsetzung."
        },
        {
          title: "The Ethics of Power",
          description: "KI ist Macht. Die Frage ist, wie wir sie gestalten. Ein Blick darauf, wie Verantwortung, Wirksamkeit und menschliche Würde zusammengehören."
        }
      ]
    },
    about: {
      tag: "Mein Weg",
      headline: "Technisch verwurzelt. Menschlich getrieben.",
      p1: "Als Informatikerin habe ich meine Laufbahn in der Machine-Learning-Forschung am Fraunhofer-Institut begonnen. Heute leite ich die KI-Community der Deutschen Telekom mit über 5.000 Mitgliedern und schaffe Räume, in denen Menschen KI verstehen, ausprobieren und verantwortungsvoll gestalten können.",
      quote: "Eine prägende persönliche Erfahrung war das Überleben der Flutkatastrophe im Ahrtal. Seitdem beschäftigt mich besonders der liminale Raum: diese unsichere Schwelle zwischen dem, was verloren gegangen ist, und dem, was neu entstehen kann.",
      p3: "Diese Perspektive prägt meine Arbeit. Ob globale Hackathons, Masterclasses oder Sessions mit Führungsteams: Mein Ziel ist es, KI so zu gestalten, dass sie Power, Verantwortung und Menschlichkeit verbindet.",
      p4: "Durch meine interkulturelle Prägung weiß ich, wie unterschiedlich Menschen auf Technologie, Wandel und Unsicherheit reagieren. Ich unterstütze Organisationen dabei, Komplexität verständlich zu machen und eigene Souveränität im Umgang mit KI aufzubauen.",
      stats: {
        community: { label: "Community-Mitglieder", value: "5.000+" },
        roots: { label: "Fraunhofer-Wurzeln", value: "Tech Lead" },
        focus: { label: "Schwerpunkt", value: "Öffentlicher Sektor" }
      }
    },
    resources: {
      tag: "Ressourcen",
      headline: "Tools & Präsentationen.",
      intro: "Nutze meine interaktiven Tools und lade Präsentationen meiner aktuellen Keynotes herunter.",
      compass_title: "Dein Innerer Kompass",
      compass_desc: "Entdecke deinen KI-Führungsstil und navigiere durch die Komplexität von Human-Centered AI mit meinem interaktiven Fragebogen, der auf Lovable erstellt wurde.",
      compass_cta: "Finde deinen inneren Kompass",
      compass_url: "/inner-compass",
      presentations_title: "Präsentationen",
      presentations_desc: "Frage Folien und Materialien meiner Masterclasses an.",
      presentations_cta: "Materialien anfragen",
      download_link_1: "Präsentation (PDF)",
      download_link_2: "Arbeitsblätter (PDF)"
    },
    contact: {
      tag: "Anfragen",
      headline: "Starten wir den Austausch.",
      intro: "Ob Keynote, strategischer Impuls oder Workshop zu Human-Centered AI — ich freue mich auf deine Nachricht.",
      cta: "Auf LinkedIn vernetzen",
      form_info: "Für Buchungsanfragen und Kooperationen nutze bitte das Formular oder kontaktiere mich direkt über LinkedIn.",
      placeholders: {
        name: "Vollständiger Name",
        email: "E-Mail-Adresse",
        message: "Erzähl mir von deinem Projekt oder Event",
        button: "Nachricht senden"
      }
    },
    blog: {
      tag: "Insights & Writing",
      headline: "Latest Publications.",
      readAll: "Alle lesen"
    },
    footer: {
      tag: "© 2024 Tina Böttger — Human-First AI Leader",
      privacy: "Datenschutz",
      terms: "Impressum"
    }
  }
};

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"en" | "de">("en");
  const [fontScale, setFontScale] = useState(() => {
    const saved = localStorage.getItem("site-font-scale");
    const parsed = saved ? Number(saved) : 1;
    return Number.isFinite(parsed) ? parsed : 1;
  });
  
  const t = TRANSLATIONS[lang];
  usePageSeo({
    title:
      lang === "de"
        ? "Tina Boettger | Human-Centered AI Leadership, trustworthy AI und Speakerin"
        : "Tina Boettger | Human-Centered AI Leader, Speaker, and Computer Scientist",
    description:
      lang === "de"
        ? "Tina Boettger ist Human-Centered AI Leaderin, Informatikerin und Speakerin mit Hintergrund bei Deutsche Telekom und Fraunhofer in trustworthy AI, KI-Führung und KI im öffentlichen Sektor."
        : "Tina Boettger is a human-centered AI leader, computer scientist, and speaker with Deutsche Telekom and Fraunhofer experience across trustworthy AI, AI leadership, and public-sector AI.",
    path: "/",
    jsonLd: [
      buildWebsiteSchema(),
      buildPersonSchema(),
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        url: SITE_URL,
        name: "Tina Boettger professional website",
        about: {
          "@id": `${SITE_URL}#person`,
        },
      },
    ],
  });
  const navLinks = NAV_LINKS(t);
  const MOMENTS = t.moments;
  const visibleTopics = t.topics.list.filter((topic: any) => topic?.title && topic?.description);
  const totalMoments = MOMENTS.length;
  const EXTENDED_MOMENTS = [...MOMENTS, ...MOMENTS, ...MOMENTS];

  const [activeMoment, setActiveMoment] = useState(totalMoments);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "reduce-color", "mono-font");
    document.body.classList.remove("no-motion");

    const clamped = Math.min(1.2, Math.max(0.9, fontScale));
    document.documentElement.style.setProperty("--font-scale", String(clamped));
    localStorage.setItem("site-font-scale", String(clamped));

    return () => {
      document.documentElement.style.removeProperty("--font-scale");
    };
  }, [fontScale]);

  const decreaseFontScale = () => setFontScale((current) => Math.max(0.9, Number((current - 0.05).toFixed(2))));
  const increaseFontScale = () => setFontScale((current) => Math.min(1.2, Number((current + 0.05).toFixed(2))));
  const renderFontControls = () => (
    <div className="inline-flex h-7 min-w-[88px] shrink-0 items-center rounded-[4px] border border-brand-line bg-brand-paper overflow-hidden whitespace-nowrap leading-none">
      <button
        type="button"
        onClick={decreaseFontScale}
        disabled={fontScale <= 0.9}
        aria-label={lang === "de" ? "Schrift verkleinern" : "Decrease font size"}
        className="h-full w-7 grid place-items-center text-brand-charcoal/70 hover:bg-brand-charcoal hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-charcoal/70 transition-all"
      >
        <Minus size={11} strokeWidth={2.4} />
      </button>
      <span className="h-full min-w-6 border-x border-brand-line grid place-items-center text-[10px] font-bold text-brand-charcoal/55">
        A
      </span>
      <button
        type="button"
        onClick={increaseFontScale}
        disabled={fontScale >= 1.2}
        aria-label={lang === "de" ? "Schrift vergrößern" : "Increase font size"}
        className="h-full w-7 grid place-items-center text-brand-charcoal/70 hover:bg-brand-charcoal hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-charcoal/70 transition-all"
      >
        <Plus size={11} strokeWidth={2.4} />
      </button>
    </div>
  );
  
  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(true), 20);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextMoment = () => setActiveMoment((prev) => prev + 1);
  const prevMoment = () => setActiveMoment((prev) => prev - 1);

  const handleAnimationComplete = () => {
    if (activeMoment >= totalMoments * 2) {
      setIsTransitioning(false);
      setActiveMoment(activeMoment - totalMoments);
    } else if (activeMoment <= 0) {
      setIsTransitioning(false);
      setActiveMoment(activeMoment + totalMoments);
    }
  };

  const handleManualNav = (direction: 'next' | 'prev') => {
    setIsAutoPlaying(false); // Pause auto-play on manual interaction
    if (direction === 'next') nextMoment();
    else prevMoment();
    
    // Resume auto-play after a delay
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextMoment, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const stagger = {
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);
    if (elem) {
      const offset = 80; // Header height offset
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Website Inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:hello@tinaboettger.com?subject=${subject}&body=${body}`;
  };

  const navigateToPath = (path: string) => {
    if (path === "/inner-compass") {
      localStorage.setItem("inner-compass-language", lang);
    }

    navigateToAppPath(path);
  };

  const navigateToBlog = (path = "/blog") => {
    navigateToAppPath(path);
  };

  const legalPath = {
    privacy: lang === "de" ? "/datenschutz" : "/privacy",
    notice: lang === "de" ? "/impressum" : "/legal-notice",
  };

  return (
    <div className="min-h-screen selection:bg-brand-green selection:text-white font-sans">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled ? "bg-brand-paper py-3 md:py-4 border-b border-brand-line" : "bg-transparent py-4 md:py-8 border-b border-transparent"
        }`}
      >
        <div className="site-container flex justify-between items-center gap-4 py-4 min-h-[64px]">
          <a href="#" onClick={(e) => scrollToSection(e, "#")} className="font-serif text-2xl tracking-tighter font-bold whitespace-nowrap leading-none shrink-0">
            Tina Böttger.
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 min-w-0">
            <div className="flex shrink-0 items-center gap-2">
              <button 
                onClick={() => setLang(lang === "en" ? "de" : "en")}
                className="h-7 min-w-11 whitespace-nowrap text-[11px] font-bold border border-brand-line px-3 rounded-[4px] hover:bg-brand-charcoal hover:text-white transition-all uppercase tracking-widest leading-none"
              >
                {lang === "en" ? "DE" : "EN"}
              </button>
              {renderFontControls()}
            </div>
            <nav className="flex items-center gap-5 lg:gap-7 min-w-0">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-[13px] font-semibold hover:text-brand-green transition-colors uppercase tracking-[0.1em] whitespace-nowrap leading-none"
                >
                  {link.name}
                </a>
              ))}
              <a
                href={appHref(t.resources.compass_url)}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToPath(t.resources.compass_url);
                }}
                className="hidden xl:inline-flex bg-[#2D4A22] text-brand-paper px-6 py-3 rounded-[4px] text-[13px] font-semibold uppercase tracking-[0.1em] hover:opacity-90 transition-all whitespace-nowrap leading-none shrink-0"
              >
                {t.nav.button}
              </a>
            </nav>
          </div>

          {/* Mobile Toggle & Lang */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={() => setLang(lang === "en" ? "de" : "en")}
              className="h-7 min-w-9 whitespace-nowrap text-[10px] font-bold border border-brand-line px-2 rounded-[4px] leading-none"
            >
              {lang === "en" ? "DE" : "EN"}
            </button>
            {renderFontControls()}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-brand-paper border-b border-brand-line py-8 px-6 md:px-12 md:hidden flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => {
                  setIsMenuOpen(false);
                  scrollToSection(e, link.href);
                }}
                className="text-sm font-semibold uppercase tracking-widest hover:text-brand-green whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
            <a
              href={appHref(t.resources.compass_url)}
              onClick={(e) => {
                setIsMenuOpen(false);
                e.preventDefault();
                navigateToPath(t.resources.compass_url);
              }}
              className="inline-flex items-center justify-center bg-[#2D4A22] text-brand-paper px-6 py-4 rounded-[4px] text-[13px] font-semibold uppercase tracking-[0.1em] hover:opacity-90 transition-all whitespace-nowrap"
            >
              {t.nav.button}
            </a>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F6F4F0]">
        <div className="site-container relative flex flex-col justify-start md:justify-center min-h-[100svh] md:min-h-screen lg:min-h-[800px] pt-24 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-56 lg:pt-32 lg:pb-0">
          <div className="grid lg:grid-cols-12 w-full items-center gap-10 lg:gap-12 relative z-10 pt-[48svh] sm:pt-[50svh] lg:pt-0 pb-6 lg:pb-0">
            <motion.div 
              className="lg:col-span-6 lg:pr-12 relative z-20"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 mb-4 lg:mb-8 mt-0">
                <div className="w-8 lg:w-12 h-[1px] bg-brand-charcoal"></div>
                <p className="text-[10px] lg:text-[12px] font-bold uppercase tracking-[0.2em] text-brand-charcoal">
                  AI Leader. Speaker. Community Builder.
                </p>
              </div>

              <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[90px] xl:text-[110px] font-serif leading-[1.05] lg:leading-[0.9] tracking-[-0.04em] mb-6 lg:mb-10 text-brand-charcoal whitespace-normal sm:whitespace-nowrap">
                <span className="block">Humanizing the</span>
                <span className="block">AI Revolution.</span>
              </h1>
              
              <p className="text-base lg:text-xl text-brand-charcoal font-medium leading-relaxed mb-8 lg:mb-12 max-w-lg bg-[#F6F4F0]/80 lg:bg-transparent p-3 lg:p-0 rounded-[4px] backdrop-blur-sm lg:backdrop-blur-0">
                {t.hero.intro}
              </p>
              <p className="sr-only">
                {lang === "de"
                  ? "Tina Boettger ist Human-Centered AI Leaderin, Speakerin und Informatikerin. Sie ist Mitgründerin der KI-Community der Deutschen Telekom, hat Forschungshintergrund am Fraunhofer und arbeitet zu trustworthy AI, KI-Führung, Vielfalt in KI und dem öffentlichen Sektor."
                  : "Tina Boettger is a human-centered AI leader, speaker, and computer scientist. She co-founded Deutsche Telekom's AI community, has a Fraunhofer research background, and works on trustworthy AI, AI leadership, diversity in AI, and public-sector AI."}
              </p>

              <div className="flex flex-wrap gap-4 relative z-30">
                <a 
                  href="#contact" 
                  onClick={(e) => scrollToSection(e, "#contact")}
                  className="inline-block bg-[#2D4A22] text-brand-paper px-8 lg:px-10 py-4 lg:py-5 rounded-[4px] text-sm font-semibold uppercase tracking-[0.1em] hover:opacity-90 transition-all font-sans whitespace-nowrap"
                >
                  {t.hero.cta_keynote}
                </a>
                <a 
                  href="#about" 
                  onClick={(e) => scrollToSection(e, "#about")}
                  className="inline-flex min-w-[180px] items-center justify-center border border-brand-green px-8 lg:px-10 py-4 lg:py-5 rounded-[4px] text-sm font-semibold uppercase tracking-[0.1em] text-brand-green hover:bg-brand-green hover:text-brand-paper transition-all font-sans whitespace-nowrap"
                >
                  {t.hero.cta_journey}
                </a>
              </div>
            </motion.div>
          </div>

          {/* Large Profile Image background-integrated */}
          <motion.div 
            className="absolute right-0 top-20 h-[52svh] w-full lg:bottom-0 lg:top-0 lg:h-auto lg:w-[60%] flex items-start lg:items-end justify-end pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="relative w-full h-full mix-blend-darken">
              <img
                src={appAssetUrl("/New%20Picture.webp")}
                alt="Tina Böttger"
                className="w-full h-full object-cover object-[58%_top] sm:object-center lg:object-right-bottom opacity-90 lg:opacity-100"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              {/* Fade for mobile text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#F6F4F0] via-transparent to-transparent lg:hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#F6F4F0] via-[#F6F4F0]/20 to-transparent lg:hidden"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Moments of Impact Carousel */}
      <section id="references" className="site-section border-y border-brand-line bg-brand-paper overflow-hidden">
        <div className="site-container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-brand-muted font-bold mb-4">
                {t.proof.tag}
              </p>
              <h2 className="text-3xl md:text-4xl font-serif">{t.proof.headline}</h2>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleManualNav('prev')}
                className="p-3 border border-brand-line rounded-full hover:bg-brand-charcoal hover:text-white transition-all"
                aria-label="Previous moment"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="p-3 border border-brand-line rounded-full hover:bg-brand-charcoal hover:text-white transition-all"
                aria-label={isAutoPlaying ? "Pause autoplay" : "Play autoplay"}
              >
                {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => handleManualNav('next')}
                className="p-3 border border-brand-line rounded-full hover:bg-brand-charcoal hover:text-white transition-all"
                aria-label="Next moment"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <motion.div 
              className="flex -mx-3"
              animate={{ x: `${activeMoment * -(100 / itemsToShow)}%` }}
              transition={{ duration: isTransitioning ? 0.8 : 0, ease: [0.4, 0, 0.2, 1] }}
              onAnimationComplete={handleAnimationComplete}
            >
              {EXTENDED_MOMENTS.map((moment, idx) => (
                <div
                  key={`${moment.title}-${idx}`}
                  className="flex-shrink-0 px-3 w-full md:w-1/2 lg:w-1/3 group"
                >
                  <div className="aspect-[4/5] rounded-[4px] overflow-hidden border border-brand-line mb-6 relative bg-brand-charcoal/[0.03]">
                    <img
                      src={appAssetUrl(moment.image)}
                      alt={moment.title}
                      className="moment-image w-full h-full object-cover object-top transition-all duration-700"
                      referrerPolicy="no-referrer"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">{moment.title}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Speaking Topics */}
      <section id="topics" className="site-section-tight bg-brand-paper border-b border-brand-line">
        <div className="site-container grid md:grid-cols-2 gap-8 md:gap-14 items-start">
          <div className="flex flex-col justify-start">
            <span className="text-brand-green text-[12px] font-bold tracking-[0.1em] uppercase mb-4 block">{t.topics.tag}</span>
            <h2 className="text-4xl md:text-5xl font-serif leading-[1.1] mb-6 md:mb-8">{t.topics.headline}</h2>
            <p className="text-brand-muted text-lg max-w-sm mb-8 md:mb-10">
              {t.topics.intro}
            </p>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, "#contact")}
              className="text-sm font-bold uppercase tracking-widest text-brand-green hover:opacity-70 transition-opacity w-fit border-b border-brand-green pb-1"
            >
              {t.topics.cta}
            </a>
          </div>

          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            key={lang}
            className="flex flex-col gap-3"
          >
            {visibleTopics.map((topic: any) => (
              <motion.div 
                key={topic.title}
                variants={fadeInUp}
                className="p-6 bg-white rounded-[8px] border border-brand-line hover:border-brand-green/20 transition-all"
              >
                <h3 className="text-lg md:text-xl font-serif font-bold text-brand-green mb-2">
                  {topic.title}
                </h3>
                <p className="text-brand-muted text-sm leading-relaxed">
                  {topic.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="site-section-tight bg-brand-paper">
        <div className="site-container">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-stretch">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="block md:col-span-5 mb-8 md:mb-0"
            >
              <div className="rounded-[8px] overflow-hidden h-full min-h-[320px] md:min-h-[520px] relative border border-brand-line">
                <img
                  src={appAssetUrl("/Horizontal%20picture.webp")}
                  alt="Tina Böttger"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="md:col-span-7 border-l-0 md:border-l border-brand-line md:pl-12 lg:pl-16 px-0"
            >
              <span className="text-brand-green text-[12px] font-bold tracking-[0.1em] uppercase mb-4 md:mb-6 block">{t.about.tag}</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-8 md:mb-10 leading-tight">{t.about.headline}</h2>
              <div className="space-y-6 md:space-y-8 text-lg text-brand-muted leading-relaxed">
                <p>
                  {t.about.p1}
                </p>
                
                <div className="border-t border-brand-line pt-8 md:pt-10 pb-2">
                   <p className="font-serif italic text-xl md:text-2xl lg:text-[1.65rem] leading-relaxed text-brand-charcoal mb-6">
                     "{t.about.quote}"
                   </p>
                </div>

                <p>
                  {t.about.p3}
                </p>

                <div className="border-b border-brand-line pb-12">
                  <p>
                    {t.about.p4}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 pt-8 md:pt-10 text-center sm:text-left">
                <div className="flex flex-col">
                  <span className="text-3xl font-serif font-bold text-brand-charcoal mb-1 tracking-tight">{t.about.stats.community.value}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">{t.about.stats.community.label}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-serif font-bold text-brand-charcoal mb-1 tracking-tight">{t.about.stats.roots.value}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">{t.about.stats.roots.label}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-serif font-bold text-brand-charcoal mb-1 tracking-tight">{t.about.stats.focus.value}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">{t.about.stats.focus.label}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="publications" className="site-section border-t border-brand-line bg-brand-paper">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12 md:mb-16">
            <div>
              <span className="text-brand-green text-[12px] font-bold tracking-[0.1em] uppercase mb-4 block">{t.blog.tag}</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1]">{t.blog.headline}</h2>
            </div>
            <a
              href={appHref("/blog")}
              onClick={(e) => {
                e.preventDefault();
                navigateToBlog("/blog");
              }}
              className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-green border-b border-brand-green pb-2 hover:text-brand-charcoal hover:border-brand-charcoal transition-colors w-fit"
            >
              {t.blog.readAll} <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="site-scroll-rail">
            {BLOG_ARTICLES.map((article) => (
              <div key={article.path} className="site-scroll-item">
                <PublicationCard article={article} compact />
              </div>
            ))}
          </div>
          <p className="sr-only">
            Latest publication: {BLOG_ARTICLE.title}. {BLOG_ARTICLE.excerpt}
          </p>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="site-section-tight border-t border-brand-line bg-brand-paper">
        <div className="site-container grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="flex flex-col justify-start">
            <span className="text-brand-green text-[12px] font-bold tracking-[0.1em] uppercase mb-4 block">{t.resources.tag}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-6 md:mb-8">{t.resources.headline}</h2>
            <p className="text-brand-muted text-lg max-w-sm mb-8 md:mb-10">
              {t.resources.intro}
            </p>
          </div>
          <div className="space-y-6 md:space-y-8 flex flex-col justify-start">
            <div className="site-card p-8 md:p-12 hover:border-brand-green/20 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-50"><Library className="w-8 h-8 text-brand-green" /></div>
              <h3 className="text-2xl font-serif mb-4 flex items-center gap-3">{t.resources.compass_title}</h3>
              <p className="text-brand-muted mb-8 text-sm md:text-base leading-relaxed">
                {t.resources.compass_desc}
              </p>
              <a 
                href={appHref(t.resources.compass_url)}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToPath(t.resources.compass_url);
                }}
                className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest bg-brand-charcoal text-white hover:bg-brand-green px-6 py-4 transition-all whitespace-nowrap"
              >
                {t.resources.compass_cta} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="site-card-subtle p-8 md:p-12 hover:border-brand-green/20 transition-colors relative overflow-hidden group">
              <h3 className="text-2xl font-serif mb-4 flex items-center gap-3">{t.resources.presentations_title}</h3>
              <p className="text-brand-muted mb-8 text-sm md:text-base leading-relaxed">
                {t.resources.presentations_desc}
              </p>
              
              <a
                href="#contact"
                onClick={(event) => scrollToSection(event, "#contact")}
                className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-brand-charcoal border border-brand-line hover:border-brand-green hover:text-brand-green px-6 py-4 transition-all whitespace-nowrap"
              >
                {t.resources.presentations_cta} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="site-section border-t border-brand-line bg-brand-charcoal/[0.02]">
        <div className="site-container">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div className="text-center md:text-left">
              <span className="text-brand-green text-[12px] font-bold tracking-widest uppercase mb-4 md:mb-6 block">{t.contact.tag}</span>
              <h2 className="text-4xl md:text-5xl font-serif mb-6 md:mb-8">{t.contact.headline}</h2>
              <p className="text-lg text-brand-muted mb-8 md:mb-12 max-w-md">
                {t.contact.intro}
              </p>
              
              <div className="space-y-6">
                <a 
                  href="https://www.linkedin.com/in/tina-boettger" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-3 text-xl font-bold border-b-2 border-brand-green pb-1 hover:opacity-70 transition-all w-fit"
                >
                  <Linkedin className="w-5 h-5 text-brand-green" />
                  {t.contact.cta}
                </a>
                <p className="text-sm text-brand-muted mt-8">
                  {t.contact.form_info}
                </p>
              </div>
            </div>

            <form 
              className="space-y-6" 
              onSubmit={handleFormSubmit}
            >
              <input 
                type="text" 
                name="name"
                autoComplete="name"
                maxLength={120}
                required
                className="w-full bg-white border border-brand-line rounded-[4px] px-4 py-4 focus:outline-none focus:border-brand-green transition-colors text-sm" 
                placeholder={t.contact.placeholders.name} 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input 
                type="email" 
                name="email"
                autoComplete="email"
                maxLength={254}
                required
                className="w-full bg-white border border-brand-line rounded-[4px] px-4 py-4 focus:outline-none focus:border-brand-green transition-colors text-sm" 
                placeholder={t.contact.placeholders.email} 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <textarea 
                name="message"
                maxLength={4000}
                required
                className="w-full bg-white border border-brand-line rounded-[4px] px-4 py-4 focus:outline-none focus:border-brand-green transition-colors h-32 resize-none text-sm" 
                placeholder={t.contact.placeholders.message}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
              <button 
                type="submit"
                className="w-full bg-brand-accent text-brand-paper py-5 bg-brand-green rounded-[4px] text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all"
              >
                {t.contact.placeholders.button}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-brand-line bg-brand-paper">
        <div className="site-container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-brand-muted">{t.footer.tag}</span>
            <PhotoCredits />
          </div>
          
          <div className="flex gap-12 text-[10px] uppercase font-bold tracking-[0.05em] text-brand-muted">
            <a
              href={appHref(legalPath.privacy)}
              onClick={(e) => {
                e.preventDefault();
                navigateToPath(legalPath.privacy);
              }}
              className="hover:text-brand-green transition-colors"
            >
              {t.footer.privacy}
            </a>
            <a
              href={appHref(legalPath.notice)}
              onClick={(e) => {
                e.preventDefault();
                navigateToPath(legalPath.notice);
              }}
              className="hover:text-brand-green transition-colors"
            >
              {t.footer.terms}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const legalOwner = {
  name: "Tina Böttger",
  address: "Viktoriastraße 71, 44787 Bochum, Germany",
  email: "hello@tinaboettger.com",
};

function LegalPage({ type, language }: { type: "impressum" | "privacy"; language: "de" | "en" }) {
  const isPrivacy = type === "privacy";
  const isEnglish = language === "en";
  const legalTitle = isPrivacy
    ? isEnglish
      ? "Privacy Policy"
      : "Datenschutz"
    : isEnglish
      ? "Legal Notice"
      : "Impressum";

  usePageSeo({
    title: `${legalTitle} | Tina Boettger`,
    description: isPrivacy
      ? isEnglish
        ? "Privacy policy for the website tina-boettger.com."
        : "Datenschutzhinweise für die Website tina-boettger.com."
      : isEnglish
        ? "Legal notice for the website tina-boettger.com."
        : "Impressum und Anbieterkennzeichnung für die Website tina-boettger.com.",
    path: isPrivacy ? (isEnglish ? "/privacy" : "/datenschutz") : isEnglish ? "/legal-notice" : "/impressum",
    jsonLd: [buildWebsiteSchema(), buildPersonSchema()],
  });

  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToAppPath("/");
  };

  return (
    <div className="site-page">
      <a
        href={appHref("/")}
        onClick={goHome}
        className="site-back-link fixed top-4 right-4 z-50"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to site
      </a>

      <main className="site-container site-page-shell">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">
          {legalTitle}
        </p>
        <h1 className="mb-8 font-serif text-4xl leading-tight md:text-6xl">
          {isPrivacy ? (isEnglish ? "Privacy Policy" : "Datenschutzerklärung") : legalTitle}
        </h1>
        <p className="mb-12 max-w-3xl text-lg leading-relaxed text-brand-muted">
          {isPrivacy
            ? isEnglish
              ? "This English version is provided for international visitors. The German Datenschutz page remains the legally primary version."
              : "Diese Hinweise erklären, welche personenbezogenen Daten beim Besuch dieser Website verarbeitet werden. Die deutsche Fassung ist maßgeblich; die englischen Hinweise dienen der Orientierung."
            : isEnglish
              ? "This English legal notice is provided for international visitors. The German Impressum remains the legally primary version."
              : "Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und verantwortlich für Inhalte nach § 18 Abs. 2 Medienstaatsvertrag (MStV)."}
        </p>

        {isPrivacy ? (
          isEnglish ? <PrivacyContentEn /> : <PrivacyContent />
        ) : isEnglish ? (
          <ImpressumContentEn />
        ) : (
          <ImpressumContent />
        )}

        <footer className="mt-16 border-t border-brand-line pt-8">
          <LegalLinks language={language} />
          <div className="mt-4">
            <PhotoCredits />
          </div>
        </footer>
      </main>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-brand-line py-8">
      <h2 className="mb-4 font-serif text-2xl md:text-3xl">{title}</h2>
      <div className="space-y-4 text-brand-muted leading-relaxed">{children}</div>
    </section>
  );
}

function ImpressumContent() {
  return (
    <div>
      <LegalSection title="Anbieterin">
        <p>
          {legalOwner.name}
          <br />
          {legalOwner.address}
        </p>
        <p>
          E-Mail: <a className="text-brand-green underline" href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt">
        <p>
          Verantwortlich nach § 18 Abs. 2 MStV:
          <br />
          {legalOwner.name}
          <br />
          {legalOwner.address}
        </p>
      </LegalSection>

      <LegalSection title="Haftung und Urheberrecht">
        <p>
          Die Inhalte dieser Website wurden sorgfältig erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
        </p>
        <p>
          Die auf dieser Website erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Eine Nutzung außerhalb der gesetzlichen Grenzen bedarf der vorherigen Zustimmung.
        </p>
      </LegalSection>

      <LegalSection title="English summary">
        <p>
          Legal notice for tina-boettger.com. Provider and person responsible for editorial content: {legalOwner.name}, {legalOwner.address}. Contact: {legalOwner.email}.
        </p>
      </LegalSection>
    </div>
  );
}

function ImpressumContentEn() {
  return (
    <div>
      <LegalSection title="Provider">
        <p>
          {legalOwner.name}
          <br />
          {legalOwner.address}
        </p>
        <p>
          Email: <a className="text-brand-green underline" href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>
        </p>
      </LegalSection>

      <LegalSection title="Responsible for Content">
        <p>
          Responsible under Section 18(2) of the German Media State Treaty (MStV):
          <br />
          {legalOwner.name}
          <br />
          {legalOwner.address}
        </p>
      </LegalSection>

      <LegalSection title="Liability and Copyright">
        <p>
          The content on this website has been prepared with care. However, no guarantee is given for the accuracy, completeness, or currentness of the content.
        </p>
        <p>
          The content and works created for this website are subject to German copyright law. Use beyond the limits permitted by law requires prior consent.
        </p>
      </LegalSection>

      <LegalSection title="German Version">
        <p>
          This English version is provided for convenience. The German Impressum at <a className="text-brand-green underline" href={appHref("/impressum")}>/impressum</a> is the legally primary version.
        </p>
      </LegalSection>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div>
      <LegalSection title="Verantwortliche Stelle">
        <p>
          {legalOwner.name}
          <br />
          {legalOwner.address}
          <br />
          E-Mail: <a className="text-brand-green underline" href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>
        </p>
      </LegalSection>

      <LegalSection title="Verarbeitung beim Besuch der Website">
        <p>
          Beim Aufruf dieser Website können durch den Hostinganbieter technische Zugriffsdaten verarbeitet werden. Dazu gehören insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seiten, Browsertyp, Betriebssystem und Referrer-URL. Diese Daten werden verarbeitet, um die Website auszuliefern, stabil zu betreiben und die Sicherheit der Website zu gewährleisten.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im sicheren und zuverlässigen Betrieb dieser Website.
        </p>
      </LegalSection>

      <LegalSection title="Kontaktaufnahme per E-Mail oder Formular">
        <p>
          Das Kontaktformular dieser Website öffnet eine E-Mail über das Mailprogramm der besuchenden Person. Es findet keine serverseitige Speicherung von Formularinhalten durch diese Website statt.
        </p>
        <p>
          Wenn du Kontakt aufnimmst, werden die von dir übermittelten Daten verarbeitet, insbesondere Name, E-Mail-Adresse und Nachrichteninhalt. Die Verarbeitung erfolgt zur Bearbeitung deiner Anfrage auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO oder Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </LegalSection>

      <LegalSection title="Externe Links und LinkedIn">
        <p>
          Diese Website enthält Links zu externen Angeboten, insbesondere LinkedIn. Beim Anklicken eines externen Links verlässt du diese Website. Für die Datenverarbeitung auf den verlinkten Seiten ist der jeweilige Anbieter verantwortlich.
        </p>
      </LegalSection>

      <LegalSection title="Inner Compass und lokale Speicherung">
        <p>
          Eingaben im Inner Compass, einschliesslich Freitext, werden ausschliesslich lokal im Browser deines Geraets gespeichert, damit du eine Reflexion fortsetzen oder drucken kannst. Sie werden nicht an diese Website gesendet. Du kannst die gespeicherten Eingaben in der Anwendung jederzeit loeschen.
        </p>
      </LegalSection>

      <LegalSection title="Schriftarten">
        <p>
          Diese Website lädt Google Fonts über eine externe CSS-Einbindung. Dabei kann deine IP-Adresse an Google übermittelt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt in einer einheitlichen und ansprechenden Darstellung der Website.
        </p>
      </LegalSection>

      <LegalSection title="Keine Analyse- oder Trackingdienste">
        <p>
          Diese Website verwendet nach aktuellem Stand keine Analytics-Dienste, keine Tracking-Cookies, keinen Newsletter, keine Nutzerkonten, keinen Shop und keine Zahlungsabwicklung.
        </p>
      </LegalSection>

      <LegalSection title="Deine Rechte">
        <p>
          Du hast nach Maßgabe der DSGVO das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen bestimmte Verarbeitungen. Außerdem hast du das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren.
        </p>
      </LegalSection>

      <LegalSection title="English summary">
        <p>
          This website is an informational professional website. Contact requests are sent through your email client and are not stored by a backend form system. Server logs may be processed by the hosting provider. The site links to LinkedIn and currently loads Google Fonts externally. No analytics, tracking cookies, newsletter, shop, user accounts, or payment processing are used.
        </p>
      </LegalSection>

      <p className="pt-6 text-sm text-brand-muted">Stand: 13. Mai 2026</p>
    </div>
  );
}

function PrivacyContentEn() {
  return (
    <div>
      <LegalSection title="Controller">
        <p>
          {legalOwner.name}
          <br />
          {legalOwner.address}
          <br />
          Email: <a className="text-brand-green underline" href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>
        </p>
      </LegalSection>

      <LegalSection title="Visiting This Website">
        <p>
          When this website is accessed, the hosting provider may process technical access data. This can include the IP address, date and time of access, pages visited, browser type, operating system, and referrer URL. This data is processed to deliver the website, keep it stable, and protect its security.
        </p>
        <p>
          The legal basis is Article 6(1)(f) GDPR. The legitimate interest is the secure and reliable operation of this website.
        </p>
      </LegalSection>

      <LegalSection title="Contact by Email or Form">
        <p>
          The contact form on this website opens an email in the visitor&apos;s email client. This website does not store form submissions in a backend system.
        </p>
        <p>
          If you contact me, the data you provide will be processed, especially your name, email address, and message content. This processing is used to respond to your inquiry and is based on Article 6(1)(b) GDPR or Article 6(1)(f) GDPR.
        </p>
      </LegalSection>

      <LegalSection title="External Links and LinkedIn">
        <p>
          This website contains links to external services, especially LinkedIn. When you click an external link, you leave this website. The respective provider is responsible for data processing on the linked pages.
        </p>
      </LegalSection>

      <LegalSection title="Inner Compass and Local Storage">
        <p>
          Inner Compass responses, including free text, are stored only in your device&apos;s browser so that you can resume or print a reflection. They are not transmitted to this website. You can erase stored responses from within the tool at any time.
        </p>
      </LegalSection>

      <LegalSection title="Fonts">
        <p>
          This website currently loads Google Fonts through an external CSS import. Your IP address may be transmitted to Google. The legal basis is Article 6(1)(f) GDPR; the legitimate interest is a consistent and polished visual presentation of the website.
        </p>
      </LegalSection>

      <LegalSection title="No Analytics or Tracking Services">
        <p>
          This website currently does not use analytics services, tracking cookies, a newsletter, user accounts, a shop, or payment processing.
        </p>
      </LegalSection>

      <LegalSection title="Your Rights">
        <p>
          Under the GDPR, you have the right to access, rectification, deletion, restriction of processing, data portability, and objection to certain processing activities. You also have the right to lodge a complaint with a data protection supervisory authority.
        </p>
      </LegalSection>

      <LegalSection title="German Version">
        <p>
          This English version is provided for convenience. The German Datenschutz page at <a className="text-brand-green underline" href={appHref("/datenschutz")}>/datenschutz</a> is the legally primary version.
        </p>
      </LegalSection>

      <p className="pt-6 text-sm text-brand-muted">Last updated: May 13, 2026</p>
    </div>
  );
}

function NotFoundPage() {
  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToAppPath("/");
  };

  return (
    <div className="min-h-screen bg-brand-paper text-brand-charcoal flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-[11px] uppercase tracking-[0.15em] text-brand-muted font-bold mb-4">
          Page Not Found
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">This page does not exist.</h1>
        <a
          href={appHref("/")}
          onClick={goHome}
          className="inline-flex items-center gap-3 bg-brand-green text-brand-paper px-6 py-3 rounded-[4px] text-sm font-semibold uppercase tracking-[0.1em]"
        >
          Back to Home <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(() => normalizeRoutePath());

  useEffect(() => {
    const handleRouteChange = () => setPathname(normalizeRoutePath());
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  if (pathname === "/inner-compass") {
    return <InnerCompassPage />;
  }

  if (pathname === "/print-summary") {
    return <PrintSummaryPage />;
  }

  if (pathname === "/for-agents") {
    return <ForAgentsPage />;
  }

  if (pathname === "/blog") {
    return <BlogIndexPage />;
  }

  if (pathname === BLOG_ARTICLE_PATH) {
    return <BlogArticlePage />;
  }

  if (pathname === ERASURE_ARTICLE_PATH) {
    return <ErasureArticlePage />;
  }

  if (pathname === "/impressum") {
    return <LegalPage type="impressum" language="de" />;
  }

  if (pathname === "/legal-notice") {
    return <LegalPage type="impressum" language="en" />;
  }

  if (pathname === "/datenschutz") {
    return <LegalPage type="privacy" language="de" />;
  }

  if (pathname === "/privacy") {
    return <LegalPage type="privacy" language="en" />;
  }

  if (pathname === "/") {
    return <HomePage />;
  }

  return <NotFoundPage />;
}
