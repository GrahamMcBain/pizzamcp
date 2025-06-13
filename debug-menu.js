const dominos = require('dominos');

// Test store ID (we know this works from the previous test)
const storeId = '16002'; // Example store ID

console.log('Creating menu for store:', storeId);

const menu = new dominos.Menu(storeId, (menuData) => {
  console.log('=== MENU RESPONSE ===');
  console.log('Type:', typeof menuData);
  console.log('Keys:', Object.keys(menuData || {}));
  console.log('Full structure (first 1000 chars):', JSON.stringify(menuData, null, 2).substring(0, 1000));
  
  if (menuData && menuData.result) {
    console.log('=== RESULT STRUCTURE ===');
    console.log('Result keys:', Object.keys(menuData.result));
    if (menuData.result.Menu) {
      console.log('Menu keys:', Object.keys(menuData.result.Menu));
      if (menuData.result.Menu.Categories) {
        console.log('Categories count:', menuData.result.Menu.Categories.length);
        console.log('First category:', menuData.result.Menu.Categories[0]);
      }
    }
  }
});
