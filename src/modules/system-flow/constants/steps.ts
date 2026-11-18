import { parseStepParam as parseStepNumber } from '@/modules/common/lesson/utils';

import type { FlowStep } from '../types/flow';

/**
 * Enam langkah sederhana alur request:
 * pengguna membuka website → browser render → request ke server →
 * server query database → database balas data → response kembali ke UI.
 * Sumber tunggal copy pelajaran; semua komponen membaca dari sini.
 */
export const STEPS: readonly FlowStep[] = [
  {
    id: 'open-site',
    number: 1,
    label: 'Buka situs',
    title: 'Kamu membuka sebuah website',
    narration: [
      'Kamu mengetik shop.example di address bar lalu menekan Enter. Browser ' +
        'menerjemahkan nama domain menjadi alamat IP lewat proses DNS lookup, lalu ' +
        'menyiapkan koneksi ke server aplikasi.',
      'Kamera fokus ke satu titik: browser kamu. Setiap langkah berikutnya akan ' +
        'menambah satu stasiun ke diorama, mengikuti perjalanan request.',
    ],
    keyIdea:
      'Kunjungan halaman selalu dimulai dari browser, bukan dari server. ' +
      'Server tidak pernah menebak — ia hanya menjawab.',
    moves: [],
    metrics: [
      { id: 'dns', label: 'DNS LOOKUP', valueMs: 24 },
      { id: 'connect', label: 'CONNECT', valueMs: 38 },
    ],
    nodeStates: {
      user: 'active',
      app: 'idle',
      server: 'idle',
      database: 'idle',
    },
    reveals: ['user'],
  },
  {
    id: 'render-shell',
    number: 2,
    label: 'Render halaman',
    title: 'Browser merender kerangka halaman',
    narration: [
      'Website muncul di diorama: browser dan server aplikasi "berjabat tangan" ' +
        '(handshake) untuk memastikan keduanya siap berbicara, lalu browser langsung ' +
        'menggambar kerangka halaman berupa skeleton abu-abu.',
      'Halaman terasa cepat karena pengguna melihat sesuatu segera. Di belakang ' +
        'layar, request sudah disusun: method GET, path /api/products, header, dan ' +
        'query parameter. Request ini belum dikirim.',
    ],
    keyIdea:
      'Render tidak menunggu data. Skeleton memberi kesan cepat dan menahan ' +
      'kesabaran pengguna selama request berjalan.',
    moves: [
      {
        from: 'user',
        to: 'app',
        kind: 'handshake',
        durationMs: 900,
        delayMs: 0,
      },
    ],
    metrics: [{ id: 'render', label: 'RENDER', valueMs: 52 }],
    nodeStates: {
      user: 'done',
      app: 'active',
      server: 'idle',
      database: 'idle',
    },
    reveals: ['app'],
  },
  {
    id: 'send-request',
    number: 3,
    label: 'Request',
    title: 'Request berangkat ke server',
    narration: [
      'Browser mengirim request HTTP: GET /api/products?page=1. Packet bergerak ' +
        'dari browser ke aplikasi, lalu diteruskan ke server API.',
      'Server menerima packet, memeriksa header dan credential, lalu memutuskan ' +
        'data apa yang harus diambil.',
    ],
    keyIdea:
      'Request membawa seluruh konteks yang server butuhkan: method, path, ' +
      'header, dan parameter. Server tidak menyimpan state tentang kamu.',
    moves: [
      { from: 'user', to: 'app', kind: 'request', durationMs: 700, delayMs: 0 },
      {
        from: 'app',
        to: 'server',
        kind: 'request',
        durationMs: 700,
        delayMs: 700,
      },
    ],
    metrics: [{ id: 'ttfb', label: 'REQUEST + SERVER', valueMs: 87 }],
    nodeStates: {
      user: 'done',
      app: 'active',
      server: 'active',
      database: 'idle',
    },
    reveals: ['server'],
  },
  {
    id: 'db-query',
    number: 4,
    label: 'Query',
    title: 'Server menanyakan database',
    narration: [
      'Server tidak menyimpan data produk. Ia menerjemahkan request menjadi satu ' +
        'query SQL: SELECT … FROM products WHERE aktif = true.',
      'Query dikirim ke database, yang membaca index dan mencari baris yang cocok.',
    ],
    keyIdea:
      'Server dan database dipisah agar masing-masing bisa diskalakan ' +
      'sendiri: server menghitung, database menyimpan.',
    moves: [
      {
        from: 'server',
        to: 'database',
        kind: 'request',
        durationMs: 900,
        delayMs: 0,
      },
    ],
    metrics: [{ id: 'query', label: 'DB QUERY', valueMs: 45 }],
    nodeStates: {
      user: 'done',
      app: 'done',
      server: 'active',
      database: 'active',
    },
    reveals: ['database'],
  },
  {
    id: 'db-reply',
    number: 5,
    label: 'Data',
    title: 'Database mengembalikan data',
    narration: [
      'Database menjawab dengan hasil query: daftar produk berupa baris data, plus ' +
        'metadata waktu eksekusi.',
      'Server mengubah baris mentah itu menjadi JSON yang siap dipakai aplikasi, ' +
        'lalu menyiapkan response.',
    ],
    keyIdea:
      'Database mengembalikan baris, bukan halaman. Serialisasi ke JSON ' +
      'terjadi di server, sehingga format API tetap stabil.',
    moves: [
      {
        from: 'database',
        to: 'server',
        kind: 'response',
        durationMs: 900,
        delayMs: 0,
      },
    ],
    metrics: [{ id: 'fetch', label: 'DB FETCH', valueMs: 18 }],
    nodeStates: {
      user: 'done',
      app: 'done',
      server: 'active',
      database: 'done',
    },
    reveals: [],
  },
  {
    id: 'ui-update',
    number: 6,
    label: 'Response',
    title: 'Response kembali, halaman terisi',
    narration: [
      'Server mengirim response HTTP 200 dengan body JSON. Status 200 berarti ' +
        'sukses; 404 dan 500 adalah cara server mengatakan ada masalah.',
      'Browser menerima data, mengganti skeleton dengan konten nyata, dan halaman ' +
        'akhirnya interaktif.',
    ],
    keyIdea:
      'Satu putaran request–response selesai dalam ratusan milidetik. Total ' +
      'waktu adalah jumlah semua hop, bukan hanya server yang paling lambat.',
    moves: [
      {
        from: 'server',
        to: 'app',
        kind: 'response',
        durationMs: 700,
        delayMs: 0,
      },
      {
        from: 'app',
        to: 'user',
        kind: 'response',
        durationMs: 700,
        delayMs: 700,
      },
    ],
    metrics: [{ id: 'download', label: 'DOWNLOAD', valueMs: 21 }],
    nodeStates: { user: 'done', app: 'done', server: 'done', database: 'done' },
    reveals: [],
  },
];

