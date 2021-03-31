// Useful functions

// Generates random ids for modules, sections, and blocks
export const generateRandomId = () => {
	return Math.floor(Math.random() * 10000)
}

// @TODO: substitute the function above by the one below:
export const generateId = () => {
	return '_' + Math.random().toString(36).substr(2, 9);
}

// const DOMAIN_DEV = 'http://localhost:3000'
const DOMAIN_PROD = 'https://allons-beta.herokuapp.com'

export const generateVideoMessageEmbedCode = (uid) => {
	// No fancy URLs here for now since I'm only allowing one message type per user.
	return `<iframe title='should a title be necessary like mosquitoes' src='${DOMAIN_PROD}/msg/video/${uid}'/>`
}

export const generateAudioMessageEmbedCode = (uid) => {
	return `<iframe title='should a title be necessary like mosquitoes' src='${DOMAIN_PROD}/msg/audio/${uid}'/>`
}

// Useful constants

export const MODULE = 'module';
export const DOCUMENT = 'document';

export const VIDEO_MESSAGE = 'video-message';
export const AUDIO_MESSAGE = 'audio-message';
