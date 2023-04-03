import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Typography,
  Switch,
  Button,
  SvgIcon,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";
import HelpIcon from "@material-ui/icons/Help";
import ListIcon from "@material-ui/icons/List";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import AccountBalanceWalletOutlinedIcon from "@material-ui/icons/AccountBalanceWalletOutlined";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import Navigation from "../navigation";
import Unlock from "../unlock";
import TransactionQueue from "../transactionQueue";
import { ACTIONS } from "../../stores/constants";
import stores from "../../stores";
import { formatAddress } from "../../utils";
import classes from "./header.module.css";
import MobileHeader from "./mobileHeader";
import GlacierLogo from "../media/GlacierLogo";

// import ListIcon from '@mui/icons-material/List';
function SiteLogo(props) {
  const { color, className } = props;
  return <GlacierLogo href="/" viewBox="0 0 147.7 50" />;
}

const {
  CONNECT_WALLET,
  CONNECTION_DISCONNECTED,
  ACCOUNT_CONFIGURED,
  ACCOUNT_CHANGED,
  FIXED_FOREX_BALANCES_RETURNED,
  FIXED_FOREX_CLAIM_VECLAIM,
  FIXED_FOREX_VECLAIM_CLAIMED,
  FIXED_FOREX_UPDATED,
  ERROR,
} = ACTIONS;

function WrongNetworkIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 64 64" strokeWidth="1" className={className}>
      <g strokeWidth="2" transform="translate(0, 0)">
        <path
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          d="M33.994,42.339 C36.327,43.161,38,45.385,38,48c0,3.314-2.686,6-6,6c-2.615,0-4.839-1.673-5.661-4.006"
          strokeLinejoin="miter"
        ></path>{" "}
        <path
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          d="M47.556,32.444 C43.575,28.462,38.075,26,32,26c-6.075,0-11.575,2.462-15.556,6.444"
          strokeLinejoin="miter"
        ></path>{" "}
        <path
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          d="M59.224,21.276 C52.256,14.309,42.632,10,32,10c-10.631,0-20.256,4.309-27.224,11.276"
          strokeLinejoin="miter"
        ></path>{" "}
        <line
          data-color="color-2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          x1="10"
          y1="54"
          x2="58"
          y2="6"
          strokeLinejoin="miter"
        ></line>
      </g>
    </SvgIcon>
  );
}

const StyledMenu = withStyles({
  paper: {
    border: "1px solid rgba(126,153,176,0.2)",
    marginTop: "10px",
    minWidth: "230px",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: "none",
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: "#FFF",
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
    width: "70%",
    margin: "auto",
    borderRadius: "20px",
    "&$checked": {
      paddingTop: "6px",
      transform: "translateX(18px)",
      color: "rgba(128,128,128, 1)",
      width: "25px",
      height: "25px",
      "& + $track": {
        backgroundColor: "rgba(0,0,0, 0.3)",
        opacity: 1,
      },
    },
    "&$focusVisible $thumb": {
      color: "#ffffff",
      border: "6px solid #fff",
    },
  },
  track: {
    borderRadius: 32 / 2,
    border: "1px solid rgba(104,108,122, 0.25)",
    backgroundColor: "rgba(0,0,0, 0)",
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
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
    background: "#06D3D7",
    color: "#000",
  },
}))(Badge);

