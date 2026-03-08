const generarTextos = async () => {
    setGenerando(true);
    // Limpiamos los textos anteriores antes de generar nuevos
    setVarSel({titulo: null, subtitulo: null, descripcion: null, cta: null});

    try {
        const response = await fetch('/api/generate-texts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nicho, publico, beneficio, modoIA, nombreInterno })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Si todo salió bien, guardamos los resultados
            setOutputs(data.outputs);
            setVarianteActual(0);
            mostrarToast('✅ ¡Textos generados con éxito!', 'success');
        } else {
            // Si el servidor responde con un error, lo lanzamos al catch
            throw new Error(data.message || 'Estructura de respuesta inválida');
        }

    } catch (error) {
        // Aquí capturamos cualquier fallo y mostramos el aviso en pantalla
        mostrarToast(`❌ Error: ${error.message}`, 'error');
        console.error("Error al generar:", error);

    } finally {
        // Esto se ejecuta siempre para que el botón deje de estar "cargando"
        setGenerando(false);
    }
};
