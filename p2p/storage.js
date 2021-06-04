const FsStore = require( "datastore-fs" );
const { ShardingDatastore } = require( "datastore-core" );
const { NextToLast } = require( "datastore-core" ).shard;

async function createStorage( path ) {
  const fs = new FsStore( path );
  const flatfs = await ShardingDatastore.createOrOpen( fs, new NextToLast( 2 ) );
  return flatfs;
}

module.exports = {
  createStorage,
};
