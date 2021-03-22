import React, { useState, useEffect, useRef } from 'react';

import BlockViewer from '../BlockViewer/BlockViewer';
import Play from '../../assets/allons-icons/play.svg';
import Pause from '../../assets/allons-icons/pause.svg';
import Logo1 from '../../assets/Logos/logo1.svg';

import { getUserDocument, getUserModule } from '../../firebase';

import './ModuleViewer.css'

function ModuleViewer({ userId, moduleId }) {

	// State
	const [user, setUser] = useState(null);
	const [module, setModule] = useState(null);
	const [isVideoMessagePlaying, setIsVideoMessagePlaying] = useState(false);
	const [isAudioMessagePlaying, setIsAudioMessagePlaying] = useState(false);

	// Refs
	const videoMessageRef = useRef(null);
	const audioMessageRef = useRef(null);

	// ComponentDidMount
	useEffect(() => {
		// Retrieves module based on url params.
		async function fetchModule() {
			 const module = await getUserModule(userId, moduleId);
			 setModule(module);

			 // Setting up audio message ref (if any audio message is present).
			 if (module.audioMessageURL) {
				 audioMessageRef.current = new Audio(module.audioMessageURL);
			 }

			 // Getting the module's author info
			 const user = await getUserDocument(userId);
			 setUser(user);
		}

		fetchModule();
	}, [userId, moduleId]);

	// Detecting when video message (if any) ended
	// @TODO: Move this to a componentdidmount-equivalent
	if (videoMessageRef != null && videoMessageRef.current != null) {
		videoMessageRef.current.addEventListener('ended', () => {
			setIsVideoMessagePlaying(false);
		})
	}

	const detectMentions = (content) => {
		let mentions = [];
		const regex = /data-id="\s*(.*?)\s*"/g;

		let match = regex.exec(content);
		while(match) {
			mentions.push(match[1]);
			match = regex.exec(content);
		}

		return mentions;
	}

	const renderSectionBlocks = (blocks) => {

		// dangerouslySetInnerHTML: It's very dangerous because of XSS (cross-site
		// scripting), but we'll stick to it for now.
		const elements = blocks.map((block, ix) => {
			return (
				<BlockViewer
					key={Math.floor(Math.random() * 1000) * ix}
					content={block.content}
					mentions={detectMentions(block.content)}
				/>
			)
		});
		return elements;
	}

	const playPauseVideoMessage = (e) => {
		if (isVideoMessagePlaying) {

			// Pause video message
			videoMessageRef.current.pause();
			setIsVideoMessagePlaying(false);

		}else {
			// Play video message
			videoMessageRef.current.play();
			setIsVideoMessagePlaying(true);
		}
	}

	const playPauseAudioMessage = (e) => {
		if (isAudioMessagePlaying) {

			// Pause audio message
			audioMessageRef.current.pause();
			setIsAudioMessagePlaying(false);

		}else {
			// Play audio message
			audioMessageRef.current.play();
			setIsAudioMessagePlaying(true);
		}
	}

	const children = [];
	let videoMessage = null;
	let audioMessage = null;
	if (module) {

		// Rendering module content
		const sections = module.moduleSections;

		for (let i = 0; i < sections.length && sections[i].id !== null && typeof sections[i].id !== 'undefined'; i++) {
			const section = sections[i];
			children.push(
				<div className='module-viewer-section' key={i}>
					<p className='module-viewer-section-name'>{section.sectionTitle}</p>
					<div className='module-viewer-section-blocks'>
						{renderSectionBlocks(section.blocks)}
					</div>
				</div>
			)
		}

		// Rendering module video message
		if (module.videoMessageURL) {
			videoMessage = (
				<div className='video-message-player-container'>
					<div className='video-message-player'>
						<div className='video-message-container'>
							<video
								className='video-message'
								ref={videoMessageRef}
							>
								<source src={module.videoMessageURL} type="video/mp4" />
							</video>
						</div>
						<button
							className='video-message-play-pause'
							onClick={playPauseVideoMessage}
						>
							<img
								src={isVideoMessagePlaying ? Pause : Play}
								className='play-pause-img'
								alt='Play or Pause Video Message'
							/>
						</button>
					</div>
				</div>
			)
		}

		// Rendering module audio message
		if (module.audioMessageURL) {
			audioMessage = (
				<div className='audio-message-player-container'>
					<button
						className='audio-message-play-pause'
						onClick={playPauseAudioMessage}
					>
						<img
							src={isAudioMessagePlaying ? Pause: Play}
							className='play-pause-img'
							alt='Play or Pause Audio Message'
						/>
					</button>
				</div>
			)
		}
	}

	let authorInformation = null;
	if (user) {
		authorInformation = (
			<div className='author-information'>
				<p><span>Written by</span> {user.displayName}</p>
				<img src={user.photoURL} alt='User' />
			</div>
		);
	}

	return (
		<div className='module-viewer'>

			<div className='messages'>
				{audioMessage}
				{videoMessage}
			</div>

			<header>
				<h1 className='module-title'>{module ? module.moduleName : null}</h1>
				{authorInformation}
			</header>

			{children}

			<footer>
				<small>
					Built with <a href="http://producthunt.com"><img src={Logo1} alt='Allons'/></a>
				</small>
			</footer>
		</div>
	)
}

export default ModuleViewer;
