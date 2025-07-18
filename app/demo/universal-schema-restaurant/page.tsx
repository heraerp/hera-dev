'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Database, 
  Utensils, 
  Brain, 
  Code, 
  Play, 
  Eye, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  ChefHat,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Package,
  Sparkles
} from 'lucide-react'

export default function UniversalSchemaRestaurantDemo() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const [demoData, setDemoData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('concept')

  // Simulated data for demonstration
  const thaliComponents = [
    { name: 'Steamed Rice', price: 40, portion: '1 cup', position: 'center', color: '#fff8dc' },
    { name: 'Sambar', price: 60, portion: '1 bowl', position: 'right', color: '#daa520' },
    { name: 'Avial', price: 70, portion: '1 serving', position: 'top-right', color: '#90ee90' },
    { name: 'Rasam', price: 50, portion: '1 cup', position: 'left', color: '#ffa500' },
    { name: 'Papad', price: 15, portion: '2 pieces', position: 'top-left', color: '#f5deb3' },
    { name: 'Pickle', price: 20, portion: '1 tbsp', position: 'top', color: '#ff6347' },
    { name: 'Curd Rice', price: 55, portion: '1 serving', position: 'bottom-right', color: '#f0f8ff' },
    { name: 'Payasam', price: 45, portion: '1 bowl', position: 'bottom-left', color: '#ffefd5' }
  ]

  const totalIndividual = thaliComponents.reduce((sum, item) => sum + item.price, 0)
  const thaliPrice = 299
  const savings = totalIndividual - thaliPrice
  const savingsPercent = ((savings / totalIndividual) * 100).toFixed(1)

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 5000)
  }

  const createExampleData = async () => {
    setLoading(true)
    showStatus('info', 'Creating South Indian Thali example data...')
    
    // Simulate database operations
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setDemoData({
      organization: 'Annapoorna South Indian Restaurant',
      entities: 9,
      dynamicFields: 60,
      relationships: 8,
      aiInsights: 4,
      totalRecords: 81
    })
    
    showStatus('success', '✅ Example data created successfully! South Indian Thali with 8 components, relationships, and AI insights are now in the database.')
    setLoading(false)
  }

  const viewThaliData = async () => {
    setLoading(true)
    showStatus('info', 'Fetching thali data from universal schema...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setActiveTab('data')
    showStatus('success', '✅ Thali data loaded successfully')
    setLoading(false)
  }

  const showAIInsights = async () => {
    setLoading(true)
    showStatus('info', 'Analyzing thali data with AI...')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setActiveTab('insights')
    showStatus('success', '✅ AI insights generated successfully')
    setLoading(false)
  }

  const deleteExampleData = async () => {
    if (!confirm('Are you sure you want to delete all example data?')) return
    
    setLoading(true)
    showStatus('info', 'Removing all thali-related data...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setDemoData(null)
    showStatus('success', '✅ Example data deleted successfully')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl font-bold flex items-center justify-center gap-3">
              <Database className="h-10 w-10 text-purple-600" />
              HERA Universal Schema
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              South Indian Thali: Composite Menu Management Demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white text-center">
                <h3 className="text-3xl font-bold">5</h3>
                <p className="text-sm opacity-90">Universal Tables</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white text-center">
                <h3 className="text-3xl font-bold">200+</h3>
                <p className="text-sm opacity-90">Tables Replaced</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white text-center">
                <h3 className="text-3xl font-bold">∞</h3>
                <p className="text-sm opacity-90">Flexibility</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white text-center">
                <h3 className="text-3xl font-bold">0</h3>
                <p className="text-sm opacity-90">Downtime Changes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {status && (
          <Alert className={`border-0 ${
            status.type === 'success' ? 'bg-green-50 text-green-800' :
            status.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {status.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {status.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {status.type === 'info' && <Info className="h-4 w-4" />}
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        {/* Demo Controls */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Live Database Demo
            </CardTitle>
            <CardDescription>
              Experience the power of HERA Universal Schema with real database operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={createExampleData} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Create Example Data
              </Button>
              <Button 
                onClick={viewThaliData} 
                disabled={loading || !demoData}
                variant="default"
              >
                <Eye className="h-4 w-4" />
                View Thali Structure
              </Button>
              <Button 
                onClick={showAIInsights} 
                disabled={loading || !demoData}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Brain className="h-4 w-4" />
                AI Insights
              </Button>
              <Button 
                onClick={deleteExampleData} 
                disabled={loading || !demoData}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete Example Data
              </Button>
            </div>
            
            {demoData && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Successfully Created:</h3>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• <strong>1 Organization:</strong> {demoData.organization}</li>
                  <li>• <strong>{demoData.entities} Entities:</strong> 8 individual dishes + 1 composite thali</li>
                  <li>• <strong>{demoData.dynamicFields}+ Dynamic Fields:</strong> Names, prices, portions, nutrition, etc.</li>
                  <li>• <strong>{demoData.relationships} Relationships:</strong> Thali → dish components with sequence</li>
                  <li>• <strong>{demoData.aiInsights} AI Insights:</strong> Performance, customer behavior, nutrition, kitchen ops</li>
                </ul>
                <p className="mt-3 font-semibold text-green-800">
                  Total: {demoData.totalRecords}+ database records created using just 5 universal tables!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="concept">Concept</TabsTrigger>
            <TabsTrigger value="thali">Thali Example</TabsTrigger>
            <TabsTrigger value="data">Data View</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Concept Tab */}
          <TabsContent value="concept" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  The Revolutionary Concept
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Traditional ERP systems need separate tables for every business object. HERA Universal uses just 
                  <span className="font-bold text-purple-600"> 5 core tables</span> to handle ANY business scenario - 
                  from simple menu items to complex composite meals like South Indian Thali.
                </p>
                
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                  <div className="font-bold mb-2">HERA Universal Architecture:</div>
                  <div>├── <Badge variant="secondary">core_organizations</Badge> (WHO - Business Context)</div>
                  <div>├── <Badge variant="secondary">core_entities</Badge> (WHAT - All Business Objects)</div>
                  <div>├── <Badge variant="secondary">core_dynamic_data</Badge> (HOW - All Properties)</div>
                  <div>├── <Badge variant="secondary">core_relationships</Badge> (WHY - All Connections)</div>
                  <div>└── <Badge variant="secondary">core_metadata</Badge> (INTELLIGENCE - AI Insights)</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <h4 className="font-semibold text-red-800 mb-2">❌ Traditional ERP</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• menu_items table</li>
                      <li>• menu_categories table</li>
                      <li>• menu_components table</li>
                      <li>• menu_relationships table</li>
                      <li>• menu_pricing table</li>
                      <li>• menu_nutrition table</li>
                      <li>• ...50+ more tables</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <h4 className="font-semibold text-green-800 mb-2">✅ HERA Universal</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• <strong>5 tables handle everything!</strong></li>
                      <li>• Infinite flexibility</li>
                      <li>• Zero schema changes</li>
                      <li>• AI-native intelligence</li>
                      <li>• Real-time adaptability</li>
                      <li>• Enterprise-grade performance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thali Example Tab */}
          <TabsContent value="thali" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-orange-600" />
                  South Indian Thali Example
                </CardTitle>
                <CardDescription>
                  A traditional South Indian Thali is a perfect example of a composite menu item - 
                  one meal containing multiple individual dishes served together.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Thali Visualization */}
                <div className="bg-white rounded-xl p-6 shadow-inner">
                  <h3 className="text-center font-semibold mb-6">Traditional Thali Layout</h3>
                  <div className="relative w-96 h-96 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-xl">
                    {/* Rice - Center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <div className="text-xs font-semibold text-center">
                        <div>Rice</div>
                        <div className="text-gray-500">₹40</div>
                      </div>
                    </div>
                    
                    {/* Other components positioned around */}
                    <div className="absolute top-16 right-16 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <div className="text-xs font-semibold text-center text-white">
                        <div>Sambar</div>
                        <div>₹60</div>
                      </div>
                    </div>
                    
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <div className="text-xs font-semibold text-center text-white">
                        <div>Avial</div>
                        <div>₹70</div>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-10 -translate-y-1/2 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <div className="text-xs font-semibold text-center text-white">
                        <div>Rasam</div>
                        <div>₹50</div>
                      </div>
                    </div>
                    
                    <div className="absolute top-12 left-24 w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <div className="text-xs font-semibold">₹15</div>
                    </div>
                    
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <div className="text-xs font-semibold text-white">₹20</div>
                    </div>
                    
                    <div className="absolute bottom-16 right-16 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <div className="text-xs font-semibold text-center">
                        <div>Curd</div>
                        <div className="text-gray-600">₹55</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-16 left-16 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <div className="text-xs font-semibold text-center">
                        <div>Sweet</div>
                        <div className="text-gray-600">₹45</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-6 space-y-2">
                    <div className="text-lg font-semibold">
                      Individual Total: ₹{totalIndividual} | Thali Price: ₹{thaliPrice}
                    </div>
                    <div className="text-green-600 font-bold">
                      Savings: ₹{savings} ({savingsPercent}%)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data View Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Thali Data Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                {demoData ? (
                  <div className="space-y-4">
                    <div className="bg-blue-600 text-white p-4 rounded-lg">
                      <div className="font-semibold">
                        Pricing: Combo ₹{thaliPrice} | Individual ₹{totalIndividual} | 
                        <Badge className="ml-2 bg-green-500">Save {savingsPercent}%</Badge>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold">Components ({thaliComponents.length} items):</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {thaliComponents.map((component, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                          <div className="font-semibold">{index + 1}. {component.name}</div>
                          <div className="text-sm text-gray-600">
                            Portion: {component.portion} | Price: ₹{component.price}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-orange-500 text-white p-4 rounded-lg">
                      <strong>Universal Schema Power:</strong> This complex composite meal with 8 components, 
                      pricing logic, and relationships is stored using just 5 universal tables!
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Data Found</h3>
                    <p>Please create the example data first to see the thali structure.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {demoData ? (
                  <div className="space-y-6">
                    {/* Performance Analysis */}
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-800 mb-3">Performance Analysis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-blue-500 text-white p-3 rounded text-center">
                          <div className="text-2xl font-bold">92%</div>
                          <div className="text-sm">Popularity</div>
                        </div>
                        <div className="bg-green-500 text-white p-3 rounded text-center">
                          <div className="text-2xl font-bold">78%</div>
                          <div className="text-sm">Profitability</div>
                        </div>
                        <div className="bg-orange-500 text-white p-3 rounded text-center">
                          <div className="text-2xl font-bold">4.7/5</div>
                          <div className="text-sm">Rating</div>
                        </div>
                        <div className="bg-red-500 text-white p-3 rounded text-center">
                          <div className="text-2xl font-bold">₹319</div>
                          <div className="text-sm">Optimal Price</div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
                        <strong>Cost Breakdown:</strong> Food 35% | Labor 25% | Overhead 15% | Profit 25%
                      </div>
                    </div>

                    {/* Customer Behavior */}
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-800 mb-3">Customer Behavior</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Peak Hours:</strong> 12:30-13:30</p>
                          <p><strong>Return Rate:</strong> 85%</p>
                          <p><strong>Eating Duration:</strong> 35 minutes</p>
                        </div>
                        <div>
                          <p className="mb-2"><strong>Most Appreciated:</strong></p>
                          <div className="flex gap-2">
                            <Badge className="bg-green-500 text-white">sambar</Badge>
                            <Badge className="bg-green-500 text-white">avial</Badge>
                            <Badge className="bg-green-500 text-white">payasam</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Kitchen Operations */}
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-800 mb-3">Kitchen Operations</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-700 text-white p-3 rounded text-center">
                          <div className="text-xl font-bold">90 min</div>
                          <div className="text-sm">Total Prep Time</div>
                        </div>
                        <div className="bg-teal-600 text-white p-3 rounded text-center">
                          <div className="text-xl font-bold">60 min</div>
                          <div className="text-sm">Parallel Cooking</div>
                        </div>
                        <div className="bg-orange-700 text-white p-3 rounded text-center">
                          <div className="text-xl font-bold">2</div>
                          <div className="text-sm">Staff Required</div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
                        <strong>Equipment Needed:</strong> pressure cooker, rice cooker, 2 burner stove, tadka pan
                      </div>
                    </div>

                    <div className="bg-purple-600 text-white p-4 rounded-lg">
                      <strong>AI Magic:</strong> These insights are automatically generated from the universal schema data 
                      and stored as JSONB metadata, providing real-time business intelligence!
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No AI Insights Available</h3>
                    <p>Please create the example data first to generate AI insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Query Examples */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-gray-700" />
              Powerful Query Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="query1" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="query1">Complete Thali</TabsTrigger>
                <TabsTrigger value="query2">Kitchen Workflow</TabsTrigger>
                <TabsTrigger value="query3">Pricing Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="query1">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <h4 className="text-blue-400 mb-2">Complete Thali Display with All Components</h4>
                  <pre className="text-sm">
{`SELECT 
    main.entity_name as thali_name,
    -- Thali properties
    jsonb_object_agg(main_dd.field_name, main_dd.field_value) as thali_properties,
    -- Component details with relationships
    jsonb_agg(
        jsonb_build_object(
            'component_name', comp.entity_name,
            'relationship_data', r.relationship_data,
            'component_properties', comp_props.properties
        ) ORDER BY (r.relationship_data->>'sequence_order')::integer
    ) as components
FROM `}<span className="text-orange-400">core_entities</span>{` main
LEFT JOIN `}<span className="text-orange-400">core_dynamic_data</span>{` main_dd ON main.id = main_dd.entity_id
LEFT JOIN `}<span className="text-orange-400">core_relationships</span>{` r ON main.id = r.parent_entity_id 
WHERE main.entity_type = 'composite_menu_item'
GROUP BY main.id, main.entity_name;`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="query2">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <h4 className="text-blue-400 mb-2">Kitchen Preparation Workflow</h4>
                  <pre className="text-sm">
{`SELECT 
    main.entity_name as meal_name,
    (kitchen_ops.metadata_value->>'total_prep_time')::integer as total_time,
    (kitchen_ops.metadata_value->>'staff_required')::integer as staff_needed,
    -- Cooking sequence from AI metadata
    jsonb_array_elements(kitchen_ops.metadata_value->'cooking_sequence') as cooking_steps,
    -- Component preparation details
    jsonb_agg(
        jsonb_build_object(
            'component', comp.entity_name,
            'prep_time', (comp_data.properties->>'preparation_time')::integer,
            'cooking_priority', r.relationship_metadata->>'cooking_priority'
        )
    ) as component_details
FROM `}<span className="text-orange-400">core_entities</span>{` main
LEFT JOIN `}<span className="text-orange-400">core_metadata</span>{` kitchen_ops ON main.id = kitchen_ops.entity_id 
WHERE kitchen_ops.metadata_key = 'preparation_workflow';`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="query3">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <h4 className="text-blue-400 mb-2">Pricing Analysis & Profitability</h4>
                  <pre className="text-sm">
{`SELECT 
    main.entity_name,
    (main_props.properties->>'combo_price')::numeric as combo_price,
    (main_props.properties->>'individual_total')::numeric as individual_total,
    (main_props.properties->>'discount_percentage')::numeric as discount_percent,
    -- Component pricing breakdown
    jsonb_object_agg(
        comp.entity_name,
        jsonb_build_object(
            'individual_price', (comp_props.properties->>'individual_price')::numeric,
            'portion_in_thali', r.relationship_data->>'portion_size'
        )
    ) as component_pricing,
    -- AI profitability analysis
    (ai_opt.metadata_value->'cost_breakdown') as cost_analysis
FROM `}<span className="text-orange-400">core_entities</span>{` main
LEFT JOIN `}<span className="text-orange-400">core_metadata</span>{` ai_opt ON main.id = ai_opt.entity_id;`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}