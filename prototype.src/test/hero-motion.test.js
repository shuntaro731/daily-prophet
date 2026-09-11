import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_MORPH_OPTIONS, createHeroMorph } from '../lib/hero-motion.js';

test('KUTE.jsにSVGモーフの設定を渡せる', () => {
	const ellipse = { id: 'ellipse' };
	const form = { id: 'form' };
	let received;
	const kute = {
		fromTo(...args) {
			received = args;
			return { start() {} };
		},
	};

	createHeroMorph(kute, ellipse, form);

	assert.equal(received[0], ellipse);
	assert.deepEqual(received[1], { path: ellipse });
	assert.deepEqual(received[2], { path: form });
	assert.deepEqual(received[3], HERO_MORPH_OPTIONS);
});

test('生成したモーフを開始できる', () => {
	let started = false;
	const tween = { start() { started = true; } };
	const kute = { fromTo: () => tween };

	createHeroMorph(kute, {}, {}).start();

	assert.equal(started, true);
});
