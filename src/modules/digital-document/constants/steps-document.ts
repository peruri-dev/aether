import type { FlowStep } from '../types/flow';

/**
 * Lima langkah fase dokumen: login, membuka halaman tanda tangan digital,
 * memilih berkas, unggah langsung ke OSS sampai menerima signedUrl, dan
 * pendaftaran dokumen di backend (permintaan pertama).
 */
export const STEPS_DOKUMEN: readonly FlowStep[] = [
  {
    id: 'login',
    number: 1,
    label: 'Masuk',
    title: 'Pengguna masuk ke akun',
    narration: [
      'Pengguna membuka Halaman Login, mengisi email dan password, lalu menekan tombol Masuk. Backend memeriksa pasangan itu dan menerbitkan sesi login.',
      'Sesi login menjadi tiket pengguna. Setiap langkah setelah ini membawa tiket yang sama, sehingga backend tahu siapa yang sedang bekerja.',
    ],
    keyIdea: 'Satu sesi login menjadi pintu masuk semua langkah selanjutnya.',
    moves: [
      {
        from: 'login',
        to: 'backend',
        kind: 'credentials',
        durationMs: 800,
        delayMs: 0,
      },
    ],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Belum ada' },
      { id: 'upload', label: 'Unggahan', text: '—' },
      { id: 'sign', label: 'Tanda tangan', text: '—' },
    ],
    nodeStates: {
      login: 'active',
      backend: 'active',
      sign: 'idle',
      oss: 'idle',
      core: 'idle',
      soa: 'idle',
      kms: 'idle',
    },
    reveals: ['login', 'backend'],
  },
  {
    id: 'buka-halaman',
    number: 2,
    label: 'Buka halaman',
    title: 'Pengguna membuka halaman tanda tangan digital',
    narration: [
      'Pengguna membuka Halaman Tanda Tangan Digital. Halaman ini menyiapkan dua area: tempat mengunggah berkas dan kanvas untuk menggambar tanda tangan.',
      'Belum ada data yang dikirim. Halaman hanya siap dipakai, membawa sesi login yang sama.',
    ],
    keyIdea:
      'Semua pekerjaan pengguna terjadi di satu halaman: unggah dulu, baru tanda tangan.',
    moves: [],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Belum ada' },
      { id: 'upload', label: 'Unggahan', text: '—' },
      { id: 'sign', label: 'Tanda tangan', text: '—' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'done',
      sign: 'active',
      oss: 'idle',
      core: 'idle',
      soa: 'idle',
      kms: 'idle',
    },
    reveals: ['sign'],
  },
  {
    id: 'pilih-berkas',
    number: 3,
    label: 'Pilih berkas',
    title: 'Pengguna memilih berkas yang akan ditandatangani',
    narration: [
      'Pengguna menekan tombol pilih berkas dan memilih dokumen, misalnya satu berkas PDF. Halaman menampilkan nama dan ukuran berkas itu.',
      'Halaman memakai unggah langsung: berkas nantinya pergi dari browser ke penyimpanan tanpa mampir di backend. Backend tidak perlu memproses berkas besar.',
    ],
    keyIdea:
      'Halaman memakai unggah langsung: berkas pergi langsung ke penyimpanan.',
    moves: [],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Belum ada' },
      { id: 'upload', label: 'Unggahan', text: 'Langsung ke OSS' },
      { id: 'sign', label: 'Tanda tangan', text: '—' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'done',
      sign: 'active',
      oss: 'idle',
      core: 'idle',
      soa: 'idle',
      kms: 'idle',
    },
    reveals: [],
  },
  {
    id: 'unggah-langsung',
    number: 4,
    label: 'Unggah ke OSS',
    title: 'Berkas terbang langsung ke OSS, signedUrl kembali',
    narration: [
      'Browser mengunggah berkas langsung ke OSS Alibaba, layanan penyimpanan berkas milik Alibaba Cloud. Berkas tidak melewati backend.',
      'Setelah unggahan selesai, OSS membalas dengan signedUrl: alamat berkas yang punya masa berlaku. Yang kembali ke halaman hanya alamatnya, bukan berkasnya.',
    ],
    keyIdea:
      'Unggah langsung menghemat kerja backend; signedUrl adalah alamat yang bisa ditunjuk.',
    moves: [
      {
        from: 'sign',
        to: 'oss',
        kind: 'file',
        durationMs: 900,
        delayMs: 0,
      },
      {
        from: 'oss',
        to: 'sign',
        kind: 'signedUrl',
        durationMs: 700,
        delayMs: 950,
      },
    ],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Terunggah' },
      { id: 'upload', label: 'Unggahan', text: 'Langsung ke OSS' },
      { id: 'sign', label: 'Tanda tangan', text: '—' },
    ],
    nodeStates: {
      login: 'done',
      backend: 'done',
      sign: 'active',
      oss: 'active',
      core: 'idle',
      soa: 'idle',
      kms: 'idle',
    },
    reveals: ['oss'],
  },
  {
    id: 'daftar-dokumen',
    number: 5,
    label: 'Daftar dokumen',
    title: 'Pengguna mengirim data dokumen dan signedUrl ke backend',
    narration: [
      'Permintaan pertama berangkat dari halaman ke backend. Isinya data dokumen — nama, pemilik, jenis berkas — plus signedUrl dari OSS.',
      'Backend mencatat dokumen itu. Tanda tangan belum ikut di permintaan ini; itu permintaan yang terpisah.',
    ],
    keyIdea:
      'Dua permintaan terpisah: yang ini mencatat dokumen, bukan tanda tangannya.',
    moves: [
      {
        from: 'sign',
        to: 'backend',
        kind: 'document',
        durationMs: 800,
        delayMs: 0,
      },
    ],
    metrics: [
      { id: 'doc', label: 'Dokumen', text: 'Terdaftar' },
      { id: 'upload', label: 'Unggahan', text: 'Selesai' },
      { id: 'sign', label: 'Tanda tangan', text: '—' },
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
];
