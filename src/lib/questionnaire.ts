// Contenido del Cuestionario de Autodiagnóstico SESFI.
// Fuente: docs/Cuestionario de Autodiagnóstico SESFI (1).docx (transcripción verbatim).
// Puntaje: cada opción vale 1..4 puntos. Opción de 1 punto = mayor madurez;
// opción de 4 puntos = organización emergente. (Menor puntaje total = mayor madurez.)

export type Score = 1 | 2 | 3 | 4;

export interface Option {
  score: Score;
  /** Nivel de madurez que representa esta opción. */
  level: string;
  text: string;
}

export interface Question {
  id: string; // "q1".."q10"
  blockId: string; // "b1".."b5"
  title: string;
  options: Option[]; // exactamente 4
}

export interface Block {
  id: string; // "b1".."b5"
  name: string;
  /** Etiqueta corta para el eje de la araña. */
  shortName: string;
}

// Nombres de nivel reutilizados en las opciones.
const L1 = "Escalamiento e impacto transformador";
const L2 = "Innovación institucional";
const L3 = "Construcción y consolidación de capacidades";
const L4 = "Organización emergente";

export const BLOCKS: Block[] = [
  {
    id: "b1",
    name: "Gobierno Institucional y Liderazgo",
    shortName: "Gobierno y Liderazgo",
  },
  {
    id: "b2",
    name: "Sostenibilidad Financiera y Movilización de Recursos",
    shortName: "Sostenibilidad Financiera",
  },
  {
    id: "b3",
    name: "Cumplimiento Contable y Fiscal",
    shortName: "Contable y Fiscal",
  },
  {
    id: "b4",
    name: "Gestión Operativa, Procesos y Talento Humano",
    shortName: "Operación y Talento",
  },
  {
    id: "b5",
    name: "Impacto, Monitoreo, Evaluación y Aprendizaje (MEL)",
    shortName: "Impacto y MEL",
  },
];

