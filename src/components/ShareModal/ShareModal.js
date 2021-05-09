import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard';

import CloseIcon from '../../assets/allons-icons/close-icon.svg';

import './ShareModal.css'

class ShareModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = { copied: false };
	}

	render() {
		const copyButtonContent = this.state.copied ? 'Copied!' : 'Copy link'

		return (
			<div className='share-modal-bg'>
				<div className='share-modal'>
					<button
						className='close-button'
						onClick={this.props.closeShareModal}
					>
						<img
							src={CloseIcon}
							alt='Close modal'
						/>
					</button>
					<h1>Share your {this.props.instanceType} with others</h1>
					<span>{this.props.instanceLink}</span><br/>
					<CopyToClipboard
						text={this.props.instanceLink}
						onCopy={() => this.setState({ copied: true })}
					>
						<button className='copy-button'>
							{copyButtonContent}
						</button>
					</CopyToClipboard>
					<br/>
					<small>Soon you will be able to share modules automatically through email and Twitter</small>
				</div>
			</div>
		)
	}
}

export default ShareModal;
