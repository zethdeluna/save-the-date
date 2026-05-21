import ArrowRight from '../assets/svgs/arrow-right.svg';
import Heart from '../assets/svgs/heart.svg';
import Date from '../assets/svgs/date.svg';
import Play from '../assets/svgs/play.svg';
import ArchScroll from '../assets/svgs/arch-scroll.svg';
import ArchOrClickPlay from '../assets/svgs/arch-or-click-play.svg';


const SVGMap = {
  'arrow-right': ArrowRight,
  'heart': Heart,
  'date': Date,
  'play': Play,
  'arch-scroll': ArchScroll,
  'arch-or-click-play': ArchOrClickPlay
};

export type SVGName = keyof typeof SVGMap;

interface SVGProps {
	name: SVGName;
}

export const SvgHelper: React.FC<SVGProps> = ({ name }) => {
	const SvgComponent = SVGMap[name];
	return <SvgComponent />;
};