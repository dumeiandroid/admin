// ─────────────────────────────────────────────────────────────
// WHO ENGINE – Scoring, Render, Bio, API, UI Helpers
// Lidan Psikologi – Tes Kepemimpinan
// ─────────────────────────────────────────────────────────────

const API_R = 'https://lidan-co-id.pages.dev/api/contacts_filter_dinamis7';
const TBL   = 'nilai1_json';
const AUTH  = 'admin';

let dataPDF = { bio:{}, who21:{}, who22:{}, who23:{}, idPeserta:'' };

// ─────────────────────────────────────────────────────────────
// SCORING LOGIC
// ─────────────────────────────────────────────────────────────

// WHO_21: 14 soal radio, nilai 0-3. Skor rendah = pemimpin kuat
const MAP21 = { a:0, b:1, c:2, d:3 };
function skorWho21(jawabanArr) {
  let total = 0;
  jawabanArr.forEach(v => {
    const key = String(v).trim().toLowerCase();
    total += MAP21[key] ?? parseInt(v) ?? 0;
  });
  return total;
}

function kriteriaWho21(total) {
  if (total >= 32) return {
    level:'danger', icon:'⚠️',
    title:'Perlu Peningkatan',
    desc:'Kamu cenderung lebih memilih untuk dipimpin daripada memimpin. Terkadang kepercayaan diri bisa luntur seketika. Cobalah untuk menjadi orang yang terdepan dan naikkan rasa percaya diri.',
    skor: total, max:42
  };
  if (total >= 20) return {
    level:'warning', icon:'✅',
    title:'Cukup sebagai Pemimpin',
    desc:'Kamu memiliki sikap kepemimpinan, tetapi belum cukup untuk memimpin orang lain. Kamu harus lebih banyak belajar bagaimana menjadi pemimpin yang baik.',
    skor: total, max:42
  };
  if (total >= 10) return {
    level:'success', icon:'👍',
    title:'Pemimpin yang Baik',
    desc:'Kamu adalah pemimpin yang baik, yang mengerti dan mampu mendengarkan orang lain, dapat memimpin orang lain dalam satu tujuan.',
    skor: total, max:42
  };
  return {
    level:'success', icon:'🌟',
    title:'Pemimpin yang Kuat',
    desc:'Kamu bisa menjadi komunikator yang baik, tegas, dan ideal untuk diandalkan demi kelangsungan tujuan bersama. Memiliki pengaruh dan dapat berdampak positif bagi lingkungan sekitar.',
    skor: total, max:42
  };
}

// WHO_22: 28 soal a/b. a=ya, b=tidak.
// Urutan: no.1-7 = P (Paternalistic), 8-14 = A (Autocratic), 15-21 = L (Laissez-Faire), 22-28 = D (Democratic)
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

function skorWho22(jawabanArr) {
  const counts = { P:0, A:0, L:0, D:0 };
  GAYA_TYPES.forEach(t => {
    for (let i = t.start; i <= t.end; i++) {
      const v = (jawabanArr[i] || '').toString().trim().toLowerCase();
      if (v === 'a') counts[t.key]++;
    }
  });
  return counts;
}

function dominanWho22(counts) {
  let maxK = null, maxV = -1;
  Object.entries(counts).forEach(([k,v]) => { if (v > maxV) { maxV=v; maxK=k; } });
  return maxK;
}

// WHO_23: 14 soal dropdown nilai 1-5. Skor tinggi = motivasi kuat
const MAP23 = { a:1, b:2, c:3, d:4, e:5 };
function skorWho23(jawabanArr) {
  let total = 0;
  jawabanArr.forEach(v => {
    const key = String(v).trim().toLowerCase();
    total += MAP23[key] ?? parseInt(v) ?? 0;
  });
  return total;
}

