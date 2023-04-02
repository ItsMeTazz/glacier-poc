import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Grid,Container } from '@material-ui/core';

import classes from './ssBribes.module.css';

import BribeCard from '../ssBribeCard';
import BribeCreate from '../ssBribeCreate';
import BribeTable from './ssBribesTable';


import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssBribes() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [pairs, setPairs] = useState([])
  const [pairsA, setPairsA] = useState([])
  useEffect(() => {
    console.log("heeeeloooo")
    const stableSwapUpdated = () => {
      const pairs = stores.stableSwapStore.getStore('pairs')
      setPairsA(pairs);
      const pairsWithBribes = pairs.filter((pair) => {
        return pair && pair.gauge != null && pair.gauge.address && pair.gauge.bribes && pair.gauge.bribes.length > 0
      })

      setPairs(pairsWithBribes)
      forceUpdate()
    }

    stableSwapUpdated()

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);
 
  return (
   <BribeCreate/>
  );
}
