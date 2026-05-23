import { useState, useEffect } from "react";

const images = import.meta.glob('../assets/images/carousel/*.webp');

export function useCarouselImages(): string[] {
	const [imgSrcs, setImgSrcs] = useState<string[]>([]);

	useEffect(() => {
		Promise.all(
			Object.values(images).map(fn => fn() as Promise<{ default: string }>)
		).then(imgs => setImgSrcs(imgs.map(img => img.default)));
	}, []);

	return imgSrcs;
}
