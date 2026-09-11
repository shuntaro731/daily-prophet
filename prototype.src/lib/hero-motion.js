export const HERO_MORPH_OPTIONS = Object.freeze({
	duration: 1000,
	easing: 'easingCubicOut',
	morphPrecision: 8,
});

export function createHeroMorph(kute, fromElement, toElement) {
	return kute.fromTo(
		fromElement,
		{ path: fromElement },
		{ path: toElement },
		HERO_MORPH_OPTIONS,
	);
}
