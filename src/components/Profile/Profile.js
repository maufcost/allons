import React, { useState } from 'react';

import ProfileImage from '../ProfileImage/ProfileImage'

import useFirebaseStorage from '../../hooks/useFirebaseStorage'

import './Profile.css'

function Profile({ user }) {

	const [file, setFile] = useState(null);
	const [error, setError] = useState(null);

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
		}
	}

	// @TODO: Better error handling.
	if (errorFirebase) {
		console.log('[Profile] Error');
	}

	// Formatting display name.
	let userFormattedDisplayName = 'Default Display Name'

	console.log(user)

	if (user !== null & typeof user !== 'undefined') {
		const displayNameArr = user.displayName.split(' ');
		for (let i = 0; i < displayNameArr.length; i++) {
			displayNameArr[i] =
				displayNameArr[i][0].toUpperCase() + displayNameArr[i].substr(1);
		}
		userFormattedDisplayName = displayNameArr.join(' ');
	}

	return (
		<div className='user-profile'>
			{error ? <div className='error'>{ error }</div> : null}
			<div className='user-profile-information'>

				<div className='profile-image-wrapper'>
					<ProfileImage
						user={user}
						profileImageURL={url}
					/>
					<input type='file' onChange={handleFileInputChange} />
				</div>


				<div className='user-data'>
					<p>{userFormattedDisplayName}</p>
					{user ? <span>{user.email}</span> : null}
				</div>
			</div>
		</div>
	)
}

export default Profile;
