import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

ReactDOM.render(
	<BrowserRouter>
		<MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} locale="pt-br">
			<App />
		</MuiPickersUtilsProvider>
	</BrowserRouter>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
