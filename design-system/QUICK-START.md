# 🚀 HERA Design System - Quick Start Guide

## **5-Minute Setup**

### **1. Copy Files to Your Project**
```bash
# Copy the entire design system
cp -r design-system/ src/styles/hera/

# Or include individual components
cp design-system/foundation/colors.css src/styles/
cp design-system/components/buttons.css src/styles/
```

### **2. Import in Your Main CSS**
```css
/* Import the complete system */
@import './styles/hera/index.css';

/* Or import selectively */
@import './styles/hera/foundation/colors.css';
@import './styles/hera/foundation/typography.css';
@import './styles/hera/utilities/glass-effects.css';
@import './styles/hera/components/buttons.css';
```

### **3. Update Your HTML**
```html
<!DOCTYPE html>
<html lang="en" data-theme="auto">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your App with HERA Design</title>
  <link rel="stylesheet" href="./styles/main.css">
</head>
<body>
  <!-- Your app content -->
</body>
</html>
```

---

## **🎨 Basic Usage Examples**

### **Enhanced Buttons**
```html
<!-- Primary action button -->
<button class="btn btn-primary btn-enhanced">
  Save Changes
</button>

<!-- Glass effect button -->
<button class="btn btn-ghost glass-moderate">
  Settings
</button>

<!-- Magnetic hover button -->
<button class="btn btn-secondary btn-magnetic">
  Hover Me
</button>
```

### **Glass Morphism Cards**
```html
<!-- Subtle glass card -->
<div class="glass-subtle" style="padding: 2rem; border-radius: 12px;">
  <h3 class="heading-golden-lg">Card Title</h3>
  <p class="text-adaptive">Beautiful glass effect card with perfect readability.</p>
</div>

<!-- Interactive glass card -->
<div class="glass-moderate glass-hoverable" style="padding: 2rem; border-radius: 12px;">
  <h3 class="heading-golden-lg">Hoverable Card</h3>
  <p class="text-adaptive">This card responds to hover interactions.</p>
</div>
```

### **Typography Scale**
```html
<!-- Golden ratio headings -->
<h1 class="heading-golden-4xl">Main Title</h1>
<h2 class="heading-golden-3xl">Section Header</h2>
<h3 class="heading-golden-2xl">Subsection</h3>

<!-- Special text effects -->
<p class="text-gradient">Gradient text effect</p>
<p class="text-shimmer">Animated shimmer text</p>
```

### **Layout Templates**
```html
<!-- Dashboard layout -->
<div class="layout-dashboard">
  <header class="dashboard-header glass-subtle">
    <nav>Navigation</nav>
  </header>
  <aside class="dashboard-sidebar glass-moderate">
    <div>Sidebar content</div>
  </aside>
  <main class="dashboard-main">
    <div class="card-grid">
      <!-- Cards here -->
    </div>
  </main>
</div>
```

---

## **🎯 Component Customization**

### **Custom Color Theme**
```css
/* Add to your CSS */
.theme-healthcare {
  --primary: 175 70% 45%;     /* Medical green */
  --accent: 200 80% 50%;      /* Trust blue */
  --success: 142 76% 38%;     /* Keep success green */
}
```

### **Custom Button Variant**
```css
.btn-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}
```

### **Custom Glass Effect**
```css
.glass-custom {
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

---

## **📱 Responsive Usage**

### **Mobile-First Cards**
```html
<div class="card-grid">
  <div class="glass-moderate" style="padding: 1.5rem; border-radius: 12px;">
    <h3 class="heading-golden-lg">Responsive Card</h3>
    <p class="text-adaptive">Automatically adapts to screen size</p>
  </div>
</div>
```

### **Responsive Typography**
```html
<!-- Automatically scales on mobile -->
<h1 class="heading-golden-4xl">This scales down on mobile</h1>
<p class="text-golden-md">This text is perfectly readable on all devices</p>
```

---

## **♿ Accessibility Features**

### **Focus Management**
```html
<!-- Enhanced focus rings -->
<button class="btn btn-primary focus-ring">
  Accessible Button
</button>

<!-- Skip links -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### **Screen Reader Support**
```html
<!-- Hidden content for screen readers -->
<span class="sr-only">Additional context for screen readers</span>

<!-- Proper ARIA labeling -->
<button aria-label="Close dialog" class="btn btn-icon">
  <span aria-hidden="true">×</span>
</button>
```

---

## **🎬 Animation Examples**

### **Hover Animations**
```html
<!-- Magnetic button -->
<button class="btn btn-primary btn-magnetic">Hover for magnetic effect</button>

<!-- Glow button -->
<button class="btn btn-secondary btn-glow">Hover for glow effect</button>

<!-- Enhanced button with ripple -->
<button class="btn btn-primary btn-enhanced">Click for ripple effect</button>
```

### **Glass Animations**
```html
<!-- Animated glass entrance -->
<div class="glass-moderate animate-glass-fade-in">
  <p>This glass effect fades in smoothly</p>
</div>

<!-- Shimmer effect -->
<div class="glass-moderate glass-shimmer-effect">
  <p>This has a subtle shimmer animation</p>
</div>
```

---

## **🔧 JavaScript Integration**

### **Theme Switching**
```javascript
// Theme toggle function
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme') || 'auto';
document.documentElement.setAttribute('data-theme', savedTheme);
```

### **Dynamic Glass Effects**
```javascript
// Add glass effect dynamically
function addGlassEffect(element) {
  element.classList.add('glass-moderate', 'glass-hoverable');
}

// Remove glass effect
function removeGlassEffect(element) {
  element.classList.remove('glass-moderate', 'glass-hoverable');
}
```

---

## **🎯 Best Practices**

### **Do's ✅**
- Use the golden ratio typography scale for consistent hierarchy
- Apply glass effects sparingly for maximum impact
- Combine button variants with enhancement classes
- Test with screen readers and keyboard navigation
- Use semantic HTML with HERA styling classes

### **Don'ts ❌**
- Don't override core color variables without consideration
- Don't apply multiple glass effects to the same element
- Don't disable animations without providing alternatives
- Don't use glass effects on text-heavy content
- Don't forget to test in high contrast mode

---

## **🚀 Production Deployment**

### **CSS Optimization**
```bash
# Purge unused CSS (if using PurgeCSS)
purgecss --css src/styles/hera/index.css --content src/**/*.html --output dist/css/

# Minify CSS
cssnano src/styles/hera/index.css dist/css/hera.min.css
```

### **Performance Tips**
- Load design system CSS in the `<head>` for immediate styling
- Use critical CSS extraction for above-the-fold content
- Enable gzip compression on your server
- Consider using CSS layers for better cascade management

---

## **🆘 Troubleshooting**

### **Common Issues**

**Glass effects not working?**
```css
/* Check browser support */
@supports (backdrop-filter: blur(10px)) {
  .glass-moderate {
    backdrop-filter: blur(16px);
  }
}

/* Fallback for unsupported browsers */
@supports not (backdrop-filter: blur(10px)) {
  .glass-moderate {
    background-color: rgba(255, 255, 255, 0.95);
  }
}
```

**Typography not loading?**
```css
/* Ensure font families are loaded */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

**Colors not applying?**
```css
/* Check CSS import order */
@import './design-system/foundation/colors.css'; /* Must be first */
@import './design-system/components/buttons.css'; /* Then components */
```

---

## **📞 Need Help?**

- **Documentation**: Full documentation in `README.md`
- **Examples**: Check the AI Assistant implementation
- **Issues**: Create an issue in your project repository
- **Custom Development**: Contact your design team

**You're now ready to build amazing interfaces with the HERA Design System!** 🎉