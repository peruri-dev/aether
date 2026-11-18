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
    label: 'Buat akun',
    title: 'Akun admin klien lahir di CMP',
    narration: [
      'Tim delivery Peruri membuat klien, SystemID, dan akun admin pertama di Client Management Portal (CMP). Proses ini disebut provisioning. CMP mengirim data itu ke Dashbent lewat API.',
      'Password sementara dibuat di CMP dan diserahkan langsung oleh tim delivery kepada admin klien. Dashbent hanya menyimpan hash-nya. Password ini hanya berlaku untuk login pertama.',
    ],
    keyIdea:
      'Tidak ada pendaftaran sendiri. Akun baru hanya bisa lahir dari provisioning CMP, sehingga asal-usul setiap akun selalu jelas.',
    moves: [],
    metrics: [
      { id: 'status', label: 'Status akun', text: 'MENUNGGU_AKTIVASI' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: '—' },
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
      'Admin membuka Halaman Login, mengisi email dan password sementara, lalu menekan Masuk. Backend mencocokkan hash password dan membaca status akun: MENUNGGU_AKTIVASI.',
      'Karena itu, backend menerbitkan sesi terbatas. Sesi ini hanya boleh membuka Halaman Ganti Password Wajib dan Keluar. Endpoint lain ditolak.',
    ],
    keyIdea:
      'Satu Halaman Login untuk semua status. Backend yang menentukan langkah berikutnya; frontend hanya menampilkan hasilnya.',
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
      { id: 'status', label: 'Status akun', text: 'MENUNGGU_AKTIVASI' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: 'Terbatas' },
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
      'Admin wajib membuat password sendiri. Panjangnya 12 hingga 128 karakter, dengan huruf besar, huruf kecil, angka, dan simbol. Halaman menandai setiap aturan satu per satu. Password baru tidak boleh sama dengan password sementara.',
      'Backend memeriksa ulang semua aturan, menyimpan hash password baru dengan argon2 atau bcrypt, lalu mengubah status akun menjadi MENUNGGU_TOTP. Semua terjadi dalam satu transaksi.',
    ],
    keyIdea:
      'Setelah langkah ini, hanya admin yang tahu password barunya. Tim delivery tidak pernah mengetahui password itu.',
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
      { id: 'status', label: 'Status akun', text: 'MENUNGGU_TOTP' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: 'Terbatas' },
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
    title: 'Mendaftarkan TOTP dengan memindai QR',
    narration: [
      'Backend membuat secret TOTP baru, lalu menampilkannya sebagai QR code plus kunci manual. Admin memindai QR dengan Google Authenticator atau aplikasi sejenis.',
      'Admin memasukkan kode 6 digit dari aplikasi authenticator. Backend menerima kode dari periode waktu ini, plus satu periode sebelum dan sesudahnya. Setiap kode hanya bisa dipakai sekali.',
    ],
    keyIdea:
      'TOTP (RFC 6238) wajib untuk semua pengguna. Email dan password saja tidak cukup; pemilik akun juga harus punya perangkat authenticator.',
    moves: [
      { from: 'totp', to: 'api', kind: 'totp', durationMs: 800, delayMs: 0 },
    ],
    metrics: [
      { id: 'status', label: 'Status akun', text: 'MENUNGGU_TOTP' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: 'Terbatas' },
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
    title: '10 kode cadangan, tampil hanya sekali',
    narration: [
      'Verifikasi berhasil. Sistem menerbitkan 10 kode cadangan sekali pakai. Kode hanya tampil di layar ini, lengkap dengan tombol Salin dan Unduh.',
      'Admin harus mencentang "Saya sudah menyimpan kode cadangan" sebelum tombol Selesai aktif. Kode disimpan sebagai hash, bukan teks asli.',
    ],
    keyIdea:
      'Kode cadangan menyelamatkan akses saat perangkat hilang. Satu kode terpakai memaksa pendaftaran ulang TOTP, lalu sistem mengganti seluruh kodenya.',
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
      { id: 'status', label: 'Status akun', text: 'MENUNGGU_TOTP' },
      { id: 'failed', label: 'Percobaan gagal', text: '0/5' },
      { id: 'session', label: 'Sesi', text: 'Terbatas' },
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
