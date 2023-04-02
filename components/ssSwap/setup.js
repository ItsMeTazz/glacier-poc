import React, { useState, useEffect } from 'react';
import {
  TextField,
  Typography,
  InputAdornment,
  Button,
  MenuItem,
  IconButton,
  Dialog,
  CircularProgress,
  Tooltip
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ToggleButton from '@material-ui/lab/ToggleButton';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import { withTheme } from '@material-ui/core/styles';
import { formatCurrency, formatAddress, formatCurrencyWithSymbol, formatCurrencySmall } from '../../utils'
import classes from './ssSwap.module.css'
import stores from '../../stores'
import {
  ACTIONS,
  ETHERSCAN_URL
} from '../../stores/constants'
import BigNumber from 'bignumber.js'

function Setup() {

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [ loading, setLoading ] = useState(false)
  const [ quoteLoading, setQuoteLoading ] = useState(false)
  const [ approvalLoading, setApprovalLoading ] = useState(false)

  const [ fromAmountValue, setFromAmountValue ] = useState('')
  const [ fromAmountError, setFromAmountError ] = useState(false)
  const [ fromAssetValue, setFromAssetValue ] = useState(null)
  const [ fromAssetError, setFromAssetError ] = useState(false)
  const [ fromAssetOptions, setFromAssetOptions ] = useState([])

  const [ toAmountValue, setToAmountValue ] = useState('')
  const [ toAmountError, setToAmountError ] = useState(false)
  const [ toAssetValue, setToAssetValue ] = useState(null)
  const [ toAssetError, setToAssetError ] = useState(false)
  const [ toAssetOptions, setToAssetOptions ] = useState([])

  const [ slippage, setSlippage ] = useState('2')
  const [ slippageError, setSlippageError ] = useState(false)

  const [ quoteError, setQuoteError ] = useState(null)
  const [ quote, setQuote ] = useState(null)
  const [ maxValue,setMaxValue ] = useState(null)
  const [ maxValueButton,setMaxValueButton ] = useState(false);
  const [ halfValue,setHalfValue ] = useState(null)
  const [ halfValueButton,setHalfValueButton ] = useState(false);
  const [ quarterValue,setQuarterValue ] = useState(null)
  const [ quarterValueButton,setQuarterValueButton ] = useState(false);
  const [ threeQuartersValue,setThreeQuartersValue ] = useState(null)
  const [ threeQuartersValueButton,setThreeQuartersValueButton ] = useState(false);


  useEffect(function() {
    const errorReturned = () => {
      setLoading(false)
      setApprovalLoading(false)
      setQuoteLoading(false)
    }
    

    const quoteReturned = (val) => {
      if(!val) {
        setQuoteLoading(false)
        setQuote(null)
        setToAmountValue('')
        setQuoteError('Insufficient liquidity or no route available to complete swap')
      }
      if(val && val.inputs && val.inputs.fromAmount === fromAmountValue && val.inputs.fromAsset.address === fromAssetValue.address && val.inputs.toAsset.address === toAssetValue.address) {
        setQuoteLoading(false)
        if(BigNumber(val.output.finalValue).eq(0)) {
          setQuote(null)
          setToAmountValue('')
          setQuoteError('Insufficient liquidity or no route available to complete swap')
          return
        }

        setToAmountValue(BigNumber(val.output.finalValue).toFixed(8))
        setQuote(val)
      }
    }

    const ssUpdated = () => {
      const baseAsset = stores.stableSwapStore.getStore('baseAssets')

      setToAssetOptions(baseAsset)
      setFromAssetOptions(baseAsset)

      if(baseAsset.length > 0 && toAssetValue == null) {
        setToAssetValue(baseAsset[10])
      }

      if(baseAsset.length > 0 && fromAssetValue == null) {
        setFromAssetValue(baseAsset[0])
      }

      forceUpdate()
    }

    const assetsUpdated = () => {
      const baseAsset = stores.stableSwapStore.getStore('baseAssets')

      setToAssetOptions(baseAsset)
      setFromAssetOptions(baseAsset)
    }

    const swapReturned = (event) => {
      setLoading(false)
      setFromAmountValue('')
      setToAmountValue('')
      calculateReceiveAmount(0, fromAssetValue, toAssetValue)
      setQuote(null)
      setQuoteLoading(false)
    }


    stores.emitter.on(ACTIONS.ERROR, errorReturned)
    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.SWAP_RETURNED, swapReturned)
    stores.emitter.on(ACTIONS.QUOTE_SWAP_RETURNED, quoteReturned)
    stores.emitter.on(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.SWAP_RETURNED, swapReturned)
      stores.emitter.removeListener(ACTIONS.QUOTE_SWAP_RETURNED, quoteReturned)
      stores.emitter.removeListener(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated)
    }
  },[fromAmountValue, fromAssetValue, toAssetValue]);

  const onAssetSelect = (type, value) => {
    console.log({fromAmountValue,fromAssetValue,toAssetValue})
    if(type === 'From') {

      if(value.address === toAssetValue.address) {
        setToAssetValue(fromAssetValue)
        setFromAssetValue(toAssetValue)
        calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue)
      } else {
        setFromAssetValue(value)
        calculateReceiveAmount(fromAmountValue, value, toAssetValue)//shak
      }


    } else {
      if(value.address === fromAssetValue.address) {
        setFromAssetError(toAssetValue)
        setToAssetValue(fromAssetValue)
        calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue)
      } else {
        setToAssetValue(value)
        calculateReceiveAmount(fromAmountValue, fromAssetValue, value)
      }
    }

    forceUpdate()
  }

  const fromAmountChanged = (event) => {
    setMaxValueButton(false);
    setHalfValueButton(false);
    setQuarterValueButton(false);
    setThreeQuartersValueButton(false);
    setFromAmountError(false);
    setFromAmountValue(event.target.value);
    if (event.target.value == "") {
      setToAmountValue("");
      setQuote(null);
    } else if (event.target.value <= 0) {
      return;
    } else {
      calculateReceiveAmount(event.target.value, fromAssetValue, toAssetValue);
    }
  };
  
  const setMax = (e, value) => {
    e.preventDefault();
    value = parseFloat(value);
    setMaxValue(value);
    setMaxValueButton(true);
    setHalfValueButton(false);
    setQuarterValueButton(false);
    setThreeQuartersValueButton(false);
    setFromAmountError(false);
    setFromAmountValue(value);
    if (value == "") {
      setToAmountValue("");
      setQuote(null);
    } else {
      calculateReceiveAmount(value, fromAssetValue, toAssetValue);
    }
  };
  
  const setHalf = (e, value) => {
    e.preventDefault();
    value = parseFloat(value / 2);
    setHalfValue(value);
    setHalfValueButton(true);
    setMaxValueButton(false);
    setQuarterValueButton(false);
    setThreeQuartersValueButton(false);
    setFromAmountError(false);
    setFromAmountValue(value);
    if (value == "") {
      setToAmountValue("");
      setQuote(null);
    } else {
      calculateReceiveAmount(value, fromAssetValue, toAssetValue);
    }
  };
  
  const setQuarter = (e, value) => {
    e.preventDefault();
    value = parseFloat(value / 4);
    setQuarterValue(value);
    setQuarterValueButton(true);
    setMaxValueButton(false);
    setHalfValueButton(false);
    setThreeQuartersValueButton(false);
    setFromAmountError(false);
    setFromAmountValue(value);
    if (value == "") {
      setToAmountValue("");
      setQuote(null);
    } else {
      calculateReceiveAmount(value, fromAssetValue, toAssetValue);
    }
  };
  
  const setThreeQuarters = (e, value) => {
    e.preventDefault();
    value = parseFloat(value * 0.75);
    setThreeQuartersValue(value);
    setThreeQuartersValueButton(true);
    setMaxValueButton(false);
    setHalfValueButton(false);
    setQuarterValueButton(false);
    setFromAmountError(false);
    setFromAmountValue(value);
    if (value == "") {
      setToAmountValue("");
      setQuote(null);
    } else {
      calculateReceiveAmount(value, fromAssetValue, toAssetValue);
    }
  };
  

  const toAmountChanged = (event) => {
  }

  const onSlippageChanged = (event) => {
    if(event.target.value == '' || !isNaN(event.target.value)) {
      setSlippage(event.target.value)
    }
  }

  const calculateReceiveAmount = (amount, from, to) => {
    if(amount !== '' && !isNaN(amount) && to != null) {

      setQuoteLoading(true)
      setQuoteError(false)

      stores.dispatcher.dispatch({ type: ACTIONS.QUOTE_SWAP, content: {
        fromAsset: from,
        toAsset: to,
        fromAmount: amount,
      } })
    }
  }

  const onSwap = () => {
    setFromAmountError(false)
    setFromAssetError(false)  
    setToAssetError(false)

    let error = false

    if(!fromAmountValue || fromAmountValue === '' || isNaN(fromAmountValue)) {
      setFromAmountError('From amount is required')
      error = true
    } else {
      if(!fromAssetValue.balance || isNaN(fromAssetValue.balance) || BigNumber(fromAssetValue.balance).lte(0))  {
        setFromAmountError('Invalid balance')
        error = true
      } else if(BigNumber(fromAmountValue).lt(0)) {
        setFromAmountError('Invalid amount')
        error = true
      } else if (fromAssetValue && BigNumber(fromAmountValue).gt(fromAssetValue.balance)) {
        setFromAmountError(`Greater than your available balance`)
        error = true
      }
    }

    if(!fromAssetValue || fromAssetValue === null) {
      setFromAssetError('From asset is required')
      error = true
    }

    if(!toAssetValue || toAssetValue === null) {
      setFromAssetError('To asset is required')
      error = true
    }

    if(!error) {
      setLoading(true)

      stores.dispatcher.dispatch({ type: ACTIONS.SWAP, content: {
        fromAsset: fromAssetValue,
        toAsset: toAssetValue,
        fromAmount: fromAmountValue,
        toAmount: toAmountValue,
        quote: quote,
        slippage: slippage
      } })
    }
  }

  const setBalance100 = () => {
    setFromAmountValue(fromAssetValue.balance)
    calculateReceiveAmount(fromAssetValue.balance, fromAssetValue, toAssetValue)
  }

  const swapAssets = () => {
    const fa = fromAssetValue
    const ta = toAssetValue
    setFromAssetValue(ta)
    setToAssetValue(fa)
    calculateReceiveAmount(fromAmountValue, ta, fa)
  }

  const renderSwapInformation = () => {

    if(quoteError) {
      return (
        <div className={ classes.quoteLoader }>
          <Typography className={ classes.quoteError }>{ quoteError }</Typography>
        </div>
      )
    }

    if(quoteLoading) {
      return (
        <div className={ classes.quoteLoader }>
          <CircularProgress size={20} className={ classes.loadingCircle } />
        </div>
      )
    }

    if(!quote) {
      return
        <div className={ classes.quoteLoader }> </div>
    }

    return (
      <div className={ classes.depositInfoContainer }>

        <Typography className={ classes.depositInfoHeading } >Price Info</Typography>
        <div className={ classes.priceInfos}>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >{ formatCurrency(BigNumber(quote.inputs.fromAmount).div(quote.output.finalValue).toFixed(18)) }</Typography>
            <Typography className={ classes.text } >{ `${fromAssetValue?.symbol} per ${toAssetValue?.symbol}` }</Typography>
          </div>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } > { formatCurrency(BigNumber(quote.output.finalValue).div(quote.inputs.fromAmount).toFixed(18)) } </Typography>
            <Typography className={ classes.text } >{ `${toAssetValue?.symbol} per ${fromAssetValue?.symbol}` }</Typography>
          </div>
          <div className={ classes.priceInfo }>
            { renderSmallInputSlippage('slippage', slippage, slippageError, onSlippageChanged) }
          </div>
        </div>
        <Typography className={ classes.depositInfoHeading } >Route</Typography>
        <div className={ classes.route }>
          <img
            className={ classes.displayAssetIconSmall }
            alt=""
            src={ fromAssetValue ? `${fromAssetValue.logoURI}` : '' }
            height='40px'
            onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
          />
          <div className={ classes.line }>
            <div className={classes.routeArrow} style={{background:"none"}}>
              <img src='../images/arrow.png' alt="arrow" style={{width:"30px", justifySelf:"center", alignSelf:"center"}}/>
            </div>
            <div className={ classes.stabIndicatorContainer }>
              <Typography className={ classes.stabIndicator }>{ quote.output.routes[0].stable ? 'Stable' : 'Volatile' }</Typography>
            </div>
          </div>
          { quote && quote.output && quote.output.routeAsset &&
            <>
              <img
                className={ classes.displayAssetIconSmall }
                alt=""
                src={ quote.output.routeAsset ? `${quote.output.routeAsset.logoURI}` : '' }
                height='40px'
                onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
              />
              <div className={ classes.line }>
                <div className={classes.routeArrow}>
                  <ArrowForwardIosIcon className={classes.routeArrowIcon} />
                </div>
                <div className={ classes.stabIndicatorContainer }>
                  <Typography className={ classes.stabIndicator }>{ quote.output.routes[1].stable ? 'Stable' : 'Volatile' }</Typography>
                </div>
              </div>
            </>
          }
          <img
            className={ classes.displayAssetIconSmall }
            alt=""
            src={ toAssetValue ? `${toAssetValue.logoURI}` : '' }
            height='40px'
            onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
          />
        </div>
        {
          BigNumber(quote.priceImpact).gt(0.5) &&
            <div className={ classes.warningContainer }>
              <Typography className={ BigNumber(quote.priceImpact).gt(5) ? classes.warningError : classes.warningWarning } align='center'>Price impact { formatCurrency(quote.priceImpact) }%</Typography>
            </div>
        }
      </div>
    )
  }

  const renderSmallInput = (type, amountValue, amountError, amountChanged) => {
    return (
      <div className={classes.textField}>
        <div className={ classes.inputTitleContainerSlippage }>
          <div className={ classes.inputBalanceSlippage }>
            <Typography className={ classes.inputBalanceText } noWrap > Slippage </Typography>
          </div>
        </div>
        <div className={ classes.smallInputContainer}>
          <TextField
            placeholder='0.00'
            fullWidth
            error={ amountError }
            helperText={ amountError }
            value={ amountValue }
            onChange={ amountChanged }
            disabled={ loading }
            InputProps={{
              className: classes.smallInput,
              endAdornment: <InputAdornment position="end">
                %
              </InputAdornment>,
            }}
          />
        </div>
      </div>
    )
  }
 
  const renderSmallInputSlippage = (type, amountValue, amountError, amountChanged) => {
    return (
      <div className={classes.textField} style={{background:"black", border:"2px solid gray", borderRadius: 0, padding:"5px"}}>
        <div className={ classes.inputTitleContainerSlippage } style={{background:"none"}}>
          <div className={ classes.inputBalanceSlippage }>
            <Typography className={ classes.inputBalanceText } noWrap > Slippage </Typography>
          </div>
        </div>
        <div className={ classes.smallInputContainer} style={{background:"black"}}>
          <TextField
            placeholder='0.00'
            fullWidth
            error={ amountError }
            helperText={ amountError }
            value={ amountValue }
            onChange={ amountChanged }
            disabled={ loading }
            InputProps={{
              className: classes.smallInput,
              endAdornment: <InputAdornment position="end">
                %
              </InputAdornment>,
            }}
          />
        </div>
      </div>
    )
  }


  const renderMassiveInput = (type, amountValue, amountError, amountChanged, assetValue, assetError, assetOptions, onAssetSelect) => {

    return (
      <div className={classes.textField}>
        <div className={classes.maxContainer}>
          {(type=='From')?<button onClick={(e) =>setMax(e,assetValue.balance)} className={classes.maxbtn}>100%</button>:''}
          {(type=='From')?<button onClick={(e) =>setThreeQuarters(e,assetValue.balance)} className={classes.maxbtn}>75%</button>:''}
          {(type=='From')?<button onClick={(e) =>setHalf(e,assetValue.balance)} className={classes.maxbtn}>50%</button>:''}
          {(type=='From')?<button onClick={(e) =>setQuarter(e,assetValue.balance)} className={classes.maxbtn}>25%</button>:''}
        </div>
        <div className={ classes.inputTitleContainer }>
          <div className={ classes.inputBalance }>
            <Typography className={ classes.inputBalanceText } noWrap onClick={ () => {
              if(type === 'From') {
                setBalance100()
              }
            }}>
              Balance: 
              { (assetValue && assetValue.balance) ?
                ' ' +   formatCurrency(assetValue.balance) :
                ''
              }
            </Typography>
          </div>
        </div>
        <div className={ `${classes.massiveInputContainer} ${ (amountError || assetError) && classes.error }` }>
          <div className={ classes.massiveInputAssetSelect }>
            <AssetSelect type={type} value={ assetValue } assetOptions={ assetOptions } onSelect={ onAssetSelect } />
          </div>
          <div className={ classes.massiveInputAmount }>
            <TextField
              placeholder='0.00'
              fullWidth
              error={ amountError }
              helperText={ amountError }
              value={type == "From"
              ? maxValueButton
                ? maxValue
                : halfValueButton
                ? halfValue
                : quarterValueButton
                ? quarterValue
                : threeQuartersValueButton
                ? threeQuartersValue
                : amountValue
              : amountValue
          }
              onChange={amountChanged }
              disabled={ loading || type === 'To' }
              InputProps={{
                className: classes.largeInput
              }}
            />

            <Typography color='textSecondary' className={ classes.smallerText }>{ assetValue?.symbol }</Typography>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={ classes.swapInputs }>
      { renderMassiveInput('From', fromAmountValue, fromAmountError, fromAmountChanged, fromAssetValue, fromAssetError, fromAssetOptions, onAssetSelect) }
      <div className={ classes.swapIconContainer }>
        <div className={ classes.swapIconSubContainer }>
          <SwapVertIcon className={ classes.swapIcon } onClick={ swapAssets }/>
        </div>
      </div>
      { renderMassiveInput('To', toAmountValue, toAmountError, toAmountChanged, toAssetValue, toAssetError, toAssetOptions, onAssetSelect) }
      { renderSwapInformation() }
      <div className={ classes.actionsContainer}>
        <Button
          variant='contained'
          size='large'
          className={classes.buttonOverride}
          disabled={ loading || quoteLoading }
          onClick={ onSwap }
          >
          { loading ? `SWAPPING` : `SWAP` }
          { loading && <CircularProgress size={10} className={ classes.loadingCircle } /> }  
        </Button>
        <div style={{height: "50px", width:"11px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
        <div style={{height: "50px", width:"8px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
        <div style={{height: "50px", width:"5px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
      </div>
    </div>
  )
}

function AssetSelect({ type, value, assetOptions, onSelect }) {

  const [ open, setOpen ] = useState(false);
  const [ search, setSearch ] = useState('')
  const [ filteredAssetOptions, setFilteredAssetOptions ] = useState([])

  const [ manageLocal, setManageLocal ] = useState(false)

  const openSearch = () => {
    setSearch('')
    setOpen(true)
  };

  useEffect(async function() {

    let ao = assetOptions.filter((asset) => {
      if(search && search !== '') {
        return asset.address.toLowerCase().includes(search.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
          asset.name.toLowerCase().includes(search.toLowerCase())
      } else {
        return true
      }
    })

    setFilteredAssetOptions(ao)

    //no options in our default list and its an address we search for the address
    if(ao.length === 0 && search && search.length === 42) {
      const baseAsset = await stores.stableSwapStore.getBaseAsset(event.target.value, true, true)
    }

    return () => {
    }
  }, [assetOptions, search]);


  const onSearchChanged = async (event) => {
    setSearch(event.target.value)
  }

  const onLocalSelect = (type, asset) => {
    console.log(asset)
    setSearch('')
    setManageLocal(false)
    setOpen(false)
    onSelect(type, asset)
  }

  const onClose = () => {
    setManageLocal(false)
    setSearch('')
    setOpen(false)
  }

  const toggleLocal = () => {
    setManageLocal(!manageLocal)
  }

  const deleteOption = (token) => {
    stores.stableSwapStore.removeBaseAsset(token)
  }

  const viewOption = (token) => {
    window.open(`${ETHERSCAN_URL}token/${token.address}`, '_blank')
  }

  const renderManageOption = (type, asset, idx) => {
    return (
      <MenuItem val={ asset.address } key={ asset.address+'_'+idx } className={ classes.assetSelectMenu } >
        <div className={ classes.assetSelectMenuItem }>
          <div className={ classes.displayDualIconContainerSmall }>
            <img
              className={ classes.displayAssetIconSmall }
              alt=""
              src={ asset ? `${asset.logoURI}` : '' }
              height='60px'
              onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
            />
          </div>
        </div>
        <div className={ classes.assetSelectIconName }>
          <Typography variant='h5'>{ asset ? asset.symbol : '' }</Typography>
          <Typography variant='subtitle1' color='textSecondary'>{ asset ? asset.name : '' }</Typography>
        </div>
        <div className={ classes.assetSelectActions}>
          <IconButton onClick={ () => { deleteOption(asset) } }>
            <DeleteOutlineIcon />
          </IconButton>
          <IconButton onClick={ () => { viewOption(asset) } }>
            ↗
          </IconButton>
        </div>
      </MenuItem>
    )
  }

  const renderAssetOption = (type, asset, idx) => {
    return (
      <MenuItem val={ asset.address } key={ asset.address+'_'+idx } className={ classes.assetSelectMenu } onClick={ () => { onLocalSelect(type, asset) } }>
        <div className={ classes.assetSelectMenuItem }>
          <div className={ classes.displayDualIconContainerSmall }>
            <img
              className={ classes.displayAssetIconSmall }
              alt=""
              src={ asset ? `${asset.logoURI}` : '' }
              height='60px'
              onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
            />
          </div>
        </div>
        <div className={ classes.assetSelectIconName }>
          <Typography variant='h5'>{ asset ? asset.symbol : '' }</Typography>
          <Typography variant='subtitle1' color='textSecondary'>{ asset ? asset.name : '' }</Typography>
        </div>
        <div className={ classes.assetSelectBalance}>
          <Typography variant='h5'>{ (asset && asset.balance) ? formatCurrency(asset.balance) : '0.00' }</Typography>
          <Typography variant='subtitle1' color='textSecondary'>{ 'Balance' }</Typography>
        </div>
      </MenuItem>
    )
  }

  const renderManageLocal = () => {
    return (
      <>
        <div className={ classes.searchContainer }>
          <div className={ classes.searchInline }>
            <TextField
              autoFocus
              variant="outlined"
              fullWidth
              placeholder="AVAX, BTC.b, WETH.e, 0x..."
              value={ search }
              onChange={ onSearchChanged }
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>,
              }}
            />
          </div>
          <div className={ classes.assetSearchResults }>
            {
              filteredAssetOptions ? filteredAssetOptions.filter((option) => {
                return option.local === true
              }).map((asset, idx) => {
                return renderManageOption(type, asset, idx)
              }) : []
            }
          </div>
        </div>
        <div className={ classes.manageLocalContainer }>
          <Button
            onClick={ toggleLocal }
            >
            Back to Assets
          </Button>
        </div>
      </>
    )
  }

  const renderOptions = () => {
    return (
      <>
        <div className={ classes.searchContainer }>
          <div className={ classes.searchInline }>
            <TextField
              autoFocus
              variant="outlined"
              fullWidth
              placeholder="AVAX, BTC.b, WETH.e, 0x..."
              value={ search }
              onChange={ onSearchChanged }
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>,
              }}
            />
          </div>
          <div className={ classes.assetSearchResults }>
            {
              filteredAssetOptions ? filteredAssetOptions.sort((a, b) => {
                if(BigNumber(a.balance).lt(b.balance)) return 1;
                if(BigNumber(a.balance).gt(b.balance)) return -1;
                if(a.symbol.toLowerCase()<b.symbol.toLowerCase()) return -1;
                if(a.symbol.toLowerCase()>b.symbol.toLowerCase()) return 1;
                return 0;
              }).map((asset, idx) => {
                return renderAssetOption(type, asset, idx)
              }) : []
            }
          </div>
        </div>
        <div className={ classes.manageLocalContainer }>
          <Button
            onClick={ toggleLocal }
            >
            Manage Local Assets
          </Button>
        </div>
      </>
    )
  }

  return (
    <React.Fragment>
      <div className={ classes.displaySelectContainer } onClick={ () => { openSearch() } }>
        <div className={ classes.assetSelectMenuItem }>
          <div className={ classes.displayDualIconContainer }>
            <img
              className={ classes.displayAssetIcon }
              alt=""
              src={ value ? `${value.logoURI}` : '' }
              height='100px'
              onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
            />
          </div>
        </div>
      </div>
      <Dialog onClose={ onClose } aria-labelledby="simple-dialog-title" open={ open }>
        { !manageLocal && renderOptions() }
        { manageLocal && renderManageLocal() }
      </Dialog>
    </React.Fragment>
  )
}

export default withTheme(Setup)
