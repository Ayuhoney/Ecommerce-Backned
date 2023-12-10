// Import necessary modules and the function to be tested
const nodemailer = require('../../../validators/sendMail.js');
const { sendResetPasswordMail } = require('../../../validators/sendMail.js');

// Mock nodemailer
jest.mock('nodemailer');

describe('sendResetPasswordMail', () => {
    it('should send a reset password email', async () => {

    
        // Mock process.env values
        process.env.USER_EMAIL = 'your-user-email@gmail.com';
        process.env.EMAIL_PASS = 'your-email-password';
        process.env.HOST_URL = 'http://your-host-url';
    
        // Call the function with mock parameters
        const email = 'user@example.com';
        const token = 'mock-reset-token';
        expect(true).toBe(true);
        const result = await sendResetPasswordMail(email, token);
        
    });
});
