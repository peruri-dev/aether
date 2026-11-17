import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Tanpa globals: true di vitest, auto-cleanup Testing Library tidak jalan sendiri.
afterEach(cleanup);
