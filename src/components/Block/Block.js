import React from 'react';
import ReactQuill from 'react-quill';
import 'quill-mention';

import BlockViewer from '../BlockViewer/BlockViewer';

import { retrieveAllUsers } from '../../firebase';

import './Block.css';
import 'react-quill/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';

// const atValues = [
// 	{ id: 1, value: 'michaelscott@gmail.com' },
// 	{ id: 2, value: 'patrickvanhalen@gmail.com' }
// ]

const mention = async (searchTerm, renderItem, mentionChar) => {
	let values;

	if (mentionChar === '@') {
		// Because the app is at its early phase, and I want to test it as quickly
		// as possible, I will load all the users in memory as soon as I detect
		// a '@'.
		// values = atValues;
		values = await retrieveAllUsers();
	}

	if (searchTerm.length === 0) {
		renderItem(values, searchTerm);
	} else {
		const matches = [];
		for (let i = 0; i < values.length; i++) {
			if (values[i].displayName.toLowerCase().indexOf(searchTerm.toLowerCase())) {
				matches.push(values[i]);
				renderItem(matches, searchTerm);
			}
		}
	}
}

class Block extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			id: this.props.id,
			content: this.props.content,
			activeMentions: [],
			renderViewerBlock: true
		};

		this.quill = React.createRef();

		this.removeBlock = this.removeBlock.bind(this);
		this.previewBlock = this.previewBlock.bind(this);
		this.detectMentions = this.detectMentions.bind(this);
		this.onChangeContent = this.onChangeContent.bind(this);
		this.renderEditorBlock = this.renderEditorBlock.bind(this);
	}

	componentDidMount() {
		this.detectMentions(this.state.content);
	}

	// I need to do that because of when I remove blocks and how React does not
	// fully re-render a child component.
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.id !== this.props.id) {
			this.setState({
				id: this.props.id,
				content: this.props.content
			});
		}
	}

	onChangeContent(content, delta, source, editor) {

		// Quill has this weird bug where it adds these unneeded html tags.
		// content = content.replaceAll('<p><br></p>', '');

		// Updating local state.
		this.setState({ content });

		// Sending change to parent Section component
		this.props.onChangeBlockContent(this.state.id, content)

		// Detect mentions.
		this.detectMentions(content);
	}

	detectMentions(content) {
		let mentions = [];
		const regex = /data-id="\s*(.*?)\s*"/g;

		let match = regex.exec(content);
		while(match) {
			mentions.push(match[1]);
			match = regex.exec(content);
		}

		this.setState({ activeMentions: [...mentions] });
	}

	renderEditorBlock(e) {
		this.setState({ renderViewerBlock: false });
	}

	previewBlock(e) {
		this.setState({ renderViewerBlock: true });
	}

	removeBlock(e) {
		this.setState({ renderViewerBlock: true });

		this.props.removeBlock(e, this.state.id);
	}

	render() {
		// Quill configuration.
		const modules = {
			toolbar: [
				['bold', 'italic', 'underline','strike',
				{'list': 'ordered'}, {'list': 'bullet'}, 'link'],
			],
			mention: {
				allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
				mentionDenotationChars: ['@'],
				source: mention
			}
		}

		const formats = [
		    'bold', 'italic', 'underline', 'strike',
		    'list', 'bullet', 'link', 'mention'
		]

		return (
			<div className='module-block'>
				{this.state.renderViewerBlock ? (
					<BlockViewer
						renderEditorBlock={this.renderEditorBlock}
						content={this.state.content}
						mentions={this.state.activeMentions}
						isUsedOnEditor={true}
					/>
				) : (
					<div className='module-block-to-edit'>
						<header>
							<button
								onClick={this.removeBlock}
							>
								Delete Block
							</button>
							<button onClick={this.previewBlock}>Preview block</button>
						</header>
						<ReactQuill
							theme='snow'
							ref={el => this.quill = el}
							value={this.state.content}
							onChange={this.onChangeContent}
							modules={modules}
							formats={formats}
						/>
					</div>
				)}
			</div>
		)
	}
}

export default Block;
