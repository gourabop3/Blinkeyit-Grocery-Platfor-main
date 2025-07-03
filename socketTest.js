#!/usr/bin/env node
/*
  socketTest.js – CLI utility to validate Blinkey WebSocket flow without a browser

  Usage example:
    node socketTest.js \
      --backend http://localhost:5000 \
      --secret MY_SECRET_KEY_JWT \
      --customerId 665199d8b1c6c3d2c6d2d3a1 \
      --adminId    665199d8b1c6c3d2c6d2d3a2 \
      --partnerId  665199d8b1c6c3d2c6d2d3a3 \
      --orderId    665199d8b1c6c3d2c6d2d3a4

  The script will:
    • Generate JWTs for customer, admin and partner
    • Open three socket.io-client connections with proper userType values
    • Customer joins order room & requests update
    • Partner emits status_update and two location_update events
    • Verify customer & admin sockets receive those broadcasts (logged to stdout)
*/

const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('backend',    { type: 'string', demandOption: true, describe: 'Backend URL e.g. http://localhost:5000' })
  .option('secret',     { type: 'string', demandOption: true, describe: 'SECRET_KEY_JWT used by backend' })
  .option('customerId', { type: 'string', demandOption: true })
  .option('adminId',    { type: 'string', demandOption: true })
  .option('partnerId',  { type: 'string', demandOption: true })
  .option('orderId',    { type: 'string', demandOption: true })
  .help()
  .argv;

const { backend, secret, customerId, adminId, partnerId, orderId } = argv;

const sign = (id) => jwt.sign({ id }, secret, { expiresIn: '1d' });

function createSocket(name, token, userType) {
  const socket = io(backend, {
    auth: { token, userType },
    transports: ['websocket']
  });

  socket.on('connect', () => log(name, 'CONNECTED', { id: socket.id }));
  socket.on('disconnect', (reason) => log(name, 'DISCONNECTED', reason));
  socket.onAny((event, ...args) => {
    if (event === 'ping' || event === 'pong') return;
    log(name, event, args[0]);
  });

  return socket;
}

function log(prefix, event, payload = '') {
  const ts = new Date().toISOString().split('T')[1].replace('Z', '');
  console.log(`[${ts}] [${prefix}] ${event}`, payload);
}

// Create sockets
const customerSocket = createSocket('CUSTOMER', sign(customerId), 'customer');
const adminSocket    = createSocket('ADMIN',    sign(adminId),    'admin');
const partnerSocket  = createSocket('PARTNER',  sign(partnerId),  'partner');

// Customer joins room once connected
customerSocket.on('connect', () => {
  customerSocket.emit('join_order_tracking', orderId);
  customerSocket.emit('request_delivery_update', orderId);
});

// Partner emits test updates after connect
partnerSocket.on('connect', () => {
  // Step 1: status update to in_transit
  partnerSocket.emit('status_update', {
    orderId,
    status: 'in_transit',
    notes: 'Automated test status',
    location: { latitude: 28.6139, longitude: 77.2090 }
  });

  // Step 2–3: two location updates
  let lat = 28.6139;
  let lng = 77.2090;
  let sent = 0;
  const int = setInterval(() => {
    sent += 1;
    lat += 0.001;
    lng += 0.001;
    partnerSocket.emit('location_update', {
      orderId,
      latitude: lat,
      longitude: lng,
      speed: 35,
      heading: 90,
      accuracy: 5
    });
    if (sent === 2) {
      clearInterval(int);
      setTimeout(() => {
        log('TEST', 'Completed, closing sockets');
        [customerSocket, adminSocket, partnerSocket].forEach(s => s.close());
        process.exit(0);
      }, 1500);
    }
  }, 2000);
});