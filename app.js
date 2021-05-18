const express = require( "express" );
const bodyParser = require( "body-parser" );
const logger = require( "./logs/logger" );

const app = express();

require( "dotenv" ).config( { path: "variables.env" } );

const { PORT } = process.env;

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

app.listen( PORT, () => {
  console.log( `Server running on http://localhost:${PORT}` ); // eslint-disable-line no-console
} );
