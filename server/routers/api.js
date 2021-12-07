const proxy = require("express-http-proxy");

const apiHost = process.env.API_HOST || 'localhost:3001';
const calculatorHost = process.env.CALCULATOR_API_HOST || 'localhost:3002';
const converterHost = process.env.CONVERTER_API_HOST || 'localhost:3003';

module.exports = function(app){
  
  app.use('/api', proxy(calculatorHost, {
    filter: (req) => { 
      return Promise.resolve(req.url.startsWith('/calculator'))
    },
    proxyReqPathResolver: (req) => {
      // The Calculator app has its /health as a root URL (not under /calculator)
      return req.url.replace('/calculator/health', '/health')
    }
  }));

  app.use('/api', proxy(converterHost, {
    filter: (req) => { 
      return Promise.resolve(req.url.startsWith('/converter'))
    }
  }));

  app.use('/api', proxy(apiHost));
};
