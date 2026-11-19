import type { FlowStep } from '../types/flow';

/**
 * Enam langkah fase tanda tangan (PRD overview): pengguna menandatangani di
 * halaman, mengirim data tanda tangan (permintaan kedua), rantai Backend →
 * API Core → SOA → KMS yang menghasilkan tanda tangan digital, dan hasil
 * yang kembali ke pengguna lewat jalur yang sama secara terbalik.
 */
export const STEPS_TANDA_TANGAN: readonly FlowStep[] = [
  {
    id: 'gambar-ttd',
    number: 6,
    label: 'Tanda tangan',
    title: 'Pengguna menandatangani di halaman',
    narration: [
      'Di kanvas yang sama, pengguna menggambar tanda tangan dengan mouse atau jari. Goresan itu langsung tampil di halaman.',
      'Halaman menyimpan goresan itu sebagai data tanda tangan: bentuk goresan, posisi di dokumen, dan waktu. Belum ada yang dikirim ke backend.',
    ],
    keyIdea: 'Tanda tangan lahir dari pengguna, di perangkatnya sendiri.',
    moves: [],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Terdaftar' },
      { id: 'upload', label: 'Unggahan', text: 'Selesai' },
      { id: 'sign', label: 'Tanda tangan', text: 'Belum' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'done',
      sign: 'active',
      oss: 'done',
      core: 'idle',
      soa: 'idle',
      kms: 'idle',
    },
    reveals: [],
  },
  {
    id: 'kirim-ttd',
    number: 7,
    label: 'Kirim tanda tangan',
    title: 'Data tanda tangan dikirim ke backend',
    narration: [
      'Permintaan kedua berangkat: data tanda tangan dikirim ke backend, terpisah dari permintaan pertama tadi.',
      'Backend kini memegang dua bahan: dokumen yang sudah terdaftar dan data tanda tangan dari pengguna.',
    ],
    keyIdea: 'Tanda tangan dikirim terpisah; backend yang merangkai keduanya.',
    moves: [
      {
        from: 'sign',
        to: 'backend',
        kind: 'signature',
        durationMs: 800,
        delayMs: 0,
      },
    ],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Terdaftar' },
      { id: 'upload', label: 'Unggahan', text: 'Selesai' },
      { id: 'sign', label: 'Tanda tangan', text: 'Belum' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'active',
      sign: 'active',
      oss: 'done',
      core: 'idle',
      soa: 'idle',
      kms: 'idle',
    },
    reveals: [],
  },
  {
    id: 'ke-core',
    number: 8,
    label: 'Ke API Core',
    title: 'Backend meneruskan semuanya ke API Core',
    narration: [
      'Backend mengirim satu paket ke API Core, layanan inti yang memimpin proses: data dokumen, signedUrl, dan data tanda tangan.',
      'Backend tidak menandatangani sendiri. Ia hanya meneruskan bahan; tanda tangan digital dihasilkan di lapisan di bawahnya.',
    ],
    keyIdea:
      'Backend tidak menandatangani sendiri; API Core yang memimpin proses.',
    moves: [
      {
        from: 'backend',
        to: 'core',
        kind: 'document',
        durationMs: 800,
        delayMs: 0,
      },
    ],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Terdaftar' },
      { id: 'upload', label: 'Unggahan', text: 'Selesai' },
      { id: 'sign', label: 'Tanda tangan', text: 'Belum' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'done',
      sign: 'done',
      oss: 'done',
      core: 'active',
      soa: 'idle',
      kms: 'idle',
    },
    reveals: ['core'],
  },
  {
    id: 'ke-soa',
    number: 9,
    label: 'Ke SOA',
    title: 'API Core memanggil SOA',
    narration: [
      'SOA, atau Service-Oriented Architecture, adalah lapisan yang menghubungkan banyak layanan lewat satu pintu. API Core memintanya menandatangani dokumen.',
      'SOA membaca permintaan itu, memilih layanan yang tepat, lalu menyiapkan pemanggilan satu per satu.',
    ],
    keyIdea: 'SOA adalah operator: satu pintu untuk memanggil banyak layanan.',
    moves: [
      { from: 'core', to: 'soa', kind: 'signing', durationMs: 700, delayMs: 0 },
    ],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Terdaftar' },
      { id: 'upload', label: 'Unggahan', text: 'Selesai' },
      { id: 'sign', label: 'Tanda tangan', text: 'Belum' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'done',
      sign: 'done',
      oss: 'done',
      core: 'done',
      soa: 'active',
      kms: 'idle',
    },
    reveals: ['soa'],
  },
  {
    id: 'ke-kms',
    number: 10,
    label: 'Ke KMS',
    title: 'SOA memanggil KMS untuk menandatangani',
    narration: [
      'Dari banyak layanan sekitar, pekerjaan ini hanya butuh satu: KMS, atau Key Management Service, tempat kunci kripto disimpan dan dipakai.',
      'KMS memakai kunci itu untuk menghasilkan tanda tangan digital pada dokumen. Kunci itu sendiri tidak pernah keluar dari KMS.',
    ],
    keyIdea:
      'Kunci tidak pernah keluar dari KMS; yang keluar hasil tanda tangannya.',
    moves: [
      { from: 'soa', to: 'kms', kind: 'signing', durationMs: 700, delayMs: 0 },
    ],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Terdaftar' },
      { id: 'upload', label: 'Unggahan', text: 'Selesai' },
      { id: 'sign', label: 'Tanda tangan', text: 'Belum' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'done',
      sign: 'done',
      oss: 'done',
      core: 'done',
      soa: 'done',
      kms: 'active',
    },
    reveals: ['kms'],
  },
  {
    id: 'hasil',
    number: 11,
    label: 'Hasil kembali',
    title: 'Dokumen bertanda tangan kembali ke pengguna',
    narration: [
      'Hasil menempuh jalur yang sama secara terbalik: dari KMS ke SOA, ke API Core, ke backend, lalu sampai di halaman tanda tangan digital.',
      'Pengguna melihat status dokumen: sudah ditandatangani dan valid, siap diunduh atau dibagikan.',
    ],
    keyIdea: 'Empat lompatan balik, satu hasil: dokumen yang sah.',
    moves: [
      {
        from: 'kms',
        to: 'soa',
        kind: 'signedDoc',
        durationMs: 600,
        delayMs: 0,
      },
      {
        from: 'soa',
        to: 'core',
        kind: 'signedDoc',
        durationMs: 600,
        delayMs: 650,
      },
      {
        from: 'core',
        to: 'backend',
        kind: 'signedDoc',
        durationMs: 700,
        delayMs: 1300,
      },
      {
        from: 'backend',
        to: 'sign',
        kind: 'signedDoc',
        durationMs: 800,
        delayMs: 2050,
      },
    ],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Ditandatangani' },
      { id: 'upload', label: 'Unggahan', text: 'Selesai' },
      { id: 'sign', label: 'Tanda tangan', text: 'Valid' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'done',
      sign: 'done',
      oss: 'done',
      core: 'done',
      soa: 'done',
      kms: 'done',
    },
    reveals: [],
  },
];
