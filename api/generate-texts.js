// api/generate-texts.js

export default async function handler(req, res) {
  // IMPORTANTE: Permitir solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nicho, publico, beneficio, modoIA, configAgencia } = req.body;

    // Aquí va tu lógica para llamar a Claude AI o generar textos
    // Por ahora devolvemos mock data:

    return res.status(200).json({
      success: true,
      outputs: {
        titulos: [
          `Transforma tu consulta dental con ${beneficio}`,
          `La solución que los ${nicho} estaban esperando`,
          `Descubre cómo atraer más ${publico} hoy`,
          `El secreto de los ${nicho} exitosos`
        ],
        subtitulos: [
          "Tecnología de punta al alcance de tu mano",
          "Resultados garantizados en 30 días",
          "Más de 500 profesionales ya lo usan",
          "La inversión que tu práctica necesita"
        ],
        descripciones: [
          `Especializado para ${nicho} que buscan conectar con ${publico} de manera efectiva.`,
          `La herramienta definitiva para profesionales del sector ${nicho}.`,
          `Diseñado específicamente para captar la atención de ${publico}.`,
          `La estrategia de ${beneficio} que está revolucionando el sector.`
        ],
        ctas: [
          "Quiero mi consulta gratuita",
          "Descubrir cómo funciona",
          "Empezar ahora",
          "Sí, quiero más información"
        ]
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Error generando textos',
      message: error.message 
    });
  }
}
