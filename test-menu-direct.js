#!/usr/bin/env node

// Test direct HTTP call to Domino's menu API
const https = require('https');

const storeId = '7906'; // From our store test
const menuUrl = `https://order.dominos.com/power/store/${storeId}/menu?lang=en&structured=true`;

console.log(`Testing direct menu API call: ${menuUrl}`);

https.get(menuUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const menuData = JSON.parse(data);
      console.log('Menu API Success!');
      console.log('Top-level keys:', Object.keys(menuData));
      
      if (menuData.result) {
        console.log('Result keys:', Object.keys(menuData.result));
      }
      
      // Look for categories
      let categories = null;
      if (menuData.result && menuData.result.Categories) {
        categories = menuData.result.Categories;
      } else if (menuData.Categories) {
        categories = menuData.Categories;
      }
      
      if (categories) {
        console.log(`Found ${categories.length} categories:`);
        categories.forEach((cat, i) => {
          if (i < 5) { // Show first 5
            console.log(`  ${cat.Name} (${cat.Products ? cat.Products.length : 0} products)`);
          }
        });
      }
      
      // Show first 200 chars of response
      console.log('\nFirst 200 chars of response:');
      console.log(JSON.stringify(menuData, null, 2).substring(0, 200) + '...');
      
    } catch (error) {
      console.error('JSON Parse Error:', error.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Request Error:', err.message);
});
