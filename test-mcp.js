#!/usr/bin/env node

// Simple test script to verify the MCP server starts correctly
const { spawn } = require('child_process');

console.log('Testing Domino\'s Pizza MCP Server...\n');

const mcpServer = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

mcpServer.stdout.on('data', (data) => {
  output += data.toString();
});

mcpServer.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Send initialization request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {}
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

// Send tools/list request
setTimeout(() => {
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  
  mcpServer.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 1000);

// Check results after 3 seconds
setTimeout(() => {
  mcpServer.kill();
  
  console.log('=== Server Error Output ===');
  console.log(errorOutput);
  
  console.log('\n=== Server Output ===');
  console.log(output);
  
  if (errorOutput.includes('Domino\'s Pizza MCP server running')) {
    console.log('\n✅ SUCCESS: MCP server started correctly!');
  } else {
    console.log('\n❌ FAILED: MCP server did not start properly');
  }
  
  if (output.includes('order_pizza')) {
    console.log('✅ SUCCESS: Tools are properly registered!');
  } else {
    console.log('❌ FAILED: Tools not found in response');
  }
  
  process.exit(0);
}, 3000);

mcpServer.on('error', (error) => {
  console.error('❌ Error starting MCP server:', error);
  process.exit(1);
});
