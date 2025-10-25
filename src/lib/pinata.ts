import pinataSDK from '@pinata/sdk';

// Initialize Pinata SDK with v2 API
const pinata = new pinataSDK({
  pinataJWTKey: process.env.PINATA_JWT!,
});

export interface UploadOptions {
  name?: string;
  metadata?: Record<string, string | number>;
  groupId?: string;
}

export interface UploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload a file to IPFS via Pinata (v2 SDK)
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResponse> {
  try {
    // Convert File to Buffer for v2 SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const pinataOptions: any = {
      pinataMetadata: {
        name: options.name || file.name,
      },
    };
    
    // Add keyvalues if metadata is provided
    if (options.metadata && Object.keys(options.metadata).length > 0) {
      pinataOptions.pinataMetadata.keyvalues = options.metadata;
    }
    
    const result = await pinata.pinFileToIPFS(buffer, pinataOptions);
    return result;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Upload JSON data to IPFS via Pinata (v2 SDK)
 */
export async function uploadJSON(
  data: any,
  options: UploadOptions = {}
): Promise<UploadResponse> {
  try {
    const pinataOptions: any = {
      pinataMetadata: {
        name: options.name || 'JSON Upload',
      },
    };
    
    // Add keyvalues if metadata is provided
    if (options.metadata && Object.keys(options.metadata).length > 0) {
      pinataOptions.pinataMetadata.keyvalues = options.metadata;
    }
    
    const result = await pinata.pinJSONToIPFS(data, pinataOptions);
    return result;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new Error('Failed to upload JSON to IPFS');
  }
}

/**
 * Get content from IPFS via Pinata gateway
 */
export async function getContent(cid: string): Promise<any> {
  try {
    const gatewayUrl = convertToGatewayUrl(cid);
    const response = await fetch(gatewayUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Try to parse as JSON, fallback to text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error fetching content from IPFS:', error);
    throw new Error('Failed to fetch content from IPFS');
  }
}

/**
 * Convert CID to gateway URL
 */
export function convertToGatewayUrl(cid: string): string {
  return `https://${process.env.PINATA_GATEWAY}/ipfs/${cid}`;
}

/**
 * Create a signed URL for secure access (not available in v2 SDK)
 */
export async function createSignedURL(
  cid: string,
  expiresIn: number = 3600
): Promise<string> {
  // v2 SDK doesn't support signed URLs, return regular gateway URL
  console.warn('Signed URLs not supported in Pinata SDK v2, returning regular gateway URL');
  return convertToGatewayUrl(cid);
}

/**
 * List files uploaded to Pinata (v2 SDK)
 */
export async function listFiles(
  options: {
    limit?: number;
    offset?: number;
    name?: string;
    cid?: string;
    groupId?: string;
  } = {}
): Promise<any> {
  try {
    const filters: any = {
      status: 'pinned',
      pageLimit: options.limit || 10,
      pageOffset: options.offset || 0,
    };
    
    if (options.name) {
      filters.metadata = { name: options.name };
    }
    
    const result = await pinata.pinList(filters);
    return result;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
}

/**
 * Unpin/delete a file from Pinata (v2 SDK)
 */
export async function unpinFile(ipfsHash: string): Promise<void> {
  try {
    await pinata.unpin(ipfsHash);
  } catch (error) {
    console.error('Error unpinning file:', error);
    throw new Error('Failed to unpin file');
  }
}

/**
 * Test Pinata authentication (v2 SDK)
 */
export async function testAuthentication(): Promise<boolean> {
  try {
    await pinata.testAuthentication();
    return true;
  } catch (error) {
    console.error('Pinata authentication failed:', error);
    return false;
  }
}

export default pinata;