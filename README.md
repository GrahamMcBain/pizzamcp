# Domino's Pizza MCP Server 🍕

A Model Context Protocol (MCP) server that enables ordering Domino's pizza through conversational AI interfaces like Sourcegraph Amp.

## Features

- 🗺️ **Store Locator**: Find nearest Domino's delivery stores by address
- 📋 **Menu Browser**: Browse categories and search for specific items
- 🛒 **Order Management**: Add/remove items, manage cart state
- 💳 **Secure Payment**: Process orders with credit card payment
- 📱 **Order Tracking**: Get order confirmation and tracking info
- 🚚 **Delivery Only**: Focused on delivery orders (not pickup)

## Prerequisites

- Node.js 18.0.0 or higher
- A compatible MCP client (like Sourcegraph Amp, Claude Desktop, etc.)

## Installation

### Option 1: Install from npm (Recommended)

```bash
npm install -g pizzamcp
```

### Option 2: Install from source

```bash
git clone https://github.com/your-username/pizzamcp.git
cd pizzamcp
npm install
npm run build
npm link
```

## Configuration

### For Sourcegraph Amp (VS Code extension) Signup for Amp here: http://ampcode.com/

Add the following to your Amp MCP server dashboard:

```
Server Name:
pizzamcp

Command or URL:
npx

Arguments:
pizzamcp
```

### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dominos": {
      "command": "npx",
      "args": ["-y", "pizzamcp"]
    }
  }
}
```

## Usage

Once configured, you can start ordering pizza through natural conversation with your AI assistant:

### Example Conversation Flow

**User**: "I'm hungry, can you help me order a pizza delivery to 1600 Amphitheatre Parkway, Mountain View, CA?"

**AI**: _Uses the MCP server to find stores and start the ordering process_

**User**: "Show me the pizza menu"

**AI**: _Displays available pizzas with prices_

**User**: "I'll take a large pepperoni pizza and some garlic bread"

**AI**: _Adds items to the order_

**User**: "What's my total?"

**AI**: _Shows order summary with pricing_

**User**: "Place the order. My name is John Smith, phone 555-1234, email john@example.com. Card number 4111111111111111, expires 12/25, CVV 123, ZIP 94043"

**AI**: _Processes the order and provides confirmation_

### Available Actions

The MCP server provides a single `order_pizza` tool with these actions:

- **start**: Begin a new order session
- **find_store**: Find nearest delivery store for an address
- **get_menu**: Get menu for current store (optionally filtered by category)
- **add_item**: Add an item to the order
- **remove_item**: Remove an item from the order
- **get_summary**: Get current order summary with pricing
- **set_customer_info**: Set customer details (name, phone, email)
- **place_order**: Complete the order with payment information

## Security & Privacy

- **Local Processing**: All operations run locally on your machine
- **Direct API Calls**: Connects directly to Domino's APIs over HTTPS
- **No Data Storage**: No sensitive information is persisted to disk
- **Session Based**: Order data exists only during the conversation

⚠️ **Important**: Your payment information will be visible to the AI model during the conversation. Only use this tool if you trust your AI provider's data handling practices.

## Technical Details

### Dependencies

- **@modelcontextprotocol/sdk**: MCP framework for tool integration
- **dominos**: Node.js library for Domino's API interaction
- **zod**: Runtime type validation

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Client     │    │   MCP Server     │    │   Domino's API  │
│  (Amp/Claude)   │◄──►│  (This Package)  │◄──►│   (dominos.com) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

The MCP server maintains order state in memory and translates between:
- Natural language requests from the AI
- Structured API calls to Domino's services
- Formatted responses back to the user

## Development

### Setup Development Environment

```bash
git clone https://github.com/your-username/pizzamcp.git
cd pizzamcp
npm install
```

### Available Scripts

```bash
npm run dev        # Run in development mode with auto-reload
npm run build      # Build TypeScript to JavaScript
npm run start      # Run the built server
npm run test       # Run tests
npm run watch      # Watch mode for development
```

### Testing

```bash
# Install the MCP Inspector for testing
npm install -g @modelcontextprotocol/inspector

# Test the server
mcp-inspector pizzamcp
```

## API Reference

### Tool: order_pizza

**Parameters:**
- `action` (required): The action to perform
- `address`: Full delivery address for store lookup
- `item_name`: Name of menu item to add
- `size`: Size specification (Small, Medium, Large, etc.)
- `quantity`: Number of items (default: 1)
- `customer_name`: Customer name for delivery
- `customer_phone`: Customer phone number
- `customer_email`: Customer email address
- `payment_info`: Object containing card details
- `tip_amount`: Tip amount in dollars
- `menu_category`: Filter menu by category
- `remove_index`: Index of item to remove

## Limitations

- **US Only**: Currently supports US Domino's locations only
- **Delivery Only**: No pickup or dine-in options
- **Credit Card Only**: No support for cash, gift cards, or other payment methods
- **No Order History**: Each session is independent with no persistence
- **Guest Orders Only**: No Domino's account integration
- **Basic Customization**: Limited pizza customization options

## Troubleshooting

### Common Issues

**"No stores found"**
- Verify the address is complete and correctly formatted
- Make sure you're in an area served by Domino's delivery
- Try a different address format (add ZIP code, state abbreviation)

**"Menu loading failed"**
- Ensure you have a valid internet connection
- The selected store may be temporarily offline
- Try finding a different store location

**"Order placement failed"**
- Verify all payment information is correct
- Check that card number, expiration, and ZIP code match
- Ensure the store is still open and accepting orders

**"MCP server not starting"**
- Make sure Node.js 18+ is installed
- Verify the package is correctly installed
- Check your MCP client configuration

### Debug Mode

Run with debug logging:

```bash
DEBUG=pizzamcp npx pizzamcp
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Disclaimer

This tool uses Domino's unofficial API through reverse-engineered endpoints. While this API has been stable for years, it's not officially supported by Domino's Pizza. Use at your own discretion.

The authors are not responsible for any issues with orders, payments, or food quality. For official support, contact Domino's directly.

## Acknowledgments

- [node-dominos-pizza-api](https://github.com/RIAEvangelist/node-dominos-pizza-api) - The underlying Domino's API library
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol this server implements
- [Sourcegraph Amp](https://sourcegraph.com/amp) - The AI coding assistant that inspired this project
