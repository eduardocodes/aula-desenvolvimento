'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [productName, setProductName] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleBack = () => {
    if (currentStep === 1) {
      router.push('/dashboard')
    } else {
      setCurrentStep(1)
      setError('')
    }
  }

  const handleNext = () => {
    setError('')
    
    if (currentStep === 1) {
      if (!companyName.trim()) {
        setError('Company name is required')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!productName.trim()) {
        setError('Product name is required')
        return
      }
      if (!productUrl.trim()) {
        setError('Product URL is required')
        return
      }
      // Validação básica de URL
      try {
        new URL(productUrl)
      } catch {
        setError('Please enter a valid URL')
        return
      }
      // Aqui seria a próxima funcionalidade
      console.log('Form completed:', { companyName, productName, productUrl })
    }
  }

  const clearError = () => {
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="min-h-96 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto">
              {currentStep === 1 ? (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      Welcome to Bitcoin Influencer
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Let's get started by learning about your company
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                    {error && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value)
                          clearError()
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                        placeholder="Enter your company name"
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={handleBack}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      Product Details
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Tell us about the product you're promoting.
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                    {error && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={(e) => {
                          setProductName(e.target.value)
                          clearError()
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                        placeholder="Enter your product name"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product URL
                      </label>
                      <input
                        type="url"
                        id="productUrl"
                        value={productUrl}
                        onChange={(e) => {
                          setProductUrl(e.target.value)
                          clearError()
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                        placeholder="https://example.com/product"
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={handleBack}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}