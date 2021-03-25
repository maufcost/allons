import React, { createContext } from 'react';
import { auth, getUserDocument } from '../firebase'

export const UserContext = createContext({ user: null });

class UserProvider extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			user: null
		}
	}

	async retrieveCompleteUser(uid) {
		console.log('retrieveCompleteUser called')
		const user = await getUserDocument(uid);
		return user;
	}

	// auth.createUserWithEmailAndPassword (SignUp)
	// fires:
	// auth.onAuthStateChanged (UserProvider)
	// then it's executed:
	// createUserDocument (SignUp)

	// async componentDidMount() {
	// 	auth.onAuthStateChanged(async userAuth => {
	// 		// console.log('onAuthStateChanged in UserProvider called')
	// 		// console.log(userAuth)
	//
	// 		// Creating or retrieving a user.
	// 		let user;
	// 		if (userAuth) {
	// 			user = await getUserDocument(userAuth.uid);
	// 			console.log(user)
	// 			console.log(!user.hasOwnProperty('displayName'))
	//
	// 			if (!user.hasOwnProperty('displayName')) {
	// 				// The user document hasn't been fully added to firestore yet
	// 				// await firestore.doc()
	// 				user = await listenToUserChange(userAuth.uid);
	// 				console.log("user after listening:");
	// 				console.log(user);
	// 			}
	// 		}
	// 		this.setState({ user });
	//
	// 		// console.log(user);
	// 	});
	// }

	// retrieveUser() {
	// 	if (
	// 		user !== null &&
	// 		typeof user !== 'undefined' &&
	// 		user.displayName === null
	// 	) {
	// 		setTimeout(() => {
	// 			user = await generateUserDocument(userAuth);
	// 		}, 2000);
	// 	}
	// }

	render() {
		return (
			<UserContext.Provider value={this.state.user}>
				{this.props.children}
			</UserContext.Provider>
		)
	}
}

export default UserProvider;
