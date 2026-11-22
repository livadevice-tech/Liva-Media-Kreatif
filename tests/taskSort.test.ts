import test from 'node:test';
import assert from 'node:assert/strict';

interface MockTask {
  id: string;
  title: string;
  priority: string;
  deadline?: string;
  checklist?: { isDone: boolean }[];
  fileLinks?: string[];
  briefImages?: string[];
}

const priorityWeight: Record<string, number> = {
  urgent: 4,
  high: 3,
  moderate: 2,
  normal: 2,
  medium: 2,
  low: 1,
};

test('task sorting by deadline asc places earliest first and empty deadlines last', () => {
  const tasks: MockTask[] = [
    { id: '1', title: 'Task Late', priority: 'low', deadline: '2026-11-25' },
    { id: '2', title: 'Task Early', priority: 'high', deadline: '2026-11-20' },
    { id: '3', title: 'Task No Deadline', priority: 'urgent' },
  ];

  const sortedAsc = [...tasks].sort((a, b) => {
    const dateA = a.deadline || '';
    const dateB = b.deadline || '';
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.localeCompare(dateB);
  });

  assert.equal(sortedAsc[0].id, '2'); // 2026-11-20 first
  assert.equal(sortedAsc[1].id, '1'); // 2026-11-25 second
  assert.equal(sortedAsc[2].id, '3'); // No deadline last
});

test('task sorting by priority desc places urgent first', () => {
  const tasks: MockTask[] = [
    { id: '1', title: 'Low', priority: 'low' },
    { id: '2', title: 'Urgent', priority: 'urgent' },
    { id: '3', title: 'High', priority: 'high' },
  ];

  const sortedDesc = [...tasks].sort((a, b) => {
    const wA = priorityWeight[a.priority] || 0;
    const wB = priorityWeight[b.priority] || 0;
    return wB - wA; // desc
  });

  assert.equal(sortedDesc[0].id, '2'); // urgent
  assert.equal(sortedDesc[1].id, '3'); // high
  assert.equal(sortedDesc[2].id, '1'); // low
});

test('task sorting by progress asc and desc works properly', () => {
  const tasks: MockTask[] = [
    { id: '1', title: 'Half', priority: 'normal', checklist: [{ isDone: true }, { isDone: false }] }, // 50%
    { id: '2', title: 'Done', priority: 'normal', checklist: [{ isDone: true }, { isDone: true }] }, // 100%
    { id: '3', title: 'Empty', priority: 'normal', checklist: [] }, // 0%
  ];

  const getProg = (t: MockTask) => {
    const total = t.checklist?.length || 0;
    if (total === 0) return 0;
    const done = t.checklist?.filter(c => c.isDone).length || 0;
    return (done / total) * 100;
  };

  const sortedAsc = [...tasks].sort((a, b) => getProg(a) - getProg(b));
  assert.equal(sortedAsc[0].id, '3'); // 0%
  assert.equal(sortedAsc[1].id, '1'); // 50%
  assert.equal(sortedAsc[2].id, '2'); // 100%

  const sortedDesc = [...tasks].sort((a, b) => getProg(b) - getProg(a));
  assert.equal(sortedDesc[0].id, '2'); // 100%
  assert.equal(sortedDesc[1].id, '1'); // 50%
  assert.equal(sortedDesc[2].id, '3'); // 0%
});
