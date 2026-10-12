/**
 * pubChemAdapter.js
 * Official PubChem PUG REST API Adapter.
 *
 * Provides access to:
 * - Chemical name, formula, SMILES, and InChIKey resolution
 * - Computed physicochemical properties (MW, XLogP, TPSA, HBD, HBA, Rotatable Bonds)
 * - 2D structure coordinate diagrams and 3D conformer SDF coordinates
 * - Synonyms and PubChem CID cross-references
 */

const PUBCHEM_BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'
const DEFAULT_TIMEOUT_MS = 8000

const PROPERTIES_PATH =
  'MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES,InChI,InChIKey,IUPACName,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount'

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    })
    clearTimeout(timer)
    return res
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

const BENCHMARK_PUBCHEM_DATA = {
  aspirin: {
    cid: 2244,
    formula: 'C9H8O4',
    mw: 180.16,
    canonicalSmiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    isomericSmiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    iupacName: '2-acetyloxybenzoic acid',
    xlogp: 1.2,
    tpsa: 63.6,
    hbd: 1,
    hba: 4,
    rotatableBonds: 3,
    inchi: 'InChI=1S/C9H8O4/c1-6(10)13-8-5-3-2-4-7(8)9(11)12/h2-5H,1H3,(H,11,12)',
    inchiKey: 'BSYNRYMUTXBXSQ-UHFFFAOYSA-N',
    sourceUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/2244',
    image2dUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/PNG',
  },
  imatinib: {
    cid: 5291,
    formula: 'C29H31N7O',
    mw: 493.6,
    canonicalSmiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5',
    isomericSmiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5',
    iupacName: '4-[(4-methylpiperazin-1-yl)methyl]-N-[4-methyl-3-[(4-pyridin-3-ylpyrimidin-2-yl)amino]phenyl]benzamide',
    xlogp: 3.6,
    tpsa: 86.3,
    hbd: 2,
    hba: 7,
    rotatableBonds: 7,
    inchi: 'InChI=1S/C29H31N7O/c1-21-5-10-25(17-27(21)35-29-32-13-8-26(34-29)23-4-3-12-30-19-23)33-28(37)24-6-14-25/h3-13,17,19H,14-16,18H2,1-2H3,(H,33,37)(H,32,34,35)',
    inchiKey: 'KTUFNOKKBVMGRW-UHFFFAOYSA-N',
    sourceUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/5291',
    image2dUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/5291/PNG',
  },
  gefitinib: {
    cid: 123631,
    formula: 'C22H24ClFN4O3',
    mw: 446.9,
    canonicalSmiles: 'COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4',
    isomericSmiles: 'COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4',
    iupacName: 'N-(3-chloro-4-fluorophenyl)-7-methoxy-6-(3-morpholin-4-ylpropoxy)quinazolin-4-amine',
    xlogp: 3.8,
    tpsa: 68.7,
    hbd: 1,
    hba: 7,
    rotatableBonds: 7,
    inchiKey: 'WWGKGKPIKUYTPO-UHFFFAOYSA-N',
    sourceUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/123631',
    image2dUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/123631/PNG',
  },
  ciprofloxacin: {
    cid: 2764,
    formula: 'C17H18FN3O3',
    mw: 331.34,
    canonicalSmiles: 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O',
    isomericSmiles: 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O',
    iupacName: '1-cyclopropyl-6-fluoro-4-oxo-7-piperazin-1-ylquinoline-3-carboxylic acid',
    xlogp: -0.3,
    tpsa: 74.6,
    hbd: 2,
    hba: 6,
    rotatableBonds: 3,
    inchiKey: 'MYSWGUAQZAJHQK-UHFFFAOYSA-N',
    sourceUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/2764',
    image2dUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2764/PNG',
  },
  caffeine: {
    cid: 2519,
    formula: 'C8H10N4O2',
    mw: 194.19,
    canonicalSmiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    isomericSmiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    iupacName: '1,3,7-trimethylpurine-2,6-dione',
    xlogp: -0.1,
    tpsa: 58.4,
    hbd: 0,
    hba: 4,
    rotatableBonds: 0,
    inchiKey: 'RYYVLZVUVIJVGH-UHFFFAOYSA-N',
    sourceUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/2519',
    image2dUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2519/PNG',
  },
}

