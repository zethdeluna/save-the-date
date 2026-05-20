import './App.css';
import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollContainer } from './components/ScrollContainer';

export default function App() {

	const prevScrollPos = useRef<number>(0);
	// const prevScrollPercent = useRef<number>(0);
	const [scrollPosition, setScrollPosition] = useState<number>(0);
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
			<div className="background-image" />
			<ScrollContainer 
				scrollPosition={scrollPosition} 
				// scrollDirection={scrollDirection}
				// scrollPercent={scrollPercent}
			/>
		</div>
	);
}