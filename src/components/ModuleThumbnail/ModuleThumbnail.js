import React from 'react'

import './ModuleThumbnail.css'

class ModuleThumbnail extends React.Component {

	constructor(props) {
		super(props)
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		console.log("ModuleThumbnail handleClick")
		const module = {
			id: this.props.id,
			moduleName: this.props.name,
			moduleSections: this.props.sections
		};
		this.props.showModule(module);
	}

	render() {
		return (
			<div
				className='module-thumbnail'
				onClick={this.handleClick}
			>
				<p>{this.props.name}</p>
			</div>
		)
	}
}

export default ModuleThumbnail;