const express = require( "express" );
const router = express.Router();

router.route( "/:key" )
  .get( async ( req, res, next ) => {
    const key = Buffer.from( req.params.key, "utf-8" );
    req.node.contentRouting.get( key )
      .then( value => {
        let valArray;
        if ( value ) {
          try {
            valArray = JSON.parse( value.toString() );
            res.status( 200 ).json( { error: false, value: valArray } );
          } catch ( err ) {
            next( err );
          }
        } else {
          const err = new Error( "no result for the given key" );
          err.status = 404;
          next( err );
        }
      } )
      .catch( err => {
        next( err );
      } );
  } )
  .put( async ( req, res, next ) => {
    const key = Buffer.from( req.params.key, "utf-8" );

    if ( !req.body.data )
      return next( new Error( "missing data" ) );

    try {
      var value = Buffer.from( JSON.stringify( req.body.data ), "utf-8" );
    } catch ( err ) {
      return next( err );
    }

    req.node.contentRouting.put( key, value )
      .then( () => {
        res.json( { error: false } );
      } )
      .catch( err => {
        next( err );
      } );
  } );

router.post( "/append/:key", ( req, res, next ) => {
  res.json( { error: false } );
} );

router.post( "/batch-get", ( req, res, next ) => {
  res.json( { error: false } );
} );

module.exports = router;
