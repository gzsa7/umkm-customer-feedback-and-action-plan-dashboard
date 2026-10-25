/* ============================================================
   UMKM Feedback Dashboard — script.js
   Vanilla JS murni. Tidak ada dependensi eksternal.
   ============================================================ */

// =============================================================
// DATA PRESET: contoh ulasan realistis per sektor
// =============================================================
const PRESETS = {
  kuliner: {
    sector: 'kuliner',
    reviews: `Makanannya enak banget, porsinya besar dan harganya murah! Puas banget pesan di sini.
Pesanan datang telat 2 jam, padahal jaraknya dekat. Makanan sudah dingin waktu sampai.
Rasa ayam gepreknya mantap, sambalnya juara! Tapi kemasannya bocor, kuah tumpah semua.
Pelayanan CS cepat dan ramah, langsung diganti saat saya komplain. Recommended!
Kemasan plastiknya terlalu tipis, nasi berantakan di tas. Tolong pakai styrofoam ya.
Sudah 3x pesan, rasa selalu konsisten. Driver datang tepat waktu. Bintang 5!
Porsi mini padahal harga sama kayak restoran. Tidak sebanding.
Pesan 2 menu tapi 1 item tidak masuk, kurang teliti saat packing.
Minumannya segar dan tidak terlalu manis. Makanan masih panas waktu diterima, keren!
Kemasan bubble wrap untuk dessert cup sangat bagus, tidak tumpah. Good job!
Bumbu meresap sempurna, ini yang terbaik di kota ini! Akan balik lagi.
Waktu tunggu terlalu lama, lebih dari estimasi 30 menit. Perlu improve di jam makan siang.`
  },
  fashion: {
    sector: 'fashion',
    reviews: `Kualitas bahan kaosnya premium, jahitan rapi dan tidak mudah melar. Sangat puas!
Warna tidak sesuai foto, di gambar hijau tosca aslinya hijau lumut. Mengecewakan.
Pengiriman super cepat, 1 hari sampai! Paket dibungkus rapi dengan bubble wrap.
Ukuran S terlalu kecil, seperti ukuran anak-anak. Guide size perlu diupdate.
Kualitas bordir di logo sangat detail dan tidak terkelupas meski sudah dicuci 5x.
Baju datang bau apek dan ada noda, seperti bekas pakai. Sangat tidak higienis!
Jahitan pinggirnya sudah longgar setelah 2 kali cuci. Tidak worth the price.
Packing sangat cantik ada kartu ucapan, berasa beli di brand lokal ternama.
CS merespons pertanyaan ukuran dengan cepat dan jujur, sangat membantu.
Bahan terasa panas dan tidak menyerap keringat, kurang cocok untuk iklim Indonesia.
Celana jeansnya fit di badan, bahan tidak kaku. Sudah rekomendasikan ke 5 teman!
Foto produk terlalu diedit, warnanya jauh berbeda dari aslinya. Perlu foto yang lebih realistis.`
  },
  elektronik: {
    sector: 'elektronik',
    reviews: `Earphone dengan harga segini suaranya sangat jernih, bass terasa mantap. Mantul!
Barang sampai rusak, layar retak padahal dibungkus tebal. Proses klaim garansi ribet banget.
Baterai powerbank 10.000 mAh terisi penuh hanya dalam 1.5 jam, fast charging works great.
Produk yang dikirim berbeda merk dari yang dipesan. Ini penipuan namanya.
Seller sangat responsif, membantu setup awal via chat dengan sabar dan jelas.
Kipas laptop bunyi berisik setelah 2 minggu pemakaian, seperti ada benda tersangkut.
Kabel USB-C punya build quality bagus, tidak cepat koyak di bagian ujung. Sudah 6 bulan aman.
Tidak ada manual bahasa Indonesia, susah setup untuk yang tidak melek teknologi.
Packaging produk sangat aman, pakai foam tebal, barang sampai mulus tanpa lecet.
Bluetooth speaker-nya disconnect sendiri setiap 10 menit. Firmware perlu update.
Harga lebih murah 30% dari toko fisik, kualitas sama. Ini baru namanya belanja pintar!
Garansi resmi 1 tahun tapi service center terdekat ada di kota lain. Kurang accessible.`
  }
};