export const QUESTIONS: Question[] = [
  // ── BLOQUE 1: Gobierno Institucional y Liderazgo ──────────────────────────
  {
    id: "q1",
    blockId: "b1",
    title: "Operación del Órgano de Gobierno (Patronato / Consejo Directivo)",
    options: [
      {
        score: 1,
        level: L1,
        text: "El Órgano de Gobierno evalúa su propio desempeño anualmente de forma institucional, cuenta con un plan formal de renovación y sucesión, y lidera activamente la resiliencia del ecosistema del sector social.",
      },
      {
        score: 2,
        level: L2,
        text: "El Órgano de Gobierno está activo, cuenta con perfiles profesionales diversos, sesiona con base en comités de trabajo estratégicos y ejerce activamente la supervisión financiera y legal.",
      },
      {
        score: 3,
        level: L3,
        text: "El Órgano de Gobierno existe formalmente y sesiona, pero sus funciones son mayormente notariales o de validación de firmas, sin involucramiento en la planeación a largo plazo.",
      },
      {
        score: 4,
        level: L4,
        text: "No tenemos un Órgano de Gobierno activo o integrado; las decisiones de la organización las toma principalmente la dirección operativa de forma empírica.",
      },
    ],
  },
  {
    id: "q2",
    blockId: "b1",
    title: "Gestión de la Misión y Planeación Estratégica",
    options: [
      {
        score: 1,
        level: L1,
        text: "La planeación estratégica es dinámica, responde ágilmente a crisis o cambios de entorno mediante análisis prospectivos de riesgos y se co-construye con actores clave de la comunidad.",
      },
      {
        score: 2,
        level: L2,
        text: "Contamos con una planeación estratégica vigente (3-5 años) con indicadores clave, y todo el equipo alinea su plan operativo anual a estos objetivos estratégicos.",
      },
      {
        score: 3,
        level: L3,
        text: "Tenemos una misión, visión y plan estratégico documentados, pero raras veces se revisan, no guían la operación del día a día, ni cuentan con metas numéricas claras.",
      },
      {
        score: 4,
        level: L4,
        text: "No contamos con una planeación estratégica escrita ni objetivos a mediano plazo; operamos respondiendo a las urgencias cotidianas.",
      },
    ],
  },

  // ── BLOQUE 2: Sostenibilidad Financiera y Movilización de Recursos ────────
  {
    id: "q3",
    blockId: "b2",
    title: "Diversificación de Fuentes de Ingresos",
    options: [
      {
        score: 1,
        level: L1,
        text: "La organización cuenta con al menos tres fuentes de financiamiento distintas y genera ingresos propios (fondos patrimoniales, venta de servicios o cuotas de recuperación estratégicas) que garantizan su viabilidad.",
      },
      {
        score: 2,
        level: L2,
        text: "Contamos con una mezcla saludable de ingresos (donantes internacionales, empresas locales, convocatorias de fundaciones y donantes individuales) donde ninguna fuente supera el 40% del presupuesto.",
      },
      {
        score: 3,
        level: L3,
        text: "Dependemos de 2 o 3 fuentes de financiamiento estables. Intentamos buscar nuevos fondos, pero no de manera sistemática.",
      },
      {
        score: 4,
        level: L4,
        text: "Dependemos principalmente de una sola fuente de financiamiento (un donante mayoritario, subsidio único o las aportaciones del Órgano de Gobierno / socios fundadores) para cubrir más del 80% de los gastos.",
      },
    ],
  },
  {
    id: "q4",
    blockId: "b2",
    title: "Diseño y Control Presupuestal",
    options: [
      {
        score: 1,
        level: L1,
        text: "Contamos con auditorías externas anuales por parte de firmas externas, software ERP en la nube y un sistema automatizado de alertas presupuestales para mitigar variaciones.",
      },
      {
        score: 2,
        level: L2,
        text: "Cada proyecto tiene un presupuesto detallado que incluye la absorción proporcional de los gastos generales de la OSC; se revisan flujos de efectivo mensuales y se reporta al Órgano de Gobierno.",
      },
      {
        score: 3,
        level: L3,
        text: "Monitoreamos el gasto de manera reactiva (cuando se agotan los fondos de una cuenta o a requerimiento explícito del donante), sin proyecciones financieras preventivas.",
      },
      {
        score: 4,
        level: L4,
        text: "Los presupuestos se calculan de manera global y estimativa. No se realiza un seguimiento técnico ni una conciliación rigurosa frente al gasto real.",
      },
    ],
  },

  // ── BLOQUE 3: Cumplimiento Contable y Fiscal ──────────────────────────────
  {
    id: "q5",
    blockId: "b3",
    title: "Sistema de Registro y Transparencia Contable",
    options: [
      {
        score: 1,
        level: L1,
        text: "El sistema contable está integrado a un ERP o Plataforma Integral de Administración para el sector social. Publicamos los estados financieros auditados en nuestra página web corporativa y hacemos proyecciones automatizadas de flujo.",
      },
      {
        score: 2,
        level: L2,
        text: "Contamos con un sistema contable robusto que permite la contabilidad por proyectos/fondos específicos mediante centros de costos. Generamos Balances Generales y Estados de Actividades mensualmente.",
      },
      {
        score: 3,
        level: L3,
        text: "Utilizamos un software contable estándar. Registramos ingresos y egresos globalmente, pero no tenemos separados de forma clara los gastos operativos de los gastos de cada programa.",
      },
      {
        score: 4,
        level: L4,
        text: "Llevamos el control financiero en hojas de cálculo (Excel) internas o mediante un contador externo que solo procesa facturas al cierre de mes sin generar estados financieros útiles para la toma de decisiones.",
      },
    ],
  },
  {
    id: "q6",
    blockId: "b3",
    title: "Administración de Fondos Restringidos y No Restringidos",
    options: [
      {
        score: 1,
        level: L1,
        text: "Poseemos políticas institucionales para la absorción de costos indirectos (overheads) aceptadas por donantes. El sistema contable bloquea automáticamente sobregiros y desvíos presupuestales en tiempo real.",
      },
      {
        score: 2,
        level: L2,
        text: "Manejamos cuentas bancarias exclusivas o subcuentas contables estrictas para fondos restringidos. Emitimos informes financieros con desglose técnico perfectamente conciliados con facturas y entregables.",
      },
      {
        score: 3,
        level: L3,
        text: "Identificamos cuáles fondos corresponden a proyectos específicos, pero el rastreo de sus gastos se hace de forma manual en carpetas o fuera del sistema contable, dificultando las auditorías.",
      },
      {
        score: 4,
        level: L4,
        text: "Mezclamos todos los ingresos recibidos en una sola cuenta bancaria corriente y los gastamos según las prioridades del momento, sin un rastreo técnico del origen y destino del dinero.",
      },
    ],
  },
  {
    id: "q7",
    blockId: "b3",
    title: "Cumplimiento Legal, Fiscal y Estatus de Deducibilidad",
    options: [
      {
        score: 1,
        level: L1,
        text: "Contamos con un Comité de Cumplimiento Normativo en nuestro Órgano de Gobierno, nos anticipamos a reformas regulatorias (ley de prevención de lavado de dinero, beneficiario controlador), y tenemos un plan de contingencia legal blindado para proteger los activos institucionales.",
      },
      {
        score: 2,
        level: L2,
        text: "Mantenemos una opinión de cumplimiento fiscal positiva permanente, monitoreamos estrictamente el límite de gastos de administración permitidos por ley y presentamos las declaraciones de transparencia gubernamentales a tiempo.",
      },
      {
        score: 3,
        level: L3,
        text: "Cumplimos de manera básica con las declaraciones de impuestos para evitar multas inmediatas, pero carecemos de manuales de políticas de prevención de riesgos o de revisiones legales profundas.",
      },
      {
        score: 4,
        level: L4,
        text: "Presentamos declaraciones solo de forma reactiva o bajo requerimiento formal de la autoridad. Corremos el riesgo constante de multas graves o de perder el estatus de donataria autorizada.",
      },
    ],
  },

  // ── BLOQUE 4: Gestión Operativa, Procesos y Talento Humano ────────────────
  {
    id: "q8",
    blockId: "b4",
    title: "Condiciones Laborales y Gestión del Talento",
    options: [
      {
        score: 1,
        level: L1,
        text: "Contamos con una estrategia integral de marca empleadora para atraer talento, planes de desarrollo de carrera, esquemas avanzados de bienestar/salud mental y planes de sucesión operativa para puestos clave.",
      },
      {
        score: 2,
        level: L2,
        text: "Tenemos políticas de Recursos Humanos estructuradas, contratos individuales firmados bajo la normativa legal vigente, evaluaciones de desempeño anuales y planes de capacitación alineados a la estrategia.",
      },
      {
        score: 3,
        level: L3,
        text: "Existen organigramas y descripciones de puestos básicos, pero las capacitaciones son esporádicas, no hay evaluaciones formales de desempeño y la retención del talento es débil.",
      },
      {
        score: 4,
        level: L4,
        text: "La contratación es informal o mayormente por asimilados/honorarios sin prestaciones; no hay descripciones de puestos y la rotación del personal operativo es muy alta.",
      },
    ],
  },

  // ── BLOQUE 5: Impacto, Monitoreo, Evaluación y Aprendizaje (MEL) ───────────
  {
    id: "q9",
    blockId: "b5",
    title: "Medición y Monitoreo de Resultados",
    options: [
      {
        score: 1,
        level: L1,
        text: "Realizamos evaluaciones de impacto ex-post externas, medimos indicadores de retorno social de la inversión (SROI) y publicamos activamente los hallazgos para incidir en agendas y políticas públicas.",
      },
      {
        score: 2,
        level: L2,
        text: "Contamos con una Teoría del Cambio institucionalizada y una matriz de indicadores (de proceso y resultado) que el equipo recopila sistemáticamente mediante herramientas o plataformas digitales.",
      },
      {
        score: 3,
        level: L3,
        text: "Recolectamos datos numéricos básicos de entregables o actividades (ej. número de despensas entregadas o talleres impartidos), pero no medimos el impacto o cambio real a mediano plazo en los usuarios.",
      },
      {
        score: 4,
        level: L4,
        text: "Evaluamos el éxito del trabajo de manera anecdótica, a través de testimonios aislados, fotografías o listas de asistencia en papel (outputs muy elementales).",
      },
    ],
  },
  {
    id: "q10",
    blockId: "b5",
    title: "Rendición de Cuentas y Transparencia Comunitaria",
    options: [
      {
        score: 1,
        level: L1,
        text: "Co-diseñamos los mecanismos de rendición de cuentas junto con las comunidades beneficiarias, devolviendo los resultados del aprendizaje para empoderar a la propia población objetivo.",
      },
      {
        score: 2,
        level: L2,
        text: "Elaboramos y difundimos anualmente un Informe de Actividades institucional abierto al público, que incluye datos financieros claros y el avance de metas sociales logradas.",
      },
      {
        score: 3,
        level: L3,
        text: "Rendimos cuentas únicamente cuando los donantes específicos lo exigen en sus formatos, sin un ejercicio de transparencia proactiva hacia la sociedad o los beneficiarios.",
      },
      {
        score: 4,
        level: L4,
        text: "No generamos informes públicos de actividades ni contamos con espacios formales para retroalimentar o transparentar las acciones ante terceros.",
      },
    ],
  },
];

export const QUESTION_IDS = QUESTIONS.map((q) => q.id);

export function getBlock(blockId: string): Block | undefined {
  return BLOCKS.find((b) => b.id === blockId);
}
