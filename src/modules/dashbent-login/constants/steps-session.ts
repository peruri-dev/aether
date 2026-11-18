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
    title: 'Akun AKTIF, sesi terbatas berakhir',
    narration: [
      'Admin menekan Selesai. Backend mengubah status akun menjadi AKTIF, mengakhiri sesi terbatas, dan menandai password sementara sudah tidak berlaku.',
      'Admin kembali ke Halaman Login dengan pesan sukses aktivasi. Selanjutnya admin masuk dengan password baru dan kode dari aplikasi authenticator.',
    ],
    keyIdea:
      'Aktivasi selalu diakhiri dengan sesi baru. Sesi terbatas tidak dibiarkan hidup lama supaya tidak bisa disalahgunakan.',
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
      { id: 'status', label: 'Status akun', text: 'AKTIF' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: '—' },
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
      'Admin masuk dengan email dan password baru. Backend memeriksa batas percobaan per IP dan status kunci akun dulu, baru mencocokkan hash password.',
      'Password benar dan akun berstatus AKTIF. Backend menerbitkan sesi pra-verifikasi: hanya berlaku 5 menit dan hanya boleh membuka halaman Verifikasi TOTP.',
    ],
    keyIdea:
      'Dua faktor dipisah dua langkah. Sesi pra-verifikasi tidak bisa dipakai apa-apa tanpa kode TOTP, dan berhenti sendiri setelah 5 menit.',
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
      { id: 'status', label: 'Status akun', text: 'AKTIF' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: 'Pra-verifikasi · 5 menit' },
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
    title: 'Verifikasi TOTP membuka sesi penuh',
    narration: [
      'Admin memasukkan kode 6 digit dari aplikasi authenticator. Kalau perangkat tidak ada, admin memakai kode cadangan.',
      'Kode valid. Backend mengakhiri semua sesi lain milik akun ini, lalu menerbitkan sesi penuh pada cookie HttpOnly Secure SameSite. Hitungan gagal ikut diatur ulang. Admin diarahkan ke Halaman Dashboard Utama. Sesi berhenti sendiri setelah 30 menit tanpa aktivitas, dengan peringatan dulu.',
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
      { id: 'status', label: 'Status akun', text: 'AKTIF' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: 'Penuh · 30 menit' },
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
    title: 'Login gagal: akun terkunci, batas percobaan, pesan sama',
    narration: [
      'Salah memasukkan password atau kode lima kali mengunci akun selama 30 menit. Kuncinya berlaku sama untuk email terdaftar maupun tidak terdaftar. Satu IP boleh mencoba login maksimal 10 kali per menit.',
      'Setiap penolakan memakai pesan yang sama: "Email atau password salah". Waktu responsnya juga dibuat sama, sehingga ada atau tidaknya sebuah email tidak bisa ditebak dari respons sistem.',
    ],
    keyIdea:
      'Proteksi menghitung kegagalan, bukan identitas. Pesan yang sama untuk semua orang membuat menebak email terdaftar (enumerasi akun) tidak berguna.',
    moves: [],
    metrics: [
      { id: 'status', label: 'Status akun', text: 'AKTIF' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: 'Penuh · 30 menit' },
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
    title: 'Dari password sementara ke sesi penuh',
    narration: [
      'Satu putaran aktivasi selesai: password sementara dipakai sekali, password baru dibuat oleh admin, TOTP terdaftar, kode cadangan tersimpan, dan sesi penuh terbuka di Halaman Dashboard Utama.',
      'Kalau kelak password lupa atau perangkat hilang, pemulihan tersedia berlapis: reset password lewat email, kode cadangan, Reset Akses oleh admin lain, dan tim delivery sebagai pilihan terakhir.',
    ],
    keyIdea:
      'Setiap langkah menambah satu lapisan proteksi: siapa yang tahu password, siapa yang pegang perangkat, dan siapa yang bisa memulihkan akses.',
    moves: [],
    metrics: [
      { id: 'status', label: 'Status akun', text: 'AKTIF' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: 'Penuh · 30 menit' },
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
