const FRAME_WIDTH = 1324;
const FRAME_HEIGHT = 756;
const LOGO_WIDTH = 1371;
const LOGO_HEIGHT = 370;
const LOGO_LEFT = 0.01;
const LOGO_WIDTH_RATIO = 0.98;
const LOGO_BOTTOM_RATIO = 0.01;
const OPEN_LOGO_HEIGHT_RATIO = 0.2;

// These are the right edge and the top edge of each black path in logo.svg.
// They are kept in the logo's own viewBox so the form can be regenerated for
// every viewport instead of being tied to one screenshot size.
export const LOGO_GLYPHS = [
	{ right: 166.53, top: 0 },
	{ right: 321.297, top: 58.158 },
	{ right: 398.813, top: 103.854 },
	{ right: 518.906, top: 137.087 },
	{ right: 589.602, top: 186.938 },
	{ right: 680.866, top: 187.033 },
	{ right: 774.753, top: 187.401 },
	{ right: 857.739, top: 186.169 },
	{ right: 957.941, top: 136.64 },
	{ right: 1087.89, top: 101.234 },
	{ right: 1203.87, top: 58.24 },
	{ right: 1371, top: 0 },
];

const format = (value) => Number(value.toFixed(3));

export const mapLogoXToFrame = (logoX) =>
	FRAME_WIDTH * (LOGO_LEFT + (logoX / LOGO_WIDTH) * LOGO_WIDTH_RATIO);

export const mapLogoYToFrame = (logoY, viewportWidth, viewportHeight) => {
	if (!(viewportWidth > 0) || !(viewportHeight > 0)) {
		throw new Error('A positive viewport size is required to build the logo form');
	}

	const logoTopRatio = 1 - LOGO_BOTTOM_RATIO * (viewportWidth / viewportHeight) - OPEN_LOGO_HEIGHT_RATIO;
	return FRAME_HEIGHT * (logoTopRatio + (logoY / LOGO_HEIGHT) * OPEN_LOGO_HEIGHT_RATIO);
};

/**
 * Builds the final mask path around the actual logo.svg glyph tops.
 *
 * The frame's upper and side edges remain fixed. Only its lower edge is
 * stepped, with one horizontal run for each glyph. The optional gap is in
 * logo.svg viewBox units and leaves the black outline a few pixels above the
 * glyphs, like the reference site.
 */
export function buildLogoAlignedForm(viewportWidth, viewportHeight, { gap = 24, levelTolerance = 2 } = {}) {
	const leftX = format(mapLogoXToFrame(0));
	const rightX = format(mapLogoXToFrame(LOGO_WIDTH));
	const lastGlyph = LOGO_GLYPHS.at(-1);
	const lastY = format(mapLogoYToFrame(lastGlyph.top - gap, viewportWidth, viewportHeight));
	const commands = [`M ${rightX} ${lastY}`];

	let previousY = lastY;
	let previousLogoLevel = lastGlyph.top;
	for (let index = LOGO_GLYPHS.length - 1; index > 0; index -= 1) {
		const previousGlyph = LOGO_GLYPHS[index - 1];
		const x = format(mapLogoXToFrame(previousGlyph.right));
		commands.push(`H ${x}`);

		const sameLevel = Math.abs(previousGlyph.top - previousLogoLevel) <= levelTolerance;
		const nextY = sameLevel
			? previousY
			: format(mapLogoYToFrame(previousGlyph.top - gap, viewportWidth, viewportHeight));

		if (nextY !== previousY) commands.push(`V ${nextY}`);
		previousY = nextY;
		previousLogoLevel = sameLevel ? previousLogoLevel : previousGlyph.top;
	}

	commands.push(`H ${leftX}`, 'V 15', `H ${rightX}`, 'Z');
	return commands.join(' ');
}
