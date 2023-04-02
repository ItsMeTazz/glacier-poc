import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Layout from '../components/layout/layout.js';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useRouter } from 'next/router';
import lightTheme from '../theme/light';
import darkTheme from '../theme/dark';
import Configure from './configure';
import ShutdownNotice from '../components/shutdownNotice'
import stores from '../stores/index.js';
import { ACTIONS } from '../stores/constants';
import '../styles/global.css'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const [themeConfig, setThemeConfig] = useState(darkTheme);
  const [stalbeSwapConfigured, setStableSwapConfigured] = useState(false);
  const [accountConfigured, setAccountConfigured] = useState(false);

  const accountConfigureReturned = () => {
    setAccountConfigured(true);
  };

  const stalbeSwapConfigureReturned = () => {
    setStableSwapConfigured(true);
  };

  useEffect(function () {
    stores.emitter.on(ACTIONS.CONFIGURED_SS, stalbeSwapConfigureReturned);
    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigureReturned);

    stores.dispatcher.dispatch({ type: ACTIONS.CONFIGURE });

    return () => {
      stores.emitter.removeListener(ACTIONS.CONFIGURED_SS, stalbeSwapConfigureReturned);
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, accountConfigureReturned);
    };
  }, []);

  const validateConfigured = () => {
    switch (router.pathname) {
      case '/':
        return accountConfigured;
      default:
        return accountConfigured;
    }
  };

  const [shutdownNoticeOpen, setShutdownNoticeOpen] = useState(false);
  const closeShutdown = () => {
    setShutdownNoticeOpen(false)
  }

  return (
    <React.Fragment>
      <Head>
        <title>Glacier</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={themeConfig}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        { validateConfigured() && (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
        {!validateConfigured() && <Configure {...pageProps} />}
        { shutdownNoticeOpen &&
          <ShutdownNotice close={ closeShutdown } />
        }
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
