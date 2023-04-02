import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";

import { Typography, Switch, Button, SvgIcon, Badge, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Grid } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import ListIcon from '@material-ui/icons/List';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import Navigation from '../navigation'
import Unlock from '../unlock';
import TransactionQueue from '../transactionQueue';

import { ACTIONS } from '../../stores/constants';

import stores from '../../stores';
import { formatAddress } from '../../utils';
import classes from './header.module.css';
import MobileHeader from './mobileHeader';
// import ListIcon from '@mui/icons-material/List';

const { CONNECT_WALLET, CONNECTION_DISCONNECTED, ACCOUNT_CONFIGURED, ACCOUNT_CHANGED, FIXED_FOREX_BALANCES_RETURNED, FIXED_FOREX_CLAIM_VECLAIM, FIXED_FOREX_VECLAIM_CLAIMED, FIXED_FOREX_UPDATED, ERROR } = ACTIONS

function WrongNetworkIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 64 64" strokeWidth="1" className={className}>
      <g strokeWidth="2" transform="translate(0, 0)"><path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M33.994,42.339 C36.327,43.161,38,45.385,38,48c0,3.314-2.686,6-6,6c-2.615,0-4.839-1.673-5.661-4.006" strokeLinejoin="miter"></path> <path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M47.556,32.444 C43.575,28.462,38.075,26,32,26c-6.075,0-11.575,2.462-15.556,6.444" strokeLinejoin="miter"></path> <path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M59.224,21.276 C52.256,14.309,42.632,10,32,10c-10.631,0-20.256,4.309-27.224,11.276" strokeLinejoin="miter"></path> <line data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="10" y1="54" x2="58" y2="6" strokeLinejoin="miter"></line></g>
    </SvgIcon>
  );
}

const StyledMenu = withStyles({
  paper: {
    border: '1px solid rgba(126,153,176,0.2)',
    marginTop: '10px',
    minWidth: '230px',
  },
})
((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: 'none',
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: '#FFF',
      },
    },
  },
}))(MenuItem);


