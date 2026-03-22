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

  const prompt = `Sos un copywriter de respuesta directa de élite. ${ctxAgencia}
DATOS:
- Producto/Servicio: ${nicho}
- Audiencia: ${publico}
- Beneficio clave: ${beneficio}
- Idioma: Español rioplatense argentino. Sin "usted". Sin jerga corporativa. Informal y directo.

Vas a generar 4 secciones de copy. Cada una con una metodología diferente. Seguí las instrucciones al pie de la letra.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECCIÓN 1 — TÍTULOS H1 (Método Eugene Schwartz)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actuá como Eugene Schwartz. Escribí 4 títulos para la landing de "${nicho}".
NO uses beneficios genéricos. Identificá el Deseo de Masa dominante de ${publico} y construí una Promesa de Mecanismo Único.
Cada título debe ser una afirmación tan audaz que sea imposible de ignorar.
Atacá desde uno de estos ángulos (uno diferente por título):
- Curiosidad negativa: lo que están perdiendo por no saber esto
- Beneficio contraintuitivo: el resultado que van contra la lógica común
- Resultado específico con número o dato concreto
- Mecanismo secreto o nuevo camino que otros no conocen
Máx 10 palabras por título. Sin signos de admiración al inicio. Sin adjetivos vacíos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECCIÓN 2 — SUBTÍTULOS H2 (Método Dan Kennedy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actuá como Dan Kennedy. Escribí 4 subtítulos que agiten el dolor específico de ${publico}.
Describí la frustración actual del usuario mejor de lo que ellos mismos pueden hacerlo.
Sé directo, empático y brutalmente honesto. Que el usuario piense: "esto me está leyendo la mente".
Podés usar estructuras como "Mientras otros [error común], vos [resultado extraordinario]" pero no es obligatorio — priorizá que duela y resuene.
Máx 18 palabras. Sin exclamaciones. Sin frases corporativas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECCIÓN 3 — DESCRIPCIONES (Método Russell Brunson — Bridge Script)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actuá como Russell Brunson. Escribí 4 descripciones de 2-3 oraciones cortas usando el Bridge Script:
- Oración 1 (El Muro): el problema concreto que frena a ${publico} hoy
- Oración 2 (La Epifanía): el descubrimiento del nuevo camino — "${nicho}" como revelación
- Oración 3 (El Vehículo): cómo "${nicho}" es el puente más rápido al resultado final
Usá palabras de poder. Sin adverbios débiles (muy, bastante, realmente). 100% enfocado en la transformación del Estado A al Estado B.
Máx 40 palabras por descripción. Lectura fluida y cargada de autoridad.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECCIÓN 4 — CTAs (Método Direct Response)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actuá como un Copywriter de Respuesta Directa de élite. Escribí 4 Call to Actions.
PROHIBIDO usar: "Enviar", "Comprar", "Contactar", "Consultar".
Deben ser Comandos de Resultado — el usuario se imagina el resultado al leerlos.
Atacá la objeción del riesgo con garantía implícita y reforzá la gratificación instantánea.
Ejemplos de estructura (no copiar, inspirarse): "Quiero [resultado] ahora", "Dame acceso al [mecanismo]", "Empezá hoy mismo".
Máx 5 palabras por CTA.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAMBIÉN GENERÁ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOQUE PROBLEMA: Un título corto (máx 10 palabras) que nombre el dolor principal de ${publico} en ${nicho}. Que duela. Y un texto de 2 oraciones que describa ese dolor con detalles específicos del nicho — lo que SIENTEN, no lo que hacen. Sin ofrecer solución todavía.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE RESPUESTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respondé ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones, sin texto antes o después:
{
  "titulos": ["título 1", "título 2", "título 3", "título 4"],
  "subtitulos": ["subtítulo 1", "subtítulo 2", "subtítulo 3", "subtítulo 4"],
  "descripciones": ["descripción 1", "descripción 2", "descripción 3", "descripción 4"],
  "ctas": ["cta 1", "cta 2", "cta 3", "cta 4"],
  "problemaTitle": "título del bloque problema",
  "problemaText": "texto de agitación 2 oraciones específicas"
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
        max_tokens: 3000,
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
