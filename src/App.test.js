import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import JestFetch from 'jest-fetch-mock';
import 'jest-canvas-mock';

it('renders without crashing', () => {

  window.fetch = JestFetch;
  JestFetch.mockResponse(JSON.stringify(
    {vehicle: [
      {
      id: "8899",
      lon: "-122.477669",
      routeTag: "91",
      predictable: "true",
      speedKmHr: "35",
      dirTag: "91___I_N00",
      heading: "150",
      lat: "37.76656",
      secsSinceReport: "31"
      },
    ]}
  ));

  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
