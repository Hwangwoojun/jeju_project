// 데이터 콜백 타입 정의
type Callback = (data: any) => void;

// const API_KEY = import.meta.env.VITE_VWORLD_API_KEY;
// const DOMAIN = import.meta.env.VITE_DOMAIN;

/**
 * JSONP 방식으로 데이터를 요청하는 함수
 * @param url - 요청할 API URL
 * @param callback - 응답 데이터를 처리할 콜백 함수
 */
function loadJSONP(url: string, callback: Callback) {
    const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
    const script = document.createElement("script");

    // 전역 콜백 함수 등록
    (window as any)[callbackName] = function (data: any) {
        callback(data); // 응답 처리
        delete (window as any)[callbackName];
        document.body.removeChild(script);
    };

    // JSONP URL 구성 (callback 파라미터 포함)
    script.src = `${url}&callback=${callbackName}`;
    script.type = "text/javascript";

    console.log("[JSONP 요청 URL]", script.src);
    document.body.appendChild(script); // 요청 실행
}

export const sidoNames = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
    "대전광역시", "울산광역시", "세종특별자치시", "경기도", "충청북도",
    "충청남도", "전라북도", "전라남도", "경상북도", "경상남도",
    "제주특별자치도", "강원특별자치도"
];

export function fetchSidoItem(name: string, callback: Callback) {
    const url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_ADSIDO_INFO&format=json&type=jsonp&key=994AECF2-9724-327A-A054-AF9534CAE30B&domain=localhost:8084&attrFilter=ctp_kor_nm:like:${encodeURIComponent(name)}`;
    loadJSONP(url, callback);
}

/**
 * 시군구 리스트 요청 함수 (시/도명 기반)
 * @param sidoName - 예: '서울특별시'
 */
export function getSigunguList(sidoName: string, callback: Callback) {
    const url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_ADSIGG_INFO&format=json&type=jsonp&key=994AECF2-9724-327A-A054-AF9534CAE30B&domain=localhost:8084&paging=Y&page=1&size=100&attrFilter=full_nm:like:${encodeURIComponent(sidoName)}`;
    loadJSONP(url, callback);
}

/**
 * 읍면동 리스트 요청 함수 (시도 + 시군구명 기반)
 * @param sido - 예: '서울특별시'
 * @param sigungu - 예: '광진구'
 */
export function getEmdList(sido: string, sigungu: string, callback: Callback) {

    const fullAddress = (sido === "세종특별자치시") ? sido : `${sido} ${sigungu}`;

    const url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&format=json&type=jsonp&key=994AECF2-9724-327A-A054-AF9534CAE30B&domain=localhost:8084&paging=Y&page=1&size=100&attrFilter=full_nm:like:${encodeURIComponent(fullAddress)}`;
    loadJSONP(url, callback);
}