import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';

import ProfileImage from '../ProfileImage/ProfileImage'
import BlockViewer from '../BlockViewer/BlockViewer';

import Play from '../../assets/allons-icons/play.svg';
import Pause from '../../assets/allons-icons/pause.svg';
import Logo1 from '../../assets/Logos/logo1.svg';
import PreviousIcon from '../../assets/allons-icons/previous-icon.svg';
import NextIcon from '../../assets/allons-icons/next-icon.svg';

import { getUserDocument, getUserModule, getExternalDocument } from '../../firebase';
import { MODULE, DOCUMENT } from '../../util/main_util';

import './Viewer.css'

function Viewer({ userId, instanceType, instanceId }) {

	// State
	const [user, setUser] = useState(null);
	const [module, setModule] = useState(null);
	const [document, setDocument] = useState(null);
	const [isVideoMessagePlaying, setIsVideoMessagePlaying] = useState(false);
	const [isAudioMessagePlaying, setIsAudioMessagePlaying] = useState(false);
	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);

	// Refs
	const videoMessageRef = useRef(null);
	const audioMessageRef = useRef(null);

	// ComponentDidMount
	useEffect(() => {
		// Retrieves module or document based on url params.
		async function fetchModule() {
			 const module = await getUserModule(userId, instanceId);
			 setModule(module);

			 // Setting up audio message ref (if any audio message is present).
			 if (module.audioMessageURL) {
				 audioMessageRef.current = new Audio(module.audioMessageURL);
			 }

			 // Getting the module's author info
			 const user = await getUserDocument(userId);
			 setUser(user);
		}

		async function fetchDocument() {
			const document = await getExternalDocument(userId, instanceId);
			setDocument(document);

			// Setting up audio message ref (if any audio message is present).
			if (document && typeof document !== 'undefined' && document.audioMessageURL) {
				audioMessageRef.current = new Audio(document.audioMessageURL);
			}

			// Getting the document's author info
			const user = await getUserDocument(userId);
			setUser(user);
		}

		if (instanceType === MODULE) {
			fetchModule();
		}else if (instanceType === DOCUMENT) {
			fetchDocument();
		}

	}, [userId, instanceId, instanceType]);

	// Detecting when video message (if any) ended.
	// @TODO: Move this to a componentdidmount-equivalent
	if (videoMessageRef != null && videoMessageRef.current != null) {
		videoMessageRef.current.addEventListener('ended', () => {
			setIsVideoMessagePlaying(false);
		})
	}

	// Detecting when audio message (if any) ended.
	// @TODO: Move this to a componentdidmount-equivalent
	if (audioMessageRef != null && audioMessageRef.current != null) {
		audioMessageRef.current.addEventListener('ended', () => {
			setIsAudioMessagePlaying(false);
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

	const onDocumentLoadSuccess = ({ numPages }) => {
		setNumPages(numPages);
	}

	const handlePreviousPage = () => {
		setPageNumber(pageNumber - 1);
	}

	const handleNextPage = () => {
		setPageNumber(pageNumber + 1);
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
	}

	const instance = module ? module : document;

	if (instance) {
		// Rendering module video message
		if (instance.videoMessageURL) {
			videoMessage = (
				<div className='video-message-player-container'>
					<div className='video-message-player'>
						<div className='video-message-container'>
							<video
								className='video-message'
								ref={videoMessageRef}
							>
								<source src={instance.videoMessageURL} type="video/mp4" />
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
		if (instance.audioMessageURL) {
			let className = 'audio-message-player-container ';
			className += videoMessage ? 'extra-offset' : '';

			audioMessage = (
				<div
					className={className}>
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
		let createdBy = <p><span>Created by</span> {user.displayName}</p>
		if (document) {
			createdBy = <p><span>This document is being shared by</span> {user.displayName}</p>
		}

		authorInformation = (
			<div className='author-information'>
				{createdBy}
				<ProfileImage
					user={user}
					profileImageURL={user.photoURL}
				/>
			</div>
		);
	}

	return (
		<div className='viewer'>

			<div className='messages'>
				{audioMessage}
				{videoMessage}
			</div>

			{module && (
				<div class='module-viewer'>
					<header>
						<h1 className='module-title'>{module ? module.moduleName : null}</h1>
						{authorInformation}
					</header>
					{children}
				</div>
			)}

			{document && (
				<div className='document-viewer'>
					<header>
						<small>
							Built with <a href="/"><img src={Logo1} alt='Allons'/></a>
						</small>
						{authorInformation}
						<div className='document-controls'>
							<button
								onClick={handlePreviousPage}
								disabled={pageNumber === 1}
							>
								<img src={PreviousIcon} alt='Go to the previous PDF page'/>
							</button>
							<p>Page {pageNumber} of {numPages}</p>
							<button
								onClick={handleNextPage}
								disabled={pageNumber === numPages}
							>
								<img src={NextIcon} alt='Go to the next PDF page'/>
							</button>
						</div>
					</header>
					<div className='document-container'>
						<Document
							file={document.url}
							onLoadSuccess={onDocumentLoadSuccess}
							className='doc'
						>
							<Page pageNumber={pageNumber} />
						</Document>
					</div>
				</div>
			)}

			{module && (
				<footer>
					<small>
						Built with <a href="/"><img src={Logo1} alt='Allons'/></a>
					</small>
				</footer>
			)}
		</div>
	)
}

export default Viewer;
