import { useState, useEffect, useRef } from "react";

const SWIPE_THRESHOLD = 50;

export function ImageCarousel({ imgSrcs, startIndex, onClose }: { imgSrcs: string[]; startIndex: number | null; onClose: () => void }) {
	const [index, setIndex] = useState(0);
	const dragStartX = useRef<number | null>(null);
	const didDrag = useRef(false);

	useEffect(() => {
		if (startIndex !== null) setIndex(startIndex);
	}, [startIndex]);

	// Support arrows/escape keyboard buttons
	useEffect(() => {

		if (startIndex === null) return;

		const handleKeyDown = (e: KeyboardEvent) => {

			if (e.key === "ArrowRight") next();
			else if (e.key === "ArrowLeft") prev();
			else if (e.key === "Escape") onClose();

		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
		
	}, [startIndex, imgSrcs.length]);

	if (imgSrcs.length === 0) return null;

	const prev = () => setIndex(i => (i - 1 + imgSrcs.length) % imgSrcs.length);
	const next = () => setIndex(i => (i + 1) % imgSrcs.length);

	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		dragStartX.current = e.clientX;
		didDrag.current = false;
		e.currentTarget.setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		if (dragStartX.current === null) return;
		if (Math.abs(e.clientX - dragStartX.current) > 5) didDrag.current = true;
	};

	const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
		if (dragStartX.current === null) return;
		const delta = e.clientX - dragStartX.current;
		if (Math.abs(delta) >= SWIPE_THRESHOLD) {
			delta < 0 ? next() : prev();
		}
		dragStartX.current = null;
	};

	// Suppress click on images/children when the gesture was a drag, not a tap
	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (didDrag.current) {
			e.stopPropagation();
			didDrag.current = false;
		}
	};

	return (
		<div className="image-carousel" data-active={startIndex !== null}>
			<div className="carousel-wrapper">
				<button className="carousel-btn prev" onClick={prev} aria-label="Previous image"></button>
				<button className="carousel-btn next" onClick={next} aria-label="Next image"></button>
				<button className="close" aria-label="Close carousel" onClick={onClose}></button>
				<div className="slide-count">{index + 1} / {imgSrcs.length}</div>
				<div
					className="carousel-track"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={() => { dragStartX.current = null; }}
					onClick={handleClick}
					style={{ touchAction: "pan-y", userSelect: "none" }}
				>
					{imgSrcs.map((src, i) => (
						<div key={src} className="image-container" data-active={i === index}>
							<img
								src={src}
								alt=""
								loading="lazy"
								draggable={false}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
