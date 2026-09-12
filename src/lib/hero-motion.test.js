import test from 'node:test';
import assert from 'node:assert/strict';
import {
	createHeroMorph,
	createHeroMotionController,
	HERO_MORPH_OPTIONS,
} from './hero-motion.js';

test('KUTE.jsに指定時間・easing・精度でSVGモーフを渡す', () => {
	const ellipse = { id: 'ellipse' };
	const form = { id: 'form' };
	let received;
	const kute = { fromTo(...args) { received = args; return { start() {} }; } };

	createHeroMorph(kute, ellipse, form);

	assert.equal(received[0], ellipse);
	assert.deepEqual(received[1], { path: ellipse });
	assert.deepEqual(received[2], { path: form });
	assert.deepEqual(received[3], { duration: 1000, easing: 'easingCubicOut', morphPrecision: 8 });
	assert.deepEqual(HERO_MORPH_OPTIONS, received[3]);
});

test('開く前のリサイズでは最新viewportのフォームとTweenを準備する', () => {
	let viewport = { width: 1440, height: 900 };
	const paths = [];
	const tweens = [];
	const form = { setAttribute(name, value) { paths.push([name, value]); } };
	const kute = { fromTo(...args) { const tween = { args, starts: 0, start() { this.starts += 1; } }; tweens.push(tween); return tween; } };
	const motion = createHeroMotionController({ kute, ellipse: {}, form, getViewport: () => viewport });

	viewport = { width: 390, height: 844 };
	motion.resize();

	assert.equal(paths.length, 2);
	assert.notEqual(paths[0][1], paths[1][1]);
	assert.equal(tweens.length, 2);
});

test('開いた後はTweenを一度だけ開始しリサイズしても再生成しない', () => {
	let viewport = { width: 1440, height: 900 };
	const tweens = [];
	const kute = { fromTo() { const tween = { starts: 0, start() { this.starts += 1; } }; tweens.push(tween); return tween; } };
	const motion = createHeroMotionController({
		kute,
		ellipse: {},
		form: { setAttribute() {} },
		getViewport: () => viewport,
	});

	assert.equal(motion.open(), true);
	assert.equal(motion.open(), false);
	viewport = { width: 390, height: 844 };
	motion.resize();

	assert.equal(tweens.length, 1);
	assert.equal(tweens[0].starts, 1);
});
