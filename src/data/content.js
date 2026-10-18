// ──────────────────────────────────────────────
//  사이트 내용 데이터
//  지금은 여기에 직접 적어두고, 다음 단계(노션 연동)에서
//  이 파일의 내용을 노션에서 자동으로 가져오도록 바꿀 거예요.
//  그래서 내용과 디자인이 분리돼 있어요.
// ──────────────────────────────────────────────

// ── 소개 ──
export const about = {
  hello: "music × technology — seoul · gothenburg",
  title_line1: "Where EEG signals",
  title_line2: "become music.",
  tagline:
    "Yerim Gim (김예림) is a musicologist working on neurofeedback music, brain–computer music interfaces, and — looking ahead — AI music. A researcher who reads scores and listens to data.",
  paragraphs: [
    "My research aims to bridge music with psychological and neuroscientific materials, focusing on music that incorporates emerging technologies across the 20th and 21st centuries.",
    "I currently work on neurofeedback music and brain–computer music interfaces (BCMI), exploring how composers and artists turn brainwave data into sound. Looking ahead, I want to expand into AI music — bridging BCMI and AI to better understand how technology shapes modern classical music.",
    "I am a doctoral researcher in Musicology at Seoul National University, and in 2026 a visiting PhD student at the University of Gothenburg / Chalmers and Uppsala University through the SKERIC Long-Term Mobility Fellowship.",
  ],
  focus: [
    "Neurofeedback Music",
    "Brain–Computer Music Interfaces",
    "AI & Music",
    "Music Aesthetics",
    "Electronic Music",
  ],
};

// ── 출판물 (유형: Book chapter / Review / Translation / Thesis / Criticism) ──
// link 가 비어 있으면("") 흐린 "Link ↗" 로 나오고, 주소를 넣으면 활성화돼요.
export const publications = [
  {
    year: "2025",
    kind: "Book chapter",
    title: "Electronic Voice in Eduardo Miranda's <em>Lampedusa</em>",
    where: "in <em>Aesthetics in Opera Works</em>",
    link: "",
  },
  {
    year: "2024",
    kind: "Book chapter",
    title: "Environment and Nature",
    where: "in <em>Korean Contemporary Music — Between Critique and Interpretation 007</em>, Seoul: Monopoly",
    link: "",
  },
  {
    year: "2024",
    kind: "Review",
    title: "Beyond Music and Technology: Preparing for New Dimensions",
    where: "<em>Journal of Music and Theory</em> 43",
    link: "",
  },
  {
    year: "2024",
    kind: "Translation",
    title: "(Superman or Frankenstein?) Music and Technology in the AI Era",
    where: "translations incl. “Development of Brain–Computer Music Interfacing Systems”",
    link: "",
  },
  {
    year: "2023",
    kind: "Review",
    title: "Create Imagination with Senses: SICMF 2023",
    where: "<em>Emile</em> 21",
    link: "",
  },
  {
    year: "2023",
    kind: "Thesis",
    title: "Study on Neurofeedback Music by Alvin Lucier and David Rosenboom",
    where: "M.A. thesis, Seoul National University",
    link: "",
  },
];

// ── 글 (Writing) ──
// category: "paper"(페이퍼/비평문) 또는 "essay"(에세이)
// 최신 글이 위로 오게, 배열 앞쪽에 추가하세요.
// body 는 문단 배열. 한국어 글이면 영어 병기를 문단으로 넣어도 돼요.
export const writings = [
  {
    slug: "gothenburg-organ",
    category: "essay",
    date: "연재",
    title: "예테보리, 그리고 오르간",
    venue: "공연·여행 음악 감상",
    body: ["여기에 글을 쓰세요."],
  },
  {
    slug: "homesick",
    category: "essay",
    date: "연재",
    title: "2. 고향이 그리울 때",
    venue: "상황별 음악 듣기",
    body: ["여기에 글을 쓰세요."],
  },
  {
    slug: "love-story",
    category: "essay",
    date: "연재",
    title: "1. 사랑 이야기",
    venue: "상황별 음악 듣기",
    body: ["여기에 글을 쓰세요."],
  },
  {
    slug: "beyond-music-technology",
    category: "paper",
    date: "2024",
    title: "음악과 기술을 넘어서: 새로운 차원을 준비하며",
    venue: "학회 리뷰 · Journal of Music and Theory 43",
    body: ["여기에 글을 쓰세요."],
  },
  {
    slug: "sicmf-2023",
    category: "paper",
    date: "2023",
    title: "감각으로 상상력을 만들다: 서울국제컴퓨터음악제 2023",
    venue: "페스티벌 리뷰 · Emile 21",
    body: ["여기에 글을 쓰세요."],
  },
];

// ── CV ──
export const cv = [
  {
    heading: "Education",
    items: [
      { year: "2023–now", what: "Doctor of Music in Musicology, Seoul National University" },
      { year: "2021–2023", what: "Master of Music in Musicology, Seoul National University", sub: "Thesis: Study on Neurofeedback Music by Alvin Lucier and David Rosenboom" },
      { year: "2016–2021", what: "Bachelor of Music in Music Theory, Seoul National University (cum laude), Minor in Psychology" },
      { year: "2013–2015", what: "Piano Performance, Deokwon High School" },
    ],
  },
];

export const cvPdf = "CV_Yerim_Gim.pdf"; // 저장소에 올린 PDF 파일명

// ── 푸터 ──
export const contact = {
  email1: "yrg7920@snu.ac.kr",
  email2: "yrg7920@gmail.com",
};
