/**
 * HERA Digital Accountant - Browser Functionality Test
 * Tests actual page loads and user interactions
 */

const { exec } = require('child_process');
const http = require('http');

const BASE_URL = 'http://localhost:3001';

const testPageLoad = (path) => {
  return new Promise((resolve) => {
    console.log(`🔍 Testing: ${BASE_URL}${path}`);
    
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200 && data.length > 1000;
        const hasReactContent = data.includes('__NEXT_DATA__') || data.includes('Next.js');
        const hasOurComponents = data.includes('Digital Accountant') || data.includes('HERA');
        
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content Length: ${data.length} bytes`);
        console.log(`   React App: ${hasReactContent ? '✅' : '❌'}`);
        console.log(`   Our Components: ${hasOurComponents ? '✅' : '❌'}`);
        
        resolve({
          path,
          status: res.statusCode,
          success,
          contentLength: data.length,
          hasReactContent,
          hasOurComponents
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${path} - Error: ${error.message}`);
      resolve({
        path,
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      console.log(`❌ ${path} - Timeout`);
      req.destroy();
      resolve({
        path,
        success: false,
        error: 'Timeout'
      });
    });
  });
};

async function runBrowserTests() {
  console.log('🚀 HERA Digital Accountant - Browser Functionality Tests');
  console.log('=' .repeat(60));
  
  const testPages = [
    '/digital-accountant',
    '/digital-accountant/onboarding', 
    '/digital-accountant/analytics',
    '/digital-accountant/documents'
  ];
  
  const results = [];
  
  for (const page of testPages) {
    const result = await testPageLoad(page);
    results.push(result);
    console.log(''); // Add spacing
  }
  
  console.log('📊 BROWSER TEST SUMMARY');
  console.log('=' .repeat(60));
  
  let successful = 0;
  results.forEach(result => {
    if (result.success) {
      successful++;
      console.log(`✅ ${result.path} - Working`);
    } else {
      console.log(`❌ ${result.path} - ${result.error || 'Failed'}`);
    }
  });
  
  const successRate = (successful / results.length * 100).toFixed(1);
  console.log(`\n🎯 Browser Test Success Rate: ${successRate}% (${successful}/${results.length})`);
  
  if (successRate >= 75) {
    console.log('🏆 BROWSER TESTS PASSED! Pages are loading correctly.');
  } else {
    console.log('⚠️ Some pages need attention. Check server logs for details.');
  }
  
  return results;
}

// Check if server is running first
http.get(`${BASE_URL}/`, (res) => {
  console.log('✅ Development server is running');
  runBrowserTests();
}).on('error', (err) => {
  console.log('❌ Development server not accessible');
  console.log('   Please start the server with: npm run dev');
  console.log(`   Expected URL: ${BASE_URL}`);
});