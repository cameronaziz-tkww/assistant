import { setAutoFreeze } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom';
import Application from './application';

setAutoFreeze(false);

ReactDOM.render(<Application />, document.getElementById('root'));
