import React from 'react';
import ReactDOM from 'react-dom';
import Gui from './Gui.js';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Gui />, div);
});
