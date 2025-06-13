#!/usr/bin/env node

// Test script to directly call Domino's API and inspect response structures
const dominos = require('dominos');

console.log('🍕 Testing Domino\'s API directly...\n');

// Test store locator
console.log('=== TESTING STORE LOCATOR ===');
dominos.Util.findNearbyStores('4367 Virgusell Circle, Carmichael CA 95608', 'Delivery', (storeData) => {
  console.log('Store locator success:', storeData.success);
  
  if (storeData.success && storeData.result && storeData.result.Stores) {
    const stores = storeData.result.Stores;
    console.log(`Found ${stores.length} stores`);
    
    // Show first store structure
    if (stores.length > 0) {
      console.log('\n=== FIRST STORE STRUCTURE ===');
      console.log(JSON.stringify(stores[0], null, 2));
      
      // Test menu loading with first store
      const firstStore = stores[0];
      const storeId = firstStore.StoreID || firstStore.StoreId || firstStore.store_id || firstStore.ID;
      
      console.log(`\n=== TESTING MENU FOR STORE ${storeId} ===`);
      
      const menu = new dominos.Menu(storeId, (menuData) => {
        console.log('Menu loaded successfully:', !!menuData);
        
        if (menuData) {
          console.log('\n=== MENU STRUCTURE ===');
          console.log('Menu top-level keys:', Object.keys(menuData));
          
          if (menuData.result) {
            console.log('Menu.result keys:', Object.keys(menuData.result));
            
            if (menuData.result.Menu) {
              console.log('Menu.result.Menu keys:', Object.keys(menuData.result.Menu));
              
              if (menuData.result.Menu.Categories) {
                console.log(`Found ${menuData.result.Menu.Categories.length} categories`);
                console.log('Category names:', menuData.result.Menu.Categories.map(c => c.Name));
                
                // Show first category structure
                if (menuData.result.Menu.Categories.length > 0) {
                  console.log('\n=== FIRST CATEGORY STRUCTURE ===');
                  console.log(JSON.stringify(menuData.result.Menu.Categories[0], null, 2));
                }
              }
            }
          }
          
          // Also check if menu has direct Categories
          if (menuData.Categories) {
            console.log('Direct Categories found:', menuData.Categories.length);
          }
          
          // Show full structure (truncated)
          console.log('\n=== FULL MENU STRUCTURE (first 500 chars) ===');
          const menuStr = JSON.stringify(menuData, null, 2);
          console.log(menuStr.substring(0, 500) + '...');
        } else {
          console.log('❌ Menu loading failed - no data returned');
        }
      });
    }
  } else {
    console.log('❌ Store locator failed');
    console.log('Full response:', JSON.stringify(storeData, null, 2));
  }
});

// Set timeout to prevent script from hanging
setTimeout(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}, 10000);
