const assert = require('assert');

const { isValidObjectId, isValidBody, isValidId, isValid } = require('../../../validators/validator'); // Replace 'your-file' with the actual file path

describe('isValidObjectId', () => {
  it('should return true for a valid ObjectId', () => {
    const validObjectId = '5f9842be7f4fc31e84f89911'; // Replace with a valid ObjectId
    assert.strictEqual(isValidObjectId(validObjectId), true);
  });

  it('should return false for an invalid ObjectId', () => {
    const invalidObjectId = 'invalidObjectId';
    assert.strictEqual(isValidObjectId(invalidObjectId), false);
  });
});

// Test cases for isValidBody
describe('isValidBody', () => {
  it('should return true for an empty body', () => {
    const emptyBody = {};
    assert.strictEqual(isValidBody(emptyBody), true);
  });

  it('should return false for a non-empty body', () => {
    const nonEmptyBody = { key: 'value' };
    assert.strictEqual(isValidBody(nonEmptyBody), false);
  });
});

// Test cases for isValidId
describe('isValidId', () => {
  it('should return true for a valid ObjectId', () => {
    const validObjectId = '5f9842be7f4fc31e84f89911'; // Replace with a valid ObjectId
    assert.strictEqual(isValidId(validObjectId), true);
  });

  it('should return false for an invalid ObjectId', () => {
    const invalidObjectId = 'invalidObjectId';
    assert.strictEqual(isValidId(invalidObjectId), false);
  });
});

// Test cases for isValid
describe('isValid', () => {
  it('should return true for undefined or null', () => {
    assert.strictEqual(isValid(undefined), true);
    assert.strictEqual(isValid(null), false);
  });

  it('should return true for a non-empty string', () => {
    const nonEmptyString = 'hello';
    assert.strictEqual(isValid(nonEmptyString), true);
  });

  it('should return true for an empty object', () => {
    const emptyObject = {};
    assert.strictEqual(isValid(emptyObject), true);
  });

  it('should return false for other cases', () => {
    assert.strictEqual(isValid(0), false);
    assert.strictEqual(isValid(false), false);
  });
});
