import React, { useContext, useEffect, useState } from 'react';
import { navigate } from '@reach/router';

import { UserContext } from '../../Providers/UserProvider';

import Logo1 from '../../assets/Logos/logo1.svg';

import './Landing.css';

function Landing (props) {

	const user = useContext(UserContext);
	const [contact, setContact] = useState(false);
	const [openDemo, setOpenDemo] = useState(false);

	// componentDidMount
	useEffect(() => {
		// console.log(window.location)
		if (user !== null & typeof user !== 'undefined') {
			// The user is already logged in.
			navigate('/dashboard', { state: { uid: user.uid } });
		}
	}, [user, props]);

	const onContactClick = () => {
		setContact(true);
		setTimeout(() => {
			setContact(false);
		}, 4000);
	}

	const openYTDemo = () => {
		setOpenDemo(true);
	}

	return (
		<div className='landing-page'>
			<iframe
				id='allons-iframe'
				title='allons is currently in beta. If you change the width and height values of this iframe, undesired consequences may occur (for now)'
				frameBorder="0"
				scrolling="no"
				width="160"
				height="160"
				loading="lazy"
				src='https://allons.tech/msg/video/WZX0Rqy4DKZ6CxHoC72SW37fhUE3'
			></iframe>

			<header>
				<a className='logo' href='/'>
					<img src={Logo1} alt='Allon'/>
					<span className='beta'>beta</span>
				</a>

				<ul>
					<li><a href='/signin'>Sign In</a></li>
					<li><a href='/signup'>Sign Up</a></li>
					<li><a href='/user-guide'>How to use Allons</a></li>
					<li><a onClick={onContactClick}>Contact</a></li>
					{/*<li><a href='/'>Examples</a></li>*/}
				</ul>
			</header>

			{contact && (
				<div className='contact-info'>
					<p>My name is Mauricio Costa, and I created Allons. I'm available 24/7 on:</p>
					<a href='https://twitter.com/mauriciofmcosta' target='_blank' rel='noreferrer'>Twitter: @mauriciofmcosta</a><br/>
					<a href='mailto:mauriciocosta16@gmail.com'>Email: mauriciocosta16@gmail.com</a>
				</div>
			)}

			<div className='showcase'>
				<h1>Explain once</h1>
				<h1>Present once</h1>
				<h1>Share anytime</h1>
				<p>Allons lets you record audio and video messages and share them with your documents</p>
				<button onClick={e => navigate('/signin')}>Sign In</button>
			</div>

			<div className='use-cases'>
				<h3>A few ways you can use allons</h3>
				<span></span>
				<div className='use-cases-grid'>
					<div>
						<p>Create quick shareable documents with audio and video messages.</p>
					</div>

					<div>
						<p>Leave personalized audio and video messages for your users in landing pages.</p>
					</div>

					<div>
						<p>Present projects and share with teachers and supervisors.</p>
					</div>
				</div>
			</div>

			<div className='yt-video'>
				{openDemo ? (
					<iframe
						width="560"
						height="315"
						src="https://www.youtube.com/embed/Zos6W2oeu20"
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen>
					</iframe>
				) : (
					<button onClick={openYTDemo}>Watch Allons Demo</button>
				)}
			</div>

			<footer>
				<img src={Logo1} alt='Allon'/>
			</footer>
		</div>
	)
}

export default Landing;