function Header(props) {
  const accountStore = stores.accountStore.getStore("account");
  const router = useRouter();

  const [account, setAccount] = useState(accountStore);
  const [darkMode, setDarkMode] = useState(
    props.theme.palette.type === "dark" ? true : false
  );
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [chainInvalid, setChainInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const [showMobileHeader, setShowMobileHeader] = useState(false);
  const closeMenuFunction = (data) => {
    setShowMobileHeader(data);
  };
  useEffect(() => {
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      setAccount(accountStore);
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };
    const accountChanged = () => {
      const invalid = stores.accountStore.getStore("chainInvalid");
      setChainInvalid(invalid);
    };

    const invalid = stores.accountStore.getStore("chainInvalid");
    setChainInvalid(invalid);

    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    stores.emitter.on(ACCOUNT_CHANGED, accountChanged);
    return () => {
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
      stores.emitter.removeListener(ACCOUNT_CHANGED, accountChanged);
    };
  }, []);

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  useEffect(function () {
    const localStorageDarkMode = window.localStorage.getItem(
      "yearn.finance-dark-mode"
    );
    setDarkMode(localStorageDarkMode ? localStorageDarkMode === "dark" : false);
  }, []);

  const navigate = (url) => {
    router.push(url);
  };

  const callClaim = () => {
    setLoading(true);
    stores.dispatcher.dispatch({
      type: FIXED_FOREX_CLAIM_VECLAIM,
      content: {},
    });
  };

  const switchChain = async () => {
    let hexChain = "0x" + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });
    } catch (switchError) {
      console.log("switch error", switchError);
    }
  };

  const setQueueLength = (length) => {
    setTransactionQueueLength(length);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //tvl bar elements
  const [tvl, setTVL] = useState(0);
  const [glcrPrice, setGLCRPrice] = useState(0);
  const [dailyVolume, setDailyVolume] = useState(0);

  useEffect(() => {
    async function fetchPriceAndVolume() {
      //price and volume
      const priceReq = await fetch(
        "https://api.dexscreener.com/latest/dex/tokens/0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6"
      );
      const priceData = await priceReq.json();
      //tvl
      const tvlReq = await fetch("https://api.llama.fi/tvl/glacier-finance");
      const tvlData = await tvlReq.json();
      //UI sets
      setTVL(Number(tvlData).toFixed(0) + "$");
      setGLCRPrice(Number(priceData.pairs[0].priceUsd).toFixed(3) + "$");
      setDailyVolume(Number(priceData.pairs[0].volume.h24).toFixed(0) + "$");
    }

    fetchPriceAndVolume();
  }, []);

  return (
    <div>
      <Grid item container className={classes.mainHeader}>
        <Grid item lg={3} xs={12} className={classes.headerlogoSide}>
          <div className={classes.mainLogo} style={{ width: "fit-content" }}>
            <a onClick={() => router.push("/home")}>
              <SiteLogo />
            </a>
          </div>
          {!showMobileHeader && (
            <div className={classes.tvlBar}>
              <div className={classes.tvlCell}>
                <h2 style={{ color: "magenta", fontSize: "12px" }}>TVL</h2>
                <span>{tvl}</span>
              </div>
              <div className={classes.tvlCell}>
                <h2 style={{ color: "magenta", fontSize: "12px" }}>
                  GLCR Price
                </h2>
                <span>{glcrPrice}</span>
              </div>
              <div className={classes.tvlCell}>
                <h2 style={{ color: "magenta", fontSize: "12px" }}>
                  Volume (24hr)
                </h2>
                <span>{dailyVolume}</span>
              </div>
            </div>
          )}

          <div className={classes.menubar}>
            <ListIcon
              size="large"
              onClick={() => setShowMobileHeader(!showMobileHeader)}
            />
          </div>
        </Grid>
        <Grid item lg={9} xs={12} className={classes.rightSide}>
          <div className={classes.headerLeft}>
            {process.env.NEXT_PUBLIC_CHAINID == "43113" && (
              <div className={classes.testnet}>
                <Typography>Testnet</Typography>
              </div>
            )}
            <Navigation changeTheme={props.changeTheme} />
            <div style={{ display: "flex", gap: "5px" }}>
              {transactionQueueLength > 0 && (
                <IconButton
                  variant="contained"
                  color={
                    props.theme.palette.type === "dark"
                      ? "primary"
                      : "secondary"
                  }
                  onClick={() => {
                    stores.emitter.emit(ACTIONS.TX_OPEN);
                  }}
                >
                  <StyledBadge
                    badgeContent={transactionQueueLength}
                    color="secondary"
                    overlap="circular"
                  >
                    <ListIcon className={classes.iconColor} />
                  </StyledBadge>
                </IconButton>
              )}

              {account && account.address ? (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridAutoFlow: "column",
                      gap: "5px",
                      alignItems: "center",
                      border: "2px solid gray",
                      padding: "2px",
                    }}
                  >
                    <Button
                      disableElevation
                      variant="contained"
                      className={classes.connectBtn}
                      color={
                        props.theme.palette.type === "dark"
                          ? "primary"
                          : "secondary"
                      }
                      aria-controls="simple-menu"
                      aria-haspopup="true"
                      onClick={handleClick}
                    >
                      {account && account.address && (
                        <div
                          className={`${classes.accountIcon} ${classes.metamask}`}
                        ></div>
                      )}
                      <Typography className={classes.headBtnTxt}>
                        {account && account.address
                          ? formatAddress(account.address)
                          : "Connect Wallet"}
                      </Typography>
                      <ArrowDropDownIcon className={classes.ddIcon} />
                    </Button>
                    <div
                      style={{
                        height: "100%",
                        width: "11px",
                        background:
                          "linear-gradient(0deg, cyan, blue, purple,magenta, red)",
                      }}
                    ></div>
                    <div
                      style={{
                        height: "100%",
                        width: "8px",
                        background:
                          "linear-gradient(0deg, cyan, blue, purple,magenta, red)",
                      }}
                    ></div>
                    <div
                      style={{
                        height: "100%",
                        width: "5px",
                        background:
                          "linear-gradient(0deg, cyan, blue, purple,magenta, red)",
                      }}
                    ></div>
                  </div>

                  <StyledMenu
                    id="customized-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    className={classes.userMenu}
                  >
                    <StyledMenuItem
                      className={classes.hidden}
                      onClick={() => router.push("/dashboard")}
                    >
                      <ListItemIcon className={classes.userMenuIcon}>
                        <DashboardOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        className={classes.userMenuText}
                        primary="Dashboard"
                      />
                    </StyledMenuItem>
                    <StyledMenuItem onClick={onAddressClicked}>
                      <ListItemIcon className={classes.userMenuIcon}>
                        <AccountBalanceWalletOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        className={classes.userMenuText}
                        primary="Switch Wallet Provider"
                      />
                    </StyledMenuItem>
                  </StyledMenu>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gap: "5px",
                    alignItems: "center",
                    border: "2px solid gray",
                    padding: "2px",
                  }}
                >
                  <Button
                    disableElevation
                    className={classes.connectBtnIA}
                    variant="contained"
                    color={
                      props.theme.palette.type === "dark"
                        ? "primary"
                        : "secondary"
                    }
                    onClick={onAddressClicked}
                    style={{
                      background:
                        "linear-gradient(180deg, #F4F1F7 0%, #ECE3F3 44.13%, #8F7D9D 86.26%, #F6ECFD 100%)",
                    }}
                  >
                    {account && account.address && (
                      <div
                        className={`${classes.accountIcon} ${classes.metamask}`}
                      ></div>
                    )}
                    {account && account.address
                      ? formatAddress(account.address)
                      : "Connect Wallet"}
                  </Button>
                  <div
                    style={{
                      height: "100%",
                      width: "11px",
                      background:
                        "linear-gradient(0deg, cyan, blue, purple,magenta, red)",
                    }}
                  ></div>
                </div>
              )}
            </div>
            {unlockOpen && (
              <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
            )}
            <TransactionQueue setQueueLength={setQueueLength} />
          </div>
        </Grid>
      </Grid>

      {showMobileHeader && (
        <Grid container item style={{ marginTop: "20px" }}>
          <MobileHeader closeMenu={closeMenuFunction} />
        </Grid>
      )}

      {chainInvalid ? (
        <div className={classes.chainInvalidError}>
          <div className={classes.ErrorContent}>
            <WrongNetworkIcon className={classes.networkIcon} />
            <Typography className={classes.ErrorTxt}>
              Please ensure your wallet is connected to Avalanche C-Chain!
            </Typography>
            <div
              style={{
                display: "grid",
                gridAutoFlow: "column",
                gap: "5px",
                alignItems: "center",
                border: "2px solid gray",
                padding: "2px",
                width: "fit-content",
                justifySelf: "center",
                margin: "20px auto",
              }}
            >
              <Button
                className={classes.switchNetworkBtn}
                variant="contained"
                onClick={() => switchChain()}
              >
                Switch to{" "}
                {process.env.NEXT_PUBLIC_CHAINID == "43113"
                  ? "Fuji Testnet"
                  : "Avalanche C-Chain"}
              </Button>
              <div
                style={{
                  height: "100%",
                  width: "11px",
                  background:
                    "linear-gradient(0deg, cyan, blue, purple,magenta, red)",
                }}
              ></div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default withTheme(Header);