// =============================================================
// KEYWORD BANK: digunakan untuk analisis sentimen & kategorisasi
// =============================================================

/** Kata kunci yang mencerminkan sentimen positif */
const POSITIVE_KEYWORDS = [
  'enak', 'puas', 'bagus', 'mantap', 'keren', 'cepat', 'ramah', 'rapi',
  'recommended', 'terbaik', 'jernih', 'premium', 'aman', 'baik', 'segar',
  'sempurna', 'konsisten', 'mantul', 'responsif', 'membantu', 'murah',
  'detail', 'fit', 'great', 'tepat', 'pintar'
];

/** Kata kunci yang mencerminkan sentimen negatif */
const NEGATIVE_KEYWORDS = [
  'telat', 'dingin', 'bocor', 'tumpah', 'berantakan', 'tidak', 'rusak',
  'retak', 'ribet', 'bunyi', 'berisik', 'disconnect', 'koyak', 'kecil',
  'apek', 'noda', 'longgar', 'berbeda', 'penipuan', 'minus', 'buruk',
  'kecewa', 'mengecewakan', 'susah', 'ribet', 'lambat', 'lama'
];

/**
 * Peta kategori isu: kunci = kategori, nilai = array keyword pemicu
 */
const ISSUE_CATEGORIES = {
  'Kemasan': ['bocor', 'tumpah', 'berantakan', 'kemasan', 'packing', 'bungkus', 'foam', 'bubble wrap', 'styrofoam', 'kantong'],
  'Kualitas Produk': ['rasa', 'bahan', 'jahitan', 'warna', 'ukuran', 'kualitas', 'bau', 'noda', 'bunyi', 'disconnect', 'rusak', 'retak', 'longgar', 'firmware', 'manual'],
  'Pengiriman': ['telat', 'lama', 'estimasi', 'driver', 'kirim', 'cepat sampai', 'pengiriman', 'jarak', 'hari sampai'],
  'Layanan': ['cs', 'pelayanan', 'layanan', 'respons', 'responsif', 'komplain', 'garansi', 'klaim', 'service center', 'chat', 'setup']
};

// =============================================================
// FUNGSI PRESET: isi form dengan data contoh sesuai sektor
// =============================================================
/**
 * Mengisi dropdown & textarea dengan data preset berdasarkan sektor.
 * @param {'kuliner'|'fashion'|'elektronik'} sector
 */
function loadPreset(sector) {
  const preset = PRESETS[sector];
  if (!preset) return;

  document.getElementById('sectorSelect').value = preset.sector;
  document.getElementById('reviewInput').value = preset.reviews;

  // Reset output area jika ada
  resetOutput();
}

// =============================================================
// FUNGSI ANALISIS UTAMA
// =============================================================
/**
 * Fungsi utama yang dipanggil saat tombol "Analisis Ulasan dengan AI" diklik.
 * Mensimulasikan proses AI dengan timeout untuk UX loading state.
 */
function analyzeReviews() {
  const reviewText = document.getElementById('reviewInput').value.trim();
  const sector = document.getElementById('sectorSelect').value;

  // Validasi input
  if (!reviewText) {
    showToast('Masukkan teks ulasan terlebih dahulu.', 'error');
    return;
  }
  if (!sector) {
    showToast('Pilih sektor bisnis terlebih dahulu.', 'error');
    return;
  }

  // Tampilkan loading state
  setLoadingState(true);

  // Simulasi proses analisis (delay realistis)
  setTimeout(() => {
    const reviews = parseReviews(reviewText);
    const sentimentData = analyzeSentiment(reviews);
    const actionItems = generateActionItems(reviews, sector);

    renderOutput(reviews.length, sentimentData, actionItems);
    setLoadingState(false);
  }, 1400);
}

// =============================================================
// PARSER: pisahkan teks menjadi array ulasan individual
// =============================================================
/**
 * Memecah teks input menjadi array baris, mengabaikan baris kosong.
 * @param {string} text
 * @returns {string[]}
 */
function parseReviews(text) {
  return text
    .split('\n')
    .map(r => r.trim())
    .filter(r => r.length > 0);
}

