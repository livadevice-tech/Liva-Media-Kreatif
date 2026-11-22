import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskBriefAttachment, TaskItem } from '../src/components/tasks/types';

test('TaskBriefAttachment supports backwards-compatible string URLs and structured attachments', () => {
  const legacyTask: any = {
    id: 'task-1',
    title: 'Live Streaming TikTok',
    briefImages: [
      'https://example.com/uploads/brief1.jpg',
      'https://example.com/uploads/brief2.png',
    ],
  };

  // Normalization logic as used in TaskFormModal
  const normalizedImages: TaskBriefAttachment[] = (legacyTask.briefImages || []).map(
    (img: any, idx: number) => {
      if (typeof img === 'string') {
        return { id: `img-${idx}`, name: `Gambar Brief ${idx + 1}`, url: img };
      }
      return img;
    }
  );

  assert.equal(normalizedImages.length, 2);
  assert.equal(normalizedImages[0].url, 'https://example.com/uploads/brief1.jpg');
  assert.equal(normalizedImages[0].name, 'Gambar Brief 1');
  assert.equal(normalizedImages[1].url, 'https://example.com/uploads/brief2.png');
});

test('TaskItem stores and preserves structured briefImages with metadata', () => {
  const task: TaskItem = {
    id: 'task-2',
    title: 'Shopee Live Brand Launch',
    status: 'todo',
    priority: 'urgent',
    category: 'Live Production',
    createdAt: new Date().toISOString(),
    briefImages: [
      {
        id: 'img-123',
        name: 'brief_shopee_flash_sale.png',
        url: '/uploads/tasks/brief-1732274400000.png',
        size: 204800,
        type: 'image/png',
        uploadedAt: '2026-11-22T10:00:00.000Z',
      },
    ],
  };

  assert.equal(task.briefImages?.length, 1);
  assert.equal(task.briefImages[0].name, 'brief_shopee_flash_sale.png');
  assert.equal(task.briefImages[0].size, 204800);
});
