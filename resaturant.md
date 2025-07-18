🎯 MASTER PROMPT: Restaurant Management App Frontend
World-Class Claude CLI Prompt for Building the Ultimate Restaurant Interface
Combining Steve Krug's "Don't Make Me Think" usability with Sean Adams' restaurant-specific color psychology and HERA's universal data architecture

🚀 MASTER CONTEXT PROMPT
You are building a revolutionary restaurant management frontend that combines Steve Krug's "Don't Make Me Think" usability principles with Sean Adams' restaurant-specific color psychology. This isn't just another restaurant app - it's the interface that makes complex restaurant operations feel as simple as ordering your morning coffee.

CORE PHILOSOPHY:
- "3-Second Rule": Staff must understand any screen within 3 seconds
- "Greasy Finger Proof": Works perfectly on dirty, splashed tablets
- "Universal Language": Uses colors and icons that mean the same thing globally
- "Fatigue Resistant": Comfortable to use during 12-hour shifts
- "Mistake Proof": Dangerous actions are visually distinct from safe ones

TECHNICAL FOUNDATION:
- Built with React + TypeScript + Tailwind CSS
- Uses HERA's 5-table universal data architecture
- Responsive design that works on any device
- Real-time updates with Supabase
- Optimized for restaurant environments (lighting, noise, urgency)

DATABASE STRUCTURE (Your foundation):
1. core_entities (everything is an entity)
2. core_dynamic_data (flexible properties)
3. core_organizations (restaurant details)
4. core_users (staff and customers)
5. ai_schema_registry (AI learns patterns)

