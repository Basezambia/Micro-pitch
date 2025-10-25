import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, uploadJSON, getContent, testAuthentication } from '@/lib/pinata';

export async function POST(request: NextRequest) {
  try {
    // Check if request contains form data (file upload) or JSON data
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      
      if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 });
      }

      const result = await uploadFile(file, {
        name: name || file.name,
        metadata: description ? { description } : undefined,
      });

      return NextResponse.json({
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
      });
    } else {
      // Handle JSON upload or legacy base64 file upload
      const { type, data, name, description } = await request.json();

      if (!type || !data) {
        return NextResponse.json({ error: 'Type and data are required' }, { status: 400 });
      }

      let result;

      switch (type) {
        case 'upload_json':
          result = await uploadJSON(data, {
            name: name || 'JSON Data',
            metadata: description ? { description } : undefined,
          });
          break;

        case 'upload_file':
          // Handle legacy base64 file upload
          const base64Data = data.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          const file = new File([blob], name || 'uploaded-file.png', { type: 'image/png' });

          result = await uploadFile(file, {
            name: name || 'Uploaded File',
            metadata: description ? { description } : undefined,
          });
          break;

        default:
          return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
      });
    }
  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload to IPFS',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');
    const action = searchParams.get('action');

    if (!hash) {
      return NextResponse.json({ error: 'IPFS hash is required' }, { status: 400 });
    }

    switch (action) {
      case 'test':
        // Test Pinata authentication
        const isAuthenticated = await testAuthentication();
        return NextResponse.json({ authenticated: isAuthenticated });

      default:
        // Get content from IPFS
        const data = await getContent(hash);
        return NextResponse.json({ data });
    }
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch from IPFS',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}