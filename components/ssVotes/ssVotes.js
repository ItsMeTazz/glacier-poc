import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Typography, Button, CircularProgress, InputAdornment, TextField, MenuItem, Select, Grid, FormControl, InputLabel } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import SearchIcon from '@material-ui/icons/Search';
import { useRouter } from "next/router";
import moment from 'moment';

import classes from './ssVotes.module.css';
import { formatCurrency } from '../../utils';

import GaugesTable from './ssVotesTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

import Footer from '../IconsFooter/footer';
export default function ssVotes() {

  const router = useRouter()

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [gauges, setGauges] = useState([])
  const [voteLoading, setVoteLoading] = useState(false)
  const [votes, setVotes] = useState([])
  const [veToken, setVeToken] = useState(null)
  const [token, setToken] = useState(null)
  const [vestNFTs, setVestNFTs] = useState([])
  const [search, setSearch] = useState('');
  //countdown
  const deadline = Date.UTC(2023,3,6,0,0,0,0)/1000;
  let timeLeft = deadline - Number((Date.now())/1000).toFixed(0)
  const [duration, setDuration] = useState(moment.duration(timeLeft,"seconds"))

  useEffect(() => {
    setInterval(() => {
      timeLeft = deadline - Number((Date.now())/1000).toFixed(0)
      setDuration(moment.duration(timeLeft,"seconds"))
    },1000)
  },[])
  
  


  const ssUpdated = () => {
    setVeToken(stores.stableSwapStore.getStore('veToken'))
    const as = stores.stableSwapStore.getStore('pairs');
    //console.log("gaugesAS", as)
    const filteredAssets = as.filter((asset) => {
      return asset.gauge && asset.gauge.address
    })
    setGauges(filteredAssets)


    const nfts = stores.stableSwapStore.getStore('vestNFTs');
    setVestNFTs(nfts)
    //console.log("nfts", nfts)

    if (nfts && nfts.length > 0) {
      setToken(nfts[0]);

    }

    if (nfts && nfts.length > 0 && filteredAssets && filteredAssets.length > 0) {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: nfts[0].id } })
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_BALANCES, content: { tokenID: nfts[0].id } })
    }

    forceUpdate()
  }

  useEffect(() => {
    const vestVotesReturned = (vals) => {
      setVotes(vals.map((asset) => {
        return {
          address: asset?.address,
          value: BigNumber((asset && asset.votePercent) ? asset.votePercent : 0).toNumber(0)
        }
      }))
      forceUpdate()
    }

    const vestBalancesReturned = (vals) => {
      setGauges(vals)
      forceUpdate()
    }

    const stableSwapUpdated = () => {
      ssUpdated()
    }

    const voteReturned = () => {
      setVoteLoading(false)
    }

    ssUpdated()

    // stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_NFTS, content: {} })

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    stores.emitter.on(ACTIONS.VOTE_RETURNED, voteReturned);
    stores.emitter.on(ACTIONS.ERROR, voteReturned);
    stores.emitter.on(ACTIONS.VEST_VOTES_RETURNED, vestVotesReturned)
    // stores.emitter.on(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
    stores.emitter.on(ACTIONS.VEST_BALANCES_RETURNED, vestBalancesReturned)

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
      stores.emitter.removeListener(ACTIONS.VOTE_RETURNED, voteReturned);
      stores.emitter.removeListener(ACTIONS.ERROR, voteReturned);
      stores.emitter.removeListener(ACTIONS.VEST_VOTES_RETURNED, vestVotesReturned)
      // stores.emitter.removeListener(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
      stores.emitter.removeListener(ACTIONS.VEST_BALANCES_RETURNED, vestBalancesReturned)
    };
  }, []);

  const onVote = () => {
    setVoteLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.VOTE, content: { votes, tokenID: token.id } })
  }

  let totalVotes = votes.reduce((acc, curr) => { return BigNumber(acc).plus(BigNumber(curr.value).lt(0) ? (curr.value * -1) : curr.value).toNumber() }, 0)