// =============================================================
// ANALISIS SENTIMEN: hitung distribusi positif/netral/negatif
// =============================================================
/**
 * Menganalisis sentimen setiap ulasan berdasarkan keyword matching.
 * @param {string[]} reviews
 * @returns {{ positive: number, neutral: number, negative: number }}
 */
function analyzeSentiment(reviews) {
  let positive = 0, negative = 0, neutral = 0;

  reviews.forEach(review => {
    const lower = review.toLowerCase();
    const posScore = POSITIVE_KEYWORDS.filter(k => lower.includes(k)).length;
    const negScore = NEGATIVE_KEYWORDS.filter(k => lower.includes(k)).length;

    if (posScore > negScore) positive++;
    else if (negScore > posScore) negative++;
    else neutral++;
  });

  return { positive, neutral, negative };
}

// =============================================================
// GENERATOR ACTION ITEMS: buat tabel berdasarkan isu terdeteksi
// =============================================================
/**
 * Membangun action items operasional dari ulasan yang masuk.
 * @param {string[]} reviews
 * @param {string} sector
 * @returns {Array<{category: string, pattern: string, solution: string, priority: 'High'|'Medium'|'Low', count: number}>}
 */
function generateActionItems(reviews, sector) {
  // Hitung frekuensi isu per kategori
  const issueCounts = {};
  const issueExamples = {};

  Object.keys(ISSUE_CATEGORIES).forEach(cat => {
    issueCounts[cat] = 0;
    issueExamples[cat] = [];
  });

  reviews.forEach(review => {
    const lower = review.toLowerCase();
    Object.entries(ISSUE_CATEGORIES).forEach(([cat, keywords]) => {
      const matches = keywords.filter(k => lower.includes(k));
      if (matches.length > 0) {
        issueCounts[cat]++;
        if (issueExamples[cat].length < 2) {
          issueExamples[cat].push(review.substring(0, 80) + (review.length > 80 ? '…' : ''));
        }
      }
    });
  });

  // Bangun action item hanya untuk kategori yang ada isu (count > 0)
  const actionItems = [];
  const SOLUTIONS = getSolutions(sector);
  const PATTERNS = getPatterns();

  Object.entries(issueCounts).forEach(([cat, count]) => {
    if (count === 0) return;

    // Tentukan prioritas berdasarkan frekuensi relatif
    const ratio = count / reviews.length;
    let priority;
    if (ratio >= 0.35) priority = 'High';
    else if (ratio >= 0.15) priority = 'Medium';
    else priority = 'Low';

    actionItems.push({
      category: cat,
      pattern: PATTERNS[cat] || `Ditemukan ${count} ulasan terkait ${cat.toLowerCase()}.`,
      solution: SOLUTIONS[cat] || 'Tinjau dan perbaiki proses terkait.',
      priority,
      count
    });
  });

  // Urutkan: High > Medium > Low, lalu frekuensi tertinggi
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  actionItems.sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority] || b.count - a.count
  );

  return actionItems;
}

// =============================================================
// TEMPLATE POLA MASALAH PER KATEGORI
// =============================================================
/**
 * Mengembalikan pola deskripsi masalah yang umum per kategori.
 * @returns {Record<string, string>}
 */
function getPatterns() {
  return {
    'Kemasan': 'Pelanggan mengeluhkan kemasan bocor, tumpah, atau tidak cukup kuat melindungi produk selama pengiriman.',
    'Kualitas Produk': 'Ditemukan ketidaksesuaian produk: warna/ukuran berbeda dari deskripsi, kualitas bahan di bawah ekspektasi, atau produk cepat rusak.',
    'Pengiriman': 'Beberapa ulasan mencatat keterlambatan pengiriman melebihi estimasi atau barang tiba dalam kondisi tidak ideal.',
    'Layanan': 'Terdapat pola masalah pada respons CS, proses klaim garansi, atau aksesibilitas layanan purna jual.'
  };
}

// =============================================================
// TEMPLATE SOLUSI PER SEKTOR & KATEGORI
// =============================================================
/**
 * Memberikan rekomendasi solusi operasional yang spesifik per sektor.
 * @param {string} sector
 * @returns {Record<string, string>}
 */
