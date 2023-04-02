import { Typography, Button, Paper, SvgIcon } from "@material-ui/core"
import SSRewards from '../../components/ssRewards'

import React, { useState, useEffect } from 'react';
import { ACTIONS } from '../../stores/constants';

import stores from '../../stores';
import { useRouter } from "next/router";
import Unlock from '../../components/unlock';

import classes from './rewards.module.css';

function Rewards({ changeTheme }) {

  const accountStore = stores.accountStore.getStore('account');
  const router = useRouter();
  const [account, setAccount] = useState(accountStore);
  const [unlockOpen, setUnlockOpen] = useState(false);

  useEffect(() => {
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore('account');
      setAccount(accountStore);
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };

    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(ACTIONS.CONNECT_WALLET, connectWallet);
    return () => {
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(ACTIONS.CONNECT_WALLET, connectWallet);
    };
  }, []);

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  return (
    <div className={classes.ffContainer}>
      {account && account.address ?
        <div className={classes.connected}>
          <SSRewards />
        </div>
         :
        <Paper className={classes.notConnectedContent}>
          <div className={classes.sphere}></div>
          <div className={classes.contentFloat}>
            <Typography className={classes.mainHeadingNC} variant='h1'>Rewards</Typography>
            <Typography className={classes.mainDescNC} variant='body2'>
              Claim your share of rewards!
            </Typography>
            <div style={{display:"grid", gridAutoFlow:"column", gap:"5px", alignItems:"center", border:"2px solid gray", padding:"2px", width:"fit-content", justifySelf:"center", margin:"auto"}}>
            <Button
            disableElevation
            className={classes.buttonConnect}
            variant="contained"
            onClick={onAddressClicked}>
            {account && account.address && <div className={`${classes.accountIcon} ${classes.metamask}`}></div>}
            Connect Wallet to Continue
            </Button>
            <div style={{height: "100%", width:"11px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
            <div style={{height: "100%", width:"8px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
            <div style={{height: "100%", width:"5px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
            </div>
          </div>
        </Paper>
       }
       {unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}

    </div>
  );
}

export default Rewards;