const StyledSwitch = withStyles((theme) => ({
  root: {
    width: 45,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    paddingTop: 1.5,
    width: '70%',
    margin: 'auto',
    borderRadius: '20px',
    '&$checked': {
      paddingTop: '6px',
      transform: 'translateX(18px)',
      color: 'rgba(128,128,128, 1)',
      width: '25px',
      height: '25px',
      '& + $track': {
        backgroundColor: 'rgba(0,0,0, 0.3)',
        opacity: 1,
      },
    },
    '&$focusVisible $thumb': {
      color: '#ffffff',
      border: '6px solid #fff',
    },
  },
  track: {
    borderRadius: 32 / 2,
    border: '1px solid rgba(104,108,122, 0.25)',
    backgroundColor: 'rgba(0,0,0, 0)',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});


const StyledBadge = withStyles((theme) => ({
  badge: {
    background: '#06D3D7',
    color: '#000'
  },
}))(Badge);

function mobileHeader(props) {

  const accountStore = stores.accountStore.getStore('account');
  const [account, setAccount] = useState(accountStore);
  const [darkMode, setDarkMode] = useState(props.theme.palette.type === 'dark' ? true : false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [chainInvalid, setChainInvalid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transactionQueueLength, setTransactionQueueLength] = useState(0)
  const [showMobileHeader,setShowMobileHeader] = useState(false);
  useEffect(() => {
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore('account');
      setAccount(accountStore);
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };
    const accountChanged = () => {
      const invalid = stores.accountStore.getStore('chainInvalid');
      setChainInvalid(invalid)
    }

    const invalid = stores.accountStore.getStore('chainInvalid');
    setChainInvalid(invalid)

    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    stores.emitter.on(ACCOUNT_CHANGED, accountChanged);
    return () => {
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
      stores.emitter.removeListener(ACCOUNT_CHANGED, accountChanged);
    };
  }, []);

  useEffect(() => {
    const activePath = router.asPath
    if(activePath.includes('swap')) {
      setActive('swap')
    }
    if(activePath.includes('liquidity')) {
      setActive('liquidity')
    }
    if(activePath.includes('vest')) {
      setActive('vest')
    }
    if(activePath.includes('vote')) {
      setActive('vote')
    }
    if(activePath.includes('bribe')) {
      setActive('bribe')
    }
    if(activePath.includes('rewards')) {
      setActive('rewards')
    }
    if(activePath.includes('dashboard')) {
      setActive('dashboard')
    }
    if(activePath.includes('whitelist')) {
      setActive('whitelist')
    }
  }, [])


  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('swap')
  const router = useRouter()

  function handleNavigate(route) {
    router.push(route);
  }

  const [warningOpen, setWarningOpen] = useState(false);

  useEffect(function () {
    const localStorageWarningAccepted = window.localStorage.getItem('fixed.forex-warning-accepted');
    setWarningOpen(localStorageWarningAccepted ? localStorageWarningAccepted !== 'accepted' : true);
  }, []);

 
  const handleToggleChange = (event, val) => {
    setDarkMode(val);
    props.changeTheme(val);
  };

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  useEffect(function () {
    const localStorageDarkMode = window.localStorage.getItem('yearn.finance-dark-mode');
    setDarkMode(localStorageDarkMode ? localStorageDarkMode === 'dark' : false);
  }, []);

  const navigate = (url) => {
    router.push(url)
  }

  const callClaim = () => {
    setLoading(true)
    stores.dispatcher.dispatch({ type: FIXED_FOREX_CLAIM_VECLAIM, content: {} })
  }

  const switchChain = async () => {
    let hexChain = '0x' + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16)
      
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChain }],
      });
    } catch (switchError) {
      console.log("switch error", switchError)
    }
  }

  const setQueueLength = (length) => {
    setTransactionQueueLength(length)
  }

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const onActiveClick = (event, val) => {
    if(val) {
      setActive(val)
      handleNavigate('/' + val);
    }
  }
  const openWarning = () => {
    setWarningOpen(true)
  }

  const closeWarning = () => {
    window.localStorage.setItem('fixed.forex-warning-accepted', 'accepted');
    setWarningOpen(false)
  }

    const renderNavs = () => {
        return (
            <ToggleButtonGroup
                value={active}
                exclusive
                onChange={onActiveClick}
                className={classes.mobileMenu}
            >
                {renderSubNav(
                    'Swap',
                    'swap',
                )}
                {renderSubNav(
                    'Liquidity',
                    'liquidity',
                )}
                {renderSubNav(
                    'Lock',
                    'vest',
                )}
                {renderSubNav(
                    'Vote',
                    'vote',
                )}
                {renderSubNav(
                    'Bribe',
                    'bribe',
                )}
                {renderSubNav(
                    'Rewards',
                    'rewards',
                )}
                {/*renderSubNav(
                    'Whitelist',
                    'whitelist',
                )*/}
            </ToggleButtonGroup>
        );
    };
    const renderSubNav = (title, link) => {
        return (
          <ToggleButton value={link} className={ classes.navButton } classes={{ selected: classes.testChange }} onClick={()=>props.closeMenu(false)}>
            <Typography variant="h2" className={ classes.subtitleText}>{title}</Typography>
          </ToggleButton>
        );    
      };
    return (
        <>
            <div className={classes.mobileHeader}>
                {renderNavs()}
                <div>
                    {account && account.address ?
                        <div>
                          <div style={{display:"grid", gridAutoFlow:"column", gap:"5px", alignItems:"center", border:"2px solid gray", padding:"2px", width:"fit-content", justifySelf:"center", margin:"20px auto"}}>
            
                            <Button
                                disableElevation
                                variant="contained"
                                className={classes.connectBtn}
                                color={props.theme.palette.type === 'dark' ? 'primary' : 'secondary'}
                                aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                                {account && account.address && <div className={`${classes.accountIcon} ${classes.metamask}`}></div>}
                                <Typography className={classes.headBtnTxt}>{account && account.address ? formatAddress(account.address) : 'Connect Wallet'}</Typography>
                                <ArrowDropDownIcon className={classes.ddIcon} />
                            </Button>
                            <div style={{height: "100%", width:"11px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
                            </div>

                            <StyledMenu
                                id="customized-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                className={classes.userMenu}
                            >
                                <StyledMenuItem className={classes.hidden} onClick={() => router.push('/dashboard')}>
                                    <ListItemIcon className={classes.userMenuIcon}>
                                        <DashboardOutlinedIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText className={classes.userMenuText} primary="Dashboard" />
                                </StyledMenuItem>
                                <StyledMenuItem onClick={onAddressClicked}>
                                    <ListItemIcon className={classes.userMenuIcon}>
                                        <AccountBalanceWalletOutlinedIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText className={classes.userMenuText} primary="Switch Wallet Provider" />
                                </StyledMenuItem>
                            </StyledMenu>
                        </div>
                        :
                        <Button
                            disableElevation
                            className={classes.connectBtn}
                            variant="contained"
                            color={props.theme.palette.type === 'dark' ? 'primary' : 'secondary'}
                            onClick={onAddressClicked}>
                            {account && account.address && <div className={`${classes.accountIcon} ${classes.metamask}`}></div>}
                            <Typography className={classes.headBtnTxt}>{account && account.address ? formatAddress(account.address) : 'Connect Wallet'}</Typography>
                        </Button>
                    }

                </div>
                {unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}
                <TransactionQueue setQueueLength={setQueueLength} />
            </div>
        </>
    )
}
export default withTheme(mobileHeader);