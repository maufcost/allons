import React from 'react';

import Play from '../../assets/allons-icons/play.svg';
import Pause from '../../assets/allons-icons/pause.svg';

import { uploadAudioMessage } from '../../firebase';
import { generateId } from '../../util/main_util';

import './AddAudioMessageModal.css';

let id;

class AddAudioMessageModal extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isRecordingStarted: false,
			isPreviewRecorded: false,
			isPreviewPlaying: false,
			countdown: 10,
			flashMessage: false
		};

		this.mediaRecorder = null;
		this.mediaStreamObj = null;
		this.audio = null;
		this.currentBlob = null;

		this.audioConstraintsObj = { audio: true, video: false };

		this.addAudioMessageToModule = this.addAudioMessageToModule.bind(this);
		this.startStopRecording = this.startStopRecording.bind(this);
		this.playPausePreview = this.playPausePreview.bind(this);
		this.startCountdown = this.startCountdown.bind(this);
		this.stopRecording = this.stopRecording.bind(this);
	}

	componentDidMount() {

		// User video stream retrieval setup
		navigator.mediaDevices.getUserMedia(this.audioConstraintsObj)
		.then((mediaStreamObj) => {

			this.mediaStreamObj = mediaStreamObj;

			// Updating the media recorder object to use the native MediaRecorder API.
			this.mediaRecorder = new MediaRecorder(mediaStreamObj);

			let chunks = [];

			// Recording.
			this.mediaRecorder.ondataavailable = (e) => {
				chunks.push(e.data);
			}

			// Taking care of the audio blob when the user stops recording.
			this.mediaRecorder.onstop = (e) => {

				const blob = new Blob(chunks, {'type': 'video/mp4'});
				chunks = [];
				const audioURL = window.URL.createObjectURL(blob);
				this.currentBlob = blob;

				this.audio = new Audio(audioURL);

				// Adding event listener to change play-to-pause icon
				this.audio.addEventListener('ended', () => {
					this.setState({ isPreviewPlaying: false });
				});
			}
		})
		.catch((error) => {
			console.log('Error: ', error)
		});
	}

	componentWillUnmount() {
		this.mediaStreamObj.getTracks().forEach((track) => {
			track.stop();
		})

		// To avoid those 'can't update state after component has been unmounted'
		// errors.
		clearInterval(id);
	}

	startStopRecording() {
		if (this.mediaRecorder) {
			if (this.state.isRecordingStarted) {

				// Stop recording
				this.stopRecording();

			}else {
				// Start recording
				this.mediaRecorder.start();
				// console.log('start', this.mediaRecorder.state);
				this.setState({ isRecordingStarted: true, countdown: 10 });

				// Start countdown.
				this.startCountdown();
			}
		}
	}

	stopRecording() {
		this.mediaRecorder.stop();
		// console.log('stop', this.mediaRecorder.state);
		this.setState({ isPreviewRecorded: true, isRecordingStarted: false });
	}

	playPausePreview() {
		if (this.state.isPreviewPlaying) {
			// Pause preview.
			if (this.audio) {
				this.audio.pause();
				this.setState({ isPreviewPlaying: false });
			}
		}else {
			// Play preview.
			if (this.audio) {
				this.audio.play();
				this.setState({ isPreviewPlaying: true });
			}
		}
	}

	startCountdown() {
		// Update timer
		id = setInterval(() => {
			this.setState({ countdown: this.state.countdown - 1 });
		}, 1000);

		// Stop recording
		setTimeout(() => {
			// Making sure the audio is still being recorded
			if (this.state.isRecordingStarted) {
				this.stopRecording();
			}
		}, 10000);
	}

	async addAudioMessageToModule() {
		// Uploading audio message to firebase.
		if (this.currentBlob) {
			await uploadAudioMessage(
				generateId(),
				this.currentBlob,
				this.props.moduleId,
				this.props.userId
			);

			this.setState({
				flashMessage: true,
				// To disable the add audio message button to prevent users
				// from clicking twice on it.
				isPreviewRecorded: false
			});
		}
	}

	generateEmbedCode() {

	}

	render() {
		return (
			<div>
				<div className='add-audio-message-modal-bg'></div>
				<div className='add-audio-message-modal'>
					<div className='add-audio-message-modal-inner'>
						<header>
							{this.props.moduleId ? (
								<p className='title'>Add a personalized audio message for your module viewers</p>
							): (
								<p className='title'>Add a personalized audio message to an external website</p>
							)}
							<br />
							<small>Allon is still in beta. That's why we are limiting messages to 10 seconds <b>for now</b>.</small>
							<button
								className='close-button'
								onClick={this.props.closeAddAudioMessageModal}
							>
								<p>X</p>
							</button>
						</header>

						{this.state.flashMessage && this.props.moduleId && (
							<div className='audio-message-flash-message'>
								<p>Your audio message has been successfully added to your module</p>
							</div>
						)}

						<div className='audios'>
							<div className='audio-area'>
								<div className='preview-container'>
									{this.state.isPreviewRecorded ? (
										<div className='preview'>
											<p>Here's the message preview:</p>
											<button onClick={this.playPausePreview}>
												<img
													src={this.state.isPreviewPlaying ? Pause : Play}
													alt='Play or Pause Audio Preview'
												/>
											</button>
										</div>
									) : (
										<p className='blank-preview'>Let's record your audio message :)</p>
									)}
								</div>
							</div>
						</div>

						<div className='toolbar'>
							<button
								className='start-record'
								onClick={this.startStopRecording}
							>
								{this.state.isRecordingStarted ? 'Stop recording' : 'Start recording' }
							</button>

							{this.props.moduleId ? (
								<button
									className='add-audio-message-to-module-button'
									onClick={this.addAudioMessageToModule}
									disabled={!this.state.isPreviewRecorded}
								>
									Add Audio Message to Module
								</button>
							): (
								<button
									className='add-audio-message-to-module-button'
									onClick={this.generateEmbedCode}
									disabled={!this.state.isPreviewRecorded}
								>
									Add Audio Message to Module
								</button>
							)}
							{this.state.isRecordingStarted && (
								<div className='timer'>
									<p>Time left: <b>{this.state.countdown}</b></p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default AddAudioMessageModal;
