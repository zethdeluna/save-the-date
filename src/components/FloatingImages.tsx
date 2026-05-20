import { useMemo } from "react";
import { ImageCard } from "./ImageCard";

function seededRandom(seed: number): number {
	const x = Math.sin(seed + 1) * 10000;
	return x - Math.floor(x);
}

export function FloatingImages({ showImages, imgSrcs, onImageClick }: { showImages: boolean; imgSrcs: string[]; onImageClick: (index: number) => void }) {

	const imageStyles = useMemo(() => {
		const n = imgSrcs.length;
		if (n === 0) return [];

		// Divide viewport into n slots; place each image in its own slot with jitter
		// Reserve 340px on the right so even landscape images (320px) stay on screen
		const availableWidth = Math.max(window.innerWidth - 80, 0);
		const slotWidth = availableWidth / n;

		return imgSrcs.map((_, i) => {
			const left = i * slotWidth + seededRandom(i * 3) * slotWidth;
			const duration = 12 + seededRandom(i * 7) * 7;        // 8–15 s
			const delay = -(seededRandom(i * 11) * duration);     // random phase offset
			const rotation = (seededRandom(i * 13) - 0.5) * 10;  // –5° to +5°

			return {
				left: `${left.toFixed(1)}px`,
				animationDuration: `${duration.toFixed(1)}s`,
				animationDelay: `${delay.toFixed(1)}s`,
				'--rotation': `${rotation.toFixed(1)}deg`,
			} as React.CSSProperties;
		});
	}, [imgSrcs]);

	return (
		<div className="floating-images" data-show={showImages}>
			{imgSrcs.map((src, i) => (
				<ImageCard key={src} src={src} style={imageStyles[i]} onClick={() => onImageClick(i)} />
			))}
		</div>
	);

}