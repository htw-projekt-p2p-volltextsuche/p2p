const express = require( "express" );
const router = express.Router();

router.route( "/:key" )
  .get( ( req, res, next ) => {
    res.json( { error: false } );
  } )
  .put( ( req, res, next ) => {
    res.json( { error: false } );
  } );

router.post( "/append/:key", ( req, res, next ) => {
  res.json( { error: false } );
} );

router.post( "/batch-get", ( req, res, next ) => {
  res.json( { error: false } );
} );

module.exports = router;
