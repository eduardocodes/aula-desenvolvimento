'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
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

interface UserMatch {
  id: string
  user_id: string
  search_criteria: { category: string }
  creator_ids: string[]
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [matches, setMatches] = useState<Creator[]>([])
  const [matchesLoading, setMatchesLoading] = useState(false)
  const [latestMatch, setLatestMatch] = useState<UserMatch | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const fetchUserMatches = async (userId: string) => {
    try {
      console.log('🔍 [DEBUG] Iniciando fetchUserMatches para userId:', userId)
      setMatchesLoading(true)
      
      // Get the latest match for this user via API
      console.log('🔍 [DEBUG] Buscando matches na tabela user_matches via API...')
      const response = await fetch(`/api/user-matches?userId=${userId}`)
      const { userMatches, error: matchError } = await response.json()

      console.log('🔍 [DEBUG] Resultado da busca user_matches:', { userMatches, matchError })

      if (matchError || !userMatches) {
        console.log('❌ [DEBUG] Nenhum match encontrado para o usuário:', matchError)
        setMatches([])
        setLatestMatch(null)
        return
      } // Get the first (latest) match
      console.log('✅ [DEBUG] Match encontrado:', userMatches)
      console.log('🔍 [DEBUG] Creator IDs encontrados:', userMatches.creator_ids)
      console.log('🔍 [DEBUG] Tipo dos creator_ids:', typeof userMatches.creator_ids, Array.isArray(userMatches.creator_ids))
      
      setLatestMatch(userMatches)

      if (userMatches.creator_ids && userMatches.creator_ids.length > 0) {
        console.log('🔍 [DEBUG] Buscando detalhes dos criadores para IDs:', userMatches.creator_ids)
        
        // Fetch creator details for the matched creator IDs
        const { data: creators, error: creatorsError } = await supabase
          .from('creators')
          .select('*')
          .in('id', userMatches.creator_ids)
          .order('total_followers', { ascending: false })

        console.log('🔍 [DEBUG] Resultado da busca creators:', { creators, creatorsError })
        console.log('🔍 [DEBUG] Número de criadores encontrados:', creators?.length || 0)

        if (creatorsError) {
          console.error('❌ [DEBUG] Erro ao buscar criadores:', creatorsError)
          setMatches([])
        } else {
          console.log('✅ [DEBUG] Criadores carregados com sucesso:', creators)
          setMatches(creators || [])
        }
      } else {
        console.log('⚠️ [DEBUG] Nenhum creator_id encontrado ou array vazio')
        setMatches([])
      }
    } catch (error) {
      console.error('❌ [DEBUG] Erro geral em fetchUserMatches:', error)
      setMatches([])
      setLatestMatch(null)
    } finally {
      setMatchesLoading(false)
      console.log('🔍 [DEBUG] fetchUserMatches finalizado')
    }
  }