function getSolutions(sector) {
  const base = {
    'Kemasan': {
      kuliner: 'Upgrade ke kemasan double-seal & tambahkan seal sticker anti-bocor. Gunakan wadah clip-lock untuk kuah/saus.',
      fashion: 'Tambahkan lapisan plastik OPP di dalam pouch. Gunakan garment bag untuk item premium.',
      elektronik: 'Pastikan lapisan foam minimal 2cm di semua sisi. Tandai paket "FRAGILE" dan dokumentasi foto sebelum dikirim.',
      default: 'Evaluasi standar kemasan dan tingkatkan proteksi produk sesuai karakteristik barang.'
    },
    'Kualitas Produk': {
      kuliner: 'Lakukan quality check rasa per batch setiap shift. Standardisasi resep dengan timbangan digital.',
      fashion: 'Perkuat QC jahitan & warna sebelum listing. Update foto produk tanpa filter berlebih di kondisi cahaya alami.',
      elektronik: 'Lakukan pengujian fungsional 100% unit sebelum packing. Update deskripsi produk dengan spesifikasi teknis akurat.',
      default: 'Terapkan prosedur quality control yang lebih ketat sebelum produk dikirim ke pelanggan.'
    },
    'Pengiriman': {
      kuliner: 'Optimalkan rute driver & batasi radius pengiriman. Tambahkan opsi pick-up mandiri untuk jarak > 5km.',
      fashion: 'Integrasikan dengan 2+ mitra ekspedisi. Tambahkan fitur real-time tracking di halaman toko.',
      elektronik: 'Bekerjasama dengan kurir yang menyediakan layanan same-day & asuransi barang elektronik.',
      default: 'Evaluasi mitra logistik dan pertimbangkan penambahan opsi pengiriman yang lebih cepat atau terlacak.'
    },
    'Layanan': {
      kuliner: 'Tetapkan SLA respons CS maksimal 30 menit. Buat SOP penggantian pesanan salah/rusak yang jelas.',
      fashion: 'Buat panduan ukuran dengan foto model berbagai postur tubuh. Aktifkan chatbot untuk FAQ umum.',
      elektronik: 'Sediakan panduan setup PDF/video. Tambah mitra service center atau kemitraan teknisi lokal.',
      default: 'Tingkatkan kapasitas tim CS dan buat SOP standar untuk penanganan keluhan pelanggan.'
    }
  };

  const result = {};
  Object.keys(base).forEach(cat => {
    result[cat] = base[cat][sector] || base[cat]['default'];
  });
  return result;
}

// =============================================================
// RENDER OUTPUT: tampilkan KPI, bar sentimen, dan tabel
// =============================================================
/**
 * Merender seluruh seksi output berdasarkan hasil analisis.
 * @param {number} total
 * @param {{ positive: number, neutral: number, negative: number }} sentiment
 * @param {Array} actionItems
 */
