export interface PollAnalysisResult {
  audienceReality: string;
  strategicReflection: string;
}

export async function generatePollAnalysis(
  pollId: string,
  pollTitle: string,
  options: string[],
  stats: { counts: { [idx: number]: number }; total: number; max: number }
): Promise<PollAnalysisResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

  // Prepare vote distribution summary
  const summaryLines = options.map((opt, idx) => {
    const count = stats.counts[idx] || 0;
    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
    return `• ${opt}: ${pct}% (${count} votos)`;
  });

  const prompt = `
Encuesta: "${pollTitle}"
Total de respuestas registradas: ${stats.total}

Distribución de votos:
${summaryLines.join('\n')}

Instrucciones:
Actúa como Lucas Marinero, especialista en transformación digital y estrategia de personas en la industria minera.
Analiza la distribución real de votos de esta sala y devuelve un JSON estrictamente válido con dos campos:
{
  "audienceReality": "Diagnóstico conciso de 2-3 oraciones explicando con precisión qué revela esta votación sobre la realidad actual de las empresas mineras de la audiencia.",
  "strategicReflection": "Reflexión ejecutiva de 2-3 oraciones sobre las implicancias estratégicas y operacionales de este escenario, y cuál es la palanca directiva para avanzar."
}
No menciones jamás que eres una inteligencia artificial, no uses frases como "Como modelo de lenguaje" ni "generado con IA". Mantén un tono directivo, riguroso, industrial y propositivo.
`;

  // Try calling OpenAI API if key is present
  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres Lucas Marinero, asesor ejecutivo de talento y datos en minería. Responde exclusivamente con un JSON válido conteniendo las claves "audienceReality" y "strategicReflection".'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 350
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.audienceReality && parsed.strategicReflection) {
            return {
              audienceReality: parsed.audienceReality,
              strategicReflection: parsed.strategicReflection
            };
          }
        }
      }
    } catch (e) {
      console.warn('OpenAI live call note, using fallback diagnosis:', e);
    }
  }

  // Robust contextual fallback matching question & leading vote
  return getContextualFallback(pollId, options, stats);
}

