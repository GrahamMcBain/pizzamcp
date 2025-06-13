# Domino's Pizza MCP Server - Agent Configuration

## Project Commands

### Development
- `npm run dev` - Run in development mode with auto-reload
- `npm run build` - Build TypeScript to JavaScript  
- `npm run start` - Run the built server
- `npm run watch` - Watch mode for development

### Testing
- `npm run test` - Run tests
- `node test-mcp.js` - Test MCP server functionality

### Installation
- `npm install` - Install dependencies
- `npm link` - Link for global usage during development

## Code Structure

### Main Files
- `src/index.ts` - MCP server implementation and tool registration
- `src/dominos-service.ts` - Core pizza ordering service logic
- `src/types.ts` - TypeScript type definitions
- `src/dominos.d.ts` - Type declarations for dominos npm package

### Key Dependencies
- `@modelcontextprotocol/sdk` - MCP framework
- `dominos` - Unofficial Domino's API library
- `zod` - Runtime type validation

## Project Architecture

The MCP server exposes a single `order_pizza` tool that handles multiple actions:
- Session management (start new orders)
- Store locator (find delivery stores by address)
- Menu browsing (get categorized menu items)
- Cart management (add/remove items)
- Customer info collection
- Order placement with payment processing

## Security Notes

- All operations run locally
- Payment info is passed through but not stored
- Direct HTTPS calls to Domino's APIs
- No persistent data storage

## Development Guidelines

- Follow existing TypeScript patterns
- Use Zod schemas for validation
- Handle errors gracefully with user-friendly messages
- Maintain conversational tone in responses
- Format output with markdown for readability
