const express = require( "express" );
const bodyParser = require( "body-parser" );
const logger = require( "./logs/logger" );

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

require( "dotenv" ).config( { path: "variables.env" } );
const { PORT, BOOTSTRAP_LIST } = process.env;
const port = PORT ? PORT : 9000;
const bootstrapList = (BOOTSTRAP_LIST ? BOOTSTRAP_LIST : "").split( "," ).map( x => x.trim() ).filter( x => !!x );

if ( process.argv.includes( "--debug" ) ) {
  console.log( `Read environmental variables:

  PORT: ${port}
  BOOTSTRAP_LIST: ${bootstrapList.map( x => "\n    " + x )}
` );
  process.exit(0);
}

p2p( bootstrapList );

app.listen( PORT, () => {
  console.log( `Server running on http://localhost:${PORT}` ); // eslint-disable-line no-console
} );
