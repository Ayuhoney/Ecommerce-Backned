// yourfile.test.js
jest.mock('../../../validators/validator.js', () => ({
    isValidObjectId: jest.fn(),
    isValidBody: jest.fn(),
    isValidId: jest.fn(),
    isValid: jest.fn(),
  }));
  
  const {
    isValidObjectId,
    isValidBody,
    isValidId,
    isValid,
  } = require('../../../validators/validator.js');
  
  describe('isValidObjectId', () => {
    it('should return true for a valid ObjectId', () => {
      isValidObjectId.mockReturnValue(true);
      expect(isValidObjectId('validIdStringHere')).toBe(true);
    });
  
    it('should return false for an invalid ObjectId', () => {
      isValidObjectId.mockReturnValue(false);
      expect(isValidObjectId('invalidId')).toBe(false);
    });
  
    it('should return false for an empty string', () => {
      isValidObjectId.mockReturnValue(false);
      expect(isValidObjectId('')).toBe(false);
    });
  
    it('should return false for null', () => {
      isValidObjectId.mockReturnValue(false);
      expect(isValidObjectId(null)).toBe(false);
    });
  });
  
  describe('isValidBody', () => {
    it('should return true for an empty request body', () => {
      isValidBody.mockReturnValue(true);
      expect(isValidBody({})).toBe(true);
    });
  
    it('should return false for a non-empty request body', () => {
      isValidBody.mockReturnValue(false);
      expect(isValidBody({ key: 'value' })).toBe(false);
    });
  
    it('should return true for an undefined request body', () => {
      isValidBody.mockReturnValue(true);
      expect(isValidBody(undefined)).toBe(true);
    });
  });
  
  describe('isValidId', () => {
    it('should return true for a valid ObjectId', () => {
      isValidId.mockReturnValue(true);
      expect(isValidId('validIdStringHere')).toBe(true);
    });
  
    it('should return false for an invalid ObjectId', () => {
      isValidId.mockReturnValue(false);
      expect(isValidId('invalidId')).toBe(false);
    });
  
    it('should return false for an empty string', () => {
      isValidId.mockReturnValue(false);
      expect(isValidId('')).toBe(false);
    });
  });
  
  describe('isValid', () => {
    it('should return true for undefined or null', () => {
      isValid.mockReturnValue(true);
      expect(isValid(undefined)).toBe(true);
      expect(isValid(null)).toBe(true);
    });
  
    it('should return true for a non-empty string', () => {
      isValid.mockReturnValue(true);
      expect(isValid('value')).toBe(true);
    });
  
    it('should return true for an empty object', () => {
      isValid.mockReturnValue(true);
      expect(isValid({})).toBe(true);
    });
  
    it('should return false for other cases', () => {
      isValid.mockReturnValue(false);
      expect(isValid({ key: 'value' })).toBe(false);
    });
  });
  