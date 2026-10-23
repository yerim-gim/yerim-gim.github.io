// ──────────────────────────────────────────────
//  노션에서 글(Writing)을 가져오는 코드
//  - API 토큰은 코드에 직접 안 적고, .env 파일에서 읽어와요 (비밀 유지)
//  - 데이터베이스 ID 는 아래에 적혀 있어요 (비밀 아님)
// ──────────────────────────────────────────────

import { Client } from "@notionhq/client";

const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });

// 노션 데이터베이스 / 페이지 ID 들
const WRITING_DB = "3fcf9f05ce11805fa73bd8562947bf22";
const PUBLICATIONS_DB = "3fcf9f05ce1180598745fd05683f7ef3";
const CV_DB = "3fcf9f05ce1180acafe4d3592d142bf4";
const SETTINGS_PAGE = "3fcf9f05ce1180d4a302e3e06100a978";

// 노션 속성에서 값을 꺼내는 작은 도우미들
function plainText(prop) {
  if (!prop) return "";
  const arr = prop.title || prop.rich_text || [];
  return arr.map((t) => t.plain_text).join("");
}
function selectName(prop) {
  return prop?.select?.name || "";
}
function checkbox(prop) {
  return prop?.checkbox || false;
}
// 날짜 칸에서 ISO 날짜(2026-10-17)를 꺼내기 — 정렬용
function dateRaw(prop) {
  return prop?.date?.start || "";
}
// "2026-10-17" → "Oct 2026" 로 바꾸기 — 화면 표시용
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[d.getMonth()] + " " + d.getFullYear();
}
function urlValue(prop) {
  return prop?.url || "";
}
function numberValue(prop) {
  return typeof prop?.number === "number" ? prop.number : 9999;
}

// 토큰이 있는지 검사 (없으면 빈 걸로 처리)
function hasToken() {
  if (!import.meta.env.NOTION_TOKEN) {
    console.warn("⚠️  NOTION_TOKEN 이 없어요. .env 파일을 확인하세요.");
    return false;
  }
  return true;
}

// 아무 데이터베이스나 받아서 모든 행(페이지)을 가져오는 공통 함수
async function queryDatabase(databaseId, filter) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = db.data_sources?.[0]?.id;
  if (!dataSourceId) throw new Error("데이터 소스를 찾을 수 없어요: " + databaseId);

  const pages = [];
  let cursor = undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      ...(filter ? { filter } : {}),
    });
    for (const page of res.results) pages.push(page);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

const PUBLISHED_FILTER = { property: "Published", checkbox: { equals: true } };

