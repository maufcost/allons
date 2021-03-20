import React from 'react';
// import './App.css';

class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			// Initially, this data will probably be in the db.
			sections: []
		}

		this.handleNewSection = this.handleNewSection.bind(this);
		this.handleNewBlock = this.handleNewBlock.bind(this);
	}

	handleNewSection(e) {

		// Generate random id (that can be a React key)
		const id = Math.floor(Math.random() * 1000);
		const newSection = { id, blocks: [] };

		// Append new section to sections object.
		let sections = this.state.sections;
		sections.push(newSection);
		this.setState({ sections });
	}

	handleNewBlock(e) {

		const sectionParentId = e.target.className;
		const sections = this.state.sections;

		// Generate random id.
		const id = Math.floor(Math.random() * 1000);

		// Find parent section to this new block.
		const parentSection = sections.find(section => section.id === parseInt(sectionParentId));

		// Append new block to the parent section.
		const newBlock = { id };
		parentSection.blocks.push(newBlock);

		// Update the state by merging back the parent section to the state.
		this.setState({ sections });
	}

	render() {

		const children = [];

		// Below in the button, it's the className property. But later, it will be some
		// kind of key or prop.
		const sections = this.state.sections;
		for (let i = 0; i < sections.length; i++) {
			children.push(
				<section key={sections[i].id}>
					<button className={sections[i].id} onClick={this.handleNewBlock}>
						Create block inside this section
					</button>
					This is a new section!
				</section>
			)
		}

		// console.log(this.state.sections)

		return (
			<div className="App">
				<button onClick={this.handleNewSection}>Create section</button>

				<div>
					{children}
				</div>
			</div>
		)
	}
}

export default App;
