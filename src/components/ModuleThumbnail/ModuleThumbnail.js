import React from 'react'

import { deleteModule } from '../../firebase'

import './ModuleThumbnail.css'

import TrashIcon from '../../assets/allons-icons/trash.svg';

class ModuleThumbnail extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			numberOfTimesClickedOnDelete: 0
		};

		this.deleteModule = this.deleteModule.bind(this);
		this.handleModuleThumbnailClick = this.handleModuleThumbnailClick.bind(this);
	}

	handleModuleThumbnailClick() {
		const module = {
			id: this.props.id,
			moduleName: this.props.name,
			moduleSections: this.props.sections,
			videoMessageURL: this.props.videoMessageURL,
			audioMessageURL: this.props.audioMessageURL
		};
		this.props.showModule(module);
	}

	deleteModule(e) {
		e.stopPropagation();

		if (this.state.numberOfTimesClickedOnDelete === 0) {
			this.setState({ numberOfTimesClickedOnDelete: 1 });
		}

		if (this.state.numberOfTimesClickedOnDelete === 1) {
			// Delete module.
			deleteModule(
				this.props.user.uid,
				this.props.id,
			);

			this.props.updateModulesListAfterDeletion(this.props.id);
		}
	}

	render() {
		return (
			<div
				className='module-thumbnail'
				onClick={this.handleModuleThumbnailClick}
			>
				<p>{this.props.name}</p>
				<button onClick={this.deleteModule}>
					{this.state.numberOfTimesClickedOnDelete === 0 && (
						<img
							src={TrashIcon}
							alt='Delete module'
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

export default ModuleThumbnail;
