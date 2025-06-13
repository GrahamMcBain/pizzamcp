const dominos = require('dominos');

console.log('Finding stores for address...');

dominos.Util.findNearbyStores('4367 Virgusell Circle, Carmichael CA 95608', 'Delivery', (storeData) => {
  console.log('=== STORE RESPONSE ===');
  console.log('Success:', storeData.success);
  
  if (storeData.success && storeData.result && storeData.result.Stores) {
    const store = storeData.result.Stores[0];
    console.log('First store:', JSON.stringify(store, null, 2));
    console.log('Store ID:', store.StoreID);
    
    // Now try to get menu for this store
    console.log('\n=== TRYING MENU ===');
    const menu = new dominos.Menu(store.StoreID, (menuData) => {
      console.log('Menu response type:', typeof menuData);
      console.log('Menu response keys:', Object.keys(menuData || {}));
      console.log('Menu response (first 500 chars):', JSON.stringify(menuData, null, 2).substring(0, 500));
    });
  } else {
    console.log('Store lookup failed:', storeData);
  }
});
