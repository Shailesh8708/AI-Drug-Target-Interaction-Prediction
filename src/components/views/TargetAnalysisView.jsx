import { useState } from 'react'
import { Target, ShieldCheck, ExternalLink, Dna, Layers } from 'lucide-react'

const TARGET_PRESETS = [
  {
    id: 't1',
    name: 'Epidermal Growth Factor Receptor (EGFR)',
    gene: 'EGFR',
    uniprot: 'P00533',
    pdb: '2XCT',
    organism: 'Homo sapiens (Human)',
    pocketVolume: '842 Å³',
    catalyticTriad: 'Lys745, Glu762, Met793',
    sequenceSnippet: 'MRPSGTAGAALLALLAALCPASRALEEKKVCQGTSNKLTQLGTFEDHFLSLQRMFNNCEVVLGNLEITYVQRNYDLSFLKTIQEVAGYVLIALNTVERIPLENLQIIRGNMYYENSYALAVLSNYDANKTGLKELPMRNLQEILHGAVRFSNNPALCNVESIQWRDIVSSDFLSNMSMDFQNHLGSCQKCDPSCPNGSCWGAGEENCQKLTKIICAQQCSGRCRGKSPSDCCHNQCAAGCTGPRESDCLVCRKFRDEATCKDTCPPLMLYNPTTYQMDVNPEGKYSFGATCVKKCPRNYVVTDHGSCVRACGADSYEMEEDGVRKCKKCEGPCRKVCNGIGIGEFKDSLSINATNIKHFKNCTSISGDLHILPVAFRGDSFTHTPPLDPQELDILKTVKEITGFLLIQAWPENRTDLHAFENLEIIRGRTKQHGQFSLAVVSLNITSLGLRSLKEISDGDVIISGNKNLCYANTINWKKLFGTSGQKTKIISNRGENSCKATGQVCHALCSPEGCWGPEPRDCVSCRNVSRGRECVDKCNLLEGEPREFVENSECIQCHPECLPQAMNITCTGRGPDNCIQCAHYIDGPHCVKTCPAGVMGENNTLVWKYADAGHVCHLCHPNCTYGCTGPGLEGCPTNGPKIPSIATGMVGALLLLLVVALGIGLFMRRRHIVRKRTLRRLLQERELVE',
  },
  {
    id: 't2',
    name: 'Tyrosine-protein kinase ABL1',
    gene: 'ABL1',
    uniprot: 'P00519',
    pdb: '1IEP',
    organism: 'Homo sapiens (Human)',
    pocketVolume: '965 Å³',
    catalyticTriad: 'Lys271, Glu286, Thr315',
    sequenceSnippet: 'MLEICLKLVGCKSKKGLSSSSSCYLEEALQRPVASDFEPQGLSEAARWNSKENLLAGPSENDPNLFVALYDFVASGDNTLSITKGEKLRVLGYNHNGEWCEAQTKNGQGWVPSNYITPVNSLEKHSWYHGPVSRNAAEYLLSSGINGSFLVRESESSPGQRSISLRYEGRVYHYRINTASDGKLYVSSESRFNTLAELVHHHSTVADGLITTLHYPAPKRNKPTIYEGVSPNYDKWEMERTDITMKHKLGGGQYGEVYEGVWKKYSLTVAVKTLKEDTMEVEEFLKEAAVMKEIKHPNLVQLLGVCTREPPFYIITEFMTYGNLLDYLRECNRQEVNAVVLLYMATQISSAMEYLEKKNFIHRDLAARNCLVGENHLVKVADFGLSRLMTGDTYTAHAGAKFPIKWTAPESLAYNKFSIKSDVWAFGVLLWEIATYGMSPYPGIDLSQVYELLEKDYRMERPEGCPEKVYELMRACWQWNPSDRPSFAEIHQAFETMFQESSISDEVEKELGKQGVRGAVSTLLQAPELPTKTRTSRRAAEHRDTTDVPEMPHSKGQGESDPLDHEPAVSPLLPRKERGPPEGGLNEDERLLPKDKKTNLFSALIKKKKKTAPTPPKRSSSFREMDGQPERRGAGEEEGRDISNGALAFTPLDTADPAKSPKPSNGAGVPNGALRESGGSGFRSPHLWKKSSTLTSSRLATGEEEGGGSSSKRFLRSCSVSCVPHGAKDTEWRSVTLPRDLQSTGRQFDSSTFGGHKSEKPALPRKRAGENRSDQVTRGTVTPPPRLVKKNEEAADEVFKDIMESSPGSSPPNLTPKPLRRQVTVAPASGLPHKEEAEKGSALGTPAAAEPVTPTSKAGSGAPGGTSKGPAEESRVRRHKHSSESPGRDKGKLSRLKPAPPPPPAASAGKAGGKPSQSPSQEAAGEAVLGAKTKATSLVDAVNSDAAKPSQPAEGLKKPVLPATPKPQSAKPSGTPISPAPVPSTLPSASSALAGDQPSSTAFIPLISTRVSLRKTRQPPERIASGAITKGVVLDSTEALCLAISRNSEQMASHSAVLEAGKNLYTFCVSYVDSIQQMRNKFAFREAINKLENNLRELQICPATAGSGPAATQDFSKLLSSVKEISDIVQR',
  },
]

