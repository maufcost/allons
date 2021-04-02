// I refused to use a functional component + a hook to interact with firebase
// because it was delaying and stressing me out too much. That's why firebase
// stuff is here.
import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Play from '../../assets/allons-icons/play.svg';
import Pause from '../../assets/allons-icons/pause.svg';
import CloseIcon from '../../assets/allons-icons/close-icon.svg';

import {
	uploadVideoMessageToInstance,
	uploadEmbeddableMessageToUser
} from '../../firebase';

import {
	generateVideoMessageEmbedCode,
	VIDEO_MESSAGE
} from '../../util/main_util';

import './AddVideoMessageModal.css';

let id;
let currentTimeout;

class AddVideoMessageModal extends React.Component {
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

			videoMessageAddedToInstance: false,

			animationStyle: {
				opacity: 0,
				transition: 'opacity 2s ease'
			},

			copied: false
		};

		this.mediaRecorder = null;
		this.mediaStreamObj = null;
		this.currentBlob = null;

		this.videoConstraintsObj = {
			audio: true,
			video: {
				facingMode: "user",
				width: { min: 640, ideal: 1280, max: 1920 },
				height: { min: 480, ideal: 720, max: 1080 }
			}
		};

		this.videoRecordRef = React.createRef();
		this.videoPreviewRef = React.createRef();
		this.lastMessageVideoRef = React.createRef();

		this.addVideoMessageToInstance = this.addVideoMessageToInstance.bind(this);
		this.onBlockVideoPermission = this.onBlockVideoPermission.bind(this);
		this.handlePreviewInstance = this.handlePreviewInstance.bind(this);
		this.playPauseLastMessage = this.playPauseLastMessage.bind(this);
		this.startStopRecording = this.startStopRecording.bind(this);
		this.generateEmbedCode = this.generateEmbedCode.bind(this);
		this.playPausePreview = this.playPausePreview.bind(this);
		this.startCountdown = this.startCountdown.bind(this);
		this.stopRecording = this.stopRecording.bind(this);
	}

	componentDidMount() {

		// User video stream retrieval setup
		navigator.mediaDevices.getUserMedia(this.videoConstraintsObj)
		.then((mediaStreamObj) => {

			this.mediaStreamObj = mediaStreamObj;

			const videoRec = this.videoRecordRef.current

			// Connecting the camera stream to the first video element.
			if ('srcObject' in videoRec) {
				videoRec.srcObject = mediaStreamObj;
			}else {
				// Old version
				videoRec.src = window.URL.createObjectURL(mediaStreamObj);
			}

			// Updates continuously the video on the video tag what's being capture by camera.
			videoRec.onloadedmetadata = (e) => {
				videoRec.play();
			}

			// Updating the media recorder object to use the native MediaRecorder API.
			this.mediaRecorder = new MediaRecorder(mediaStreamObj);

			let chunks = [];

			// Recording.
			this.mediaRecorder.ondataavailable = (e) => {
				chunks.push(e.data);
			}

			// Showing video preview on preview video.
			this.mediaRecorder.onstop = (e) => {
				let blob = new Blob(chunks, {'type': 'video/mp4'});
				chunks = [];
				let videoURL = window.URL.createObjectURL(blob);
				this.videoPreviewRef.current.src = videoURL;
				this.currentBlob = blob;
			}
		})
		.catch((error) => {
			// console.log('Error: ', error)
			this.onBlockVideoPermission();
		})

		// Listening to when the video preview ends.
		if (this.videoPreviewRef !== null && this.videoPreviewRef.current !== null) {
			this.videoPreviewRef.current.addEventListener('ended', () => {
				this.setState({ isPreviewPlaying: false });
			})
		}

		// Listening to when the last message video ends.
		if (this.lastMessageVideoRef !== null && this.lastMessageVideoRef.current !== null) {
			this.lastMessageVideoRef.current.addEventListener('ended', () => {
				this.setState({ isLastMessagePlaying: false });
			})
		}

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

	onBlockVideoPermission() {
		this.setState({
			hasFlashMessage: true,
			flashMessage: "Make sure to give Allons permission to see you :)"
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
			this.videoPreviewRef.current.pause();
			this.setState({ isPreviewPlaying: false });
		}else {
			// Play preview.
			this.videoPreviewRef.current.play();
			this.setState({ isPreviewPlaying: true });
		}
	}

	playPauseLastMessage() {
		if (this.state.isLastMessagePlaying) {
			// Pause preview.
			this.lastMessageVideoRef.current.pause();
			this.setState({ isLastMessagePlaying: false });
		}else {
			// Play preview.
			this.lastMessageVideoRef.current.play();
			this.setState({ isLastMessagePlaying: true });
		}
	}

	startCountdown() {
		// Update timer
		id = setInterval(() => {
			this.setState({ countdown: this.state.countdown - 1 });
		}, 1000);

		// Stop recording
		currentTimeout = setTimeout(() => {
			// Making sure the video is still being recorded
			if (this.state.isRecordingStarted) {
				this.stopRecording();
			}
		}, 10000);
	}

	async addVideoMessageToInstance() {
		// Uploading video message to firebase.
		if (this.currentBlob) {
			await uploadVideoMessageToInstance(
				'video_msg_' + this.props.id,
				this.currentBlob,
				this.props.id,
				this.props.userId,
				this.props.instanceType
			);

			setTimeout(() => {
				this.setState({
					hasFlashMessage: true,
					flashMessage: `Your video message has been successfully added to your ${this.props.instanceType}`,
					// To disable the add video message button to prevent users
					// from clicking twice on it.
					isPreviewRecorded: false,
					videoMessageAddedToInstance: true
				});
			})
		}
	}

	handlePreviewInstance() {
		this.props.previewInstance(this.props.userId, this.props.instanceType, this.props.id);
	}

	async generateEmbedCode() {
		if (this.currentBlob) {
			await uploadEmbeddableMessageToUser(
				'embed_video_msg_' + this.props.userId, // message-id
				this.currentBlob,
				this.props.userId,
				VIDEO_MESSAGE
			);

			this.setState({
				hasFlashMessage: true,
				flashMessage: 'Your video message embed code has been successfully generated.',
				// To disable the add video message button to prevent users
				// from clicking twice on it.
				isPreviewRecorded: false,
				videoMessageAddedToInstance: true
			});
		}
	}

	render() {
		let className = 'videos';
		className += this.props.lastVideoMessageURL ? ' add-extra-fr' : '';

		let postRecordingButton = (
			<button
				className='add-video-message-to-module-button'
				onClick={this.handlePreviewInstance}
			>
				Preview {this.props.instanceType} with new video message
			</button>
		)

		if (!this.props.id) {
			let postRecordingButtonContent =
				this.state.copied ?  'Copied! Have fun, sweetie' : 'Copy embed code to clipboard'

			postRecordingButton = (
				<CopyToClipboard
					text={generateVideoMessageEmbedCode(this.props.userId)}
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
				<div className='add-video-message-modal-bg'></div>
				<div className='add-video-message-modal' style={this.state.animationStyle}>
					<div className='add-video-message-modal-inner'>
						<header>
							<div className='text'>
								{this.props.id ? (
									<p className='title'>Add a personalized video message <br/><span>for your {this.props.instanceType} viewers</span></p>
								) : (
									<p className='title'>Add a personalized video message to an external website</p>
								)}
								<br/>
								<small>Allon is still in beta. That's why we are limiting messages to 10 seconds <b>for now</b>.</small>
							</div>
							<button
								className='close-button'
								onClick={this.props.closeAddVideoMessageModal}
							>
								<p><img src={CloseIcon} alt='Close modal' /></p>
							</button>
						</header>

						{this.state.hasFlashMessage && this.props.id && (
							<div className='video-message-flash-message'>
								<p>{this.state.flashMessage}</p>
							</div>
						)}

						<div className={className}>
							{this.props.lastVideoMessageURL && (
								<div id='last-message-video-area' className='video-area'>
									{this.props.id ? (
										<p>Here's the last video message you added to this {this.props.instanceType}</p>
									): (
										<p>Here's your last embedded video message</p>
									)}
									<div className='video-wrapper-controls'>
										<div className='video-wrapper'>
											<video
												className='video-last-message'
												ref={this.lastMessageVideoRef}
											>
												<source src={this.props.lastVideoMessageURL} type="video/mp4" />
											</video>
										</div>
										<button
											className='play-pause-preview-button'
											onClick={this.playPauseLastMessage}
										>
											<img
												src={this.state.isLastMessagePlaying ? Pause : Play}
												className='play-pause-img'
												alt='Play or Pause Video Message Preview'
											/>
										</button>
									</div>
									<small>Any other video messages that you add to your {this.props.instanceType} will automatically override this one</small>
								</div>
							)}

							<div className='video-area'>
								<p>Here's how you look now:</p>
								<div className='video-wrapper'>
									<video
										className='video-record'
										ref={this.videoRecordRef}
										muted
									></video>
								</div>
							</div>

							<div className='video-area'>
								<p>Here's the new message preview:</p>
								<div className='video-wrapper-controls'>
									<div className='video-wrapper'>
										<video
											className='video-preview'
											ref={this.videoPreviewRef}
										></video>
									</div>
									{this.state.isPreviewRecorded && (
										<button
											className='play-pause-preview-button'
											onClick={this.playPausePreview}
										>
											<img
												src={this.state.isPreviewPlaying ? Pause : Play}
												className='play-pause-img'
												alt='Play or Pause Video Message Preview'
											/>
										</button>
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

							{/* Add video message to module/generate embed code */}
							{this.props.id ? (
								<button
									className='add-video-message-to-module-button'
									onClick={this.addVideoMessageToInstance}
									disabled={!this.state.isPreviewRecorded}
								>
									Add video message to {this.props.instanceType}
								</button>
							) : (
								<button
									className='add-video-message-to-module-button'
									onClick={this.generateEmbedCode}
									disabled={!this.state.isPreviewRecorded}
								>
									Generate embed code
								</button>
							)}

							{/* Preview module/doc OR generate embed code */}
							{this.state.videoMessageAddedToInstance && postRecordingButton}

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

export default AddVideoMessageModal;
