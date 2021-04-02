import React from 'react';
import { Router } from "@reach/router";

import Landing from '../Landing/Landing';
import SignUp from '../SignUp/SignUp';
import SignIn from '../SignIn/SignIn';
import Dashboard from '../Dashboard/Dashboard';
import Viewer from '../Viewer/Viewer';
import Loading from '../Loading/Loading';
import AddVideoMessageModal from '../AddVideoMessageModal/AddVideoMessageModal';
import AddAudioMessageModal from '../AddAudioMessageModal/AddAudioMessageModal';
import EmbeddableMessage from '../EmbeddableMessage/EmbeddableMessage';

import './Main.css';

class Main extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			videoMessageInstanceId: null,
			videoMessageUserId: null,
			openAddVideoMessageModal: false,
			lastVideoMessageURL: null,

			audioMessageInstanceId: null,
			audioMessageUserId: null,
			openAddAudioMessageModal: false,
			lastAudioMessageURL: null,

			instanceType: null,
			instanceId: null
		};

		this.openAddVideoMessageModal = this.openAddVideoMessageModal.bind(this);
		this.closeAddVideoMessageModal = this.closeAddVideoMessageModal.bind(this);

		this.openAddAudioMessageModal = this.openAddAudioMessageModal.bind(this);
		this.closeAddAudioMessageModal = this.closeAddAudioMessageModal.bind(this);
	}

	// componentDidMount() {
	// 	console.log(auth.currentUser);
	// }

	openAddVideoMessageModal({ instanceId, userId, embed, videoMessageURL, instanceType }) {
		if (embed) {
			// User is generating an embed code with the message for a non-allons
			// website.
			this.setState({
				openAddVideoMessageModal: true,
				videoMessageUserId: userId,
				lastVideoMessageURL: videoMessageURL,
				instanceId: null,
				instanceType: null,
			});
		}else {
			// User is adding a video message on an allons module or external doc.
			this.setState({
				openAddVideoMessageModal: true,
				videoMessageUserId: userId,
				lastVideoMessageURL: videoMessageURL,
				instanceId,
				instanceType
			});
		}
	}

	closeAddVideoMessageModal() {
		this.setState({ openAddVideoMessageModal: false });
	}

	openAddAudioMessageModal({ instanceId, userId, embed, audioMessageURL, instanceType }) {
		if (embed) {
			// User is generating an embed code with the message for a non-allons
			// website.
			this.setState({
				openAddAudioMessageModal: true,
				audioMessageUserId: userId,
				lastAudioMessageURL: audioMessageURL,
				instanceId: null,
				instanceType: null
			});
		}else {
			// User is adding an audio message on an allons module or external doc.
			this.setState({
				openAddAudioMessageModal: true,
				audioMessageUserId: userId,
				lastAudioMessageURL: audioMessageURL,
				instanceId,
				instanceType
			});
		}
	}

	closeAddAudioMessageModal() {
		this.setState({ openAddAudioMessageModal: false });
	}

	previewInstance(uid, instanceType, instanceId) {
		window.open(`/${uid}/${instanceType}/${instanceId}`);
	}

	render() {
		return(
			<div className='main-app'>
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
						previewInstance={this.previewInstance}
					/>

					<Viewer path='/:userId/:instanceType/:instanceId/' />

					<EmbeddableMessage path='msg/:msgType/:userId' />
				</Router>

				{/* Loading */}
				{this.state.showLoadingAnimation && (
					<Loading />
				)}

				{/* Modals */}
				{this.state.openAddVideoMessageModal && (
					<AddVideoMessageModal
						id={this.state.instanceId}
						userId={this.state.videoMessageUserId}
						lastVideoMessageURL={this.state.lastVideoMessageURL}
						instanceType={this.state.instanceType}
						previewInstance={this.previewInstance}
						closeAddVideoMessageModal={this.closeAddVideoMessageModal}
					/>
				)}

				{this.state.openAddAudioMessageModal && (
					<AddAudioMessageModal
						id={this.state.instanceId}
						userId={this.state.audioMessageUserId}
						lastAudioMessageURL={this.state.lastAudioMessageURL}
						instanceType={this.state.instanceType}
						closeAddAudioMessageModal={this.closeAddAudioMessageModal}
						previewInstance={this.previewInstance}
					/>
				)}
			</div>
		)
	}
}

export default Main;