SEAN ADAMS COLOR SYSTEM:
- Foundation: Clean whites (#FEFEFE) and warm grays (#57534E)
- Success: Professional green (#16A34A) - "Go, Complete, Good"
- Warning: Amber (#F59E0B) - "Caution, Pending, Attention"
- Danger: Red (#DC2626) - "Stop, Cancel, Alert"
- Info: Blue (#0284C7) - "Information, Navigation"

STEVE KRUG USABILITY RULES:
- Eliminate question marks in user's mind
- Make everything obvious, not just clear
- Remove unnecessary words
- Use conventions people already know
- Design for scanning, not reading

Current task: [SPECIFY CURRENT COMPONENT/FEATURE]

🏗️ PHASE-BY-PHASE PROMPTS
Phase 1: Foundation Setup
PHASE 1: Foundation Setup - Restaurant App Shell

Build the foundational shell of our restaurant management app following Steve Krug's "Don't Make Me Think" principles and Sean Adams' restaurant color system.

REQUIREMENTS:
- Create a Next.js 14 app with TypeScript and Tailwind CSS
- Implement the core layout structure with responsive design
- Set up Supabase integration for real-time data
- Create the foundational components and routing
- Implement Sean Adams' restaurant color system
- Design for mobile-first (restaurant tablets are the primary device)

SPECIFIC DELIVERABLES:
1. Project structure with proper folder organization
2. Tailwind config with Sean Adams' restaurant color palette
3. Main layout component with Steve Krug's 3-second rule navigation
4. Responsive sidebar that works on tablets and phones
5. Supabase client setup and environment configuration
6. Basic routing structure for all restaurant operations
7. Component library foundation with consistent styling

STEVE KRUG PRINCIPLES TO IMPLEMENT:
- Home screen with only 4 big buttons (Take Order, Check Stock, Sales & Money, Need to Buy)
- Icons + words for universal understanding
- Color-coded status indicators (green=good, amber=caution, red=urgent)
- No more than 3 taps to complete any common task
- Obvious button hierarchy with primary/secondary/danger styling

SEAN ADAMS COLOR IMPLEMENTATION:
- Use the complete restaurant color palette in Tailwind config
- Apply high contrast ratios for greasy screen visibility
- Implement the "traffic light" system for all status indicators
- Create button variants that work under restaurant lighting
- Design for accessibility with WCAG AAA compliance

TECHNICAL SPECIFICATIONS:
- Mobile-first responsive design (tablets are primary)
- Touch targets minimum 44px for finger-friendly interaction
- Fast loading with skeleton screens for perceived performance
- Real-time updates without page refreshes
- Works offline with service worker for critical functions

Please provide the complete foundation including all files, configurations, and the main navigation system.
Phase 2: Order Management Interface
PHASE 2: Order Management - The "Point and Tap" System

Build the order taking interface that makes sense to any restaurant worker within 3 seconds, using our established foundation.

CONTEXT: You've built the foundation with Sean Adams' colors and Steve Krug's navigation principles. Now create the order management system that handles the chaos of restaurant service.

REQUIREMENTS:
- Order taking interface with Steve Krug's "obvious" design
- Menu management with Sean Adams' color-coded categories
- Real-time order tracking with universal status colors
- Table management with visual status indicators
- Payment processing with mistake-proof design
- Kitchen display system integration

STEVE KRUG DESIGN PRINCIPLES:
- Menu items with pictures, clear prices, obvious size selection
- "Add to Order" buttons that can't be missed
- Order summary always visible
- One-tap modifications (no complex menus)
- Clear visual hierarchy: what matters most is biggest

SEAN ADAMS COLOR STRATEGY:
- Menu categories with distinct, high-contrast colors
- Order status using traffic light system (amber=pending, blue=preparing, green=ready)
- Payment buttons with success green for confirmation
- Danger red for cancellation/deletion
- Tables with color-coded occupancy status

COMPONENTS TO BUILD:
1. Menu display with category navigation
2. Order builder with real-time total calculation
3. Table management grid with status indicators
4. Order tracking dashboard for kitchen staff
5. Payment processing interface
6. Order modification system
7. Kitchen display screen component

UNIVERSAL DATA INTEGRATION:
- All menu items stored as entities in core_entities
- Prices and options in core_dynamic_data
- Orders as universal_transactions
- Table status tracked in real-time

MOBILE OPTIMIZATION:
- Swipe gestures for category navigation
- Large touch targets for speed during rush
- Haptic feedback for order confirmations
- Voice input for special requests
- Offline mode for when internet fails

Please build the complete order management system with all components, proper state management, and real-time synchronization.
Phase 3: Inventory Management
PHASE 3: Inventory Management - The "Do I Have Enough?" System

Build the inventory tracking system that prevents stockouts while being simple enough for kitchen staff to use during prep time.

CONTEXT: Using the established foundation and order system, create inventory management that integrates seamlessly with daily operations.

STEVE KRUG SIMPLICITY REQUIREMENTS:
- Stock check screen with color-coded alerts (red=critical, amber=low, green=good)
- Quick update interface with +/- buttons (no typing quantities)
- Shopping list generation with one-tap ordering
- Delivery tracking with simple yes/no confirmations
- Waste tracking with preset reasons

SEAN ADAMS COLOR PSYCHOLOGY:
- Stock levels with intuitive color coding
- Expiration dates with gradient from green to red
- Supplier performance with trust indicators
- Cost tracking with clear profit/loss colors
- Reorder suggestions with actionable amber highlights

COMPONENTS TO BUILD:
1. Stock level dashboard with real-time alerts
2. Quick stock update interface (for kitchen staff)
3. Ingredient usage tracking (auto-deduct from orders)
4. Shopping list generator with AI suggestions
5. Delivery receiving interface
6. Waste tracking system
7. Supplier performance dashboard

INTELLIGENT FEATURES:
- AI predicts when items will run out
- Automatic reorder suggestions based on usage patterns
- Integration with order system for real-time deduction
- Barcode scanning for quick updates
- Photo documentation for deliveries

RESTAURANT-SPECIFIC DESIGN:
- Works with wet/dirty hands (large touch targets)
- Clear visual hierarchy for scanning information
- Minimal text, maximum icons and colors
- Quick emergency stockout alerts
- Integration with kitchen prep schedules

DATA ARCHITECTURE:
- Ingredients as entities with dynamic properties
- Usage patterns tracked in AI registry
- Supplier relationships in core_relationships
- Automatic transaction logging for all changes

Please build the complete inventory management system with predictive intelligence and seamless integration.
Phase 4: Financial Dashboard
PHASE 4: Financial Dashboard - The "Are We Making Money?" System

Build the financial overview that gives restaurant managers instant understanding of their business performance without needing an accounting degree.

CONTEXT: Complete the restaurant management suite with financial intelligence that's as simple as checking your bank account balance.

STEVE KRUG FINANCIAL SIMPLICITY:
- Today's profit/loss prominently displayed
- Week-over-week comparison with clear trends
- Simple expense entry with preset categories
- Cash flow visualization without complex charts
- Alert system for unusual spending patterns

SEAN ADAMS FINANCIAL COLORS:
- Profit in success green, losses in danger red
- Revenue in info blue, expenses in amber
- Budget vs actual with clear visual indicators
- Trend arrows with color-coded performance
- Alert badges with appropriate urgency colors

COMPONENTS TO BUILD:
1. Daily financial summary dashboard
2. Simple expense entry interface
3. Sales trend visualization
4. Budget vs actual comparison
5. Cash flow predictor
6. Financial alert system
7. Tax preparation assistant

MANAGER-FRIENDLY FEATURES:
- Speak financial results in plain English
- Photo receipt capture for expenses
- Automatic categorization of transactions
- Weekly/monthly email summaries
- Integration with POS systems

INTELLIGENT INSIGHTS:
- AI identifies spending patterns
- Predicts slow/busy periods
- Suggests cost-saving opportunities
- Flags unusual transactions
- Benchmarks against industry standards

VISUAL DESIGN:
- Large, clear numbers for quick scanning
- Minimal charts, maximum insight
- Color-coded performance indicators
- Touch-friendly mobile interface
- Print-friendly reports for accountants

Please build the complete financial management system with intelligent insights and manager-friendly simplicity.
Phase 5: AI Intelligence Integration
PHASE 5: AI Intelligence - The "Invisible Assistant" System

Integrate AI-powered intelligence throughout the restaurant app that makes smart suggestions without overwhelming users with complexity.

CONTEXT: Add the final layer of intelligence that learns from restaurant operations and provides actionable insights through the established interface.

STEVE KRUG AI PRINCIPLES:
- AI suggestions appear as helpful hints, not complex analysis
- One-tap acceptance of AI recommendations
- Clear confidence indicators for AI suggestions
- Easy override of AI decisions
- Learning from user feedback without surveys

SEAN ADAMS AI VISUALIZATION:
- AI confidence levels shown with color intensity
- Suggestions highlighted with gentle amber glow
- Accepted recommendations turn success green
- Rejected suggestions fade to gray
- Learning progress shown with subtle indicators

AI FEATURES TO IMPLEMENT:
1. Smart menu optimization (highlight profitable items)
2. Predictive inventory ordering
3. Staff scheduling optimization
4. Price optimization suggestions
5. Customer behavior analysis
6. Demand forecasting
7. Automated reporting

INVISIBLE INTEGRATION:
- AI works behind the scenes, surfacing insights naturally
- Suggestions appear in context (not separate AI dashboard)
- Natural language explanations for all recommendations
- Gradual learning from user behavior
- No complex AI configuration required

RESTAURANT-SPECIFIC AI:
- Learns from order patterns and seasonal trends
- Understands prep times and kitchen capacity
- Recognizes supplier reliability patterns
- Adapts to local market conditions
- Provides competitive intelligence

USER EXPERIENCE:
- AI suggestions feel like helpful coworker tips
- Clear explanations for why AI made recommendations
- Easy feedback system (thumbs up/down)
- Gradual improvement over time
- Maintains user control over all decisions

Please integrate AI intelligence throughout the existing system with seamless, helpful suggestions that enhance rather than complicate the user experience.

🎯 COMPLETE SYSTEM PROMPT
MASTER PROMPT: Complete Restaurant Management Frontend

You are building the ultimate restaurant management app that combines Steve Krug's usability genius with Sean Adams' color mastery, powered by HERA's universal data architecture.

FINAL REQUIREMENTS:
- Complete React + TypeScript + Tailwind CSS application
- Supabase integration with real-time updates
- Mobile-first responsive design optimized for restaurant tablets
- Steve Krug's "Don't Make Me Think" principles throughout
- Sean Adams' restaurant-specific color psychology
- AI-powered intelligence that feels natural, not overwhelming
- HERA's 5-table universal data structure
- Production-ready code with proper error handling
- Comprehensive testing suite
- Documentation for restaurant staff

CORE FEATURES:
1. Order Management (menu, orders, payments, kitchen display)
2. Inventory Management (stock levels, purchasing, suppliers)
3. Financial Dashboard (sales, expenses, profits, trends)
4. AI Intelligence (predictions, suggestions, optimization)
5. Staff Management (scheduling, performance, communication)

TECHNICAL ARCHITECTURE:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS with custom restaurant color palette
- Supabase for real-time database and auth
- Zustand for state management
- React Query for data fetching
- Framer Motion for subtle animations
- PWA capabilities for offline functionality

DESIGN PRINCIPLES:
- 3-Second Rule: Immediate understanding
- Greasy Finger Proof: Large touch targets, high contrast
- Universal Language: Icons and colors that transcend language
- Fatigue Resistant: Comfortable for 12-hour shifts
- Mistake Proof: Dangerous actions clearly differentiated

COLOR SYSTEM:
- Foundation: #FEFEFE (white), #57534E (warm gray)
- Success: #16A34A (professional green)
- Warning: #F59E0B (amber)
- Danger: #DC2626 (red)
- Info: #0284C7 (blue)
- All colors tested for accessibility and restaurant lighting

DELIVERABLES:
1. Complete application source code
2. Tailwind configuration with restaurant colors
3. Supabase database schema and migrations
4. Component library with Storybook documentation
5. Testing suite with Jest and React Testing Library
6. Deployment configuration for Vercel
7. User documentation for restaurant staff
8. Technical documentation for developers

Build this as a production-ready application that could be deployed to restaurants immediately. Focus on reliability, performance, and the brutal simplicity that makes complex restaurant operations feel effortless.

Remember: This isn't just an app - it's the digital nervous system that helps restaurants succeed.

🛠️ SPECIALIZED COMPONENT PROMPTS
Component-Specific Prompts
COMPONENT PROMPT: Navigation System

Build the main navigation component that embodies Steve Krug's "Don't Make Me Think" principles:

- 4 primary sections maximum
- Icons + text for universal understanding
- Color-coded status indicators
- Responsive collapse for mobile
- Active state management
- Accessibility compliance

Use Sean Adams' color system for all states and Sean Adams' restaurant color palette.
COMPONENT PROMPT: Order Interface

Build the order taking interface optimized for restaurant service:

- Menu grid with clear categories
- Item cards with photos and prices
- Quantity selectors with large touch targets
- Order summary with real-time calculations
- One-tap modifications
- Payment flow with confirmation steps

Apply Steve Krug's scanning principles and Sean Adams' color psychology.
COMPONENT PROMPT: Dashboard Cards

Build reusable dashboard cards for key metrics:

- Large, scannable numbers
- Trend indicators with color coding
- Touch-friendly interaction areas
- Loading states and error handling
- Responsive sizing
- Accessibility features

Follow both experts' principles for immediate comprehension.

🏆 QUALITY CHECKPOINTS
Steve Krug Usability Test

Can new staff member use interface within 3 seconds?
Are all actions obvious without explanation?
Is information scannable, not requiring reading?
Are conventions followed consistently?
Is the interface mistake-proof?

Sean Adams Color Test

Do colors work under restaurant lighting?
Are status indicators universally understood?
Is contrast sufficient for dirty screens?
Do colors reduce cognitive load?
Are dangerous actions clearly differentiated?

Restaurant Reality Test

Works with wet/greasy hands?
Functions during dinner rush chaos?
Reliable under poor internet conditions?
Intuitive for high-turnover staff?
Integrates with kitchen workflow?


🚀 IMPLEMENTATION STRATEGY

Start with Foundation Prompt - Get basic structure right
Build Core Components - One feature at a time
Test Each Phase - Validate usability before moving forward
Integrate AI Intelligence - Add smart features gradually
Polish and Optimize - Performance and accessibility
Deploy and Iterate - Real restaurant testing

This prompt engineering approach ensures Claude builds not just a restaurant app, but THE restaurant app - the one that finally makes technology serve the restaurant, not the other way around.
🍽️ Ready to revolutionize restaurant management? Let's build something extraordinary.RetryClaude can make mistakes. Please double-check responses.app is already built we are just adding it backend is also ready frontend is nextjs we are oing to give the command in the frontendResearch Sonnet 4Chat controls Sonnet 4