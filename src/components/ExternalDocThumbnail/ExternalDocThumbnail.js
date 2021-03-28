import React from 'react';

import './ExternalDocThumbnail.css';

class ExternalDocThumbnail extends React.Component {

	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.props.showExternalDocument(
			this.props.id,
			this.props.fileName,
			this.props.url
		);
	}

	render() {
		return (
			<div
				className='external-doc-thumbnail'
				onClick={this.handleClick}
			>
				<p>{this.props.fileName}</p>
			</div>
		)
	}
}

export default ExternalDocThumbnail;
