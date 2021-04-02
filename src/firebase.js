// Firebase configuration
// Firebase tools used: Cloud Firestore and Authentication.

// Based on:
// https://blog.logrocket.com/user-authentication-firebase-react-apps/

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage"

import {
	AUDIO_MESSAGE,
	VIDEO_MESSAGE,
	MODULE,
	DOCUMENT
} from './util/main_util';

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

	// The user does not exist.
	if (!snapshot.exists) {
		const { email } = user;

		// Creating new user.
		try {
			await userRef.set({
				email,
				displayName: additionalData.displayName,
				photoURL: null,
				// I am adding these two properties to the user db doc because
				// while allons is in beta, I will only allow one embedded
				// message type per user.
				embeddedVideoMessageURL: null,
				embeddedAudioMessageURL: null
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
		moduleSections: [],
		viewers: 0
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
			userObj = {...userObj, id: userObj.email, value: userObj.displayName }
			users.push(userObj);
		});
	}catch(error) {
		console.log("[retrieveAllUsers] Error", error);
	}
	return users;
}

// Uploads video message to firebase (to a module or an external document)
export const uploadVideoMessageToInstance = async (filename, blob, instanceId, userId, instanceType) => {
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

			let instance = {};
			instance[instanceId] = { videoMessageURL: url }

			// 2) Upload video message link to module object on firestore.
			let arg1 = '';
			if (instanceType === MODULE) {
				arg1 = 'modules';
			}else if (instanceType === DOCUMENT) {
				arg1 = 'external-documents'
			}

			await firestore.doc(`${arg1}/${userId}`).set(
				{ ...instance },
				{ merge: true }
			);
		})
	}catch(error) {
		console.log("[postVideoMessage] Error 1", error);
	}
}

// Uploads audio message to firebase (to a module or an external document)
export const uploadAudioMessage = async (filename, blob, instanceId, userId, instanceType) => {
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

			let instance = {};
			instance[instanceId] = { audioMessageURL: url }

			// 2) Upload video message link to module object on firestore.
			let arg1 = '';
			if (instanceType === 'module') {
				arg1 = 'modules';
			}else if (instanceType === 'document') {
				arg1 = 'external-documents'
			}

			await firestore.doc(`${arg1}/${userId}`).set(
				{ ...instance },
				{ merge: true }
			);
		})
	}catch(error) {
		console.log("[postVideoMessage] Error 1", error);
	}
}

// Creates a new external document for a user
export const createNewExternalDocument = async (uid, externalDocumentId, fileName, file) => {
	if (!uid) return null;
	if (!externalDocumentId) return null;

	let url;

	try {
		const storageRef = firebaseStorage.ref(externalDocumentId);

		storageRef.put(file).on("state_changed", (snapshot) => {
			// Any progress bar stuff can go here...
		},
		(error) => {
			console.log("[createNewExternalDocument] Error 2", error);
		},
		await addEverythingToTheDB
		);

		async function addEverythingToTheDB() {
			const url = await storageRef.getDownloadURL();

			let doc = {};
			doc[externalDocumentId] = { id: externalDocumentId, url, fileName };

			firestore.doc(`external-documents/${uid}`).set(
				{ ...doc },
				{ merge: true }
			)
		}

		return { id: externalDocumentId, url, fileName };

	}catch(error) {
		console.log("[createNewExternalDocument] Error 1", error);
	}
}

// Retrieves an external document
export const getExternalDocument = async (uid, externalDocumentId) => {
	if (!uid) return null;
	if (!externalDocumentId) return null;

	try {
		// @TODO: Change db schema (to create subcollections) to retrieve only one document.
		const doc = await firestore.doc(`external-documents/${uid}`).get(); // retrieves all of them.
		return doc.data()[externalDocumentId];
	}catch(error) {
		console.log("[getExternalDocument] Error", error);
	}
}

// Updates an external document
export const updateExternalDocument = async (uid, externalDocumentId, fileName, file) => {
	if (!uid) return null;
	if (!externalDocumentId) return null;

	try {
		// externalDocumentId must be the same as when I added to the database
		// so that I can override the last document (and not store two documents)
		const storageRef = firebaseStorage.ref(externalDocumentId);

		storageRef.put(file).on("state_changed", (snapshot) => {

		},
		(error) => {
			console.log("[updateExternalDocument] Error 2", error);
		},
		async () => {
			const url = await storageRef.getDownloadURL();

			let doc = {};
			doc[externalDocumentId] = { id: externalDocumentId, url, fileName };

			await firestore.doc(`external-documents/${uid}`).set(
				{ ...doc },
				{ merge: true }
			);
		});
	}catch(error) {
		console.log("[updateExternalDocument] Error 1", error);
	}
}

// Retrieves all external documents from a user.
export const getExternalDocuments = async uid => {
	if (!uid) return null;

	try {
		const docs = await firestore.doc(`external-documents/${uid}`).get();
		return {
			externalDocuments: docs.data()
		}
	}catch(error) {
		console.log("[getExternalDocuments] Error", error);
	}
}

// Adds video/audio message to a user firebase document.
export const uploadEmbeddableMessageToUser = (messageId, blob, uid, messageType) => {
	if (!uid) return null;
	if (!blob) return null;

	try {
		// externalDocumentId must be the same as when I added to the database
		// so that I can override the last document (and not store two documents)
		const storageRef = firebaseStorage.ref(messageId);

		storageRef.put(blob).on("state_changed", (snapshot) => {
		},
		(error) => {
			console.log("[uploadVideoMessageToUser] Error 2", error);
		},
		async () => {
			const url = await storageRef.getDownloadURL();

			let user = {}
			if (messageType === VIDEO_MESSAGE) {
				user = { embeddedVideoMessageURL: url };
			}else if (messageType === AUDIO_MESSAGE) {
				user = { embeddedAudioMessageURL: url };
			}

			await firestore.doc(`users/${uid}`).set(
				{ ...user },
				{ merge: true }
			);
		});
	}catch(error) {
		console.log("[uploadVideoMessageToUser] Error 1", error);
	}
}

export const getEmbedMessageURL = async (uid, msgType) => {
	if (!uid) return;
	if (!msgType) return;

	try {
		const user = await getUserDocument(uid);

		if (msgType === VIDEO_MESSAGE) {
			return user.embeddedVideoMessageURL;
		}else if (msgType === AUDIO_MESSAGE) {
			return user.embeddedAudioMessageURL;
		}else {
			return { error: 'Something is wrong bro. Contact: mauriciofigueiredo@knights.ucf.edu right now.' };
		}
	}catch(error) {
		console.log("[getEmbedMessageURL] Error", error);
	}
}
