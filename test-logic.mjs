import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dataContent = fs.readFileSync('src/data.ts', 'utf-8');

// I'll just grab checkInTime string logic instead of parsing TS
const shiftHours = "13:00 - 17:00";
const date = "2026-08-01";
const checkInTime = "12:56:12";
const shiftStartStr = shiftHours.split(' - ')[0];
const shiftDate = new Date(`${date}T${shiftStartStr}:00`);
const checkInDate = new Date(`${date}T${checkInTime}`);
const diffMs = shiftDate.getTime() - checkInDate.getTime();
const diffMins = Math.round(diffMs / 60000);
console.log({shiftStartStr, shiftDate, checkInDate, diffMins});
