import React, { createContext } from 'react';
import { auth, generateUserDocument} from '../firebase'

export const UserContext = createContext({ user: null });

class UserProvider extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			user: null
		}
	}

	async componentDidMount() {
		auth.onAuthStateChanged(async userAuth => {
			// console.log('onAuthStateChanged in UserProvider called')

			// Creating or retrieving a user.
			const user = await generateUserDocument(userAuth);

			this.setState({ user });

			// console.log(user);
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
