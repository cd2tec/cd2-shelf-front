import ShelfAsset from './shelf.png';
import ShelfUnexxAsset from './shelf-unexx.png';
import UNAsset from './un.png';
import UnexxShelfAsset from './unexx-shelf.png';

export function Shelf(props) {
	return <Asset src={ShelfAsset} {...props} />;
}

export function ShelfUnexx(props) {
	return <Asset src={ShelfUnexxAsset} {...props} />;
}

export function UN(props) {
	return <Asset src={UNAsset} {...props} />;
}

export function UnexxShelf(props) {
	return <Asset src={UnexxShelfAsset} {...props} />;
}

function Asset({ src, width, height, style = {} }) {
	return (
		<div style={{ width: '100%', textAlign: 'center', ...style }}>
			<img src={src} style={{ width, height }} alt="logo" />
		</div>
	);
}