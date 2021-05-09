import React from 'react';

import { IMAGE, IMAGE_NODE_NO_IMAGE , IMAGE_NODE_HAS_IMAGE } from '../../util/main_util'

import SpinnerIcon from '../../assets/allons-icons/spinner.svg';
import CloseIcon from '../../assets/allons-icons/close-icon.svg';

import {
	addImageFromImageNodeToStorage,
	removeImageFromImageNode
} from '../../firebase'

import './ImageNode.css';

class ImageNode extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			type: IMAGE,
			id: this.props.id,
			stage: this.props.stage,
			imageLink: this.props.imageLink,
			loading: false,

			flashMessage: null,
			numberOfTimesClickedOnDelete: 0
		};

		this.onInputClose = this.onInputClose.bind(this);
		this.onImageRemoval = this.onImageRemoval.bind(this);
		this.onImageInputChange = this.onImageInputChange.bind(this);
	}

	onImageInputChange(e) {
		const selectedFile = e.target.files[0];

		// Allowed file formats: png, jpeg, and svg.
		if (selectedFile &&
			['image/png', 'image/jpeg', 'image/svg+xml'].includes(selectedFile.type)
		) {
			// Everything's fine.
			this.setState({ loading: true });

			// Adding the image to firebase
			addImageFromImageNodeToStorage(this.props.id, selectedFile)
			.then(({ url }) => {
				this.setState({
					imageLink: url,
					stage: IMAGE_NODE_HAS_IMAGE,
					loading: false
				}, () => {
					// Updating the section object containing this block.
					this.props.onChangeBlockContent(this.props.id, {
						type: IMAGE,
						id: this.props.id,
						stage: this.state.stage,
						imageLink: url
					}, IMAGE);
				});
			})
			.catch(() => {
				this.setState({
					flashMessage: 'An unknown error occurred. Try again in a few minutes.'
				})
			});

		} else if (selectedFile.type === 'application/pdf') {
			// If PDF, recommend using an external document (with link to user guide
			// with how to create one).
			this.setState({
				flashMessage: 'PDFs don\'t fit well here. Here\'s the best way to add PDFs within Allons: (link)',
				selectedFile: null
			});

			setTimeout(() => {
				this.setState({ flashMessage: null });
			}, 5000);
		} else {
			this.setState({
				flashMessage: 'Please, select a png, jpeg, or svg image. Thank you!',
				selectedFile: null
			});

			setTimeout(() => {
				this.setState({ flashMessage: null });
			}, 5000);
		}
	}

	onImageRemoval(e) {
		if (this.state.numberOfTimesClickedOnDelete === 0) {
			this.setState({
				numberOfTimesClickedOnDelete: 1
			});
		} else if (this.state.numberOfTimesClickedOnDelete === 1) {

			// Remove image from firebase storage.
			removeImageFromImageNode(this.props.id);

			// Updating the section object containing this block.
			// a.k.a this block will be deleted.
			this.props.removeBlock(e, this.props.id);
		}
	}

	onInputClose(e) {
		this.props.removeBlock(e, this.props.id);
	}

	render() {
		return(
			<div className='image-node'>
				{this.state.flashMessage && (
					<div className='flash-message'>
						{this.state.flashMessage}
					</div>
				)}

				{this.state.stage === IMAGE_NODE_NO_IMAGE && (
					<div className='image-node-input-container'>
						{this.state.loading ? (
							<img src={SpinnerIcon} className='spinner' alt='Spinner' />
						) : (
							<section>
								<button onClick={this.onInputClose}><img src={CloseIcon} alt='Remove'/></button>
								<div className='input-wrapper'>
									Choose file
									<input type='file' onChange={this.onImageInputChange}/>
								</div>
							</section>
						)}
					</div>
				)}

				{this.state.stage === IMAGE_NODE_HAS_IMAGE && (
					<div className='image-node-image-container'>
						<button onClick={this.onImageRemoval}>
							{this.state.numberOfTimesClickedOnDelete === 0 && (
								<img src={CloseIcon} alt='Remove'/>
							)}

							{this.state.numberOfTimesClickedOnDelete === 1 && (
								<span>Are you sure?</span>
							)}
						</button>
						<img
							className='img-content'
							src={this.state.imageLink}
							alt='Node content'
						/>
					</div>
				)}
			</div>
		)
	}
}

export default ImageNode;
