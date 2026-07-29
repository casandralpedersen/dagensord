const SYSTEM = 'Du er en præcis tosproget ordbog (dansk og engelsk). Du giver korte definitioner i ordbogsstil.';

const SCHEMA = {
  type: 'object',
  properties: {
    def: { type: 'string' },
    comment: { type: 'string' },
    quote: { type: 'string' },
  },
  required: ['def', 'comment', 'quote'],
  additionalProperties: false,
};

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  let word, lang;
  try {
    ({ word, lang } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { error: 'Ugyldig forespørgsel' });
  }
  if (!word || !String(word).trim()) return json(400, { error: 'Intet ord angivet' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(500, { error: 'API-nøgle ikke konfigureret' });

  const isEn = lang === 'en';
  const prompt = isEn
    ? `Look up the English word "${word}".\n"def": a concise English dictionary definition (1-2 sentences).\n"comment": a short Danish translation of the word (e.g. "Voksende / hastigt fremvoksende").\n"quote": a short example sentence in English using the word, or an empty string.`
    : `Slå det danske ord "${word}" op. Giv en kort, præcis definition i stil med Den Danske Ordbog.\n"def": selve definitionen (1-2 sætninger, ordbogsstil).\n"comment": en kort nuance eller note hvis relevant, ellers en tom streng.\n"quote": et kort eksempel på ordet brugt i en sætning, ellers en tom streng.`;

  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        system: SYSTEM,
        output_config: { format: { type: 'json_schema', schema: SCHEMA } },
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    return json(502, { error: 'Kunne ikke nå AI-tjenesten' });
  }

  if (!res.ok) return json(502, { error: 'AI-opslag fejlede' });

  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b.type === 'text');
  if (!textBlock) return json(502, { error: 'Tomt svar fra AI' });

  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return json(502, { error: 'Kunne ikke læse svaret' });
  }

  return json(200, {
    def: parsed.def || '',
    comment: parsed.comment || '',
    quote: parsed.quote || '',
  });
};
