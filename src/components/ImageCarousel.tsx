import { useState, useEffect, useRef } from "react";

const SWIPE_THRESHOLD = 50;
const MAX_SCALE = 4;

type Point = { x: number; y: number };

function pinchDist(a: Point, b: Point) {
	return Math.hypot(b.x - a.x, b.y - a.y);
}

export function ImageCarousel({ imgSrcs, startIndex, onClose }: { imgSrcs: string[]; startIndex: number | null; onClose: () => void }) {
	const [index, setIndex] = useState(startIndex ?? 0);
	const [prevStartIndex, setPrevStartIndex] = useState(startIndex);

	const dragStartX = useRef<number | null>(null);
	const didDrag = useRef(false);
	const trackRef = useRef<HTMLDivElement>(null);

	// All zoom/pan state is imperative — no re-renders during gestures
	const pointers = useRef(new Map<number, Point>());
	const scale = useRef(1);
	const translate = useRef<Point>({ x: 0, y: 0 });
	const pinchStartDist = useRef<number | null>(null);
	const pinchStartScale = useRef(1);
	const panStart = useRef<{ ptr: Point; tx: Point } | null>(null);

	if (startIndex !== prevStartIndex) {
		setPrevStartIndex(startIndex);
		if (startIndex !== null) setIndex(startIndex);
	}

	// Support arrows/escape keyboard buttons
	useEffect(() => {

		if (startIndex === null) return;

		const handleKeyDown = (e: KeyboardEvent) => {

			if (e.key === "ArrowRight") navigate(1);
			else if (e.key === "ArrowLeft") navigate(-1);
			else if (e.key === "Escape") onClose();

		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);

	}, [startIndex, imgSrcs.length]);

	if (imgSrcs.length === 0) return null;

	const applyTransform = () => {
		const el = trackRef.current?.querySelector<HTMLElement>('[data-active="true"]');
		if (el) el.style.transform = `translate(${translate.current.x}px, ${translate.current.y}px) scale(${scale.current})`;
	};

	const resetTransform = () => {
		scale.current = 1;
		translate.current = { x: 0, y: 0 };
		// Reset all containers so the incoming slide is also clean
		trackRef.current?.querySelectorAll<HTMLElement>('.image-container').forEach(el => {
			el.style.transform = '';
		});
	};

	const navigate = (dir: 1 | -1) => {
		resetTransform();
		setIndex(i => (i + dir + imgSrcs.length) % imgSrcs.length);
	};

	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		e.currentTarget.setPointerCapture(e.pointerId);

		if (pointers.current.size >= 2) {
			// Second finger — switch to pinch mode, cancel any active drag/pan
			const [a, b] = [...pointers.current.values()];
			pinchStartDist.current = pinchDist(a, b);
			pinchStartScale.current = scale.current;
			dragStartX.current = null;
			panStart.current = null;
		} else {
			dragStartX.current = e.clientX;
			didDrag.current = false;
			if (scale.current > 1) {
				panStart.current = { ptr: { x: e.clientX, y: e.clientY }, tx: { ...translate.current } };
			}
		}
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

		if (pointers.current.size >= 2 && pinchStartDist.current !== null) {
			const [a, b] = [...pointers.current.values()];
			const newScale = Math.max(1, Math.min(MAX_SCALE, pinchStartScale.current * (pinchDist(a, b) / pinchStartDist.current)));
			scale.current = newScale;
			if (newScale === 1) translate.current = { x: 0, y: 0 };
			applyTransform();
			return;
		}

		if (pointers.current.size === 1) {
			if (scale.current > 1 && panStart.current) {
				// Zoomed in — drag pans the image instead of navigating
				translate.current = {
					x: panStart.current.tx.x + (e.clientX - panStart.current.ptr.x),
					y: panStart.current.tx.y + (e.clientY - panStart.current.ptr.y),
				};
				applyTransform();
			} else if (dragStartX.current !== null) {
				if (Math.abs(e.clientX - dragStartX.current) > 5) didDrag.current = true;
			}
		}
	};

	const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
		const startX = dragStartX.current;
		pointers.current.delete(e.pointerId);
		if (pointers.current.size < 2) pinchStartDist.current = null;

		if (pointers.current.size === 0) {
			if (startX !== null && scale.current === 1) {
				const delta = e.clientX - startX;
				if (Math.abs(delta) >= SWIPE_THRESHOLD) delta < 0 ? navigate(1) : navigate(-1);
			}
			dragStartX.current = null;
			panStart.current = null;
		}
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
				<button className="carousel-btn prev" onClick={() => navigate(-1)} aria-label="Previous image"></button>
				<button className="carousel-btn next" onClick={() => navigate(1)} aria-label="Next image"></button>
				<button className="close" aria-label="Close carousel" onClick={onClose}></button>
				<div className="slide-count">{index + 1} / {imgSrcs.length}</div>
				<div
					ref={trackRef}
					className="carousel-track"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={(e) => {
						pointers.current.delete(e.pointerId);
						if (pointers.current.size < 2) pinchStartDist.current = null;
						if (pointers.current.size === 0) {
							dragStartX.current = null;
							panStart.current = null;
						}
					}}
					onClick={handleClick}
					style={{ touchAction: "none", userSelect: "none" }}
				>
					{[...new Set([(index - 1 + imgSrcs.length) % imgSrcs.length, index, (index + 1) % imgSrcs.length])].map(idx => (
						<div key={idx} className="image-container" data-active={idx === index}>
							<picture>
								<source srcSet={imgSrcs[idx]} type="image/webp" />
								<img src={imgSrcs[idx]} alt="" loading="lazy" draggable={false} />
							</picture>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
