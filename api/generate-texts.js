// api/generate-texts.js

export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nicho, publico, beneficio } = req.body;

  // Validación rápida de datos
  if (!nicho || !publico || !beneficio) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Actúa como un Copywriter experto en respuesta directa. 
          Genera 4 variantes creativas de textos para una Landing Page basadas en:
          - Nicho: ${nicho}
          - Público: ${publico}
          - Beneficio: ${beneficio}

          Responde EXCLUSIVAMENTE con un objeto JSON que tenga esta estructura exacta:
          {
            "titulos": ["opcion1", "opcion2", "opcion3", "opcion4"],
            "subtitulos": ["opcion1", "opcion2", "opcion3", "opcion4"],
            "descripciones": ["opcion1", "opcion2", "opcion3", "opcion4"],
            "ctas": ["opcion1", "opcion2", "opcion3", "opcion4"]
          }`
        }]
      })
    });

    const data = await response.json();
    
    if (!data.content || data.content.length === 0) {
        throw new Error("La IA no devolvió contenido");
    }

    const textResponse = data.content[0].text;
    const cleanJson = JSON.parse(textResponse);

    return res.status(200).json({
      success: true,
      outputs: cleanJson
    });

  } catch (error) {
    console.error('Error en API:', error);
    return res.status(500).json({ 
      error: 'Error generando textos',
      message: error.message 
    });
  }
}
