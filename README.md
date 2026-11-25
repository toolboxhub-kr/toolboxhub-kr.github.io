# ⚡ ToolBox Hub — 서버비 0원 수익형 웹 툴 포털 (Programmatic SEO)

100% 클라이언트 사이드(HTML5 / Modern CSS / Vanilla JS)로 동작하여 **GitHub Pages** 또는 **Cloudflare Pages**에서 서버 유지비 0원으로 운영할 수 있는 수익형 웹 툴 & 계산기 포털입니다.

## 📁 프로젝트 구조

```text
auto-web-tools/
├── index.html                    # 메인 포털 (실시간 검색 & 카테고리 필터, 자동 갱신)
├── about.html / privacy.html / contact.html  # 애드센스 승인용 필수 정책 페이지
├── build_seo.py                  # Programmatic SEO 자동화 빌드 스크립트
├── sitemap.xml / robots.txt      # build_seo.py로 자동 생성
├── assets/
│   ├── css/style.css             # 모던 반응형 디자인 시스템 + 다크모드
│   └── js/
│       ├── ads-config.js         # 구글 애드센스 & 쿠팡 파트너스 중앙 설정 파일
│       ├── common.js             # 공통 헤더/푸터/광고 슬롯/관련 도구 자동 주입
│       ├── qr-engine.js          # 외부 의존성 없는 순수 JS QR코드 생성 엔진
│       └── tools-registry.js     # build_seo.py가 자동 생성하는 도구 인덱스
└── tools/                        # 독립 웹 툴 페이지 10종 (무한 확장 가능)
```

## 🚀 새로운 웹 툴을 무한히 추가하는 방법

1. `tools/` 폴더에 새 HTML 파일(예: `tools/bmi-calculator.html`)을 추가하고 `<head>`에 아래 메타 태그를 넣습니다:
   ```html
   <meta name="tool:title" content="BMI 비만도 계산기" />
   <meta name="tool:category" content="생활·유틸" />
   <meta name="tool:category_slug" content="utility" />
   <meta name="tool:icon" content="⚖️" />
   <meta name="tool:summary" content="키와 몸무게로 체질량지수(BMI)를 즉시 계산합니다." />
   <meta name="tool:keywords" content="BMI,비만도,체질량지수,건강" />
   <meta name="tool:order" content="11" />
   ```
2. 터미널에서 자동화 스크립트를 실행합니다:
   ```bash
   python build_seo.py --base-url https://본인도메인.com
   ```
3. `sitemap.xml`, `robots.txt`, `assets/js/tools-registry.js`, 그리고 `index.html`의 카드 목록과 검색 데이터가 자동으로 업데이트됩니다!

## 💰 구글 애드센스 & 쿠팡 파트너스 연결 방법

`assets/js/ads-config.js` 파일 하나만 수정하면 전체 페이지의 상단(`top`), 중간(`middle`), 하단(`bottom`) 광고 슬롯에 일괄 적용됩니다.

```js
window.AD_CONFIG = {
  showPlaceholder: false,
  adsense: {
    enabled: true,
    client: "ca-pub-여기에본인게시자ID",
    slots: { top: "슬롯1", middle: "슬롯2", bottom: "슬롯3" },
  },
};
```

## 🌐 무료 호스팅 배포 (서버비 0원)

- **Cloudflare Pages (추천 — 무제한 대역폭 & 초고속 CDN):** GitHub 저장소 연결 후 Build command 비움, Build output directory `/` 설정 → 즉시 배포 완료.
- **GitHub Pages:** 저장소 `Settings → Pages → Branch: main / (root)` 저장 → `https://<username>.github.io/<repo>/` 로 무료 운영.
