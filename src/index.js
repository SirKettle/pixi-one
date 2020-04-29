import React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './components/App/index.jsx';

console.log('TODO: log version, name from package.json');

const mountNode = document.getElementById('app');

ReactDOM.render(<App />, mountNode);
