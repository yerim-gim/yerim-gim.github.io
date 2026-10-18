// ──────────────────────────────────────────────
//  사이트가 쓸 "최종 내용"을 만드는 곳
//  - 노션에 내용이 있으면 노션 걸 씀
//  - 노션이 연결 안 됐거나 비었으면, data/content.js 의 예시를 대신 보여줘서
//    사이트가 안 비게 함
// ──────────────────────────────────────────────

import {
  about as sampleAbout,
  publications as samplePublications,
  writings as sampleWritings,
  cv as sampleCV,
  contact as sampleContact,
} from "../data/content.js";

import {
  getWritings,
  getPublications,
  getCV,
  getSettings,
} from "./notion.js";

export async function getAllWritings() {
  try {
    const n = await getWritings();
    if (n.length) return n;
  } catch (e) {
    console.warn("⚠️  Writing 못 가져옴, 예시 사용:", e.message);
  }
  return sampleWritings;
}

export async function getAllPublications() {
  try {
    const n = await getPublications();
    if (n.length) return n;
  } catch (e) {
    console.warn("⚠️  Publications 못 가져옴, 예시 사용:", e.message);
  }
  return samplePublications;
}

export async function getAllCV() {
  try {
    const n = await getCV();
    if (n.length) return n;
  } catch (e) {
    console.warn("⚠️  CV 못 가져옴, 예시 사용:", e.message);
  }
  return sampleCV;
}

// About(소개·히어로) 와 연락처(이메일)
export async function getAllAbout() {
  try {
    const s = await getSettings();
    if (s && s.title_line1) {
      return {
        about: {
          hello: s.hello,
          title_line1: s.title_line1,
          title_line2: s.title_line2,
          tagline: s.tagline,
          paragraphs: s.paragraphs.length ? s.paragraphs : sampleAbout.paragraphs,
          focus: s.focus.length ? s.focus : sampleAbout.focus,
        },
        contact: {
          email1: s.email1 || sampleContact.email1,
          email2: s.email2 || sampleContact.email2,
        },
      };
    }
  } catch (e) {
    console.warn("⚠️  Settings 못 가져옴, 예시 사용:", e.message);
  }
  return { about: sampleAbout, contact: sampleContact };
}
