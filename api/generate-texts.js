export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nicho, publico, beneficio, modoIA, nombreInterno } = req.body;

  if (!nicho || !publico || !beneficio) {
    return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
  }

  const contextoAgencia = modoIA === 'agencia' && nombreInterno
    ? `Nombre interno del proyecto: "${nombreInterno}". `
    : '';

  const prompt = `Sos un experto en copywriting de alta conversión para landing pages.
${contextoAgencia}Generá textos persuasivos para una landing page con estos datos:
- Nicho/Servicio: ${nicho}
- Público objetivo: ${publico}
- Beneficio principal: ${beneficio}

Generá exactamente 4 variantes de cada elemento, usando los 4 ángulos psicológicos: DOLOR, TRANSFORMACIÓN, AUTORIDAD y URGENCIA/FOMO.

También generá UN bloque de "Problema/Urgencia" coherente con el nicho "${nicho}". Este bloque agita el dolor del prospecto antes de mostrar la solución.

Respondé ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin backticks:
{
  "titulos": ["titulo1", "titulo2", "titulo3", "titulo4"],
  "subtitulos": ["subtitulo1", "subtitulo2", "subtitulo3", "subtitulo4"],
  "descripciones": ["descripcion1", "descripcion2", "descripcion3", "descripcion4"],
  "ctas": ["cta1", "cta2", "cta3", "cta4"],
  "problemaTitle": "Título corto y poderoso que nombra el dolor principal del prospecto para el nicho ${nicho} (máx 12 palabras)",
  "problemaText": "Párrafo de 2-3 oraciones que agita el problema específico de ${nicho}. Habla directamente al prospecto en segunda persona, describe cómo se siente el dolor en su día a día, sin ofrecer solución todavía."
}

Reglas:
- H1 títulos: poderosos, específicos, máx 12 palabras
- H2 subtítulos: complementan el H1, agregan contexto o prueba social
- Descripciones: 2-3 oraciones que profundizan el beneficio y conectan emocionalmente
- CTAs: verbos de acción directa, máx 5 palabras, primera persona cuando aplica
- Todo en español rioplatense (Argentina)
- Sin comillas dobles dentro de los strings (usar comillas simples si es necesario)`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    let outputs;
    try {
      const clean = content.replace(/```json|```/g, '').trim();
      outputs = JSON.parse(clean);
    } catch (e) {
      throw new Error('Error al parsear respuesta de Claude');
    }

    if (!outputs.titulos || !Array.isArray(outputs.titulos) || outputs.titulos.length < 4) {
      throw new Error('Respuesta incompleta de Claude');
    }

    return res.status(200).json({ success: true, outputs });

  } catch (error) {
    console.error('Error en generate-texts:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
