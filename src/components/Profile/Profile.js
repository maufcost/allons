import React, { useState } from 'react';

import ProfileImage from '../ProfileImage/ProfileImage'

import useFirebaseStorage from '../../hooks/useFirebaseStorage'

import './Profile.css'

function Profile({ user }) {

	const [file, setFile] = useState(null);
	const [error, setError] = useState(null);
	const [profileMsg, setProfileMsg] = useState(null);

	const { url, errorFirebase } = useFirebaseStorage(user, file);

	const handleFileInputChange = (e) => {
		let selectedFile = e.target.files[0];

		if (selectedFile &&
			['image/png', 'image/jpeg'].includes(selectedFile.type)
		) {
			// Everything went well
			setFile(selectedFile);
		}else {
			// An error occurred
			setFile(null);
			setError('Please, select a png or jpeg image file. Thank you!');

			setTimeout(() => {
				setError(null);
			}, 3000);
		}
	}

	const handleMouseEnter = (e) => {
		setProfileMsg('Add profile picture');
	}

	const handleMouseLeave = (e) => {
		setProfileMsg(null);
	}

	// @TODO: Better error handling.
	if (errorFirebase) {
		console.log('[Profile] Error');
	}

	// Formatting display name.
	let userFormattedDisplayName = 'Default Display Name';

	// console.log(user);

	if (user !== null & typeof user !== 'undefined' && user.displayName) {
		const displayNameArr = user.displayName.split(' ');
		for (let i = 0; i < displayNameArr.length; i++) {
			displayNameArr[i] =
				displayNameArr[i][0].toUpperCase() + displayNameArr[i].substr(1);
		}
		userFormattedDisplayName = displayNameArr.join(' ');
	}

	return (
		<div
			className='user-profile'
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{error ? <div className='error'>{ error }</div> : null}
			<div className='user-profile-information'>
				<div className='profile-image-wrapper'>
					{user && (
						<ProfileImage
							user={user}
							profileImageURL={url}
						/>
					)}
					<input type='file' onChange={handleFileInputChange} />
				</div>

				<div className='user-data'>
					{profileMsg ? (
						<div>
							<p className='add-profile-picture-msg'>{profileMsg}</p>
							<span>You gotta look pretty</span>
						</div>
					) : (
						<div>
							<p>{userFormattedDisplayName}</p>
							{user ? <span>{user.email}</span> : null}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default Profile;
