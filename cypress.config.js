const { defineConfig } = require("cypress");

async function setupNodeEvents(on, config){
  
  return config;
}
module.exports = defineConfig({
  projectId: 'kgescm',
  e2e: {
    setupNodeEvents,
 
    specPattern: 'cypress/integration/test/*.js',

    
  },

});