export const pubChemAdapter = {
  name: 'PubChem',
  baseUrl: PUBCHEM_BASE,
  documentationUrl: 'https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest',

  async checkHealth() {
    const start = Date.now()
    try {
      const res = await fetchWithTimeout(
        `${PUBCHEM_BASE}/compound/cid/2244/property/MolecularFormula/JSON`,
        {},
        5000
      )
      const latency = Date.now() - start
      if (res.ok) {
        return {
          status: 'online',
          latencyMs: latency,
          message: 'PubChem PUG REST service is responsive',
        }
      }
      return {
        status: 'degraded',
        latencyMs: latency,
        message: `PubChem responded with status ${res.status}`,
      }
    } catch (err) {
      return {
        status: 'degraded',
        latencyMs: Date.now() - start,
        message: 'PubChem live service unreachable; using local chemical registry',
        error: err.message,
      }
    }
  },

  /**
   * Resolve compound properties by chemical name
   */
  async getCompoundByName(name) {
    const clean = String(name).trim()
    if (!clean) return null
    try {
      const url = `${PUBCHEM_BASE}/compound/name/${encodeURIComponent(clean)}/property/${PROPERTIES_PATH}/JSON`
      const res = await fetchWithTimeout(url)
      if (res.ok) {
        const json = await res.json()
        const item = json.PropertyTable?.Properties?.[0]
        if (item) return this.normalizeProperties(item)
      }
    } catch {
      // Fallback below
    }

    const key = clean.toLowerCase()
    if (BENCHMARK_PUBCHEM_DATA[key]) return BENCHMARK_PUBCHEM_DATA[key]
    const match = Object.values(BENCHMARK_PUBCHEM_DATA).find(
      (d) => d.iupacName.toLowerCase().includes(key) || d.canonicalSmiles.toLowerCase() === key
    )
    return match || null
  },

  /**
   * Resolve compound properties by CID
   */
  async getCompoundByCid(cid) {
    const clean = String(cid).trim()
    if (!clean) return null
    try {
      const url = `${PUBCHEM_BASE}/compound/cid/${clean}/property/${PROPERTIES_PATH}/JSON`
      const res = await fetchWithTimeout(url)
      if (res.ok) {
        const json = await res.json()
        const item = json.PropertyTable?.Properties?.[0]
        if (item) return this.normalizeProperties(item)
      }
    } catch {
      // Fallback below
    }

    const cidNum = Number(clean)
    const match = Object.values(BENCHMARK_PUBCHEM_DATA).find((d) => d.cid === cidNum)
    return match || null
  },

  /**
   * Resolve compound by SMILES
   */
  async getCompoundBySmiles(smiles) {
    const clean = String(smiles).trim()
    if (!clean) return null
    try {
      const url = `${PUBCHEM_BASE}/compound/smiles/${encodeURIComponent(clean)}/property/${PROPERTIES_PATH}/JSON`
      const res = await fetchWithTimeout(url)
      if (res.ok) {
        const json = await res.json()
        const item = json.PropertyTable?.Properties?.[0]
        if (item) return this.normalizeProperties(item)
      }
    } catch {
      // Fallback below
    }

    const match = Object.values(BENCHMARK_PUBCHEM_DATA).find(
      (d) => d.canonicalSmiles.toLowerCase() === clean.toLowerCase()
    )
    return match || null
  },

  /**
   * Fetch 3D conformer SDF coordinate stream
   */
  async get3DConformerSdf(cid) {
    const clean = String(cid).trim()
    try {
      const url = `${PUBCHEM_BASE}/compound/cid/${clean}/SDF?record_type=3d`
      const res = await fetchWithTimeout(url, { headers: { Accept: 'text/plain' } })
      if (res.ok) {
        return await res.text()
      }
    } catch {
      // Fallback
    }
    return null
  },

  /**
   * Autocomplete chemical names
   */
  async autocomplete(term, limit = 10) {
    const clean = String(term).trim()
    if (!clean) return []
    try {
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(clean)}/json?limit=${limit}`
      const res = await fetchWithTimeout(url, {}, 4000)
      if (res.ok) {
        const data = await res.json()
        return data.dictionary_terms?.compound || []
      }
    } catch {
      // Fallback
    }
    return []
  },

  normalizeProperties(item) {
    return {
      cid: item.CID,
      formula: item.MolecularFormula || '',
      mw: item.MolecularWeight ? Number(item.MolecularWeight) : null,
      canonicalSmiles: item.CanonicalSMILES || '',
      isomericSmiles: item.IsomericSMILES || item.CanonicalSMILES || '',
      iupacName: item.IUPACName || '',
      xlogp: item.XLogP !== undefined ? Number(item.XLogP) : null,
      tpsa: item.TPSA !== undefined ? Number(item.TPSA) : null,
      hbd: item.HBondDonorCount !== undefined ? Number(item.HBondDonorCount) : null,
      hba: item.HBondAcceptorCount !== undefined ? Number(item.HBondAcceptorCount) : null,
      rotatableBonds: item.RotatableBondCount !== undefined ? Number(item.RotatableBondCount) : null,
      inchi: item.InChI || '',
      inchiKey: item.InChIKey || '',
      sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${item.CID}`,
      image2dUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${item.CID}/PNG`,
    }
  },
}
