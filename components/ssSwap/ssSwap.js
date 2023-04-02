import { Paper, Grid, Typography, Container, Box} from '@material-ui/core';
import Setup from './setup'
import classes from './ssSwap.module.css'
import Footer from '../IconsFooter/footer';

function Swap() {
  return (
    <div className={classes.newSwapContainer}>
      <Container className={classes.bigContainer} style={{display:"grid", gridAutoFlow:"column", width:"100%", height:"fit-content", alignContent:"end"}} >
          {/*image*/}
          <div className={classes.swapImg}>
              <img src='../images/glacierhero1.png'/>
          </div>
          {/*right side*/}
        <Grid container className={classes.swapModal} style={{marginTop:"-75px"}}>
          <Grid container item>
            {/*title and text*/}
            <Grid item md={6}>
              <div className={classes.swaptxt}>
                {/*<img src='../images/swap.png' alt="swap" className={classes.swapImage}/>*/}
                <Typography variant='h1'>Swap</Typography>
                <Typography> Use Glacier's low slippage engine with deep liquidity to trade</Typography>
              </div>
            </Grid>
          </Grid>
          <Grid item md={6}>
            {/*swap section*/}
            <div className={classes.stripeContainer}>
            <Paper elevation={0} className={classes.swapContainer}>
              <Setup />
            </Paper>
            <div style={{height: "100%", width:"11px", background:"linear-gradient(0deg, cyan, blue, purple,magenta, red)"}}></div>
            </div>
            <Footer/>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default Swap
