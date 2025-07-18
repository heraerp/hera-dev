export default function DeploymentTest2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ✅ Deployment Test 2 - SUCCESS!
        </h1>
        <p className="text-gray-600 mb-6">
          Created at: {new Date().toLocaleString()}
        </p>
        <div className="bg-green-100 border border-green-400 rounded p-4">
          <p className="text-green-800 font-semibold">
            🎉 If you can see this page, the deployment pipeline is fully working!
          </p>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <p>Test ID: DEPLOYMENT_TEST_2_FIXED_PIPELINE</p>
          <p>Timestamp: {Date.now()}</p>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm">
            🔧 This confirms that new changes now deploy automatically to Vercel!
          </p>
        </div>
      </div>
    </div>
  )
}