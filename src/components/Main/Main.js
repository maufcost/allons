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
import ShareModal from '../ShareModal/ShareModal';
import UserGuide from '../UserGuide/UserGuide';

import './Main.css';

class Main extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			videoMessageInstanceId: null,
			videoMessageUserId: null,
			openAddVideoMessageModal: false,
			lastVideoMessageURL: null,
			isUserPro: false,

			audioMessageInstanceId: null,
			audioMessageUserId: null,
			openAddAudioMessageModal: false,
			lastAudioMessageURL: null,

			openShareModal: false,
			instanceLink: 'https://allons.tech',

			instanceType: null,
			instanceId: null
		};

		this.openAddVideoMessageModal = this.openAddVideoMessageModal.bind(this);
		this.closeAddVideoMessageModal = this.closeAddVideoMessageModal.bind(this);

		this.openAddAudioMessageModal = this.openAddAudioMessageModal.bind(this);
		this.closeAddAudioMessageModal = this.closeAddAudioMessageModal.bind(this);

		this.openShareModal = this.openShareModal.bind(this);
		this.closeShareModal = this.closeShareModal.bind(this);
	}

	// componentDidMount() {
	// 	console.log(window.top.location.href)
	// }

	openAddVideoMessageModal({ instanceId, user, embed, videoMessageURL, instanceType }) {
		if (embed) {
			// User is generating an embed code with the message for a non-allons
			// website.
			this.setState({
				openAddVideoMessageModal: true,
				videoMessageUserId: user.uid,
				isUserPro: user.isPro,
				lastVideoMessageURL: videoMessageURL,
				instanceId: null,
				instanceType: null,
			});
		}else {
			// User is adding a video message on an allons module or external doc.
			this.setState({
				openAddVideoMessageModal: true,
				videoMessageUserId: user.uid,
				isUserPro: user.isPro,
				lastVideoMessageURL: videoMessageURL,
				instanceId,
				instanceType
			});
		}
	}

	closeAddVideoMessageModal() {
		this.setState({ openAddVideoMessageModal: false });
	}

	openAddAudioMessageModal({ instanceId, user, embed, audioMessageURL, instanceType }) {
		if (embed) {
			// User is generating an embed code with the message for a non-allons
			// website.
			this.setState({
				openAddAudioMessageModal: true,
				audioMessageUserId: user.uid,
				isUserPro: user.isPro,
				lastAudioMessageURL: audioMessageURL,
				instanceId: null,
				instanceType: null
			});
		}else {
			// User is adding an audio message on an allons module or external doc.
			this.setState({
				openAddAudioMessageModal: true,
				audioMessageUserId: user.uid,
				isUserPro: user.isPro,
				lastAudioMessageURL: audioMessageURL,
				instanceId,
				instanceType
			});
		}
	}

	closeAddAudioMessageModal() {
		this.setState({ openAddAudioMessageModal: false });
	}

	previewInstance(uid, instanceType, instanceId, flag) {
		if (flag) {
			window.open(`/${uid}/${instanceType}/${instanceId}?author-preview=${flag}`);
		}else {
			window.open(`/${uid}/${instanceType}/${instanceId}`);
		}
	}

	openShareModal(instanceType, instanceLink) {
		this.setState({ openShareModal: true, instanceType, instanceLink });
	}

	closeShareModal() {
		this.setState({ openShareModal: false });
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

					<UserGuide path='/user-guide' />

					<Dashboard
						path='/dashboard'
						openAddVideoMessageModal={this.openAddVideoMessageModal}
						openAddAudioMessageModal={this.openAddAudioMessageModal}
						previewInstance={this.previewInstance}
						openShareModal={this.openShareModal}
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
						isUserPro={this.state.isUserPro}
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
						isUserPro={this.state.isUserPro}
						lastAudioMessageURL={this.state.lastAudioMessageURL}
						instanceType={this.state.instanceType}
						closeAddAudioMessageModal={this.closeAddAudioMessageModal}
						previewInstance={this.previewInstance}
					/>
				)}

				{this.state.openShareModal && (
					<ShareModal
						instanceType={this.state.instanceType}
						instanceLink={this.state.instanceLink}
						closeShareModal={this.closeShareModal}
					/>
				)}
			</div>
		)
	}
}

export default Main;
