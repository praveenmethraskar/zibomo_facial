// import test from 'ava';
// import sinon from 'sinon';
// import OTPService from '../services/otpService.js';

// // Mock dependencies
// const otpRepositoryMock = {
//   storeOtp: sinon.stub(),
//   storeEmailOtp: sinon.stub(),
//   getOtp: sinon.stub(),
//   getEmailOtp: sinon.stub(),
// };

// const loggerMock = {
//   info: sinon.stub(),
//   debug: sinon.stub(),
//   error: sinon.stub(),
// };

// const smsHelperMock = {
//   sendMessage: sinon.stub(),
// };

// // Initialize OTPService with mocks
// const otpService = new OTPService(otpRepositoryMock, loggerMock);

// // Mocking environment variable
// process.env.NODE_ENV = 'development';

// test('OTPService - generateAndSendOTP - Development Environment', async (t) => {
//   const phone = '+919876543210';

//   const otp = await otpService.generateAndSendOTP(phone);

//   t.is(otp, '123456');
//   t.true(otpRepositoryMock.storeOtp.calledOnceWithExactly(phone, '123456'));
//   t.true(loggerMock.info.calledWithMatch(/Development environment: OTP is 123456\./));
// });

// test('OTPService - generateAndSendOTP - Production Environment', async (t) => {
//   process.env.NODE_ENV = 'production';
//   smsHelperMock.sendMessage.resolves();

//   const phone = '+919876543210';
//   const otpRegex = /^\d{6}$/;

//   const otp = await otpService.generateAndSendOTP(phone);

//   t.regex(otp, otpRegex);
//   t.true(otpRepositoryMock.storeOtp.calledOnceWithExactly(phone, otp));
//   t.true(loggerMock.info.calledWithMatch(/Sending message to phone: \+919876543210/));
//   t.true(smsHelperMock.sendMessage.calledOnceWithExactly(phone, otp));

//   process.env.NODE_ENV = 'development'; // Reset
// });

// test('OTPService - generateAndSendOTP - SMS Sending Error', async (t) => {
//   process.env.NODE_ENV = 'production';
//   const phone = '+919876543210';

//   smsHelperMock.sendMessage.rejects(new Error('SMS gateway not reachable'));

//   await t.throwsAsync(
//     async () => {
//       await otpService.generateAndSendOTP(phone);
//     },
//     { message: 'Failed to send OTP', type: 'SMS_ERROR' }
//   );

//   t.true(loggerMock.error.calledWithMatch(/Failed to send OTP to \+919876543210: SMS gateway not reachable/));
//   process.env.NODE_ENV = 'development'; // Reset
// });

// /*test('OTPService - validateOtp - Valid OTP', async (t) => {
//   const phone = '+919876543210';
//   const otp = '123456';

//   otpRepositoryMock.getOtp.resolves(otp);

//   const result = await otpService.validateOtp(phone, otp);
//   t.true(result);
// });

// test('OTPService - validateOtp - Invalid OTP', async (t) => {
//   const phone = '+919876543210';
//   const otp = '123456';

//   otpRepositoryMock.getOtp.resolves('654321');

//   await t.throwsAsync(
//     async () => {
//       await otpService.validateOtp(phone, otp);
//     },
//     { message: 'Invalid OTP', type: 'INVALID_OTP' }
//   );
// });*/

// test('OTPService - generateAndSendEmailOTP - Success', async (t) => {
//   const email = 'john.doe@example.com';
//   const emailOtpRegex = /^\d{6}$/;

//   const emailOtp = await otpService.generateAndSendEmailOTP(email);

//   t.regex(emailOtp, emailOtpRegex);
//   t.true(otpRepositoryMock.storeEmailOtp.calledOnceWithExactly(email, emailOtp));
//   t.true(loggerMock.info.calledWithMatch(new RegExp(`Email OTP generated for ${email}: \d{6}`)));
// });

// /*test('OTPService - validateEmailOtp - Valid OTP', async (t) => {
//   const phone = '+919876543210';
//   const emailOtp = '123456';

//   otpRepositoryMock.getEmailOtp.resolves(emailOtp);

//   const result = await otpService.validateEmailOtp(phone, emailOtp);
//   t.true(result);
// });

// test('OTPService - validateEmailOtp - Invalid OTP', async (t) => {
//   const phone = '+919876543210';
//   const emailOtp = '123456';

//   otpRepositoryMock.getEmailOtp.resolves('654321');

//   await t.throwsAsync(
//     async () => {
//       await otpService.validateEmailOtp(phone, emailOtp);
//     },
//     { message: 'Invalid Email OTP', type: 'INVALID_EMAIL_OTP' }
//   );
// });*/
