export default function DeploymentTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 Deployment Test Page
        </h1>
        <p className="text-gray-600 mb-6">
          Created at: {new Date().toLocaleString()}
        </p>
        <div className="bg-green-100 border border-green-400 rounded p-4">
          <p className="text-green-800 font-semibold">
            ✅ If you can see this page, Vercel deployments are working!
          </p>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <p>Test ID: DEPLOYMENT_TEST_2025_01_11_21_01</p>
        </div>
      </div>
    </div>
  )
}