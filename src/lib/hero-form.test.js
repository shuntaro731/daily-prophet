import test from 'node:test';
import assert from 'node:assert/strict';
import {
	buildLogoAlignedForm,
	LOGO_GLYPHS,
	mapLogoXToFrame,
	mapLogoYToFrame,
} from './hero-form.js';

test('Daily Prophetの12字形を左から右の輪郭座標で保持する', () => {
	const rightEdges = LOGO_GLYPHS.map(({ right }) => Number(right.toFixed(3)));

	assert.deepEqual(rightEdges, [166.576, 321.297, 398.517, 518.704, 589.341, 680.866, 777.769, 858.738, 960.941, 1090.89, 1206.87, 1374]);
});

test('ロゴの左右端をフレームの左右端へ正しく変換する', () => {
	assert.equal(mapLogoXToFrame(0), 13.24);
	assert.equal(mapLogoXToFrame(1374), 1310.76);
});

test('ロゴ上端は字形の高さ順に段差のY座標へ変換される', () => {
	const viewportWidth = 1440;
	const viewportHeight = 900;
	const yValues = LOGO_GLYPHS.map(({ top }) => mapLogoYToFrame(top, viewportWidth, viewportHeight));

	assert.equal(Number(yValues[0].toFixed(3)), 592.704);
	assert.ok(yValues[1] > yValues[0]);
	assert.ok(yValues[4] < yValues[5]);
	assert.ok(yValues.at(-1) < yValues.at(-2));
});

test('段差フォームは上辺と左右辺を保ちロゴに沿う下辺を作る', () => {
	const path = buildLogoAlignedForm(1440, 900);

	assert.match(path, /^M 1310\.76 [\d.]+ H 1152\.933 V [\d.]+/);
	assert.match(path, /H 316\.653 V [\d.]+ H 170\.544/);
	assert.match(path, /H 13\.24 V 15 H 1310\.76 Z$/);
	assert.equal((path.match(/ H /g) ?? []).length, LOGO_GLYPHS.length + 1);
});

test('同じ高さの字形は一つの水平段にまとめられる', () => {
	const merged = buildLogoAlignedForm(1440, 900, { levelTolerance: 2 });
	const unmerged = buildLogoAlignedForm(1440, 900, { levelTolerance: 0 });

	assert.ok((merged.match(/ V /g) ?? []).length < (unmerged.match(/ V /g) ?? []).length);
});

test('近接するo・r・P・yの上端差では不要な細い段差を作らない', () => {
	const path = buildLogoAlignedForm(1440, 900);
	const rRight = Number(mapLogoXToFrame(LOGO_GLYPHS[6].right).toFixed(3));
	const lRight = Number(mapLogoXToFrame(LOGO_GLYPHS[3].right).toFixed(3));
	const nearLevelRun = path.split(`H ${rRight}`)[1].split(`H ${lRight}`)[0];

	assert.doesNotMatch(nearLevelRun, / V /);
});

test('段差の余白はロゴ上端より上へ広げられる', () => {
	const withoutGap = buildLogoAlignedForm(1440, 900, { gap: 0 });
	const withGap = buildLogoAlignedForm(1440, 900, { gap: 24 });
	const firstY = (path) => Number(path.match(/^M 1310\.76 ([\d.]+) H/)?.[1]);

	assert.ok(firstY(withGap) < firstY(withoutGap));
});

test('異なる縦横比のviewportに合わせて段差を再計算する', () => {
	const landscape = buildLogoAlignedForm(1440, 900);
	const portrait = buildLogoAlignedForm(390, 844);

	assert.notEqual(landscape, portrait);
	assert.match(portrait, /^M 1310\.76 [\d.]+ H 1152\.933 V/);
});

test('無効なviewport寸法ではフォームを生成しない', () => {
	for (const [width, height] of [[0, 900], [-1, 900], [1440, 0], [1440, Infinity], [NaN, 900]]) {
		assert.throws(() => buildLogoAlignedForm(width, height), /positive viewport size/i);
	}
});
