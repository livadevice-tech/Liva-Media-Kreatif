import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTaskImageUrl } from '../src/components/tasks/taskStorage';

test('normalizeTaskImageUrl handles legacy /uploads/tasks/ paths', () => {
  const input = '/uploads/tasks/brief-1732345678-123456789.jpeg';
  const expected = '/api/tasks/brief-images/brief-1732345678-123456789.jpeg';
  assert.equal(normalizeTaskImageUrl(input), expected);
});

test('normalizeTaskImageUrl handles relative uploads/tasks/ paths', () => {
  const input = 'uploads/tasks/brief-999.png';
  const expected = '/api/tasks/brief-images/brief-999.png';
  assert.equal(normalizeTaskImageUrl(input), expected);
});

test('normalizeTaskImageUrl handles /api/uploads/tasks/ paths', () => {
  const input = '/api/uploads/tasks/brief-abc.webp';
  const expected = '/api/tasks/brief-images/brief-abc.webp';
  assert.equal(normalizeTaskImageUrl(input), expected);
});

test('normalizeTaskImageUrl keeps Base64 data URLs untouched', () => {
  const input = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
  assert.equal(normalizeTaskImageUrl(input), input);
});

test('normalizeTaskImageUrl keeps external HTTP and HTTPS URLs untouched', () => {
  const input = 'https://images.unsplash.com/photo-123456789';
  assert.equal(normalizeTaskImageUrl(input), input);
});

test('normalizeTaskImageUrl handles empty or undefined inputs gracefully', () => {
  assert.equal(normalizeTaskImageUrl(''), '');
  assert.equal(normalizeTaskImageUrl(undefined), '');
  assert.equal(normalizeTaskImageUrl(null), '');
});

