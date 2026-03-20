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

  const ctxAgencia = modoIA === 'agencia' && nombreInterno ? `Proyecto: "${nombreInterno}". ` : '';

  const prompt = `Sos un copywriter de respuesta directa de élite. Tus textos generan conversiones reales, no suenan a IA genérica.

${ctxAgencia}DATOS DEL NEGOCIO:
- Nicho: ${nicho}
- Público objetivo: ${publico}
- Beneficio clave: ${beneficio}

TU TAREA: 4 variantes RADICALMENTE DISTINTAS entre sí. Cada una ataca desde un ángulo completamente diferente. Si dos variantes se parecen aunque sea un poco, fallaste.

ÁNGULOS OBLIGATORIOS — uno por variante, en este orden:

VARIANTE 1 — DOLOR ESPECÍFICO
Nombrá el problema más concreto que vive ${publico} todos los días. Metete en su cabeza. Usá situaciones reales del nicho ${nicho}. Que duela.

VARIANTE 2 — RESULTADO TRANSFORMADOR
Pintá el "después". Cómo es la vida de ${publico} cuando logra el resultado. Cinematográfico. Sin mencionar el producto, solo la transformación. Que se vean ahí.

VARIANTE 3 — AUTORIDAD + PRUEBA
Posicioná ${nicho} como la referencia. Datos concretos, resultados específicos, método probado. Que piensen "estos saben de qué hablan".

VARIANTE 4 — URGENCIA + COSTO DE INACCIÓN
Qué pierde ${publico} cada día que no actúa. FOMO creíble y específico para su situación. No genérico.

REGLAS (no negociables):
- H1: Máx 10 palabras. Para el scroll. Sin signos de admiración al inicio.
- H2: Complementa el H1. Máx 15 palabras.
- Descripción: 2-3 oraciones. Gancho → profundidad → consecuencia. Máx 40 palabras.
- CTA: Máx 4 palabras. Primera persona. Verbo concreto. Ej: "Quiero mis resultados", "Reservá mi lugar".
- Español rioplatense argentino. Sin "usted". Sin jerga corporativa.
- PROHIBIDO: "potencial", "solución", "experto", "profesional", "calidad", "excelencia", "innovador".

BLOQUE PROBLEMA:
- Título: Pregunta o afirmación que duela. Máx 10 palabras.
- Texto: 2 oraciones con detalles específicos de ${nicho}. Lo que SIENTEN, no lo que hacen. Sin ofrecer solución.

JSON válido únicamente, sin markdown:
{
  "titulos": ["h1_1", "h1_2", "h1_3", "h1_4"],
  "subtitulos": ["h2_1", "h2_2", "h2_3", "h2_4"],
  "descripciones": ["desc_1", "desc_2", "desc_3", "desc_4"],
  "ctas": ["cta_1", "cta_2", "cta_3", "cta_4"],
  "problemaTitle": "título del bloque problema",
  "problemaText": "texto agitación 2 oraciones específicas para ${nicho}"
}`;

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
        max_tokens: 2500,
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
