import React from 'react';
import ContentEditable from 'react-contenteditable'

import Block from '../Block/Block';
import ImageNode from '../ImageNode/ImageNode';

import
{
	generateRandomId, IMAGE, IMAGE_NODE_NO_IMAGE , IMAGE_NODE_HAS_IMAGE
} from '../../util/main_util'

import './Section.css'

class Section extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			title: this.props.title,
			blocks: this.props.blocks
		}

		this.sectionTitleRef = React.createRef();

		this.removeBlock = this.removeBlock.bind(this);
		this.handleNewBlock = this.handleNewBlock.bind(this);
		this.handleNewImage = this.handleNewImage.bind(this);
		this.onChangeBlockContent = this.onChangeBlockContent.bind(this);
		this.handleSectionTitleChange = this.handleSectionTitleChange.bind(this);
	}

	handleNewBlock() {
		// Creating the new block and updating local state.
		const newBlock = { id: generateRandomId(), content: 'My default block content' };
		let blocks = this.state.blocks;
		blocks.push(newBlock);

		this.setState({ blocks: [...blocks] });

		// Updating the section object containing this block in this Module's state.
		this.props.updateSection(this.props.id, null, this.state.blocks);
	}

	onChangeBlockContent(blockId, newBlockContent, blockType) {
		// Finding block whose content changed.
		const blocks = this.state.blocks;
		let block = blocks.find(block => block.id === blockId);

		// Updating current section state.
		if (blockType === IMAGE) {
			// Updating a block of type IMAGE.
			Object.assign(block, newBlockContent);
		}else {
			// Updating a regular block
			block.content = newBlockContent;
		}
		this.setState({ blocks: [...blocks] });

		// Updating the section object containing this block in this Module's state.
		this.props.updateSection(this.props.id, null, this.state.blocks);
	}

	removeBlock(e, id) {
		const blocks = this.props.blocks;
		const block = blocks.find(block => block.id === id);

		if (typeof block !== 'undefined') {
			const index = blocks.indexOf(block);

			if (index > -1) {
				// Splice is done in-place
				blocks.splice(index, 1);
				this.setState({ blocks: [...blocks] });

			}else {
				console.log('[Section -> removeBlock][2] Error');
			}
		}else {
			console.log('[Section -> removeBlock][1] Error');
		}
	}

	handleSectionTitleChange(e) {
		this.setState({ title: e.target.value });

		// Updating the section object containing this block in this Module's state.
		this.props.updateSection(this.props.id, e.target.value, null);
	}

	handleNewImage() {
		// An "image" in Allons is just a regular block, but instead of rendering
		// the default block UI, we're going to render a place to add images.
		const newImageNode = {
			type: IMAGE,
			id: generateRandomId(),
			stage: IMAGE_NODE_NO_IMAGE,
			imageLink: null
		};

		let blocks = this.state.blocks;
		blocks.push(newImageNode);

		this.setState({ blocks: [...blocks] });

		// Updating the section object containing this block in this Module's state.
		this.props.updateSection(this.props.id, null, this.state.blocks);
	}

	render() {
		const children = [];
		const blocks = this.state.blocks;

		for (let i = 0; i < blocks.length; i++) {

			if (blocks[i].type === IMAGE) {
				children.push(
					<ImageNode
						key={blocks[i].id}
						id={blocks[i].id}
						stage={blocks[i].stage}
						imageLink={blocks[i].imageLink}
						removeBlock={this.removeBlock}
						onChangeBlockContent={this.onChangeBlockContent}
					/>
				)
			}else {
				children.push(
					<Block
						key={i}
						id={blocks[i].id}
						content={blocks[i].content}
						removeBlock={this.removeBlock}
						onChangeBlockContent={this.onChangeBlockContent}
					/>
				)
			}
		}

		return (
			<div className='module-section'>
				<header>
					<ContentEditable
						innerRef={this.sectionTitleRef}
						html={this.state.title}
						disabled={false}
						onChange={this.handleSectionTitleChange}
						tagName='h2'
						className='section-title'
					/>
					<button onClick={e => this.props.removeSection(this.props.id)}>
						Delete Section
					</button>
					<button onClick={this.handleNewBlock}>Create block</button>
					<button onClick={this.handleNewImage}>Add image</button>
				</header>

				<div className='blocks'>
					{children}
				</div>
			</div>
		)
	}
}

export default Section;
