const dominos = require('dominos');
import * as https from 'https';

interface OrderItem {
  name: string;
  code: string;
  size?: string;
  quantity: number;
  price?: number;
}

interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

interface PaymentInfo {
  card_number: string;
  expiration: string;
  cvv: string;
  zip_code: string;
}

export class DominosOrderService {
  private currentStore?: any;
  private currentMenu?: any;
  private orderItems: OrderItem[] = [];
  private customerInfo: CustomerInfo = {};
  private deliveryAddress?: string;
  private currentOrder?: any;

  startNewOrder(): string {
    // Reset all state for new order
    this.currentStore = undefined;
    this.currentMenu = undefined;
    this.orderItems = [];
    this.customerInfo = {};
    this.deliveryAddress = undefined;
    this.currentOrder = undefined;

    return "🍕 **New Pizza Order Started!**\n\nI'm ready to help you order from Domino's. Let's start with your delivery address.\n\nPlease provide your full delivery address (street, city, state, ZIP).";
  }

  async findStore(address: string): Promise<string> {
    try {
      this.deliveryAddress = address;
      
      // Use 3.x API: await new NearbyStores(address)
      const nearbyStores = await new dominos.NearbyStores(address);

      if (!nearbyStores.stores || nearbyStores.stores.length === 0) {
        return `❌ **No Stores Found**\n\nSorry, no Domino's stores found that deliver to "${address}". Please try a different address.`;
      }

      // Find the closest delivery store using 3.x criteria
      let closestStore = null;
      let shortestDistance = Infinity;

      for (const store of nearbyStores.stores) {
        if (store.IsOnlineCapable && 
            store.IsDeliveryStore && 
            store.IsOpen && 
            store.ServiceIsOpen?.Delivery && 
            store.MinDistance < shortestDistance) {
          shortestDistance = store.MinDistance;
          closestStore = store;
        }
      }

      if (!closestStore) {
        return `❌ **No Available Stores**\n\nFound ${nearbyStores.stores.length} stores, but none are currently open for delivery to your address. Please try again later or consider pickup.`;
      }

      this.currentStore = closestStore;
      
      // Debug: Log the actual store object structure
      return `✅ **Store Found!**\n\n**Domino's Store**\n📍 ${closestStore.AddressDescription}\n📞 ${closestStore.Phone}\n🚚 Delivers to your address (${closestStore.MinDistance} miles away)\n\nGreat! Now let's look at their menu. What would you like to see? (Pizza, Sides, Drinks, Desserts, or say "show all" for everything)`;
    } catch (error) {
      return `❌ **Error Finding Store**\n\nSorry, I encountered an error while searching for stores: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with a different address format.`;
    }
  }

