import React from 'react';

import './ProfileImage.css';

class ProfileImage extends React.Component {
	render() {
		// Generating a default profile "image" if a user does not have one.
		let displayNameInitials = ''

		if (this.props.user !== null &&
			typeof this.props.user !== 'undefined' &&
			this.props.user.displayName
		) {
			const displayNameArr = this.props.user.displayName.split(' ');

			let formattedDisplayNameArr = [];
			// Case:  "     asdasda    asdasda    " -> "asdasda    asdasda"
			// The spaces between the two names must be removed from the array
			for (let i = 0; i < displayNameArr.length; i++) {
				if (displayNameArr[i] !== ' ' && displayNameArr[i] !== '') {
					formattedDisplayNameArr.push(displayNameArr[i]);
				}
			}

			for (let i = 0; i < 2; i++) {
				displayNameInitials += formattedDisplayNameArr[i][0].toUpperCase();
			}
		}

		// @TODO: onClick={this.props.handleProfileImageClick}
		return (
			<div
				className='profile-image-container'
			>
				{this.props.user && this.props.user.photoURL ? (
					<div class='user-image-wrapper-object-fit'>
						<img
							className='user-profile-image'
							src={this.props.user.photoURL}
							alt='User Profile'
						/>
					</div>
				):
					<div className='default-user-profile-image'>
						<p>{displayNameInitials}</p>
					</div>
				}
			</div>
		)
	}
}

export default ProfileImage;
