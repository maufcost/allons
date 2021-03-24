import React from 'react';

import Play from '../../assets/allons-icons/play.svg';
import Pause from '../../assets/allons-icons/pause.svg';

import './EmbeddableMessage.css'

class EmbeddableMessage extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isVideoMessagePlaying: false,
			isAudioMessagePlaying: false
		};

		this.videoMessageRef = React.createRef();
		this.audioMessage = null;

		this.playPauseVideoMessage = this.playPauseVideoMessage.bind(this);
		this.playPauseAudioMessage = this.playPauseAudioMessage.bind(this);
	}

	componentDidMount() {
		// Check if this is an audio message.....
 		this.audioMessage = new Audio("AUDIO_URL");
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

	render() {
		return (
			<div className='embeddable-message'>
				<div className='video-message-player-container'>
					<div className='video-message-player'>
						<div className='video-message-container'>
							<video
								className='video-message'
								ref={this.videoMessageRef}
							>
								<source src={"https://firebasestorage.googleapis.com/v0/b/allons-y-3a514.appspot.com/o/_5vb21vcib?alt=media&token=f6fd9645-01fc-4fe7-87a6-528f2d39ae9c"} type="video/mp4" />
							</video>
						</div>
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
				</div>

				<div className='audio-message-player-container'>
					<button
						className='audio-message-play-pause'
						onClick={this.playPauseAudioMessage}
					>
						<img
							src={this.state.isAudioMessagePlaying ? Pause: Play}
							className='play-pause-img'
							alt='Play or Pause Audio Message'
						/>
					</button>
				</div>
			</div>
		)
	}
}

export default EmbeddableMessage;
