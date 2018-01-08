import React, { Component } from 'react';
import DataContainer from './DataContainer.js';
import './App.css';

class App extends Component {

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">SF Muni & Transit App</h1>
        </header>
        <DataContainer />
      </div>
    );
  }
}

export default App;
