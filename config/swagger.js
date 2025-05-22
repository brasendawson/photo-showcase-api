import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Photography Showcase Api',
            version: '1.0.0',
            description: 'API for managing photography page',
            contact: {
                name: 'Group 17',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: process.env.BASE || 'http://127.0.0.1:3000',
                description: process.env.NODE_ENV === 'production' 
                    ? 'Production server' 
                    : 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./routes/*.js']
};

export const specs = swaggerJsdoc(options);