  useEffect(() => {
    console.log('🔍 [DEBUG] useEffect executado - iniciando verificação de usuário')
    
    // Verificar se o usuário está autenticado
    const getUser = async () => {
      console.log('🔍 [DEBUG] Chamando supabase.auth.getUser()')
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('🔍 [DEBUG] Usuário retornado:', user)
      console.log('🔍 [DEBUG] User ID:', user?.id)
      
      if (!user) {
        console.log('❌ [DEBUG] Usuário não autenticado, redirecionando para /')
        router.push('/')
        return
      }
      
      console.log('✅ [DEBUG] Usuário autenticado, definindo estado')
      setUser(user)
      setLoading(false)
      
      // Fetch user matches after setting user
      console.log('🔍 [DEBUG] Chamando fetchUserMatches com user.id:', user.id)
      await fetchUserMatches(user.id)
      
      // Verificar se veio do onboarding
      if (searchParams.get('onboarding') === 'completed') {
        console.log('🔍 [DEBUG] Usuário veio do onboarding, mostrando mensagem de sucesso')
        setShowSuccess(true)
        // Remover o parâmetro da URL
        router.replace('/dashboard')
        // Esconder a mensagem após 5 segundos
        setTimeout(() => setShowSuccess(false), 5000)
      }
    }

    getUser()

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  // Log adicional para monitorar mudanças no estado matches
  useEffect(() => {
    console.log('🔍 [DEBUG] Estado matches atualizado:', matches)
    console.log('🔍 [DEBUG] Número de matches no estado:', matches.length)
    console.log('🔍 [DEBUG] matchesLoading:', matchesLoading)
  }, [matches, matchesLoading])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Onboarding completed successfully!</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-2 text-green-200 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <nav className="bg-gray-800/60 backdrop-blur-sm shadow-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bitcoin Influencer
              </h1>
              <nav className="hidden sm:flex space-x-6">
                <a
                  href="#"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Matches
                </a>
                <a
                  href="#"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Database
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {}}
                aria-label="Account"
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Matches Section */}
          {latestMatch && matches.length > 0 ? (
            <div className="mb-8">
              <div className="bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-8">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">Creator Matches</h1>
                      <p className="text-gray-300">We found hundreds of creators for {latestMatch.search_criteria.category}!</p>
                    </div>
                    <button
                      onClick={() => router.push('/onboarding')}
                      className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                    >
                      New Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {latestMatch.search_criteria.category && (
                  <div className="mb-8 bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="bg-orange-500 rounded-full p-1 mr-3">
                        <span className="text-white text-xs font-bold px-2 py-1">{latestMatch.search_criteria.category}</span>
                      </div>
                      <div>
                        <p className="text-orange-200 text-sm">
                          AI-identified category: <span className="font-semibold capitalize text-orange-100">{latestMatch.search_criteria.category}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {matchesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((creator, index) => {
                      // Calculate match percentage based on categories and followers
                      const matchPercentage = creator.categories?.includes(latestMatch.search_criteria.category || '') ? 
                        (creator.total_followers > 100000 ? '100% match' : 
                         creator.total_followers > 50000 ? '66% match' : '33% match') : '33% match';
                      
                      return (
                      <div key={creator.id} className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 shadow-xl">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-white">
                                {creator.full_name || creator.username}
                              </h3>
                              {creator.username && (
                                <p className="text-gray-400">@{creator.username}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                {matchPercentage}
                              </span>
                              {creator.is_btc_only && (
                                <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
                                  Bitcoin Only
                                </span>
                              )}
                            </div>
                          </div>

                          {creator.location && (
                            <p className="text-gray-400 mb-3 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {creator.location}
                            </p>
                          )}

                          <div className="mb-4">
                            <p className="text-2xl font-bold text-white">
                              {formatFollowers(creator.total_followers)} followers
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {creator.youtube_followers > 0 && (
                              <div className="text-center">
                                <div className="flex items-center justify-center text-red-500 mb-1">
                                  {getSocialIcon('youtube')}
                                </div>
                                <p className="text-sm font-medium text-gray-300">{formatFollowers(creator.youtube_followers)}</p>
                                <p className="text-xs text-gray-500">Avg Views</p>
                              </div>
                            )}
                            {creator.insta_followers > 0 && (
                              <div className="text-center">
                                <div className="flex items-center justify-center text-pink-500 mb-1">
                                  {getSocialIcon('instagram')}
                                </div>
                                <p className="text-sm font-medium text-gray-300">{formatFollowers(creator.insta_followers)}</p>
                                <p className="text-xs text-gray-500">Followers</p>
                              </div>
                            )}
                            {creator.tiktok_followers > 0 && (
                              <div className="text-center">
                                <div className="flex items-center justify-center text-white mb-1">
                                  {getSocialIcon('tiktok')}
                                </div>
                                <p className="text-sm font-medium text-gray-300">{formatFollowers(creator.tiktok_followers)}</p>
                                <p className="text-xs text-gray-500">Followers</p>
                              </div>
                            )}
                            {creator.x_followers > 0 && (
                              <div className="text-center">
                                <div className="flex items-center justify-center text-white mb-1">
                                  {getSocialIcon('x')}
                                </div>
                                <p className="text-sm font-medium text-gray-300">{formatFollowers(creator.x_followers)}</p>
                                <p className="text-xs text-gray-500">Followers</p>
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <div className="grid grid-cols-2 gap-4">
                              {creator.youtube_engagement_rate > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500">Engagement Rate</p>
                                  <p className="text-sm font-medium text-orange-400">{creator.youtube_engagement_rate.toFixed(1)}%</p>
                                </div>
                              )}
                              {creator.tiktok_engagement_rate > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500">Engagement Rate</p>
                                  <p className="text-sm font-medium text-orange-400">{creator.tiktok_engagement_rate.toFixed(1)}%</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {creator.youtube_url && (
                              <a
                                href={creator.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                {getSocialIcon('youtube')}
                                YouTube
                              </a>
                            )}
                            {creator.tiktok_url && (
                              <a
                                href={creator.tiktok_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                {getSocialIcon('tiktok')}
                                TikTok
                              </a>
                            )}
                            {creator.insta_url && (
                              <a
                                href={creator.insta_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                {getSocialIcon('instagram')}
                                Instagram
                              </a>
                            )}
                            {creator.x_url && (
                              <a
                                href={creator.x_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                {getSocialIcon('x')}
                                X
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-96 flex items-center justify-center px-4">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl mx-auto text-center border border-gray-700/50">
                {/* Icons */}
                <div className="flex justify-center items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  🔥 Find Your Perfect Bitcoin Influencers
                </h1>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Get matched with the most relevant bitcoin-only and crypto content creators for your brand in seconds.
                </p>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-orange-500/25"
                >
                  Get My Matches
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}