function kriteriaWho23(total) {
  if (total >= 56) return {
    level:'success', icon:'🌟',
    title:'Motivasi Kepemimpinan Kuat',
    desc:'Menunjukkan motivasi yang kuat untuk menjadi pemimpin, adanya sikap ideal yang diperlukan untuk memimpin dan mengorganisasikan sesuatu. Kamu berbakat menjadi pemimpin yang baik.',
    skor:total, max:70
  };
  if (total >= 28) return {
    level:'warning', icon:'✅',
    title:'Motivasi Cukup',
    desc:'Menunjukkan suatu keragu-raguan untuk menjadi pemimpin. Bersikaplah lebih tegas, mandiri, dan lebih bertanggung jawab.',
    skor:total, max:70
  };
  return {
    level:'danger', icon:'⚠️',
    title:'Motivasi Perlu Dikembangkan',
    desc:'Menunjukkan motivasi yang rendah untuk menjadi pemimpin. Perlu mengembangkan karakteristik dan belajar menjadi pemimpin. Jangan hanya puas menjadi bawahan dengan tugas yang biasa saja.',
    skor:total, max:70
  };
}

// ─────────────────────────────────────────────────────────────
// RENDER FUNCTIONS
// ─────────────────────────────────────────────────────────────

const CIRCLE_COLORS = {
  success:['#16a34a','#f0fdf4'],
  warning:['#b45309','#fffbeb'],
  danger: ['#dc2626','#fef2f2'],
  info:   ['#0369a1','#f0f9ff'],
};

