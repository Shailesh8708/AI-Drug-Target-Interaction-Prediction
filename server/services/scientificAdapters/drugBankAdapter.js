/**
 * drugBankAdapter.js
 * Official DrugBank REST API Adapter (Licensed / Authenticated).
 *
 * DrugBank requires an authorized commercial or academic subscription license key.
 *
 * BEHAVIOR:
 * - Detects presence of DRUGBANK_API_KEY environment variable.
 * - When configured: performs authenticated requests against https://api.drugbank.com/v1.
 * - When uncredentialed: returns an informative, transparent status explaining
 *   how to configure the license key, with zero fabricated data.
 */

const DRUGBANK_BASE = 'https://api.drugbank.com/v1'
const DEFAULT_TIMEOUT_MS = 8000

export const drugBankAdapter = {
  name: 'DrugBank',
  baseUrl: DRUGBANK_BASE,
  documentationUrl: 'https://docs.drugbank.com/v1/',

  isConfigured() {
    return Boolean(process.env.DRUGBANK_API_KEY && process.env.DRUGBANK_API_KEY.trim())
  },

  async checkHealth() {
    const isReady = this.isConfigured()
    if (!isReady) {
      return {
        status: 'uncredentialed',
        latencyMs: 0,
        configured: false,
        message: 'DrugBank API is uncredentialed. Set DRUGBANK_API_KEY in environment variables to enable.',
        setupGuide: {
          licenseType: 'Commercial or Academic Researcher License',
          envVariable: 'DRUGBANK_API_KEY',
          registrationUrl: 'https://developer.drugbank.com/signup',
          fallbackMode: 'ChEMBL, PubChem, and BindingDB are providing primary pharmacology & bioactivity data.',
        },
      }
    }

    const start = Date.now()
    try {
      const res = await fetch(`${DRUGBANK_BASE}/status`, {
        headers: {
          Authorization: process.env.DRUGBANK_API_KEY,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      })
      const latency = Date.now() - start
      if (res.ok) {
        return {
          status: 'online',
          latencyMs: latency,
          configured: true,
          message: 'DrugBank authenticated API connected',
        }
      }
      return {
        status: 'degraded',
        latencyMs: latency,
        configured: true,
        message: `DrugBank responded with status ${res.status}`,
      }
    } catch (err) {
      return {
        status: 'degraded',
        latencyMs: Date.now() - start,
        configured: true,
        message: 'DrugBank API request timed out or network error',
        error: err.message,
      }
    }
  },

  async getDrug(drugBankId) {
    if (!this.isConfigured()) {
      return {
        success: false,
        source: 'DrugBank',
        configured: false,
        message: 'DrugBank API key not configured. Set DRUGBANK_API_KEY to retrieve live DrugBank records.',
      }
    }

    try {
      const res = await fetch(`${DRUGBANK_BASE}/drugs/${encodeURIComponent(drugBankId)}`, {
        headers: {
          Authorization: process.env.DRUGBANK_API_KEY,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })
      if (res.ok) {
        const data = await res.json()
        return {
          success: true,
          source: 'DrugBank',
          drug: data,
        }
      }
    } catch (err) {
      return {
        success: false,
        source: 'DrugBank',
        error: err.message,
      }
    }

    return {
      success: false,
      source: 'DrugBank',
      message: `Record ${drugBankId} not found in DrugBank`,
    }
  },
}
