module.exports = {
  db: {
    connector: 'memory'
  },
  storage: {
    connector: 'loopback-component-storage',
    provider: 'filesystem',
    root: './server/storage',
  },
  devMongodb: {
    connector: 'mongodb',
    hostname: process.env.DB_PORT_27017_TCP_ADDR || 'localhost',
    port: process.env.DB_PORT_27017_TCP_PORT || 27017,
    database: 'mavis',
  }
}
