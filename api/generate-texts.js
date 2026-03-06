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
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Eres un experto en copywriting de conversión y marketing directo para landing pages de alta performance. Tu especialidad es crear textos que conviertan visitantes en leads usando técnicas avanzadas de persuasión.

REGLAS ABSOLUTAS:
- Cada variante debe usar un ángulo psicológico COMPLETAMENTE DIFERENTE entre sí
- Nunca repitas estructuras, palabras clave ni enfoques entre variantes
- Los textos deben sonar humanos, naturales y específicos al nicho (NUNCA genéricos)
- Incluí números, datos o detalles concretos cuando sumen credibilidad
- El idioma de salida debe coincidir con el idioma del nicho/público recibido

ÁNGULOS PSICOLÓGICOS (uno por variante, en este orden):
V1 - DOLOR: Apuntá al problema más doloroso del público. La frustración que siente hoy mismo.
V2 - TRANSFORMACIÓN: Pintá el "después". Cómo será su vida, negocio o situación luego del servicio.
V3 - AUTORIDAD: Posicioná al profesional/marca como la opción más confiable, experta y probada del mercado.
V4 - URGENCIA/FOMO: Generá miedo a perderse la oportunidad. Escasez real, ventana de tiempo o consecuencia de no actuar.

Respondé ÚNICAMENTE con un objeto JSON válido, sin explicaciones ni bloques markdown. Estructura exacta:
{
  "titulos": ["V1 título", "V2 título", "V3 título", "V4 título"],
  "subtitulos": ["V1 subtítulo", "V2 subtítulo", "V3 subtítulo", "V4 subtítulo"],
  "descripciones": ["V1 descripción de 2-3 oraciones", "V2 descripción", "V3 descripción", "V4 descripción"],
  "ctas": ["V1 botón CTA", "V2 botón CTA", "V3 botón CTA", "V4 botón CTA"]
}`,
        messages: [{
          role: "user",
          content: `Generá 4 variantes A/B para una landing page con estos datos:

NICHO: ${nicho}
PÚBLICO OBJETIVO: ${publico}
BENEFICIO / OFERTA PRINCIPAL: ${beneficio}

Recordá aplicar en orden:
- V1: ángulo DOLOR → qué problema/frustración tiene el público HOY
- V2: ángulo TRANSFORMACIÓN → cómo cambiará su situación con el servicio
- V3: ángulo AUTORIDAD → por qué este profesional/marca es la mejor opción
- V4: ángulo URGENCIA → por qué actuar ahora y no después

Los CTAs deben ser botones de acción concretos (2-5 palabras), específicos para el nicho.`
        }]
      })
    });

    const data = await response.json();

    if (!data.content || data.content.length === 0) {
      throw new Error("La IA no devolvió contenido");
    }

    const textResponse = data.content[0].text;

    // Limpiar posibles bloques markdown antes de parsear
    const cleanText = textResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const cleanJson = JSON.parse(cleanText);

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
