import './App.css';
import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollContainer } from './components/ScrollContainer';
import { LoadingScreen } from './components/LoadingScreen';
import paperBg from './assets/images/paper.jpg';
import heartGlass from './assets/images/heart-glass.png';
import babySteph from './assets/images/baby-steph.png';
import babyZeth from './assets/images/baby-zeth.png';

export default function App() {

	const prevScrollPos = useRef<number>(0);
	// const prevScrollPercent = useRef<number>(0);
	const [scrollPosition, setScrollPosition] = useState<number>(0);
	const [assetsLoaded, setAssetsLoaded] = useState(false);

	useEffect(() => {
		const urls = [paperBg, heartGlass, babySteph, babyZeth];
		const minDelay = new Promise<void>(resolve => setTimeout(resolve, 600));
		const imageLoads = urls.map(url => new Promise<void>(resolve => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => resolve();
			img.src = url;
		}));
		Promise.all([...imageLoads, minDelay]).then(() => setAssetsLoaded(true));
	}, []);
	// const [scrollPercent, setScrollPercent] = useState<number>(0);
	// const [scrollDirection, setScrollDirection] = useState<"up" | "down">();

	// Scroll tracking
	const handleScroll = useCallback(() => {

		const currentPos = window.scrollY;

		// if ( currentPos > prevScrollPos.current ) setScrollDirection("down");
		// else setScrollDirection("up");

		// const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		// const currentPercent = currentPos / scrollHeight;

		// prevScrollPercent.current = currentPercent;
		// setScrollPercent(currentPos / window.innerHeight);

		prevScrollPos.current = currentPos;
		setScrollPosition(currentPos);

	}, []);

	useEffect(() => {

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		}

	}, []);

	return(
		<div className="scroll-wrapper">
			<LoadingScreen visible={!assetsLoaded} />
			<div className="background-image" />
			<ScrollContainer
				scrollPosition={scrollPosition}
				// scrollDirection={scrollDirection}
				// scrollPercent={scrollPercent}
			/>
		</div>
	);
}