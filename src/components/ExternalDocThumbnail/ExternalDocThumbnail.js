import React from 'react';

import { deleteExternalDocument } from '../../firebase'

import './ExternalDocThumbnail.css';

import TrashIcon from '../../assets/allons-icons/trash-orange.svg';

class ExternalDocThumbnail extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			numberOfTimesClickedOnDelete: 0
		};

		this.handleExternalDocThumbnailClick = this.handleExternalDocThumbnailClick.bind(this);
		this.deleteExternalDocument = this.deleteExternalDocument.bind(this);
	}

	handleExternalDocThumbnailClick() {
		this.props.showExternalDocument(
			this.props.doc.id,
			this.props.doc.fileName,
			this.props.doc.url,
			this.props.doc.audioMessageURL,
			this.props.doc.videoMessageURL
		);
	}

	deleteExternalDocument(e) {
		e.stopPropagation();

		if (this.state.numberOfTimesClickedOnDelete === 0) {
			this.setState({ numberOfTimesClickedOnDelete: 1 });
		}

		if (this.state.numberOfTimesClickedOnDelete === 1) {
			// Delete module.
			deleteExternalDocument(
				this.props.user.uid,
				this.props.doc.id,
				this.props.numberOfModules
			);

			this.props.updateExternalDocsListAfterDeletion(this.props.doc.id);
		}
	}

	render() {
		return (
			<div
				className='external-doc-thumbnail'
				onClick={this.handleExternalDocThumbnailClick}
			>
				<p>{this.props.doc.fileName}</p>
				<button onClick={this.deleteExternalDocument}>
					{this.state.numberOfTimesClickedOnDelete === 0 && (
						<img
							src={TrashIcon}
							alt='Delete external document'
							className='delete-icon'
						/>
					)}
					{this.state.numberOfTimesClickedOnDelete === 1 && (
						<span>Are you sure?</span>
					)}
				</button>
			</div>
		)
	}
}

export default ExternalDocThumbnail;
