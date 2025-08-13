import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const AVAILABLE_CATEGORIES = [
  'art', 'bitcoin', 'builders', 'developers', 'education', 'fees', 
  'hardware', 'lightning', 'macro', 'mining', 'nodes', 'onchain', 
  'ordinals', 'privacy', 'security', 'trading'
]

export async function POST(request: NextRequest) {
  try {
    const { productDescription } = await request.json()

    if (!productDescription) {
      return NextResponse.json(
        { error: 'Product description is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a product categorization expert. Given a product description, you must categorize it into ONE of these Bitcoin/crypto-related categories: ${AVAILABLE_CATEGORIES.join(', ')}.

Rules:
- Return ONLY the category name, nothing else
- Choose the most relevant category
- If the product doesn't clearly fit any category, choose 'bitcoin' as default
- Categories explained:
  - art: NFTs, digital art, creative content
  - bitcoin: General Bitcoin products/services
  - builders: Development tools, infrastructure
  - developers: Programming, coding tools
  - education: Learning, tutorials, courses
  - fees: Transaction fees, fee optimization
  - hardware: Physical devices, wallets
  - lightning: Lightning Network related
  - macro: Economics, market analysis
  - mining: Bitcoin mining
  - nodes: Node software, infrastructure
  - onchain: On-chain analysis, tools
  - ordinals: Bitcoin Ordinals, inscriptions
  - privacy: Privacy tools, anonymity
  - security: Security tools, auditing
  - trading: Trading tools, exchanges`
        },
        {
          role: 'user',
          content: `Categorize this product: ${productDescription}`
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    })

    const category = completion.choices[0]?.message?.content?.trim().toLowerCase()

    // Validate that the returned category is in our list
    if (!category || !AVAILABLE_CATEGORIES.includes(category)) {
      return NextResponse.json({ category: 'bitcoin' }) // Default fallback
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error categorizing product:', error)
    return NextResponse.json(
      { error: 'Failed to categorize product', category: 'bitcoin' },
      { status: 500 }
    )
  }
}