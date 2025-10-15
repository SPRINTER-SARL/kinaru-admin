import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

export interface UploadResult {
  fileName: string;
  downloadUrl: string;
  path: string;
}

class FileUploadService {
  /**
   * Upload a file to Firebase Storage
   * @param file File to upload
   * @param path Path in storage (e.g. 'expenses/receipts')
   */
  async uploadFile(file: File, path: string): Promise<UploadResult> {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file?.name||"unknown"}`;
    const fullPath = `${path}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    try {
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      return {
        fileName,
        downloadUrl,
        path: fullPath
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload multiple files to Firebase Storage
   * @param files Array of files to upload
   * @param path Base path in storage
   */
  async uploadMultipleFiles(files: File[], path: string): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, path));
    return Promise.all(uploadPromises);
  }
}

export const fileUploadService = new FileUploadService();