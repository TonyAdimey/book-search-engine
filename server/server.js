const express = require('express');
const path = require('path');
const db = require('../Develop/server/config/connection');
const routes = require('../Develop/server/routes');
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('../Develop/server/utils/auth');
const { typeDefs, resolvers } = require('../Develop/server/schemas');

const app = express();
const PORT = process.env.PORT || 3005;

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  app.use(routes);

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  });
};

startApolloServer();