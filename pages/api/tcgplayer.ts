import type { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cardName = req.query.name as string
  if (!cardName) {
    return res.status(400).json({ error: 'Card name is required' })
  }
  try {
    const searchUrl = `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(cardName)}`
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    if (!response.ok) throw new Error('Failed to fetch from TCGPlayer')
    const html = await response.text()
    const $ = cheerio.load(html)
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
    return res.status(200).json({ cards })
  } catch (error: any) {
    return res.status(500).json({
      cards: [{
        name: cardName,
        price: Math.floor(Math.random() * 100) + 10,
        image: '/placeholder.svg?height=200&width=150',
        source: 'mock'
      }],
      error: error.message
    })
  }
}
