import React from 'react';

class SearchBar extends React.Component {

    formSubmitted = (event) => {
        event.preventDefault();
        
        this.props.lfmQuerySubmit(this.props.queryText);
    };

    render() {
        return (
        <div className="ui segment">
            <form className="ui form" onSubmit={this.formSubmitted}>
                <div className="field">
                    <label>Search</label>
                    <input
                        type="text"
                        value={this.props.queryText}
                        onChange={this.props.queryInputChanged}
                    />
                </div>
            </form>
        </div>
        );
    }
}

export default SearchBar;