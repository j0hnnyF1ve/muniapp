import React from 'react';
import ReactDOM from 'react-dom';
import SfMap from './SfMap.js';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SfMap />, div);
});
