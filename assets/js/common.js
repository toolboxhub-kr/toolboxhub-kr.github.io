/**
 * ToolBox Hub - Common UI (KO / EN), GA4, Theme, Ad Slot Injector, Related Tools & Utilities
 */
(function () {
  "use strict";

  const path = window.location.pathname;
  const isEn = path.includes("/en/");
  const isTools = path.includes("/tools/");
  const ROOT = isEn ? (isTools ? "../.." : "..") : (isTools ? ".." : ".");

  // 0. Google Analytics 4 (GA4) Real-Time Tracking
  function initAnalytics() {
    const GA_ID = "G-K95DLD6FQQ";
    if (!GA_ID || document.getElementById("ga4-script")) return;
    const s = document.createElement("script");
    s.id = "ga4-script";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);
  }
  initAnalytics();

  // 1. Theme Management
  function initTheme() {
    const saved = localStorage.getItem("tbh-theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("tbh-theme", next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  // 2. Shared Header & Footer Injection (KO / EN)
  function renderHeader() {
    const target = document.getElementById("site-header");
    if (!target) return;
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    target.className = "site-header";

    if (isEn) {
      target.innerHTML = `
        <div class="container header-inner">
          <a href="${ROOT}/en/index.html" class="brand" aria-label="ToolBox Hub Home">
            <span class="brand-icon">⚡</span>
            <span>ToolBox Hub</span>
          </a>
          <nav class="header-nav" aria-label="Main Navigation">
            <a href="${ROOT}/en/index.html#finance" class="nav-link nav-hide-sm">Finance</a>
            <a href="${ROOT}/en/index.html#utility" class="nav-link nav-hide-sm">Utilities</a>
            <a href="${ROOT}/en/index.html#hobby" class="nav-link nav-hide-sm">Gaming &amp; DIY</a>
            <a href="${ROOT}/index.html" class="nav-link" title="Switch to Korean">🇰🇷 KR</a>
            <button id="theme-toggle-btn" class="theme-toggle" type="button" title="Toggle Dark Mode" aria-label="Toggle Dark Mode">
              ${theme === "dark" ? "☀️" : "🌙"}
            </button>
          </nav>
        </div>
      `;
    } else {
      target.innerHTML = `
        <div class="container header-inner">
          <a href="${ROOT}/index.html" class="brand" aria-label="ToolBox Hub 홈">
            <span class="brand-icon">⚡</span>
            <span>ToolBox Hub</span>
          </a>
          <nav class="header-nav" aria-label="주 메뉴">
            <a href="${ROOT}/index.html#finance" class="nav-link nav-hide-sm">금융·세금</a>
            <a href="${ROOT}/index.html#utility" class="nav-link nav-hide-sm">생활·유틸</a>
            <a href="${ROOT}/index.html#hobby" class="nav-link nav-hide-sm">게임·취미</a>
            <a href="${ROOT}/en/index.html" class="nav-link" title="English Version">🌐 EN</a>
            <button id="theme-toggle-btn" class="theme-toggle" type="button" title="다크모드 전환" aria-label="다크모드 전환">
              ${theme === "dark" ? "☀️" : "🌙"}
            </button>
          </nav>
        </div>
      `;
    }
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  function renderFooter() {
    const target = document.getElementById("site-footer");
    if (!target) return;
    const year = new Date().getFullYear();
    target.className = "site-footer";

    if (isEn) {
      target.innerHTML = `
        <div class="container footer-inner">
          <div>
            <strong>ToolBox Hub</strong> &copy; ${year}. 100% client-side processing — your data never leaves your browser.
          </div>
          <div class="footer-links">
            <a href="${ROOT}/en/index.html">All Tools</a>
            <a href="${ROOT}/index.html">한국어 버전</a>
            <a href="${ROOT}/privacy.html">Privacy</a>
            <a href="${ROOT}/contact.html">Contact</a>
            <a href="${ROOT}/sitemap.xml">Sitemap</a>
          </div>
        </div>
      `;
    } else {
      target.innerHTML = `
        <div class="container footer-inner">
          <div>
            <strong>ToolBox Hub</strong> &copy; ${year}. 모든 계산은 사용자 브라우저에서 안전하게 처리되며 서버로 데이터를 전송하지 않습니다.
          </div>
          <div class="footer-links">
            <a href="${ROOT}/about.html">사이트 소개</a>
            <a href="${ROOT}/privacy.html">개인정보처리방침</a>
            <a href="${ROOT}/contact.html">문의하기</a>
            <a href="${ROOT}/en/index.html">English</a>
            <a href="${ROOT}/sitemap.xml">사이트맵</a>
          </div>
        </div>
      `;
    }
  }

  // 3. Modular Ad Slot Renderer (AdSense + Coupang Partners)
  function renderAdSlots() {
    const cfg = window.AD_CONFIG || {};
    const slots = document.querySelectorAll("[data-ad-slot]");
    if (!slots.length) return;

    if (cfg.adsense && cfg.adsense.enabled && cfg.adsense.client && !document.getElementById("adsense-script")) {
      const script = document.createElement("script");
      script.id = "adsense-script";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cfg.adsense.client)}`;
      document.head.appendChild(script);
    }

    const labels = {
      top: isEn ? "Top Banner Ad Slot" : "상단 배너 광고 영역 (AdSense / 쿠팡 파트너스)",
      middle: isEn ? "In-Article Ad Slot" : "본문 중간 인아티클 광고 영역 (AdSense / 쿠팡 파트너스)",
      bottom: isEn ? "Bottom Multiplex Ad Slot" : "하단 멀티플렉스 광고 영역 (AdSense / 쿠팡 파트너스)",
    };

    slots.forEach((el) => {
      const pos = el.getAttribute("data-ad-slot") || "middle";
      el.classList.add("ad-slot");

      if (!isEn && cfg.coupang && cfg.coupang.enabled && cfg.coupang.slots && cfg.coupang.slots[pos]) {
        el.innerHTML = `
          <div class="coupang-banner">
            ${cfg.coupang.slots[pos]}
            <div class="coupang-disclosure">${cfg.coupang.disclosure || ""}</div>
          </div>
        `;
        return;
      }

      if (cfg.adsense && cfg.adsense.enabled && cfg.adsense.slots && cfg.adsense.slots[pos]) {
        el.innerHTML = `
          <ins class="adsbygoogle"
               style="display:block; width:100%;"
               data-ad-client="${cfg.adsense.client}"
               data-ad-slot="${cfg.adsense.slots[pos]}"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        `;
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {}
        return;
      }

      if (cfg.showPlaceholder !== false) {
        el.innerHTML = `
          <div class="ad-placeholder">
            <strong>AD SLOT · ${pos.toUpperCase()}</strong>
            <span>${labels[pos] || "Ad Slot"}</span>
          </div>
        `;
      } else {
        el.style.display = "none";
      }
    });
  }

  // 4. Related Tools Auto-Renderer (Internal Linking for SEO)
  function renderRelatedTools() {
    const container = document.getElementById("related-tools");
    const registry = isEn ? window.EN_TOOLS_REGISTRY : window.TOOLS_REGISTRY;
    if (!container || !Array.isArray(registry)) return;
    const currentFile = window.location.pathname.split("/").pop();
    const others = registry.filter((t) => !t.url.endsWith(currentFile)).slice(0, 4);
    if (!others.length) return;

    const heading = isEn ? "More Free Online Tools" : "함께 많이 쓰는 무료 도구";
    container.innerHTML = `
      <section class="related-section" aria-label="${heading}">
        <h2>${heading}</h2>
        <div class="related-grid">
          ${others
            .map(
              (t) => `
            <a class="related-card" href="${ROOT}/${t.url}">
              <span class="related-icon">${t.icon}</span>
              <div>
                <div class="related-title">${t.title}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">${t.category}</div>
              </div>
            </a>
          `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  // 5. Shared Helper Utilities
  window.TBH = {
    fmtNum(n, digits = 0) {
      if (typeof n !== "number" || !isFinite(n)) return "0";
      return n.toLocaleString(isEn ? "en-US" : "ko-KR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    },
    fmtWon(n) {
      return `${Math.round(n).toLocaleString("ko-KR")}원`;
    },
    fmtUSD(n, digits = 0) {
      if (typeof n !== "number" || !isFinite(n)) return "$0";
      return "$" + n.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    },
    toast(msg) {
      let el = document.getElementById("tbh-toast");
      if (!el) {
        el = document.createElement("div");
        el.id = "tbh-toast";
        el.className = "toast";
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(el._timer);
      el._timer = setTimeout(() => el.classList.remove("show"), 2200);
    },
    copyText(text) {
      const doneMsg = isEn ? "Copied to clipboard!" : "클립보드에 복사되었습니다.";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => window.TBH.toast(doneMsg));
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        window.TBH.toast(doneMsg);
      }
    },
  };

  initTheme();
  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    renderAdSlots();
    renderRelatedTools();
  });
})();
