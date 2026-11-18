import type { FlowStep } from '../types/flow';

/**
 * Lima langkah fase aktivasi (PRD US-001..003): akun provisioning dari
 * CMP, login awal dengan password sementara, ganti password wajib,
 * pendaftaran TOTP, dan penerbitan kode cadangan.
 */
export const STEPS_AKTIVASI: readonly FlowStep[] = [
  {
    id: 'provisioning',
    number: 1,
    label: 'Provisioning',
    title: 'Akun admin klien lahir di CMP',
    narration: [
      'Tim delivery Peruri membuat klien, SystemID, dan akun admin pertama di Client Management Portal. CMP mengirim data itu ke Dashbent lewat API push dan menerbitkan password sementara.',
      'Password sementara diserahkan langsung kepada admin klien. Dashbent hanya menyimpan hash-nya, dan password ini hanya berlaku untuk login awal.',
    ],
    keyIdea:
      'Tidak ada registrasi mandiri. Satu-satunya pintu masuk akun baru adalah provisioning dari CMP, sehingga setiap akun bisa ditelusuri asal-usulnya.',
    moves: [],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'MENUNGGU_AKTIVASI' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: '—' },
    ],
    nodeStates: {
      login: 'active',
      api: 'idle',
      password: 'idle',
      totp: 'idle',
      verify: 'idle',
      dashboard: 'idle',
    },
    reveals: ['login'],
  },
  {
    id: 'initial-login',
    number: 2,
    label: 'Login awal',
    title: 'Login awal dengan password sementara',
    narration: [
      'Admin membuka Halaman Login, mengisi email dan password sementara, lalu menekan Masuk. Backend mencocokkan hash password lalu membaca status akun: MENUNGGU_AKTIVASI.',
      'Karena statusnya begitu, backend menerbitkan sesi terbatas — hanya boleh membuka Halaman Ganti Password Wajib dan Keluar. Endpoint lain ditolak.',
    ],
    keyIdea:
      'Satu Halaman Login untuk semua status. Backend yang memutuskan langkah berikutnya; frontend hanya menampilkan hasilnya.',
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
      { id: 'status', label: 'STATUS AKUN', text: 'MENUNGGU_AKTIVASI' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: 'TERBATAS' },
    ],
    nodeStates: {
      login: 'active',
      api: 'active',
      password: 'idle',
      totp: 'idle',
      verify: 'idle',
      dashboard: 'idle',
    },
    reveals: ['api'],
  },
  {
    id: 'mandatory-password',
    number: 3,
    label: 'Ganti password',
    title: 'Ganti password wajib sesuai standar IDDS',
    narration: [
      'Admin wajib membuat password sendiri: 12–128 karakter dengan huruf besar, huruf kecil, angka, dan simbol. Aturan ditandai satu per satu, dan password baru tidak boleh sama dengan password sementara.',
      'Backend memvalidasi ulang semuanya, menyimpan hash argon2/bcrypt, lalu mengubah status akun menjadi MENUNGGU_TOTP dalam satu transaksi.',
    ],
    keyIdea:
      'Setelah langkah ini, tim delivery tidak lagi mengetahui password admin. Pengetahuan kredensial kembali sepenuhnya ke pemilik akun.',
    moves: [
      {
        from: 'password',
        to: 'api',
        kind: 'credentials',
        durationMs: 800,
        delayMs: 0,
      },
    ],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'MENUNGGU_TOTP' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: 'TERBATAS' },
    ],
    nodeStates: {
      login: 'done',
      api: 'active',
      password: 'active',
      totp: 'idle',
      verify: 'idle',
      dashboard: 'idle',
    },
    reveals: ['password'],
  },
  {
    id: 'totp-enroll',
    number: 4,
    label: 'Daftar TOTP',
    title: 'Pendaftaran TOTP: memindai QR',
    narration: [
      'Backend membuat secret TOTP baru dan menampilkannya sebagai QR code plus kunci manual. Admin memindainya dengan Google Authenticator atau aplikasi sejenis.',
      'Admin memasukkan kode 6 digit dari aplikasi. Backend menerima kode dari langkah waktu saat ini plus satu langkah sebelum dan sesudahnya, dan setiap kode hanya bisa dipakai sekali.',
    ],
    keyIdea:
      'TOTP RFC 6238 wajib untuk semua user. Email dan password saja tidak cukup membuka akun — pelaku harus punya perangkat authenticator-nya.',
    moves: [
      { from: 'totp', to: 'api', kind: 'totp', durationMs: 800, delayMs: 0 },
    ],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'MENUNGGU_TOTP' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: 'TERBATAS' },
    ],
    nodeStates: {
      login: 'done',
      api: 'active',
      password: 'done',
      totp: 'active',
      verify: 'idle',
      dashboard: 'idle',
    },
    reveals: ['totp'],
  },
  {
    id: 'recovery-codes',
    number: 5,
    label: 'Kode cadangan',
    title: 'Sepuluh kode cadangan, hanya sekali tampil',
    narration: [
      'Verifikasi berhasil, sistem menerbitkan 10 kode cadangan sekali pakai — ditampilkan hanya pada layar ini, dengan tombol Salin dan Unduh.',
      'Admin harus mencentang "Saya sudah menyimpan kode cadangan" sebelum tombol Selesai aktif. Kode disimpan sebagai hash, bukan teks asli.',
    ],
    keyIdea:
      'Kode cadangan adalah jaring pengaman saat perangkat hilang. Memakai satu kode memaksa pendaftaran ulang TOTP dan mengganti seluruh set kode.',
    moves: [
      {
        from: 'api',
        to: 'totp',
        kind: 'recovery',
        durationMs: 900,
        delayMs: 0,
      },
    ],
    metrics: [
      { id: 'status', label: 'STATUS AKUN', text: 'MENUNGGU_TOTP' },
      { id: 'failed', label: 'PERCOBAAN GAGAL', text: '0/5' },
      { id: 'session', label: 'SESI', text: 'TERBATAS' },
    ],
    nodeStates: {
      login: 'done',
      api: 'active',
      password: 'done',
      totp: 'active',
      verify: 'idle',
      dashboard: 'idle',
    },
    reveals: [],
  },
];
