import React from 'react';
import { navigate } from '@reach/router'

import { auth, createUserDocument } from '../../firebase.js';

import Logo1 from '../../assets/Logos/logo1.svg';

import './SignUp.css';

class SignUp extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			displayName: '',
			email: '',
			password: '',
			error: null,
			loading: false,
			flashMessage: null
		};

		this.signUpWithEmailAndPasswordHandler = this.signUpWithEmailAndPasswordHandler.bind(this);
		this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
		this.handleEmailChange = this.handleEmailChange.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
	}

	async signUpWithEmailAndPasswordHandler(e) {
		e.preventDefault();

		this.setState({ loading: true });

		const trimmedDisplayName = this.state.displayName.trim();
		if (this.state.displayName !== '' && trimmedDisplayName !== '') {
			try {
				// Here, we register the new user on the Authentication API from firebase.
				const { user } = await auth.createUserWithEmailAndPassword(
					this.state.email, this.state.password
				);

				// Here, we register the new user (all of its info) on Firestore.
				await createUserDocument(user, { displayName: trimmedDisplayName });

				navigate('/dashboard', { state: { uid: user.uid } });

				this.setState({ loading: false });

			} catch(error) {
				this.setState({
					error: 'Error signing up with email and password',
					flashMessage: 'This email has already been used or your password is too weak'
				})

				setTimeout(() => {
					this.setState({ loading: false, flashMessage: null });
				}, 4000);
			}

			// Resetting component state.
			this.setState({ displayName: '', email: '', password: '', error: null });
		}else {
			this.setState({ loading: false, flashMessage: "Don't forget your display name :)" });
		}
	}

	handleDisplayNameChange(e) {
		this.setState({ displayName: e.target.value });
	}

	handleEmailChange(e) {
		this.setState({ email: e.target.value });
	}

	handlePasswordChange(e) {
		this.setState({ password: e.target.value });
	}

	render() {
		return (
			<div className='sign-up'>
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

				<div className='auth'>
					<img className='logo-auth' src={Logo1} alt='Allons' />
					<p>Sign Up</p>
					{this.state.flashMessage && (
						<div className='flash-message'>
							<p>{this.state.flashMessage}</p>
						</div>
					)}
					<input
						type='text'
						name='displayName'
						placeholder='E.g.: Michael Scott'
						value={this.state.displayName}
						onChange={this.handleDisplayNameChange}
					/>
					<input
						type='text'
						name='email'
						placeholder='E.g.: michaelscott@hotmail.com'
						value={this.state.email}
						onChange={this.handleEmailChange}
					/>
					<input
						type='password'
						name='password'
						placeholder='Your password'
						value={this.state.password}
						onChange={this.handlePasswordChange}
					/>
					<button
						onClick={this.signUpWithEmailAndPasswordHandler}
						disabled={this.state.loading}
					>
						{!this.state.loading ? (
							<p>Sign Up</p>
						) : (
							<p>Preparing Allons to you...</p>
						)}
					</button>
					<br/>
					<a className='sub-text' href='/signin'>Already have an account? Sign in here</a>
				</div>
			</div>
		)
	}
}

export default SignUp;
