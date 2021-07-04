const express = require( "express" );
require( "express-async-errors" );
const router = express.Router();

router.get( "/:key", async ( req, res, next ) => {
  const { key } = req.params;
  req.p2p.get( key )
    .then( buffValue => {
      const valueArray = JSON.parse( buffValue.toString() );
      res.json( { error: false, key, value: valueArray } );
    } )
    .catch( err => {
      next( err );
    } );
} );

router.put( "/append/:key", async ( req, res, next ) => {
  const { key } = req.params;
  const valueToAppend = req.body.data;

  if ( !valueToAppend )
    return next( new Error( "missing data" ) );

  req.p2p.get( key )
    .then( buffValue => {
      const valueArray = JSON.parse( buffValue.toString() );
      valueArray.push( valueToAppend );

      req.p2p.put( key, valueArray )
        .then( () => {
          res.json( { error: false, key } );
        } )
        .catch( next );
    } )
    .catch( err => {
      if ( err.message === "No records given" || err.message === "Not found" ) {
        // does not exist, simple put
        req.p2p.put( key, [ valueToAppend ] )
          .then( () => {
            res.json( { error: false, key } );
          } )
          .catch( next )
          .then( () => {
            req.p2p.incrementKeysetSize();
          } );
      } else {
        next( err );
      }
    } );
} );

router.put( "/merge/:key", async ( req, res, next ) => {
  const { key } = req.params;
  const valueToMerge = req.body.data;

  if ( !valueToMerge )
    return next( new Error( "missing data" ) );
  if ( !Array.isArray( valueToMerge ) )
    return next( new Error( "data is not an array" ) );

  req.p2p.get( key )
    .then( buffValue => {
      const valueArray = JSON.parse( buffValue.toString() );
      const mergedArray = [ ...valueArray, ...valueToMerge ];

      req.p2p.put( key, mergedArray )
        .then( () => {
          res.json( { error: false, key } );
        } )
        .catch( next );
    } )
    .catch( err => {
      if ( err.message === "No records given" || err.message === "Not found" ) {
        // does not exist, simple put
        req.p2p.put( key, valueToMerge )
          .then( () => {
            res.json( { error: false, key } );
          } )
          .catch( next )
          .then( () => {
            req.p2p.incrementKeysetSize();
          } );
      } else {
        next( err );
      }
    } );
} );

router.post( "/batch-get", async ( req, res, next ) => {
  const { keys } = req.body;

  if ( !keys )
    return next( new Error( "missing keys" ) );
  if ( !Array.isArray( keys ) )
    return next( new Error( "keys is not an array" ) );

  const keyPromises = keys.map( key => {
    const promise = req.p2p.get( key )
      .then( buff => JSON.parse( buff.toString() ) )
      .catch( err => err );

    // Object.setPrototypeOf( promise, { key } );
    return promise;
  } );
  const awaitedPromises = await Promise.allSettled( keyPromises );

  const keyValueObject = {};
  for ( const [ i, key ] of keys.entries() ) {
    const valuePromise = awaitedPromises[i];
    keyValueObject[key] = {
      error: !!valuePromise.value.code,
    };

    if ( valuePromise.value.code ) {
      keyValueObject[key].errorMsg =
        valuePromise.value.code === "ERR_NO_RECORDS_RECEIVED" ?
          "Not found" :
          valuePromise.value.code;
    } else {
      keyValueObject[key].value = valuePromise.value;
    }
  }

  res.json( { error: false, keys, values: keyValueObject } );
} );

module.exports = router;
