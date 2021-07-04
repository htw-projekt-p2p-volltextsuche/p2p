module.exports = function parseEnv( ogEnv ) {
  const env = {};

  function ifExistsElse( variableName, elseValue ) {
    env[variableName] = ogEnv[variableName] ?
      ogEnv[variableName] :
      elseValue;
  }

  ifExistsElse( "HTTP_PORT", 8090 );

  ifExistsElse( "PEER_PORT", 8070 );
  ifExistsElse( "PEER_IP", "127.0.0.1" );

  ifExistsElse( "PEER_LIST", "" );
  env.PEER_LIST = env.PEER_LIST
    .split( "," )
    .map( x => x.trim() )
    .filter( x => !!x );

  ifExistsElse( "PEER_STORAGE", "/tmp/datastore" );
  ifExistsElse( "PEER_REDUNDANCY", 2 );

  // print variables for debugging
  if ( process.argv.includes( "--debug" ) ) {
    function printVariable( variableName, changeValueFunction ) {
      let outString = `  ${variableName}: `;

      if ( changeValueFunction )
        outString += changeValueFunction( env[variableName] );
      else
        outString += env[variableName];

      console.log( outString );
    }

    console.log( "Read environmental variables:\n" );

    printVariable( "HTTP_PORT" );
    printVariable( "PEER_PORT" );
    printVariable( "PEER_IP" );
    printVariable( "PEER_LIST", list => list.map( x => `\n    ${  x}` ) );
    printVariable( "PEER_STORAGE" );
    printVariable( "PEER_REDUNDANCY" );

    console.log( "" );

    // only +1 REDUNDANCY after displaying it to the user
    env.PEER_REDUNDANCY = Number.parseInt( env.PEER_REDUNDANCY ) + 1; // includes a local copy, which we disabled

    process.exit( 0 );
  }

  return env;
};