export default function TargetAnalysisView({ setNotice }) {
  const [selectedTarget, setSelectedTarget] = useState(TARGET_PRESETS[0])

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Biomolecular Structure</p>
          <h1>Target Analysis</h1>
          <p className="intro-copy">
            Explore biological target protein receptors, binding pocket geometries, and amino acid sequences.
          </p>
        </div>
        <a
          href={`https://www.rcsb.org/structure/${selectedTarget.pdb}`}
          target="_blank"
          rel="noreferrer"
          className="primary-button small"
        >
          <ExternalLink size={15} /> RCSB PDB {selectedTarget.pdb}
        </a>
      </div>

      <div className="lab-grid">
        {/* Left: Target details */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Primary Target Profile</p>
              <h3>{selectedTarget.name}</h3>
            </div>
            <span className="draft-badge">UniProt: {selectedTarget.uniprot}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>GENE SYMBOL</small>
              <strong style={{ display: 'block', fontSize: '15px', marginTop: '4px' }}>{selectedTarget.gene}</strong>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>PDB ID</small>
              <strong style={{ display: 'block', fontSize: '15px', marginTop: '4px' }}>{selectedTarget.pdb}</strong>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>POCKET VOLUME</small>
              <strong style={{ display: 'block', fontSize: '15px', marginTop: '4px' }}>{selectedTarget.pocketVolume}</strong>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>ORGANISM</small>
              <strong style={{ display: 'block', fontSize: '13px', marginTop: '4px' }}>{selectedTarget.organism}</strong>
            </div>
          </div>

          <h4 style={{ fontSize: '12px', margin: '14px 0 6px', color: '#55635a' }}>Catalytic Site Residues</h4>
          <p style={{ fontSize: '11px', color: '#397654', background: '#eaf4eb', padding: '8px 12px', borderRadius: '4px', margin: '0 0 16px' }}>
            {selectedTarget.catalyticTriad}
          </p>

          <h4 style={{ fontSize: '12px', margin: '0 0 6px', color: '#55635a' }}>FASTA Sequence Snippet</h4>
          <div style={{ maxHeight: '110px', overflowY: 'auto', background: '#1b2521', color: '#a7f3d0', padding: '10px', borderRadius: '4px', font: '500 9.5px var(--mono)', wordBreak: 'break-all', lineHeight: '1.6' }}>
            {selectedTarget.sequenceSnippet}
          </div>
        </div>

        {/* Right: Select Target Receptor */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Target Library</p>
              <h3>Target Receptors</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TARGET_PRESETS.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTarget(t)
                  if (setNotice) setNotice(`Target switched to ${t.gene}`)
                }}
                style={{
                  padding: '14px',
                  background: selectedTarget.id === t.id ? '#eef5ee' : '#fcfdfb',
                  border: `1px solid ${selectedTarget.id === t.id ? '#cdded0' : '#edf0ec'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '12px' }}>{t.gene}</strong>
                  <span className="status-pill active">{t.pdb}</span>
                </div>
                <small style={{ color: '#89958d', fontSize: '10.5px', display: 'block' }}>{t.name}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <ShieldCheck size={18} />
        <p>
          <strong>Structural Biology Reference</strong> Target sequence data and binding pocket volumes are aggregated for in-silico DTI studies. Experimental 3D coordinates can be verified through the Worldwide Protein Data Bank (wwPDB).
        </p>
      </div>
    </div>
  )
}
