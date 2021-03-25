// I refused to use a functional component + a hook to interact with firebase
// because it was delaying and stressing me out too much. That's why firebase
// stuff is here.
import React from 'react';

import Play from '../../assets/allons-icons/play.svg';
import Pause from '../../assets/allons-icons/pause.svg';

import { uploadVideoMessage } from '../../firebase';
import { generateId } from '../../util/main_util';

import './AddVideoMessageModal.css';

let id;

class AddVideoMessageModal extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isRecordingStarted: false,
			isPreviewRecorded: false,
			isPreviewPlaying: false,
			countdown: 10,
			hasFlashMessage: false,
			flashMessage: ''
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

		this.addVideoMessageToModule = this.addVideoMessageToModule.bind(this);
		this.onBlockVideoPermission = this.onBlockVideoPermission.bind(this);
		this.startStopRecording = this.startStopRecording.bind(this);
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

		// Event listeners
		if (this.videoPreviewRef != null && this.videoPreviewRef.current != null) {
			this.videoPreviewRef.current.addEventListener('ended', () => {
				this.setState({ isPreviewPlaying: false });
			})
		}
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
			this.videoPreviewRef.current.pause();
			this.setState({ isPreviewPlaying: false });
		}else {
			// Play preview.
			this.videoPreviewRef.current.play();
			this.setState({ isPreviewPlaying: true });
		}
	}

	startCountdown() {
		// Update timer
		id = setInterval(() => {
			this.setState({ countdown: this.state.countdown - 1 });
		}, 1000);

		// Stop recording
		setTimeout(() => {
			// Making sure the video is still being recorded
			if (this.state.isRecordingStarted) {
				this.stopRecording();
			}
		}, 10000);
	}

	async addVideoMessageToModule() {
		// Uploading video message to firebase.
		if (this.currentBlob) {
			await uploadVideoMessage(
				generateId(),
				this.currentBlob,
				this.props.moduleId,
				this.props.userId
			);

			this.setState({
				hasFlashMessage: true,
				flashMessage: 'Your video message has been successfully added to your module',
				// To disable the add video message button to prevent users
				// from clicking twice on it.
				isPreviewRecorded: false,
			});
		}
	}

	generateEmbedCode() {

	}

	render() {
		return (
			<div>
				<div className='add-video-message-modal-bg'></div>
				<div className='add-video-message-modal'>
					<div className='add-video-message-modal-inner'>
						<header>
							{this.props.moduleId ? (
								<p className='title'>Add a personalized video message for your module viewers</p>
							) : (
								<p className='title'>Add a personalized video message to an external website</p>
							)}
							<br/>
							<small>Allon is still in beta. That's why we are limiting messages to 10 seconds <b>for now</b>.</small>
							<button
								className='close-button'
								onClick={this.props.closeAddVideoMessageModal}
							>
								<p>X</p>
							</button>
						</header>

						{this.state.hasFlashMessage && this.props.moduleId && (
							<div className='video-message-flash-message'>
								<p>{this.state.flashMessage}</p>
							</div>
						)}

						<div className='videos'>
							<div className='video-area'>
								<p>Here's how you look:</p>
								<div className='video-wrapper'>
									<video
										className='video-record'
										ref={this.videoRecordRef}
										muted
									></video>
								</div>
							</div>
							<div className='video-area'>
								<p>Here's the message preview:</p>
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
							<button
								className='start-record'
								onClick={this.startStopRecording}
							>
								{this.state.isRecordingStarted ? 'Stop recording' : 'Start recording' }
							</button>

							{this.props.moduleId ? (
								<button
									className='add-video-message-to-module-button'
									onClick={this.addVideoMessageToModule}
									disabled={!this.state.isPreviewRecorded}
								>
									Add video message to module
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

export default AddVideoMessageModal;
