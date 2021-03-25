// Firebase configuration
// Firebase tools used: Cloud Firestore and Authentication.

// Based on:
// https://blog.logrocket.com/user-authentication-firebase-react-apps/

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage"

var firebaseConfig = {
	apiKey: "AIzaSyCyWkrsbbLZJFoPLRY3UzKM5CVp_sMYZ80",
	authDomain: "allons-y-3a514.firebaseapp.com",
	projectId: "allons-y-3a514",
	storageBucket: "allons-y-3a514.appspot.com",
	messagingSenderId: "850143895894",
	appId: "1:850143895894:web:1b9cb2b00b8b25dfb6b6f7",
	measurementId: "G-4E4SEC4NM1"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const firebaseStorage = firebase.storage();

// Generates a user document on firebase if there isn't one already there
export const createUserDocument = async (user, additionalData) => {
	if (!user) return;
	const userRef = firestore.doc(`users/${user.uid}`);
	const snapshot = await userRef.get();

	// console.log('[firebase.js]', user)
	// console.log('[firebase.js]', additionalData)

	// The user does not exist.
	if (!snapshot.exists) {
		const { email } = user;

		// Creating new user.
		try {
			await userRef.set({
				email,
				displayName: additionalData.displayName,
				photoURL: null
			});
		}catch(error) {
			console.error("[generateUserDocument] Error", error);
		}
	}
}

// Retrieves a user document
export const getUserDocument = async uid => {
	if (!uid) return null;

	// Retrieving user.
	try {
		const userDocument = await firestore.doc(`users/${uid}`).get();

		return {
			uid,
			...userDocument.data()
		}
	}catch(error) {
		console.error("[getUserDocument] Error", error);
	}
}

// Retrieves all modules from a user.
export const getUserModules = async user => {
	if (!user) return null;

	try {
		const modulesDocument = await firestore.doc(`modules/${user.uid}`).get();
		return {
			modules: modulesDocument.data()
		}
	}catch(error) {
		console.log("[getUserModules] Error", error);
	}
}

// Retrieves specific module from user based on module id.
export const getUserModule = async (uid, moduleId) => {
	if (!moduleId) return null;

	try {
		// @TODO: Change db schema (to create subcollections) to retrieve only one document.
		const moduleDoc = await firestore.doc(`modules/${uid}`).get(); // retrieves all of them.
		return moduleDoc.data()[moduleId]
	}catch(error) {
		console.log("[getUserModule] Error", error);
	}
}

// Generates a user's module.
export const createNewUserModule = async (uid, moduleId) => {
	if (!uid) return null;
	if (!moduleId) return null;

	const module = {};
	module[moduleId] = {
		id: moduleId,
		moduleName: "Default module name",
		moduleSections: []
	}

	try {
		await firestore.doc(`modules/${uid}`).set(
			module,
			{ merge: true }
		);

		return getUserModule(uid, moduleId);
	}catch(error) {
		console.error("[generateUserModule] Error", error);
	}
}

// Updates a user's module.
export const updateUserModule = async (uid, moduleJSON) => {
	if (!uid) return null;

	const moduleId = moduleJSON.id
	const moduleName = moduleJSON.name;
	const moduleSections = moduleJSON.sections;

	const module = {};
	module[moduleId] = { id: moduleId, moduleName, moduleSections };

	try {
		await firestore.doc(`modules/${uid}`).set(
			module,
			{ merge: true }
		);

	}catch(error) {
		console.log("[updateUserModule] Error", error)
	}
}

// Signs user out.
export const signOutUser = () => {
	auth.signOut()
	.then(() => {
		// User is now successfully signed out.
	})
	.catch((error) => {
		console.log("[signOutUser] Error", error)
	})
}

// Retrieves some user based on email array.
export const retrieveSomeUsers = async (emailList) => {

	let users = [];
	try {
		for (let i = 0; i < emailList.length; i++) {
			const snap = await firestore.collection("users")
				.where("email", "==", emailList[i]).get();

			// Should always make only 1 iteration.
			snap.forEach((doc) => {
				users.push(doc.data());
			})
		}
	}catch(error) {
		console.log("[retrieveSomeUsers] Error", error);
	}
	return users;
}

// Retrieves all users from the db (WILL BE DEPRECATED IN THE FUTURE IF THE APP
// TAKES OFF BECAUSE IT'S NOT EFFICIENT AT ALL).
export const retrieveAllUsers = async () => {
	let users = [];
	try {
		const snap = await firestore.collection("users").get();
		snap.forEach(doc => {
			let userObj = doc.data();
			console.log(doc.data());
			userObj = {...userObj, id: userObj.email, value: userObj.displayName }
			users.push(userObj);
		});
	}catch(error) {
		console.log("[retrieveAllUsers] Error", error);
	}
	return users;
}

// Uploads video message to firebase
export const uploadVideoMessage = async (filename, blob, moduleId, userId) => {
	try {
		// 1) Upload video message to firebaseStorage.
		const storageRef = firebaseStorage.ref(filename);

		storageRef.put(blob).on("state_changed", (snapshot) => {
			// @TODO: progress bar.
			// const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		},
		(error) => {
			console.log("[postVideoMessage] Error 2", error);
		},
		async () => {
			const url = await storageRef.getDownloadURL();

			let module = {};
			module[moduleId] = { videoMessageURL: url }

			// 2) Upload video message link to module object on firestore.
			await firestore.doc(`modules/${userId}`).set(
				{ ...module },
				{ merge: true }
			);
		})
	}catch(error) {
		console.log("[postVideoMessage] Error 1", error);
	}
}

// Uploads audio message to firebase
export const uploadAudioMessage = async (filename, blob, moduleId, userId) => {
	try {
		// 1) Upload video message to firebaseStorage.
		const storageRef = firebaseStorage.ref(filename);

		storageRef.put(blob).on("state_changed", (snapshot) => {
			// @TODO: progress bar.
			// const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		},
		(error) => {
			console.log("[postVideoMessage] Error 2", error);
		},
		async () => {
			const url = await storageRef.getDownloadURL();

			let module = {};
			module[moduleId] = { audioMessageURL: url }

			// 2) Upload video message link to module object on firestore.
			await firestore.doc(`modules/${userId}`).set(
				{ ...module },
				{ merge: true }
			);
		})
	}catch(error) {
		console.log("[postVideoMessage] Error 1", error);
	}
}
