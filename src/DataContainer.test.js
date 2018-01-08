import React from 'react';
import ReactDOM from 'react-dom';
import DataContainer from './DataContainer.js';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DataContainer />, div);
});