  async getMenu(category?: string): Promise<string> {
    if (!this.currentStore) {
      return "❌ Please find a store first by providing your delivery address.";
    }

    try {
      if (!this.currentMenu) {
        // Get the store ID using v3.3.1 structure
        const storeId = this.currentStore.StoreID;
        
        console.error('DEBUG: Loading menu for store ID:', storeId);
        
        // Use v3.3.1 dominos Menu class
        try {
        const dominosMenu = await new dominos.Menu(storeId);
          this.currentMenu = this.parseV3Menu(dominosMenu);
        } catch (menuError) {
        console.error('Menu loading failed, using fallback:', menuError);
        // Use a reliable fallback menu structure with common items
        this.currentMenu = {
          Categories: [
            {
              Name: "Pizza",
              Products: [
                { Name: "Large Hand Tossed Cheese Pizza", Code: "14SCREEN", Price: 1299, Description: "Classic cheese pizza with our signature sauce" },
                { Name: "Large Hand Tossed Pepperoni Pizza", Code: "14TPEPEN", Price: 1599, Description: "Pepperoni with cheese and our signature sauce" },
                { Name: "Large Hand Tossed Supreme Pizza", Code: "14TSUPRM", Price: 1899, Description: "Pepperoni, Italian Sausage, Green Peppers, Mushrooms, Onions" },
                { Name: "Medium Hand Tossed Cheese Pizza", Code: "12SCREEN", Price: 999, Description: "Classic cheese pizza with our signature sauce" },
                { Name: "Medium Hand Tossed Pepperoni Pizza", Code: "12TPEPEN", Price: 1299, Description: "Pepperoni with cheese and our signature sauce" },
                { Name: "Large Thin Crust Cheese Pizza", Code: "14THIN", Price: 1199, Description: "Thin crust cheese pizza" },
                { Name: "Large Brooklyn Style Pepperoni Pizza", Code: "14PBKPEP", Price: 1699, Description: "Brooklyn style pepperoni pizza" }
              ]
            },
            {
              Name: "Sides",
              Products: [
                { Name: "Buffalo Wild Wings", Code: "W08PBNEW", Price: 899, Description: "8 Piece Buffalo Wild Wings" },
                { Name: "Cheesy Bread", Code: "S_BREAD", Price: 599, Description: "Fresh baked bread strips with cheese" },
                { Name: "Cinnamon Bread Twists", Code: "S_CINN", Price: 599, Description: "Sweet cinnamon bread twists" },
                { Name: "Garlic Bread Twists", Code: "S_GARLC", Price: 599, Description: "Garlic bread twists" },
                { Name: "Parmesan Bread Bites", Code: "S_PARM", Price: 599, Description: "Parmesan bread bites" }
              ]
            },
            {
              Name: "Drinks",
              Products: [
                { Name: "20oz Coca-Cola", Code: "20BCOKE", Price: 299, Description: "Ice cold Coca-Cola" },
                { Name: "20oz Sprite", Code: "20BSPRITE", Price: 299, Description: "Refreshing Sprite" },
                { Name: "20oz Orange Fanta", Code: "20BORANGE", Price: 299, Description: "Orange Fanta" },
                { Name: "Bottled Water", Code: "BOTTLE_WATER", Price: 199, Description: "Pure bottled water" }
              ]
            },
            {
              Name: "Desserts",
              Products: [
                { Name: "Chocolate Lava Crunch Cakes", Code: "MARBRWNE", Price: 599, Description: "Warm chocolate cake with molten chocolate center" },
                { Name: "Cinnamon Bread Twists", Code: "S_CINN", Price: 599, Description: "Sweet cinnamon bread twists" }
              ]
            }
          ]
          };
        }
        
        console.error('DEBUG: Menu loaded with', this.currentMenu?.Categories?.length || 'unknown', 'categories');
      }

      let response = "🍕 **Domino's Menu**\n\n";

      if (!category || category.toLowerCase() === 'show all') {
        // Show menu categories
        response += "**Menu Categories:**\n";
        response += "1. 🍕 **Pizza** - Specialty pizzas and build your own\n";
        response += "2. 🥖 **Sides** - Wings, breadsticks, salads, and more\n";
        response += "3. 🥤 **Drinks** - Sodas, juices, and water\n";
        response += "4. 🍰 **Desserts** - Sweet treats and cookies\n\n";
        response += "Ask me to show any category (e.g., \"show pizza menu\") or tell me what you'd like to order!";
        return response;
      }

      // Filter menu by category
      const categoryLower = category.toLowerCase();
      let items: any[] = [];

      // Handle different possible menu data structures
      let menuData = null;
      
      if (this.currentMenu && this.currentMenu.Categories) {
        menuData = this.currentMenu;
      } else if (this.currentMenu && this.currentMenu.result && this.currentMenu.result.Menu) {
        menuData = this.currentMenu.result.Menu;
      } else if (this.currentMenu && this.currentMenu.Menu) {
        menuData = this.currentMenu.Menu;
      } else if (this.currentMenu) {
        // Try the menu object directly
        menuData = this.currentMenu;
      }
      
      if (menuData) {
        if (categoryLower.includes('pizza')) {
          // Get pizza items
          items = this.extractMenuItems(menuData, ['Pizza']);
        } else if (categoryLower.includes('side')) {
          // Get sides
          items = this.extractMenuItems(menuData, ['Sides']);
        } else if (categoryLower.includes('drink')) {
          // Get drinks
          items = this.extractMenuItems(menuData, ['Drinks']);
        } else if (categoryLower.includes('dessert')) {
          // Get desserts
          items = this.extractMenuItems(menuData, ['Desserts']);
        } else {
          // Try to find category by name
          items = this.extractMenuItems(menuData, [category]);
        }
      }

      if (items.length === 0) {
        return `❌ No items found for category "${category}". Try: Pizza, Sides, Drinks, or Desserts.`;
      }

      response += `**${category.charAt(0).toUpperCase() + category.slice(1)} Menu:**\n\n`;
      
      items.slice(0, 15).forEach((item, index) => {
        const price = item.Price ? `$${(item.Price / 100).toFixed(2)}` : 'Price varies';
        response += `${index + 1}. **${item.Name}** - ${price}\n`;
        if (item.Description) {
          response += `   _${item.Description}_\n`;
        }
        response += '\n';
      });

      if (items.length > 15) {
        response += `_... and ${items.length - 15} more items. Ask for specific items or a different category._\n\n`;
      }

      response += "To order, just tell me what you'd like! (e.g., \"I'll take a large pepperoni pizza\")";
      
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return `❌ **Error Loading Menu**\n\nSorry, I couldn't load the menu: ${errorMsg}. Please try again.`;
    }
  }