function getContextualFallback(
  pollId: string,
  options: string[],
  stats: { counts: { [idx: number]: number }; total: number; max: number }
): PollAnalysisResult {
  // Find leading option
  let maxIdx = 0;
  let maxVotes = 0;
  options.forEach((_, idx) => {
    const c = stats.counts[idx] || 0;
    if (c > maxVotes) {
      maxVotes = c;
      maxIdx = idx;
    }
  });

  const leadingOption = options[maxIdx] || '';
  const total = stats.total;
  const pct = total > 0 ? Math.round((maxVotes / total) * 100) : 0;

  if (pollId === 'q1') {
    if (leadingOption.includes('Manual')) {
      return {
        audienceReality: `El ${pct}% de la sala reconoce que su gestión aún depende en gran medida de procesos manuales y planillas dispersas. Esto evidencia una brecha operativa importante donde el tiempo del equipo se consume en consolidar registros en lugar de anticipar necesidades en faena.`,
        strategicReflection: `El paso inicial no es saltar a modelos predictivos complejos, sino ordenar la base técnica: estandarizar planillas, digitalizar la captura en origen y garantizar un repositorio unificado antes de pretender automatizar.`
      };
    } else if (leadingOption.includes('Inteligente')) {
      return {
        audienceReality: `Un destacado ${pct}% de las empresas presentes ya opera con ecosistemas integrados y analítica avanzada. Esta madurez sitúa a la sala en una posición privilegiada para capitalizar la IA como copiloto predictivo en dotación y seguridad.`,
        strategicReflection: `Con la infraestructura resuelta, el desafío crítico radica en la adopción cultural: asegurar que la supervisión en terreno confíe en las recomendaciones de los modelos y las traduzca en decisiones oportunas.`
      };
    } else {
      return {
        audienceReality: `La mayoría de la sala (${pct}%) se encuentra en la etapa de silos digitales: herramientas en la nube activas pero desconectadas entre sí. Esta fragmentación genera duplicidad de tareas y visiones parciales del capital humano en faena.`,
        strategicReflection: `La prioridad estratégica debe centrarse en la interoperabilidad y gobernanza de datos. Unificar las fuentes de información es la condición indispensable para que cualquier iniciativa de analítica entregue valor confiable.`
      };
    }
  }

  if (pollId === 'q2') {
    if (leadingOption.includes('Ingreso')) {
      return {
        audienceReality: `El ${pct}% de la audiencia identifica el proceso de acreditación e ingreso a mina como el principal cuello de botella. La burocracia documental y las validaciones cruzadas siguen frenando la disponibilidad oportuna de técnicos en terreno.`,
        strategicReflection: `Automatizar la validación de certificaciones y exámenes mediante agentes inteligentes reduce hasta un 70% los tiempos muertos, convirtiendo un trámite administrativo en un acelerador operacional directo.`
      };
    } else if (leadingOption.includes('Selección')) {
      return {
        audienceReality: `El filtrado de perfiles técnicos calificados representa la mayor fricción para el ${pct}% de los presentes. La escasez de competencias específicas en minería exige revisar cientos de postulaciones con criterios a menudo desactualizados.`,
        strategicReflection: `Incorporar modelos de selección predictiva basados en datos históricos de desempeño permite identificar candidatos idóneos con mayor rapidez y menor índice de rotación en alta montaña.`
      };
    } else {
      return {
        audienceReality: `La búsqueda de normativas y convenios colectivos es el punto de mayor fricción para el ${pct}% de la sala. La dispersión de documentos genera dudas operativas y ralentiza la respuesta ante consultas gremiales y laborales.`,
        strategicReflection: `La implementación de arquitecturas RAG como el Proyecto Simón resuelve este obstáculo de raíz: consultas en lenguaje natural respaldadas exclusivamente en la documentación oficial de la compañía.`
      };
    }
  }

  if (pollId === 'q3') {
    if (leadingOption.includes('Poca')) {
      return {
        audienceReality: `Un contundente ${pct}% de la audiencia manifiesta baja confianza en la precisión de los reportes de personas que llegan a la gerencia. Esta falta de fiabilidad frena la toma de decisiones ágiles y debilita la credibilidad del área.`,
        strategicReflection: `Urge auditar los flujos de captura de datos y erradicar la manipulación manual de planillas. La gobernanza y la trazabilidad en tiempo real son la única vacuna contra la inconsistencia informativa.`
      };
    } else if (leadingOption.includes('Alta')) {
      return {
        audienceReality: `El ${pct}% de los participantes cuenta con métricas consolidadas y trazables en tiempo real. Esta solidez analítica posiciona a sus áreas de personas como socios estratégicos indiscutibles de la operación.`,
        strategicReflection: `El siguiente salto consiste en pasar de la reportería descriptiva a la analítica prescriptiva: simular escenarios de dotación, descansos y retención antes de que los desvíos impacten en los costos.`
      };
    } else {
      return {
        audienceReality: `Para el ${pct}% de la sala, las métricas son aceptables pero requieren un esfuerzo manual desmedido de reconciliación previo a cada comité de gerencia. La certidumbre existe, pero a un costo de horas-hombre insostenible.`,
        strategicReflection: `La automatización de tableros directivos y la sincronización continua liberan a los analistas para dedicarse a la interpretación contextual y a la estrategia de retención del talento.`
      };
    }
  }

  // Fallback for q4 (Frenos de IA)
  if (leadingOption.includes('Cultura')) {
    return {
      audienceReality: `El ${pct}% de los asistentes coincide en que la resistencia al cambio y la cultura organizacional representan el freno primordial para adoptar IA. El temor al reemplazo y la inercia de métodos tradicionales ralentizan la modernización.`,
      strategicReflection: `La tecnología es apenas el acelerador; la convicción de las personas es el verdadero motor. Cualquier despliegue técnico debe acompañarse de liderazgo visible, transparencia y capacitación continua para demostrar que la IA amplifica las capacidades humanas.`
    };
  } else if (leadingOption.includes('Legados') || leadingOption.includes('Sistemas')) {
    return {
      audienceReality: `El desorden de datos legados y la obsolescencia de sistemas informáticos frenan al ${pct}% de las organizaciones presentes. La deuda técnica acumulada impide conectar herramientas modernas de inteligencia artificial.`,
      strategicReflection: `Es imprescindible encarar una modernización progresiva de la arquitectura de datos, priorizando casos de uso de alto impacto inmediato que justifiquen la inversión en infraestructura hacia adelante.`
    };
  } else {
    return {
      audienceReality: `El ${pct}% de la sala identifica la escasez de talento especializado en datos como la traba crítica. La minería compite globalmente por científicos de datos e ingenieros de machine learning capacitados.`,
      strategicReflection: `La solución directiva pasa por formar talento interno combinando experiencia operativa de terreno con habilidades digitales, y democratizar el acceso mediante copilotos intuitivos que no requieran programación avanzada.`
    };
  }
}
