import test from 'node:test';
import assert from 'node:assert/strict';
import {
	buildLogoAlignedForm,
	LOGO_GLYPHS,
	mapLogoXToFrame,
	mapLogoYToFrame,
} from '../lib/hero-form.js';

test('ロゴの左右端をフレームの左右端へ正しく変換する', () => {
	assert.equal(mapLogoXToFrame(0), 13.24);
	assert.equal(mapLogoXToFrame(1371), 1310.76);
});

test('ロゴの上端はロゴの高さ順にフレームの段差へ変換される', () => {
	const viewportWidth = 1440;
	const viewportHeight = 900;
	const yValues = LOGO_GLYPHS.map(({ top }) => mapLogoYToFrame(top, viewportWidth, viewportHeight));

	assert.equal(Number(yValues[0].toFixed(3)), 592.704);
	assert.ok(yValues[1] > yValues[0]);
	assert.ok(yValues[4] < yValues[5]);
	assert.ok(yValues.at(-1) < yValues.at(-2));
});

test('生成されたフォームは上辺・左右辺とロゴに沿った下辺を持つ', () => {
	const path = buildLogoAlignedForm(1440, 900);

	assert.match(path, /^M 1310\.76 [\d.]+ H 1152\.587 V [\d.]+/);
	assert.match(path, /H 317\.317 V [\d.]+ H 170\.845/);
	assert.match(path, /H 13\.24 V 15 H 1310\.76 Z$/);
	assert.equal((path.match(/ H /g) ?? []).length, LOGO_GLYPHS.length + 1);
	assert.equal((path.match(/ V /g) ?? []).length, 9);
});

test('段差の余白はロゴ上端より上へ広げられる', () => {
	const withoutGap = buildLogoAlignedForm(1440, 900, { gap: 0 });
	const withGap = buildLogoAlignedForm(1440, 900, { gap: 24 });

	const firstY = (path) => Number(path.match(/^M [\d.]+ ([\d.]+) H/)?.[1]);
	assert.ok(firstY(withGap) < firstY(withoutGap));
});
