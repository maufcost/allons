import React from 'react';
import { navigate } from '@reach/router'

import { auth } from '../../firebase';

import Logo1 from '../../assets/Logos/logo1.svg';

import './SignIn.css';

class SignIn extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			email: '',
			password: '',
			error: null,
			loading: false,
			flashMessage: false
		}

		this.signInWithEmailAndPasswordHandler = this.signInWithEmailAndPasswordHandler.bind(this)
		this.handleEmailChange = this.handleEmailChange.bind(this)
		this.handlePasswordChange = this.handlePasswordChange.bind(this)
	}

	signInWithEmailAndPasswordHandler(e) {
		e.preventDefault();

		this.setState({ loading: true });

		// Signing user in on firebase.
		auth.signInWithEmailAndPassword(
			this.state.email, this.state.password
		)
		.then((res) => {
			navigate('/dashboard', { state: { uid: res.user.uid } });

			this.setState({ loading: false, flashMessage: false });
		})
		.catch(error => {
			this.setState({ loading: false, flashMessage: true });
			// console.log('Error signing user in with email and password', error);
		});
	}

	handleEmailChange(e) {
		this.setState({ email: e.target.value });
	}

	handlePasswordChange(e) {
		this.setState({ password: e.target.value });
	}


	render() {
		return (
			<div className='sign-in'>
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
					<p>Sign In</p>
					{this.state.flashMessage && (
						<div className='flash-message'>
							<p>Your email or password may be wrong or you don't have an account yet</p>
						</div>
					)}
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
						onClick={this.signInWithEmailAndPasswordHandler}
						disabled={this.state.loading}
					>
						{!this.state.loading ? (
							<p>Sign In</p>
						): (
							<p>Preparing Allons to you...</p>
						)}
					</button>
					<br/>
					<a className='sub-text' href='/sign-up'>Don't have an account yet? Register now for free</a>
				</div>
			</div>
		)
	}
}

export default SignIn;
