// backend/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Mem Study API', version: '1.0.0' },
    servers: [
      { url: 'http://localhost:4000', description: 'Local' },
      { url: 'https://cardsapp.org', description: 'Prod' },
    ],
  },
  // your routes are in app.js
  apis: ['./app.js'],
});
