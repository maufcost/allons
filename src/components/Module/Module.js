import React from 'react';
import ContentEditable from 'react-contenteditable'

import Section from '../Section/Section'

import { updateUserModule } from '../../firebase'
import { generateRandomId } from '../../util/main_util'

import OneColumnOutlineIcon from '../../assets/allons-icons/one-column.svg';
import TwoColumnOutlineIcon from '../../assets/allons-icons/two-columns.svg';
import PrivateModuleIcon from '../../assets/allons-icons/private-lock.svg';
import GitHubIcon from '../../assets/allons-icons/github-icon.svg';
import CheckIcon from '../../assets/allons-icons/check-icon.svg';

import './Module.css';

class Module extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			moduleId: this.props.id,
			moduleName: this.props.name || "Default module name",
			sections: this.props.sections,
			videoMessageURL: this.props.videoMessageURL,
			audioMessageURL: this.props.audioMessageURL,
			isPublic: true,
			isSavingModule: false,
			shouldSave: false
		};

		this.moduleNameRef = React.createRef();
		this.moduleHeadlineRef = React.createRef();

		this.save = this.save.bind(this);
		this.updateSection = this.updateSection.bind(this);
		this.removeSection = this.removeSection.bind(this);
		this.handlePreview = this.handlePreview.bind(this);
		this.addAudioMessage = this.addAudioMessage.bind(this);
		this.addVideoMessage = this.addVideoMessage.bind(this);
		this.updateShouldSave = this.updateShouldSave.bind(this);
		this.handleNewSection = this.handleNewSection.bind(this);
		this.handleModuleNameChange = this.handleModuleNameChange.bind(this);
	}

	handleNewSection() {
		// Generate random id (that can be a React key)
		const newSection = {
			id: generateRandomId(),
			sectionTitle: 'My New Section Title!',
			blocks: []
		};

		// Append new section to sections object.
		let sections = this.state.sections;
		sections.push(newSection);
		this.setState({ sections });

		this.updateShouldSave();
	}

	updateSection(sectionId, sectionTitle, blocks) {
		// Find section that needs to be updated.
		const sections = this.state.sections;
		const section = sections.find(section => section.id === sectionId);

		if (typeof section !== 'undefined') {

			// Deciding whether to update the section's title or block or both.
			if (sectionTitle !== null) {
				section.sectionTitle = sectionTitle;
			}

			if (blocks !== null) {
				section.blocks = blocks;
			}

			// Putting section back to the sections state.
			this.setState({ sections: [...sections] });

			this.updateShouldSave();
		}else {
			console.log('[Module -> updateSection] Error')
		}
	}

	async save() {
		if (this.props.user) {

			this.setState({ shouldSave: false, isSavingModule: true });

			// Saving changes on firebase.
			await updateUserModule(this.props.user.uid, {
				id: this.props.id,
				name: this.state.moduleName,
				sections: this.state.sections
			});

			// Displaying updated changes
			this.props.updateModule({
				id: this.props.id,
				moduleName: this.state.moduleName,
				moduleSections: this.state.sections
			});

			// I'm adding this timeout after await above just so that users
			// aren't able to click on the save button multiple times at once.
			setTimeout(() => {
				this.setState({ isSavingModule: false });
			}, 2000);
		}else {
			console.log('[Module -> save] Error')
		}
	}

	removeSection(id) {
		const sections = this.state.sections;
		const section = sections.find(section => section.id === id);

		if (typeof section !== 'undefined') {
			const index = sections.indexOf(section);
			if (index > -1) {
				// Splice is done in-place
				sections.splice(index, 1);
			}else {
				console.log('[Module -> removeSection][2] Error');
			}
		}else {
			console.log('[Module -> removeSection][1] Error');
		}

		this.setState({ sections })

		this.updateShouldSave();
	}

	handleModuleNameChange(e) {
		this.setState({ moduleName: e.target.value });

		this.updateShouldSave();
	}

	handlePreview() {
		// window.open(`/${this.props.user.uid}/${this.state.moduleId}`);
		this.props.previewModule(this.props.user.uid, this.state.moduleId);
	}

	updateShouldSave() {
		this.setState({ shouldSave: true });
	}

	addAudioMessage() {
		this.props.openAddAudioMessageModal({
			moduleId: this.state.moduleId,
			userId: this.props.user.uid,
			embed: false,
			audioMessageURL: this.state.audioMessageURL
		});
	}

	addVideoMessage() {
		this.props.openAddVideoMessageModal({
			moduleId: this.state.moduleId,
			userId: this.props.user.uid,
			embed: false,
			videoMessageURL: this.state.videoMessageURL
		});
	}

	render() {
		const children = [];
		const sections = this.state.sections;

		for (let i = 0; i < sections.length; i++) {
			children.push(
				<Section
					key={sections[i].id}
					id={sections[i].id}
					title={sections[i].sectionTitle}
					blocks={sections[i].blocks}
					removeSection={this.removeSection}
					updateSection={this.updateSection}
				/>
			)
		}

		return (
			<div className="module">
				<header className='module-unofficial-header'>
					<button
						className='close-module-button'
						onClick={this.props.closeModule}
					>
						X
					</button>
					<div className='module-name-information'>
						<span>Module name:</span>
						<ContentEditable
							innerRef={this.moduleNameRef}
							html={this.state.moduleName}
							disabled={false}
							onChange={this.handleModuleNameChange}
							tagName='h1'
						/>
						<small>Your module name will be visible to your module viewers</small>
					</div>
					<div className='module-config'>
						<div>
							<button
								className={this.state.shouldSave ? 'should-save' : ''}
								onClick={this.save}
								disabled={this.state.isSavingModule}
							>
								{this.state.isSavingModule ? (
									<p>Saving for you, sunshine...</p>
								) : (
									<p>Save module</p>
								)}
							</button>
							<button
								className='message-button'
								onClick={this.addAudioMessage}
							>
								{this.state.audioMessageURL ? (
									<p>
										Add audio message <img src={CheckIcon} alt='Check'/>
									</p>
								) : (
									<p>Add audio message</p>
								)}
							</button>
							<button
								className='message-button'
								onClick={this.addVideoMessage}
							>
								{this.state.videoMessageURL ? (
									<p>
										Add video message <img src={CheckIcon} alt='Check'/>
									</p>
								) : (
									<p>Add video message</p>
								)}
							</button>
							<button onClick={this.handlePreview}>Preview module</button>
							<button onClick={this.handleNewSection}>Create section</button>
						</div>
						<div className='toolbar'>
							<button disabled className='toolbar-button'>
								<img
									src={OneColumnOutlineIcon}
									alt='Single column module outline'
								/>
							</button>
							<button disabled className='toolbar-button'>
								<img
									src={TwoColumnOutlineIcon}
									alt='Double column module outline'
								/>
							</button>
							<button disabled className='toolbar-button'>
								<img
									src={PrivateModuleIcon}
									alt='Private Module'
								/>
							</button>
							<button disabled className='toolbar-button'>
								<img
									src={GitHubIcon}
									alt='Private Module'
								/>
							</button>
						</div>
					</div>
				</header>

				<div className="sections">
					{children}
				</div>
			</div>
		)
	}
}

export default Module;
