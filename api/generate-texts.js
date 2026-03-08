const generarTextos = async () => {
    setGenerando(true);
    try {
      const response = await fetch('/api/generate-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.outputs) {
        setOutputs(data.outputs);
        setVarianteActual(0);
        mostrarToast('✅ ¡Textos generados con éxito!', 'success');
      } else {
        // Lanza el error si la respuesta no es la esperada
        throw new Error(data.message || 'Estructura de respuesta inválida');
      }
    } catch (error) {
      // Captura el error y lo muestra en el Toast
      mostrarToast(`❌ Error: ${error.message}`, 'error');
    } finally {
      // Apaga el spinner o estado de carga siempre, falle o no
      setGenerando(false);
    }
  };
