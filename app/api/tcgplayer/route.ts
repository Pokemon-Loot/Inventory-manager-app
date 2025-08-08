import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cardName = searchParams.get('name')

  if (!cardName) {
    return NextResponse.json({ error: 'Card name is required' }, { status: 400 })
  }

  try {
    // Search TCGPlayer for the card
    const searchUrl = `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(cardName)}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from TCGPlayer')
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract card information
    const cards: any[] = []
    
    $('.search-result').each((index, element) => {
      const $card = $(element)
      const name = $card.find('.product-name').text().trim()
      const price = $card.find('.price').text().trim()
      const image = $card.find('img').attr('src')
      
      if (name && price) {
        cards.push({
          name,
          price: parseFloat(price.replace(/[^0-9.]/g, '')),
          image,
          source: 'tcgplayer'
        })
      }
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('TCGPlayer scraping error:', error)
    
    // Return mock data as fallback
    return NextResponse.json({
      cards: [{
        name: cardName,
        price: Math.floor(Math.random() * 100) + 10,
        image: '/placeholder.svg?height=200&width=150',
        source: 'mock'
      }]
    })
  }
}
