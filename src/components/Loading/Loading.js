import React from 'react';

import Logo1 from '../../assets/Logos/logo1.svg';

import './Loading.css'

class Loading extends React.Component {

	render() {
		return (
			<div className='loading-container'>
				<img src={Logo1} alt='Loading' />
			</div>
		)
	}
}

export default Loading;
