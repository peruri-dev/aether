import type { FlowStep } from '../types/flow';

/**
 * Lima langkah fase login & proteksi (PRD US-004..005): aktivasi selesai,
 * login biasa dengan sesi pra-verifikasi, verifikasi TOTP menuju sesi
 * penuh, ringkasan proteksi akun, dan penutup perjalanan.
 */
export const STEPS_SESI: readonly FlowStep[] = [
  {
    id: 'activated',
    number: 6,
    label: 'Aktivasi',
    title: 'Akun AKTIF, sesi terbatas diakhiri',
    narration: [
      'Admin menekan Selesai. Backend mengubah status akun menjadi AKTIF, mengakhiri sesi terbatas, dan menandai password sementara tidak berlaku lagi.',
      'Admin kembali ke Halaman Login dengan pesan sukses aktivasi — kini memakai password baru dan kode dari aplikasi authenticator.',
    ],
    keyIdea:
      'Aktivasi selalu diakhiri dengan sesi baru. Sesi terbatas yang panjang adalah pintu tersembunyi; mengakhirinya menutup pintu itu.',
    moves: [
      {
        from: 'api',
        to: 'login',
        kind: 'session',
        durationMs: 900,
        delayMs: 0,
      },
    ],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'AKTIF' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: '—' },
    ],
    nodeStates: {
      login: 'active',
      api: 'done',
      password: 'done',
      totp: 'done',
      verify: 'idle',
      dashboard: 'idle',
    },
    reveals: [],
  },
  {
    id: 'regular-login',
    number: 7,
    label: 'Login biasa',
    title: 'Login biasa: password lalu sesi pra-verifikasi',
    narration: [
      'Admin masuk dengan email dan password baru. Backend memeriksa rate limit per IP dan status kunci akun sebelum mencocokkan hash password.',
      'Password benar dan akun AKTIF — backend menerbitkan sesi pra-verifikasi yang hanya berlaku 5 menit dan hanya boleh membuka Verifikasi TOTP.',
    ],
    keyIdea:
      'Dua faktor dipisah dua langkah: sesi pra-verifikasi tidak berharga apa-papa tanpa kode TOTP, dan mati sendiri setelah 5 menit.',
    moves: [
      {
        from: 'login',
        to: 'api',
        kind: 'credentials',
        durationMs: 800,
        delayMs: 0,
      },
    ],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'AKTIF' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: 'PRA-VERIFIKASI 5 MNT' },
    ],
    nodeStates: {
      login: 'active',
      api: 'active',
      password: 'done',
      totp: 'done',
      verify: 'idle',
      dashboard: 'idle',
    },
    reveals: ['verify'],
  },
  {
    id: 'totp-verify',
    number: 8,
    label: 'Verifikasi',
    title: 'Verifikasi TOTP, sesi penuh terbit',
    narration: [
      'Admin memasukkan kode 6 digit dari aplikasi authenticator — atau kode cadangan bila perangkat sedang tidak ada.',
      'Kode valid: backend mengakhiri sesi lain milik akun ini, menerbitkan sesi penuh pada Cookie HttpOnly Secure SameSite, mengatur ulang hitungan gagal, lalu mengarahkan ke Halaman Dashboard Utama.',
    ],
    keyIdea:
      'Satu akun satu sesi aktif. Login di perangkat baru otomatis mengakhiri sesi di perangkat lama.',
    moves: [
      { from: 'verify', to: 'api', kind: 'totp', durationMs: 700, delayMs: 0 },
      {
        from: 'verify',
        to: 'dashboard',
        kind: 'session',
        durationMs: 800,
        delayMs: 700,
      },
    ],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'AKTIF' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: 'PENUH · IDLE 30 MNT' },
    ],
    nodeStates: {
      login: 'done',
      api: 'active',
      password: 'done',
      totp: 'done',
      verify: 'active',
      dashboard: 'active',
    },
    reveals: ['dashboard'],
  },
  {
    id: 'protection',
    number: 9,
    label: 'Proteksi',
    title: 'Proteksi akun: lockout, rate limit, pesan umum',
    narration: [
      'Lima kali salah — password maupun kode — mengunci akun 30 menit, dan lockout-nya berlaku sama untuk email terdaftar maupun tidak. Satu IP maksimal 10 percobaan login per menit.',
      'Semua penolakan memakai pesan umum "Email atau password salah" dengan waktu respons yang seragam, sehingga keberadaan sebuah email tidak bisa ditebak dari respons sistem.',
    ],
    keyIdea:
      'Proteksi mengukur kegagalan, bukan identitas. Pesan yang sama untuk semua orang membuat enumerasi akun tidak berguna.',
    moves: [],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'AKTIF' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: 'PENUH · IDLE 30 MNT' },
    ],
    nodeStates: {
      login: 'done',
      api: 'done',
      password: 'done',
      totp: 'done',
      verify: 'done',
      dashboard: 'done',
    },
    reveals: [],
  },
  {
    id: 'summary',
    number: 10,
    label: 'Ringkasan',
    title: 'Perjalanan selesai: dari password sementara ke sesi penuh',
    narration: [
      'Satu putaran aktivasi: password sementara dipakai sekali, password baru dibuat admin, TOTP terdaftar, kode cadangan tersimpan, dan sesi penuh diterbitkan di Halaman Dashboard Utama.',
      'Bila suatu hari password lupa atau perangkat hilang, jalurnya bertingkat: lupa password lewat email, kode cadangan, Reset Akses oleh admin lain, dan tim delivery sebagai jalur terakhir.',
    ],
    keyIdea:
      'Setiap langkah menambah satu lapisan: siapa yang tahu password, siapa yang pegang perangkat, dan siapa yang bisa memulihkan akses.',
    moves: [],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'AKTIF' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: 'PENUH · IDLE 30 MNT' },
    ],
    nodeStates: {
      login: 'done',
      api: 'done',
      password: 'done',
      totp: 'done',
      verify: 'done',
      dashboard: 'done',
    },
    reveals: [],
  },
];
