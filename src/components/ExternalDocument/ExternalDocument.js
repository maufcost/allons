import React from 'react';
// Already using react-pdf's worker to more efficiently load PDFs:
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';

import { generateId } from '../../util/main_util'

import './ExternalDocument.css';

// Retrieve document id (pass as props to here)
// finish video and audio stuff
// preview document

class ExternalDocument extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			id: this.props.id || null,
			numPages: 1,
			pageNumber: 1,
			selectedDocumentFile: this.props.fileName && this.props.url ? true : null,
			selectedDocumentFileName: this.props.fileName || '',
			url: this.props.url,
			changingDoc: false
		};

		this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
		this.handleSelectedDocument = this.handleSelectedDocument.bind(this);
		this.handlePreviousPage = this.handlePreviousPage.bind(this);
		this.handleNextPage = this.handleNextPage.bind(this);
	}

	componentDidMount() {
		if (this.props.id === null) {
			this.setState({ id: generateId() });
		}
	}

	onDocumentLoadSuccess({ numPages }) {
		this.setState({ numPages });
	}

	handleSelectedDocument(e) {
		const selectedFile = e.target.files[0];

		// byte -> mb: divide by 1e6
		if ((selectedFile.size / 1000000) > 10) {
			this.props.setFlashMessage('We are sticking to PDFs smaller than 10 Mbs for now');
			return;
		}

		if (selectedFile && ['application/pdf'].includes(selectedFile.type)) {
			this.setState({
				selectedDocumentFile: selectedFile,
				selectedDocumentFileName: selectedFile.name
			}, () => {
				if (this.state.changingDoc) {
					// Changed the selected document.
					this.props.updateExternalDocument(
						this.state.id,
						this.state.selectedDocumentFileName,
						this.state.selectedDocumentFile
					);
				}else {
					// Just added a document
					this.props.createNewExternalDoc(
						this.state.id,
						this.state.selectedDocumentFileName,
						this.state.selectedDocumentFile
					);
				}

				this.setState({ changingDoc: true });
			});
		}else {
			this.props.setFlashMessage('We are only allowing PDFs for now.');
		}
	}

	addAudioMessage() {
		this.props.openAddAudioMessageModal({

		});
	}

	addVideoMessage() {
		this.props.openAddVideoMessageModal({

		});
	}

	handlePreviousPage() {
		this.setState({ pageNumber: this.state.pageNumber - 1 });
	}

	handleNextPage() {
		this.setState({ pageNumber: this.state.pageNumber + 1 });
	}

	render() {
		return (
			<div className='external-document'>
				<header>
					<button
						className='close-external-document-button'
						onClick={this.props.closeExternalDocument}
					>
						X
					</button>

					<h1>{this.state.selectedDocumentFileName}</h1>

					<div className='toolbar'>
						{this.state.selectedDocumentFile ? (
							<div className='toolbar-inner-container'>
								<div className='toolbar-line-one'>

									{!this.state.selectedDocumentFileName && !this.state.url &&
										<div className='document-input-container'>
											Change document
											<input type='file' onChange={this.handleSelectedDocument}/>
										</div>
									}

									<div>
										<button className='toolbar-item' onClick={this.addAudioMessage}>Add audio message</button>
										<button className='toolbar-item' onClick={this.addVideoMessage}>Add video message</button>
										<button className='toolbar-item' onClick={this.previewExternalDoc}>Preview document</button>
									</div>
								</div>
								<div className='toolbar-line-two'>
									<button className='toolbar-item' onClick={this.handlePreviousPage}>Previous page</button>
									<button className='toolbar-item' onClick={this.handleNextPage}>Next page</button>
									<span className='toolbar-item'>Page {this.state.pageNumber} of {this.state.numPages}</span>
								</div>
							</div>
						): (
							<div className='document-input-container'>
								<button>+ Add document</button>
								<input type='file' onChange={this.handleSelectedDocument}/>
							</div>
						)}
					</div>

				</header>

				{this.state.selectedDocumentFile && (
					<div className='selected-document-container'>
						<Document
							file={this.state.selectedDocumentFile}
							onLoadSuccess={this.onDocumentLoadSuccess}
							className='doc'
						>
							<Page pageNumber={this.state.pageNumber} />
						</Document>
					</div>
				)}

				{this.state.selectedDocumentFileName && this.state.url && (
					<div className='selected-document-container'>
						{this.state.url}
						<Document
							file={this.state.url}
							onLoadSuccess={this.onDocumentLoadSuccess}
							className='doc'
						>
							<Page pageNumber={this.state.pageNumber} />
						</Document>
					</div>
				)}
			</div>
		)
	}
}

// file={this.state.url}
// httpHeaders: {}

export default ExternalDocument;
