import React from 'react';

import Logo1 from '../../assets/Logos/logo1.svg';

import './UserGuide.css'

class UserGuide extends React.Component {

	render() {
		return (
			<div className='allons-user-guide'>
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

				<section>
					<h1>Allons presents: Our User Guide 👨‍💻👩‍💻</h1>

					<div className='user-guide-gist'>

						<div className='guide'>
							<h2>What is Allons? and what does it do?</h2>
							<p>Allons allows you to embed audio and video messages everywhere. For example:</p>
							<ul>
								<li>You can embed your audio and video messages on PDFs and then share them with co-workers, friends,
								and clients.</li>
								<li>Allons also lets you create your audio and video messages and embed them on your own websites.</li>
								<li>We also provide an Allons editor, where you can create shareable Allons modules with texts and images and embed
								audio and video messages on them too.</li>
							</ul>
						</div>

						<div className='guide'>
							<a href='https://allons.tech/qPWYlchIAySA8mcpZF5mmt5WZO42/module/4132' target='_blank' rel='noreferrer'>
								<h2>How to embed video and audio messages on PDF files?</h2>
							</a>
						</div>

						<div className='guide'>
							<a href='https://allons.tech/qPWYlchIAySA8mcpZF5mmt5WZO42/module/1160' target='_blank' rel='noreferrer'>
								<h2>How to embed video and audio messages on my website?</h2>
							</a>
						</div>

						<div className='guide'>
							<a href='https://allons.tech/qPWYlchIAySA8mcpZF5mmt5WZO42/module/4789' target='_blank' rel='noreferrer'>
								<h2>How to share modules and documents with messages?</h2>
							</a>
						</div>

						<div className='guide'>
							<a href='https://allons.tech/qPWYlchIAySA8mcpZF5mmt5WZO42/module/6867' target='_blank' rel='noreferrer'>
								<h2>What is an Allons module? how do I create one?</h2>
							</a>
						</div>

						<div className='guide'>
							<a href='https://allons.tech/qPWYlchIAySA8mcpZF5mmt5WZO42/module/7588' target='_blank' rel='noreferrer'>
								<h2>How do I get an Allons <span>pro</span> account and what does it give me?</h2>
							</a>
						</div>

						<div className='guide'>
							<h2>Gosh! I found a bug or something isn't working. What should I do?</h2>
							<p>Nice, let's squash this bug's soul in a million pieces. Email Mauricio Costa directly at mauriciocosta16@gmail.com.</p>
						</div>
					</div>
				</section>
			</div>
		)
	}
}

export default UserGuide;
