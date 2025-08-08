
import type { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio'

const corrections: Record<string, string> = {
  ninetails: 'ninetales',
  'farfetchd': "farfetch'd",
  'mr mime': 'mr. mime',
  'mime jr': 'mime jr.',
  'ho oh': 'ho-oh',
  'porygon z': 'porygon-z',
  'type null': 'type: null',
  // Add more as needed
}


// Use PokéAPI as a fallback for Pokémon card data (for demo purposes, as it is not a TCG database)
async function scrapePokeAPI(cardName: string) {
  // PokéAPI is for Pokémon, not cards, but we can use it for demo/fallback
  const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(cardName.toLowerCase())}`;
  const response = await fetch(url);
  if (!response.ok) return { cards: [], html: '' };
  const data = await response.json();
  // Use the Pokémon name and sprite as a card demo
  return {
    cards: [{
      name: data.name,
      price: 0,
      image: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || null,
      source: 'pokeapi'
    }],
    html: JSON.stringify(data)
  };
}

async function scrapePriceCharting(cardName: string) {
  const searchUrl = `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent(cardName)}&category=pokemon-cards`;
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch from PriceCharting');
  const html = await response.text();
  const $ = cheerio.load(html);
  const cards: any[] = [];
  $('#games_table tr').each((_, el) => {
    const $row = $(el);
    const name = $row.find('a.title').text().trim();
    // PriceCharting: Loose price is usually in 4th column, last sold price in 5th
    const loosePrice = $row.find('td:nth-child(4)').text().trim();
    const lastSoldPrice = $row.find('td:nth-child(5)').text().trim();
    const image = $row.find('img').attr('src');
    if (name && (loosePrice || lastSoldPrice)) {
      cards.push({
        name,
        price: parseFloat((lastSoldPrice || loosePrice).replace(/[^0-9.]/g, '')),
        lastSoldPrice: lastSoldPrice ? parseFloat(lastSoldPrice.replace(/[^0-9.]/g, '')) : null,
        loosePrice: loosePrice ? parseFloat(loosePrice.replace(/[^0-9.]/g, '')) : null,
        image,
        source: 'pricecharting'
      });
    }
  });
  return { cards, html };
}
// Pokémon TCG API fallback for card images and set data
async function scrapePokemonTCGApi(cardName: string) {
  const apiKey = '';
  const url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(cardName)}`;
  const response = await fetch(url, {
    headers: apiKey ? { 'X-Api-Key': apiKey } : {}
  });
  if (!response.ok) return { cards: [], html: '' };
  const data = await response.json();
  const cards = (data.data || []).map((card: any) => ({
    name: card.name,
    image: card.images?.large || card.images?.small || null,
    set: card.set?.name || null,
    number: card.number || null,
    rarity: card.rarity || null,
    source: 'pokemontcg.io'
  }));
  return { cards, html: JSON.stringify(data) };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cardName = req.query.name as string;
  if (!cardName) {
    return res.status(400).json({ error: 'Card name is required' });
  }
  try {
    // Try PriceCharting first
    let pc = await scrapePriceCharting(cardName);
  let poke: { cards: any[]; html: string } = { cards: [], html: '' };
    let usedCorrection = null;
    // If no results, try correction
    if (pc.cards.length === 0) {
      const correction = corrections[cardName.trim().toLowerCase()];
      if (correction) {
        usedCorrection = correction;
        pc = await scrapePriceCharting(correction);
      }
    }
    // If still no results, try Pokémon TCG API for card images/data
    let tcgApi = { cards: [], html: '' };
    if (pc.cards.length === 0) {
      tcgApi = await scrapePokemonTCGApi(cardName);
    }
    // If still no results, try PokéAPI as last fallback
    if (pc.cards.length === 0 && tcgApi.cards.length === 0) {
      poke = await scrapePokeAPI(cardName);
    }
    // If no results at all, return raw HTML for debugging
    if (pc.cards.length === 0 && tcgApi.cards.length === 0 && poke.cards.length === 0) {
      return res.status(200).json({ cards: [], usedCorrection, pcHtml: pc.html, tcgApiHtml: tcgApi.html, pokeHtml: poke.html });
    }
    // Combine all results (PriceCharting, Pokémon TCG API, PokéAPI)
    return res.status(200).json({ cards: [...pc.cards, ...tcgApi.cards, ...poke.cards], usedCorrection });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, cards: [] });
  }
}
