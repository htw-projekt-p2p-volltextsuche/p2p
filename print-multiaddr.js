const parseEnv = require( "./lib/parseEnv" );
const { getPeerId } = require( "./p2p/fs" );

( async () =>  {
  require( "dotenv" ).config( { path: "variables.env" } );
  const env = parseEnv( process.env );

  const peerId = await getPeerId( env.PEER_STORAGE );

  console.log( `/ip4/${env.PEER_IP}/tcp/${env.PEER_PORT}/ipfs/${peerId.toB58String()}` );
} )();
