import React, { useContext, useState, useEffect } from 'react';
import { navigate } from '@reach/router';

import Profile from '../Profile/Profile'
import Module from '../Module/Module';
import ModuleThumbnail from '../ModuleThumbnail/ModuleThumbnail';

import { generateRandomId } from '../../util/main_util'
import { getUserDocument, createNewUserModule, getUserModules, signOutUser } from '../../firebase'

import Logo1 from '../../assets/Logos/logo1.svg';

import './Dashboard.css';

function Dashboard(props) {

	const [user, setUser] = useState(null);
	const [modules, setModules] = useState([]);
	const [showModule, setShowModule] = useState(false);
	const [selectedModuleId, setSelectedModuleId] = useState(null);
	const [selectedModuleName, setSelectedModuleName] = useState("");
	const [selectedModuleSections, setSelectedModuleSections] = useState([]);

	// componentDidMount()
	useEffect(() => {
		fetchModules();

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

		// useEffect shouldn't be async to prevent race conditions.
		async function fetchModules() {
			// Check if there's a user
			if (user) {
				// Retrieve all the modules from this user
				let { modules } = await getUserModules(user)
				if (modules) {
					setModules(Object.values(modules));

					// Stop loading animation
				}
			}else {
				console.log('[fetchModules] Error')
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

	// Shows a module when:
	// 1) A user clicks on a module thumbnail
	// 2) OR a user creates a new module
	const handleShowingModule = (module) => {
		// To force <Module/> re-rerender
		// setShowModule(false);
		setSelectedModuleId(module.id);
		setSelectedModuleName(module.moduleName);
		setSelectedModuleSections(module.moduleSections);

		setShowModule(true);
	}

	// Creates new module
	const createModule = async () => {
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
			props.openAddVideoMessageModal({ userId: user.uid, embed: true });
		}
	}

	const openEmbedAudioMessage = () => {
		if (user) {
			props.openAddAudioMessageModal({ userId: user.uid, embed: true });
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
	}

	// Showing the thumbnails of each module on the dashboard.
	let children = [];
	if (modules !== null && typeof modules !== 'undefined' && modules.length > 0) {
		children = modules.map((module, ix) => {
			return (
				<ModuleThumbnail
					key={ix}
					id={module.id}
					name={module.moduleName}
					sections={module.moduleSections}
					showModule={handleShowingModule}
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

	// /* <iframe title='embeddable message uhu' src='http://localhost:3000/msg'/> */

	return (
		<div className='dashboard'>
			<div className='left-sidebar'>
				{user && (
					<Profile user={user} />
				)}

				<div className='left-sidebar-button-list'>
					<button onClick={createModule}>Create Module</button>
					<button disabled onClick={openEmbedVideoMessage}>Embed Video Message</button>
					<button disabled onClick={openEmbedAudioMessage}>Embed Audio Message</button>
					<button disabled onClick={createModule}>Contact</button>
					<button onClick={handleSignOut}>Sign out</button>
				</div>

				<footer>
					<img src={Logo1} alt='Allons'/>
				</footer>
			</div>

			<main>
				{/* A selected module will show here. */}
				{showModule ?
					<Module
						id={selectedModuleId}
						name={selectedModuleName}
						headline={'Temporary Headline!'}
						sections={selectedModuleSections}
						user={user}
						updateModule={updateModule}
						closeModule={closeModule}
						openAddVideoMessageModal={props.openAddVideoMessageModal}
						openAddAudioMessageModal={props.openAddAudioMessageModal}
					/>
				:
					<section className='main-content-module-not-opened'>
						<h1>Hello, welcome to allons beta!</h1>
						<small>Create a module on the left or select one of your modules below to begin</small>
						<div className='module-thumbnails'>
							{/* Module thumbnails */}
							{children}
						</div>
						{/*<p>Click on a module above to see it here</p>*/}
					</section>
				}
			</main>
		</div>
	)

}

export default Dashboard;