// 한 글의 본문(블록들)을 "순수 텍스트" 문단 배열로 가져오기 (Settings 용)
async function getBody(pageId) {
  const paras = [];
  let cursor = undefined;
  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    for (const block of res.results) {
      if (block.type === "paragraph") {
        const text = block.paragraph.rich_text.map((t) => t.plain_text).join("");
        if (text.trim()) paras.push(text);
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return paras.length ? paras : ["(본문이 비어 있어요.)"];
}

// HTML 특수문자 안전 처리
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 노션 색 이름 → CSS 색. 글자색과 배경색(_background) 둘 다 지원.
const NOTION_COLORS = {
  gray: "#9b9b9b", brown: "#a3705a", orange: "#d9730d", yellow: "#cb912f",
  green: "#2f9e44", blue: "#2563c9", purple: "#9065c0", pink: "#c14c8a", red: "#e03e3e",
};
const NOTION_BG = {
  gray_background: "#ebeced", brown_background: "#e9e5e3", orange_background: "#faebdd",
  yellow_background: "#fbf3db", green_background: "#ddedea", blue_background: "#ddebf1",
  purple_background: "#eae4f2", pink_background: "#f4dfeb", red_background: "#fbe4e4",
};

// 노션 rich_text 하나를 HTML로 (볼드/기울임/밑줄/취소선/코드/색/링크)
function richToHtml(rt) {
  let html = esc(rt.plain_text);
  const a = rt.annotations || {};
  if (a.code) html = `<code>${html}</code>`;
  if (a.bold) html = `<strong>${html}</strong>`;
  if (a.italic) html = `<em>${html}</em>`;
  if (a.underline) html = `<u>${html}</u>`;
  if (a.strikethrough) html = `<s>${html}</s>`;
  // 색
  if (a.color && a.color !== "default") {
    if (a.color.endsWith("_background")) {
      const bg = NOTION_BG[a.color];
      if (bg) html = `<span style="background:${bg};padding:0 .15em;border-radius:3px">${html}</span>`;
    } else {
      const c = NOTION_COLORS[a.color];
      if (c) html = `<span style="color:${c}">${html}</span>`;
    }
  }
  // 링크
  if (rt.href) html = `<a href="${rt.href}" target="_blank" rel="noopener">${html}</a>`;
  return html;
}

function richArr(arr) {
  return (arr || []).map(richToHtml).join("");
}

// 한 글의 본문을 "서식이 살아있는 HTML 블록" 배열로 가져오기 (글 읽기용)
async function getRichBody(pageId) {
  const out = [];
  let cursor = undefined;
  // 목록 항목을 모았다가 묶기 위한 임시 버퍼
  let listBuf = null; // {tag:'ul'|'ol', items:[]}
  const flushList = () => {
    if (listBuf) {
      out.push(`<${listBuf.tag}>${listBuf.items.map((i) => `<li>${i}</li>`).join("")}</${listBuf.tag}>`);
      listBuf = null;
    }
  };
  do {
    const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor });
    for (const b of res.results) {
      const t = b.type;
      if (t === "bulleted_list_item" || t === "numbered_list_item") {
        const tag = t === "bulleted_list_item" ? "ul" : "ol";
        if (!listBuf || listBuf.tag !== tag) { flushList(); listBuf = { tag, items: [] }; }
        listBuf.items.push(richArr(b[t].rich_text));
        continue;
      }
      flushList();
      if (t === "paragraph") {
        const h = richArr(b.paragraph.rich_text);
        if (h.trim()) out.push(`<p>${h}</p>`);
      } else if (t === "heading_1") {
        out.push(`<h2>${richArr(b.heading_1.rich_text)}</h2>`);
      } else if (t === "heading_2") {
        out.push(`<h3>${richArr(b.heading_2.rich_text)}</h3>`);
      } else if (t === "heading_3") {
        out.push(`<h4>${richArr(b.heading_3.rich_text)}</h4>`);
      } else if (t === "quote") {
        out.push(`<blockquote>${richArr(b.quote.rich_text)}</blockquote>`);
      } else if (t === "divider") {
        out.push(`<hr />`);
      } else if (t === "code") {
        out.push(`<pre><code>${esc(b.code.rich_text.map((x) => x.plain_text).join(""))}</code></pre>`);
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  flushList();
  return out.length ? out : ["<p>(본문이 비어 있어요.)</p>"];
}

function titleOf(p) {
  return plainText(p["이름"] || p.Name || p.Title) || "(제목 없음)";
}

// ── Writing (글) ──
export async function getWritings() {
  if (!hasToken()) return [];
  const pages = await queryDatabase(WRITING_DB, PUBLISHED_FILTER);
  const writings = [];
  for (const page of pages) {
    const p = page.properties;
    const iso = dateRaw(p.PubDate);
    writings.push({
      slug: plainText(p.Slug) || page.id.replace(/-/g, ""),
      category: selectName(p.Category) || "essay",
      date: formatDate(iso),
      _sort: iso,
      title: titleOf(p),
      venue: plainText(p.Venue) || "",
      body: await getRichBody(page.id),   // 서식 살아있는 HTML 블록 배열
      bodyIsHtml: true,
    });
  }
  writings.sort((a, b) => (b._sort || "").localeCompare(a._sort || ""));
  return writings;
}

// ── Publications (출판물) ──
export async function getPublications() {
  if (!hasToken()) return [];
  const pages = await queryDatabase(PUBLICATIONS_DB, PUBLISHED_FILTER);
  const pubs = pages.map((page) => {
    const p = page.properties;
    const iso = dateRaw(p.PubDate);
    return {
      year: iso ? new Date(iso).getFullYear().toString() : "",
      _sort: iso,
      kind: selectName(p.Kind) || "",
      title: titleOf(p),
      where: plainText(p.Where) || "",
      link: urlValue(p.Link) || "",
    };
  });
  pubs.sort((a, b) => (b._sort || "").localeCompare(a._sort || ""));
  return pubs;
}

// ── CV (이력) ──
export async function getCV() {
  if (!hasToken()) return [];
  const pages = await queryDatabase(CV_DB, PUBLISHED_FILTER);
  const items = pages.map((page) => {
    const p = page.properties;
    return {
      section: selectName(p.Section) || "Etc",
      order: numberValue(p.Order),
      year: plainText(p.Year) || "",
      what: titleOf(p),
      sub: plainText(p.Sub) || "",
    };
  });
  // Order 숫자 오름차순 정렬
  items.sort((a, b) => a.order - b.order);
  // 섹션별로 묶기 (처음 나온 순서 유지)
  const blocks = [];
  for (const it of items) {
    let block = blocks.find((b) => b.heading === it.section);
    if (!block) {
      block = { heading: it.section, items: [] };
      blocks.push(block);
    }
    block.items.push({ year: it.year, what: it.what, sub: it.sub });
  }
  return blocks;
}

// ── Settings (About·히어로·이메일) ──
// Settings 페이지의 각 줄 "항목 이름: 내용" 을 읽어서 객체로 만들기
export async function getSettings() {
  if (!hasToken()) return null;
  const blocks = await getBody(SETTINGS_PAGE); // 문단 배열(여러 줄이 뭉쳐 있을 수 있음)
  // 각 문단을 줄바꿈(\n)으로 다시 쪼개서 진짜 "한 줄씩"으로 만들기
  const lines = blocks.flatMap((b) => b.split("\n")).map((s) => s.trim()).filter(Boolean);
  const map = {};
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    map[key] = val;
  }
  // map 을 사이트가 쓰는 about 형식으로 변환
  return {
    hello: map["Hero Hello"] || "",
    title_line1: map["Hero Title 1"] || "",
    title_line2: map["Hero Title 2"] || "",
    tagline: map["Tagline"] || "",
    paragraphs: [map["About 1"], map["About 2"], map["About 3"]].filter(Boolean),
    focus: (map["Focus"] || "").split(",").map((s) => s.trim()).filter(Boolean),
    email1: map["Email 1"] || "",
    email2: map["Email 2"] || "",
  };
}
