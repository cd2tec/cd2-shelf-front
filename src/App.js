import React, { useState } from 'react';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';

import theme from './theme';
import routes from './routes';
import GlobalStyles from './components/GlobalStyles';
import { AlertBox, loadDefaultAlertBox } from './utils/alerts';
import { LoggedContextProvider } from './context/LoggedContext';

function App() {
	const routing = useRoutes(routes);
	const [loaded, setLoaded] = useState(false);

	const onMounted = obj => {
		loadDefaultAlertBox(obj);
		setLoaded(true);
	}

	return (
		<LoggedContextProvider>
			<ThemeProvider theme={theme}>
				<GlobalStyles />
				<AlertBox onMounted={onMounted} />
				{loaded ? routing : null}
			</ThemeProvider>
		</LoggedContextProvider>
	);
}

export default App;
