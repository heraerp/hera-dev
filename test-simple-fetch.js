// Simple fetch test
const baseURL = 'http://localhost:3000';
const organizationId = '123e4567-e89b-12d3-a456-426614174000';

async function testFetch() {
  try {
    console.log('Testing fetch...');
    const response = await fetch(`${baseURL}/api/purchasing/suppliers?organizationId=${organizationId}`);
    console.log('Response status:', response.status);
    
    const text = await response.text();
    console.log('Response text length:', text.length);
    console.log('First 100 chars:', text.substring(0, 100));
    
    if (text.startsWith('{')) {
      const data = JSON.parse(text);
      console.log('Parsed JSON successfully');
      console.log('Suppliers found:', data.data?.length || 0);
    } else {
      console.log('Response is not JSON');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFetch();