import axios from "axios";

const VWORLD_API_KEY = import.meta.env.VITE_VWORLD_API_KEY;

const VWORLD_SEARCH_URL = "https://api.vworld.kr/req/search";

/**
 * 합치 검색 (PLACE)
 * @param keyword 검색 키워드 (ex: 서울)
 * @param page 페이지 번호 (default: 1)
 * @param size 페이지 당 결과 수 (default: 5)
 */

export const searchPlace = (
    keyword: string,
    page: number = 1,
    size: number = 5
): Promise<any []> => {
    const params: Record<string, string> = {
        service: "search",
        request: "search",
        version: "2.0",
        format: "json",
        key: VWORLD_API_KEY,
        query: keyword,
        type: "PLACE",
        page: String(page),
        size: String(size),
    };

    return axios.get(VWORLD_SEARCH_URL, {params})
        .then((res) => res.data?.response?.result?.item ?? [])
        .catch((error) => {
            console.error("[Vworld]장소 검색 실패 :", error);
            return [];
        });
};

/**
 * 지방주소 검색  (ADDRESS)
 * @param keyword 검색 키워드
 * @param category 보호 목적 ("road": 로명지방, "parcel": 지방주소)
 * @param page 페이지 번호
 * @param size 검색 결과 수
 */

export const searchAddress = (
    keyword: string,
    category: "road" | "parcel",
    page: number = 1,
    size: number = 5
): Promise<any []> => {
    const params: Record<string, string> = {
        service: "search",
        request: "search",
        version: "2.0",
        format: "json",
        key: VWORLD_API_KEY,
        query: keyword,
        type: "ADDRESS",
        category,
        page: String(page),
        size: String(size),
    };

    return axios.get(VWORLD_SEARCH_URL, {params})
        .then((res) => res.data?.response?.result?.items ?? [])
        .catch((error) => {
            console.error("[Vworld] 주소 검색 실패 : ", error);
            return [];
        });
};

export const searchCombinedStep = (
    keyword: string,
    page: number = 1,
    size: number = 5
): Promise<any []> => {
    return searchPlace(keyword, page, size);
};

