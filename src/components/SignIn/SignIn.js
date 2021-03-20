import React from 'react';
import { navigate } from '@reach/router'

import { auth } from '../../firebase';

import './SignIn.css';

class SignIn extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			email: '',
			password: '',
			error: null
		}

		this.signInWithEmailAndPasswordHandler = this.signInWithEmailAndPasswordHandler.bind(this)
		this.handleEmailChange = this.handleEmailChange.bind(this)
		this.handlePasswordChange = this.handlePasswordChange.bind(this)
	}

	signInWithEmailAndPasswordHandler(e) {
		e.preventDefault();

		// Signing user in on firebase.
		auth.signInWithEmailAndPassword(
			this.state.email, this.state.password
		)
		.then((obj) => {
			navigate('/dashboard');
		})
		.catch(error => {
			console.log('Error signing user in with email and password', error);
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
				<button onClick={this.signInWithEmailAndPasswordHandler}>
					Sign In
				</button>
			</div>
		)
	}
}

export default SignIn;
