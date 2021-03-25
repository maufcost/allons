import React, { useContext, useEffect } from 'react';
import { navigate } from '@reach/router';

import { UserContext } from '../../Providers/UserProvider';

import Logo1 from '../../assets/Logos/logo1.svg';

import './Landing.css';

function Landing (props) {

	const user = useContext(UserContext);

	// componentDidMount
	useEffect(() => {

		if (user !== null & typeof user !== 'undefined') {
			// The user is already logged in.
			navigate('/dashboard');
		}

	}, [user, props]);

	return (
		<div className='landing-page'>

			<header>
				<a className='logo' href='/'>
					<img src={Logo1} alt='Allon'/>
					<span className='beta'>beta</span>
				</a>

				<ul>
					<li><a href='/signin'>Sign In</a></li>
					<li><a href='/signup'>Sign Up</a></li>
					<li><a href='/'>Contact</a></li>
				</ul>
			</header>

			<div className='showcase'>
				<h1>Explain once</h1>
				<h1>Present once</h1>
				<h1>Share anytime</h1>
				<p>Allons lets you record audio and video messages and share them with your documents</p>
				<button onClick={e => navigate('/signin')}>Sign In</button>
			</div>

		</div>
	)
}

export default Landing;
