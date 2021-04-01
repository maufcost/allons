import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Play from '../../assets/allons-icons/play.svg';
import Pause from '../../assets/allons-icons/pause.svg';
import CloseIcon from '../../assets/allons-icons/close-icon.svg';

import {
	uploadAudioMessage,
	uploadEmbeddableMessageToUser
} from '../../firebase';

import {
	generateAudioMessageEmbedCode,
	AUDIO_MESSAGE
} from '../../util/main_util';

import './AddAudioMessageModal.css';

let id;
let currentTimeout;

class AddAudioMessageModal extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isRecordingStarted: false,
			isPreviewRecorded: false,
			isPreviewPlaying: false,
			isLastMessagePlaying: false,

			countdown: 10,

			hasFlashMessage: false,
			flashMessage: '',

			audioMessageAddedToInstance: false,

			animationStyle: {
				opacity: 0,
				transition: 'opacity 2s ease'
			},

			copied: false
		};

		this.mediaRecorder = null;
		this.mediaStreamObj = null;
		this.previewAudio = null;
		this.lastMessageAudio = null;
		this.currentBlob = null;

		this.audioConstraintsObj = { audio: true, video: false };

		this.addAudioMessageToInstance = this.addAudioMessageToInstance.bind(this);
		this.onBlockAudioPermission = this.onBlockAudioPermission.bind(this);
		this.handlePreviewInstance = this.handlePreviewInstance.bind(this);
		this.playPauseLastMessage = this.playPauseLastMessage.bind(this);
		this.startStopRecording = this.startStopRecording.bind(this);
		this.generateEmbedCode = this.generateEmbedCode.bind(this);
		this.playPausePreview = this.playPausePreview.bind(this);
		this.startCountdown = this.startCountdown.bind(this);
		this.stopRecording = this.stopRecording.bind(this);
	}

	componentDidMount() {
		// Taking care of the last audio message (if any).
		if (this.props.lastAudioMessageURL !== null &&
			typeof this.props.lastAudioMessageURL !== 'undefined'
		) {
			this.lastMessageAudio = new Audio(this.props.lastAudioMessageURL);

			this.lastMessageAudio.addEventListener('ended', () => {
				this.setState({ isLastMessagePlaying: false });
			});
		}

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

			this.mediaRecorder.onstop = (e) => {

				// Taking care of the audio preview blob when the user stops recording.
				const blob = new Blob(chunks, {'type': 'video/mp4'});
				chunks = [];
				const audioURL = window.URL.createObjectURL(blob);
				this.currentBlob = blob;

				this.previewAudio = new Audio(audioURL);

				// Adding event listener to change play-to-pause icon
				this.previewAudio.addEventListener('ended', () => {
					this.setState({ isPreviewPlaying: false });
				});
			}
		})
		.catch((error) => {
			// console.log('Error: ', error)
			this.onBlockAudioPermission();
		});

		// Setting up fade-in animation
		setTimeout(() => {
			this.setState({
				animationStyle: {
					opacity: 1,
					transition: 'opacity 2s ease'
				}
			});
		}, 500);
	}

	componentWillUnmount() {
		if (this.mediaStreamObj) {
			this.mediaStreamObj.getTracks().forEach((track) => {
				track.stop();
			});
		}

		// To avoid those 'can't update state after component has been unmounted'
		// errors.
		clearInterval(id);
	}

	onBlockAudioPermission() {
		this.setState({
			hasFlashMessage: true,
			flashMessage: "Make sure to give Allons permission to listen to you"
		})
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
				this.setState({
					isRecordingStarted: true,
					countdown: 10,
					copied: false
				});

				// Start countdown.
				this.startCountdown();
			}
		}
	}

	stopRecording() {
		clearInterval(id);
		clearTimeout(currentTimeout);

		this.mediaRecorder.stop();

		this.setState({
			isPreviewRecorded: true,
			isRecordingStarted: false,
			countdown: 10
		});
	}

	playPausePreview() {
		if (this.state.isPreviewPlaying) {
			// Pause preview.
			if (this.previewAudio) {
				this.previewAudio.pause();
				this.setState({ isPreviewPlaying: false });
			}
		}else {
			// Play preview.
			if (this.previewAudio) {
				this.previewAudio.play();
				this.setState({ isPreviewPlaying: true });
			}
		}
	}

	playPauseLastMessage() {
		if (this.state.isLastMessagePlaying) {
			// Pause last message audio.
			if (this.lastMessageAudio) {
				this.lastMessageAudio.pause();
				this.setState({ isLastMessagePlaying: false });
			}
		}else {
			// Play last message audio.
			if (this.lastMessageAudio) {
				this.lastMessageAudio.play();
				this.setState({ isLastMessagePlaying: true });
			}
		}
	}

	startCountdown() {
		// Update timer
		id = setInterval(() => {
			this.setState({ countdown: this.state.countdown - 1 });
		}, 1000);

		// Stop recording
		currentTimeout = setTimeout(() => {
			// Making sure the audio is still being recorded
			if (this.state.isRecordingStarted) {
				this.stopRecording();
			}
		}, 10000);
	}

	async addAudioMessageToInstance() {
		// Uploading audio message to firebase.
		if (this.currentBlob) {
			await uploadAudioMessage(
				'audio_msg_' + this.props.userId,
				this.currentBlob,
				this.props.id,
				this.props.userId,
				this.props.instanceType
			);

			this.setState({
				hasFlashMessage: true,
				flashMessage: `Your new audio message has been successfully added to your ${this.props.instanceType}`,
				// To disable the add audio message button to prevent users
				// from clicking twice on it.
				isPreviewRecorded: false,
				audioMessageAddedToInstance: true
			});
		}
	}

	handlePreviewInstance() {
		this.props.previewInstance(this.props.userId, this.props.instanceType, this.props.id);
	}

	async generateEmbedCode() {
		if (this.currentBlob) {
			await uploadEmbeddableMessageToUser(
				'embed_audio_msg_' + this.props.userId,
				this.currentBlob,
				this.props.userId,
				AUDIO_MESSAGE
			);

			this.setState({
				hasFlashMessage: true,
				flashMessage: 'Your audio message embed code has been successfully generated.',
				// To disable the add audio message button to prevent users
				// from clicking twice on it.
				isPreviewRecorded: false,
				audioMessageAddedToInstance: true
			});
		}
	}

	render() {
		let className = 'audios';
		className += this.props.lastAudioMessageURL ? ' add-extra-fr' : '';

		let postRecordingButton = (
			<button
				className='add-audio-message-to-module-button'
				onClick={this.handlePreviewInstance}
			>
				Preview {this.props.instanceType} with new audio message
			</button>
		)

		if (!this.props.id) {
			let postRecordingButtonContent =
				this.state.copied ?  'Copied! Have fun, sweetie' : 'Copy embed code to clipboard'

			postRecordingButton = (
				<CopyToClipboard
					text={generateAudioMessageEmbedCode(this.props.userId)}
					onCopy={() => this.setState({ copied: true })}
				>
					<button className='copy-embed-code-button'>
						{postRecordingButtonContent}
					</button>
				</CopyToClipboard>
			)
		}

		return (
			<div>
				<div className='add-audio-message-modal-bg'></div>
				<div className='add-audio-message-modal' style={this.state.animationStyle}>
					<div className='add-audio-message-modal-inner'>
						<header>
							<div className='text'>
								{this.props.id ? (
									<p className='title'>Add a personalized audio message <br/><span>for your {this.props.instanceType} viewers</span></p>
								): (
									<p className='title'>Add a personalized audio message to an external website</p>
								)}
								<br />
								<small>Allon is still in beta. That's why we are limiting messages to 10 seconds <b>for now</b>.</small>
							</div>
							<button
								className='close-button'
								onClick={this.props.closeAddAudioMessageModal}
							>
								<p><img src={CloseIcon} alt='Close modal' /></p>
							</button>
						</header>

						{this.state.flashMessage && this.props.id && (
							<div className='audio-message-flash-message'>
								<p>{this.state.flashMessage}</p>
							</div>
						)}

						<div className={className}>

							{this.props.lastAudioMessageURL && (
								<div id='last-audio-message-area' className='audio-area'>
									{this.props.id ? (
										<p>Here's the last audio message you added to this {this.props.instanceType}</p>
									) : (
										<p>Here's your last embedded audio message</p>
									)}
									<button
										onClick={this.playPauseLastMessage}
									>
										<img
											src={this.state.isLastMessagePlaying ? Pause : Play}
											alt='Play or Pause Audio Preview'
										/>
									</button>
									<small>Any other audio messages that you add to your {this.props.instanceType} will automatically override this one</small>
								</div>
							)}

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
										<p className='blank-preview'>Let's record your new audio message :)</p>
									)}
								</div>
							</div>
						</div>

						<div className='toolbar'>

							{/* Start/Stop recording */}
							<button
								className='start-record'
								onClick={this.startStopRecording}
							>
								{this.state.isRecordingStarted ? 'Stop recording' : 'Start recording' }
							</button>

							{/* Add audio message to module/Generate embed code */}
							{this.props.id ? (
								<button
									className='add-audio-message-to-module-button'
									onClick={this.addAudioMessageToInstance}
									disabled={!this.state.isPreviewRecorded}
								>
									Add audio message to {this.props.instanceType}
								</button>
							): (
								<button
									className='add-audio-message-to-module-button'
									onClick={this.generateEmbedCode}
									disabled={!this.state.isPreviewRecorded}
								>
									Generate embed code
								</button>
							)}

							{/* Preview module/doc OR generate embed code */}
							{this.state.audioMessageAddedToInstance && postRecordingButton}

							{/* Timer */}
							{this.state.isRecordingStarted && (
								<div className='timer'>
									<span className='red-recording'></span>
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