/** Jumlah seluruh metric, tampil sebagai tile TOTAL di langkah terakhir. */
export const TOTAL_MS = STEPS.reduce(
  (sum, step) =>
    sum + step.metrics.reduce((acc, metric) => acc + metric.valueMs, 0),
  0,
);

export const LAST_STEP_INDEX = STEPS.length - 1;

/** Ambil langkah dengan indeks yang sudah di-clamp, tanpa nilai undefined. */
export function getStep(index: number): FlowStep {
  const clamped = Math.min(Math.max(index, 0), LAST_STEP_INDEX);
  const step = STEPS[clamped];
  if (!step) {
    throw new Error(`Langkah pada indeks ${clamped} tidak ada`);
  }
  return step;
}

/**
 * Parse param path langkah (mis. "3" dari /system-flow/3) menjadi nomor
 * langkah. null berarti tidak valid — halaman .astro menjawab 404.
 * Aturan parsing bersama ada di common/lesson.
 */
export function parseStepParam(raw: string | undefined): number | null {
  return parseStepNumber(raw, STEPS.length);
}

/** Jeda autoplay satu langkah: rantai hop terlama + waktu baca. */
export function stepPaceMs(step: FlowStep): number {
  const moveMs = Math.max(
    0,
    ...step.moves.map((move) => move.durationMs + move.delayMs),
  );
  return moveMs + 1500;
}
