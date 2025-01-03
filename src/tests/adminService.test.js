// import test from 'ava';
// import sinon from 'sinon';
// import AdminService from '../services/adminService.js'
// import Terminal from '../models/terminal.js';
// import Locker from '../models/locker.js';

// test('AdminService - createTerminal - Success', async t => {
//   const terminalRepositoryMock = {
//     saveTerminal: sinon.stub().resolves({
//       terminalId: 'unique-terminal-id',
//       name: 'Test Terminal',
//       address: '123 Terminal Street',
//     }),
//   };

//   const loggerMock = {
//     info: sinon.stub(),
//   };

//   const adminService = new AdminService(terminalRepositoryMock, loggerMock);

//   const lockersMock = {
//     small: { count: 2, dimensions: '10x10', products: [] },
//     large: { count: 1, dimensions: '20x20', products: [{ id: 1, name: 'Product A' }] },
//   };

//   const terminalData = {
//     name: 'Test Terminal',
//     status: 'active',
//     latitude: 12.971598,
//     longitude: 77.594566,
//     address: '123 Terminal Street',
//     basePrice: 50,
//     password: 'securepassword123',
//     additionalPrices: [10, 20],
//     lockers: lockersMock,
//     bluetoothMacId: '00:1A:7D:DA:71:11',
//     dropPaymentRequired: true,
//     faceIdRequired: true,
//     supportedCountries: ['India', 'USA'],
//     paymentInfo: { provider: 'Stripe' },
//     hardwareCommunication: true,
//   };

//   const result = await adminService.createTerminal(
//     terminalData.name,
//     terminalData.status,
//     terminalData.latitude,
//     terminalData.longitude,
//     terminalData.address,
//     terminalData.basePrice,
//     terminalData.password,
//     terminalData.additionalPrices,
//     terminalData.lockers,
//     terminalData.bluetoothMacId,
//     terminalData.dropPaymentRequired,
//     terminalData.faceIdRequired,
//     terminalData.supportedCountries,
//     terminalData.paymentInfo,
//     terminalData.hardwareCommunication
//   );

//   t.is(result.name, 'Test Terminal');
//   t.true(loggerMock.info.calledOnce);
// });

// test('AdminService - createTerminal - Missing Fields', async t => {
//   const terminalRepositoryMock = {};
//   const loggerMock = { info: sinon.stub() };

//   const adminService = new AdminService(terminalRepositoryMock, loggerMock);

//   const lockersMock = {};

//   try {
//     await adminService.createTerminal(
//       '', // Missing name
//       'active',
//       12.971598,
//       77.594566,
//       '', // Missing address
//       null,
//       null,
//       [10, 20],
//       lockersMock,
//       '00:1A:7D:DA:71:11',
//       true,
//       true,
//       ['India', 'USA'],
//       { provider: 'Stripe' },
//       true
//     );
//   } catch (error) {
//     t.is(error.type, 'MISSING_FIELDS');
//     t.regex(error.message, /Missing fields: name, address, password/);
//   }
// });

// test('AdminService - createTerminal - Missing Base Price', async t => {
//   const terminalRepositoryMock = {};
//   const loggerMock = { info: sinon.stub() };

//   const adminService = new AdminService(terminalRepositoryMock, loggerMock);

//   const lockersMock = {
//     small: { count: 2, dimensions: '10x10', products: [] },
//   };

//   try {
//     await adminService.createTerminal(
//       'Test Terminal',
//       'active',
//       12.971598,
//       77.594566,
//       '123 Terminal Street',
//       null, // Missing basePrice
//       'securepassword123',
//       [10, 20],
//       lockersMock,
//       '00:1A:7D:DA:71:11',
//       true,
//       true,
//       ['India', 'USA'],
//       { provider: 'Stripe' },
//       true
//     );
//   } catch (error) {
//     t.is(error.type, 'MISSING_BASE_PRICE');
//     t.is(error.message, 'basePrice is required when no products are present in lockers');
//   }
// });

// test('AdminService - getTerminal - Success', async t => {
//   const terminalRepositoryMock = {
//     findTerminalByTerminalId: sinon.stub().resolves({
//       terminalId: 'unique-terminal-id',
//       name: 'Test Terminal',
//       address: '123 Terminal Street',
//     }),
//   };

//   const loggerMock = { debug: sinon.stub() };

//   const adminService = new AdminService(terminalRepositoryMock, loggerMock);

//   const result = await adminService.getTerminal('unique-terminal-id');

//   t.is(result.name, 'Test Terminal');
//   t.true(loggerMock.debug.calledOnce);
// });

// test('AdminService - getTerminal - Missing Terminal ID', async t => {
//   const terminalRepositoryMock = {};
//   const loggerMock = { debug: sinon.stub() };

//   const adminService = new AdminService(terminalRepositoryMock, loggerMock);

//   try {
//     await adminService.getTerminal(null);
//   } catch (error) {
//     t.is(error.type, 'MISSING_TERMINAL_ID');
//     t.is(error.message, 'Terminal ID is missing');
//   }
// });

// test('AdminService - getTerminal - Terminal Not Found', async t => {
//   const terminalRepositoryMock = {
//     findTerminalByTerminalId: sinon.stub().returns(null),
//   };

//   const loggerMock = { debug: sinon.stub() };

//   const adminService = new AdminService(terminalRepositoryMock, loggerMock);

//   try {
//     await adminService.getTerminal('non-existent-id');
//   } catch (error) {
//     t.is(error.type, 'TERMINAL_NOT_FOUND');
//     t.is(error.message, 'Terminal Not Found');
//   }
// });
