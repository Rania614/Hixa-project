/**
 * MongoDB ObjectId Validation Utility
 * 
 * MongoDB ObjectIds are 24-character hexadecimal strings.
 * Format: 24 hex characters (0-9, a-f, A-F)
 * Example: "507f1f77bcf86cd799439011"
 */

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The ID to validate
 * @returns true if valid ObjectId, false otherwise
 */
export function isValidObjectId(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // MongoDB ObjectId must be exactly 24 hexadecimal characters
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

/**
 * Validates and throws an error if ID is invalid
 * @param id - The ID to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if ID is invalid
 */
export function validateObjectId(id: string | null | undefined, fieldName: string = 'ID'): void {
  if (!isValidObjectId(id)) {
    const errorMessage = `Invalid MongoDB ObjectId for ${fieldName}: "${id}". Expected 24-character hexadecimal string.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

