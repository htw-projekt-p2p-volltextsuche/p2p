const express = require( "express" );
const router = express.Router();

router.route( "/:key" )
  .get( async ( req, res, next ) => {
    const key = req.params.key;
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
        res.json( { error: false, key, value } );
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
          res.json( { error: false, key, value: valueArray } );
        } )
        .catch( next );
    } )
    .catch( err => {
      if ( err.message === "No records given" ) {
        // does not exist, simple put
        const putValue = [ valueToAppend ];
        console.log( "PUT:", putValue );

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

router.post( "/batch-get", ( req, res, next ) => {
  res.json( { error: false } );
} );

module.exports = router;
