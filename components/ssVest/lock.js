import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Button, TextField, InputAdornment, CircularProgress, RadioGroup, Radio, FormControlLabel, Tooltip, IconButton } from '@material-ui/core';
import { useRouter } from 'next/router';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { formatCurrency } from '../../utils';
import classes from "./ssVest.module.css";
import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import VestingInfo from "./vestingInfo"

export default function ssLock({ govToken, veToken }) {

  const inputEl = useRef(null);
  const router = useRouter();

  const [ lockLoading, setLockLoading ] = useState(false)

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('week');
  const [selectedDate, setSelectedDate] = useState(moment().add(45.5, 'days').format('YYYY-MM-DD'));
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [correctSeconds,setCorrectSeconds] = useState()

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false)
      router.push('/vest')
    }
    const errorReturned = () => {
      setLockLoading(false)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    };
  }, []);

  const setAmountPercent = (percent) => {
    setAmount(BigNumber(govToken.balance).times(percent).div(100).toFixed(govToken.decimals));
  }

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedValue(null);
  }

  const handleChange = (event) => {
    setSelectedValue(event.target.value);

    let days = 0;
    switch (event.target.value) {
      case 'week':
        days = 14;//7;
        break;
      case 'month':
        days = 28;//30;
        break;
      case 'year':
        days = 56;//365;
        break;
      case 'years':
        days = 84;//1460;
        break;
      default:
    }
    const newDate = moment().add(days, 'days').format('YYYY-MM-DD');
     setCorrectSeconds(days*24*60*60)
    setSelectedDate(newDate);
  }

  const onLock = () => {
    setAmountError(false)

    let error = false

    if(!amount || amount === '' || isNaN(amount)) {
      setAmountError('Amount is required')
      error = true
    } else {
      if(!govToken.balance || isNaN(govToken.balance) || BigNumber(govToken.balance).lte(0))  {
        setAmountError('Invalid balance')
        error = true
      } else if(BigNumber(amount).lte(0)) {
        setAmountError('Invalid amount')
        error = true
      } else if (govToken && BigNumber(amount).gt(govToken.balance)) {
        setAmountError(`Greater than your available balance`)
        error = true
      }
    }

    if(!error) {
      setLockLoading(true)
      const now = moment()
      const expiry = moment(selectedDate).add(1, 'days')

      const secondsToExpire = expiry.diff(now, 'seconds')

       const newDate = correctSeconds
     console.log(secondsToExpire,"the date",selectedDate)
      stores.dispatcher.dispatch({ type: ACTIONS.CREATE_VEST, content: { amount, unlockTime: secondsToExpire } })
    }
  }

  const focus = () => {
    inputEl.current.focus();
  }




  const onAmountChanged = (event) => {
    
    setAmountError(false)
    setAmount(event.target.value)
  }

  const renderMassiveDateInput = (type, amountValue, amountError, amountChanged, balance, logo) => {
    return (
      <div className={ classes.textField}>
        <div className={ `${classes.massiveInputContainer} ${ (amountError) && classes.error }` }>
          <div className={ classes.massiveInputAssetSelect }>
            <div className={ classes.displaySelectContainer }>
              <div className={ classes.assetSelectMenuItem }>
                <div className={ classes.displayDualIconContainer }>
                  <div className={ classes.displayAssetIcon } onClick={ focus }>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={ classes.massiveInputAmount }>
            <TextField
              inputRef={inputEl}
              id='someDate'
              type="date"
              placeholder='Expiry Date'
              fullWidth
              error={ amountError }
              helperText={ amountError }
              value={ amountValue }
              onChange={ amountChanged }
              disabled={ lockLoading }
              className={classes.inputFields}
              inputProps={{
                // min: moment().add(7, 'days').format('YYYY-MM-DD'),
                // max: moment().add(1460, 'days').format('YYYY-MM-DD')
                min: moment().add(14, 'days').format('YYYY-MM-DD'),
                max: moment().add(90, 'days').format('YYYY-MM-DD')
              }}
              InputProps={{
                shrink: true
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderMassiveInput = (type, amountValue, amountError, amountChanged, token) => {
    return (
      <div className={ classes.textField}>
        <div className={ classes.inputTitleContainer }>
          <div className={ classes.inputBalance }>
            <Typography className={ classes.inputBalanceText } noWrap onClick={ () => {
              setAmountPercent(100)
            }}>
              Balance: { (token && token.balance) ? ' ' + formatCurrency(token.balance) : '' }
            </Typography>
          </div>
        </div>
        <div className={ `${classes.massiveInputContainer} ${ (amountError) && classes.error }` }>
          <div className={ classes.massiveInputAssetSelect }>
            <div className={ classes.displaySelectContainer }>
              <div className={ classes.assetSelectMenuItem }>
                <div className={ classes.displayDualIconContainer }>
                  {
                    token && token.logoURI &&
                    <img
                      className={ classes.displayAssetIcon }
                      alt=""
                      src={ token.logoURI }
                      height='100px'
                      onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                    />
                  }
                  {
                    !(token && token.logoURI) &&
                    <img
                      className={ classes.displayAssetIcon }
                      alt=""
                      src={ '/tokens/unknown-logo.png' }
                      height='100px'
                      onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                    />
                  }
                </div>
              </div>
            </div>
          </div>
          <div className={ classes.massiveInputAmount }>
            <TextField 
              placeholder='0.00'
              fullWidth
              error={ amountError }
              helperText={ amountError }
              value={ amountValue }
              onChange={ amountChanged }
              maxLength={10}
              disabled={ lockLoading }
              className={classes.inputFields}
              InputProps={{
                className: classes.largeInput
              }}  
            />
            <Typography color='textSecondary' className={ classes.smallerText }>{ token?.symbol }</Typography>
          </div>
        </div>
      </div>
    )
  }

  const renderVestInformation = () => {
    const now = moment()
    const expiry = moment(selectedDate)
    const dayToExpire = expiry.diff(now, 'days')

    const tmpNFT = {
      lockAmount: amount,
      lockValue: BigNumber(amount).times(parseInt(dayToExpire)+1).div(90).toFixed(18),
      lockEnds: expiry.unix()
    }

    return (<VestingInfo futureNFT={tmpNFT} govToken={govToken} veToken={veToken} showVestingStructure={ true } />)
  }

  const onBack = () => {
    router.push('/vest')
  }

  return (
      <Paper elevation={0} className={ classes.container3 }>
      <Tooltip title="Back to Vest" placement="top">
          <IconButton color='magenta' className={classes.backButton } onClick={ onBack }>
            <ArrowBackIcon color='magenta' className={ classes.backIcon } />
          </IconButton>
          </Tooltip>
        <div className={ classes.titleSection }>
          <Typography className={ classes.titleText }>Create New Lock</Typography>
        </div>
        { renderMassiveInput('amount', amount, amountError, onAmountChanged, govToken) }
        <div>
          { renderMassiveDateInput('date', selectedDate, selectedDateError, handleDateChange, govToken?.balance, govToken?.logoURI) }
          <div className={ classes.inline }>
            <Typography className={ classes.expiresIn }>Expires: </Typography>
            <RadioGroup className={classes.vestPeriodToggle} row onChange={handleChange} value={selectedValue}>
              <FormControlLabel className={ classes.vestPeriodLabel } value="week" control={<Radio color="primary" />} label="2 weeks" labelPlacement="left" />
              <FormControlLabel className={ classes.vestPeriodLabel } value="month" control={<Radio color="primary" />} label="4 weeks" labelPlacement="left" />
              <FormControlLabel className={ classes.vestPeriodLabel } value="year" control={<Radio color="primary" />} label="8 weeks" labelPlacement="left" />
              <FormControlLabel className={ classes.vestPeriodLabel } value="years" control={<Radio color="primary" />} label="12 weeks" labelPlacement="left" />
            </RadioGroup>
          </div>
        </div>
        { renderVestInformation() }
        <div className={ classes.actionsContainer }>
        <div style={{display:"grid", gridAutoFlow:"column", gap:"5px", alignItems:"center", border:"2px solid gray", padding:"2px", width:"fit-content", justifySelf:"center", margin:"auto"}}>
          
          <Button
            className={classes.buttonOverride}
            fullWidth
            variant='contained'
            size='large'
            color='black'
            disabled={ lockLoading }
            onClick={ onLock }
            >
            { lockLoading ? `Locking` : `Lock` }
            { lockLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
          </Button>
          <div style={{height: "50px", width:"11px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
        <div style={{height: "50px", width:"8px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
        <div style={{height: "50px", width:"5px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
      </div>
        </div>
      </Paper>
  );
}
