import React from 'react'
import { navigate } from '@reach/router'

import Play from '../../assets/allons-icons/play.svg'
import Pause from '../../assets/allons-icons/pause.svg'

import { getEmbedMessageURL } from '../../firebase'
import {
	AUDIO_MESSAGE,
	VIDEO_MESSAGE
} from '../../util/main_util'

import './EmbeddableMessage.css'

class EmbeddableMessage extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			messageURL: null,
			isVideoMessagePlaying: false,
			isAudioMessagePlaying: false
		};

		this.videoMessageRef = React.createRef();
		this.audioMessage = null;

		this.playPauseVideoMessage = this.playPauseVideoMessage.bind(this);
		this.playPauseAudioMessage = this.playPauseAudioMessage.bind(this);
	}

	async componentDidMount() {
		if (!this.isInIframe()) {
			navigate('https://allons.tech')
			return
		}

		let url = null;

		if (this.props.msgType === 'video') {
			url = await getEmbedMessageURL(this.props.userId, VIDEO_MESSAGE);
			// Setting state here because setting the url here allows the video+source
			// tags to be loaded, the refs to be set, and the event listener below
			// to be successfully set.
			this.setState({ messageURL: url });

			// Listening to when the video message ends.
			if (this.videoMessageRef !== null && this.videoMessageRef.current !== null) {
				this.videoMessageRef.current.addEventListener('ended', () => {
					this.setState({ isVideoMessagePlaying: false });
				});
			}

		} else if (this.props.msgType === 'audio') {
			url = await getEmbedMessageURL(this.props.userId, AUDIO_MESSAGE);
			this.setState({ messageURL: url });

			// Creating audio object.
			this.audioMessage = new Audio(url);

			// Listening to when the audio message ends.
			this.audioMessage.addEventListener('ended', () => {
				this.setState({ isAudioMessagePlaying: false });
			});
		}else {
			// @TODO: Better error handling
		}
	}

	playPauseVideoMessage(e) {
		if (this.state.isVideoMessagePlaying) {

			// Pause video message
			this.videoMessageRef.current.pause();
			this.setState({ isVideoMessagePlaying: false });

		}else {
			// Play video message
			this.videoMessageRef.current.play();
			this.setState({ isVideoMessagePlaying: true });
		}
	}

	playPauseAudioMessage() {
		if (this.state.isAudioMessagePlaying) {

			// Pause audio message
			this.audioMessage.pause();
			this.setState({ isAudioMessagePlaying: false });

		}else {
			// Play audio message
			this.audioMessage.play();
			this.setState({ isAudioMessagePlaying: true });
		}
	}

	isInIframe () {
	    try {
	        return window.self !== window.top;
	    } catch (e) {
	        return true;
	    }
	}

	// @TODO: Redirect users instead of not showing the page at all (YOU'RE
	// STILL TESTING! It's fine if you leave it this way for now!)
	render() {
		return (
			<div className='embeddable-message'>
				{!this.state.messageURL && (
					<div className='loading'><p>Loading it for you my boo</p></div>
				)}

				{this.state.messageURL && this.props.msgType === 'video' && (
					<div className='video-message-container'>
						<video
							className='video-message'
							ref={this.videoMessageRef}
						>
							<source src={this.state.messageURL} type="video/mp4" />
						</video>
						<button
							className='video-message-play-pause'
							onClick={this.playPauseVideoMessage}
						>
							<img
								src={this.state.isVideoMessagePlaying ? Pause : Play}
								className='play-pause-img'
								alt='Play or Pause Video Message'
							/>
						</button>
					</div>
				)}

				{this.state.messageURL && this.props.msgType === 'audio' && (
					<div className='audio-message-player-container'>
						<button
							className='audio-message-play-pause'
							onClick={this.playPauseAudioMessage}
						>
							<img
								src={this.state.isAudioMessagePlaying ? Pause : Play}
								className='play-pause-img'
								alt='Play or Pause Audio Message'
							/>
						</button>
					</div>
				)}
			</div>
		)
	}
}

export default EmbeddableMessage;
