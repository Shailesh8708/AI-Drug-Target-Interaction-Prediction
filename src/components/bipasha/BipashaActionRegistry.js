/**
 * BipashaActionRegistry.js
 * Centralized registry and intent orchestrator for Bipasha Mam AI Agent.
 *
 * Defines all 10 core modules, staged cinematic loading sequences,
 * natural language intent recognition, and safety guardrails.
 */

export const BIPASHA_ACTIONS = [
  {
    id: 'dti',
    label: 'DTI Lab',
    category: 'Discovery',
    iconName: 'FlaskConical',
    description: 'Drug–Target Interaction Prediction and affinity scoring pipeline',
    route: 'dti',
    animationType: 'dti',
    color: '#10b981',
    badge: 'Research',
    stages: [
      { min: 0, max: 20, text: 'Initializing Bio-Tensor Engine...', subtext: 'Calibrating SMILES tokenizer and feature matrices' },
      { min: 21, max: 45, text: 'Mapping Target Protein Topology...', subtext: 'Aligning amino acid sequences with binding pockets' },
      { min: 46, max: 70, text: 'Synthesizing Interaction Graph...', subtext: 'Connecting molecular fingerprints to target nodes' },
      { min: 71, max: 88, text: 'Evaluating Model Ensembles...', subtext: 'Simulating computational affinity distributions' },
      { min: 89, max: 100, text: 'DTI Laboratory Online', subtext: 'Opening interactive prediction workspace' },
    ],
  },
  {
    id: 'molecules',
    label: 'Molecule Lab',
    category: 'Discovery',
    iconName: 'Atom',
    description: '3D chemical conformations, atomic lattices, and Lipinski descriptors',
    route: 'molecules',
    animationType: 'molecules',
    color: '#38bdf8',
    badge: 'Structure',
    stages: [
      { min: 0, max: 20, text: 'Loading 3D Molecular Lattice...', subtext: 'Parsing atomic coordinates and valence geometries' },
      { min: 21, max: 45, text: 'Calculating Physicochemical Descriptors...', subtext: 'Evaluating LogP, TPSA, and hydrogen bond donors' },
      { min: 46, max: 70, text: 'Minimizing Molecular Energy...', subtext: 'Simulating force-field torsional constraints' },
      { min: 71, max: 88, text: 'Rendering Stereochemical Viewport...', subtext: 'Preparing ball-and-stick and space-filling representations' },
      { min: 89, max: 100, text: 'Molecule Lab Online', subtext: 'Entering 3D chemical analysis environment' },
    ],
  },
  {
    id: 'visualize',
    label: 'Visualize Compound',
    category: 'Discovery',
    iconName: 'Atom',
    description: 'Resolve chemical identities, map structure, and explore molecules in 2D and 3D.',
    route: 'visualize',
    animationType: 'visualize',
    color: '#34d399',
    badge: 'Chemistry',
    stages: [
      { min: 0, max: 20, text: 'Resolving compound identity...', subtext: 'Checking the chemical name, formula, and identifiers' },
      { min: 21, max: 45, text: 'Preparing molecular structure...', subtext: 'Retrieving atom and bond topology from the database' },
      { min: 46, max: 70, text: 'Generating molecular representation...', subtext: 'Building 2D and 3D structural views' },
      { min: 71, max: 88, text: 'Preparing 3D visualization...', subtext: 'Rotating the molecular scene and calculating labels' },
      { min: 89, max: 100, text: 'Compound workspace ready', subtext: 'Opening the interactive molecular visualization studio' },
    ],
  },
  {
    id: 'studio',
    label: 'Molecular Studio',
    category: 'Discovery',
    iconName: 'Atom',
    description: 'Create, validate, inspect, and export structured molecular graphs.',
    route: 'studio',
    animationType: 'visualize',
    color: '#397654',
    badge: 'Build',
    stages: [
      { min: 0, max: 20, text: 'Opening molecular graph editor...', subtext: 'Preparing a structured, editable molecule' },
      { min: 21, max: 45, text: 'Loading chemistry toolbox...', subtext: 'Preparing atoms, bonds, and reusable templates' },
      { min: 46, max: 70, text: 'Preparing molecular inspector...', subtext: 'Calculating deterministic graph descriptors' },
      { min: 71, max: 88, text: 'Preparing export workflow...', subtext: 'Keeping JSON and MOL data tied to the graph' },
      { min: 89, max: 100, text: 'Molecular Studio ready', subtext: 'Build and inspect a research structure' },
    ],
  },
  {
    id: 'drugs',
    label: 'Drug Analysis',
    category: 'Discovery',
    iconName: 'Pill',
    description: 'Bioactivity screening, chemotype profiling, and ADMET estimations',
    route: 'drugs',
    animationType: 'drugs',
    color: '#059669',
    badge: 'Screening',
    stages: [
      { min: 0, max: 20, text: 'Auditing Chemotype Signatures...', subtext: 'Verifying canonical SMILES structure and stereocenters' },
      { min: 21, max: 45, text: 'Screening ADMET Safety Thresholds...', subtext: 'Estimating blood-brain barrier permeability & absorption' },
      { min: 46, max: 70, text: 'Cross-referencing Bioactivity Indices...', subtext: 'Correlating simulated IC50 / Ki baseline values' },
      { min: 71, max: 88, text: 'Compiling Pharmacological Matrix...', subtext: 'Formatting computational safety documentation' },
      { min: 89, max: 100, text: 'Drug Analysis Ready', subtext: 'Launching compound assessment dashboard' },
    ],
  },
  {
    id: 'targets',
    label: 'Target Analysis',
    category: 'Discovery',
    iconName: 'Target',
    description: 'Biological target exploration, pocket volumes, and sequence motifs',
    route: 'targets',
    animationType: 'targets',
    color: '#6366f1',
    badge: 'Biology',
    stages: [
      { min: 0, max: 20, text: 'Retrieving Target Primary Sequence...', subtext: 'Resolving UniProt FASTA chains and domain tags' },
      { min: 21, max: 45, text: 'Detecting Active Binding Pockets...', subtext: 'Calculating solvent-accessible surface area (SASA)' },
      { min: 46, max: 70, text: 'Mapping Catalytic Triads...', subtext: 'Profiling electrostatic potential of binding clefts' },
      { min: 71, max: 88, text: 'Generating 3D Domain Overlays...', subtext: 'Preparing alpha-helix and beta-sheet ribbons' },
      { min: 89, max: 100, text: 'Target Analysis Online', subtext: 'Entering biological target workbench' },
    ],
  },
  {
    id: 'medicines',
    label: 'Medicine Kit',
    category: 'Healthcare',
    iconName: 'Package',
    description: 'Personal medicine inventory, cabinet supplies, and storage tracking',
    route: 'medicines',
    animationType: 'medicines',
    color: '#34d399',
    badge: 'Cabinet',
    stages: [
      { min: 0, max: 20, text: 'Accessing Local Inventory Storage...', subtext: 'Syncing user-recorded cabinet items' },
      { min: 21, max: 45, text: 'Validating Storage Conditions...', subtext: 'Reviewing category tags and package records' },
      { min: 46, max: 70, text: 'Structuring Inventory Categories...', subtext: 'Organizing prescription, OTC, and wound care' },
      { min: 71, max: 88, text: 'Synchronizing Safe Supply Logs...', subtext: 'Verifying quantity thresholds' },
      { min: 89, max: 100, text: 'Medicine Cabinet Open', subtext: 'Ready for inventory management' },
    ],
  },
  {
    id: 'expiry',
    label: 'Expiry Monitor',
    category: 'Healthcare',
    iconName: 'Bell',
    description: 'Priority shelf-life alerts, expiration countdowns, and disposal guides',
    route: 'expiry',
    animationType: 'expiry',
    color: '#f59e0b',
    badge: 'Alerts',
    stages: [
      { min: 0, max: 20, text: 'Scanning Cabinet Expiration Dates...', subtext: 'Comparing item batches against the current reference date' },
      { min: 21, max: 45, text: 'Evaluating Imminent Risk Tiers...', subtext: 'Identifying 7-day, 30-day, and lapsed medications' },
      { min: 46, max: 70, text: 'Loading Environmental Disposal Guides...', subtext: 'Referencing safe pharmaceutical disposal guidelines' },
      { min: 71, max: 88, text: 'Prioritizing Action Checklist...', subtext: 'Compiling alert notifications' },
      { min: 89, max: 100, text: 'Expiry Monitor Active', subtext: 'Presenting safety watchlist' },
    ],
  },
  {
    id: 'schedule',
    label: 'Medication Schedule',
    category: 'Healthcare',
    iconName: 'CalendarDays',
    description: 'Personal routine timetable, adherence tracking, and daily reminders',
    route: 'schedule',
    animationType: 'schedule',
    color: '#ec4899',
    badge: 'Routine',
    stages: [
      { min: 0, max: 20, text: 'Loading Routine Timetable...', subtext: 'Retrieving user-specified daily reminders' },
      { min: 21, max: 45, text: 'Aligning Morning, Noon & Night Windows...', subtext: 'Formatting calendar grid with custom regimens' },
      { min: 46, max: 70, text: 'Validating Routine Continuity...', subtext: 'Checking adherence markers' },
      { min: 71, max: 88, text: 'Enforcing Safety Checkpoints...', subtext: 'Reminding verification against prescription labels' },
      { min: 89, max: 100, text: 'Schedule Timetable Ready', subtext: 'Displaying daily routine plan' },
    ],
  },
  {
    id: 'assistant',
    label: 'AI Health Assistant',
    category: 'Intelligence',
    iconName: 'Bot',
    description: 'Scientific dialogue engine, terminology explanations, and research guidance',
    route: 'assistant',
    animationType: 'assistant',
    color: '#06b6d4',
    badge: 'AI Core',
    stages: [
      { min: 0, max: 20, text: 'Warming Scientific Dialogue Engine...', subtext: 'Instantiating computational biology context' },
      { min: 21, max: 45, text: 'Calibrating Safety Guardrails...', subtext: 'Enforcing non-prescriptive & non-diagnostic boundaries' },
      { min: 46, max: 70, text: 'Linking Bio-Medical Knowledge Base...', subtext: 'Indexing ChEMBL, PDB, and clinical terminology' },
      { min: 71, max: 88, text: 'Opening Secure Conversational Channel...', subtext: 'Synthesizing interactive assistant interface' },
      { min: 89, max: 100, text: 'AI Assistant Online', subtext: 'Bipasha Mam is ready to discuss your research' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    category: 'Intelligence',
    iconName: 'Activity',
    description: 'Model observatory, ROC-AUC curves, study volume, and performance logs',
    route: 'analytics',
    animationType: 'analytics',
    color: '#3b82f6',
    badge: 'Telemetry',
    stages: [
      { min: 0, max: 20, text: 'Aggregating Telemetry Logs...', subtext: 'Polling study volume and runtime benchmarks' },
      { min: 21, max: 45, text: 'Calculating Statistical Distributions...', subtext: 'Generating ROC-AUC, PR-AUC, and F1 benchmarks' },
      { min: 46, max: 70, text: 'Rendering Interactive Curves...', subtext: 'Plotting validation splits and study volume' },
      { min: 71, max: 88, text: 'Validating Model Reproducibility...', subtext: 'Verifying random seeds and cross-validation splits' },
      { min: 89, max: 100, text: 'Analytics Observatory Ready', subtext: 'Displaying scientific performance metrics' },
    ],
  },
  {
    id: 'research',
    label: 'Research Hub',
    category: 'Intelligence',
    iconName: 'BrainCircuit',
    description: 'Methodology documentation, PDB & SwissADME references, and datasets',
    route: 'research',
    animationType: 'research',
    color: '#a855f7',
    badge: 'Knowledge',
    stages: [
      { min: 0, max: 20, text: 'Indexing Scientific Documentation...', subtext: 'Gathering architecture specs and pipeline methodology' },
      { min: 21, max: 45, text: 'Querying Bio-informatics Knowledge Bases...', subtext: 'Referencing RCSB PDB, SwissADME, and GROMACS benchmarks' },
      { min: 46, max: 70, text: 'Cataloging Dataset Splits...', subtext: 'Organizing BindingDB, Davis, and KIBA benchmark manifests' },
      { min: 71, max: 88, text: 'Compiling Reproducibility Guide...', subtext: 'Preparing citations and scientific disclaimer index' },
      { min: 89, max: 100, text: 'Research Hub Opened', subtext: 'Welcome to the Aegis scientific knowledgebase' },
    ],
  },
]

export function getActionById(id) {
  return BIPASHA_ACTIONS.find((action) => action.id === id) || null
}

export function getStageForProgress(action, progress) {
  if (!action || !action.stages) {
    return { text: 'Loading scientific environment...', subtext: 'Please wait...' }
  }
  const found = action.stages.find((stage) => progress >= stage.min && progress <= stage.max)
  return found || action.stages[action.stages.length - 1]
}

/**
 * Contextual Greetings and suggestions based on current application route
 */
export function getContextualGreeting(pageId) {
  switch (pageId) {
    case 'dti':
      return {
        greeting: "Hello! Ready to explore a drug–target interaction study?",
        subtext: "Compose a study from molecular inputs and evaluate computational binding hypotheses.",
        quickActions: [
          { label: 'Run DTI Study', actionId: 'dti' },
          { label: 'View 3D Molecule', actionId: 'molecules' },
          { label: 'Target Pockets', actionId: 'targets' },
        ],
      }
    case 'molecules':
      return {
        greeting: "Hello! Let's explore 3D molecular structures and Lipinski descriptors.",
        subtext: "Analyze atomic conformations, hydrogen bond donors/acceptors, and topological polar surface area.",
        quickActions: [
          { label: 'Screen Compound', actionId: 'drugs' },
          { label: 'Predict DTI Affinity', actionId: 'dti' },
          { label: 'Research Papers', actionId: 'research' },
        ],
      }
    case 'visualize':
      return {
        greeting: "Hello! I'm Bipasha Mam. Your molecular visualization workspace is ready.",
        subtext: "Explore the structure, bonds, rings, functional groups, and 3D geometry of the current compound.",
        quickActions: [
          { label: 'Visualize Benzene', query: 'Visualize benzene' },
          { label: 'Show Properties', query: 'Show molecular properties' },
          { label: 'Show 3D Structure', query: 'Show the 3D structure' },
        ],
      }
    case 'studio':
      return {
        greeting: "Welcome to Molecular Studio. Build a structured molecule and inspect what the current graph can prove.",
        subtext: "Templates, atom and bond editing, deterministic graph descriptors, and explicit chemistry-engine boundaries are ready.",
        quickActions: [
          { label: 'Open DTI Lab', actionId: 'dti' },
          { label: 'Visualize a compound', actionId: 'visualize' },
          { label: 'Research methodology', actionId: 'research' },
        ],
      }
    case 'drugs':
      return {
        greeting: "Welcome to Drug Analysis! Let's evaluate chemotypes and ADMET bounds.",
        subtext: "Review simulated physicochemical properties and computational bioactivity indices.",
        quickActions: [
          { label: 'Inspect Conformation', actionId: 'molecules' },
          { label: 'Predict Interactions', actionId: 'dti' },
          { label: 'Model Metrics', actionId: 'analytics' },
        ],
      }
    case 'targets':
      return {
        greeting: "Hello! Ready to inspect biological target sequences and binding pockets?",
        subtext: "Evaluate amino acid chains, electrostatic clefts, and solvent-accessible domains.",
        quickActions: [
          { label: 'Pair with Drug', actionId: 'dti' },
          { label: 'View Methodology', actionId: 'research' },
          { label: 'Consult AI', actionId: 'assistant' },
        ],
      }
    case 'medicines':
      return {
        greeting: "Hello! Let's check your personal medicine inventory.",
        subtext: "Track your home medicine supplies, package quantities, and storage safety.",
        quickActions: [
          { label: 'Check Expiries', actionId: 'expiry' },
          { label: 'View Schedule', actionId: 'schedule' },
          { label: 'Drug Profiles', actionId: 'drugs' },
        ],
      }
    case 'expiry':
      return {
        greeting: "Expiry Monitor active! Let's review items approaching their shelf-life limit.",
        subtext: "Keep your supplies safe and review eco-friendly pharmaceutical disposal recommendations.",
        quickActions: [
          { label: 'Review Cabinet', actionId: 'medicines' },
          { label: 'Update Schedule', actionId: 'schedule' },
          { label: 'Consult AI Guide', actionId: 'assistant' },
        ],
      }
    case 'schedule':
      return {
        greeting: "Welcome! Ready to organize your daily medication timetable?",
        subtext: "Structure your morning, afternoon, and evening routines based on your doctor's instructions.",
        quickActions: [
          { label: 'Check Cabinet', actionId: 'medicines' },
          { label: 'Expiry Alerts', actionId: 'expiry' },
          { label: 'Ask Bipasha', actionId: 'assistant' },
        ],
      }
    case 'assistant':
      return {
        greeting: "Hello! I'm Bipasha Mam. How can I assist your biomedical research inquiry today?",
        subtext: "Ask me about molecular representations, model scoring, or platform navigation.",
        quickActions: [
          { label: 'Open DTI Lab', actionId: 'dti' },
          { label: 'Explain Affinity', query: 'Explain how DTI affinity predictions work' },
          { label: 'Safety Boundaries', query: 'What are your safety boundaries?' },
        ],
      }
    case 'analytics':
      return {
        greeting: "Welcome! Would you like to review latest model metrics and study history?",
        subtext: "Inspect prediction observatory logs, ROC-AUC validation curves, and system telemetry.",
        quickActions: [
          { label: 'Launch DTI Study', actionId: 'dti' },
          { label: 'Methodology Docs', actionId: 'research' },
          { label: 'Target Analysis', actionId: 'targets' },
        ],
      }
    case 'research':
      return {
        greeting: "Welcome to the Research Hub! Ready to explore datasets and methodologies?",
        subtext: "Review benchmark literature, PDB & SwissADME inspirations, and validation pipelines.",
        quickActions: [
          { label: 'Start DTI Study', actionId: 'dti' },
          { label: 'Inspect 3D Lattice', actionId: 'molecules' },
          { label: 'Performance Logs', actionId: 'analytics' },
        ],
      }
    case 'overview':
    default:
      return {
        greeting: "Hello! I'm Bipasha Mam, your AI Research & Discovery Assistant.",
        subtext: "How can I help you navigate the computational biology workspace today?",
        quickActions: [
          { label: 'DTI Lab', actionId: 'dti' },
          { label: 'Molecule Lab', actionId: 'molecules' },
          { label: 'Medicine Kit', actionId: 'medicines' },
          { label: 'Expiry Monitor', actionId: 'expiry' },
        ],
      }
  }
}

/**
 * Natural language intent parser for Bipasha Mam
 * Maps user queries safely to predefined system actions or educational explanations.
 */
export function parseAgentIntent(rawQuery) {
  const query = (rawQuery || '').trim().toLowerCase()
  if (!query) {
    return {
      type: 'empty',
      text: "I'm listening. Ask me to open any laboratory module or explain computational predictions.",
    }
  }

  // Safety checks - disallow medical prescription, dose alterations, or diagnosis
  const prescriptionTriggers = ['dose', 'dosage', 'prescribe', 'how much should i take', 'stop taking', 'diagnose', 'symptom cure', 'treat my']
  if (prescriptionTriggers.some((t) => query.includes(t))) {
    return {
      type: 'safety_boundary',
      text: "Safety Boundary Notice: As an AI research assistant, I cannot prescribe medication, calculate clinical dosages, diagnose health conditions, or advise altering a prescription. Please consult your physician or licensed pharmacist for medical care. I can help organize your timetable or explain scientific concepts.",
      suggestions: ['Show medication schedule', 'Check medicine expiry', 'Open DTI Lab'],
    }
  }

  // Navigation intents
  if (query.includes('dti') || query.includes('drug target') || query.includes('predict interaction') || query.includes('interaction study') || query.includes('compose study')) {
    return {
      type: 'navigate',
      targetAction: 'dti',
      text: "Understood. Initializing the Drug–Target Interaction Laboratory.",
      actionLabel: 'Launch DTI Lab',
    }
  }

  if (query.includes('molecular studio') || query.includes('draw molecule') || query.includes('create molecule') || query.includes('chemical editor')) {
    return {
      type: 'navigate',
      targetAction: 'studio',
      text: "Opening Molecular Studio for structured chemical editing and inspection.",
      actionLabel: 'Open Molecular Studio',
    }
  }

  if (query.includes('molecule') || query.includes('3d') || query.includes('conformation') || query.includes('smiles') || query.includes('structure') || query.includes('lipinski')) {
    return {
      type: 'navigate',
      targetAction: 'molecules',
      text: "Opening Molecule Lab for 3D stereochemical inspection and physicochemical profiling.",
      actionLabel: 'Open Molecule Lab',
    }
  }

  if (query.includes('visualize') || query.includes('compound visualization') || query.includes('show the structure of') || query.includes('show me the 3d structure') || query.includes('open compound visualization') || query.includes('analyze caffeine') || query.includes('visualize benzene') || query.includes('visualize methanol') || query.includes('show the ring structure') || query.includes('molecular properties')) {
    return {
      type: 'navigate',
      targetAction: 'visualize',
      text: "Opening the compound visualization workspace to inspect structure, properties, and 3D geometry.",
      actionLabel: 'Visualize Compound',
    }
  }

  if (query.includes('drug analysis') || query.includes('admet') || query.includes('bioactivity') || query.includes('chemotype') || query.includes('compound analysis')) {
    return {
      type: 'navigate',
      targetAction: 'drugs',
      text: "Navigating to Drug Analysis for compound screening and ADMET estimates.",
      actionLabel: 'Open Drug Analysis',
    }
  }

  if (query.includes('target analysis') || query.includes('protein target') || query.includes('binding pocket') || query.includes('uniprot') || query.includes('pocket')) {
    return {
      type: 'navigate',
      targetAction: 'targets',
      text: "Navigating to Target Analysis to explore biological receptors and binding pockets.",
      actionLabel: 'Open Target Analysis',
    }
  }

  if (query.includes('medicine kit') || query.includes('cabinet') || query.includes('inventory') || query.includes('my medicines') || query.includes('supplies')) {
    return {
      type: 'navigate',
      targetAction: 'medicines',
      text: "Accessing your personal Medicine Cabinet inventory.",
      actionLabel: 'Open Medicine Cabinet',
    }
  }

  if (query.includes('expiry') || query.includes('expire') || query.includes('expiring') || query.includes('shelf life') || query.includes('disposal')) {
    return {
      type: 'navigate',
      targetAction: 'expiry',
      text: "Opening Expiry Monitor to audit shelf-life statuses and disposal guidelines.",
      actionLabel: 'Open Expiry Monitor',
    }
  }

  if (query.includes('schedule') || query.includes('calendar') || query.includes('routine') || query.includes('remind') || query.includes('timetable')) {
    return {
      type: 'navigate',
      targetAction: 'schedule',
      text: "Accessing your Medication Schedule timetable.",
      actionLabel: 'Open Schedule',
    }
  }

  if (query.includes('analytics') || query.includes('metric') || query.includes('observatory') || query.includes('roc') || query.includes('telemetry') || query.includes('performance')) {
    return {
      type: 'navigate',
      targetAction: 'analytics',
      text: "Opening the Analytics Observatory for validation curves and model logs.",
      actionLabel: 'Open Analytics',
    }
  }

  if (query.includes('research') || query.includes('methodology') || query.includes('paper') || query.includes('dataset') || query.includes('documentation') || query.includes('pdb')) {
    return {
      type: 'navigate',
      targetAction: 'research',
      text: "Loading Research Hub with methodology documentation, benchmark datasets, and references.",
      actionLabel: 'Open Research Hub',
    }
  }

  if (query.includes('ai assistant') || query.includes('chat') || query.includes('bot') || query.includes('conversation')) {
    return {
      type: 'navigate',
      targetAction: 'assistant',
      text: "Launching full-screen AI Health & Research Assistant.",
      actionLabel: 'Open AI Assistant',
    }
  }

  if (query.includes('overview') || query.includes('dashboard') || query.includes('home')) {
    return {
      type: 'navigate',
      targetAction: 'overview',
      text: "Navigating to Workspace Overview.",
      actionLabel: 'Open Overview',
    }
  }

  // Educational queries
  if (query.includes('explain') || query.includes('what is') || query.includes('how does') || query.includes('confidence') || query.includes('prediction')) {
    return {
      type: 'explain',
      text: "Computational Drug–Target Interaction predictions model the mathematical probability or binding affinity (such as pKd or Ki) between a small molecule (SMILES string) and a protein amino acid sequence using learned representations. Crucially, these values are computational hypotheses that guide laboratory synthesis and wet-lab assays, not verified clinical outcomes.",
      suggestions: ['Open DTI Lab', 'View Research Hub', 'What are your safety boundaries?'],
    }
  }

  if (query.includes('who are you') || query.includes('your name') || query.includes('bipasha')) {
    return {
      type: 'identity',
      text: "I am Bipasha Mam, your persistent AI Research Assistant and navigation layer across the Aegis computational biology platform. I can launch modules, track medication inventories, preview 3D molecules, and provide scientific context.",
      suggestions: ['Launch DTI Lab', 'Show Medicine Cabinet', 'Open Molecule Lab'],
    }
  }

  if (query.includes('help') || query.includes('what can you do') || query.includes('actions') || query.includes('commands')) {
    return {
      type: 'help',
      text: "You can ask me to navigate anywhere in the platform, such as 'Open DTI Lab', 'Show Molecule 3D', 'Check Expiries', 'Open Schedule', or ask questions like 'Explain DTI predictions'. You can also click any button in the Control Deck!",
      suggestions: ['DTI Lab', 'Molecule Lab', 'Expiry Monitor', 'Research Hub'],
    }
  }

  // Default fallback
  return {
    type: 'fallback',
    text: `I understood your interest in "${rawQuery}". Would you like me to open one of our scientific modules or discuss computational methodology?`,
    suggestions: ['Open DTI Lab', 'Molecule Lab', 'Medicine Kit', 'Analytics'],
  }
}
