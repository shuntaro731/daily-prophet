const FRAME_WIDTH = 1324;
const FRAME_HEIGHT = 756;
const LOGO_WIDTH = 1374;
const LOGO_HEIGHT = 375;
const LOGO_LEFT_RATIO = 0.01;
const LOGO_WIDTH_RATIO = 0.98;
const LOGO_BOTTOM_RATIO = 0.01;
const OPEN_LOGO_HEIGHT_RATIO = 0.2;
const LEVEL_TOLERANCE_EPSILON = 0.05;

// Right/top bounds come from svg-path-commander.getPathBBox() on each vector
// path in daily_prophet.svg, ordered by x. The textured P uses its vector path.
export const LOGO_GLYPHS = [
	{ right: 166.575813, top: 0.000976562 },
	{ right: 321.297, top: 58.1582 },
	{ right: 398.5166049, top: 103.854 },
	{ right: 518.7040654, top: 137.088 },
	{ right: 589.3409727, top: 186.938 },
	{ right: 680.866, top: 187.034 },
	{ right: 777.7689263, top: 187.0007531 },
	{ right: 858.738, top: 185 },
	{ right: 960.941, top: 136.64 },
	{ right: 1090.89, top: 103.0399333 },
	{ right: 1206.87, top: 58.2402 },
	{ right: 1374, top: 0 },
];

const format = (value) => Number(value.toFixed(3));

export const mapLogoXToFrame = (logoX) =>
	FRAME_WIDTH * (LOGO_LEFT_RATIO + (logoX / LOGO_WIDTH) * LOGO_WIDTH_RATIO);

export const mapLogoYToFrame = (logoY, viewportWidth, viewportHeight) => {
	if (![viewportWidth, viewportHeight].every((size) => Number.isFinite(size) && size > 0)) {
		throw new Error('A positive viewport size is required to build the logo form');
	}

	const logoTopRatio = 1 - LOGO_BOTTOM_RATIO * (viewportWidth / viewportHeight) - OPEN_LOGO_HEIGHT_RATIO;
	return FRAME_HEIGHT * (logoTopRatio + (logoY / LOGO_HEIGHT) * OPEN_LOGO_HEIGHT_RATIO);
};

/** Builds a frame whose lower edge follows the actual Daily Prophet glyphs. */
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

		const sameLevel = Math.abs(previousGlyph.top - previousLogoLevel) <= levelTolerance + LEVEL_TOLERANCE_EPSILON;
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
