const { createNode } = require( "./node" );

class P2P {
  async create( env ) {
    this.node = await createNode( env );
  }

  isInitialized() {
    if ( !this.node )
      throw new Error( "p2p net not initialized" );
  }

  get( key ) {
    this.isInitialized();

    return this.node.contentRouting.get( key );
  }

  put( rawKey, rawValue ) {
    this.isInitialized();

    const key = Buffer.from( rawKey, "utf-8" );
    const value = Buffer.from( JSON.stringify( rawValue ), "utf-8" );
    return this.node.contentRouting.put( key, value );
  }
}

module.exports = P2P;
