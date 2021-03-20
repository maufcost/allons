import React from 'react';

import Main from './components/Main/Main'

import UserProvider from './Providers/UserProvider';

import './App.css';

class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {}
	}

	render() {
		return (
			<div className='App'>
				<UserProvider>
					<Main />
				</UserProvider>
			</div>
		)
	}
}

export default App;
