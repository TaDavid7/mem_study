// /backend/src/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Mem Study API',
      version: '1.0.0',
      description: 'Flashcards + Folders API',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local' },
      { url: 'https://cardsapp.org', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Folder: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f9b0f2b1d1a23a4c9a001' },
            name: { type: 'string', example: 'Biology' }
          },
          required: ['name']
        },
        Flashcard: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            question: { type: 'string', example: 'What is ATP?' },
            answer: { type: 'string', example: 'Energy currency of the cell' },
            folder: { type: 'string', description: 'Folder _id' }
          },
          required: ['question', 'answer', 'folder']
        }
      }
    }
  },
  // JSDoc comments live in your route files:
  apis: ["./app.js"],
};

module.exports = swaggerJsdoc(options);
