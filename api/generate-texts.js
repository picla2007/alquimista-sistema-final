const generarTextos = async () => {
    setGenerando(true);
    // Reseteamos selecciones previas
    setVarSel({titulo:null, subtitulo:null, descripcion:null, cta:null});
    
    try {
        const response = await fetch('/api/generate-texts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nicho, publico, beneficio, modoIA, nombreInterno})
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Error al generar textos');

        if (data.success && data.outputs) {
            setOutputs(data.outputs);
            setFiltroAntiCuriosos(true);

            // Cargamos los bloques de problema si vienen en la respuesta
            if (data.outputs.problemaTitle) {
                setProblemaTitle(data.outputs.problemaTitle);
            }
            if (data.outputs.problemaText) {
                setProblemaText(data.outputs.problemaText);
            }
            
            mostrarToast('✅ ¡Textos generados con éxito!', 'success');
        } else {
            throw new Error('Estructura de respuesta inválida');
        }

    } catch (error) {
        mostrarToast(`❌ Error: ${error.message}`, 'error');
        console.error("Fallo en la generación:", error);
    } finally {
        setGenerando(false);
    }
};
