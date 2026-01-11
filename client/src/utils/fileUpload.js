// Utility function to convert file to base64 (for preview/URL)
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Handle file selection - returns base64 string for preview/upload
export const handleFileSelect = async (file) => {
  if (!file) return null;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }
  
  try {
    const base64 = await fileToBase64(file);
    return base64;
  } catch (error) {
    throw new Error('Error reading file', error);
  }
};

