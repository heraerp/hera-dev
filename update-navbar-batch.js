/**
 * Batch update script to add navbar to remaining restaurant pages
 * Toyota Method: Standardized approach for consistent implementation
 */

const fs = require('fs')
const path = require('path')

const pagesToUpdate = [
  'app/restaurant/inventory/page.tsx',
  'app/restaurant/analytics/page.tsx',
  'app/restaurant/payments/page.tsx',
  'app/restaurant/staff/page.tsx',
  'app/restaurant/reports-universal/page.tsx',
  'app/restaurant/kitchen/page.tsx',
  'app/restaurant/manager/page.tsx',
  'app/restaurant/profile/page.tsx'
]

const navbarImport = "import { Navbar } from '@/components/ui/navbar'"
const navbarComponent = "      {/* Navigation Bar with User Info */}\n      <Navbar />\n      "

function updatePageWithNavbar(filePath) {
  const fullPath = path.join(__dirname, filePath)
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`)
      return
    }
    
    let content = fs.readFileSync(fullPath, 'utf8')
    
    // Skip if already has navbar
    if (content.includes(navbarImport)) {
      console.log(`✅ Already updated: ${filePath}`)
      return
    }
    
    // Add navbar import after other UI imports
    if (content.includes("import { Button }")) {
      content = content.replace(
        /(import { Button.*?}.*?\n)/,
        `$1${navbarImport}\n`
      )
    } else {
      // Add import at the top of imports
      content = content.replace(
        /(import.*?from 'react'.*?\n)/,
        `$1${navbarImport}\n`
      )
    }
    
    // Add navbar component after main div
    content = content.replace(
      /(return \(\s*<div className="min-h-screen.*?">\s*)/,
      `$1\n${navbarComponent}`
    )
    
    fs.writeFileSync(fullPath, content)
    console.log(`✅ Updated: ${filePath}`)
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message)
  }
}

console.log('🚀 Starting batch navbar update...')
pagesToUpdate.forEach(updatePageWithNavbar)
console.log('🎉 Batch update complete!')
