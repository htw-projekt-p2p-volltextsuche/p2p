const express = require( "express" );
const bodyParser = require( "body-parser" );
const logger = require( "./logs/logger" );
const P2P = require( "./p2p" );
const parseEnv = require( "./lib/parseEnv" );

require( "dotenv" ).config( { path: "variables.env" } );
const env = parseEnv( process.env );

( async () => { // async wrapper to be able to use await
  const app = express();
  app.use( logger.dev );
  app.use( bodyParser.json( { limit: env.HTTP_LIMIT }) );
  app.use( bodyParser.urlencoded( { extended: true } ) );

  const p2p = new P2P();
  await p2p.create( env );
  app.use( ( req, res, next ) => {
    req.p2p = p2p;
    next();
  } );

  app.use( "/", require( "./routes" ) );

  // 404
  app.use( ( req, res, next ) => {
    const err = new Error( "Not Found" );
    err.status = 404;
    next( err );
  } );

  // error handler
  app.use( ( err, req, res, next ) => {
    if ( err.message === "No records given" || err.message === "Not found" ) {
      err.message = "Not found";
      err.status = 404;
    }

    const data = {
      error   : true,
      errorMsg: err.message,
    };
    res.status( err.status || 500 );
    res.json( data );
  } );

  app.listen( env.HTTP_PORT, () => {
    console.log( `Server running on http://localhost:${env.HTTP_PORT}` ); // eslint-disable-line no-console
  } );
} )();
