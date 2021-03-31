import React from 'react';

import './ExternalDocThumbnail.css';

class ExternalDocThumbnail extends React.Component {

	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.props.showExternalDocument(
			this.props.doc.id,
			this.props.doc.fileName,
			this.props.doc.url,
			this.props.doc.audioMessageURL,
			this.props.doc.videoMessageURL
		);
	}

	render() {
		return (
			<div
				className='external-doc-thumbnail'
				onClick={this.handleClick}
			>
				<p>{this.props.doc.fileName}</p>
			</div>
		)
	}
}

export default ExternalDocThumbnail;
