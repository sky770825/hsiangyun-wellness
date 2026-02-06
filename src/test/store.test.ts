/**
 * 後台 store 讀寫測試（預約、CRM 等）
 * 使用 in-memory localStorage 模擬
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadBookings,
  saveBookings,
  loadCRM,
  saveCRM,
  generateId,
} from '@/admin/store';

describe('admin store', () => {
  const fakeStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => fakeStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        fakeStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete fakeStorage[key];
      },
      clear: () => {
        Object.keys(fakeStorage).forEach((k) => delete fakeStorage[k]);
      },
      length: 0,
      key: () => null,
    });
  });

  describe('bookings', () => {
    it('無資料時 loadBookings 回傳空陣列', () => {
      expect(loadBookings()).toEqual([]);
    });

    it('saveBookings 後 loadBookings 可讀回相同資料', () => {
      const items = [
        {
          id: '1',
          name: 'A',
          email: 'a@b.com',
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      saveBookings(items);
      expect(loadBookings()).toEqual(items);
    });
  });

  describe('CRM', () => {
    it('無資料時 loadCRM 回傳空陣列', () => {
      expect(loadCRM()).toEqual([]);
    });

    it('saveCRM 後 loadCRM 可讀回相同資料', () => {
      const students = [
        {
          id: 's1',
          name: '學員一',
          email: 's1@test.com',
          source: 'booking' as const,
          status: 'following' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      saveCRM(students);
      expect(loadCRM()).toEqual(students);
    });
  });

  describe('generateId', () => {
    it('回傳非空字串', () => {
      expect(generateId().length).toBeGreaterThan(0);
    });

    it('每次回傳不同', () => {
      const a = generateId();
      const b = generateId();
      expect(a).not.toBe(b);
    });
  });
});
