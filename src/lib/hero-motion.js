import { buildLogoAlignedForm } from './hero-form.js';

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

/** Caches a morph for the current viewport and freezes it when opened. */
export function createHeroMotionController({ kute, ellipse, form, getViewport, onOpen = () => {} }) {
	let opened = false;
	let tween;

	const prepare = () => {
		if (opened) return false;
		const { width, height } = getViewport();
		form.setAttribute('d', buildLogoAlignedForm(width, height));
		tween = createHeroMorph(kute, ellipse, form);
		return true;
	};

	prepare();

	return {
		resize: prepare,
		open() {
			if (opened) return false;
			opened = true;
			onOpen();
			tween.start();
			return true;
		},
	};
}
