import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Typography,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Popper,
  Fade,
  Grid,
  Switch,
  Select,
  MenuItem
} from '@material-ui/core';
import classes from './ssRewards.module.css';
import Footer from '../IconsFooter/footer';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import RewardsTable from './ssRewardsTable.js'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

import { formatCurrency } from '../../utils';
import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssRewards() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [rewards, setRewards] = useState([])
  const [vestNFTs, setVestNFTs] = useState([])
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [token, setToken] = useState(null)
  const [veToken, setVeToken] = useState(null)
  const [loading, setLoading] = useState(false)

  const stableSwapUpdated = (rew) => {
    const nfts = stores.stableSwapStore.getStore('vestNFTs')
    setVestNFTs(nfts)
    setVeToken(stores.stableSwapStore.getStore('veToken'))

    if (nfts && nfts.length > 0) {
      if (!token) {
        setToken(nfts[0])
        window.setTimeout(() => {
          stores.dispatcher.dispatch({ type: ACTIONS.GET_REWARD_BALANCES, content: { tokenID: nfts[0].id } })
        })
      } else {
        window.setTimeout(() => {
          stores.dispatcher.dispatch({ type: ACTIONS.GET_REWARD_BALANCES, content: { tokenID: token.id } })
        })
      }
    } else {
      window.setTimeout(() => {
        stores.dispatcher.dispatch({ type: ACTIONS.GET_REWARD_BALANCES, content: { tokenID: 0 } })
      })
    }

    forceUpdate()
  }

  const rewardBalancesReturned = (rew) => {
    if (rew) {
      console.log(rew)
      // if (rew && rew.bribes && rew.fees && rew.rewards && rew.veDist && rew.feesBribe && rew.bribes.length >= 0 && rew.fees.length >= 0 && rew.rewards.length >= 0 && rew.feesBribe >= 0) {
        setRewards([...rew.bribes, ...rew.fees, ...rew.rewards, ...rew.veDist, ...rew.feesBribe])
      // }
    } else {
      let re = stores.stableSwapStore.getStore('rewards')
      console.log(re)
      if (re && re.bribes && re.fees && re.rewards && re.veDist && re.feesBribe && re.bribes.length >= 0 && re.fees.length >= 0 && re.rewards.length >= 0 && re.feesBribe >= 0) {
        setRewards([...re.bribes, ...re.fees, ...re.rewards, ...re.veDist, ...re.feesBribe])
      }
    }
  }

  useEffect(() => {
    rewardBalancesReturned()
    stableSwapUpdated()

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    stores.emitter.on(ACTIONS.REWARD_BALANCES_RETURNED, rewardBalancesReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
      stores.emitter.removeListener(ACTIONS.REWARD_BALANCES_RETURNED, rewardBalancesReturned);
    };
  }, [token]);

  useEffect(() => {

    const claimReturned = () => {
      setLoading(false)
    }

    const claimAllReturned = () => {
      setLoading(false)
    }

    stableSwapUpdated()

    stores.emitter.on(ACTIONS.CLAIM_BRIBE_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_FEES_BRIBE_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_REWARD_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_PAIR_FEES_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_VE_DIST_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, claimAllReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.CLAIM_BRIBE_RETURNED, claimReturned);
      stores.emitter.removeListener(ACTIONS.CLAIM_FEES_BRIBE_RETURNED, claimReturned);//
      stores.emitter.removeListener(ACTIONS.CLAIM_REWARD_RETURNED, claimReturned);
      stores.emitter.removeListener(ACTIONS.CLAIM_PAIR_FEES_RETURNED, claimReturned);
      stores.emitter.removeListener(ACTIONS.CLAIM_VE_DIST_RETURNED, claimReturned);
      stores.emitter.removeListener(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, claimAllReturned);
    };
  }, [])

  const onSearchChanged = (event) => {
    setSearch(event.target.value);
  };

  const onClaimAll = () => {
    setLoading(true)
    let sendTokenID = 0
    if (token && token.id) {
      sendTokenID = token.id
    }
    stores.dispatcher.dispatch({ type: ACTIONS.CLAIM_ALL_REWARDS, content: { pairs: rewards, tokenID: sendTokenID } })
  }

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleChange = (event) => {
    setToken(event.target.value);
    stores.dispatcher.dispatch({ type: ACTIONS.GET_REWARD_BALANCES, content: { tokenID: event.target.value.id } })
  }

  const open = Boolean(anchorEl);
  const id = open ? 'transitions-popper' : undefined;

  const renderMediumInput = (value, options) => {
    return (
      <div className={classes.textField}>
        <div className={classes.mediumInputContainer}>
          <Grid container>
            <Grid item lg='auto' md='auto' sm={12} xs={12}>
              <Typography variant="body2" className={classes.helpText}>Please select your veNFT:</Typography>
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <div className={classes.mediumInputAmount}>
                <Select
                  fullWidth
                  value={value}
                  onChange={handleChange}
                  InputProps={{
                    className: classes.mediumInput,
                  }}
                >
                  {options && options.map((option) => {
                    return (
                      <MenuItem key={option.id} value={option} style={{background:"black", border:"2px solid gray"}}>
                        <div className={classes.menuOption}>
                          <Typography>Token #{option.id}</Typography>
                          <div>
                            <Typography align='right' className={classes.smallerText}>{formatCurrency(option.lockValue)}</Typography>
                            <Typography color='textSecondary' className={classes.smallerText}>{veToken?.symbol}</Typography>
                          </div>
                        </div>
                      </MenuItem>
                    )
                  })}
                </Select>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.container}>
      <div className={classes.toolbarContainer}>
        <Grid container spacing={1} style={{width:"100%", margin:"0 auto -10px auto"}}>
          {/*title and subtext*/}
          <Grid container mb={3} style={{border:"2px solid gray", padding:"20px", background:"black"}}>
            <Grid item lg={6} md='auto' sm={12} xs={12} >
              <Typography variant='h1' className="themesh1">Rewards</Typography>
              <Typography className={classes.pooltext} >
              Claim any rewards from locking tokens, any new emissions, bribes and the fees of any pool you have voted
                </Typography>
            </Grid>
          </Grid>
          <div className={classes.mobileSection} style={{display:"flex", gap: "10px", margin:"10px auto", width:"100%", height:"100%", alignItems:"center", justifyContent:"space-between"}}>
            {/*veNFT selector dropdown*/}
            <Grid item lg='auto' md='auto' sm={12} xs={12}>
            <div className={classes.tokenIDContainer}>
              {renderMediumInput(token, vestNFTs)}
            </div>
            </Grid>
            {/*Claim All Button*/}
            <Grid  item lg='auto' md='auto' sm='12' xs='12'>
              <div className={classes.claimAllButton} style={{display:"grid", gridAutoFlow:"column", gap:"5px", alignItems:"center", border:"2px solid gray", padding:"2px", justifySelf:"flex-end", width:"fit-content",height:"fit-content", minHeight:"60px"}}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddCircleOutlineIcon />}
              className={classes.buttonOverride}
              // color='primary'
              onClick={onClaimAll}
              disabled={loading}
            >
              Claim All
            </Button>
            <div style={{height: "100%", width:"11px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
              </div>
            </Grid>
          </div>
          <div style={{border:"2px solid gray", padding:"20px", width:"100%", alignContent:"center", background:"black"}}>
          {/*final subtext*/}
          <Grid item lg={12} md='auto' sm={12} xs={12}>
                <Typography>
                Rewards displayed are an estimation of the trading fees and voting rewards that you can claim.<br/>
                For details refer to our <a href='https://docs.glacier.exchange/'>docs</a>.
                </Typography>
          </Grid>
          </div>
          
        </Grid>
      </div>
      {/*The rewards table*/}
      <RewardsTable rewards={rewards} vestNFTs={vestNFTs} tokenID={token?.id} />
      <Footer/>
    </div>
  );
}
