/**
 * ToolBox Hub - Common UI, Theme, Ad Slot Injector, Related Tools & Utilities
 */
(function () {
  "use strict";

  const isSubPage = window.location.pathname.includes("/tools/");
  const ROOT = isSubPage ? ".." : ".";

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

  // 2. Shared Header & Footer Injection
  function renderHeader() {
    const target = document.getElementById("site-header");
    if (!target) return;
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    target.className = "site-header";
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
          <a href="${ROOT}/about.html" class="nav-link">소개</a>
          <button id="theme-toggle-btn" class="theme-toggle" type="button" title="다크모드 전환" aria-label="다크모드 전환">
            ${theme === "dark" ? "☀️" : "🌙"}
          </button>
        </nav>
      </div>
    `;
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  function renderFooter() {
    const target = document.getElementById("site-footer");
    if (!target) return;
    const year = new Date().getFullYear();
    target.className = "site-footer";
    target.innerHTML = `
      <div class="container footer-inner">
        <div>
          <strong>ToolBox Hub</strong> &copy; ${year}. 모든 계산은 사용자 브라우저에서 안전하게 처리되며 서버로 데이터를 전송하지 않습니다.
        </div>
        <div class="footer-links">
          <a href="${ROOT}/about.html">사이트 소개</a>
          <a href="${ROOT}/privacy.html">개인정보처리방침</a>
          <a href="${ROOT}/contact.html">문의하기</a>
          <a href="${ROOT}/sitemap.xml">사이트맵</a>
        </div>
      </div>
    `;
  }

  // 3. Modular Ad Slot Renderer (AdSense + Coupang Partners)
  function renderAdSlots() {
    const cfg = window.AD_CONFIG || {};
    const slots = document.querySelectorAll("[data-ad-slot]");
    if (!slots.length) return;

    // Load AdSense script once if enabled
    if (cfg.adsense && cfg.adsense.enabled && cfg.adsense.client && !document.getElementById("adsense-script")) {
      const script = document.createElement("script");
      script.id = "adsense-script";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cfg.adsense.client)}`;
      document.head.appendChild(script);
    }

    const labels = {
      top: "상단 배너 광고 영역 (AdSense / 쿠팡 파트너스)",
      middle: "본문 중간 인아티클 광고 영역 (AdSense / 쿠팡 파트너스)",
      bottom: "하단 멀티플렉스 광고 영역 (AdSense / 쿠팡 파트너스)",
    };

    slots.forEach((el) => {
      const pos = el.getAttribute("data-ad-slot") || "middle";
      el.classList.add("ad-slot");

      // Priority 1: Coupang Partners slot if enabled & provided
      if (cfg.coupang && cfg.coupang.enabled && cfg.coupang.slots && cfg.coupang.slots[pos]) {
        el.innerHTML = `
          <div class="coupang-banner">
            ${cfg.coupang.slots[pos]}
            <div class="coupang-disclosure">${cfg.coupang.disclosure || ""}</div>
          </div>
        `;
        return;
      }

      // Priority 2: Google AdSense if enabled
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
        } catch (e) {
          // AdSense not yet initialized
        }
        return;
      }

      // Priority 3: Dev placeholder
      if (cfg.showPlaceholder !== false) {
        el.innerHTML = `
          <div class="ad-placeholder">
            <strong>AD SLOT · ${pos.toUpperCase()}</strong>
            <span>${labels[pos] || "광고 영역"} — <code>assets/js/ads-config.js</code>에서 일괄 설정 가능</span>
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
    if (!container || !Array.isArray(window.TOOLS_REGISTRY)) return;
    const currentFile = window.location.pathname.split("/").pop();
    const others = window.TOOLS_REGISTRY.filter((t) => !t.url.endsWith(currentFile)).slice(0, 4);
    if (!others.length) return;

    container.innerHTML = `
      <section class="related-section" aria-label="관련 도구">
        <h2>함께 많이 쓰는 무료 도구</h2>
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
      return n.toLocaleString("ko-KR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    },
    fmtWon(n) {
      return `${window.TBH.fmtNum(Math.round(n))}원`;
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => window.TBH.toast("클립보드에 복사되었습니다."));
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        window.TBH.toast("클립보드에 복사되었습니다.");
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
