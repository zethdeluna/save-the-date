import React, { useState, useCallback } from "react";

const useImageOrientation = () => {

	const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square' | null>(null);

	const ref = useCallback((node: HTMLImageElement | null) => {

		if ( !node ) return;

		const measure = () => {

			const { naturalWidth, naturalHeight } = node;

			if ( naturalWidth > naturalHeight ) setOrientation('landscape');
			else if ( naturalHeight > naturalWidth ) setOrientation('portrait');
			else setOrientation('square');

		};

		node.complete ? measure() : node.addEventListener('load', measure, { once: true });

	}, []);

	return { ref, orientation };

}

export function ImageCard ({ src, style, onClick }: { src: string; style?: React.CSSProperties; onClick?: () => void }) {

	const { ref, orientation } = useImageOrientation();

	return (
		<button className="image-container" data-orientation={orientation} style={style} onClick={onClick} aria-label={"image-"+src}>
			<picture>
				<source srcSet={src} type="image/webp" />
				<img ref={ref} src={src} alt="" loading="lazy" />
			</picture>
		</button>
	);

}