//let totalVotes = 100
  const handleChange = (event) => {
    setToken(event.target.value);
    stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: event.target.value.id } })
  }

  const onSearchChanged = (event) => {
    setSearch(event.target.value);
  };

  const onBribe = () => {
    router.push('/bribe/create')
  }

  const renderMediumInput = (value, options) => {
    return (
      // <div className={classes.textField}>
      //   <div className={classes.mediumInputContainer}>
      <Grid container>

        {/* <Grid item lg='auto' md='auto' sm={12} xs={12}>
              <Typography variant="body2" className={classes.smallText}>Please select your veNFT:</Typography>
            </Grid> */}

        {/* <div className={classes.mediumInputAmount}>
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
                      <MenuItem key={option.id} value={option}>
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
              </div> */}
        <FormControl fullWidth className={classes.buttonColor}>
          {/* <InputLabel id="demo-simple-select-label">Select your option</InputLabel> */}
          <Select
            // labelId="demo-simple-  -label"
            id="demo-simple-select"
            fullWidth
            value={value}
            onChange={handleChange}
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
        </FormControl>
      </Grid>
      //   </div>
      // </div>
    )
  }

  return (
    <div className={classes.container}>
      <div className={classes.topBarContainer}>
        <Grid container spacing={1}>
          <Grid item lg='auto' sm={12} xs={12}>
            
              {/* <Button
                variant="contained"
                color="secondary"
                className={classes.button}
                startIcon={<AddCircleOutlineIcon />}
                size='large'
               // className={ classes.buttonOverride }
                //color='primary'
                onClick={ onBribe }
              >
                <Typography className={ classes.actionButtonText }>{ `Create Bribe` }</Typography>
              </Button> */}
           
          </Grid>
          <Grid item container md={12} style={{width:"100%", border:"2px solid gray", background:"black", display:"grid", gridAutoFlow:"column", justifyItems:"space-between", alignItems:"center"}}>
            <Grid item md={5} className={classes.votes}>
                <Typography variant='h1' className="themesh1">Vote</Typography>
                <Typography className={classes.pooltext}>
                Earn a share of the fees on the pool you vote, you are allowed one vote per epoch. <a href='https://docs.glacier.exchange/' style={{textDecorationColor:"magenta"}}>Read More</a>
                </Typography>
            </Grid>
            <div>
              <div className={classes.countdown}>
                <h2 style={{color:"magenta"}}>Days : Hours : Mins</h2>
                <h1>{duration.days()} : {duration.hours()} : {duration.minutes()} </h1>
              </div>
            </div>
          </Grid>
        <Grid container spacing={1} style={{border:"2px solid gray", background:"black", margin:"10px auto",padding:"10px", alignItems:"end"}}>
        <Grid item lg={9} md={9} sm={12} xs={12}  >
            <TextField
              className={classes.searchContainer}
              // variant="outlined"
              fullWidth
              placeholder="AVAX, BTC.b, WETH.e, 0x..."
              value={search}
              onChange={onSearchChanged}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item lg={3} md={3} sm={12} xs={12}>
            <div className={classes.tokenIDContainer} >
              {renderMediumInput(token, vestNFTs)}
            </div>
          </Grid>
        </Grid>
        <Paper elevation={10} className={classes.actionButtons}>
        <Grid container spacing={2}>
          <Grid item xs={6} style={{alignSelf: "center", justifyItems:"start"}}>
            <div className={classes.infoSection}>
              <Typography>Voting Power Used: </Typography>
              <Typography className={`${BigNumber(totalVotes).gt(100) ? classes.errorText : classes.helpText}`}>{totalVotes} %</Typography>
            </div>
          </Grid>
          <Grid item xs={6} style={{alignSelf:"center", width:"100%"}}>
          <div className={classes.mobileButton} style={{display:"grid", gridAutoFlow:"column", gap:"5px", alignItems:"center", border:"2px solid gray", padding:"2px", width:"fit-content", justifySelf:"end", margin:"20px", marginLeft:"auto"}}>
            <Button
              className={classes.buttonOverrideFixed}
              variant='contained'
              color='black'
              disabled={voteLoading || BigNumber(totalVotes).eq(0) || BigNumber(totalVotes).gt(100)}
              onClick={onVote}
            >
              {voteLoading ? `Casting Votes` : `Cast Votes`}
              {voteLoading && <CircularProgress size={10} className={classes.loadingCircle} />}
            </Button>
            <div style={{height: "100%", width:"11px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
            </div>
          </Grid>
        </Grid>
            </Paper>
        </Grid>
      </div>
      <Paper elevation={0} className={classes.tableContainer}>
        <GaugesTable gauges={gauges.filter((pair) => {
          if (!search || search === '') {
            return true
          }

          const searchLower = search.toLowerCase()

          if (pair.symbol.toLowerCase().includes(searchLower) || pair.address.toLowerCase().includes(searchLower) ||
            pair.token0.symbol.toLowerCase().includes(searchLower) || pair.token0.address.toLowerCase().includes(searchLower) || pair.token0.name.toLowerCase().includes(searchLower) ||
            pair.token1.symbol.toLowerCase().includes(searchLower) || pair.token1.address.toLowerCase().includes(searchLower) || pair.token1.name.toLowerCase().includes(searchLower)) {
            return true
          }

          return false

        })} setParentSliderValues={setVotes} defaultVotes={votes} veToken={veToken} token={token} />
      </Paper>
      <Footer/>
    </div>

  );
}
