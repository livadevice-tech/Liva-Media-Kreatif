import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPasswordForStorage, verifyStoredPassword } from '../server/auth';

test('hashPasswordForStorage and verifyStoredPassword works with scrypt', () => {
  const plain = 'KatasandiAdmin123!';
  const hash = hashPasswordForStorage(plain);

  assert.ok(hash.startsWith('scrypt:'));
  assert.equal(verifyStoredPassword(plain, hash), true);
  assert.equal(verifyStoredPassword('WrongPassword', hash), false);
});

test('admin plain_password fallback and preservation', () => {
  interface AdminTestAccount {
    id: string;
    name: string;
    username: string;
    plain_password?: string | null;
    password_hash?: string | null;
    password?: string;
    hasPassword?: boolean;
  }

  const row: AdminTestAccount = {
    id: 'admin-1',
    name: 'masteradmin',
    username: 'masteradmin',
    plain_password: 'RahasiaAdmin2026',
    password_hash: hashPasswordForStorage('RahasiaAdmin2026'),
  };

  // Logic used in server/routes/client.ts
  const adminDto = {
    ...row,
    password: row.plain_password || '',
    hasPassword: Boolean(row.password_hash || row.plain_password),
  };
  delete adminDto.plain_password;
  delete adminDto.password_hash;

  assert.equal(adminDto.password, 'RahasiaAdmin2026');
  assert.equal(adminDto.hasPassword, true);
});
