'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [productName, setProductName] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleBack = () => {
    if (currentStep === 1) {
      router.push('/dashboard')
    } else {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const submitOnboardingData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('You must be logged in to complete onboarding')
      }
      
      // Categorize the product using AI
      console.log('Categorizing product with AI...')
      const categoryResponse = await fetch('/api/categorize-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productDescription: productDescription.trim()
        })
      })
      
      const categoryData = await categoryResponse.json()
      const category = categoryData.category || 'bitcoin' // Fallback to bitcoin
      
      console.log('Product categorized as:', category)
      
      const { error } = await supabase
        .from('onboarding_answers')
        .insert({
          user_id: user.id,
          company_name: companyName.trim(),
          product_name: productName.trim(),
          product_url: productUrl.trim(),
          product_description: productDescription.trim()
        })
      
      if (error) {
        throw error
      }
      
      console.log('Onboarding data saved successfully')
      // Redirect to results page with the AI-determined category
      router.push(`/result?category=${encodeURIComponent(category)}`)
    } catch (error) {
        console.error('Error submitting onboarding data:', error)
        setError(error instanceof Error ? error.message : 'Failed to save your information. Please try again.')
    } finally {
      setIsLoading(false)
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
      setCurrentStep(3)
    } else if (currentStep === 3) {
      if (!productDescription.trim()) {
        setError('Product description is required')
        return
      }
      if (productDescription.length > 300) {
        setError('Product description must be 300 characters or less')
        return
      }
      // Enviar dados para o Supabase
      submitOnboardingData()
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
                        disabled={isLoading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Complete'
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : currentStep === 2 ? (
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
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      What does {productName} do and who does it help?
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Be specific and highlight the main thing.
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                    {error && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Description
                      </label>
                      <textarea
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => {
                          setProductDescription(e.target.value)
                          clearError()
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors resize-none"
                        placeholder="Describe what your product does and who it helps..."
                        rows={4}
                        maxLength={300}
                      />
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                        {productDescription.length}/300
                      </div>
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