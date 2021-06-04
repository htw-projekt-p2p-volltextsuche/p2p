const express = require( "express" );
const bodyParser = require( "body-parser" );
const logger = require( "./logs/logger" );
const p2p = require( "./p2p" );
const parseEnv = require( "./lib/parseEnv" );

require( "dotenv" ).config( { path: "variables.env" } );
const env = parseEnv( process.env );

const app = express();

app.use( logger.dev );

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );

app.use( "/", require( "./routes" ) );

process.on( "unhandledRejection", ( err ) => { throw err; } );

// 404
app.use( ( req, res, next ) => {
  const err = new Error( "Not Found" );
  err.status = 403;
  next( err );
} );

// error handler
app.use( ( err, req, res, next ) => {
  const data = {
    error   : true,
    errorMsg: err.message,
  };
  res.status( err.status || 500 );
  res.json( data );
} );

p2p( env );

app.listen( env.HTTP_PORT, () => {
  console.log( `Server running on http://localhost:${env.HTTP_PORT}` ); // eslint-disable-line no-console
} );
