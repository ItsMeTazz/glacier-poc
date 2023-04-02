import Head from "next/head";
import classes from "./layout.module.css";
import Header from "../header";
import Navigation from "../navigation";
import SnackbarController from "../snackbar";
import Image from "next/image";

export default function Layout({ children, configure, backClicked, title }) {
  return (
    <div className={classes.container}>
      <div className={classes.backgroundImageContainer}>
        <Image src={"/images/bg2.svg"} alt="background" fill />
      </div>

      <Head>
        <link rel="icon" href="/favicon2.png" />
        <link
          rel="preload"
          href="/fonts/JetBrains/JetBrains.ttf"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/SpaceGrotesk/SpaceGrotesk.ttf"
          as="font"
          crossOrigin=""
        />
        <meta
          name="description"
          content="Glacier allows low cost, near 0 slippage trades on uncorrelated or tightly correlated assets built on Avalanche."
        />
        <meta name="og:title" content="Glacier" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className={classes.content}>
        {!configure && <Header backClicked={backClicked} title={title} />}
        <SnackbarController />
        <main>{children}</main>
      </div>
      <div className={classes.pinkgrid2} />
    </div>
  );
}
