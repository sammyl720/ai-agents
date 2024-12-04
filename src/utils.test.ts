import { add } from './utils.js';
import { test, expect } from 'vitest';

test('add', () => {
	expect(add(1, 2)).toBe(3);
});

test('add multiple', () => {
	expect(add(4, add(5, 6))).toBe(15);
});
