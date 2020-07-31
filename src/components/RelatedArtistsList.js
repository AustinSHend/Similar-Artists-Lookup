import React from 'react';
import RelatedArtist from './RelatedArtist'


const RelatedArtistsList = props => {
    const artistList = props.artistsArr.map((artist, index) => {
        return <RelatedArtist key={index} artist={artist} lfmQuerySubmit={props.lfmQuerySubmit} />;
    });
    return <div className="ui relaxed divided list">{artistList}</div>; 
}

export default RelatedArtistsList;