  private parseV3Menu(dominosMenu: any): any {
    try {
      const categories: any[] = [];
      
      if (!dominosMenu.menu || !dominosMenu.menu.categories) {
        return { Categories: categories };
      }
      
      const menu = dominosMenu.menu;
      
      // Parse Pizza category
      if (menu.categories.food?.pizza) {
        const pizzaCategory = menu.categories.food.pizza;
        const pizzaProducts: any[] = [];
        
        // Get products from all subcategories
        if (pizzaCategory.subCategories) {
          Object.values(pizzaCategory.subCategories).forEach((subCat: any) => {
            if (subCat.products && Array.isArray(subCat.products)) {
              subCat.products.forEach((productCode: string) => {
                const product = menu.products?.[productCode];
                if (product) {
                  // Create different variants based on product code
                  if (productCode === 'S_PIZZA') {
                    // Build your own pizza - create common sizes
                    pizzaProducts.push({
                      Name: 'Large Hand Tossed Cheese Pizza',
                      Code: '14SCREEN',
                      Description: 'Classic cheese pizza with our signature sauce',
                      Price: 1299
                    });
                    pizzaProducts.push({
                      Name: 'Medium Hand Tossed Cheese Pizza', 
                      Code: '12SCREEN',
                      Description: 'Classic cheese pizza with our signature sauce',
                      Price: 999
                    });
                    pizzaProducts.push({
                      Name: 'Large Hand Tossed Pepperoni Pizza',
                      Code: '14TPEPEN',
                      Description: 'Pepperoni with cheese and our signature sauce',
                      Price: 1599
                    });
                  } else {
                    // Specialty pizzas
                    const variants = this.getProductVariants(product, menu.variants);
                    variants.forEach(variant => {
                      pizzaProducts.push({
                        Name: variant.name,
                        Code: variant.code,
                        Description: product.description || '',
                        Price: variant.price
                      });
                    });
                  }
                }
              });
            }
          });
        }
        
        if (pizzaProducts.length > 0) {
          categories.push({
            Name: 'Pizza',
            Products: pizzaProducts.slice(0, 10) // Limit to 10 items
          });
        }
      }
      
      // Parse Sides category
      const sidesProducts: any[] = [];
      if (menu.categories.food) {
        ['bread', 'wings', 'pasta', 'sandwich'].forEach(categoryName => {
          const category = menu.categories.food[categoryName];
          if (category && category.products) {
            category.products.forEach((productCode: string) => {
              const product = menu.products?.[productCode];
              if (product) {
                const variants = this.getProductVariants(product, menu.variants);
                variants.forEach(variant => {
                  sidesProducts.push({
                    Name: variant.name,
                    Code: variant.code,
                    Description: product.description || '',
                    Price: variant.price
                  });
                });
              }
            });
          }
        });
      }
      
      if (sidesProducts.length > 0) {
        categories.push({
          Name: 'Sides',
          Products: sidesProducts.slice(0, 8)
        });
      }
      
      // Parse Drinks category
      const drinkProducts: any[] = [];
      if (menu.categories.food?.drinks) {
        const drinksCategory = menu.categories.food.drinks;
        if (drinksCategory.products) {
          drinksCategory.products.forEach((productCode: string) => {
            const product = menu.products?.[productCode];
            if (product) {
              const variants = this.getProductVariants(product, menu.variants);
              variants.forEach(variant => {
                drinkProducts.push({
                  Name: variant.name,
                  Code: variant.code,
                  Description: product.description || '',
                  Price: variant.price
                });
              });
            }
          });
        }
      }
      
      if (drinkProducts.length > 0) {
        categories.push({
          Name: 'Drinks',
          Products: drinkProducts.slice(0, 6)
        });
      }
      
      return { Categories: categories };
    } catch (error) {
      console.error('Error parsing v3 menu:', error);
      return { Categories: [] };
    }
  }
  
