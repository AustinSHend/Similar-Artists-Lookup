import React from 'react';
import axios from 'axios';
import qs from 'qs';

import SearchBar from './SearchBar';
import RelatedArtistsList from './RelatedArtistsList';
import LastFM from './LastFM';
import Spotify from './Spotify';
import Discogs from './Discogs';

const DISCOGS_API_KEY = '<YOUR KEY HERE>';
const LASTFM_API_KEY = '<YOUR KEY HERE>';
const SPOTIFY_CLIENT_KEY = '<YOUR KEY HERE>';
const SPOTIFY_SECRET_KEY = '<YOUR KEY HERE>';

const ARTIST_LIMIT = 10; // Can only query 30 artists per minute for Discogs information. 


class App extends React.Component {
    state = {
        sptToken: null,
        queryText: '',
        artistsArr: []
    };

    componentDidMount() {
        this.sptGetToken();
    }

    queryInputChanged = (event) => {
        this.setState({
            queryText: event.target.value
        });
    };

    async sptGetToken() {
        const sptOptions = {
            method: 'POST',
            headers: {
                'Authorization':
                    'Basic ' + (new Buffer(SPOTIFY_CLIENT_KEY + ':' + SPOTIFY_SECRET_KEY).toString('base64')),
                'User-agent': 'similar-artists-react'
            },
            data: qs.stringify({'grant_type': 'client_credentials'}),
            url: 'https://accounts.spotify.com/api/token'
        };

        let sptAuthRes = -1;
        await axios(sptOptions)
        .then(response => {
            sptAuthRes = response;
        })
        .catch(error => {
            console.log(error + ' when authenticating to Spotify');
        });
        if(sptAuthRes === -1) return;

        this.setState({
            sptToken: sptAuthRes.data.access_token
        });
    }

    dscQuerySubmit = async (query, index) => {
        let dscSearchRes = -1;
        await Discogs.get('/database/search', {
            params: {
                query: query,
                type: 'artist',
                per_page: 1,
                pages: 1,
                token: DISCOGS_API_KEY
            }
        })
        .then(response => {
            dscSearchRes = response;
        })
        .catch(error => {
            console.log(error + ' when searching Discogs for artist ' + query);

            if(error.response.status === 429) {
                console.log('Requeuing Discogs search for artist ' + query);
                this.dscQuerySubmit(query, index);
            }
        });
        if(dscSearchRes === -1) return;

        if(dscSearchRes.data != null && dscSearchRes.data.results.length !== 0) {
            this.dscArtistSubmit(dscSearchRes.data.results[0].id, index);
        }
    }

    dscArtistSubmit = async (query, index) => {
        let dscArtistRes = -1;
        await Discogs.get('/artists/' + query, {
            params: {
                token: DISCOGS_API_KEY
            }
        })
        .then(response => {
            dscArtistRes = response;
        })
        .catch(error => {
            console.log(error + ' when pulling Discogs data for artist ' + query + ' with ID ' + query);

            if(error.response.status === 429) {
                console.log('Requeuing Discogs data request for artist ' + query);
                this.dscArtistSubmit(query, index);
            }
        });
        if(dscArtistRes === -1) return;

        let dscArtist = dscArtistRes.data;
        if(dscArtist != null) {
            this.setState(prevState => {
                prevState.artistsArr[index] = {
                    ...prevState.artistsArr[index],
                    dscUrl: dscArtist.uri,
                    profile: dscArtist.profile,
                }

                return {
                    artistsArr: prevState.artistsArr
                }
            });
        }

    }

    sptQuerySubmit = async (query, index) => {
        let sptRes = -1;
        await Spotify.get('/search', {
            headers: {
                'Authorization': 'Bearer ' + this.state.sptToken
            },
            params: {
                q: query,
                type: 'artist',
                limit: 1
            }
        })
        .then(response => {
            sptRes = response;
        })
        .catch(error => {
            console.log(error + ' when searching Spotify for artist ' + query);

            if(error.response.status === 401) {
                console.log('Reauthenticating with Spotify and retrying for artist ' + query);
                this.sptGetToken();
                this.sptQuerySubmit(query, index);
            }
        });
        if(sptRes === -1) return;

        if(sptRes.data != null && sptRes.data.artists.items.length !== 0) {
            let sptArtist = sptRes.data.artists.items[0];

            if(sptArtist != null) {
                let tempImageLrg = '';
                let tempImageSml = '';
                if(sptArtist.images.length !== 0) {
                    tempImageSml = sptArtist.images[sptRes.data.artists.items.length-1].url;
                    tempImageLrg = sptArtist.images[0].url;
                }
                else {
                    tempImageSml = null;
                    tempImageLrg = null;
                }

                this.setState(prevState => {
                    prevState.artistsArr[index] = {
                        ...prevState.artistsArr[index],
                        genres: sptArtist.genres,
                        imageSml: tempImageSml,
                        imageLrg: tempImageLrg,
                        name: sptArtist.name,
                        popularity: sptArtist.popularity,
                        sptId: sptArtist.id,
                        sptUrl: sptArtist.external_urls.spotify
                    }

                    return {
                        artistsArr: prevState.artistsArr
                    }
                });
            }
        }
    }

    lfmQuerySubmit = async query => {
        this.setState({
            queryText: query
        });

        let lfmRes = -1;
        await LastFM.get('/', {
            params: {
                api_key: LASTFM_API_KEY,
                format: 'json',
                method: 'artist.getSimilar',
                autocorrect: 1,
                artist: query,
                limit: ARTIST_LIMIT
            }
        })
        .then(response => {
            lfmRes = response;
        })
        .catch(error => {
            console.log(error + ' when getting similar artists for artist ' + query);
        });
        if(lfmRes === -1) return;

        if(lfmRes.data != null && lfmRes.data.similarartists != null) {
            if(lfmRes.data.similarartists.artist.length === 0) {
                this.setState({
                    artistsArr: [{
                        lfmError: true
                    }]
                });
                return;
            }

            let results = 0;

            lfmRes.data.similarartists.artist.forEach(async (lfmArtist, index) => {
                this.setState(prevState => {
                    prevState.artistsArr[index] = {
                        genres: null,
                        imageSml: null,
                        imageLrg: null,
                        lfmUrl: lfmArtist.url,
                        match: lfmArtist.match,
                        name: lfmArtist.name,
                        popularity: null,
                        sptId: null,
                        sptUrl: null
                    }

                    return {
                        artistsArr: prevState.artistsArr
                    }
                });

                await Promise.all([this.sptQuerySubmit(lfmArtist.name, index), this.dscQuerySubmit(lfmArtist.name, index)]);

                results++;

                if(lfmRes.data.similarartists.artist.length === results) {
                    this.setState({
                        artistsArr: this.state.artistsArr.sort((a, b) => {
                            if(a.match < b.match) return 1;
                            else if(a.match > b.match) return -1;
                            return 0;
                        })
                    });
                }
            });
        }
    };

    render() {
        return (
            <div className="ui container">
                <SearchBar
                    lfmQuerySubmit={this.lfmQuerySubmit}
                    queryInputChanged={this.queryInputChanged}
                    queryText={this.state.queryText}
                />
                <RelatedArtistsList
                    artistsArr={this.state.artistsArr}
                    lfmQuerySubmit={this.lfmQuerySubmit}
                />
            </div>
        );
    }
}

export default App;