import React, { createContext } from 'react';
import { auth, getUserDocument } from '../firebase'

export const UserContext = createContext({ user: null });

// This provider SHOULD NOT be used by the Dashboard to retrieve users.
// Currently, it is only used by the landing page.
class UserProvider extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			user: null
		}
	}

	// auth.createUserWithEmailAndPassword (SignUp)
	// fires:
	// auth.onAuthStateChanged (UserProvider)
	// then it's executed:
	// createUserDocument (SignUp)

	async componentDidMount() {
		auth.onAuthStateChanged(async userAuth => {
			// console.log('onAuthStateChanged in UserProvider called')
			// console.log(userAuth)

			// Creating or retrieving a user.
			let user;
			if (userAuth) {
				user = await getUserDocument(userAuth.uid);
				// console.log(user)
			}
			this.setState({ user });
		});
	}

	render() {
		return (
			<UserContext.Provider value={this.state.user}>
				{this.props.children}
			</UserContext.Provider>
		)
	}
}

export default UserProvider;
