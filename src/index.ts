#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DominosOrderService } from './dominos-service.js';

// Zod schemas for tool parameters
const OrderPizzaSchema = z.object({
  action: z.enum(['start', 'find_store', 'get_menu', 'add_item', 'remove_item', 'get_summary', 'set_customer_info', 'place_order']),
  address: z.string().optional(),
  item_name: z.string().optional(),
  item_code: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().default(1).optional(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  customer_email: z.string().optional(),
  payment_info: z.object({
    card_number: z.string(),
    expiration: z.string(),
    cvv: z.string(),
    zip_code: z.string()
  }).optional(),
  tip_amount: z.number().optional(),
  menu_category: z.string().optional(),
  remove_index: z.number().optional()
});

class DominosMCPServer {
  private server: Server;
  private orderService: DominosOrderService;

  constructor() {
    this.server = new Server(
      {
        name: 'dominos-pizza-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.orderService = new DominosOrderService();
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'order_pizza',
          description: `Order Domino's pizza for delivery via natural conversation. This tool handles the complete ordering flow:
          
          Actions available:
          - start: Begin a new order session
          - find_store: Find nearest delivery store for an address
          - get_menu: Get menu for current store (optionally filtered by category)
          - add_item: Add an item to the order
          - remove_item: Remove an item from the order
          - get_summary: Get current order summary with pricing
          - set_customer_info: Set customer details (name, phone, email)
          - place_order: Complete the order with payment information
          
          The tool maintains order state across calls within a session.`,
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['start', 'find_store', 'get_menu', 'add_item', 'remove_item', 'get_summary', 'set_customer_info', 'place_order'],
                description: 'The action to perform'
              },
              address: {
                type: 'string',
                description: 'Full delivery address (street, city, state, zip)'
              },
              item_name: {
                type: 'string',
                description: 'Name of the menu item to add'
              },
              item_code: {
                type: 'string',
                description: 'Internal product code (if known)'
              },
              size: {
                type: 'string',
                description: 'Size for the item (Small, Medium, Large, etc.)'
              },
              quantity: {
                type: 'number',
                description: 'Quantity of items to add',
                default: 1
              },
              customer_name: {
                type: 'string',
                description: 'Customer name for delivery'
              },
              customer_phone: {
                type: 'string',
                description: 'Customer phone number'
              },
              customer_email: {
                type: 'string',
                description: 'Customer email address'
              },
              payment_info: {
                type: 'object',
                properties: {
                  card_number: { type: 'string', description: 'Credit card number (no spaces/dashes)' },
                  expiration: { type: 'string', description: 'Expiration date (MM/YY format)' },
                  cvv: { type: 'string', description: 'CVV security code' },
                  zip_code: { type: 'string', description: 'Billing ZIP code' }
                },
                description: 'Payment information for order'
              },
              tip_amount: {
                type: 'number',
                description: 'Tip amount in dollars'
              },
              menu_category: {
                type: 'string',
                description: 'Filter menu by category (Pizza, Sides, Drinks, etc.)'
              },
              remove_index: {
                type: 'number',
                description: 'Index of item to remove from order'
              }
            },
            required: ['action']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'order_pizza') {
        try {
          const validatedArgs = OrderPizzaSchema.parse(args);
          const result = await this.handleOrderPizza(validatedArgs);
          
          return {
            content: [
              {
                type: 'text',
                text: result
              }
            ]
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
            );
          }
          throw new McpError(
            ErrorCode.InternalError,
            `Error processing order: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    });
  }

  private async handleOrderPizza(args: z.infer<typeof OrderPizzaSchema>): Promise<string> {
    switch (args.action) {
      case 'start':
        return this.orderService.startNewOrder();

      case 'find_store':
        if (!args.address) {
          throw new Error('Address is required for find_store action');
        }
        return await this.orderService.findStore(args.address);

      case 'get_menu':
        return await this.orderService.getMenu(args.menu_category);

      case 'add_item':
        if (!args.item_name) {
          throw new Error('Item name is required for add_item action');
        }
        return await this.orderService.addItem(
          args.item_name,
          args.size,
          args.quantity || 1,
          args.item_code
        );

      case 'remove_item':
        if (args.remove_index === undefined) {
          throw new Error('Remove index is required for remove_item action');
        }
        return this.orderService.removeItem(args.remove_index);

      case 'get_summary':
        return await this.orderService.getOrderSummary();

      case 'set_customer_info':
        return this.orderService.setCustomerInfo(
          args.customer_name,
          args.customer_phone,
          args.customer_email
        );

      case 'place_order':
        if (!args.payment_info) {
          throw new Error('Payment information is required for place_order action');
        }
        return await this.orderService.placeOrder(
          args.payment_info,
          args.tip_amount || 5.00
        );

      default:
        throw new Error(`Unknown action: ${args.action}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Domino\'s Pizza MCP server running on stdio');
  }
}

// Start the server
const server = new DominosMCPServer();
server.run().catch(console.error);
