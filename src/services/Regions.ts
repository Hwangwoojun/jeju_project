type Callback = (data: any) => void;

const API_KEY = import.meta.env.VITE_VWORLD_API_KEY;

// JSONP 호출 함수
function loadJSONP(url: string, callback: Callback) {
    const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;

    (window as any)[callbackName] = function (data: any) {
        callback(data);
        delete (window as any)[callbackName];
        document.body.removeChild(script);
    };

    const script = document.createElement("script");
    script.src = `${url}&callback=${callbackName}`;
    script.type = "text/javascript";
    document.body.appendChild(script);
}

// 시/도 리스트
export function getSidoList(callback: Callback) {
    const data = [
        { code: "11", name: "서울특별시" },
        { code: "26", name: "부산광역시" }
    ];
    callback(data);
}

// 시군구 리스트 (시도명 기반 조회)
export function getSigunguList(sidoName: string, callback: Callback) {
    const url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_ADSIGG_INFO&format=json&type=jsonp&key=${API_KEY}&attrFilter=full_nm:like:${encodeURIComponent(sidoName)}`;
    loadJSONP(url, callback);
}

// 읍면동 리스트 (시군구 코드 기반)
export function getEmdList(sigunguCode: string, callback: Callback) {
    const url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&format=json&type=jsonp&key=${API_KEY}&attrFilter=sig_cd:=:${sigunguCode}`;
    loadJSONP(url, callback);
}

// 지번 주소 검색
export function searchParcelAddress(
    query: string,
    page: number,
    size: number,
    callback: Callback
) {
    const url = `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:900913&type=address&category=parcel&format=json&errorformat=json&page=${page}&size=${size}&query=${encodeURIComponent(query)}&key=${API_KEY}`;
    loadJSONP(url, callback);
}
