const defaultModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const apiKey = process.env.ANTHROPIC_API_KEY;

const brandSystem =
  'You are the LoLo Style Concierge, the in-house style advisor for Lolo Fashion House, a lolo fashion house based in Nairobi, Kenya. Keep answers warm, specific, and short. Stay grounded in wedding gowns, ruracio and traditional wear, ankara and kitenge, senator suits, bridesmaid dresses, and kaftans. If asked about unrelated topics, gently redirect back to styling and fittings.';

async function callAnthropic(messages, system, maxTokens = 350) {
  if (!apiKey) {
    return null;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: defaultModel,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error('Anthropic request failed');
  }

  const data = await response.json();
  return (data.content || []).map((block) => block.text || '').join('\n').trim();
}

function keywordReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('timeline') || lower.includes('how long')) {
    return 'A custom gown or ceremonial outfit usually needs a few fitting cycles, so the safest approach is to start early. The exact timeline depends on fabric, embellishment, and the event date.';
  }
  if (lower.includes('fabric') || lower.includes('material')) {
    return 'For outdoor ceremonies, breathable fabrics like crepe, chiffon, or lighter structured textiles work beautifully. If you want a more dramatic finish, we can layer the look with strategic lining and detail work.';
  }
  if (lower.includes('bridesmaid')) {
    return 'Bridesmaids look best when the palette is coordinated but the silhouettes are adjusted to each person. We usually balance movement, comfort, and the overall photography mood.';
  }
  if (lower.includes('ruracio')) {
    return 'For ruracio, the strongest looks usually combine structure, warm color, and visible craftsmanship. Gold and ivory accents are especially elegant when paired with rich fabric texture.';
  }
  return 'LoLo can help you choose a collection, refine the silhouette, and plan the fitting timeline. Tell me the occasion, the date, and the style direction you want.';
}

export async function getChatReply(message) {
  const reply = await callAnthropic(
    [{ role: 'user', content: message }],
    brandSystem,
    280,
  );

  return reply || keywordReply(message);
}

export async function getInsight() {
  const reply = await callAnthropic(
    [{ role: 'user', content: 'Give one short fashion insight for a Kenyan lolo fashion house. Return plain text only.' }],
    'You are a concise fashion trend analyst writing client-facing notes for Lolo Fashion House.',
    120,
  );

  return (
    reply ||
    'Soft metallic accents and ivory bridal tones are trending this season for outdoor weddings and family ceremonies.'
  );
}

export async function analyzeStyleImage({ base64, mediaType }) {
  const reply = await callAnthropic(
    [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: 'text',
            text:
              'Return only raw JSON with keys silhouette, fabric, collection, tip. The collection value must be one of Wedding Gowns, Ruracio & Traditional Wear, Ankara & Kitenge, Senator Suits & Menswear, Bridesmaid Dresses, or Kaftans.',
          },
        ],
      },
    ],
    'You are a luxury fashion stylist matching inspiration images to Lolo Fashion House collections.',
    240,
  );

  if (reply) {
    try {
      return JSON.parse(reply.replace(/```json|```/g, '').trim());
    } catch {
      // fall through to heuristic response
    }
  }

  const collection =
    mediaType?.includes('png') || mediaType?.includes('jpeg')
      ? 'Wedding Gowns'
      : 'Ankara & Kitenge';

  return {
    silhouette: 'Tailored and polished',
    fabric: 'Structured luxury fabric',
    collection,
    tip: 'Keep accessories refined so the main silhouette stays elegant.',
  };
}