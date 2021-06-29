const express = require( "express" );
const router = express.Router();

router.route( "/:key" )
  .get( async ( req, res, next ) => {
    const { key } = req.params;
    req.p2p.get( key )
      .then( buffValue => {
        const valueArray = JSON.parse( buffValue.toString() );
        res.json( { error: false, key, value: valueArray } );
      } )
      .catch( err => {
        next( err );
      } );
  } )
  .put( async ( req, res, next ) => {
    const { key } = req.params;
    let value = req.body.data;

    if ( !value )
      return next( new Error( "missing data" ) );

    value = [ value ];

    req.p2p.put( key, value )
      .then( () => {
        res.json( { error: false, key } );
      } )
      .catch( err => {
        next( err );
      } );
  } );

router.post( "/append/:key", ( req, res, next ) => {
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
        const putValue = [ valueToAppend ];

        req.p2p.put( key, putValue )
          .then( () => {
            res.json( { error: false, key, value: putValue } );
          } )
          .catch( next );
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
