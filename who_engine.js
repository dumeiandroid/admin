// ─────────────────────────────────────────────────────────────
// WHO ENGINE – Scoring, Render, Bio, API, UI Helpers
// Lidan Psikologi – Tes Kepemimpinan & Psikologi Lengkap
// ─────────────────────────────────────────────────────────────

const API_R = 'https://lidan-co-id.pages.dev/api/contacts_filter_dinamis7';
const TBL   = 'nilai1_json';
const AUTH  = 'admin';

let dataPDF = { bio:{}, tests:{}, idPeserta:'' };

// ═══════════════════════════════════════════════════════════════
// HELPERS UMUM
// ═══════════════════════════════════════════════════════════════

function parseJawaban(str) {
  return String(str||'').split(';').map(s=>s.trim()).filter(s=>s!=='');
}

function dominanKey(counts) {
  let maxK = null, maxV = -1;
  Object.entries(counts).forEach(([k,v]) => { if (v > maxV) { maxV=v; maxK=k; } });
  return maxK;
}

function toggleRaw(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

const CIRCLE_COLORS = {
  success: ['#16a34a','#f0fdf4'],
  warning: ['#b45309','#fffbeb'],
  danger:  ['#dc2626','#fef2f2'],
  info:    ['#0369a1','#f0f9ff'],
};

function renderScoreCircle(level, skor, max) {
  const [fc, bg] = CIRCLE_COLORS[level] || CIRCLE_COLORS.info;
  return `<div class="score-circle" style="background:${bg};color:${fc};">
    <span class="sc-num">${skor}</span>
    <span class="sc-max">/${max}</span>
  </div>`;
}

function renderKriteria(obj) {
  return `<div class="kriteria-box ${obj.level}">
    <div class="kriteria-label">Hasil</div>
    <div class="kriteria-title">${obj.icon} ${obj.title}</div>
    <div class="kriteria-desc">${obj.desc}</div>
  </div>`;
}

function renderJawGrid(arr, isAB) {
  return arr.map((v,i) => {
    const val = (v||'').toString().trim();
    let cls = '';
    if (isAB) cls = val.toLowerCase()==='a' ? 'jaw-a' : 'jaw-b';
    return `<div class="jaw-item ${cls}"><div class="jaw-num">${i+1}</div><div class="jaw-val">${val||'—'}</div></div>`;
  }).join('');
}

function renderDominanBadge(label) {
  return `<div class="gaya-dominant">🎯 Dominan: <strong>${label}</strong></div>`;
}

function renderBarChart(items, total) {
  // items: [{label, color, count, maxCount}]
  return items.map(t => {
    const pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
    return `<div class="gaya-row">
      <div class="gaya-label">${t.label}</div>
      <div class="gaya-bar-wrap"><div class="gaya-bar" style="width:${pct}%;background:${t.color}"></div></div>
      <div class="gaya-count" style="color:${t.color}">${t.count}/${total}</div>
    </div>`;
  }).join('');
}

function rawToggleBlock(id, arr, isAB) {
  return `<span class="raw-toggle" onclick="toggleRaw('${id}')">▾ Lihat jawaban mentah</span>
  <div class="raw-box" id="${id}">
    <div class="jaw-grid">${renderJawGrid(arr, isAB)}</div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// TES 1: GAYA BELAJAR (who_01) — 15 soal A/B/C
// ═══════════════════════════════════════════════════════════════
function skorWho01(arr) {
  const c = { a:0, b:0, c:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(c[k]!=null) c[k]++; });
  return c;
}

const WHO01_TYPES = {
  a: {
    label: 'Visual',
    icon: '👁️',
    color: '#2563eb',
    desc: 'Tipe visual cenderung menerima informasi paling efektif menggunakan indera penglihatan.',
    tips: ['Gunakan variasi warna dalam pencatatan dan beri garis bawah atau grafik.',
           'Pilih buku dengan gambar ilustrasi dan warna menarik.',
           'Perhatikan penerangan saat belajar dan hindari polusi visual.',
           'Saat mengingat sesuatu, bayangkan dan buat tulisan yang memudahkan.',
           'Catat kembali bahan pelajaran dengan warna dan gambar yang menarik.']
  },
  b: {
    label: 'Auditory',
    icon: '👂',
    color: '#7c3aed',
    desc: 'Tipe auditory cenderung menerima informasi paling efektif menggunakan indera pendengaran.',
    tips: ['Gunakan voice recorder atau perekam suara saat mendengarkan pelajaran.',
           'Perbanyak melakukan presentasi dan tanya jawab.',
           'Lagukan apa yang diingat dengan irama dan hindari polusi suara (kebisingan).',
           'Berpikir dan mengingat sambil mengucapkannya kembali.',
           'Dengarkan kembali pelajaran melalui rekaman atau penjelasan orang lain.']
  },
  c: {
    label: 'Kinestetik',
    icon: '🤸',
    color: '#16a34a',
    desc: 'Tipe kinestetik cenderung menerima informasi paling efektif dengan melibatkan gerakan tubuh dan aktivitas fisik.',
    tips: ['Gunakan gerakan dalam pelajaran, seperti aktivitas atau uji coba secara langsung.',
           'Perbanyak praktik yang berkaitan dengan pelajaran dan langsung bisa diaplikasikan.',
           'Hindari belajar yang monoton (terlalu banyak duduk).',
           'Saat mengingat sesuatu, lakukan hal yang diingat dengan aktivitas gerak.',
           'Menulis di udara, gunakan gerak imajinatif.']
  }
};

function renderWho01(arr) {
  const counts = skorWho01(arr);
  const dom = dominanKey(counts);
  const tipe = WHO01_TYPES[dom] || WHO01_TYPES.a;
  dataPDF.tests.who_01 = { jawaban: arr, counts, dominant: dom };

  const bars = Object.entries(WHO01_TYPES).map(([k,t]) => ({
    label: t.label, color: t.color, count: counts[k]
  }));
  const total = arr.length;

  return `
    ${renderDominanBadge(tipe.icon + ' ' + tipe.label)}
    <div class="gaya-grid">${renderBarChart(bars, total)}</div>
    <div class="kriteria-box info">
      <div class="kriteria-label">Deskripsi</div>
      <div class="kriteria-title">${tipe.icon} Tipe ${tipe.label}</div>
      <div class="kriteria-desc">${tipe.desc}</div>
    </div>
    <div class="tips-box">
      <div class="tips-title">💡 Strategi Belajar yang Cocok</div>
      <ol class="tips-list">${tipe.tips.map(t=>`<li>${t}</li>`).join('')}</ol>
    </div>
    ${rawToggleBlock('raw01', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 2: OTAK KIRI/KANAN (who_02) — 22 soal A/B
// ═══════════════════════════════════════════════════════════════
function renderWho02(arr) {
  const counts = { a:0, b:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(counts[k]!=null) counts[k]++; });
  const dom = counts.a >= counts.b ? 'a' : 'b';
  dataPDF.tests.who_02 = { jawaban: arr, counts, dominant: dom };

  const isKiri = dom === 'a';
  const info = isKiri ? {
    icon:'🧠', label:'Otak Kiri', color:'#2563eb',
    desc:'Belahan otak kiri berhubungan dengan logika, analisis, bahasa, rangkaian, dan matematika. Cara kerja otak kiri sangat rapi, terstruktur, dan sistematis. Orang yang dominan otak kiri biasanya berpikir teoritis, intelektual, logis, linier, dan rasional — seperti seorang peneliti atau ilmuwan.',
    level:'info'
  } : {
    icon:'🎨', label:'Otak Kanan', color:'#ef4444',
    desc:'Belahan otak kanan berkaitan dengan ritme, kreativitas, warna, imajinasi, dimensi, ide, gairah, keberanian, emosi, dan seni. Cara kerja otak kanan cenderung tidak terstruktur. Orang yang dominan otak kanan memiliki daya ingat lebih lama karena mampu memuat ingatan secara gambar (image) — seperti seorang seniman.',
    level:'warning'
  };

  const bars = [
    { label: 'Otak Kiri (A)', color: '#2563eb', count: counts.a },
    { label: 'Otak Kanan (B)', color: '#ef4444', count: counts.b },
  ];

  return `
    ${renderDominanBadge(info.icon + ' ' + info.label)}
    <div class="gaya-grid">${renderBarChart(bars, arr.length)}</div>
    <div class="kriteria-box ${info.level}">
      <div class="kriteria-label">Deskripsi</div>
      <div class="kriteria-title">${info.icon} Dominan ${info.label}</div>
      <div class="kriteria-desc">${info.desc}</div>
    </div>
    ${rawToggleBlock('raw02', arr, true)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 3: KECERDASAN MAJEMUK (who_03) — 80 soal, 8 kelompok x 10
// ═══════════════════════════════════════════════════════════════
const KECERDASAN = [
  { key:'linguistik',   label:'Linguistik',        icon:'📝', color:'#2563eb',
    desc:'Kemampuan menggunakan bahasa untuk mendeskripsikan kejadian, membangun kepercayaan, mengembangkan argumen logika dan retorika.',
    contoh:'Wartawan, penulis, pengacara, penyair, copywriter, tenaga penjual.' },
  { key:'logmat',       label:'Logika-Matematika',  icon:'🔢', color:'#7c3aed',
    desc:'Kemampuan menggunakan angka, menganalisis permasalahan secara logis, peka terhadap pola, serta mampu menelaah permasalahan secara ilmiah.',
    contoh:'Akuntan, ahli statistik, insinyur, penemu, programmer.' },
  { key:'musikal',      label:'Musikal',            icon:'🎵', color:'#db2777',
    desc:'Kemampuan mengerti dan mengembangkan teknik musikal, merespons terhadap musik, dan menciptakan pertunjukan ekspresif.',
    contoh:'Guru musik, pemain band, konduktor, DJ, pencipta lagu, penyanyi.' },
  { key:'spasial',      label:'Spasial',            icon:'🗺️', color:'#0891b2',
    desc:'Kemampuan mengenali pola ruang secara akurat, menginterpretasikan ide grafis dan spasial.',
    contoh:'Fotografer, dekorator ruang, perancang busana, arsitek, pembuat film.' },
  { key:'kinestetik',   label:'Kinestetik',         icon:'🤸', color:'#16a34a',
    desc:'Kemampuan menggunakan seluruh atau sebagian tubuh untuk melakukan sesuatu dan menciptakan bentuk ekspresi baru.',
    contoh:'Mekanik, pelatih, pengrajin, atlet, aktor, penari, koreografer.' },
  { key:'interpersonal',label:'Interpersonal',      icon:'🤝', color:'#ca8a04',
    desc:'Kemampuan mengorganisasikan orang lain, berempati, memahami intensi, hasrat, dan motivasi orang lain.',
    contoh:'Manajer, politisi, pekerja sosial, psikolog, guru, konsultan.' },
  { key:'intrapersonal', label:'Intrapersonal',     icon:'🪞', color:'#dc2626',
    desc:'Kemampuan menilai kekuatan dan kelemahan diri sendiri, memahami perasaan, intuisi, dan temperamen.',
    contoh:'Perencana, pemuka agama, ahli filosofi.' },
  { key:'naturalis',    label:'Naturalis',          icon:'🌿', color:'#059669',
    desc:'Kemampuan mengenali, mengelompokkan, dan menggambarkan berbagai keistimewaan yang ada di lingkungannya.',
    contoh:'Ahli biologi, ahli konservasi lingkungan.' },
];

function renderWho03(arr) {
  // 80 soal, kelompok 10 berurutan
  const scores = KECERDASAN.map((k, i) => {
    const slice = arr.slice(i*10, i*10+10);
    // nilai 1 jika jawaban 'a' (sesuai), 0 jika tidak
    const count = slice.filter(v => v.trim().toLowerCase() === 'a').length;
    return { ...k, count };
  });

  const dom = scores.reduce((a,b) => a.count >= b.count ? a : b);
  dataPDF.tests.who_03 = { jawaban: arr, scores, dominant: dom.key };

  const bars = scores.map(s => ({ label: s.label, color: s.color, count: s.count }));

  const dominanList = scores.filter(s => s.count >= 8);

  return `
    <div class="info-note">💡 Kecerdasan dominan jika skor 8–10 dalam satu kelompok</div>
    <div class="gaya-grid" style="margin-top:10px">${renderBarChart(bars, 10)}</div>
    ${dominanList.length > 0 ? dominanList.map(d => `
    <div class="kriteria-box success" style="margin-top:8px">
      <div class="kriteria-label">Kecerdasan Dominan (${d.count}/10)</div>
      <div class="kriteria-title">${d.icon} ${d.label}</div>
      <div class="kriteria-desc">${d.desc}<br><strong>Contoh karier:</strong> ${d.contoh}</div>
    </div>`).join('') : `
    <div class="kriteria-box warning" style="margin-top:8px">
      <div class="kriteria-label">Kecerdasan Tertinggi (${dom.count}/10)</div>
      <div class="kriteria-title">${dom.icon} ${dom.label}</div>
      <div class="kriteria-desc">${dom.desc}<br><strong>Contoh karier:</strong> ${dom.contoh}</div>
    </div>`}
    ${rawToggleBlock('raw03', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 4: TEMPERAMEN (who_04) — 28 soal A/B/C/D
// ═══════════════════════════════════════════════════════════════
const TEMPERAMEN = {
  a: { label:'Sanguinis',  icon:'😄', color:'#f59e0b', level:'warning',
    desc:'Orang sanguinis sangat bersemangat dalam hidup, selalu ceria, hangat, bersahabat, dan menikmati hidup. Cenderung mendasarkan perasaan daripada pemikiran saat mengambil keputusan. Sangat suka bicara dan dapat menularkan semangat kepada orang lain.' },
  b: { label:'Kolerik',    icon:'🔥', color:'#ef4444', level:'danger',
    desc:'Orang kolerik memiliki kemauan keras, aktif, praktis, cekatan, mandiri, dan sangat independen. Bersikap tegas dan berpendirian keras. Tidak mudah menyerah terhadap tekanan. Cenderung dominan dan memiliki jiwa kepemimpinan yang kuat.' },
  c: { label:'Melankolis', icon:'🎭', color:'#7c3aed', level:'info',
    desc:'Orang melankolis memiliki rasa seni tinggi, kemampuan analitis kuat, perfeksionis, sensitif, berbakat, dan rela berkorban. Cenderung introvert. Memiliki daya analitik hebat yang mampu memperhitungkan bahaya dan halangan secara akurat.' },
  d: { label:'Phlegmatis', icon:'🕊️', color:'#16a34a', level:'success',
    desc:'Orang phlegmatis adalah pendamai, mudah bergaul, ramah, dan menyenangkan. Konsisten, tenang, dan jarang terpengaruh lingkungan. Di balik pribadi yang tenang, mereka memiliki kemampuan merasakan emosi yang terkandung dalam sesuatu.' },
};

function renderWho04(arr) {
  const counts = { a:0, b:0, c:0, d:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(counts[k]!=null) counts[k]++; });
  const dom = dominanKey(counts);
  const tipe = TEMPERAMEN[dom];
  dataPDF.tests.who_04 = { jawaban: arr, counts, dominant: dom };

  const bars = Object.entries(TEMPERAMEN).map(([k,t]) => ({ label: t.label, color: t.color, count: counts[k] }));

  return `
    ${renderDominanBadge(tipe.icon + ' ' + tipe.label)}
    <div class="gaya-grid">${renderBarChart(bars, arr.length)}</div>
    <div class="kriteria-box ${tipe.level}">
      <div class="kriteria-label">Temperamen Dominan</div>
      <div class="kriteria-title">${tipe.icon} ${tipe.label}</div>
      <div class="kriteria-desc">${tipe.desc}</div>
    </div>
    ${rawToggleBlock('raw04', arr, true)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 5: EKSTROVERT/INTROVERT (who_05) — 17 soal A/B
// ═══════════════════════════════════════════════════════════════
function renderWho05(arr) {
  const counts = { a:0, b:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(counts[k]!=null) counts[k]++; });
  const dom = counts.a >= counts.b ? 'a' : 'b';
  dataPDF.tests.who_05 = { jawaban: arr, counts, dominant: dom };

  const isEkstro = dom === 'a';
  const info = isEkstro ? {
    icon:'🌟', label:'Ekstrovert', level:'warning', color:'#f59e0b',
    desc:'Orang ekstrovert lebih senang berada di tengah keramaian. Energinya terkumpul ketika berbicara dan berinteraksi dengan banyak orang. Jika sedang stres, cenderung memilih berinteraksi dengan banyak teman. Terampil dalam melakukan perjalanan ke dunia luar dan berinteraksi dengan banyak orang.'
  } : {
    icon:'📚', label:'Introvert', level:'info', color:'#2563eb',
    desc:'Orang introvert lebih senang menyendiri. Keramaian akan membuat tenaga mereka cepat hilang. Ketika stres, lebih suka menyendiri atau berbagi kepada satu atau dua orang yang dipercaya. Pembicaraan orang introvert biasanya lebih mendalam dan serius.'
  };

  const bars = [
    { label: 'Ekstrovert (A)', color: '#f59e0b', count: counts.a },
    { label: 'Introvert (B)',  color: '#2563eb', count: counts.b },
  ];

  return `
    ${renderDominanBadge(info.icon + ' ' + info.label)}
    <div class="gaya-grid">${renderBarChart(bars, arr.length)}</div>
    <div class="kriteria-box ${info.level}">
      <div class="kriteria-label">Tipe Kepribadian</div>
      <div class="kriteria-title">${info.icon} ${info.label}</div>
      <div class="kriteria-desc">${info.desc}</div>
    </div>
    ${rawToggleBlock('raw05', arr, true)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 6: SENSING/INTUITIF (who_06) — 14 soal A/B
// ═══════════════════════════════════════════════════════════════
function renderWho06(arr) {
  const counts = { a:0, b:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(counts[k]!=null) counts[k]++; });
  const dom = counts.a >= counts.b ? 'a' : 'b';
  dataPDF.tests.who_06 = { jawaban: arr, counts, dominant: dom };

  const info = dom === 'a' ? {
    icon:'👁️', label:'Sensing (S)', level:'success', 
    desc:'Kamu cenderung memproses data dengan bersandar pada fakta yang nyata dan melihat data apa adanya. Kamu akan percaya ketika melihat atau mengalami sesuatu secara langsung. Tanpa pengalaman langsung, kamu tidak akan langsung percaya.'
  } : {
    icon:'🔮', label:'Intuitif (N)', level:'info',
    desc:'Kamu cenderung memproses data dengan melihat pola dan impresi, serta berbagai kemungkinan yang bisa terjadi. Walaupun ada fakta, perasaan dan kesan lebih dominan untuk dijadikan bahan pertimbangan. Kamu lebih percaya pada feeling yang dirasakan dalam merespons sesuatu.'
  };

  const bars = [
    { label: 'Sensing (A)',  color: '#16a34a', count: counts.a },
    { label: 'Intuitif (B)', color: '#0369a1', count: counts.b },
  ];

  return `
    ${renderDominanBadge(info.icon + ' ' + info.label)}
    <div class="gaya-grid">${renderBarChart(bars, arr.length)}</div>
    <div class="kriteria-box ${info.level}">
      <div class="kriteria-label">Cara Memproses Informasi</div>
      <div class="kriteria-title">${info.icon} ${info.label}</div>
      <div class="kriteria-desc">${info.desc}</div>
    </div>
    ${rawToggleBlock('raw06', arr, true)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 7: THINKING/FEELING (who_07) — 20 soal A/B
// ═══════════════════════════════════════════════════════════════
function renderWho07(arr) {
  const counts = { a:0, b:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(counts[k]!=null) counts[k]++; });
  const dom = counts.a >= counts.b ? 'a' : 'b';
  dataPDF.tests.who_07 = { jawaban: arr, counts, dominant: dom };

  const info = dom === 'a' ? {
    icon:'🧠', label:'Thinking (T)', level:'info',
    desc:'Kamu adalah pribadi yang selalu menggunakan logika dan kekuatan analisis untuk mengambil sebuah keputusan. Keputusan didasarkan pada fakta dan penalaran yang objektif.'
  } : {
    icon:'❤️', label:'Feeling (F)', level:'warning',
    desc:'Kamu adalah pribadi yang sering melibatkan perasaan, empati, serta nilai-nilai yang diyakini ketika hendak mengambil keputusan. Kamu mempertimbangkan dampak keputusan terhadap orang lain.'
  };

  const bars = [
    { label: 'Thinking (A)', color: '#0369a1', count: counts.a },
    { label: 'Feeling (B)',  color: '#db2777', count: counts.b },
  ];

  return `
    ${renderDominanBadge(info.icon + ' ' + info.label)}
    <div class="gaya-grid">${renderBarChart(bars, arr.length)}</div>
    <div class="kriteria-box ${info.level}">
      <div class="kriteria-label">Cara Mengambil Keputusan</div>
      <div class="kriteria-title">${info.icon} ${info.label}</div>
      <div class="kriteria-desc">${info.desc}</div>
    </div>
    ${rawToggleBlock('raw07', arr, true)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 8: JUDGING/PERCEIVING (who_08) — 10 soal A/B
// ═══════════════════════════════════════════════════════════════
function renderWho08(arr) {
  const counts = { a:0, b:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(counts[k]!=null) counts[k]++; });
  const dom = counts.a >= counts.b ? 'a' : 'b';
  dataPDF.tests.who_08 = { jawaban: arr, counts, dominant: dom };

  const info = dom === 'a' ? {
    icon:'🔍', label:'Perceiving (P)', level:'warning',
    desc:'Kamu adalah pribadi yang bersikap fleksibel, adaptif, dan bertindak secara random untuk melihat beragam peluang yang muncul. Kamu memperhatikan dahulu apa yang terjadi, baru kemudian melakukan atau memutuskan tindakan selanjutnya.'
  } : {
    icon:'📋', label:'Judging (J)', level:'success',
    desc:'Kamu adalah pribadi yang selalu bertumpu pada rencana sistematis, serta berpikir dan bertindak secara prosedural. Kekuatan kamu adalah perencanaan. Kamu mampu merencanakan segala sesuatu secara matang terlebih dahulu sebelum proses berlangsung.'
  };

  const bars = [
    { label: 'Perceiving (A)', color: '#b45309', count: counts.a },
    { label: 'Judging (B)',    color: '#16a34a', count: counts.b },
  ];

  return `
    ${renderDominanBadge(info.icon + ' ' + info.label)}
    <div class="gaya-grid">${renderBarChart(bars, arr.length)}</div>
    <div class="kriteria-box ${info.level}">
      <div class="kriteria-label">Gaya Hidup</div>
      <div class="kriteria-title">${info.icon} ${info.label}</div>
      <div class="kriteria-desc">${info.desc}</div>
    </div>
    ${rawToggleBlock('raw08', arr, true)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 9: POLA ASUH (who_09) — 10 soal A/B/C
// ═══════════════════════════════════════════════════════════════
function renderWho09(arr) {
  const counts = { a:0, b:0, c:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(counts[k]!=null) counts[k]++; });
  const dom = dominanKey(counts);
  dataPDF.tests.who_09 = { jawaban: arr, counts, dominant: dom };

  const types = {
    a: { icon:'🤝', label:'Demokratis',  level:'success', color:'#16a34a',
      desc:'Pola asuh demokratis ditandai dengan adanya sikap terbuka antara orang tua dan anak. Membuat aturan yang disepakati bersama. Orang tua demokratis mencoba menghargai kemampuan anak secara langsung.' },
    b: { icon:'⚡', label:'Otoriter',    level:'danger',  color:'#ef4444',
      desc:'Pola asuh otoriter ditandai dengan aturan yang kaku, berupa pelarangan yang kadang tidak masuk akal dan sering mengorbankan otonomi anak. Dengan pola asuh otoriter, hubungan orang tua dan anak terlihat kaku.' },
    c: { icon:'🕊️', label:'Permisif',   level:'warning', color:'#f59e0b',
      desc:'Pola asuh permisif ditandai dengan kebebasan tanpa batas kepada anak untuk berbuat sesuai keinginannya. Orang tua cenderung bersikap mengalah, menuruti semua keinginan, dan melindungi secara berlebihan.' },
  };
  const tipe = types[dom];
  const bars = Object.entries(types).map(([k,t]) => ({ label: t.label, color: t.color, count: counts[k] }));

  return `
    ${renderDominanBadge(tipe.icon + ' ' + tipe.label)}
    <div class="gaya-grid">${renderBarChart(bars, arr.length)}</div>
    <div class="kriteria-box ${tipe.level}">
      <div class="kriteria-label">Pola Asuh Dominan</div>
      <div class="kriteria-title">${tipe.icon} ${tipe.label}</div>
      <div class="kriteria-desc">${tipe.desc}</div>
    </div>
    ${rawToggleBlock('raw09', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 12: TIPE CINTA (who_12) — 10 soal A/B/C/D
// ═══════════════════════════════════════════════════════════════
function renderWho12(arr) {
  const counts = { a:0, b:0, c:0, d:0 };
  arr.forEach(v => { const k = v.trim().toLowerCase(); if(counts[k]!=null) counts[k]++; });
  const dom = dominanKey(counts);
  dataPDF.tests.who_12 = { jawaban: arr, counts, dominant: dom };

  const types = {
    a: { icon:'💖', label:'Romantis',     level:'info',    color:'#db2777',
      desc:'Kamu termasuk orang yang sentimentil dan romantis. Suka membayangkan kisah cinta yang indah. Hidup bahagia penuh cinta bersama pasangan adalah idaman.' },
    b: { icon:'🏡', label:'Sederhana',    level:'success', color:'#16a34a',
      desc:'Kamu termasuk tipe orang rumahan yang lebih suka berada di dalam rumah ketimbang kegiatan outdoor. Tipe kamu manis, sederhana, dan dapat memberi kehidupan yang stabil, aman, dan nyaman.' },
    c: { icon:'🏔️', label:'Petualang',   level:'warning', color:'#f59e0b',
      desc:'Kamu senang menguji nyali dan melakukan hal-hal yang menyerempet bahaya. Tipe pasangan yang sesuai minimal harus mendukung kamu. Meski tampaknya mandiri, kamu tetap punya sifat mencintai.' },
    d: { icon:'💎', label:'Materialistis',level:'danger',  color:'#ef4444',
      desc:'Kamu menyenangi kemewahan dan kehidupan serba gemerlap. Kamu memerlukan orang yang bisa meningkatkan status dan rasa percaya diri.' },
  };
  const tipe = types[dom];
  const bars = Object.entries(types).map(([k,t]) => ({ label: t.label, color: t.color, count: counts[k] }));

  return `
    ${renderDominanBadge(tipe.icon + ' ' + tipe.label)}
    <div class="gaya-grid">${renderBarChart(bars, arr.length)}</div>
    <div class="kriteria-box ${tipe.level}">
      <div class="kriteria-label">Tipe Cinta</div>
      <div class="kriteria-title">${tipe.icon} ${tipe.label}</div>
      <div class="kriteria-desc">${tipe.desc}</div>
    </div>
    ${rawToggleBlock('raw12', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 13: JENIS CINTA (who_13) — 42 soal, 6 tipe x 7 soal
// Scoring: SS=1, S=2, N=3, TS=4, STS=5 → nilai terkecil = dominan
// ═══════════════════════════════════════════════════════════════
const CINTA13_MAP = { a:1, b:2, c:3, d:4, e:5 };
const CINTA13_TYPES = [
  { key:'eros',   label:'Eros',   icon:'💘', color:'#ef4444',
    desc:'Cinta yang berdasarkan pada hawa nafsu seksual (passion). Ada ketertarikan secara fisik dan rasa ingin memiliki.' },
  { key:'ludus',  label:'Ludus',  icon:'🎮', color:'#7c3aed',
    desc:'Cinta yang main-main dan tidak serius, biasanya tidak ada unsur komitmen. Orang dengan cinta ini biasanya memiliki kepribadian yang tidak dewasa.' },
  { key:'storge', label:'Storge', icon:'🤝', color:'#2563eb',
    desc:'Jenis cinta yang menekankan pada hubungan persahabatan, hangat, akrab, dan kurang menekankan unsur hawa nafsu biologis.' },
  { key:'pragma', label:'Pragma', icon:'📊', color:'#ca8a04',
    desc:'Cinta yang didasarkan pada logika dan realistis. Cinta karena mendapat keuntungan dari orang yang dicintai.' },
  { key:'mania',  label:'Mania',  icon:'🌀', color:'#db2777',
    desc:'Cinta yang posesif dan ingin memiliki.' },
  { key:'agape',  label:'Agape',  icon:'🕊️', color:'#16a34a',
    desc:'Cinta tanpa pamrih, tulus, dan ikhlas mencintai, bukan karena maksud tertentu, tetapi rela berkorban.' },
];

function renderWho13(arr) {
  const scores = {};
  CINTA13_TYPES.forEach((t, i) => {
    const slice = arr.slice(i*7, i*7+7);
    const total = slice.reduce((s, v) => s + (CINTA13_MAP[v.trim().toLowerCase()] || 3), 0);
    scores[t.key] = total;
  });

  // Nilai terkecil = dominan
  const minVal = Math.min(...Object.values(scores));
  const dominanList = CINTA13_TYPES.filter(t => scores[t.key] === minVal);
  dataPDF.tests.who_13 = { jawaban: arr, scores, dominant: dominanList.map(t=>t.key) };

  const bars = CINTA13_TYPES.map(t => ({
    label: t.label + ` (rata: ${(scores[t.key]/7).toFixed(1)})`,
    color: t.color,
    count: 7 - Math.round(scores[t.key]/7) // invert untuk bar (skor kecil = tinggi)
  }));

  return `
    <div class="info-note">💡 Skor terkecil = jenis cinta yang paling sesuai kepribadian</div>
    <div class="gaya-grid" style="margin-top:10px">
      ${CINTA13_TYPES.map(t => `
        <div class="gaya-row">
          <div class="gaya-label">${t.icon} ${t.label}</div>
          <div class="gaya-bar-wrap">
            <div class="gaya-bar" style="width:${100 - Math.round((scores[t.key]-6)/29*100)}%;background:${t.color}"></div>
          </div>
          <div class="gaya-count" style="color:${t.color}">${(scores[t.key]/7).toFixed(1)}</div>
        </div>`).join('')}
    </div>
    ${dominanList.map(d => `
    <div class="kriteria-box success" style="margin-top:8px">
      <div class="kriteria-label">Jenis Cinta Dominan</div>
      <div class="kriteria-title">${d.icon} ${d.label}</div>
      <div class="kriteria-desc">${d.desc}</div>
    </div>`).join('')}
    ${rawToggleBlock('raw13', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 14: KECANDUAN HUBUNGAN (who_14) — 10 soal A=3,B=2,C=1
// ═══════════════════════════════════════════════════════════════
const MAP14 = { a:3, b:2, c:1 };
function skorWho14(arr) {
  return arr.reduce((s, v) => s + (MAP14[v.trim().toLowerCase()] || 0), 0);
}

function kriteriaWho14(total) {
  if (total >= 25) return { level:'danger',  icon:'⚠️', title:'Mulai Terikat', max:30,
    desc:'Kamu mulai terikat dalam satu hubungan. Berhati-hatilah, coba kembalikan fokus pada tujuan hubungan tersebut. Jangan terlalu bergantung karena hubungan yang terlalu mengikat dan menjadi candu akan merugikan kedua belah pihak.' };
  if (total >= 18) return { level:'success', icon:'✅', title:'Cukup Ideal', max:30,
    desc:'Kamu merasa membutuhkan sebuah hubungan, tapi tidak mau memaksakan sebuah hubungan. Cukup ideal dalam membina sebuah hubungan yang baik karena hubungan yang ideal adalah hubungan yang saling membangun tanpa pengekangan.' };
  return { level:'warning', icon:'💭', title:'Hubungan Sebatas Pelengkap', max:30,
    desc:'Kamu menganggap hubungan hanya sebatas pelengkap dan status, serta tidak terlalu penting dalam menjalaninya. Kamu bisa terlepas dari hubungan dan cenderung tidak terlalu serius.' };
}

function renderWho14(arr) {
  const total = skorWho14(arr);
  const k = kriteriaWho14(total);
  k.skor = total;
  dataPDF.tests.who_14 = { jawaban: arr, skor: total, kriteria: k };
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 30)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 30</div>
        <div class="score-sub">10 soal · A=3, B=2, C=1</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw14', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 16: KESETIAAN (who_16) — 10 soal, skoring per soal berbeda
// ═══════════════════════════════════════════════════════════════
// No.1: a=3,b=2,c=1 | No.2: a=3,b=2,c=1 | No.3: nilai 1 semua
// No.4: a=2,b=3,c=1 | No.5: a=1,b=3,c=2 | No.6: a=2,b=3,c=1
// No.7: a=2,b=1,c=3 | No.8: nilai 1 semua | No.9: a=1,b=3,c=2 | No.10: a=2,b=1,c=3
const SKOR16 = [
  { a:3,b:2,c:1 }, { a:3,b:2,c:1 }, { a:1,b:1,c:1 },
  { a:2,b:3,c:1 }, { a:1,b:3,c:2 }, { a:2,b:3,c:1 },
  { a:2,b:1,c:3 }, { a:1,b:1,c:1 }, { a:1,b:3,c:2 }, { a:2,b:1,c:3 },
];

function skorWho16(arr) {
  return arr.reduce((s, v, i) => {
    const map = SKOR16[i] || {};
    return s + (map[v.trim().toLowerCase()] || 0);
  }, 0);
}

function kriteriaWho16(total) {
  if (total >= 21) return { level:'danger', icon:'⚠️', title:'Mudah Terjerumus', max:36,
    desc:'Kamu termasuk mudah terjerumus dalam lubang perselingkuhan. Saat dilanda kebosanan, mencari sosok lain yang bisa memberi perhatian. Akan bijaksana bila mulai menjaga jarak saat berhubungan dengan lawan jenis.' };
  if (total >= 11) return { level:'success', icon:'💪', title:'Setia', max:36,
    desc:'Selain tidak mudah terbujuk rayu lawan jenis, kamu juga tipe orang yang sangat menyenangkan. Menolak tanpa harus menyakiti. Menjaga hubungan keluarga tanpa harus renggang dengan teman. Kamu punya komitmen kuat.' };
  return { level:'warning', icon:'❄️', title:'Tidak Gampang Tertarik', max:36,
    desc:'Kamu memang tidak gampang tertarik pada lawan jenis. Risiko perselingkuhan sangat kecil. Hanya, hati-hati karena jalinan relasi bisa terganggu. Kamu dianggap sebagai orang yang kurang menyenangkan karena terlalu hitam-putih.' };
}

function renderWho16(arr) {
  const total = skorWho16(arr);
  const k = kriteriaWho16(total);
  k.skor = total;
  dataPDF.tests.who_16 = { jawaban: arr, skor: total, kriteria: k };
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 36)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 36</div>
        <div class="score-sub">10 soal · skoring per soal berbeda</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw16', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 17: SAHABAT (who_17) — 10 soal, skoring per soal berbeda
// ═══════════════════════════════════════════════════════════════
const SKOR17 = [
  { a:2,b:3,c:1 }, { a:3,b:2,c:1 }, { a:2,b:3,c:2 },
  { a:1,b:1,c:2 }, { a:2,b:2,c:1 }, { a:2,b:2,c:3 },
  { a:2,b:1,c:2 }, { a:2,b:3,c:3 }, { a:1,b:2,c:3 }, { a:2,b:2,c:3 },
];

function skorWho17(arr) {
  return arr.reduce((s, v, i) => {
    const map = SKOR17[i] || {};
    return s + (map[v.trim().toLowerCase()] || 0);
  }, 0);
}

function kriteriaWho17(total) {
  if (total >= 24) return { level:'success', icon:'🌟', title:'Sahabat yang Baik', max:27,
    desc:'Kamu adalah seorang sahabat yang baik. Kamu memiliki sikap saling membangun, pengertian, dan kebaikan. Sahabat kamu adalah orang yang beruntung karena bisa mengenal kamu. Dalam hubungannya, kamu menjadi magnet yang membuat persahabatan tampak ideal dan saling membutuhkan.' };
  if (total >= 19) return { level:'info', icon:'👍', title:'Teman Dekat', max:27,
    desc:'Kamu termasuk kategori teman dekat, lebih dari sekadar teman biasa. Adanya kepercayaan di dalam hubungan membuat persahabatan kamu menjadi lebih baik.' };
  return { level:'warning', icon:'🤝', title:'Teman yang Baik', max:27,
    desc:'Kamu termasuk teman yang baik, tapi belum bisa dikatakan sebagai sahabat. Ada beberapa hal yang menjadikan kedekatan kamu masih memiliki batasan tertentu. Perhatian, keterbukaan, dan kepercayaan yang kamu miliki masih dalam kadar yang biasa saja.' };
}

function renderWho17(arr) {
  const total = skorWho17(arr);
  const k = kriteriaWho17(total);
  k.skor = total;
  dataPDF.tests.who_17 = { jawaban: arr, skor: total, kriteria: k };
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 27)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 27</div>
        <div class="score-sub">10 soal · skoring per soal berbeda</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw17', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 18: PASANGAN SIAP PENDAMPING (who_18) — 12 soal A=1,B=2,C=3
// ═══════════════════════════════════════════════════════════════
const MAP18 = { a:1, b:2, c:3 };
function renderWho18(arr) {
  const total = arr.reduce((s, v) => s + (MAP18[v.trim().toLowerCase()] || 0), 0);
  dataPDF.tests.who_18 = { jawaban: arr, skor: total };

  let k;
  if (total >= 29) k = { level:'warning', icon:'💭', title:'Perlu Lebih Mengenal', max:36,
    desc:'Kalian kurang mengenal satu sama lain. Masih terlalu dini untuk disebut sebagai pasangan yang ideal. Perlu adanya kejujuran dalam sebuah hubungan agar menjadi hubungan yang baik.' };
  else if (total >= 20) k = { level:'success', icon:'💑', title:'Cukup Ideal', max:36,
    desc:'Kamu dan pasanganmu adalah pasangan yang cukup ideal. Kalian memiliki kemandirian, saling percaya, dan orientasi yang baik dalam menjalin sebuah hubungan. Jika diteruskan dan dikenal lebih jauh lagi, bisa jadi kalian menjadi pasangan yang baik.' };
  else k = { level:'danger', icon:'⚠️', title:'Perlu Peningkatan Kedekatan', max:36,
    desc:'Kamu dan pasanganmu masih kurang memiliki kedekatan. Ada beberapa hal yang wajib dimiliki pasangan yang belum kalian miliki, seperti kepercayaan, kejujuran, dan kedekatan secara pribadi.' };

  k.skor = total;
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 36)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 36</div>
        <div class="score-sub">12 soal · A=1, B=2, C=3</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw18', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 20: MINAT KARIER RIASEC (who_20) — 108 soal, 6 tipe x 18
// ═══════════════════════════════════════════════════════════════
const RIASEC = [
  { key:'R', label:'Realistic',     icon:'🔧', color:'#dc2626',
    desc:'Menyukai pekerjaan realistis. Memiliki keahlian atletik atau mekanik dan menyukai kegiatan luar ruangan dengan peralatan atau mesin.',
    contoh:'Mekanik, ATC, surveyor, ahli elektronik, petani.' },
  { key:'I', label:'Investigative', icon:'🔬', color:'#7c3aed',
    desc:'Menyukai pekerjaan investigatif. Memiliki keahlian sains dan matematika, menyukai kesendirian dalam pekerjaan maupun memecahkan masalah.',
    contoh:'Ahli biologi, kimia, fisika, geologi, peneliti, teknisi medis.' },
  { key:'A', label:'Artistic',      icon:'🎨', color:'#db2777',
    desc:'Menyukai pekerjaan seni. Memiliki keahlian seni, menyenangi pekerjaan orisinal dan memiliki imajinasi tinggi.',
    contoh:'Komposer, musisi, pengarah panggung, penari, dekorator, penulis.' },
  { key:'S', label:'Social',        icon:'🤝', color:'#16a34a',
    desc:'Menyukai pekerjaan yang melibatkan sosialisasi. Tertarik bagaimana bergaul dengan situasi sosial dan suka membantu permasalahan orang lain.',
    contoh:'Guru, terapis, pekerja religius, konselor, psikolog, perawat.' },
  { key:'E', label:'Enterprising',  icon:'📈', color:'#f59e0b',
    desc:'Menyukai pekerjaan kreatif, inovatif, dan menghibur. Memiliki jiwa kepemimpinan dan kemampuan berbicara di depan umum.',
    contoh:'Pedagang, pialang, promotor, produser acara, eksekutif, manajer.' },
  { key:'C', label:'Conventional',  icon:'📋', color:'#0891b2',
    desc:'Menyukai pekerjaan dalam ruang dan mengelola sesuatu agar rapi. Menyukai rutinitas yang teratur dan bekerja sesuai standar yang jelas.',
    contoh:'Analis keuangan, pegawai perpustakaan, banking, akunting, sekretaris.' },
];

function renderWho20(arr) {
  const scores = {};
  RIASEC.forEach((t, i) => {
    const slice = arr.slice(i*18, i*18+18);
    scores[t.key] = slice.filter(v => v.trim().toLowerCase() === 'a').length;
  });

  const maxVal = Math.max(...Object.values(scores));
  const dominanList = RIASEC.filter(t => scores[t.key] === maxVal);
  dataPDF.tests.who_20 = { jawaban: arr, scores, dominant: dominanList.map(t=>t.key) };

  return `
    <div class="info-note">💡 Tipe dengan nilai terbesar adalah minat karier dominan</div>
    <div class="gaya-grid" style="margin-top:10px">
      ${RIASEC.map(t => `
        <div class="gaya-row">
          <div class="gaya-label">${t.icon} ${t.label}</div>
          <div class="gaya-bar-wrap">
            <div class="gaya-bar" style="width:${Math.round(scores[t.key]/18*100)}%;background:${t.color}"></div>
          </div>
          <div class="gaya-count" style="color:${t.color}">${scores[t.key]}/18</div>
        </div>`).join('')}
    </div>
    ${dominanList.map(d => `
    <div class="kriteria-box info" style="margin-top:8px">
      <div class="kriteria-label">Minat Karier Dominan</div>
      <div class="kriteria-title">${d.icon} ${d.label}</div>
      <div class="kriteria-desc">${d.desc}<br><strong>Contoh karier:</strong> ${d.contoh}</div>
    </div>`).join('')}
    ${rawToggleBlock('raw20', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 21: JIWA KEPEMIMPINAN (who_21) — 14 soal, A=0,B=1,C=2,D=3
// ═══════════════════════════════════════════════════════════════
const MAP21 = { a:0, b:1, c:2, d:3 };
function skorWho21(arr) {
  return arr.reduce((s, v) => {
    const key = String(v).trim().toLowerCase();
    return s + (MAP21[key] ?? parseInt(v) ?? 0);
  }, 0);
}

function kriteriaWho21(total) {
  if (total >= 32) return { level:'danger', icon:'⚠️', title:'Perlu Peningkatan', max:42,
    desc:'Kamu cenderung lebih memilih untuk dipimpin daripada memimpin. Kamu termasuk pribadi yang kerap menghindari komunikasi dengan orang lain. Terkadang kepercayaan diri bisa luntur seketika. Cobalah untuk menjadi orang yang terdepan dan naikkan rasa percaya diri.' };
  if (total >= 20) return { level:'warning', icon:'✅', title:'Cukup sebagai Pemimpin', max:42,
    desc:'Kamu memiliki sikap kepemimpinan, tetapi belum cukup untuk memimpin orang lain. Kamu harus lebih banyak belajar bagaimana menjadi pemimpin yang baik.' };
  if (total >= 10) return { level:'success', icon:'👍', title:'Pemimpin yang Baik', max:42,
    desc:'Kamu adalah pemimpin yang baik, yang mengerti dan mampu mendengarkan orang lain, dapat memimpin orang lain dalam satu tujuan.' };
  return { level:'success', icon:'🌟', title:'Pemimpin yang Kuat', max:42,
    desc:'Kamu bisa menjadi komunikator yang baik, tegas, dan ideal untuk diandalkan demi kelangsungan tujuan bersama. Memiliki pengaruh dan dapat berdampak positif bagi lingkungan sekitar.' };
}

function renderWho21(arr) {
  const total = skorWho21(arr);
  const k = kriteriaWho21(total);
  k.skor = total;
  dataPDF.tests.who_21 = { jawaban: arr, skor: total, kriteria: k };
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 42)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 42</div>
        <div class="score-sub">14 pernyataan · skala 0–3</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw21', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 22: GAYA KEPEMIMPINAN (who_22) — 28 soal a/b
// ═══════════════════════════════════════════════════════════════
const GAYA_TYPES = [
  { key:'P', label:'Paternalistic / Maternalistic', color:'#2563eb', start:0,  end:6  },
  { key:'A', label:'Autocratic',                    color:'#ef4444', start:7,  end:13 },
  { key:'L', label:'Laissez-Faire',                 color:'#f59e0b', start:14, end:20 },
  { key:'D', label:'Democratic',                    color:'#10b981', start:21, end:27 },
];
const GAYA_DESC = {
  P:'Kepemimpinan Paternalistis/Maternalistis diidentikkan dengan kepemimpinan kebapakan. Setiap anggota dianggap seperti anaknya sendiri. Pemimpin cenderung membimbing dan melindungi, namun keputusan tetap ada di tangan pemimpin.',
  A:'Kepemimpinan Otoriter/Autocratic memusatkan segala keputusan dari dirinya sendiri secara penuh. Pemimpin cenderung memaksakan kehendak agar para bawahan melaksanakan tugas yang diberikan.',
  L:'Kepemimpinan Laissez-Faire membiarkan bawahan secara aktif menentukan tujuan dan penyelesaian masalah. Pemimpin tidak lebih dari sekadar simbol; ada atau tidak ada pemimpin, seringkali tidak ada bedanya.',
  D:'Kepemimpinan Demokratis memberikan wewenang secara luas kepada bawahan. Setiap permasalahan selalu mengikutsertakan bawahan sebagai satu tim yang utuh, dengan banyak informasi tentang tugas dan tanggung jawab.',
};

function skorWho22(arr) {
  const counts = { P:0, A:0, L:0, D:0 };
  GAYA_TYPES.forEach(t => {
    for (let i = t.start; i <= t.end; i++) {
      const v = (arr[i] || '').toString().trim().toLowerCase();
      if (v === 'a') counts[t.key]++;
    }
  });
  return counts;
}

function renderWho22(arr) {
  const counts = skorWho22(arr);
  const dom = dominanKey(counts);
  const domType = GAYA_TYPES.find(t=>t.key===dom);
  dataPDF.tests.who_22 = { jawaban: arr, counts, dominant: dom };

  const bars = GAYA_TYPES.map(t => ({ label: t.label, color: t.color, count: counts[t.key] }));

  return `
    ${renderDominanBadge('🎯 ' + (domType ? domType.label : '—'))}
    <div class="gaya-grid">${renderBarChart(bars, 7)}</div>
    <div class="kriteria-box info">
      <div class="kriteria-label">Deskripsi Gaya Kepemimpinan</div>
      <div class="kriteria-title">${domType ? domType.label : '—'}</div>
      <div class="kriteria-desc">${dom ? GAYA_DESC[dom] : '—'}</div>
    </div>
    <div class="note-box"><strong>Catatan:</strong> Tidak ada tipe kepemimpinan yang mutlak terbaik. Semua gaya memiliki keunggulan masing-masing tergantung situasi dan kondisi yang dihadapi.</div>
    ${rawToggleBlock('raw22', arr, true)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 23: MOTIVASI KEPEMIMPINAN (who_23) — 14 soal, a=1..e=5
// ═══════════════════════════════════════════════════════════════
const MAP23 = { a:1, b:2, c:3, d:4, e:5 };
function skorWho23(arr) {
  return arr.reduce((s, v) => {
    const key = String(v).trim().toLowerCase();
    return s + (MAP23[key] ?? parseInt(v) ?? 0);
  }, 0);
}

function kriteriaWho23(total) {
  if (total >= 56) return { level:'success', icon:'🌟', title:'Motivasi Kepemimpinan Kuat', max:70,
    desc:'Menunjukkan motivasi yang kuat untuk menjadi pemimpin, adanya sikap ideal yang diperlukan untuk memimpin dan mengorganisasikan sesuatu. Kamu berbakat menjadi pemimpin yang baik.' };
  if (total >= 28) return { level:'warning', icon:'✅', title:'Motivasi Cukup', max:70,
    desc:'Menunjukkan suatu keragu-raguan untuk menjadi pemimpin. Bersikaplah lebih tegas, mandiri, dan lebih bertanggung jawab.' };
  return { level:'danger', icon:'⚠️', title:'Motivasi Perlu Dikembangkan', max:70,
    desc:'Menunjukkan motivasi yang rendah untuk menjadi pemimpin. Perlu mengembangkan karakteristik dan belajar menjadi pemimpin. Jangan hanya puas menjadi bawahan dengan tugas yang biasa saja.' };
}

function renderWho23(arr) {
  const total = skorWho23(arr);
  const k = kriteriaWho23(total);
  k.skor = total;
  dataPDF.tests.who_23 = { jawaban: arr, skor: total, kriteria: k };
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 70)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 70</div>
        <div class="score-sub">14 pernyataan · skala 1–5</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw23', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 24: MANAJEMEN WAKTU (who_24) — 10 soal, A=3,B=2,C=1,D=0
// ═══════════════════════════════════════════════════════════════
const MAP24 = { a:3, b:2, c:1, d:0 };
function renderWho24(arr) {
  const total = arr.reduce((s, v) => s + (MAP24[v.trim().toLowerCase()] ?? 0), 0);
  dataPDF.tests.who_24 = { jawaban: arr, skor: total };

  let k;
  if (total >= 28) k = { level:'warning', icon:'🤔', title:'Tidak Sesuai Kenyataan', max:30,
    desc:'Hasil jawaban yang kamu isikan bukanlah diri kamu yang sebenarnya.' };
  else if (total >= 26) k = { level:'success', icon:'🏆', title:'Luar Biasa Prima', max:30,
    desc:'Kamu benar-benar unggul, luar biasa prima! Kamu adalah pengelola waktu yang sangat luar biasa.' };
  else if (total >= 21) k = { level:'success', icon:'⭐', title:'Sangat Baik', max:30,
    desc:'Sangat baik. Kamu dapat membuat skala prioritas dan kebijaksanaan dalam mengelola waktu dengan baik.' };
  else if (total >= 16) k = { level:'info', icon:'👍', title:'Sudah Bertindak Baik', max:30,
    desc:'Kamu sudah bertindak baik, tetapi masih perlu ditingkatkan. Ada beberapa hal yang perlu diperbaiki, cobalah mulai melakukan introspeksi diri.' };
  else k = { level:'danger', icon:'⚠️', title:'Perlu Perbaikan', max:30,
    desc:'Berpikirlah untuk mulai mengelola waktu kamu dengan baik agar setiap waktu tidak terbuang percuma dan bisa memanfaatkan waktu dengan lebih baik lagi.' };

  k.skor = total;
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 30)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 30</div>
        <div class="score-sub">10 soal · Hampir Selalu=3, Sering=2, Kadang=1, Hampir Tidak Pernah=0</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw24', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 25: STRES KERJA (who_25) — 12 soal
// Soal 1-9: YA=1 | Soal 10-12: TIDAK=1
// ═══════════════════════════════════════════════════════════════
function renderWho25(arr) {
  let total = 0;
  arr.forEach((v, i) => {
    const val = v.trim().toLowerCase();
    if (i < 9 && val === 'a') total++; // soal 1-9: YA (a) = 1
    if (i >= 9 && val === 'b') total++; // soal 10-12: TIDAK (b) = 1
  });
  dataPDF.tests.who_25 = { jawaban: arr, skor: total };

  const k = total >= 4
    ? { level:'danger',  icon:'⚠️', title:'Kemungkinan Stres Negatif', max:12, skor:total,
        desc:'Kemungkinan kamu sedang mengalami stres yang negatif. Kamu mungkin perlu mengetahui lebih lanjut cara mengelola stres. Cobalah untuk menemukan kembali tujuan dan perasaan menyenangkan saat bekerja. Sesekali, lakukan refreshing dari kepenatan rutinitas pekerjaan.' }
    : { level:'success', icon:'✅', title:'Stres Terkendali', max:12, skor:total,
        desc:'Kamu masih ada dalam posisi yang aman dalam mengelola stres di tempat pekerjaan. Selamat!' };

  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 12)}
      <div class="score-info">
        <div class="score-title">Skor Stres: ${total} / 12</div>
        <div class="score-sub">Soal 1–9: YA=poin | Soal 10–12: TIDAK=poin</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw25', arr, true)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 26: KEMANDIRIAN (who_26) — 15 soal, A=4,B=3,C=2,D=1
// ═══════════════════════════════════════════════════════════════
const MAP26 = { a:4, b:3, c:2, d:1 };
function renderWho26(arr) {
  const total = arr.reduce((s, v) => s + (MAP26[v.trim().toLowerCase()] || 0), 0);
  dataPDF.tests.who_26 = { jawaban: arr, skor: total };

  let k;
  if (total >= 45) k = { level:'success', icon:'🌟', title:'Mandiri', max:60,
    desc:'Selamat! Kamu mandiri, tidak tergantung pada keputusan orang lain, dan memiliki prinsip yang kuat dan tegas, serta dewasa. Kamu pintar mengelola waktu dengan baik dan mampu bekerja sendiri.' };
  else if (total >= 35) k = { level:'info', icon:'👍', title:'Cukup Mandiri', max:60,
    desc:'Kamu cukup mandiri. Kamu termasuk golongan orang yang cukup bisa berdiri sendiri, orang yang cukup bertanggung jawab dalam mengerjakan sesuatu dan cenderung bisa diandalkan.' };
  else if (total >= 25) k = { level:'warning', icon:'🤔', title:'Kurang Mandiri', max:60,
    desc:'Kamu kurang mandiri, ada beberapa hal yang tidak bisa kamu putuskan sendiri. Masih ada rasa tidak berani dalam menjalani apa yang telah dipilih.' };
  else k = { level:'danger', icon:'⚠️', title:'Tidak Mandiri', max:60,
    desc:'Kamu tidak mandiri, masih sangat bergantung pada orang lain, tidak memiliki kebebasan untuk memutuskan sesuatu, serta kurang percaya diri dalam menghadapi banyak hal. Cobalah untuk mengenali potensi dan belajar menyelesaikan masalah sendiri.' };

  k.skor = total;
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 60)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 60</div>
        <div class="score-sub">15 soal · A=4, B=3, C=2, D=1</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw26', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// TES 27: PEMBERANI (who_27) — 26 soal
// Dari file skoring: range nilai 26-104 dengan 4 kategori
// Tiap soal nilai 1-4, asumsi a=4,b=3,c=2,d=1 (keberanian tinggi)
// ═══════════════════════════════════════════════════════════════
const MAP27 = { a:4, b:3, c:2, d:1 };
function renderWho27(arr) {
  const total = arr.reduce((s, v) => s + (MAP27[v.trim().toLowerCase()] || 0), 0);
  dataPDF.tests.who_27 = { jawaban: arr, skor: total };

  let k;
  if (total >= 88) k = { level:'success', icon:'🦁', title:'Pemberani', max:104,
    desc:'Kamu pemberani, mampu mengekspresikan sesuatu secara terbuka, berani, dan juga blak-blakan. Memiliki komunikasi yang sangat baik, tegas, dan tidak mau bermuka dua. Tetapi berhati-hatilah, terkadang ada beberapa hal yang tidak harus disampaikan secara langsung.' };
  else if (total >= 68) k = { level:'info', icon:'💪', title:'Cukup Berani', max:104,
    desc:'Kamu cukup berani dan cukup ideal dalam bersikap, mengerti batasan, cenderung tegas dan dapat diandalkan. Kamu mampu mengekspresikan diri dalam batasan tertentu, baik dalam berkomunikasi dan juga terbuka.' };
  else if (total >= 47) k = { level:'warning', icon:'😐', title:'Kurang Tegas', max:104,
    desc:'Kamu cenderung kurang tegas, masih mudah untuk dipengaruhi oleh pendapat orang lain, takut apabila bertindak salah dan dinilai salah, dan kurang dapat mengekspresikan diri. Cenderung menahan diri terhadap banyak hal.' };
  else k = { level:'danger', icon:'😰', title:'Pemalu', max:104,
    desc:'Kamu adalah orang yang pemalu, biasa menutup diri, dan cenderung menghindari interaksi dengan orang banyak. Bahkan apa yang menjadi hak kamu kadang kamu biarkan diambil oleh orang lain. Belajarlah untuk menunjukkan sikap berani dan lebih tegas dalam menjalani hidup.' };

  k.skor = total;
  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 104)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 104</div>
        <div class="score-sub">26 soal · A=4, B=3, C=2, D=1</div>
      </div>
    </div>
    ${renderKriteria(k)}
    ${rawToggleBlock('raw27', arr, false)}`;
}

// ═══════════════════════════════════════════════════════════════
// BIO
// ═══════════════════════════════════════════════════════════════
function renderBio(x02Raw) {
  const grid = document.getElementById('bioGrid');
  let bio = {};
  try { bio = JSON.parse(x02Raw || '{}'); } catch {}
  dataPDF.bio = bio;
  const fields = [['nama','Nama'],['usia','Usia'],['pendidikan','Pendidikan'],['jenis_kelamin','Jenis Kelamin'],['telepon','Telepon'],['tgl_tes','Tgl Tes'],['status','Status']];
  grid.innerHTML = fields.filter(([k])=>bio[k]!=null&&bio[k]!=='')
    .map(([k,l])=>`<div class="bio-item"><span class="bio-label">${l}</span><span class="bio-val">${bio[k]}</span></div>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════
function setBtn(loading) {
  const btn = document.getElementById('btnCari');
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="spinner"></span> Mencari...' : '🔎 Cari';
}
function showErr(msg) {
  const eb = document.getElementById('errBox');
  eb.textContent = msg; eb.classList.add('show');
}
function clearUI() {
  document.getElementById('errBox').classList.remove('show');
  document.getElementById('noData').classList.remove('show');
  document.getElementById('resultWrap').classList.remove('show');
  // clear all tes slots
  const ids = ['hasil01','hasil02','hasil03','hasil04','hasil05','hasil06','hasil07','hasil08',
    'hasil09','hasil12','hasil13','hasil14','hasil16','hasil17','hasil18','hasil20',
    'hasil21','hasil22','hasil23','hasil24','hasil25','hasil26','hasil27','bioGrid'];
  ids.forEach(id => { const el = document.getElementById(id); if(el) el.innerHTML = ''; });
  dataPDF = { bio:{}, tests:{}, idPeserta:'' };
}

// Map: key x_07 → render function, target div id
const TES_MAP = [
  { key:'who_01', id:'hasil01', fn: renderWho01 },
  { key:'who_02', id:'hasil02', fn: renderWho02 },
  { key:'who_03', id:'hasil03', fn: renderWho03 },
  { key:'who_04', id:'hasil04', fn: renderWho04 },
  { key:'who_05', id:'hasil05', fn: renderWho05 },
  { key:'who_06', id:'hasil06', fn: renderWho06 },
  { key:'who_07', id:'hasil07', fn: renderWho07 },
  { key:'who_08', id:'hasil08', fn: renderWho08 },
  { key:'who_09', id:'hasil09', fn: renderWho09 },
  { key:'who_12', id:'hasil12', fn: renderWho12 },
  { key:'who_13', id:'hasil13', fn: renderWho13 },
  { key:'who_14', id:'hasil14', fn: renderWho14 },
  { key:'who_16', id:'hasil16', fn: renderWho16 },
  { key:'who_17', id:'hasil17', fn: renderWho17 },
  { key:'who_18', id:'hasil18', fn: renderWho18 },
  { key:'who_20', id:'hasil20', fn: renderWho20 },
  { key:'who_21', id:'hasil21', fn: renderWho21 },
  { key:'who_22', id:'hasil22', fn: renderWho22 },
  { key:'who_23', id:'hasil23', fn: renderWho23 },
  { key:'who_24', id:'hasil24', fn: renderWho24 },
  { key:'who_25', id:'hasil25', fn: renderWho25 },
  { key:'who_26', id:'hasil26', fn: renderWho26 },
  { key:'who_27', id:'hasil27', fn: renderWho27 },
];

// ═══════════════════════════════════════════════════════════════
// FETCH DATA
// ═══════════════════════════════════════════════════════════════
async function cariData() {
  const idVal = document.getElementById('inputId').value.trim();
  if (!idVal) { showErr('⚠ Masukkan id_x terlebih dahulu.'); return; }
  clearUI(); setBtn(true);

  try {
    const res = await fetch(`${API_R}?table=${TBL}&id_x=${encodeURIComponent(idVal)}`, {
      headers: { 'X-Custom-Auth': AUTH }
    });
    const d = await res.json();

    if (!d.success || !d.data) { document.getElementById('noData').classList.add('show'); return; }
    const row = Array.isArray(d.data) ? d.data[0] : d.data;
    if (!row) { document.getElementById('noData').classList.add('show'); return; }

    dataPDF.idPeserta = idVal;
    renderBio(row.x_02 || '');

    let x07 = {};
    try { x07 = JSON.parse(row.x_07 || '{}'); } catch {}

    TES_MAP.forEach(({ key, id, fn }) => {
      const el = document.getElementById(id);
      if (!el) return;
      // id format: 'hasil01' → section id: 'sec01'
      const secId = id.replace('hasil', 'sec');
      const section = document.getElementById(secId);
      if (x07[key] != null && x07[key] !== '') {
        const arr = parseJawaban(x07[key]);
        el.innerHTML = fn(arr);
        if (section) section.style.display = '';
      } else {
        el.innerHTML = '';
        if (section) section.style.display = 'none';
      }
    });

    document.getElementById('resultWrap').classList.add('show');

  } catch (e) {
    showErr('⚠ Gagal mengambil data: ' + e.message);
  } finally {
    setBtn(false);
  }
}

// ═══════════════════════════════════════════════════════════════
// PDF GENERATOR
// ═══════════════════════════════════════════════════════════════
function downloadPDF() {
  const btn = document.getElementById('btnPdf');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Membuat PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    const pageW=210, pageH=297, mL=16, mR=16, mT=18, mB=16, cW=pageW-mL-mR;
    let y = mT;

    const CP=[37,99,235], CT=[30,41,59], CM=[100,116,139], CB=[226,232,240];
    const CS=[22,163,74], CW=[180,83,9], CD=[220,38,38], CI=[3,105,161];

    function checkPage(n) {
      if (y+n > pageH-mB) { doc.addPage(); y=mT; border(); }
    }
    function border() {
      doc.setDrawColor(...CB); doc.setLineWidth(0.3);
      doc.rect(10,10,pageW-20,pageH-20);
    }

    function levelColor(level) {
      if (level==='success') return CS;
      if (level==='warning') return CW;
      if (level==='danger')  return CD;
      return CI;
    }

    // Page 1 header
    border();
    doc.setFillColor(...CP);
    doc.rect(mL,y,cW,13,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(255,255,255);
    doc.text('LIDAN PSIKOLOGI – Hasil Tes Psikologi', mL+4, y+9);
    y += 17;

    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...CM);
    doc.text(`ID Peserta: ${dataPDF.idPeserta}   |   Dicetak: ${new Date().toLocaleString('id-ID')}`, mL, y);
    y += 8;

    // Bio
    const bioFields=[['nama','Nama'],['usia','Usia'],['pendidikan','Pendidikan'],['jenis_kelamin','Jenis Kelamin'],['telepon','Telepon'],['tgl_tes','Tgl Tes'],['status','Status']];
    const bioData = bioFields.filter(([k])=>dataPDF.bio[k]!=null&&dataPDF.bio[k]!=='');
    if (bioData.length) {
      const rows = Math.ceil(bioData.length/2);
      const boxH = 7 + rows*6 + 4;
      checkPage(boxH+4);
      doc.setFillColor(240,249,255); doc.setDrawColor(186,230,253); doc.setLineWidth(0.4);
      doc.roundedRect(mL,y,cW,boxH,3,3,'FD');
      doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...CI);
      doc.text('DATA PESERTA', mL+4, y+5);
      y += 7;
      let col=0;
      for (const [k,label] of bioData) {
        const cx = mL+4+(col*(cW/2));
        doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
        doc.text(label+':', cx, y);
        doc.setFont('helvetica','bold'); doc.setTextColor(...CT);
        doc.text(String(dataPDF.bio[k]), cx+28, y);
        col++; if(col===2){col=0;y+=6;}
      }
      if(col!==0) y+=6;
      y+=6;
    }

    function sectionHeader(title) {
      checkPage(14);
      doc.setFillColor(...CP); doc.rect(mL,y,cW,9,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(255,255,255);
      doc.text(title, mL+4, y+6.5);
      y+=13;
    }

    function scoreBox(skor, max, lc, titleStr, descStr) {
      checkPage(38);
      doc.setFillColor(...lc); doc.setDrawColor(...lc); doc.setLineWidth(0);
      doc.circle(mL+10, y+9, 9, 'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(255,255,255);
      doc.text(String(skor), mL+10, y+8, {align:'center'});
      doc.setFont('helvetica','normal'); doc.setFontSize(6);
      doc.text('/'+max, mL+10, y+12, {align:'center'});
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...CT);
      doc.text(`Skor: ${skor} / ${max}`, mL+22, y+7);
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
      doc.text(titleStr, mL+22, y+12);
      y += 20;

      const lines = doc.splitTextToSize(descStr, cW-8);
      const dBoxH = 8 + lines.length*4.5;
      checkPage(dBoxH+4);
      doc.setFillColor(248,250,252); doc.setDrawColor(...CB); doc.setLineWidth(0.4);
      doc.roundedRect(mL,y,cW,dBoxH,2,2,'FD');
      doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...CT);
      doc.text('Kriteria: '+titleStr, mL+4, y+5);
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
      doc.text(lines, mL+4, y+10);
      y += dBoxH+6;
    }

    function dominanBox(dominanLabel, descStr, infoColor) {
      checkPage(30);
      const ic = infoColor || CI;
      doc.setFillColor(...ic.map(c=>Math.min(c+180,255)));
      doc.setDrawColor(...ic); doc.setLineWidth(0.4);
      doc.roundedRect(mL,y,cW,10,2,2,'FD');
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...ic);
      doc.text('Dominan: '+dominanLabel, mL+4, y+6.5);
      y += 14;
      const lines = doc.splitTextToSize(descStr, cW-8);
      const dBoxH = 8+lines.length*4.5;
      checkPage(dBoxH+4);
      doc.setFillColor(248,250,252); doc.setDrawColor(...CB); doc.setLineWidth(0.4);
      doc.roundedRect(mL,y,cW,dBoxH,2,2,'FD');
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
      doc.text(lines, mL+4, y+6);
      y += dBoxH+8;
    }

    // Render semua tes yang ada datanya
    const PDF_TES = [
      { key:'who_01', title:'TES 1 – Gaya Belajar', type:'dominan' },
      { key:'who_02', title:'TES 2 – Otak Kiri/Kanan', type:'dominan' },
      { key:'who_03', title:'TES 3 – Kecerdasan Majemuk', type:'multi' },
      { key:'who_04', title:'TES 4 – Temperamen', type:'dominan' },
      { key:'who_05', title:'TES 5 – Ekstrovert/Introvert', type:'dominan' },
      { key:'who_06', title:'TES 6 – Sensing/Intuitif', type:'dominan' },
      { key:'who_07', title:'TES 7 – Thinking/Feeling', type:'dominan' },
      { key:'who_08', title:'TES 8 – Judging/Perceiving', type:'dominan' },
      { key:'who_09', title:'TES 9 – Pola Asuh', type:'dominan' },
      { key:'who_12', title:'TES 12 – Tipe Cinta', type:'dominan' },
      { key:'who_13', title:'TES 13 – Jenis Cinta', type:'multi' },
      { key:'who_14', title:'TES 14 – Kecanduan Hubungan', type:'score' },
      { key:'who_16', title:'TES 16 – Kesetiaan', type:'score' },
      { key:'who_17', title:'TES 17 – Sahabat yang Baik', type:'score' },
      { key:'who_18', title:'TES 18 – Pasangan Siap Pendamping', type:'score' },
      { key:'who_20', title:'TES 20 – Minat Karier (RIASEC)', type:'multi' },
      { key:'who_21', title:'TES 21 – Jiwa Kepemimpinan', type:'score' },
      { key:'who_22', title:'TES 22 – Gaya Kepemimpinan', type:'dominan22' },
      { key:'who_23', title:'TES 23 – Motivasi Kepemimpinan', type:'score' },
      { key:'who_24', title:'TES 24 – Manajemen Waktu', type:'score' },
      { key:'who_25', title:'TES 25 – Stres Kerja', type:'score' },
      { key:'who_26', title:'TES 26 – Kemandirian', type:'score' },
      { key:'who_27', title:'TES 27 – Pemberani', type:'score' },
    ];

    PDF_TES.forEach(t => {
      const d = dataPDF.tests[t.key];
      if (!d) return;

      sectionHeader(t.title);

      if (t.type === 'score' && d.kriteria) {
        const k = d.kriteria;
        scoreBox(k.skor, k.max, levelColor(k.level), k.title, k.desc);
      }

      if (t.type === 'dominan' && d.dominant) {
        // find label & desc from the appropriate type map
        let label = d.dominant, desc = '';
        // generic fallback
        doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...CI);
        checkPage(8);
        doc.text('Dominan: '+label, mL, y+5); y+=10;
      }

      if (t.type === 'dominan22') {
        const dom = d.dominant;
        const domType = GAYA_TYPES.find(tt=>tt.key===dom);
        if (domType) {
          checkPage(14);
          doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...CP);
          doc.text('Gaya Dominan: '+domType.label, mL, y+5); y+=10;
          GAYA_TYPES.forEach(tt=>{
            checkPage(8);
            const pct = d.counts[tt.key]/7;
            const r=parseInt(tt.color.slice(1,3),16), g=parseInt(tt.color.slice(3,5),16), b=parseInt(tt.color.slice(5,7),16);
            doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CT);
            doc.text(tt.label, mL, y+4);
            doc.setFillColor(226,232,240); doc.rect(mL+65,y,cW-65-20,5,'F');
            doc.setFillColor(r,g,b); doc.rect(mL+65,y,(cW-65-20)*pct,5,'F');
            doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(r,g,b);
            doc.text(`${d.counts[tt.key]}/7`, mL+cW-15, y+4, {align:'right'});
            y+=8;
          });
          y+=2;
          const lines = doc.splitTextToSize(GAYA_DESC[dom]||'', cW-8);
          const dBoxH=8+lines.length*4.5;
          checkPage(dBoxH+4);
          doc.setFillColor(240,249,255); doc.setDrawColor(186,230,253); doc.setLineWidth(0.4);
          doc.roundedRect(mL,y,cW,dBoxH,2,2,'FD');
          doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
          doc.text(lines, mL+4, y+6);
          y += dBoxH+8;
        }
      }

      if (t.type === 'multi') {
        checkPage(8);
        doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
        doc.text('Lihat detail pada laporan web untuk hasil lengkap.', mL, y+4);
        y += 10;
      }
    });

    // Footer semua halaman
    const total = doc.getNumberOfPages();
    for(let p=1;p<=total;p++){
      doc.setPage(p);
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
      doc.text(`Halaman ${p} / ${total}`, pageW/2, pageH-8, {align:'center'});
      doc.text('Lidan Psikologi – Confidential', mL, pageH-8);
    }

    const nama = dataPDF.bio.nama ? dataPDF.bio.nama.replace(/\s+/g,'_') : dataPDF.idPeserta;
    doc.save(`hasil_psikologi_${nama}.pdf`);

  } catch(e) {
    alert('Gagal membuat PDF: '+e.message);
    console.error(e);
  } finally {
    btn.disabled=false;
    btn.innerHTML='⬇ Download PDF';
  }
}
