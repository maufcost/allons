import React from 'react';
import { Router } from "@reach/router";

import SignUp from '../SignUp/SignUp';
import SignIn from '../SignIn/SignIn';
import Dashboard from '../Dashboard/Dashboard';
import ModuleViewer from '../ModuleViewer/ModuleViewer';
import AddVideoMessageModal from '../AddVideoMessageModal/AddVideoMessageModal';
import AddAudioMessageModal from '../AddAudioMessageModal/AddAudioMessageModal';

import './Main.css';

class Main extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			videoMessageModuleId: null,
			videoMessageUserId: null,
			openAddVideoMessageModal: false,

			audioMessageModuleId: null,
			audioMessageUserId: null,
			openAddAudioMessageModal: false
		};

		this.openAddVideoMessageModal = this.openAddVideoMessageModal.bind(this);
		this.closeAddVideoMessageModal = this.closeAddVideoMessageModal.bind(this);

		this.openAddAudioMessageModal = this.openAddAudioMessageModal.bind(this);
		this.closeAddAudioMessageModal = this.closeAddAudioMessageModal.bind(this);
	}

	openAddVideoMessageModal(moduleId, userId) {
		this.setState({
			openAddVideoMessageModal: true,
			videoMessageModuleId: moduleId,
			videoMessageUserId: userId
		});
	}

	closeAddVideoMessageModal() {
		this.setState({ openAddVideoMessageModal: false });
	}

	openAddAudioMessageModal(moduleId, userId) {
		this.setState({
			openAddAudioMessageModal: true,
			audioMessageModuleId: moduleId,
			audioMessageUserId: userId
		});
	}

	closeAddAudioMessageModal() {
		this.setState({ openAddAudioMessageModal: false });
	}

	render() {
		return(
			<div>
				<Router>
					<SignUp path='/signup' />

					<SignIn path='/signin' />

					<Dashboard
						path='/dashboard'
						openAddVideoMessageModal={this.openAddVideoMessageModal}
						openAddAudioMessageModal={this.openAddAudioMessageModal}
					/>

					<ModuleViewer path='/:userId/:moduleId' />
				</Router>

				{/* Modals */}
				{this.state.openAddVideoMessageModal && (
					<AddVideoMessageModal
						closeAddVideoMessageModal={this.closeAddVideoMessageModal}
						moduleId={this.state.videoMessageModuleId}
						userId={this.state.videoMessageUserId}
					/>
				)}

				{this.state.openAddAudioMessageModal && (
					<AddAudioMessageModal
						closeAddAudioMessageModal={this.closeAddAudioMessageModal}
						moduleId={this.state.audioMessageModuleId}
						userId={this.state.audioMessageUserId}
					/>
				)}
			</div>
		)
	}
}

export default Main;
