'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface Creator {
  id: string
  full_name: string
  username: string
  insta_url: string
  youtube_url: string
  tiktok_url: string
  x_url: string
  email: string
  location: string
  youtube_bio: string
  insta_bio: string
  tiktok_bio: string
  x_bio: string
  youtube_followers: number
  insta_followers: number
  tiktok_followers: number
  x_followers: number
  total_followers: number
  youtube_engagement_rate: number
  tiktok_engagement_rate: number
  youtube_average_views: number
  tiktok_average_views: number
  categories: string[]
  is_btc_only: boolean
}

export default function ResultPage() {
  const [user, setUser] = useState<User | null>(null)
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      // Temporarily allow access without authentication for demonstration
      // if (!user) {
      //   router.push('/')
      //   return
      // }
      setUser(user || { id: 'demo-user' } as User)
    }

    checkUser()
  }, [router])

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        console.log('Fetching creators...')
        
        // Try to fetch creators with detailed error logging
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .order('total_followers', { ascending: false })
          .limit(20)

        console.log('Supabase response:', { data, error })
        
        if (error) {
          console.error('Error fetching creators:', error)
          console.error('Error details:', {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code
          })
          
          if (error?.code === '42501') {
            console.error('RLS Policy Error: A tabela creators tem Row Level Security habilitado mas não possui políticas configuradas.')
            console.error('Para resolver: Acesse o Supabase Dashboard > Authentication > Policies e crie uma política de leitura para a tabela creators.')
          }
          
          setCreators([])
        } else {
          console.log('Creators fetched successfully:', data?.length || 0)
          setCreators(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
        setCreators([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCreators()
    } else {
      setLoading(false)
    }
  }, [user])

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count?.toString() || '0'
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        )
      case 'instagram':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        )
      case 'tiktok':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        )
      case 'x':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Influenciadores Recomendados</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Encontramos {creators.length} influenciadores que podem ser perfeitos para sua marca.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <div key={creator.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {creator.full_name || creator.username}
                    </h3>
                    {creator.username && (
                      <p className="text-gray-600">@{creator.username}</p>
                    )}
                  </div>
                  {creator.is_btc_only && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Bitcoin Only
                    </span>
                  )}
                </div>

                {creator.location && (
                  <p className="text-gray-600 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {creator.location}
                  </p>
                )}

                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatFollowers(creator.total_followers)} seguidores
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {creator.youtube_followers > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center text-red-600 mb-1">
                        {getSocialIcon('youtube')}
                      </div>
                      <p className="text-sm font-medium">{formatFollowers(creator.youtube_followers)}</p>
                    </div>
                  )}
                  {creator.insta_followers > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center text-pink-600 mb-1">
                        {getSocialIcon('instagram')}
                      </div>
                      <p className="text-sm font-medium">{formatFollowers(creator.insta_followers)}</p>
                    </div>
                  )}
                  {creator.tiktok_followers > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center text-black mb-1">
                        {getSocialIcon('tiktok')}
                      </div>
                      <p className="text-sm font-medium">{formatFollowers(creator.tiktok_followers)}</p>
                    </div>
                  )}
                  {creator.x_followers > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center text-black mb-1">
                        {getSocialIcon('x')}
                      </div>
                      <p className="text-sm font-medium">{formatFollowers(creator.x_followers)}</p>
                    </div>
                  )}
                </div>

                {creator.categories && creator.categories.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {creator.categories.slice(0, 3).map((category, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded"
                        >
                          {category}
                        </span>
                      ))}
                      {creator.categories.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                          +{creator.categories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {creator.youtube_url && (
                    <a
                      href={creator.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700"
                    >
                      {getSocialIcon('youtube')}
                    </a>
                  )}
                  {creator.insta_url && (
                    <a
                      href={creator.insta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      {getSocialIcon('instagram')}
                    </a>
                  )}
                  {creator.tiktok_url && (
                    <a
                      href={creator.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-700"
                    >
                      {getSocialIcon('tiktok')}
                    </a>
                  )}
                  {creator.x_url && (
                    <a
                      href={creator.x_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-700"
                    >
                      {getSocialIcon('x')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {creators.length === 0 && (
          <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <p className="text-gray-500 text-lg mb-4">Nenhum influenciador encontrado.</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-left">
                  <h3 className="font-semibold text-yellow-800 mb-2">Possível problema de configuração:</h3>
                  <p className="text-yellow-700 mb-2">
                    A tabela 'creators' pode ter Row Level Security (RLS) habilitado sem políticas configuradas.
                  </p>
                  <p className="text-yellow-700">
                    <strong>Solução:</strong> Acesse o Supabase Dashboard → Authentication → Policies e crie uma política de leitura para a tabela 'creators'.
                  </p>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  )
}