import React from 'react';
import ModalImage from "react-modal-image";

import '../styles/RelatedArtist.css';

class RelatedArtist extends React.Component {
    state = {
        imgElement: '',
        descElement: ''
    };

    updateImage() {
        if(this.props.artist.lfmError != null && this.props.artist.lfmError === true) {
            this.setState({
                imgElement: ''
            });
        }
        else if(this.props.artist.imageSml != null && this.props.artist.imageLrg != null){
            let newImgElement = <ModalImage
                alt={this.props.artist.name + ' artist image'}
                small={this.props.artist.imageSml}
                large={this.props.artist.imageLrg}
                className="artist-img ui image"
            />
            this.setState({
                imgElement: newImgElement
            });
        }
        else {
            let newImgElement = <ModalImage
                alt="Placeholder image"
                small="https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png"
                large="https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png"
                className="artist-img ui image"
            />
            this.setState({
                imgElement: newImgElement
            });
        }
    }

    updateDesc() {
        let lfmLogo = <a href={this.props.artist.lfmUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-lastfm-square" style={{color:'#D51007', fontSize: '16px'}}></i>
                    </a>;
        let sptLogo = <a href={this.props.artist.sptUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-spotify" style={{color:'#1DB954', fontSize: '14px'}}></i>
                    </a>;
        let dscLogo = <a href={this.props.artist.dscUrl} target="_blank" rel="noopener noreferrer">
                        <img alt="Discogs logo" src="discogs.png" style={{maxWidth: '13px'}}></img>
                    </a>;

        let tempNameElement = '';
        let tempMatchElement = '';
        let tempPopularityElement = '';
        let tempGenresElement = '';
        let tempProfileElement = '';
        
        if(this.props.artist.lfmError != null && this.props.artist.lfmError === true) {
            tempNameElement = <h4 className="header">Last.FM couldn't find any similar artists</h4>
        }
        else if(this.props.artist.name != null) {
            tempNameElement = <h4 className="artist-desc header" onClick={() => this.props.lfmQuerySubmit(this.props.artist.name)}>{this.props.artist.name}</h4>;
        }

        if(this.props.artist.match != null) {
            tempMatchElement = <div> {lfmLogo} <b>Match:</b> {((this.props.artist.match/1) * 100).toFixed(2) + '%'} </div>;
        }
        if(this.props.artist.popularity != null) {
            tempPopularityElement = <div>{sptLogo} <b>Popularity:</b> {this.props.artist.popularity}</div>;
        }
        if(this.props.artist.genres != null && this.props.artist.genres.length !== 0) {
            tempGenresElement = <div>{sptLogo} <b>Genres:</b> <span style={{textTransform: 'capitalize'}}>{this.props.artist.genres.join(', ')}</span></div>;
        }
        if(this.props.artist.profile != null && this.props.artist.profile !== '') {
            tempProfileElement = <div>{dscLogo} <b>Profile:</b> {this.props.artist.profile}</div>
        }

        this.setState(() => {
            return {
                descElement: <div>
                    {tempNameElement}
                    {tempMatchElement}
                    {tempPopularityElement}
                    {tempGenresElement}
                    {tempProfileElement}
                </div>
            }
        });
        
    }

    componentDidMount() {
        this.updateImage();
        this.updateDesc();
    }

    componentDidUpdate(prevProps) {
        if(prevProps !== this.props) {
            this.updateImage();
            this.updateDesc();
        }
    }

    render() {
        return (
            <div className="related-artist item">
                {this.state.imgElement}
                <div className="content">
                    {this.state.descElement}
                </div>
            </div>
        );
    }
}

export default RelatedArtist;