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
  ifExistsElse( "PEER_PUB", "" );
  ifExistsElse( "PEER_PRI", "" );

  ifExistsElse( "PEER_STORAGE", "/tmp/datastore" );

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
    printVariable( "PEER_PUB" );
    printVariable( "PEER_PRI" );
    printVariable( "PEER_STORAGE" );

    console.log( "" );
    process.exit( 0 );
  }
};
