'use client'

import React, { useEffect, useRef } from 'react'
import { TrendingUp, Users, DollarSign, Target, Trophy, Rocket } from 'lucide-react'

declare global {
  interface Window {
    Chart: any;
  }
}

const FinancialProjections: React.FC = () => {
  const revenueChartRef = useRef<HTMLCanvasElement>(null)
  const customerChartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Load Chart.js dynamically
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
    script.onload = () => {
      initializeCharts()
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const initializeCharts = () => {
    if (!window.Chart || !revenueChartRef.current || !customerChartRef.current) return

    // Revenue Growth Chart
    const revenueCtx = revenueChartRef.current.getContext('2d')
    new window.Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        datasets: [{
          label: 'ARR ($M)',
          data: [14.4, 67.2, 259.2, 705.6, 1440],
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: number) {
                return '$' + value + 'M'
              }
            }
          }
        }
      }
    })

    // Customer Growth Chart
    const customerCtx = customerChartRef.current.getContext('2d')
    new window.Chart(customerCtx, {
      type: 'bar',
      data: {
        labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        datasets: [{
          label: 'Customers',
          data: [1000, 4000, 12000, 28000, 50000],
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: '#F59E0B',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: number) {
                return value.toLocaleString()
              }
            }
          }
        }
      }
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
          🚀 HERA Financial Projections
        </h1>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white">Path to $10B Valuation</h2>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-yellow-500 text-gray-900 p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center transform hover:scale-105 transition-all duration-300">
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">$1.44B</div>
          <div className="text-xs sm:text-sm md:text-base font-semibold">Year 5 ARR</div>
          <div className="text-xs opacity-80 mt-1 hidden sm:block">50,000 customers × $2,400 ARPU</div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-green-500 text-white p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center transform hover:scale-105 transition-all duration-300">
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">92%</div>
          <div className="text-xs sm:text-sm md:text-base font-semibold">Gross Margin</div>
          <div className="text-xs opacity-90 mt-1 hidden sm:block">Pure software, zero marginal cost</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center transform hover:scale-105 transition-all duration-300">
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">20:1</div>
          <div className="text-xs sm:text-sm md:text-base font-semibold">LTV:CAC Ratio</div>
          <div className="text-xs opacity-90 mt-1 hidden sm:block">$43,200 LTV / $2,400 CAC</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center transform hover:scale-105 transition-all duration-300">
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">50,000</div>
          <div className="text-xs sm:text-sm md:text-base font-semibold">Accountant Partners</div>
          <div className="text-xs opacity-90 mt-1 hidden sm:block">24-hour deployment specialists</div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 text-center">📈 Revenue Growth Trajectory</h3>
          <canvas ref={revenueChartRef} className="w-full h-auto max-h-[250px] sm:max-h-[300px]"></canvas>
        </div>
        
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 text-center">👥 Customer Acquisition</h3>
          <canvas ref={customerChartRef} className="w-full h-auto max-h-[250px] sm:max-h-[300px]"></canvas>
        </div>
      </div>

      {/* Financial Projections Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xl mb-4 sm:mb-6 md:mb-8 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-amber-500 to-yellow-500">
              <th className="p-2 sm:p-3 md:p-4 text-left font-bold text-gray-900 text-xs sm:text-sm md:text-base">Metric</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-bold text-gray-900 text-xs sm:text-sm md:text-base">Year 1</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-bold text-gray-900 text-xs sm:text-sm md:text-base">Year 2</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-bold text-gray-900 text-xs sm:text-sm md:text-base">Year 3</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-bold text-gray-900 text-xs sm:text-sm md:text-base">Year 4</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-bold text-gray-900 text-xs sm:text-sm md:text-base">Year 5</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-2 sm:p-3 md:p-4 font-semibold text-gray-800 bg-gray-50 text-xs sm:text-sm md:text-base">Customers</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">1,000</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">4,000</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">12,000</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">28,000</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">50,000</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-2 sm:p-3 md:p-4 font-semibold text-gray-800 bg-gray-50 text-xs sm:text-sm md:text-base">ARPU (Monthly)</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">$1,200</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">$1,400</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">$1,800</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">$2,100</td>
              <td className="p-2 sm:p-3 md:p-4 text-center text-xs sm:text-sm md:text-base">$2,400</td>
            </tr>
            <tr className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-gray-200">
              <td className="p-2 sm:p-3 md:p-4 font-bold text-gray-800 bg-amber-200 text-xs sm:text-sm md:text-base">ARR</td>
              <td className="p-2 sm:p-3 md:p-4 text-center font-bold text-xs sm:text-sm md:text-base">$14.4M</td>
              <td className="p-2 sm:p-3 md:p-4 text-center font-bold text-xs sm:text-sm md:text-base">$67.2M</td>
              <td className="p-2 sm:p-3 md:p-4 text-center font-bold text-xs sm:text-sm md:text-base">$259.2M</td>
              <td className="p-2 sm:p-3 md:p-4 text-center font-bold text-xs sm:text-sm md:text-base">$705.6M</td>
              <td className="p-2 sm:p-3 md:p-4 text-center font-bold text-xs sm:text-sm md:text-base">$1.44B</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-4 font-semibold text-gray-800 bg-gray-50">Gross Margin</td>
              <td className="p-4 text-center">88%</td>
              <td className="p-4 text-center">90%</td>
              <td className="p-4 text-center">91%</td>
              <td className="p-4 text-center">92%</td>
              <td className="p-4 text-center">92%</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-4 font-semibold text-gray-800 bg-gray-50">Sales & Marketing</td>
              <td className="p-4 text-center">60%</td>
              <td className="p-4 text-center">45%</td>
              <td className="p-4 text-center">35%</td>
              <td className="p-4 text-center">30%</td>
              <td className="p-4 text-center">25%</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-4 font-semibold text-gray-800 bg-gray-50">R&D</td>
              <td className="p-4 text-center">25%</td>
              <td className="p-4 text-center">22%</td>
              <td className="p-4 text-center">20%</td>
              <td className="p-4 text-center">18%</td>
              <td className="p-4 text-center">15%</td>
            </tr>
            <tr className="bg-gradient-to-r from-emerald-100 to-green-100">
              <td className="p-4 font-bold text-gray-800 bg-emerald-200">EBITDA Margin</td>
              <td className="p-4 text-center font-bold text-red-600">-12%</td>
              <td className="p-4 text-center font-bold text-emerald-600">8%</td>
              <td className="p-4 text-center font-bold text-emerald-600">22%</td>
              <td className="p-4 text-center font-bold text-emerald-600">32%</td>
              <td className="p-4 text-center font-bold text-emerald-600">42%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Unicorn Status Highlight */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 text-center mb-4 sm:mb-6 md:mb-8 border-2 border-purple-400/50">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white drop-shadow-lg">🦄 Unicorn Status: Year 3</h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-1 sm:mb-2 text-white font-semibold drop-shadow-md">$259M ARR × 12x Revenue Multiple = $3.1B Valuation</p>
        <p className="text-sm sm:text-base md:text-lg text-purple-100 font-medium">Conservative SaaS multiple based on 92% gross margins + 147% NRR</p>
      </div>

      {/* Funding Rounds */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center">
          <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2">Seed Round</div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">$5M</div>
          <div className="text-xs sm:text-sm md:text-base opacity-90">$25M pre-money</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center">
          <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2">Series A</div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">$25M</div>
          <div className="text-xs sm:text-sm md:text-base opacity-90">$100M pre-money</div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-green-500 text-white p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center">
          <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2">Series B</div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">$75M</div>
          <div className="text-xs sm:text-sm md:text-base opacity-90">$750M pre-money</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-yellow-500 text-gray-900 p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center">
          <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2">Series C</div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">$150M</div>
          <div className="text-xs sm:text-sm md:text-base opacity-80">$3B pre-money</div>
        </div>
      </div>
    </div>
  )
}

export default FinancialProjections