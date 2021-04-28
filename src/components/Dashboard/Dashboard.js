import React, { useState, useEffect } from 'react';
import { navigate } from '@reach/router';

import Profile from '../Profile/Profile'
import Module from '../Module/Module';
import ModuleThumbnail from '../ModuleThumbnail/ModuleThumbnail';
import ExternalDocument from '../ExternalDocument/ExternalDocument';
import ExternalDocThumbnail from '../ExternalDocThumbnail/ExternalDocThumbnail';

import { generateRandomId } from '../../util/main_util'
import {
	getUserDocument,
	createNewUserModule,
	getUserModules,
	signOutUser,
	createNewExternalDocument,
	updateExternalDocument,
	getExternalDocuments
} from '../../firebase'

import Logo1 from '../../assets/Logos/logo1.svg';

import './Dashboard.css';

function Dashboard(props) {

	const [user, setUser] = useState(null);
	const [modules, setModules] = useState([]);
	const [showModule, setShowModule] = useState(false);
	const [selectedModuleId, setSelectedModuleId] = useState(null);
	const [selectedModuleName, setSelectedModuleName] = useState("");
	const [selectedModuleSections, setSelectedModuleSections] = useState([]);
	const [selectedModuleVideoMessageURL, setSelectedModuleVideoMessageURL] = useState(null);
	const [selectedModuleAudioMessageURL, setSelectedModuleAudioMessageURL] = useState(null);
	const [flashMessage, setFlashMessage] = useState(null);

	const [showExternalDocument, setShowExternalDocument] = useState(false);
	const [externalDocuments, setExternalDocuments] = useState([]);
	const [selectedExternalDocId, setSelectedExternalDocId] = useState(null);
	const [selectedExternalDocName, setSelectedExternalDocName] = useState(null);
	const [selectedExternalDocURL, setSelectedExternalDocURL] = useState(null);
	const [selectedExternalDocVideoMessageURL, setSelectedExternalDocVideoMessageURL] = useState(null);
	const [selectedExternalDocAudioMessageURL, setSelectedExternalDocAudioMessageURL] = useState(null);

	const [contactInfo, setContactInfo] = useState('Contact')

	// componentDidMount()
	// useEffect shouldn't be async to prevent race conditions.
	useEffect(() => {
		fetchModules();
		fetchExternalDocuments();

		if (user === null) {
			// It means that I haven't fetched the user yet.
			getUser();
		}

		if (typeof user === 'undefined') {
			// It means that this user does not exist or is not logged in.
			navigate('/');
		}

		async function getUser() {
			if (props.location.state) {
				setUser(await getUserDocument(props.location.state.uid));
			}else {
				setUser(undefined)
			}
		}

		async function fetchModules() {
			// Check if there's a user
			if (user) {
				// Retrieve all the modules from this user
				let { modules } = await getUserModules(user)
				if (modules) {
					setModules(Object.values(modules));
				}
			}else {
				console.log('[fetchModules] Error');
			}
		}

		async function fetchExternalDocuments() {
			// Check if there's a user
			if (user) {
				let { externalDocuments } = await getExternalDocuments(user.uid);
				if (externalDocuments) {
					setExternalDocuments(Object.values(externalDocuments));
				}
			}else {
				console.log('[fetchExternalDocuments] Error');
			}
		}
	}, [user, props])

	// It will be called after handleShowingModule in order to force a re-render.
	// We need to have this useEffect here because setShowModule(true) was right
	// after I used setSelectedModuleSections on handleShowingModule. This
	// component would try to show <Module/> immediately, but it needs to be re-rendered
	// for the sections update to take place. It was sending empty [] to <Module/>.
	useEffect(() => {
		if (selectedModuleId) {
			setShowModule(true);
		}
	}, [selectedModuleId, selectedModuleSections])

	// Making the flash message disappear
	useEffect(() => {
		if (flashMessage !== null) {
			setTimeout(() => {
				setFlashMessage(null);
			}, 3000);
		}
	}, [flashMessage])

	// Shows a module when:
	// 1) A user clicks on a module thumbnail
	// 2) OR a user creates a new module
	const handleShowingModule = (module) => {
		// To force <Module/> re-rerender
		// setShowModule(false);
		setSelectedModuleId(module.id);
		setSelectedModuleName(module.moduleName);
		setSelectedModuleSections(module.moduleSections);
		setSelectedModuleVideoMessageURL(module.videoMessageURL);
		setSelectedModuleAudioMessageURL(module.audioMessageURL);

		setShowModule(true);
	}

	// Creates new module
	const createModule = async () => {

		// Limiting the number of modules to five for now.
		if (modules.length >= 5) {

			setFlashMessage('Allons is limiting five modules per user for now');

			setTimeout(() => {
				setFlashMessage(null);
			}, 3000);
			return;
		}

		// Creating new module.
		if (user) {
			const moduleId = generateRandomId();
			const newModule = await createNewUserModule(user.uid, moduleId);

			handleShowingModule({
				id: newModule.id,
				moduleName: newModule.moduleName,
				moduleSections: newModule.moduleSections
			});

			// Showing new module thumbnail as soon as it is created.
			modules.push(newModule)
			setModules([...modules])
		}else {
			console.log('[createModule] Error');
		}
	}

	const openEmbedVideoMessage = () => {
		if (user) {
			props.openAddVideoMessageModal({
				user: user,
				embed: true,
				videoMessageURL: user.embeddedVideoMessageURL
			});
		}
	}

	const openEmbedAudioMessage = () => {
		if (user) {
			props.openAddAudioMessageModal({
				user: user,
				embed: true,
				audioMessageURL: user.embeddedAudioMessageURL
			});
		}
	}

	const updateModule = async ({ id, moduleName, moduleSections }) => {
		// Updating single module.
		let module = modules.find(module => module.id === id);
		const index = modules.indexOf(module)
		modules.splice(index, 1);

		module = { id, moduleName, moduleSections };
		modules.splice(index, 0, module)
		setModules([...modules]);
	}

	const handleSignOut = () => {
		signOutUser();
		navigate('/');
	}

	const closeModule = () => {
		setShowModule(false);
		setSelectedModuleId(null);
	}

	const closeExternalDocument = () => {
		setShowExternalDocument(false);
		setSelectedExternalDocId(null);
	}

	const openAddExternalDocument = (e, fileName, url) => {

		// Limiting the addition of five documents for now.
		if (externalDocuments.length >= 5) {
			setFlashMessage('Allons is limiting five documents per user for now');

			setTimeout(() => {
				setFlashMessage(null);
			}, 3000);
			return;
		}

		// Creating a space for an external document.
		setShowExternalDocument(true);

		if (fileName !== null && url !== null) {
			setSelectedExternalDocName(fileName);
			setSelectedExternalDocURL(url);
		}
	}

	const createNewExternalDoc = async (id, fileName, file) => {
		if (user) {
			const newDoc = await createNewExternalDocument(user.uid, id, fileName, file);

			// Showing new external doc thumbnail as soon as it is created.
			externalDocuments.push(newDoc);
			setExternalDocuments([...externalDocuments]);
		}
	}

	const updateExternalDoc = async (id, fileName, file) => {
		if (user) {
			await updateExternalDocument(user.uid, id, fileName, file);
		}
	}

	const handleShowingExternalDoc = (id, fileName, url, docAudioURL, docVideoURL) => {
		setSelectedExternalDocId(id);
		setSelectedExternalDocName(fileName);
		setSelectedExternalDocURL(url);
		setSelectedExternalDocAudioMessageURL(docAudioURL);
		setSelectedExternalDocVideoMessageURL(docVideoURL);

		setShowExternalDocument(true);
	}

	const onContactClick = () => {
		setContactInfo('Twitter: @mauriciofmcosta or mauriciocosta16@gmail.com')
		setTimeout(() => {
			setContactInfo('Contact')
		}, 4000)
	}

	// Showing the thumbnails of each module on the dashboard.
	let children = null;
	if (modules !== null && typeof modules !== 'undefined' && modules.length > 0) {
		children = modules.map((module, ix) => {
			return (
				<ModuleThumbnail
					key={ix}
					id={module.id}
					name={module.moduleName}
					sections={module.moduleSections}
					videoMessageURL={module.videoMessageURL}
					audioMessageURL={module.audioMessageURL}
					showModule={handleShowingModule}
				/>
			)
		});
	}

	let externalChildren = null;
	if (
		externalDocuments !== null &&
		typeof externalDocuments !== 'undefined' &&
		externalDocuments.length > 0
	) {
		externalChildren = externalDocuments.map((doc, ix) => {
			return (
				<ExternalDocThumbnail
					key={ix}
					doc={doc}
					showExternalDocument={handleShowingExternalDoc}
				/>
			)
		});
	}

	// Use it to test if the UserProvider is sending the user context.
	// {user ?
	// 	<p>There is a user</p>
	// :
	// 	<p>There isn't a user</p>
	// }

	return (
		<div className='dashboard'>
			<div className='left-sidebar'>
				{user && (
					<Profile user={user} />
				)}

				<div className='left-sidebar-button-list'>
					<button onClick={createModule}>Create Module</button>
					<button onClick={openAddExternalDocument}>Add external document</button>
					<button disabled onClick={null}>Notifications</button>
					{selectedModuleId || selectedExternalDocId ? null :
					(
						<span>
							<button onClick={openEmbedVideoMessage}>Embed Video messages</button>
							<button onClick={openEmbedAudioMessage}>Embed Audio Messages</button>
						</span>
					)}
					<button onClick={onContactClick}>{contactInfo}</button>
					<button onClick={handleSignOut}>Sign out</button>
				</div>

				<footer>
					<img src={Logo1} alt='Allons'/>
				</footer>
			</div>

			<main>
				{flashMessage && (
					<div className='flash-message'>
						<p>{flashMessage}</p>
					</div>
				)}

				{/* A selected module will show here. */}
				{showModule && (
					<Module
						id={selectedModuleId}
						name={selectedModuleName}
						sections={selectedModuleSections}
						videoMessageURL={selectedModuleVideoMessageURL}
						audioMessageURL={selectedModuleAudioMessageURL}
						user={user}
						updateModule={updateModule}
						closeModule={closeModule}
						openAddVideoMessageModal={props.openAddVideoMessageModal}
						openAddAudioMessageModal={props.openAddAudioMessageModal}
						previewInstance={props.previewInstance}
					/>
				)}

				{/* A selected external document will show here. */}
				{showExternalDocument && (
					<ExternalDocument
						user={user}
						id={selectedExternalDocId}
						url={selectedExternalDocURL}
						fileName={selectedExternalDocName}
						externalDocName={selectedExternalDocName}
						externalDocURL={selectedExternalDocURL}
						createNewExternalDoc={createNewExternalDoc}
						updateExternalDocument={updateExternalDoc}
						closeExternalDocument={closeExternalDocument}
						setFlashMessage={setFlashMessage}
						openAddVideoMessageModal={props.openAddVideoMessageModal}
						openAddAudioMessageModal={props.openAddAudioMessageModal}
						videoMessageURL={selectedExternalDocVideoMessageURL}
						audioMessageURL={selectedExternalDocAudioMessageURL}
						previewInstance={props.previewInstance}
					/>
				)}

				{/* Default dashboard page */}
				{!showModule && !showExternalDocument && (
					<section className='main-content-module-not-opened'>

						<div>
							<h1>Hello, welcome to allons beta!</h1>
							<small>Create a module on the left or select one of your modules below to begin</small>
							<div className='module-thumbnails'>
								{/* Module thumbnails */}
								{children ? (
									children
								) : (
									<p className='no-modules-message'>You have no Allons modules yet. Let's create one!</p>
								)}
							</div>
						</div>

						<div>
							<h1>Access one of your external documents:</h1>
							<small>These are documents that you dropped on Allons, such as PDFs.</small>
							<div className='external-module-thumbnails'>
								{/* External module thumbnails */}

								{externalChildren ? (
									externalChildren
								) : (
									<p className='no-modules-message'>You have no external modules yet. Let's add one here!</p>
								)}
							</div>
						</div>
					</section>
				)}

			</main>
		</div>
	)

}

export default Dashboard;
