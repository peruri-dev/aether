# src/modules/common/components

Design system Aether: primitif dan komponen generik. Pengganti Storybook: sebelum membuat komponen baru, cek tabel ini.

## Katalog

| Komponen | File         | Varian / props utama                                                                                                                              | `data-testid` diteruskan ke           | Catatan                                                                 |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| Button   | `button.tsx` | `variant`: primary, secondary, light, ghost, outline, destructive, destructive-outline, destructive-ghost · `isLoading`, `loadingText`, `asChild` | `<button>`, atau child saat `asChild` | Default `type="button"`. Tombol ikon wajib `aria-label`                 |
| Input    | `input.tsx`  | `hasError`, `enableStepper`, `type` (khusus `password` dan `search`), `rightElement`, `inputClassName`                                            | `<input>`                             | `aria-invalid` ikut `hasError`. Toggle sandi pakai `aria-label` dinamis |

## Aturan komponen

- Named export: komponen, varian, dan tipe props (`export { Button, buttonVariants, type ButtonProps }`).
- Varian dengan `tv` dari `@/modules/common/styles/tv`, bukan dari `tailwind-variants` langsung.
- Warna dan radius hanya dari token. Teks di atas warna solid memakai `content-on-brand` / `content-on-negative`.
- Tanpa `forwardRef` dan `displayName`: React 19 menerima `ref` sebagai prop biasa.
- `data-testid` diteruskan lewat `...props` ke elemen interaktif, tanpa prop `testId` (skill `ui-contract`).
- Teks bawaan komponen memakai `text('ID', 'EN')`.
- Setiap komponen punya test di sebelahnya dan satu baris di tabel ini.

## Porting dari project lama

Ikuti checklist di `design-tokens/migration/README.md`, lalu cek tabel perubahan API di bawah.

| Komponen | Lama                                             | Aether                                                      |
| -------- | ------------------------------------------------ | ----------------------------------------------------------- |
| Button   | `variant="destructive2"`                         | `variant="destructive-outline"`                             |
| Button   | `variant="destructive3"`                         | `variant="destructive-ghost"`                               |
| Button   | `variant="glass"`                                | Dihapus. Buat di modul pemakai bila masih perlu             |
| Button   | tanpa `type` = submit                            | tanpa `type` = button. Tulis `type="submit"` di tombol form |
| Input    | "Show password" hardcode EN, tanpa label dinamis | `aria-label` dinamis bilingual (`text('ID', 'EN')`)         |
| Input    | `hasError` tidak mengubah ARIA                   | `aria-invalid` menyala saat `hasError`                      |
