import React from 'react';
import { Router } from "@reach/router";

import Landing from '../Landing/Landing';
import SignUp from '../SignUp/SignUp';
import SignIn from '../SignIn/SignIn';
import Dashboard from '../Dashboard/Dashboard';
import ModuleViewer from '../ModuleViewer/ModuleViewer';
import Loading from '../Loading/Loading';
import AddVideoMessageModal from '../AddVideoMessageModal/AddVideoMessageModal';
import AddAudioMessageModal from '../AddAudioMessageModal/AddAudioMessageModal';
import EmbeddableMessage from '../EmbeddableMessage/EmbeddableMessage';
// import { auth } from '../../firebase'

import './Main.css';

class Main extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			videoMessageModuleId: null,
			videoMessageUserId: null,
			openAddVideoMessageModal: false,
			lastVideoMessageURL: null,

			audioMessageModuleId: null,
			audioMessageUserId: null,
			openAddAudioMessageModal: false,
			lastAudioMessageURL: null
		};

		this.openAddVideoMessageModal = this.openAddVideoMessageModal.bind(this);
		this.closeAddVideoMessageModal = this.closeAddVideoMessageModal.bind(this);

		this.openAddAudioMessageModal = this.openAddAudioMessageModal.bind(this);
		this.closeAddAudioMessageModal = this.closeAddAudioMessageModal.bind(this);
	}

	// componentDidMount() {
	// 	console.log(auth.currentUser);
	// }

	openAddVideoMessageModal({ moduleId, userId, embed, videoMessageURL }) {
		if (embed) {
			// User is generating an embed code with the message for a non-allons
			// module.
			this.setState({
				openAddVideoMessageModal: true,
				videoMessageModuleId: null,
				videoMessageUserId: userId
			});
		}else {
			// User is adding a video message on an allons module.
			this.setState({
				openAddVideoMessageModal: true,
				videoMessageModuleId: moduleId,
				videoMessageUserId: userId,
				lastVideoMessageURL: videoMessageURL
			});
		}
	}

	closeAddVideoMessageModal() {
		this.setState({ openAddVideoMessageModal: false });
	}

	openAddAudioMessageModal({ moduleId, userId, embed, audioMessageURL }) {
		if (embed) {
			// User is generating an embed code with the message for a non-allons
			// module.
			this.setState({
				openAddAudioMessageModal: true,
				audioMessageModuleId: null,
				audioMessageUserId: userId
			});
		}else {
			// User is adding an audio message on an allons module.
			this.setState({
				openAddAudioMessageModal: true,
				audioMessageModuleId: moduleId,
				audioMessageUserId: userId,
				lastAudioMessageURL: audioMessageURL
			});
		}
	}

	closeAddAudioMessageModal() {
		this.setState({ openAddAudioMessageModal: false });
	}

	previewModule(uid, moduleId) {
		window.open(`/${uid}/${moduleId}`);
	}

	render() {
		return(
			<div>
				<Router>
					<Landing
						path='/'
					/>

					<SignUp path='/signup' />

					<SignIn path='/signin' />

					<Dashboard
						path='/dashboard'
						openAddVideoMessageModal={this.openAddVideoMessageModal}
						openAddAudioMessageModal={this.openAddAudioMessageModal}
						previewModule={this.previewModule}
					/>

					<ModuleViewer path='/:userId/:moduleId' />

					<EmbeddableMessage path='msg' />
				</Router>

				{/* Loading */}
				{this.state.showLoadingAnimation && (
					<Loading />
				)}

				{/* Modals */}
				{this.state.openAddVideoMessageModal && (
					<AddVideoMessageModal
						closeAddVideoMessageModal={this.closeAddVideoMessageModal}
						moduleId={this.state.videoMessageModuleId}
						userId={this.state.videoMessageUserId}
						lastVideoMessageURL={this.state.lastVideoMessageURL}
						previewModule={this.previewModule}
					/>
				)}

				{this.state.openAddAudioMessageModal && (
					<AddAudioMessageModal
						closeAddAudioMessageModal={this.closeAddAudioMessageModal}
						moduleId={this.state.audioMessageModuleId}
						userId={this.state.audioMessageUserId}
						lastAudioMessageURL={this.state.lastAudioMessageURL}
						previewModule={this.previewModule}
					/>
				)}
			</div>
		)
	}
}

export default Main;