  private getProductVariants(product: any, menuVariants: any): Array<{name: string, code: string, price: number}> {
    const variants: Array<{name: string, code: string, price: number}> = [];
    
    if (product.variants && Array.isArray(product.variants)) {
      // Take the first few variants to avoid overwhelming the menu
      product.variants.slice(0, 3).forEach((variantCode: string) => {
        const variant = menuVariants[variantCode];
        if (variant) {
          variants.push({
            name: variant.name || product.name,
            code: variantCode,
            price: this.parsePrice(variant.price)
          });
        }
      });
    }
    
    // If no variants, create a default entry
    if (variants.length === 0) {
      variants.push({
        name: product.name,
        code: product.code,
        price: 0
      });
    }
    
    return variants;
  }
  
  private parsePrice(priceString: string): number {
    if (!priceString) return 0;
    const price = parseFloat(priceString);
    return Math.round(price * 100); // Convert to cents
  }

  private getProductPrice(product: any): number {
    // Try to get the price from the product variants
    if (product.variants) {
      const variants = Object.values(product.variants);
      if (variants.length > 0) {
        const firstVariant: any = variants[0];
        return firstVariant.price || 0;
      }
    }
    
    // Fallback to direct price
    return product.price || 0;
  }

  private extractMenuItems(menu: any, categories: string[]): any[] {
    const items: any[] = [];
    
    // Handle different possible menu structures
    let menuCategories = null;
    if (menu.Categories) {
      menuCategories = menu.Categories;
    } else if (menu.result && menu.result.Menu && menu.result.Menu.Categories) {
      menuCategories = menu.result.Menu.Categories;
    } else if (menu.Menu && menu.Menu.Categories) {
      menuCategories = menu.Menu.Categories;
    }
    
    if (!menuCategories) {
      return items;
    }

    for (const category of menuCategories) {
      if (!category) continue;
      
      const categoryName = category.Name || '';
      
      // Check if this category matches any of our target categories
      const isMatch = categories.some(targetCategory => 
        categoryName.toLowerCase().includes(targetCategory.toLowerCase()) ||
        targetCategory.toLowerCase().includes(categoryName.toLowerCase())
      );

      if (isMatch && category.Products && Array.isArray(category.Products)) {
        for (const product of category.Products) {
          if (product && product.Name && product.Code) {
            items.push({
              Name: product.Name,
              Code: product.Code,
              Description: product.Description,
              Price: product.Price,
              Category: categoryName
            });
          }
        }
      }
    }

    return items;
  }