function renderScoreCircle(k, skor, max) {
  const [fc, bg] = CIRCLE_COLORS[k] || CIRCLE_COLORS.info;
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

function renderWho21(jawabanArr) {
  const total = skorWho21(jawabanArr);
  const k = kriteriaWho21(total);
  dataPDF.who21 = { jawaban:jawabanArr, skor:total, kriteria:k };

  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 42)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 42</div>
        <div class="score-sub">14 pernyataan · skala 0–3</div>
      </div>
    </div>
    ${renderKriteria(k)}
    <span class="raw-toggle" onclick="toggleRaw('raw21')">▾ Lihat jawaban mentah</span>
    <div class="raw-box" id="raw21">
      <div class="jaw-grid">${renderJawGrid(jawabanArr, false)}</div>
    </div>`;
}

function renderWho22(jawabanArr) {
  const counts = skorWho22(jawabanArr);
  const dom = dominanWho22(counts);
  const domType = GAYA_TYPES.find(t=>t.key===dom);
  const maxCount = Math.max(...Object.values(counts));
  dataPDF.who22 = { jawaban:jawabanArr, counts, dominant:dom };

  let bars = '';
  GAYA_TYPES.forEach(t => {
    const pct = maxCount > 0 ? Math.round((counts[t.key]/7)*100) : 0;
    bars += `<div class="gaya-row">
      <div class="gaya-label">${t.label}</div>
      <div class="gaya-bar-wrap"><div class="gaya-bar" style="width:${pct}%;background:${t.color}"></div></div>
      <div class="gaya-count" style="color:${t.color}">${counts[t.key]}/7</div>
    </div>`;
  });

  return `
    <div class="gaya-dominant">🎯 Gaya Dominan: ${domType ? domType.label : '—'}</div>
    <div class="gaya-grid">${bars}</div>
    <div class="kriteria-box info">
      <div class="kriteria-label">Deskripsi Gaya Kepemimpinan</div>
      <div class="kriteria-title">${domType ? domType.label : '—'}</div>
      <div class="kriteria-desc">${dom ? GAYA_DESC[dom] : '—'}</div>
    </div>
    <div class="note-box">
      <strong>Catatan:</strong> Tidak ada tipe kepemimpinan yang mutlak terbaik. Semua gaya memiliki keunggulan masing-masing tergantung situasi dan kondisi yang dihadapi.
    </div>
    <span class="raw-toggle" onclick="toggleRaw('raw22')">▾ Lihat jawaban mentah (a=Ya, b=Tidak)</span>
    <div class="raw-box" id="raw22">
      <div class="jaw-grid">${renderJawGrid(jawabanArr, true)}</div>
    </div>`;
}

function renderWho23(jawabanArr) {
  const total = skorWho23(jawabanArr);
  const k = kriteriaWho23(total);
  dataPDF.who23 = { jawaban:jawabanArr, skor:total, kriteria:k };

  return `
    <div class="score-hero">
      ${renderScoreCircle(k.level, total, 70)}
      <div class="score-info">
        <div class="score-title">Skor Total: ${total} / 70</div>
        <div class="score-sub">14 pernyataan · skala 1–5</div>
      </div>
    </div>
    ${renderKriteria(k)}
    <span class="raw-toggle" onclick="toggleRaw('raw23')">▾ Lihat jawaban mentah</span>
    <div class="raw-box" id="raw23">
      <div class="jaw-grid">${renderJawGrid(jawabanArr, false)}</div>
    </div>`;
}

function toggleRaw(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

// ─────────────────────────────────────────────────────────────
// BIO
// ─────────────────────────────────────────────────────────────
function renderBio(x02Raw) {
  const grid = document.getElementById('bioGrid');
  let bio = {};
  try { bio = JSON.parse(x02Raw || '{}'); } catch {}
  dataPDF.bio = bio;
  const fields = [['nama','Nama'],['usia','Usia'],['pendidikan','Pendidikan'],['jenis_kelamin','Jenis Kelamin'],['telepon','Telepon'],['tgl_tes','Tgl Tes'],['status','Status']];
  grid.innerHTML = fields.filter(([k])=>bio[k]!=null&&bio[k]!=='')
    .map(([k,l])=>`<div class="bio-item"><span class="bio-label">${l}</span><span class="bio-val">${bio[k]}</span></div>`).join('');
}

// ─────────────────────────────────────────────────────────────
// PARSE jawaban dari string "val1;val2;val3"
// ─────────────────────────────────────────────────────────────
function parseJawaban(str) {
  return String(str||'').split(';').map(s=>s.trim()).filter(s=>s!=='');
}

// ─────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────
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
  ['hasil21','hasil22','hasil23','bioGrid'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
  dataPDF = { bio:{}, who21:{}, who22:{}, who23:{}, idPeserta:'' };
}

// ─────────────────────────────────────────────────────────────
// FETCH DATA
// ─────────────────────────────────────────────────────────────
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

    // who_21
    if (x07.who_21 != null && x07.who_21 !== '') {
      const arr = parseJawaban(x07.who_21);
      document.getElementById('hasil21').innerHTML = renderWho21(arr);
    } else {
      document.getElementById('hasil21').innerHTML = '<p style="color:var(--muted);font-size:.88em;font-style:italic">— Data who_21 tidak ditemukan —</p>';
    }

    // who_22
    if (x07.who_22 != null && x07.who_22 !== '') {
      const arr = parseJawaban(x07.who_22);
      document.getElementById('hasil22').innerHTML = renderWho22(arr);
    } else {
      document.getElementById('hasil22').innerHTML = '<p style="color:var(--muted);font-size:.88em;font-style:italic">— Data who_22 tidak ditemukan —</p>';
    }

    // who_23
    if (x07.who_23 != null && x07.who_23 !== '') {
      const arr = parseJawaban(x07.who_23);
      document.getElementById('hasil23').innerHTML = renderWho23(arr);
    } else {
      document.getElementById('hasil23').innerHTML = '<p style="color:var(--muted);font-size:.88em;font-style:italic">— Data who_23 tidak ditemukan —</p>';
    }

    document.getElementById('resultWrap').classList.add('show');

  } catch (e) {
    showErr('⚠ Gagal mengambil data: ' + e.message);
  } finally {
    setBtn(false);
  }
}

// ─────────────────────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────────────────────
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

    // Page 1 header
    border();
    doc.setFillColor(...CP);
    doc.rect(mL,y,cW,13,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(255,255,255);
    doc.text('LIDAN PSIKOLOGI – Hasil Tes Kepemimpinan', mL+4, y+9);
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

    // Helper: section header
    function sectionHeader(title) {
      checkPage(14);
      doc.setFillColor(...CP); doc.rect(mL,y,cW,9,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(255,255,255);
      doc.text(title, mL+4, y+6.5);
      y+=13;
    }

    // Helper: score box
    function scoreBox(skor, max, levelColor, titleStr, descStr) {
      checkPage(38);
      doc.setFillColor(...levelColor); doc.setDrawColor(...levelColor); doc.setLineWidth(0);
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

    // TES 1
    if (dataPDF.who21 && dataPDF.who21.skor != null) {
      sectionHeader('TES 1 – Jiwa Kepemimpinan');
      const k = dataPDF.who21.kriteria;
      const lc = k.level==='success'?CS:k.level==='warning'?CW:CD;
      scoreBox(k.skor, 42, lc, k.title, k.desc);

      const jawArr = dataPDF.who21.jawaban;
      if (jawArr && jawArr.length) {
        checkPage(12);
        doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(...CT);
        doc.text('Jawaban Mentah:', mL, y); y+=5;
        const cols=14, cellW=cW/cols, cellH=8;
        checkPage(cellH+2);
        jawArr.forEach((v,i)=>{
          const c=i%cols;
          if(c===0&&i>0){y+=cellH+2;checkPage(cellH+2);}
          const cx=mL+c*cellW;
          doc.setFillColor(248,250,252); doc.setDrawColor(...CB); doc.setLineWidth(0.3);
          doc.roundedRect(cx,y,cellW-1,cellH,1,1,'FD');
          doc.setFont('helvetica','normal'); doc.setFontSize(5.5); doc.setTextColor(...CM);
          doc.text(String(i+1), cx+cellW/2, y+3, {align:'center'});
          doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...CT);
          doc.text(String(v).trim(), cx+cellW/2, y+6.5, {align:'center'});
        });
        y += cellH+8;
      }
    }

    // TES 2
    if (dataPDF.who22 && dataPDF.who22.dominant) {
      sectionHeader('TES 2 – Gaya Kepemimpinan');
      const dom = dataPDF.who22.dominant;
      const domType = GAYA_TYPES.find(t=>t.key===dom);

      checkPage(14);
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...CP);
      doc.text('Gaya Dominan: '+(domType?domType.label:'—'), mL, y+5);
      y+=10;

      GAYA_TYPES.forEach(t=>{
        checkPage(8);
        const pct = dataPDF.who22.counts[t.key]/7;
        const hex = t.color;
        const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
        doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CT);
        doc.text(t.label, mL, y+4);
        doc.setFillColor(226,232,240); doc.rect(mL+65,y,cW-65-20,5,'F');
        doc.setFillColor(r,g,b); doc.rect(mL+65,y,(cW-65-20)*pct,5,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(r,g,b);
        doc.text(`${dataPDF.who22.counts[t.key]}/7`, mL+cW-15, y+4, {align:'right'});
        y+=8;
      });
      y+=2;

      const lines = doc.splitTextToSize(GAYA_DESC[dom]||'', cW-8);
      const dBoxH=8+lines.length*4.5;
      checkPage(dBoxH+4);
      doc.setFillColor(240,249,255); doc.setDrawColor(186,230,253); doc.setLineWidth(0.4);
      doc.roundedRect(mL,y,cW,dBoxH,2,2,'FD');
      doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...CI);
      doc.text('Deskripsi:', mL+4, y+5);
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
      doc.text(lines, mL+4, y+10);
      y += dBoxH+8;
    }

    // TES 3
    if (dataPDF.who23 && dataPDF.who23.skor != null) {
      sectionHeader('TES 3 – Motivasi Kepemimpinan');
      const k = dataPDF.who23.kriteria;
      const lc = k.level==='success'?CS:k.level==='warning'?CW:CD;
      scoreBox(k.skor, 70, lc, k.title, k.desc);
    }

    // Footer semua halaman
    const total = doc.getNumberOfPages();
    for(let p=1;p<=total;p++){
      doc.setPage(p);
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...CM);
      doc.text(`Halaman ${p} / ${total}`, pageW/2, pageH-8, {align:'center'});
      doc.text('Lidan Psikologi – Confidential', mL, pageH-8);
    }

    const nama = dataPDF.bio.nama ? dataPDF.bio.nama.replace(/\s+/g,'_') : dataPDF.idPeserta;
    doc.save(`hasil_kepemimpinan_${nama}.pdf`);

  } catch(e) {
    alert('Gagal membuat PDF: '+e.message);
    console.error(e);
  } finally {
    btn.disabled=false;
    btn.innerHTML='⬇ Download PDF';
  }
}
