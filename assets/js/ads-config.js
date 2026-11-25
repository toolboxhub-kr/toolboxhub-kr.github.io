/**
 * ============================================================================
 * 중앙 집중식 광고 및 수익화 설정 파일 (AdSense & 쿠팡 파트너스)
 * ============================================================================
 * 이 파일 하나만 수정하면 사이트 전체 페이지의 상단/중간/하단 광고 슬롯에
 * 일괄 반영됩니다.
 *
 * [구글 애드센스 적용 방법]
 * 1. adsense.enabled 를 true 로 변경
 * 2. adsense.client 에 본인의 게시자 ID (ca-pub-XXXXXXXXXXXXXXXX) 입력
 * 3. slots.top / middle / bottom 에 애드센스에서 발급받은 data-ad-slot 번호 입력
 *
 * [쿠팡 파트너스 적용 방법]
 * 1. coupang.enabled 를 true 로 변경
 * 2. coupang.slots 에 원하는 위치(top, middle, bottom)의 파트너스 배너 HTML 입력
 */

window.AD_CONFIG = {
  // 개발/미리보기용 플레이스홀더 표시 여부 (실제 광고 적용 시 false로 변경 권장)
  showPlaceholder: true,

  // 구글 애드센스 설정
  adsense: {
    enabled: false,
    client: "ca-pub-XXXXXXXXXXXXXXXX",
    slots: {
      top: "1111111111",
      middle: "2222222222",
      bottom: "3333333333",
    },
  },

  // 쿠팡 파트너스 설정 (애드센스가 비활성화되었거나 특정 슬롯에 쿠팡 배너를 넣고 싶을 때)
  coupang: {
    enabled: false,
    disclosure: "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.",
    slots: {
      top: "",
      middle: "",
      bottom: "",
    },
  },
};
