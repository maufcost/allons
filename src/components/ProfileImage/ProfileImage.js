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
			for (let i = 0; i < displayNameArr.length; i++) {
				displayNameInitials += displayNameArr[i][0].toUpperCase();
			}
		}

		// @TODO: onClick={this.props.handleProfileImageClick}
		return (
			<div
				className='profile-image-container'
			>
				{this.props.user && this.props.user.photoURL ? (
					<img
						className='user-profile-image'
						src={this.props.user.photoURL}
						alt='User Profile'
					/>
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
