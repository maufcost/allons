import React from 'react';

import { retrieveSomeUsers } from '../../firebase';

import './BlockViewer.css';

class BlockViewer extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			mentionObjects: []
		};
	}

	async componentDidMount() {
		if (this.props.mentions &&
			this.props.mentions.length > 0
		) {
			const mentionObjects = await retrieveSomeUsers(this.props.mentions)
			this.setState({ mentionObjects: [...mentionObjects] });
		}
	}

	async componentDidUpdate(prevState, prevProps) {
		// this.props.mentions is an array of user emails. Let's retrieve the user
		// objects based on these emails (we mostly need the display name and their
		// profile photo url).
		if (this.props.mentions &&
			this.props.mentions.length > 0 &&
			this.state.mentionObjects.length === 0
		) {
			const mentionObjects = await retrieveSomeUsers(this.props.mentions)
			this.setState({ mentionObjects: [...mentionObjects] });
		}
	}

	render() {
		const onClickFn = this.props.renderEditorBlock ? this.props.renderEditorBlock : null;

		const mentionSection = this.state.mentionObjects.map((user, ix) => {
			// Still don't know if I'm going to put the display name in the UI though.
			return (
				<div className='mention-picture-wrapper' key={ix}>
					<img className='mention-profile-picture' src={user.photoURL} alt='User'/>
					{/* <p>{user.displayName}</p> */}
				</div>
			)
		});

		// There are some hover animations on BlockViewer that I just want to
		// work when BlockViewer is used on the Editor.
		const hover = this.props.isUsedOnEditor ? 'add-hover' : '';
		const className = 'module-viewer-block ' + hover;

		return (
			<div
				className={className}
				onClick={onClickFn}
			>
				<div
					className='block-content'
					dangerouslySetInnerHTML={{__html: this.props.content}}
				></div>
				<div className='mentions'>
					{mentionSection}
				</div>
			</div>
		)
	}
}

export default BlockViewer;
