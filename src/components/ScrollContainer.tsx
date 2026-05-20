import { useState, useEffect, useRef, useCallback } from "react";
import { FloatingImages } from "./FloatingImages";
import { ImageCarousel } from "./ImageCarousel";
import { useCarouselImages } from "../hooks/useCarouselImages";
import { SvgHelper } from "./SvgHelper";
import babySteph from "../assets/images/baby-steph.png";
import babyZeth from "../assets/images/baby-zeth.png";

interface ScrollContainerProps {
	scrollPosition: number;
	// scrollDirection: "up" | "down" | undefined;
	// scrollPercent: number;
}

export function ScrollContainer({ scrollPosition }: ScrollContainerProps) {

	const babyRef = useRef<HTMLDivElement>(null);
	const introRef = useRef<HTMLHeadingElement>(null);
	const heartRef = useRef<HTMLDivElement>(null);
	const dateRef = useRef<HTMLDivElement>(null);
	const saveTheDateRef = useRef<HTMLDivElement>(null);
	const locationRef = useRef<HTMLDivElement>(null);
	const comingSoonRef = useRef<HTMLDivElement>(null);
	const debounceScrollRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const scrollPositionRef = useRef(scrollPosition);
	const openCarouselRef = useRef<HTMLButtonElement>(null);
	const autoScrollBtnRef = useRef<HTMLButtonElement>(null);
	const isAutoScrollingRef = useRef(false);
	const cancelAutoScrollRef = useRef<(() => void) | null>(null);
	const [showImages, setShowImages] = useState(false);
	const [carouselIndex, setCarouselIndex] = useState<number | null>(null);
	const imgSrcs = useCarouselImages();

	// Baby faces animation
	useEffect(() => {

		if ( !babyRef.current ) return;

		const timeout = setTimeout(() => {

			babyRef.current?.classList.add('show');

		}, 1500);

		return () => clearTimeout(timeout);

	}, []);

	// Intro text animation
	useEffect(() => {

		if ( !introRef.current ) return;

		// introRef.current?.classList.add('show');

		const timeout = setTimeout(() => {

			introRef.current?.classList.add('show');

		}, 3000);

		return () => clearTimeout(timeout);

	}, []);

	// Heart peek
	useEffect(() => {

		if ( !heartRef.current ) return;

		const timeout = setTimeout(() => {

			heartRef.current?.classList.add('peek');

		}, 1500);

		return () => clearTimeout(timeout);

	}, []);

	// Show auto-scroll button after intro settles
	useEffect(() => {

		const id = setTimeout(() => {
			autoScrollBtnRef.current?.classList.add('show');
		}, 3000);

		return () => clearTimeout(id);

	}, []);

	// Hide auto-scroll button once user manually scrolls
	useEffect(() => {

		if ( scrollPosition > 10 && !isAutoScrollingRef.current || isAutoScrollingRef.current ) {
			autoScrollBtnRef.current?.classList.remove('show');
		} else if ( scrollPosition < 10 && introRef.current?.classList.contains('show') && !isAutoScrollingRef.current ) {
			autoScrollBtnRef.current?.classList.add('show');
		}
		// } else {
		// 	autoScrollBtnRef.current?.classList.add('show');
		// }

	}, [scrollPosition]);

	// Cancel auto-scroll on wheel or touch
	useEffect(() => {

		const cancel = () => {
			if ( isAutoScrollingRef.current && cancelAutoScrollRef.current ) {
				cancelAutoScrollRef.current();
			}
		};

		window.addEventListener('wheel', cancel, { passive: true });
		window.addEventListener('touchmove', cancel, { passive: true });

		return () => {
			window.removeEventListener('wheel', cancel);
			window.removeEventListener('touchmove', cancel);
		};

	}, []);

	const startAutoScroll = useCallback(() => {

		autoScrollBtnRef.current?.classList.remove('show');

		const vh = window.innerHeight;
		const phase3End = vh * 2;
		const phase4End = vh * 2.5;
		const phase6End = vh * 3.5;
		const phase7End = vh * 4.5;

		let cancelled = false;

		cancelAutoScrollRef.current = () => {
			cancelled = true;
			isAutoScrollingRef.current = false;
			cancelAutoScrollRef.current = null;
		};

		isAutoScrollingRef.current = true;

		const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

		const scrollToTarget = (target: number, duration: number): Promise<void> =>
			new Promise((resolve) => {
				const start = window.scrollY;
				const distance = target - start;
				const startTime = performance.now();

				const step = (now: number) => {
					if ( cancelled ) { resolve(); return; }
					const progress = Math.min((now - startTime) / duration, 1);
					window.scrollTo(0, start + distance * easeInOut(progress));
					if ( progress < 1 ) requestAnimationFrame(step);
					else resolve();
				};

				requestAnimationFrame(step);
			});

		const pause = (ms: number): Promise<void> =>
			new Promise((resolve) => setTimeout(resolve, ms));

		(async () => {
			await scrollToTarget(phase3End - (vh * 0.25), 2000);
			if ( cancelled ) return;
			await pause(2500);
			await scrollToTarget(phase3End, 1500);
			if ( cancelled ) return;
			await scrollToTarget(phase4End, 1500);
			if ( cancelled ) return;
			await pause(1000);
			if ( cancelled ) return;
			await scrollToTarget(phase6End, 2500);
			if ( cancelled ) return;
			// await pause(1000);
			// if ( cancelled ) return;
			await scrollToTarget(phase7End, 2500);
			isAutoScrollingRef.current = false;
			cancelAutoScrollRef.current = null;
		})();

	}, []);

	// Scroll animations
	const heartScroll = useCallback(() => {

		if ( !heartRef.current ) return;

		const pos = scrollPositionRef.current;
		const heartHeight = heartRef.current.offsetHeight;
		const heartWidth = heartRef.current.offsetWidth;
		const targetPos = (window.innerHeight - heartHeight) / 2;
		const originalPos = window.innerHeight - 140;
		const distance = targetPos - originalPos;

		const vh = window.innerHeight;
		const phase1End = vh * 0.5;
		const phase2End = vh * 1.5;
		const phase3End = vh * 2;
		const phase4End = vh * 2.5;
		const phase5End = vh * 3;
		const phase6End = vh * 3.5;
		const phase7End = vh * 4.5;

		// Reset auto-scroll button
		// if ( pos < phase1End ) {
		// 	autoScrollBtnRef.current?.classList.add('show');
		// } else {
		// 	autoScrollBtnRef.current?.classList.remove('show');
		// }

		// Phase 1: baby faces
		



		// Phase 1: move heart to center
		const phase1Progress = Math.min(Math.max(pos / phase1End, 0), 1);
		heartRef.current.style.top = `${originalPos + distance * phase1Progress}px`;

		// Phase 2: scale heart to fill viewport
		if ( pos > phase1End ) {
			const phase2Progress = Math.min((pos - phase1End) / (phase2End - phase1End), 1);
			const fillScale = Math.max(window.innerWidth / heartWidth, vh / heartHeight) * 2;
			heartRef.current.style.scale = `${1 + (fillScale - 1) * phase2Progress}`;
		} else {
			heartRef.current.style.scale = '1';
		}

		// Phase 3: show date and expand
		if ( !dateRef.current ) return;
		if ( pos > phase2End ) {

			// introRef.current?.classList.remove('show');

			const phase3Progress = Math.min((pos - phase2End) / (phase3End - phase2End), 1);

			// if ( phase3Progress > 0.05 ) dateRef.current.classList.add('expand');
			// else dateRef.current.classList.remove('expand');
			dateRef.current.classList.add('expand');

			if ( phase3Progress > 0.9 ) dateRef.current.classList.add('move-up');
			else dateRef.current.classList.remove('move-up');

		} else {
			// introRef.current?.classList.add('show');
			dateRef.current.classList.remove('expand');
			dateRef.current.classList.remove('move-up');
		}

		// Phase 4: save the date text
		if ( !saveTheDateRef.current ) return;
		if ( pos > phase3End ) {

			const phase4Progress = Math.min((pos - phase3End) / (phase4End - phase3End), 1);

			if ( phase4Progress > 0.2 ) saveTheDateRef.current.classList.add('show');
			else saveTheDateRef.current.classList.remove('show');

		} else {
			saveTheDateRef.current.classList.remove('show');
		}

		// Phase 5: location text
		if ( !locationRef.current ) return;
		if ( pos > phase4End ) {

			const phase5Progress = Math.min((pos - phase4End) / (phase5End - phase4End), 1);

			if ( phase5Progress > 0.1 ) {

				locationRef.current.classList.add('show');
				saveTheDateRef.current.classList.add('move-up');

			} else {

				locationRef.current.classList.remove('show');
				saveTheDateRef.current.classList.remove('move-up');

			}

		} else {
			locationRef.current.classList.remove('show');
			saveTheDateRef.current.classList.remove('move-up');
		}

		// Phase 6: coming soon text
		if ( pos > phase5End ) {

			const phase6Progress = Math.min((pos - phase5End) / (phase6End - phase5End), 1);

			if ( phase6Progress > 0.1 ) {

				comingSoonRef.current?.classList.add('show');
				saveTheDateRef.current?.classList.add('again');

			} else {

				comingSoonRef.current?.classList.remove('show');
				saveTheDateRef.current?.classList.remove('again');

			}

		} else {

			comingSoonRef.current?.classList.remove('show');
			saveTheDateRef.current?.classList.remove('again');

		}

		// Phase 7: scale down heart
		if ( pos > phase6End ) {

			const phase7Progress = Math.min((pos - phase6End) / (phase7End - phase6End), 1);
			const fillScale = Math.max(window.innerWidth / heartWidth, vh / heartHeight) * 2;

			const minScale = ( window.innerWidth <= 650 ) ? 1.25 : 1.9;

			heartRef.current.style.scale = `${Math.max(minScale, 1 + (fillScale - 1) * (1 - phase7Progress))}`;

			if ( phase7Progress > 0.9 ) {
				setShowImages(true);
				openCarouselRef.current?.classList.add('show');
			} else {
				setShowImages(false);
				openCarouselRef.current?.classList.remove('show');
			}

		} else {

			setShowImages(false);

		}

		// Update Safari theme-color based on heart scale
		const currentScale = parseFloat(heartRef.current.style.scale || '1');
		const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
		if (themeColorMeta) {
			themeColorMeta.content = currentScale > 2.9 ? '#FFD4DB' : '#FEFAF1';
		}

	}, []);

	useEffect(() => {

		scrollPositionRef.current = scrollPosition;

		clearTimeout(debounceScrollRef.current);

		debounceScrollRef.current = setTimeout(() => {

			heartScroll();

		}, 0);

		return () => clearTimeout(debounceScrollRef.current);

	}, [scrollPosition, heartScroll]);

	return (
		<section className="scroll-container">

			<span className="logo">Zeth + Steph</span>

			<div className="baby-faces" ref={babyRef}>

				<div className="baby-steph">
					<img src={babySteph} alt="baby steph" />
					<p>scroll!</p>
				</div>

				<div className="baby-zeth">
					<img src={babyZeth} alt="baby zeth" />
					<p>or click play</p>
				</div>
			
			</div>

			<button ref={autoScrollBtnRef} className="auto-scroll-btn" onClick={startAutoScroll} tabIndex={0} aria-label="Watch the animation">
				<SvgHelper name="play" />
			</button>

			<h1 className="intro fade-in-text" ref={introRef}>
				<span>We're</span><span>getting</span><span>married!</span>
			</h1>

			<div className="heart-container" ref={heartRef} />

			<div className="date" ref={dateRef}>
				<span className="year">2027</span>
				<span className="month">02</span>
				<span className="day">27</span>
			</div>

			<div className="save-the-date fade-in-text heading" ref={saveTheDateRef}>
				<span>Save</span><span>the</span><span>date.</span>
			</div>

			<div className="location" ref={locationRef}>
				Los Angeles, CA
			</div>

			<div className="coming-soon" ref={comingSoonRef}>
				RSVPs COMING SOON
			</div>

			<FloatingImages showImages={showImages} imgSrcs={imgSrcs} onImageClick={setCarouselIndex} />
			<ImageCarousel imgSrcs={imgSrcs} startIndex={carouselIndex} onClose={() => setCarouselIndex(null)} />

			<button ref={openCarouselRef} className="open-carousel" onClick={() => setCarouselIndex(0)}>See our engagement photos</button>

			{/* <p className="scroll-position">{scrollPercent.toFixed(2)}vh / {scrollDirection}</p> */}

		</section>
	);

}