function renderOutput(total, sentiment, actionItems) {
  const pctPos = Math.round((sentiment.positive / total) * 100);
  const pctNeu = Math.round((sentiment.neutral / total) * 100);
  const pctNeg = 100 - pctPos - pctNeu;

  // --- KPI Cards ---
  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiPositive').textContent = `${pctPos}%`;

  // Isu utama = kategori dengan count tertinggi
  const topIssue = actionItems.length > 0 ? actionItems[0].category : 'Tidak ada isu signifikan';
  document.getElementById('kpiTopIssue').textContent = topIssue;

  // --- Sentiment Bar (animasi via setTimeout agar transisi CSS aktif) ---
  setTimeout(() => {
    setBar('barPositive', 'pctPositive', pctPos, '%');
    setBar('barNeutral', 'pctNeutral', pctNeu, '%');
    setBar('barNegative', 'pctNegative', Math.max(pctNeg, 0), '%');
  }, 50);

  // --- Action Items Table ---
  const tbody = document.getElementById('actionTableBody');
  tbody.innerHTML = '';

  if (actionItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-slate-400 py-8 text-sm">
          Tidak ada isu spesifik terdeteksi dari ulasan yang diberikan.
        </td>
      </tr>`;
  } else {
    actionItems.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">${escapeHtml(item.category)}</td>
        <td class="px-4 py-3 text-slate-600 text-xs leading-relaxed">${escapeHtml(item.pattern)}</td>
        <td class="px-4 py-3 text-slate-600 text-xs leading-relaxed">${escapeHtml(item.solution)}</td>
        <td class="px-4 py-3 text-center">
          <span class="badge badge-${item.priority.toLowerCase()}">${item.priority}</span>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // --- Tampilkan section output dengan animasi ---
  const outputSection = document.getElementById('outputSection');
  outputSection.classList.remove('hidden');
  outputSection.classList.add('fade-in-up');
}

// =============================================================
// HELPER: set bar width & label
// =============================================================
/**
 * Mengatur lebar bar dan label persentase.
 * @param {string} barId - ID elemen bar
 * @param {string} labelId - ID elemen label teks
 * @param {number} value - nilai numerik
 * @param {string} suffix - satuan (misal '%')
 */
function setBar(barId, labelId, value, suffix) {
  document.getElementById(barId).style.width = `${value}${suffix}`;
  document.getElementById(labelId).textContent = `${value}${suffix}`;
}

// =============================================================
// LOADING STATE
// =============================================================
/**
 * Mengaktifkan / menonaktifkan tampilan loading pada tombol analisis.
 * @param {boolean} isLoading
 */
function setLoadingState(isLoading) {
  const btn = document.getElementById('analyzeBtn');
  const text = document.getElementById('analyzeBtnText');
  const icon = document.getElementById('analyzeIcon');
  const spinner = document.getElementById('loadingSpinner');

  if (isLoading) {
    btn.disabled = true;
    text.textContent = 'Menganalisis...';
    icon.classList.add('hidden');
    spinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    text.textContent = 'Analisis Ulasan dengan AI';
    icon.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
}

// =============================================================
// COPY ACTION PLAN: salin tabel ke clipboard sebagai teks
// =============================================================
/**
 * Menyalin isi tabel action items ke clipboard dalam format teks terstruktur.
 */
function copyActionPlan() {
  const rows = document.querySelectorAll('#actionTableBody tr');
  if (!rows.length) return;

  const lines = ['UMKM Action Plan — Customer Feedback Analysis', '='.repeat(60)];
  lines.push('Kategori Isu | Pola Masalah | Rekomendasi Solusi | Prioritas');
  lines.push('-'.repeat(60));

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 4) return;
    const cols = Array.from(cells).map(c => c.innerText.trim());
    lines.push(cols.join(' | '));
  });

  const text = lines.join('\n');

  navigator.clipboard.writeText(text)
    .then(() => {
      const btn = document.querySelector('.copy-btn');
      btn.classList.add('copied');
      btn.querySelector('span') 
        ? (btn.querySelector('span').textContent = 'Tersalin!')
        : null;

      // Ganti teks tombol sementara
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Tersalin!`;

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('copied');
      }, 2000);
    })
    .catch(() => showToast('Gagal menyalin. Coba lagi.', 'error'));
}

// =============================================================
// HELPER: reset output section
// =============================================================
/**
 * Menyembunyikan dan me-reset seksi output.
 */
function resetOutput() {
  const outputSection = document.getElementById('outputSection');
  outputSection.classList.add('hidden');
  outputSection.classList.remove('fade-in-up');

  // Reset bar widths
  ['barPositive', 'barNeutral', 'barNegative'].forEach(id => {
    document.getElementById(id).style.width = '0%';
  });
}

// =============================================================
// HELPER: toast notification sederhana
// =============================================================
/**
 * Menampilkan pesan notifikasi singkat di pojok layar.
 * @param {string} message
 * @param {'info'|'error'} type
 */
function showToast(message, type = 'info') {
  // Hapus toast sebelumnya jika ada
  const existing = document.getElementById('toastMsg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toastMsg';
  toast.textContent = message;

  const baseClasses = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all';
  const colorClass = type === 'error'
    ? 'bg-red-600 text-white'
    : 'bg-slate-800 text-white';

  toast.className = `${baseClasses} ${colorClass}`;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// =============================================================
// HELPER: escape HTML untuk keamanan rendering
// =============================================================
/**
 * Mencegah XSS dengan meng-escape karakter HTML khusus.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}
