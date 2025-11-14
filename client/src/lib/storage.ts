/**
 * Client-side storage helper
 * This module provides utilities for uploading files to S3 via the backend API
 */

export async function storagePut(
  file: File,
  options?: {
    onProgress?: (progress: number) => void;
  }
): Promise<{ fileKey: string; fileUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function storageGet(
  fileKey: string,
  options?: {
    expiresIn?: number;
  }
): Promise<string> {
  const response = await fetch(`/api/download?key=${encodeURIComponent(fileKey)}`);

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}
