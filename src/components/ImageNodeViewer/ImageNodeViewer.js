import React from 'react';

import './ImageNodeViewer.css';

class ImageNodeViewer extends React.Component {
	render() {
		return (
			<div className='image-node-viewer'>
				<img src={this.props.link} alt='User-uploaded' />
			</div>
		)
	}
}

export default ImageNodeViewer;
