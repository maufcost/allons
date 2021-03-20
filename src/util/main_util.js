// Generates random ids for modules, sections, and blocks
export const generateRandomId = () => {
	return Math.floor(Math.random() * 10000)
}

// @TODO: substitute the function above by the one below:
export const generateId = () => {
	return '_' + Math.random().toString(36).substr(2, 9);
}