  async addItem(itemName: string, size?: string, quantity: number = 1, itemCode?: string): Promise<string> {
    console.error('DEBUG: addItem called with currentStore:', !!this.currentStore, 'currentMenu:', !!this.currentMenu);
    
    if (!this.currentStore) {
      return "❌ Please find a store first by providing your delivery address.";
    }
    
    // Load menu if not already loaded
    if (!this.currentMenu) {
      console.error('DEBUG: Loading menu...');
      try {
        await this.getMenu("show all"); // This will set this.currentMenu with the fallback
      } catch (error) {
        console.error('ERROR: Failed to load menu in addItem:', error);
        return "❌ Failed to load menu. Please try getting the menu first.";
      }
    }
    
    if (!this.currentMenu) {
      return "❌ Menu is not available. Please try again.";
    }
    
    console.error('DEBUG: Menu loaded, finding item...');

    try {
      // Find the item in the menu
      let foundItem: any = null;
      
      if (itemCode) {
        // Search by code if provided
        foundItem = this.findItemByCode(itemCode);
      } else {
        // Search by name
        foundItem = this.findItemByName(itemName, size);
      }

      if (!foundItem) {
        return `❌ **Item Not Found**\n\nI couldn't find "${itemName}"${size ? ` in ${size}` : ''} on the menu. Try browsing the menu categories or ask me to show specific items.`;
      }

      // Add to order
      const orderItem: OrderItem = {
        name: foundItem.Name,
        code: foundItem.Code,
        size: size,
        quantity: quantity,
        price: foundItem.Price ? foundItem.Price / 100 : undefined
      };

      this.orderItems.push(orderItem);

      const priceText = orderItem.price ? ` - $${(orderItem.price * quantity).toFixed(2)}` : '';
      
      return `✅ **Added to Order**\n\n${quantity}x ${foundItem.Name}${size ? ` (${size})` : ''}${priceText}\n\nYour order now has ${this.orderItems.length} item(s). Would you like to add anything else, or shall we review your order?`;
    } catch (error) {
      return `❌ **Error Adding Item**\n\nSorry, I couldn't add that item: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private findItemByCode(code: string): any {
    if (!this.currentMenu?.Categories) return null;

    for (const category of this.currentMenu.Categories) {
      if (category.Products) {
        const item = category.Products.find((p: any) => p.Code === code);
        if (item) return item;
      }
    }
    return null;
  }

  private findItemByName(name: string, size?: string): any {
    if (!this.currentMenu?.Categories) return null;

    const nameLower = name.toLowerCase();
    
    for (const category of this.currentMenu.Categories) {
      if (category.Products) {
        // First try exact match
        let item = category.Products.find((p: any) => 
          p.Name && p.Name.toLowerCase() === nameLower
        );
        
        // If not found, try partial match
        if (!item) {
          item = category.Products.find((p: any) => 
            p.Name && p.Name.toLowerCase().includes(nameLower)
          );
        }
        
        // If found and size matters, try to find size variant
        if (item && size) {
          const sizeVariant = category.Products.find((p: any) => 
            p.Name && 
            p.Name.toLowerCase().includes(nameLower) &&
            p.Name.toLowerCase().includes(size.toLowerCase())
          );
          
          if (sizeVariant) {
            return sizeVariant;
          }
        }
        
        if (item) return item;
      }
    }
    return null;
  }

  removeItem(index: number): string {
    if (index < 0 || index >= this.orderItems.length) {
      return `❌ Invalid item index. Your order has ${this.orderItems.length} items (0-${this.orderItems.length - 1}).`;
    }

    const removedItem = this.orderItems.splice(index, 1)[0];
    
    return `✅ **Removed from Order**\n\n${removedItem.quantity}x ${removedItem.name} has been removed.\n\nYour order now has ${this.orderItems.length} item(s).`;
  }

  async getOrderSummary(): Promise<string> {
    if (this.orderItems.length === 0) {
      return "🛒 **Your Order is Empty**\n\nAdd some items to your order first!";
    }

    try {
      let summary = "🛒 **Order Summary**\n\n";
      
      // List items
      let subtotal = 0;
      this.orderItems.forEach((item, index) => {
        const itemTotal = (item.price || 0) * item.quantity;
        subtotal += itemTotal;
        
        summary += `${index + 1}. ${item.quantity}x ${item.name}`;
        if (item.size) summary += ` (${item.size})`;
        if (item.price) summary += ` - $${itemTotal.toFixed(2)}`;
        summary += '\n';
      });

      // Calculate totals (approximate - real pricing from Domino's API would be more accurate)
      const deliveryFee = 3.49;
      const taxRate = 0.08; // 8% estimated
      const tax = (subtotal + deliveryFee) * taxRate;
      const total = subtotal + deliveryFee + tax;

      summary += '\n**Pricing:**\n';
      summary += `Subtotal: $${subtotal.toFixed(2)}\n`;
      summary += `Delivery Fee: $${deliveryFee.toFixed(2)}\n`;
      summary += `Tax: $${tax.toFixed(2)}\n`;
      summary += `**Total: $${total.toFixed(2)}**\n\n`;

      if (!this.customerInfo.name || !this.customerInfo.phone) {
        summary += "⚠️ **Customer info needed**: Please provide your name and phone number for delivery.\n\n";
      }

      if (this.deliveryAddress) {
        summary += `📍 **Delivery to**: ${this.deliveryAddress}\n\n`;
      }

      summary += "Ready to place your order? I'll need your payment information to proceed.";

      return summary;
    } catch (error) {
      return `❌ Error calculating order summary: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  setCustomerInfo(name?: string, phone?: string, email?: string): string {
    if (name) this.customerInfo.name = name;
    if (phone) this.customerInfo.phone = phone;
    if (email) this.customerInfo.email = email;

    let response = "✅ **Customer Information Updated**\n\n";
    
    if (this.customerInfo.name) response += `Name: ${this.customerInfo.name}\n`;
    if (this.customerInfo.phone) response += `Phone: ${this.customerInfo.phone}\n`;
    if (this.customerInfo.email) response += `Email: ${this.customerInfo.email}\n`;

    const missing = [];
    if (!this.customerInfo.name) missing.push('name');
    if (!this.customerInfo.phone) missing.push('phone number');

    if (missing.length > 0) {
      response += `\n⚠️ Still needed: ${missing.join(' and ')}\n`;
    } else {
      response += '\n🎉 All required customer info collected!';
    }

    return response;
  }

  private calculateEstimatedTotal(): number {
    const subtotal = this.orderItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    const deliveryFee = 3.49;
    const taxRate = 0.08;
    const tax = (subtotal + deliveryFee) * taxRate;
    return subtotal + deliveryFee + tax;
  }

  async placeOrder(paymentInfo: PaymentInfo, tipAmount: number = 0): Promise<string> {
    // Validate order state
    if (this.orderItems.length === 0) {
      return "❌ Cannot place order: Your cart is empty.";
    }

    if (!this.currentStore) {
      return "❌ Cannot place order: No store selected.";
    }

    if (!this.deliveryAddress) {
      return "❌ Cannot place order: No delivery address provided.";
    }

    if (!this.customerInfo.name || !this.customerInfo.phone) {
      return "❌ Cannot place order: Customer name and phone number are required.";
    }

    try {
      // Parse address properly
      const addressParts = this.deliveryAddress.split(',').map(part => part.trim());
      const street = addressParts[0] || '';
      
      // Handle "City STATE ZIP" format
      const cityStateZip = addressParts[1] || '';
      const cityStateZipParts = cityStateZip.split(' ');
      
      // Extract ZIP (last part), STATE (second to last), and city (everything else)
      const postalCode = cityStateZipParts.pop() || '';
      const region = cityStateZipParts.pop() || 'CA';
      const city = cityStateZipParts.join(' ') || '';

      // Create customer with address
      const customer = new dominos.Customer({
        address: this.deliveryAddress,
        firstName: this.customerInfo.name.split(' ')[0] || this.customerInfo.name,
        lastName: this.customerInfo.name.split(' ').slice(1).join(' ') || '',
        phone: this.customerInfo.phone,
        email: this.customerInfo.email || ''
      });

      // Create order
      const order = new dominos.Order(customer);
      order.storeID = this.currentStore.StoreID;
      
      // Set the address using dominos.Address for proper validation
      order.address = new dominos.Address({
        street: street,
        city: city,
        region: region,
        postalCode: postalCode
      });

      // Add items to order
      for (const item of this.orderItems) {
        const dominosItem = new dominos.Item({
          code: item.code,
          qty: item.quantity
        });
        order.addItem(dominosItem);
      }

      // Validate order
      try {
        await order.validate();
      } catch (validateError) {
        const errorMessage = validateError instanceof Error ? validateError.message : 'Unknown validation error';
        
        // Check for ServiceMethodNotAllowed (delivery not available)
        if (errorMessage.includes('ServiceMethodNotAllowed')) {
          // Try pickup instead of delivery
          try {
            const pickupCustomer = new dominos.Customer({
              address: this.deliveryAddress,
              firstName: this.customerInfo.name.split(' ')[0] || this.customerInfo.name,
              lastName: this.customerInfo.name.split(' ').slice(1).join(' ') || '',
              phone: this.customerInfo.phone,
              email: this.customerInfo.email || ''
            });

            const pickupOrder = new dominos.Order(pickupCustomer);
            pickupOrder.storeID = this.currentStore.StoreID;
            
            // Set the address using dominos.Address  
            pickupOrder.address = new dominos.Address({
              street: street,
              city: city,
              region: region,
              postalCode: postalCode
            });

            // Add items to pickup order
            for (const item of this.orderItems) {
              const dominosItem = new dominos.Item({
                code: item.code,
                qty: item.quantity
              });
              pickupOrder.addItem(dominosItem);
            }

            // Validate and price pickup order
            await pickupOrder.validate();
            await pickupOrder.price();

            const pickupAmount = pickupOrder.amountsBreakdown?.customer || 0;
            if (!pickupAmount) {
              return `❌ **Pickup Error**\n\nCould not determine pickup total. Please call the store directly.`;
            }

            // Create payment for pickup
            const pickupPayment = new dominos.Payment({
              amount: pickupAmount + tipAmount,
              number: paymentInfo.card_number.replace(/\s/g, ''),
              expiration: paymentInfo.expiration,
              securityCode: paymentInfo.cvv,
              postalCode: paymentInfo.zip_code,
              tipAmount: tipAmount
            });

            pickupOrder.payments.push(pickupPayment);

            // Place pickup order
            try {
              await pickupOrder.place();

              const pickupOrderNumber = pickupOrder.orderID || 'Unknown';
              const pickupEstimatedTime = pickupOrder.estimatedWaitMinutes || '15-25';
              
              this.startNewOrder();
              
              return `🎉 **Pickup Order Placed Successfully!**\n\n**Order #${pickupOrderNumber}**\n\n🍕 Your pizza will be ready for pickup!\n⏰ Estimated time: ${pickupEstimatedTime} minutes\n🏪 Pickup at: ${this.currentStore?.AddressDescription || 'Store address'}\n💰 Total charged: $${(pickupAmount + tipAmount).toFixed(2)}\n\n📧 You should receive an email confirmation shortly.\n📱 Track your order using the Domino's app.\n\n**Note: Delivery wasn't available to your address, so we switched to pickup automatically! 🚗**`;
            } catch (pickupPlaceError) {
              const pickupErrorMessage = pickupPlaceError instanceof Error ? pickupPlaceError.message : 'Unknown error';
              
              if (pickupErrorMessage.includes('recaptchaVerificationRequired')) {
                const storeDirectUrl = `https://www.dominos.com/en/pages/order/#!/locations/store/${this.currentStore?.StoreID}/`;
                
                return `🤖 **reCAPTCHA Verification Required**\n\nDomino's requires human verification to prevent automated orders. Please complete your pickup order using:\n\n**🌐 Continue Your Order Online:**\n${storeDirectUrl}\n\n**📱 Domino's Mobile App:**\n• Download the Domino's app\n• Search for store: ${this.currentStore?.StoreID}\n• Add your items and select pickup\n\n**📞 Call for Pickup:**\n${this.currentStore?.Phone || 'Store phone'}\n\n**Your Order Details:**\n${this.orderItems.map((item, index) => `${index + 1}. ${item.quantity}x ${item.name} - $${((item.price || 0) * item.quantity).toFixed(2)}`).join('\n')}\n🏪 Pickup at: ${this.currentStore?.AddressDescription || 'Store address'}\n💰 Estimated total: $${(pickupAmount + tipAmount).toFixed(2)}\n\n*The online link will take you directly to your local store.*`;
              }
              
              throw pickupPlaceError; // Re-throw other errors
            }
            
          } catch (pickupError) {
            return `❌ **Order Failed**\n\nBoth delivery and pickup failed.\n\nDelivery error: ${errorMessage}\nPickup error: ${pickupError instanceof Error ? pickupError.message : 'Unknown pickup error'}\n\nPlease call the store directly at ${this.currentStore?.Phone || 'the store phone'}`;
          }
        }
        
        return `❌ **Validation Error**\n\nValidation failed: ${errorMessage}`;
      }

      // Price order
      try {
        await order.price();
      } catch (priceError) {
        return `❌ **Pricing Error**\n\nPricing failed: ${priceError instanceof Error ? priceError.message : 'Unknown pricing error'}`;
      }

      // Get amount from order.amountsBreakdown.customer (3.x API)
      const customerAmount = order.amountsBreakdown?.customer || 0;
      
      if (!customerAmount || customerAmount === 0) {
        return `❌ **Pricing Error**\n\nCould not determine order total.\n\nDebugging info:\n- Amounts: ${JSON.stringify((order as any).Amounts)}\n- order keys: ${Object.keys(order).join(', ')}\n\nPlease try again.`;
      }

      // Create payment
      const payment = new dominos.Payment({
        amount: customerAmount + tipAmount,
        number: paymentInfo.card_number.replace(/\s/g, ''),
        expiration: paymentInfo.expiration,
        securityCode: paymentInfo.cvv,
        postalCode: paymentInfo.zip_code,
        tipAmount: tipAmount
      });

      // Add payment using the correct method from docs
      order.payments.push(payment);

      // Attempt to place order
      try {
        await order.place();

        // Get order details from the order object itself
        const orderNumber = order.orderID || 'Unknown';
        const estimatedTime = order.estimatedWaitMinutes || '30-45';
        
        // Reset order state after successful placement
        this.startNewOrder();
        
        return `🎉 **Order Placed Successfully!**\n\n**Order #${orderNumber}**\n\n🍕 Your delicious pizza is being prepared!\n⏰ Estimated delivery: ${estimatedTime} minutes\n📍 Delivering to: ${this.deliveryAddress}\n💰 Total charged: $${(customerAmount + tipAmount).toFixed(2)}\n\n📧 You should receive an email confirmation shortly.\n📱 Track your order using the Domino's app or website with your phone number.\n\nEnjoy your meal! 🍕`;
      } catch (placeError) {
        const errorMessage = placeError instanceof Error ? placeError.message : 'Unknown error';
        
        // Handle reCAPTCHA verification requirement
        if (errorMessage.includes('recaptchaVerificationRequired')) {
          const storeUrl = `https://www.dominos.com/en/pages/order/#!/locations/search/?type=Delivery&c=${encodeURIComponent(this.deliveryAddress)}`;
          const storeDirectUrl = `https://www.dominos.com/en/pages/order/#!/locations/store/${this.currentStore?.StoreID}/`;
          
          return `🤖 **reCAPTCHA Verification Required**\n\nDomino's requires human verification to prevent automated orders. Please complete your order using one of these options:\n\n**🌐 Continue Your Order Online:**\n${storeDirectUrl}\n\n**📱 Domino's Mobile App:**\n• Download the Domino's app\n• Search for store: ${this.currentStore?.StoreID} in ${(this.deliveryAddress || '').split(',')[1]?.trim()}\n• Add your items and complete checkout\n\n**📞 Call to Order:**\n${this.currentStore?.Phone || 'Store phone'}\n\n**Your Order Details:**\n${this.orderItems.map((item, index) => `${index + 1}. ${item.quantity}x ${item.name} - $${((item.price || 0) * item.quantity).toFixed(2)}`).join('\n')}\n📍 Delivery to: ${this.deliveryAddress}\n💰 Estimated total: $${(customerAmount + tipAmount).toFixed(2)}\n\n*The online link will take you directly to your local store where you can add the same items.*`;
        }
        
        // Other placement errors
        return `❌ **Order Placement Error**\n\nSorry, there was an error placing your order: ${errorMessage}.\n\nPlease try again or contact Domino's directly at ${this.currentStore?.Phone || 'the store phone'}.`;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle reCAPTCHA verification requirement at the top level too
      if (errorMessage.includes('recaptchaVerificationRequired')) {
        const storeDirectUrl = `https://www.dominos.com/en/pages/order/#!/locations/store/${this.currentStore?.StoreID}/`;
        
        return `🤖 **reCAPTCHA Verification Required**\n\nDomino's requires human verification to prevent automated orders. Please complete your order using one of these options:\n\n**🌐 Continue Your Order Online:**\n${storeDirectUrl}\n\n**📱 Domino's Mobile App:**\n• Download the Domino's app\n• Search for store: ${this.currentStore?.StoreID} in ${(this.deliveryAddress || '').split(',')[1]?.trim()}\n• Add your items and complete checkout\n\n**📞 Call to Order:**\n${this.currentStore?.Phone || 'Store phone'}\n\n**Your Order Details:**\n${this.orderItems.map((item, index) => `${index + 1}. ${item.quantity}x ${item.name} - $${((item.price || 0) * item.quantity).toFixed(2)}`).join('\n')}\n📍 Delivery to: ${this.deliveryAddress}\n💰 Estimated total: $${this.calculateEstimatedTotal().toFixed(2)}\n\n*The online link will take you directly to your local store where you can add the same items.*`;
      }
      
      return `❌ **Order Error**\n\nSorry, there was an error placing your order: ${errorMessage}.\n\nPlease try again or contact Domino's directly.`;
    }
  }
}
