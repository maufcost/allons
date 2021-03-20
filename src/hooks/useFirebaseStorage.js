import { useState, useEffect } from 'react';
import { firestore, firebaseStorage } from '../firebase'

const useFirebaseStorage = (user, file) => {
	// const [progress, setProgress] = useState(0);
	const [errorFirebase, setErrorFirebase] = useState(null);

	// Image url we get from firebase after the image has been successfully
	// uploaded.
	const [url, setUrl] = useState(null);

	// Runs EVERY TIME 'file' changes.
	useEffect(() => {
		if (user && file){
			const storageRef = firebaseStorage.ref(file.name);
			// const collectionRef = firestore.collection('images');
			const collectionRef = firestore.collection('users').doc(user.uid)

			// Adding state_changed event listener to THIS storageRef.
			// It will be fired multiple times throughout the upload.
			storageRef.put(file).on('state_changed', (snapshot) => {

				// const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				// setProgress(percentage)
			}, (error) => {
				setErrorFirebase(error);
			}, async () => {
				// This function fires when the upload is complete.
				const url = await storageRef.getDownloadURL();
				setUrl(url);

				// Saving the url to firestore so that we can retrieve the images later.
				collectionRef.set({ photoURL: url }, { merge: true });
			});
		}

	}, [user, file]);

	return { url, errorFirebase }; // @TODO: add 'progress' here
}

export default useFirebaseStorage;
