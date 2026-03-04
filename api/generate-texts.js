// api/generate-texts.js  (o .ts si usas TypeScript)

export default async function handler(req, res) {
  // IMPORTANTE: Permitir solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nicho, publico, beneficio, modoIA, configAgencia } = req.body;

    // Aquí va tu lógica para llamar a Claude AI o generar textos
    
    return res.status(200).json({
      success: true,
      outputs: {
        titulos: ["Título 1", "Título 2", "Título 3", "Título 4"],
        subtitulos: ["Subtítulo 1", "Subtítulo 2", "Subtítulo 3", "Subtítulo 4"],
        descripciones: ["Desc 1", "Desc 2", "Desc 3", "Desc 4"],
        ctas: ["CTA 1", "CTA 2", "CTA 3", "CTA 4"]
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Error generando textos',
      message: error.message 
    });
  }
}
