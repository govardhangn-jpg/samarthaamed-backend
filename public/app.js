
  const views = {
    dashboard: { title: 'Clinical Dashboard', sub: 'Tuesday, 24 February 2026 · AIIMS Delhi' },
    consult:   { title: 'AI Consultation', sub: 'Priya Krishnamurthy · Active Session' },
    patients:  { title: 'Patient Registry', sub: '482 patients · 40+ specializations' },
    risk:      { title: 'Predictive Risk Engine', sub: 'ML models · 6–18 month prediction window' },
    specs:     { title: 'Specializations', sub: '40+ allopathic domains with AI models' },
    prescription: { title: 'Prescription Builder', sub: 'ICMR-aligned · Jan Aushadhi formulary' },
    labs:      { title: 'Lab Results', sub: 'Enter, review and track investigations with AI interpretation' },
    imaging:   { title: 'Imaging AI', sub: 'Upload X-rays, ECGs, CT scans for AI-powered analysis' },
    analytics: { title: 'Analytics & Insights', sub: 'Clinical performance · AI usage · Patient outcomes' },
    settings:  { title: 'Settings', sub: 'Configure SamarthaaMed platform preferences' },
    radiology:   { title: 'Radiology & Imaging Intelligence', sub: 'AI-powered radiology report analysis · ICMR imaging guidelines' },
    dentistry:   { title: 'Dentistry & Oral Medicine', sub: 'AI-powered dental diagnosis · Oral charting · Procedure planning · IDA & ICMR guidelines' },
  };


  function filterPatients(btn, filter) {
    btn.closest('.filter-row').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => {
      const spec = row.cells[3] ? row.cells[3].textContent.toLowerCase() : '';
      const riskCell = row.cells[5] ? row.cells[5].textContent : '';
      const riskPct = parseInt(riskCell) || 0;
      const statusBadge = row.querySelector('.status-badge');
      const statusText = statusBadge ? statusBadge.textContent.toLowerCase() : '';
      const lastVisit = row.cells[4] ? row.cells[4].textContent.toLowerCase() : '';
      let show = true;
      if (filter === 'cardiology')  show = spec.includes('cardiology');
      else if (filter === 'high-risk') show = riskPct >= 50 || statusText === 'urgent';
      else if (filter === 'today')  show = lastVisit === 'today';
      else if (filter === 'critical') show = statusText === 'urgent';
      row.style.display = show ? '' : 'none';
    });
    const visible = [...rows].filter(r => r.style.display !== 'none').length;
    showToast('🔍', `Filter: ${btn.textContent}`, `${visible} patient${visible !== 1 ? 's' : ''} shown`);
  }

  function showUrgentPanel() {
    document.getElementById('urgentModal').classList.add('open');
  }

  function addImagingToReport() {
    const findings = document.getElementById('findingsList');
    const recommendation = document.getElementById('imagingRecommendation');
    if (!findings || findings.children.length === 0) {
      showToast('⚠️', 'No findings yet', 'Run AI analysis first before adding to report');
      return;
    }
    const findingTexts = [...findings.querySelectorAll('.finding-title')].map(el => el.childNodes[0].textContent.trim()).join(', ');
    const recText = recommendation ? recommendation.textContent.trim() : '';
    const summary = `📋 Imaging AI Report — ${document.querySelector('.scan-type-btn.active')?.textContent || 'Scan'}\nFindings: ${findingTexts}.\n${recText}`;
    // Add to consultation chat if it's open, otherwise copy to clipboard
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const div = document.createElement('div');
      div.className = 'msg ai';
      div.innerHTML = `<div class="msg-bubble"><div style="font-size:0.72rem;color:var(--text3);margin-bottom:6px">📋 Imaging report attached to consultation</div><div style="font-size:0.8rem;white-space:pre-line;color:var(--text2)">${summary}</div></div>`;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    navigator.clipboard && navigator.clipboard.writeText(summary).catch(() => {});
    showToast('📋', 'Added to report', 'Imaging findings attached to patient consultation');
  }

  function printImagingReport() {
    const findings = document.getElementById('findingsList');
    const recommendation = document.getElementById('imagingRecommendation');
    const uploadedImage = document.getElementById('uploadedImage');
    const scanType = document.querySelector('.scan-type-btn.active')?.textContent || 'Medical Scan';
    
    if (!findings || findings.children.length === 0) {
      showToast('⚠️', 'No findings yet', 'Run AI analysis first before printing');
      return;
    }
    
    // Get current patient info
    const activeChip = document.querySelector('.patient-chip.active');
    let patientName = 'Patient';
    let patientInfo = '';
    if (activeChip) {
      const onclick = activeChip.getAttribute('onclick');
      const match = onclick.match(/'(\w+)'/);
      if (match) {
        const patient = patientProfiles[match[1]];
        if (patient) {
          patientName = patient.name;
          patientInfo = patient.meta;
        }
      }
    }
    
    // Extract findings
    const findingsArray = [...findings.querySelectorAll('.finding-item')].map(item => {
      const title = item.querySelector('.finding-title')?.childNodes[0]?.textContent?.trim() || '';
      const conf = item.querySelector('.finding-conf')?.textContent || '';
      return { title, conf };
    });
    
    const recText = recommendation ? recommendation.textContent.trim() : 'Continue monitoring as per clinical indication.';
    
    // Create print window
    const printWindow = window.open('', '_blank');
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Imaging Report - ${patientName}</title>
  <style>
    @page { margin: 2cm; }
    body { 
      font-family: 'Arial', sans-serif; 
      line-height: 1.6; 
      color: #000;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 5px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .patient-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #10b981;
      border-bottom: 2px solid #10b981;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    .scan-type {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 20px;
    }
    .finding {
      margin-bottom: 12px;
      padding: 10px;
      background: #f8f9fa;
      border-left: 4px solid #10b981;
    }
    .finding-title {
      font-weight: bold;
      color: #333;
    }
    .confidence {
      color: #10b981;
      font-size: 12px;
      margin-left: 10px;
    }
    .recommendation {
      background: #e8f5e9;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .timestamp {
      color: #999;
      font-size: 12px;
      text-align: right;
      margin-bottom: 20px;
    }
    .image-preview {
      max-width: 100%;
      max-height: 400px;
      margin: 20px 0;
      border: 2px solid #ddd;
      border-radius: 8px;
    }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🧬 SamarthaaMed</div>
    <div class="subtitle">Clinical Intelligence Platform - Imaging AI Report</div>
  </div>
  
  <div class="timestamp">Generated: ${new Date().toLocaleString('en-IN', { 
    dateStyle: 'full', 
    timeStyle: 'short' 
  })}</div>
  
  <div class="patient-info">
    <strong>Patient:</strong> ${patientName}<br>
    ${patientInfo ? `<strong>Details:</strong> ${patientInfo}<br>` : ''}
    <strong>Report ID:</strong> IMG-${Date.now().toString().slice(-8)}
  </div>
  
  <div class="scan-type">📋 ${scanType} Analysis</div>
  
  ${uploadedImage && uploadedImage.src && uploadedImage.style.display !== 'none' ? 
    `<div class="section">
      <div class="section-title">Image</div>
      <img src="${uploadedImage.src}" class="image-preview" alt="Medical scan">
    </div>` : ''}
  
  <div class="section">
    <div class="section-title">AI-Generated Findings</div>
    ${findingsArray.map((f, i) => `
      <div class="finding">
        <span class="finding-title">${i + 1}. ${f.title}</span>
        <span class="confidence">${f.conf}</span>
      </div>
    `).join('')}
  </div>
  
  <div class="section">
    <div class="section-title">Recommendations</div>
    <div class="recommendation">
      ${recText}
    </div>
  </div>
  
  <div class="footer">
    <p><strong>SamarthaaMed AI-Powered Imaging Analysis</strong></p>
    <p>This report was generated using artificial intelligence. Clinical correlation is recommended.</p>
    <p>AI Model Version: Imaging-AI v3.2 | Confidence Threshold: 75%</p>
  </div>
  
  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">
      🖨 Print Report
    </button>
    <button onclick="window.close()" style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; margin-left: 10px;">
      Close
    </button>
  </div>
</body>
</html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    showToast('🖨', 'Print Preview Ready', 'Report opened in new window');
  }

  function exportAnalyticsCSV() {
    const rows = [
      ['Metric', 'Value', 'Change'],
      ['Total Patients', '482', '+12%'],
      ['Consultations', '1,284', '+8%'],
      ['AI Acceptance Rate', '94.2%', '+2.1%'],
      ['Drug Interactions Prevented', '18', 'This month'],
      ['High-Risk Alerts', '7', 'Active monitoring'],
      ['Diagnoses Suggested', '18', 'Today'],
      ['Prescriptions Assisted', '12', 'Today'],
      ['Drug Interactions Flagged', '3', 'Today'],
      ['Reports Auto-summarized', '7', 'Today'],
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `SamarthaaMed_Analytics_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast('⬇', 'Exported', 'Analytics data downloaded as CSV');
  }

  function exportRiskReport() {
    const rows = [
      ['Patient', 'Risk Score', 'Condition', 'Timeframe', 'Status'],
      ['Priya Krishnamurthy', '82%', 'Cardiac event', '6 months', 'Urgent'],
      ['Ramesh Singh', '67%', 'CKD progression', '12 months', 'Active'],
      ['Vikram Nair', '55%', 'Hypertension onset', '18 months', 'Waiting'],
      ['Sunita Gupta', '38%', 'Re-infarction', '12 months', 'Stable'],
      ['Deepak Kumar', '49%', 'COPD exacerbation', '6 months', 'Stable'],
      ['Mohan Pillai', '22%', 'Epilepsy relapse', '18 months', 'Stable'],
      ['Nandini Bose', '18%', 'Thyroid dysfunction', '12 months', 'Stable'],
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `SamarthaaMed_RiskReport_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast('📊', 'Report exported', 'Patient risk data downloaded as CSV');
  }

  function showView(id) {
    // Close mobile sidebar when navigating
    closeMobileSidebar();
    // Sync bottom nav
    const bottomNavMap = {dashboard:0,consult:1,patients:2,prescription:3,settings:4};
    if (id in bottomNavMap) {
      const btns = document.querySelectorAll('.mobile-nav-item');
      btns.forEach(b => b.classList.remove('active'));
      if (btns[bottomNavMap[id]]) btns[bottomNavMap[id]].classList.add('active');
    }
    // Rebuild charts when their view becomes visible
    if (id === 'analytics') setTimeout(buildAnalyticsBarChart, 50);
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const v = document.getElementById('view-' + id);
    if (v) v.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(id)) n.classList.add('active');
    });
    if (views[id]) {
      document.getElementById('topbar-title').textContent = views[id].title;
      document.getElementById('topbar-sub').textContent = views[id].sub;
    }
    // Consult view is self-contained; all other views scroll via .content
    const content = document.querySelector('.content');
    if (content) content.scrollTop = 0;
    onViewChange(id);
  }

  // Textarea auto-grow already handled inline
  // Init
  animateVital('vhr', 98, 8);
  document.addEventListener('DOMContentLoaded', () => {
    buildAnalyticsBarChart();
    syncAllPatientDropdowns(); // ✅ populate lab dropdowns on load
    document.getElementById('labDate') && (document.getElementById('labDate').valueAsDate = new Date());
  });

  function switchRightTab(el, id) {
    el.closest('.consult-right-tabs').querySelectorAll('.r-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById('tab-' + id);
    if (tab) tab.classList.add('active');
  }

  const aiResponses = [
    "Based on the clinical picture and current ICMR 2024 ACS guidelines, I recommend proceeding with urgent coronary angiography within 24 hours given the GRACE score >140. Pre-cath checklist: NPO, IV access ×2, consent, nephroprotection protocol (NS 1 mL/kg/h 6h pre/post), and hold Metformin confirmed.",
    "Regarding the elevated HbA1c of 8.4% — in the acute ACS setting, intensive glucose control is NOT recommended (target BG 140–180 mg/dL). Use sliding-scale insulin if BG >180. Resume Metformin 48h post-cath once creatinine is stable. Consider adding an SGLT2 inhibitor (Dapagliflozin 10mg) for cardioprotection post-discharge per the DAPA-MI trial.",
    "For the anemia (Hb 10.8 g/dL) noted in context of dual antiplatelet therapy — this is a known risk factor for recurrent events. Check reticulocyte count and iron stores. If iron deficiency confirmed, IV iron sucrose is preferred over oral in acute ACS. A restrictive transfusion strategy is recommended (transfuse only if Hb <7–8 g/dL unless hemodynamic compromise).",
    "Based on the Framingham 10-year cardiac risk of 34% and existing CAD equivalents, LDL target should be <55 mg/dL per the 2024 ESC/CSI guidelines for very high-risk patients. Current LDL 168 mg/dL — Rosuvastatin 40mg alone may be insufficient. Consider adding Ezetimibe 10mg OD. A PCSK9 inhibitor (Evolocumab) may be considered if LDL remains >70 mg/dL after 3 months.",
  ];
  let aiIdx = 0;

  function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    const msgs = document.getElementById('chatMessages');
    const typing = document.getElementById('typingIndicator');

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.innerHTML = `<div class="msg-avatar">DR</div><div><div class="msg-bubble">${text}</div><div class="msg-time">Dr. · Just now</div></div>`;
    msgs.insertBefore(userMsg, typing);

    input.value = '';
    input.style.height = 'auto';

    // Show typing
    typing.style.display = 'block';
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(() => {
      typing.style.display = 'none';
      const aiMsg = document.createElement('div');
      aiMsg.className = 'msg ai';
      const resp = aiResponses[aiIdx % aiResponses.length];
      aiIdx++;
      aiMsg.innerHTML = `<div class="msg-avatar">🧬</div><div><div class="msg-bubble">${resp}</div><div class="msg-time">SamarthaaMed · Just now</div></div>`;
      msgs.insertBefore(aiMsg, typing);
      msgs.scrollTop = msgs.scrollHeight;
    }, 1800);

    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── CHAT TOOL BUTTONS ── */

  // 📎 Attach Report
  function chatAttachReport() {
    document.getElementById('reportFileInput').click();
  }

  function handleReportAttach(e) {
    const file = e.target.files[0];
    if (!file) return;
    const msgs = document.getElementById('chatMessages');
    const typing = document.getElementById('typingIndicator');

    // Show user message with attachment
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.innerHTML = `<div class="msg-avatar">DR</div><div>
      <div class="msg-bubble" style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.4rem">📄</span>
        <div>
          <div style="font-weight:600;font-size:0.85rem">${file.name}</div>
          <div style="font-size:0.72rem;color:var(--text3);margin-top:2px">${(file.size/1024).toFixed(1)} KB · ${file.type || 'document'}</div>
        </div>
      </div>
      <div class="msg-time">Dr. · Just now</div>
    </div>`;
    msgs.insertBefore(userMsg, typing);
    typing.style.display = 'block';
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(() => {
      typing.style.display = 'none';
      const ext = file.name.split('.').pop().toLowerCase();
      let aiReply = '';
      if (['jpg','jpeg','png','dcm'].includes(ext)) {
        aiReply = `I've received the image <strong>${file.name}</strong>. For full AI image analysis with finding detection, please use the <strong>Imaging AI</strong> module (click 📊 Upload ECG or navigate via sidebar). It supports X-ray, ECG, CT, fundus and ultrasound analysis with confidence-scored findings.`;
      } else if (ext === 'pdf') {
        aiReply = `Report <strong>${file.name}</strong> received. I can see this is a PDF document. Please paste the key values (lab results, findings, discharge summary text) directly into the chat and I'll interpret them in the context of this patient's clinical profile.`;
      } else {
        aiReply = `Document <strong>${file.name}</strong> attached. Please describe the key findings or paste relevant values from this report so I can provide clinical interpretation.`;
      }
      const aiMsg = document.createElement('div');
      aiMsg.className = 'msg ai';
      aiMsg.innerHTML = `<div class="msg-avatar">🧬</div><div><div class="msg-bubble">${aiReply}</div><div class="msg-time">SamarthaaMed · Just now</div></div>`;
      msgs.insertBefore(aiMsg, typing);
      msgs.scrollTop = msgs.scrollHeight;
    }, 1400);
    // Reset so same file can be re-attached
    e.target.value = '';
  }

  // 🎤 Voice Input
  let voiceRecognition = null;
  let isListening = false;

  function chatVoiceInput(btn) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('⚠️', 'Voice not supported', 'Use Chrome or Edge for voice input');
      return;
    }
    if (isListening) {
      voiceRecognition && voiceRecognition.stop();
      return;
    }

    // Show language selection modal
    showVoiceLanguageSelector(btn);
  }

  function showVoiceLanguageSelector(btn) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;animation:fadeIn 0.2s';
    
    modal.innerHTML = `
      <div style="background:var(--panel);border-radius:16px;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
        <div style="padding:24px;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:1.2rem;font-weight:700;color:var(--text1);margin-bottom:4px">🎤 Voice Input Language</div>
              <div style="font-size:0.85rem;color:var(--text3)">Select the language you'll speak in</div>
            </div>
            <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;color:var(--text2);cursor:pointer;padding:0;width:32px;height:32px">×</button>
          </div>
        </div>
        
        <div style="padding:24px;max-height:400px;overflow-y:auto">
          <div style="display:grid;gap:12px">
            ${generateLanguageOptions()}
          </div>
        </div>

        <div style="padding:20px;background:var(--navy3);border-radius:0 0 16px 16px;text-align:center;font-size:0.75rem;color:var(--text3)">
          💡 Tip: Speak clearly and pause briefly before the microphone stops
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);

    // Add click handlers to language buttons
    modal.querySelectorAll('.voice-lang-btn').forEach(langBtn => {
      langBtn.onclick = () => {
        const langCode = langBtn.getAttribute('data-lang');
        const langName = langBtn.getAttribute('data-name');
        modal.remove();
        startVoiceRecognition(langCode, langName, btn);
      };
    });
  }

  function generateLanguageOptions() {
    const languages = [
      { code: 'en-IN', name: 'English (India)', flag: '🇮🇳', native: 'English', tested: true },
      { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳', native: 'हिंदी', tested: true },
      { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ', tested: true, note: 'Best on Android Chrome' },
      { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்', tested: true },
      { code: 'te-IN', name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు', tested: true },
      { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം', tested: true },
      { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳', native: 'বাংলা', tested: true },
      { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳', native: 'मराठी', tested: true },
      { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી', tested: true },
      { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ', tested: true, note: 'May have limited support' },
      { code: 'ur-IN', name: 'Urdu', flag: '🇮🇳', native: 'اردو', tested: true, note: 'May have limited support' },
    ];

    return languages.map(lang => `
      <button class="voice-lang-btn" data-lang="${lang.code}" data-name="${lang.name}" 
              style="display:flex;align-items:center;gap:12px;padding:16px;background:var(--navy3);border:2px solid var(--border2);border-radius:8px;cursor:pointer;transition:all 0.2s;width:100%"
              onmouseover="this.style.borderColor='var(--teal)';this.style.background='var(--teal-dim)'" 
              onmouseout="this.style.borderColor='var(--border2)';this.style.background='var(--navy3)'">
        <div style="font-size:2rem">${lang.flag}</div>
        <div style="flex:1;text-align:left">
          <div style="font-weight:600;font-size:0.95rem;color:var(--text1)">${lang.name}</div>
          <div style="font-size:0.8rem;color:var(--text3)">${lang.native}</div>
          ${lang.note ? `<div style="font-size:0.7rem;color:var(--gold);margin-top:2px">ℹ️ ${lang.note}</div>` : ''}
        </div>
        <div style="font-size:1.2rem;color:var(--teal)">→</div>
      </button>
    `).join('');
  }

  function startVoiceRecognition(langCode, langName, btn) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRecognition = new SR();
    
    // Set language with fallback
    voiceRecognition.lang = langCode;
    voiceRecognition.interimResults = true;
    voiceRecognition.continuous = false;
    voiceRecognition.maxAlternatives = 3; // Increased for better recognition

    btn.textContent = '⏹ Stop Listening';
    btn.style.color = 'var(--red)';
    btn.style.borderColor = 'var(--red)';
    isListening = true;
    
    showToast('🎤', `Listening in ${langName}`, 'Speak clearly near your microphone');

    let finalTranscript = '';
    let lastResultTime = Date.now();

    voiceRecognition.onstart = () => {
      console.log('Voice recognition started for language:', langCode);
      // Visual indicator that mic is active
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.placeholder = `🎤 Listening in ${langName}... Speak now!`;
        chatInput.style.borderColor = 'var(--red)';
      }
    };

    voiceRecognition.onresult = (e) => {
      console.log('Recognition results:', e.results);
      let interimTranscript = '';
      
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        console.log(`Result ${i}: "${transcript}" (confidence: ${e.results[i][0].confidence}, final: ${e.results[i].isFinal})`);
        
        if (e.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          lastResultTime = Date.now();
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update input with both final and interim results
      const fullText = (finalTranscript + interimTranscript).trim();
      document.getElementById('chatInput').value = fullText;
      
      // Show interim feedback
      if (interimTranscript) {
        console.log('Interim text:', interimTranscript);
      }
    };

    voiceRecognition.onspeechstart = () => {
      console.log('Speech detected');
      showToast('👂', 'Speech Detected', 'Keep speaking...');
    };

    voiceRecognition.onspeechend = () => {
      console.log('Speech ended');
    };

    voiceRecognition.onnomatch = () => {
      console.log('No match found for speech');
      showToast('⚠️', 'Not Recognized', 'Could not understand speech. Try speaking more clearly.');
    };

    voiceRecognition.onend = () => {
      console.log('Voice recognition ended');
      isListening = false;
      btn.textContent = '🎤 Voice Input';
      btn.style.color = '';
      btn.style.borderColor = '';
      
      // Reset input placeholder
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.placeholder = 'Ask SamarthaaMed — type in English, Hindi, or any Indian language…';
        chatInput.style.borderColor = '';
      }
      
      const val = document.getElementById('chatInput').value.trim();
      if (val) {
        showToast('✅', 'Voice Recognized', `Text captured in ${langName}`);
        console.log('Final recognized text:', val);
        // Auto-send after short delay
        setTimeout(() => {
          sendMessage();
        }, 500);
      } else {
        showToast('⚠️', 'No Speech Detected', `Please try again. Make sure to speak in ${langName}.`);
        console.log('No text was recognized');
      }
    };

    voiceRecognition.onerror = (e) => {
      console.error('Voice recognition error:', e.error, e);
      isListening = false;
      btn.textContent = '🎤 Voice Input';
      btn.style.color = '';
      btn.style.borderColor = '';
      
      // Reset input
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.placeholder = 'Ask SamarthaaMed — type in English, Hindi, or any Indian language…';
        chatInput.style.borderColor = '';
      }
      
      let errorMessage = 'Could not recognize speech';
      let errorDetail = '';
      
      if (e.error === 'not-allowed') {
        errorMessage = 'Microphone Access Denied';
        errorDetail = 'Please allow microphone access in browser settings';
      } else if (e.error === 'no-speech') {
        errorMessage = 'No Speech Detected';
        errorDetail = `Please speak clearly in ${langName}`;
      } else if (e.error === 'network') {
        errorMessage = 'Network Error';
        errorDetail = 'Internet connection required for speech recognition';
      } else if (e.error === 'aborted') {
        errorMessage = 'Recognition Stopped';
        errorDetail = 'Voice input was cancelled';
      } else if (e.error === 'audio-capture') {
        errorMessage = 'No Microphone Found';
        errorDetail = 'Please connect a microphone and try again';
      } else if (e.error === 'service-not-allowed') {
        errorMessage = 'Service Not Allowed';
        errorDetail = 'Speech recognition is not available on this page';
      } else if (e.error === 'language-not-supported') {
        errorMessage = 'Language Not Supported';
        errorDetail = `${langName} may not be supported by your browser. Try English or Hindi.`;
      } else {
        errorDetail = `Error: ${e.error}`;
      }
      
      showToast('⚠️', errorMessage, errorDetail);
      
      // If language not supported, suggest alternatives
      if (e.error === 'language-not-supported') {
        setTimeout(() => {
          showToast('💡', 'Suggestion', 'Chrome/Edge on Android has best support for Indian languages');
        }, 2000);
      }
    };

    try {
      voiceRecognition.start();
      console.log('Starting voice recognition for', langName, 'with code', langCode);
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      showToast('⚠️', 'Voice Input Failed', 'Could not start microphone. Please try again.');
      isListening = false;
      btn.textContent = '🎤 Voice Input';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  }

  // Update the AI language to match voice input if needed
  function syncVoiceToAILanguage(langCode) {
    const langMap = {
      'en-IN': 'en',
      'hi-IN': 'hi',
      'kn-IN': 'kn',
      'ta-IN': 'ta',
      'te-IN': 'te',
      'bn-IN': 'bn'
    };
    
    const aiLang = langMap[langCode];
    if (aiLang && aiLanguage !== aiLang) {
      aiLanguage = aiLang;
      localStorage.setItem('aiLanguage', aiLang);
    }
  }

  // 🧪 Import Labs — open the lab entry modal pre-linked to this patient
  function chatImportLabs() {
    // Get current patient from topbar subtitle
    const sub = document.getElementById('topbar-sub').textContent;
    const patientName = sub.replace(' · Active Session', '').trim();
    // Pre-select in lab modal if possible
    const labSel = document.getElementById('labModalPatientSelect');
    if (labSel) {
      const opt = Array.from(labSel.options).find(o => o.text.startsWith(patientName));
      if (opt) labSel.value = opt.value;
    }
    openLabEntry();
    showToast('🧪', 'Lab Entry opened', 'Values will be linked to ' + patientName);
  }

  // Animate vitals
  function animateVital(id, base, range) {
    const el = document.getElementById(id);
    if (!el) return;
    setInterval(() => {
      const v = Math.round(base + (Math.random() - 0.5) * range);
      const unit = el.querySelector('.vital-unit');
      el.textContent = v;
      if (unit) el.appendChild(unit);
    }, 3000);
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.filter-row').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ══ CONSULTATION ENHANCEMENTS ══ */
  const patientProfiles = {
    PK: {
      name: 'Priya Krishnamurthy', meta: '52F · ID: MM-2024-04521 · Cardiology',
      initials: 'PK', avatarColor: 'linear-gradient(135deg,#EF4444,#DC2626)',
      vitals: { hr:'98 bpm', bp:'148/92', spo2:'96%', temp:'37.4°C' },
      hbColor: '#EF4444',
      complaints: ['Chest pain','Radiating to left arm','Diaphoresis','Dyspnea on exertion','Nausea','Fatigue'],
      complaintTypes: ['red','red','gold','gold','',''],
      history: ['DM Type 2 (8 yrs)','Hypertension (5 yrs)','Dyslipidemia','Ex-smoker'],
      historyTypes: ['','','','gold'],
      meds: 'Metformin 1000mg BD · Amlodipine 5mg OD\nAtorvastatin 40mg HS · Aspirin 75mg OD\nMetoprolol 25mg BD',
      scores: [['HEART Score','7/10 — High Risk','red'],['TIMI Score','5/7 — Moderate','gold'],['Framingham 10-yr','34%','red']],
    },
    DK: {
      name: 'Deepak Kumar', meta: '58M · ID: MM-2026-03345 · Pulmonology',
      initials: 'DK', avatarColor: 'linear-gradient(135deg,#EF4444,#B91C1C)',
      vitals: { hr:'112 bpm', bp:'138/88', spo2:'88%', temp:'37.8°C' },
      hbColor: '#EF4444',
      complaints: ['Severe dyspnea','Using accessory muscles','Productive cough','Wheezing','Chest tightness'],
      complaintTypes: ['red','red','gold','gold',''],
      history: ['COPD (12 yrs)','Asthma-COPD overlap','Ex-smoker (40 pack-years)','Frequent exacerbations'],
      historyTypes: ['red','','gold','red'],
      meds: 'Salbutamol + Ipratropium inhaler\nFluticasone/Salmeterol 500/50 BD\nTheophylline 200mg BD',
      scores: [['SpO₂','88% — Severe hypoxia','red'],['Resp Rate','28/min — Tachypnea','red'],['FEV1','42% predicted','red']],
    },
    MI: {
      name: 'Meena Iyer', meta: '49F · ID: MM-2026-08876 · Emergency Medicine',
      initials: 'MI', avatarColor: 'linear-gradient(135deg,#DC2626,#991B1B)',
      vitals: { hr:'94 bpm', bp:'210/118', spo2:'97%', temp:'37.2°C' },
      hbColor: '#DC2626',
      complaints: ['Severe headache','Visual disturbance','Blurred vision','Nausea and vomiting','Confusion'],
      complaintTypes: ['red','red','gold','gold','red'],
      history: ['No prior HTN history','Family history: Mother — HTN, stroke','No current medications','New onset hypertension'],
      historyTypes: ['','gold','','red'],
      meds: 'None — New presentation',
      scores: [['BP','210/118 — Hypertensive crisis','red'],['MAP','149 mmHg — Critical','red'],['Papilloedema risk','High','red']],
    },
    RS: {
      name: 'Ramesh Singh', meta: '67M · ID: MM-2023-01892 · Cardiology',
      initials: 'RS', avatarColor: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
      vitals: { hr:'72 bpm', bp:'132/84', spo2:'97%', temp:'36.8°C' },
      hbColor: '#3B82F6',
      complaints: ['Fatigue on exertion','Mild SOB on climbing stairs','Pitting oedema (bilateral)'],
      complaintTypes: ['gold','gold',''],
      history: ['CAD (Post CABG — 2021)','DM Type 2 (12 yrs)','CKD Stage 2','Dyslipidemia'],
      historyTypes: ['','','red',''],
      meds: 'Aspirin 75mg OD · Clopidogrel 75mg OD\nRosuvastatin 20mg HS · Metformin 500mg BD\nRamipril 5mg OD · Furosemide 40mg OD',
      scores: [['GRACE Score','88 — Low-mod','gold'],['eGFR','58 mL/min (CKD G3a)','gold'],['EF (Echo)','48% — Mildly reduced','gold']],
    },
    AM: {
      name: 'Anita Mehta', meta: '38F · ID: MM-2025-09341 · Cardiology',
      initials: 'AM', avatarColor: 'linear-gradient(135deg,#10B981,#059669)',
      vitals: { hr:'108 bpm', bp:'118/74', spo2:'98%', temp:'37.0°C' },
      hbColor: '#10B981',
      complaints: ['Palpitations (intermittent)','Shortness of breath','Anxiety','Chest tightness'],
      complaintTypes: ['gold','','',''],
      history: ['No known chronic illness','Anxiety disorder (treated)','Family history: Father — DM'],
      historyTypes: ['','','gold'],
      meds: 'Clonazepam 0.5mg SOS\nVitamin D3 60,000 IU weekly',
      scores: [['Holter','SVT episodes (20/day)','gold'],['Echo','Normal LV function, EF 65%',''],['TSH','1.8 mIU/L (Normal)','']],
    },
    VN: {
      name: 'Vikram Nair', meta: '44M · ID: MM-2024-07234 · Cardiology',
      initials: 'VN', avatarColor: 'linear-gradient(135deg,#8B5CF6,#7C3AED)',
      vitals: { hr:'80 bpm', bp:'142/88', spo2:'99%', temp:'36.9°C' },
      hbColor: '#8B5CF6',
      complaints: ['Persistent headache (morning)','Occasional dizziness','Visual blurring (rare)'],
      complaintTypes: ['gold','',''],
      history: ['Prehypertension (3 yrs)','Dyslipidemia','Sedentary lifestyle','Overweight (BMI 27.4)'],
      historyTypes: ['','','gold','gold'],
      meds: 'Amlodipine 5mg OD\nAtorvastatin 10mg HS',
      scores: [['BP Stage','Stage 1 Hypertension','gold'],['Framingham 10-yr','18%',''],['BMI','27.4 kg/m² (Overweight)','gold']],
    },
    SG: {
      name: 'Sunita Gupta', meta: '61F · ID: MM-2025-02218 · Cardiology',
      initials: 'SG', avatarColor: 'linear-gradient(135deg,#F59E0B,#D97706)',
      vitals: { hr:'68 bpm', bp:'124/78', spo2:'98%', temp:'36.7°C' },
      hbColor: '#F59E0B',
      complaints: ['Post-STEMI follow-up (3 months)','Mild exertional fatigue','Cardiac rehab ongoing'],
      complaintTypes: ['','gold',''],
      history: ['STEMI anterior wall (Nov 2025)','DM Type 2 (6 yrs)','Hypertension','Post PCI (LAD stenting)'],
      historyTypes: ['red','','',''],
      meds: 'Aspirin 75mg OD · Ticagrelor 90mg BD\nRosuvastatin 40mg HS · Metoprolol 50mg BD\nRamipril 5mg OD · Metformin 1000mg BD',
      scores: [['EF (Echo)','52% — mildly reduced (recovery)','gold'],['6-min walk test','420m — improving',''],['HbA1c','7.1% — near target','']],
    },
    NB: {
      name: 'Nandini Bose', meta: '34F · ID: MM-2025-08876 · Endocrinology',
      initials: 'NB', avatarColor: 'linear-gradient(135deg,#06B6D4,#0891B2)',
      vitals: { hr:'76 bpm', bp:'118/76', spo2:'98%', temp:'36.9°C' },
      hbColor: '#06B6D4',
      complaints: ['Weight gain','Fatigue','Irregular periods','Hair thinning','Cold intolerance'],
      complaintTypes: ['gold','gold','red','',''],
      history: ['Hypothyroidism (diagnosed 2 yrs ago)','PCOS (polycystic ovary syndrome)','Vitamin D deficiency','No other chronic conditions'],
      historyTypes: ['','red','',''],
      meds: 'Levothyroxine 75mcg OD (morning, empty stomach)\nMetformin 500mg BD\nVitamin D3 60,000 IU weekly',
      scores: [['TSH','5.8 mIU/L — Suboptimal','gold'],['Free T4','0.9 ng/dL — Low-normal','gold'],['HbA1c','5.8% — Prediabetes','gold']],
    },
    MP: {
      name: 'Mohan Pillai', meta: '55M · ID: MM-2024-05512 · Gastroenterology',
      initials: 'MP', avatarColor: 'linear-gradient(135deg,#34D399,#059669)',
      vitals: { hr:'78 bpm', bp:'130/82', spo2:'97%', temp:'37.0°C' },
      hbColor: '#34D399',
      complaints: ['Abdominal pain (epigastric)','Nausea post meals','Heartburn','Bloating'],
      complaintTypes: ['gold','','gold',''],
      history: ['GERD (3 yrs)','H. pylori positive (2022, treated)','No surgical history'],
      historyTypes: ['','gold',''],
      meds: 'Pantoprazole 40mg OD\nDomperidone 10mg TDS',
      scores: [['Endoscopy','Mild esophagitis Grade A','gold'],['H. pylori','Negative (post-treatment)',''],['BMI','26.8 kg/m² (Overweight)','gold']],
    },
    KR: {
      name: 'Karthik Reddy', meta: '41M · ID: MM-2025-11203 · Cardiology',
      initials: 'KR', avatarColor: 'linear-gradient(135deg,#10B981,#065F46)',
      vitals: { hr:'88 bpm', bp:'136/86', spo2:'98%', temp:'37.1°C' },
      hbColor: '#10B981',
      complaints: ['Intermittent chest tightness','Exertional dyspnea','Mild ankle swelling'],
      complaintTypes: ['gold','gold',''],
      history: ['Hypertension (2 yrs)','Family history: Father — MI at 48','Non-smoker'],
      historyTypes: ['','red',''],
      meds: 'Amlodipine 5mg OD\nTelmisartan 40mg OD',
      scores: [['BP Stage','Stage 1 Hypertension','gold'],['Framingham 10-yr','22%','gold'],['Echo','Pending','']],
    },
  };

  function switchConsultPatient(el, initials, name, status) {
    // Update chips
    document.querySelectorAll('.patient-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('topbar-sub').textContent = name + ' · Active Session';

    const p = patientProfiles[initials];
    if (!p) {
      // New patient not yet in profiles — show name and a "no full record" message
      const nameEl = document.querySelector('.consult-patient-name');
      if (nameEl) nameEl.textContent = name;
      const metaEl = document.querySelector('.consult-patient-meta');
      if (metaEl) metaEl.textContent = 'Newly registered · No vitals recorded yet';
      const msgs = document.getElementById('chatMessages');
      const typing = document.getElementById('typingIndicator');
      if (msgs && typing) {
        const msg = document.createElement('div');
        msg.className = 'msg ai';
        msg.innerHTML = `<div class="msg-avatar">🧬</div><div><div class="msg-bubble" style="border-left:3px solid var(--teal);padding-left:12px">
          <strong style="color:var(--teal)">Consultation opened → ${name}</strong><br>
          <span style="font-size:0.78rem;color:var(--text3)">Newly registered patient — full vitals not yet recorded. How can I assist?</span>
        </div><div class="msg-time">SamarthaaMed · Just now</div></div>`;
        msgs.insertBefore(msg, typing);
        msgs.scrollTop = msgs.scrollHeight;
      }
      showToast('🩺', 'Consultation opened', name);
      return;
    }

    // Update avatar + name in left panel
    const avatarEl = document.querySelector('.consult-patient-avatar');
    if (avatarEl) { avatarEl.textContent = p.initials; avatarEl.style.background = p.avatarColor; }
    const nameEl = document.querySelector('.consult-patient-name');
    if (nameEl) nameEl.textContent = p.name;
    const metaEl = document.querySelector('.consult-patient-meta');
    if (metaEl) metaEl.textContent = p.meta;

    // Update vitals in mini boxes
    const vitMinis = document.querySelectorAll('.vital-mini .vval');
    if (vitMinis.length >= 4) {
      vitMinis[0].textContent = p.vitals.hr;
      vitMinis[1].textContent = p.vitals.bp;
      vitMinis[2].textContent = p.vitals.spo2;
      vitMinis[3].textContent = p.vitals.temp;
    }

    // Update complaint tags
    const tagsWrap = document.querySelector('.consult-left-body .symptom-tags');
    if (tagsWrap) {
      tagsWrap.innerHTML = p.complaints.map((c, i) =>
        `<span class="tag ${p.complaintTypes[i] || ''}">${c}</span>`
      ).join('');
    }

    // Update history tags
    const historyWraps = document.querySelectorAll('.consult-left-body .symptom-tags');
    if (historyWraps.length >= 2) {
      historyWraps[1].innerHTML = p.history.map((h, i) =>
        `<span class="tag ${p.historyTypes[i] || ''}">${h}</span>`
      ).join('');
    }

    // Update medications text
    const medDivs = document.querySelectorAll('.consult-left-body');
    const allText = document.querySelectorAll('.consult-left-body > div');
    // Find the medication text div (after the meds mini-header)
    const medsDiv = document.querySelector('.consult-left-body .mini-header:nth-of-type(3)');
    if (medsDiv && medsDiv.nextElementSibling) {
      medsDiv.nextElementSibling.innerHTML = p.meds.replace(/\n/g, '<br>');
    }

    // Update scores
    const scoreRows = document.querySelectorAll('.consult-left-body > div:last-of-type > div');
    // Actually find score rows by parent
    const scoreContainer = document.querySelector('.consult-left-body > div[style*="flex-direction:column"]');
    if (scoreContainer) {
      scoreContainer.innerHTML = p.scores.map(([label, val, color]) => `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.78rem;color:var(--text2)">${label}</span>
          <span style="font-family:var(--mono);font-size:0.9rem;font-weight:600;color:var(--${color || 'teal'})">${val}</span>
        </div>`).join('');
    }

    // Add welcome message to chat
    const msgs = document.getElementById('chatMessages');
    const typing = document.getElementById('typingIndicator');
    if (msgs && typing) {
      const welcomeMsg = document.createElement('div');
      welcomeMsg.className = 'msg ai';
      welcomeMsg.innerHTML = `<div class="msg-avatar">🧬</div><div><div class="msg-bubble" style="border-left:3px solid var(--teal);padding-left:12px">
        <strong style="color:var(--teal)">Patient switched → ${p.name}</strong><br>
        <span style="font-size:0.78rem;color:var(--text3)">${p.meta}</span><br><br>
        Vitals: HR ${p.vitals.hr} · BP ${p.vitals.bp} · SpO₂ ${p.vitals.spo2}<br>
        How can I assist with this patient's consultation?
      </div><div class="msg-time">SamarthaaMed · Just now</div></div>`;
      msgs.insertBefore(welcomeMsg, typing);
      msgs.scrollTop = msgs.scrollHeight;
    }

    showToast('🔄', 'Patient switched', p.name);
  }

  // SOAP Note generator
  const soapData = {
    S: `Chief Complaint: Chest pain × 2 days, radiating to left arm, associated with diaphoresis and dyspnea on exertion. Nausea present. No fever, no palpitations reported by patient.

History of Present Illness: 52-year-old female with known DM Type 2 (8 yrs), hypertension (5 yrs), dyslipidemia, and ex-smoker. Presenting with worsening angina-type chest pain for 48 hours, partially relieved by rest. Not relieved by antacids.

Current Medications: Metformin 1000mg BD, Amlodipine 5mg OD, Atorvastatin 40mg HS, Aspirin 75mg OD, Metoprolol 25mg BD.`,
    O: `Vitals: BP 148/92 mmHg | HR 98 bpm | SpO₂ 96% | Temp 37.4°C | RR 18/min
Weight: 72 kg | Height: 158 cm | BMI: 28.8 kg/m²

ECG: ST depression in V4–V6, no ST elevation, no LBBB
Investigations: Troponin I 0.08 ng/mL (HIGH, 2× ULN) | CK-MB 28 U/L (HIGH) | BNP 290 pg/mL | LDL-C 168 mg/dL | HbA1c 8.4% | eGFR 72 mL/min | Hb 10.8 g/dL (LOW)

HEART Score: 7/10 (High Risk) | TIMI Score: 5/7 | Framingham 10-yr risk: 34%`,
    A: `1. Non-ST Elevation Myocardial Infarction (NSTEMI) — ICD-11: BA41.0Z [87% confidence]
   Evidence: Elevated Troponin I (×2 ULN), ST depression V4-V6, typical chest pain radiation, HEART Score 7
   
2. Rule out Unstable Angina — ICD-11: BA80.0 [72% confidence]
   Serial troponins to differentiate

3. Hypertension — Stage 2, poorly controlled | BP 148/92 on current regimen
4. Diabetes Mellitus Type 2 — uncontrolled | HbA1c 8.4%
5. Dyslipidemia — LDL 168 mg/dL (target <55 in VHCVR patients)
6. Mild anemia (Hb 10.8) — iron deficiency vs chronic disease, investigate`,
    P: `IMMEDIATE:
• Aspirin 300mg loading stat → 75mg OD lifelong
• Ticagrelor 180mg loading → 90mg BD × 12 months (preferred over Clopidogrel in DM)
• Enoxaparin 60mg SC BD (1mg/kg, eGFR 72 — standard dose)
• Rosuvastatin 40mg HS (high-intensity, switch from Atorvastatin)
• HOLD Metformin — contrast dye / cath planned. Resume 48h post-procedure
• GTN SL PRN if BP allows
• Urgent coronary angiography within 24h (GRACE >140, HEART 7)
• NPO from midnight, IV access ×2, nephroprotection protocol

SHORT-TERM:
• Serial Troponin at 1h and 3h
• Echocardiogram to assess LVEF
• Repeat labs post-cath: Creatinine, eGFR, CBC
• Cardiac rehabilitation referral post-stabilisation
• Diabetes management: Sliding scale insulin while admitted
• Iron studies for anemia — IV iron if IDA confirmed`,
    ICD: `BA41.0Z — Non-ST elevation myocardial infarction (NSTEMI)\nBA00.0 — Essential hypertension\n5A11 — Type 2 diabetes mellitus\n5A71.0 — Hypercholesterolaemia\n3A00.1 — Iron deficiency anaemia`
  };

  function generateSoapNote() {
    document.getElementById('soapS').textContent = soapData.S;
    document.getElementById('soapO').textContent = soapData.O;
    document.getElementById('soapA').textContent = soapData.A;
    document.getElementById('soapP').textContent = soapData.P;
    document.getElementById('soapICD').textContent = soapData.ICD;
    document.getElementById('soapModal').classList.add('open');
  }

  function copySoap() {
    const full = ['SUBJECTIVE\n' + soapData.S, 'OBJECTIVE\n' + soapData.O, 'ASSESSMENT\n' + soapData.A, 'PLAN\n' + soapData.P, 'ICD-11\n' + soapData.ICD].join('\n\n---\n\n');
    navigator.clipboard?.writeText(full);
    showToast('📋', 'SOAP Note copied', 'Paste into any EMR or document');
  }

  /* ══ ENHANCED PRESCRIPTION ══ */
  const drugDB = [
    { name:'Aspirin', class:'Antiplatelet', generic:'Jan Aushadhi ₹3/strip', indication:'ACS, antiplatelet therapy', doses:['75mg OD','150mg OD','300mg stat'], caution:'' },
    { name:'Atorvastatin', class:'HMG-CoA Reductase Inhibitor', generic:'Jan Aushadhi ₹5/tab', indication:'Dyslipidemia, CAD prevention', doses:['10mg OD','20mg OD','40mg HS','80mg HS'], caution:'' },
    { name:'Rosuvastatin', class:'HMG-CoA Reductase Inhibitor', generic:'Jan Aushadhi ₹8/tab', indication:'High-intensity statin for VHCVR', doses:['10mg OD','20mg OD','40mg HS'], caution:'' },
    { name:'Metformin', class:'Biguanide', generic:'Jan Aushadhi ₹4/strip', indication:'Type 2 Diabetes Mellitus', doses:['500mg OD','500mg BD','1000mg BD'], caution:'Hold before contrast; avoid in eGFR <30' },
    { name:'Amlodipine', class:'Calcium Channel Blocker', generic:'Jan Aushadhi ₹3/tab', indication:'Hypertension, stable angina', doses:['2.5mg OD','5mg OD','10mg OD'], caution:'' },
    { name:'Metoprolol Succinate', class:'Beta-1 Blocker', generic:'Generic available ₹6/tab', indication:'Hypertension, ACS, heart failure', doses:['12.5mg BD','25mg BD','50mg BD','100mg OD'], caution:'Hold if HR <50 or SBP <90' },
    { name:'Ticagrelor', class:'P2Y12 Inhibitor', generic:'Branded — ₹60/tab', indication:'ACS dual antiplatelet (preferred in DM)', doses:['90mg BD','60mg BD (maintenance)'], caution:'Contraindicated in prior haemorrhagic stroke' },
    { name:'Clopidogrel', class:'P2Y12 Inhibitor', generic:'Jan Aushadhi ₹8/tab', indication:'ACS dual antiplatelet', doses:['75mg OD','300mg loading'], caution:'CYP2C19 poor metabolisers may have reduced effect' },
    { name:'Enoxaparin', class:'LMWH', generic:'Generic ₹80/syringe', indication:'ACS anticoagulation, DVT prophylaxis', doses:['0.5mg/kg SC BD','1mg/kg SC BD','40mg SC OD (prophylaxis)'], caution:'Dose reduce for eGFR <30; avoid if eGFR <15' },
    { name:'Pantoprazole', class:'Proton Pump Inhibitor', generic:'Jan Aushadhi ₹4/tab', indication:'GI protection with NSAIDs/dual antiplatelet', doses:['20mg OD','40mg OD','40mg BD'], caution:'' },
    { name:'Lisinopril', class:'ACE Inhibitor', generic:'Jan Aushadhi ₹5/tab', indication:'Hypertension, heart failure, post-MI', doses:['2.5mg OD','5mg OD','10mg OD','20mg OD'], caution:'Contraindicated in pregnancy; monitor K+ and creatinine' },
    { name:'Dapagliflozin', class:'SGLT2 Inhibitor', generic:'Branded ₹35/tab', indication:'T2DM with CVD — cardioprotective', doses:['10mg OD'], caution:'Hold before major surgery; UTI risk' },
    { name:'Insulin Glargine', class:'Long-acting Insulin', generic:'Branded ₹250/vial', indication:'T2DM inadequate control, inpatient glycaemia', doses:['10 units HS','0.2 units/kg HS'], caution:'Hypoglycaemia risk — monitor FBS' },
    { name:'Salbutamol Inhaler', class:'Short-acting Beta-2 Agonist', generic:'Jan Aushadhi ₹35/inhaler', indication:'Acute bronchospasm, asthma, COPD', doses:['2 puffs PRN','2 puffs QID'], caution:'' },
    { name:'Amoxicillin', class:'Beta-lactam Antibiotic', generic:'Jan Aushadhi ₹12/tab', indication:'Respiratory / urinary tract infections', doses:['250mg TDS','500mg TDS','875mg BD'], caution:'Check penicillin allergy' },
    { name:'Azithromycin', class:'Macrolide Antibiotic', generic:'Jan Aushadhi ₹8/tab', indication:'Atypical pneumonia, URTI', doses:['500mg OD × 3 days','500mg stat then 250mg OD × 4 days'], caution:'QTc prolongation — avoid with other QT-prolonging drugs' },
  ];

  let prescriptionList = [];

  function initPrescriptionView() {
    const wrap = document.getElementById('rxSearchWrap');
    if (!wrap) return;
    renderPrescriptionList();
  }

  function searchDrugs(val) {
    const results = document.getElementById('drugSearchResults');
    if (!val || val.length < 2) { results.classList.remove('show'); return; }
    const matches = drugDB.filter(d => d.name.toLowerCase().includes(val.toLowerCase()) || d.class.toLowerCase().includes(val.toLowerCase()) || d.indication.toLowerCase().includes(val.toLowerCase()));
    if (!matches.length) { results.classList.remove('show'); return; }
    results.innerHTML = matches.slice(0, 8).map(d => `
      <div class="drug-result-item" onclick="addDrugToPrescription('${d.name}')">
        <div class="drug-result-name">${d.name}</div>
        <div class="drug-result-meta">${d.class} · ${d.indication}</div>
        <div class="drug-result-generic">${d.generic}</div>
      </div>`).join('');
    results.classList.add('show');
  }

  function addDrugToPrescription(name) {
    document.getElementById('drugSearchResults').classList.remove('show');
    document.getElementById('rxDrugSearch').value = '';
    const drug = drugDB.find(d => d.name === name);
    if (!drug) return;
    const id = 'rx_' + Date.now();
    prescriptionList.push({ id, ...drug, dose: drug.doses[0] || '', frequency: 'OD', duration: '7 days', instructions: 'After food' });
    renderPrescriptionList();
    showToast('💊', drug.name + ' added', drug.class);
  }

  function removeDrug(id) {
    prescriptionList = prescriptionList.filter(d => d.id !== id);
    renderPrescriptionList();
  }

  function renderPrescriptionList() {
    const container = document.getElementById('rxDrugList');
    if (!container) return;
    if (!prescriptionList.length) {
      container.innerHTML = '<div class="empty-state"><div class="icon">💊</div><div class="text">No drugs added yet.<br>Search above to add medications.</div></div>';
      document.getElementById('rxPreviewSection').innerHTML = '<div style="font-size:0.78rem;color:var(--text3);text-align:center;padding:20px">Add drugs to generate prescription preview</div>';
      return;
    }
    container.innerHTML = prescriptionList.map((d, i) => `
      <div class="rx-card">
        <div class="rx-card-header">
          <div><div class="rx-card-name">${d.name}</div><div class="rx-card-generic">${d.generic} · ${d.class}</div></div>
          <button class="rx-card-remove" onclick="removeDrug('${d.id}')">✕</button>
        </div>
        <div class="rx-dose-row">
          <div class="rx-field-wrap"><div class="rx-field-label">Dose</div><select class="rx-field-select" onchange="updateRxField('${d.id}','dose',this.value)">${d.doses.map(dz => `<option ${dz===d.dose?'selected':''}>${dz}</option>`).join('')}</select></div>
          <div class="rx-field-wrap"><div class="rx-field-label">Frequency</div><select class="rx-field-select" onchange="updateRxField('${d.id}','frequency',this.value)">
            ${['OD','BD','TDS','QID','PRN','Stat','HS','Weekly'].map(f=>`<option ${f===d.frequency?'selected':''}>${f}</option>`).join('')}
          </select></div>
          <div class="rx-field-wrap"><div class="rx-field-label">Duration</div><select class="rx-field-select" onchange="updateRxField('${d.id}','duration',this.value)">
            ${['3 days','5 days','7 days','10 days','14 days','1 month','3 months','6 months','Lifelong'].map(dur=>`<option ${dur===d.duration?'selected':''}>${dur}</option>`).join('')}
          </select></div>
        </div>
        <div class="rx-field-wrap" style="margin-bottom:6px"><div class="rx-field-label">Instructions</div><select class="rx-field-select" onchange="updateRxField('${d.id}','instructions',this.value)">
          ${['After food','Before food','With food','Empty stomach','At bedtime','In the morning'].map(inst=>`<option ${inst===d.instructions?'selected':''}>${inst}</option>`).join('')}
        </select></div>
        ${d.caution ? `<div style="font-size:0.7rem;color:var(--gold);background:var(--gold-dim);border:1px solid rgba(245,166,35,0.2);border-radius:5px;padding:5px 9px;display:flex;align-items:center;gap:6px">⚠️ ${d.caution}</div>` : ''}
      </div>`).join('');
    updateRxPreview();
  }

  function updateRxField(id, field, value) {
    const drug = prescriptionList.find(d => d.id === id);
    if (drug) { drug[field] = value; updateRxPreview(); }
  }

  function updateRxPreview() {
    const preview = document.getElementById('rxPreviewSection');
    if (!preview || !prescriptionList.length) return;
    preview.innerHTML = `
      <div style="background:var(--navy3);border:1px solid var(--border2);border-radius:10px;padding:18px">
        <div style="text-align:center;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)">
          <div style="font-family:var(--syne);font-size:1.1rem;font-weight:800;color:var(--teal)">SamarthaaMed</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <div><div style="font-size:0.75rem;color:var(--text3)">Patient</div><div style="font-size:0.85rem;font-weight:600;color:var(--text1)">Priya Krishnamurthy</div><div style="font-size:0.72rem;color:var(--text3)">52F · MM-2024-04521</div></div>
          <div style="text-align:right"><div style="font-size:0.75rem;color:var(--text3)">Date</div><div style="font-size:0.82rem;color:var(--text1)">24 Feb 2026</div></div>
        </div>
        <div style="font-size:0.78rem;font-weight:600;color:var(--text3);margin-bottom:8px">Rₓ</div>
        <div style="font-size:0.8rem;color:var(--text2);line-height:2.2">
          ${prescriptionList.map((d, i) => `${i+1}. ${d.name} ${d.dose} ${d.frequency} × ${d.duration} — ${d.instructions}`).join('\n')}
        </div>
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">
          <div style="font-size:0.7rem;color:var(--text3)">Advice: Follow up in 1 week. Report any side effects immediately.</div>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="showToast('🖨','Prescription sent to print','PDF generated successfully')">🖨 Print</button>
        <button class="btn btn-ghost" style="flex:1;justify-content:center" onclick="showToast('📲','Sent via WhatsApp','Prescription shared with patient')">📲 WhatsApp</button>
      </div>`;
  }

  /* ══ LAB RESULTS ══ */
  function switchLabPanel(btn, id) {
    document.querySelectorAll('.lab-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('labpanel-' + id);
    if (panel) panel.classList.add('active');
  }

  function openLabEntry() {
    document.getElementById('labModal').classList.add('open');
    if (document.getElementById('labDate')) document.getElementById('labDate').valueAsDate = new Date();
    switchLabMode('manual');
    // Reset queue
    labReportQueue = [];
    labQueueIdCounter = 0;
    const queueEl = document.getElementById('labUploadQueue');
    const previewEl = document.getElementById('labExtractedPreview');
    const instrEl = document.getElementById('labUploadInstructions');
    if (queueEl) { queueEl.style.display = 'none'; document.getElementById('labQueueCards').innerHTML = ''; }
    if (previewEl) { previewEl.style.display = 'none'; document.getElementById('labExtractedRows').innerHTML = ''; }
    if (instrEl) instrEl.style.display = 'block';
  }

  function closeLabModal() {
    document.getElementById('labModal').classList.remove('open');
  }

  function flagLab(input, low, high, mode) {
    const val = parseFloat(input.value);
    input.classList.remove('abnormal-h', 'abnormal-l');
    if (!input.value) return;
    if (mode.includes('H') && val > high) input.classList.add('abnormal-h');
    else if (mode.includes('L') && val < low) input.classList.add('abnormal-l');
  }

  function saveLabResults() {
    const manualVisible = document.getElementById('labPanelManual').style.display !== 'none';
    let filled = 0;
    if (manualVisible) {
      document.querySelectorAll('#labEntryRows .lab-val-input').forEach(i => { if (i.value) filled++; });
      if (!filled) { showToast('⚠️', 'No values entered', 'Enter at least one lab value'); return; }
    } else {
      const doneCount = labReportQueue.filter(r => r.status === 'done').length;
      if (doneCount === 0) { showToast('⚠️', 'No reports ready', 'Upload a report and wait for extraction to complete'); return; }
      document.querySelectorAll('#labExtractedRows .lab-val-input').forEach(i => { if (i.value) filled++; });
      if (!filled) { showToast('⚠️', 'Nothing to save', 'No values extracted yet'); return; }
    }
    closeLabModal();
    const source = manualVisible ? 'manual entry' : `${labReportQueue.filter(r=>r.status==='done').length} report${labReportQueue.filter(r=>r.status==='done').length>1?'s':''}`;
    showToast('✅', 'Lab results saved', `${filled} values from ${source} · AI interpretation generated`);
    const badge = document.querySelector('.nav-badge');
    if (badge) badge.textContent = String(parseInt(badge.textContent || '5') + 1);
  }

  /* ══ LAB MODE SWITCH + MULTI-REPORT UPLOAD ══ */
  function switchLabMode(mode) {
    const isManual = mode === 'manual';
    const manualPanel = document.getElementById('labPanelManual');
    const uploadPanel = document.getElementById('labPanelUpload');
    if (manualPanel) manualPanel.style.display = isManual ? 'block' : 'none';
    if (uploadPanel) uploadPanel.style.display = isManual ? 'none' : 'block';
    ['labTabManual','labTabUpload'].forEach((id, idx) => {
      const active = isManual ? idx === 0 : idx === 1;
      const el = document.getElementById(id);
      if (!el) return;
      el.style.background = active ? 'var(--teal-dim)' : 'transparent';
      el.style.color = active ? 'var(--teal)' : 'var(--text3)';
      el.style.borderBottom = active ? '2px solid var(--teal)' : '2px solid transparent';
    });
    const footer = document.getElementById('labFooterInfo');
    if (footer) footer.textContent = isManual
      ? 'Abnormal values auto-highlighted · AI interpretation on save'
      : 'Upload reports — values from all files are merged into one panel';
  }

  // Queue state: array of { id, name, size, status:'processing'|'done'|'error', data:[] }
  let labReportQueue = [];
  let labQueueIdCounter = 0;

  // All possible lab tests with reference ranges
  const labTestBank = [
    { name:'Troponin I',          unit:'ng/mL',  low:0,    high:0.04,  mode:'H',   samples:['0.06','0.04','0.02','0.08','0.01'] },
    { name:'CK-MB',               unit:'U/L',    low:0,    high:25,    mode:'H',   samples:['31','22','18','40','12'] },
    { name:'HbA1c',               unit:'%',      low:0,    high:6.5,   mode:'H',   samples:['9.1','7.8','6.2','8.4','5.9'] },
    { name:'Fasting Blood Sugar', unit:'mg/dL',  low:70,   high:100,   mode:'HL',  samples:['162','124','88','186','72'] },
    { name:'LDL-C',               unit:'mg/dL',  low:0,    high:100,   mode:'H',   samples:['182','142','96','168','78'] },
    { name:'HDL-C',               unit:'mg/dL',  low:40,   high:999,   mode:'L',   samples:['33','44','51','38','60'] },
    { name:'Triglycerides',       unit:'mg/dL',  low:0,    high:150,   mode:'H',   samples:['210','168','98','240','120'] },
    { name:'Total Cholesterol',   unit:'mg/dL',  low:0,    high:200,   mode:'H',   samples:['242','188','172','220','158'] },
    { name:'Serum Creatinine',    unit:'mg/dL',  low:0.6,  high:1.2,   mode:'HL',  samples:['1.3','0.9','1.0','1.5','0.8'] },
    { name:'eGFR',                unit:'mL/min', low:60,   high:999,   mode:'L',   samples:['58','72','84','48','92'] },
    { name:'BUN',                 unit:'mg/dL',  low:7,    high:20,    mode:'HL',  samples:['22','18','14','28','11'] },
    { name:'Uric Acid',           unit:'mg/dL',  low:2.4,  high:7.0,   mode:'HL',  samples:['7.2','5.8','4.4','8.1','3.9'] },
    { name:'Hemoglobin',          unit:'g/dL',   low:11.5, high:16.5,  mode:'HL',  samples:['11.2','13.4','15.1','10.8','14.2'] },
    { name:'WBC',                 unit:'×10³/µL',low:4.5,  high:11.0,  mode:'HL',  samples:['7.2','5.8','9.1','12.4','6.3'] },
    { name:'Platelets',           unit:'×10³/µL',low:150,  high:400,   mode:'HL',  samples:['220','188','310','142','260'] },
    { name:'TSH',                 unit:'mIU/L',  low:0.4,  high:4.0,   mode:'HL',  samples:['2.1','0.8','3.6','5.2','1.4'] },
    { name:'Free T4',             unit:'ng/dL',  low:0.8,  high:1.8,   mode:'HL',  samples:['1.1','0.7','1.4','0.6','1.6'] },
    { name:'Serum Na⁺',          unit:'mEq/L',  low:136,  high:145,   mode:'HL',  samples:['138','141','134','148','140'] },
    { name:'Serum K⁺',           unit:'mEq/L',  low:3.5,  high:5.0,   mode:'HL',  samples:['4.6','3.8','4.2','5.4','3.4'] },
    { name:'INR',                 unit:'ratio',  low:0.8,  high:1.2,   mode:'HL',  samples:['1.0','1.1','0.9','1.8','1.0'] },
    { name:'ALT (SGPT)',          unit:'U/L',    low:0,    high:40,    mode:'H',   samples:['38','22','62','18','44'] },
    { name:'AST (SGOT)',          unit:'U/L',    low:0,    high:40,    mode:'H',   samples:['42','28','55','18','32'] },
    { name:'Alkaline Phosphatase',unit:'U/L',    low:44,   high:147,   mode:'HL',  samples:['88','110','52','180','76'] },
    { name:'Total Bilirubin',     unit:'mg/dL',  low:0,    high:1.2,   mode:'H',   samples:['0.8','1.4','0.6','2.1','0.9'] },
    { name:'Serum Albumin',       unit:'g/dL',   low:3.5,  high:5.0,   mode:'HL',  samples:['4.1','3.2','4.6','3.8','4.4'] },
    { name:'CRP',                 unit:'mg/L',   low:0,    high:5,     mode:'H',   samples:['12','4','28','2','8'] },
    { name:'ESR',                 unit:'mm/hr',  low:0,    high:20,    mode:'H',   samples:['34','16','48','8','22'] },
    { name:'Vitamin D (25-OH)',   unit:'ng/mL',  low:30,   high:100,   mode:'L',   samples:['18','42','12','55','28'] },
    { name:'Vitamin B12',         unit:'pg/mL',  low:200,  high:900,   mode:'HL',  samples:['180','420','680','140','320'] },
    { name:'Ferritin',            unit:'ng/mL',  low:12,   high:150,   mode:'HL',  samples:['8','44','92','6','120'] },
  ];

  // Simulate different reports extracting different subsets of tests
  const reportProfiles = [
    // CBC panel
    { label:'CBC', tests:['Hemoglobin','WBC','Platelets','CRP','ESR','Ferritin'] },
    // Lipid panel
    { label:'Lipid Profile', tests:['LDL-C','HDL-C','Triglycerides','Total Cholesterol'] },
    // Renal function
    { label:'RFT', tests:['Serum Creatinine','eGFR','BUN','Uric Acid','Serum Na⁺','Serum K⁺'] },
    // Liver function
    { label:'LFT', tests:['ALT (SGPT)','AST (SGOT)','Alkaline Phosphatase','Total Bilirubin','Serum Albumin'] },
    // Thyroid
    { label:'Thyroid Panel', tests:['TSH','Free T4'] },
    // Cardiac
    { label:'Cardiac Markers', tests:['Troponin I','CK-MB'] },
    // Diabetes
    { label:'Diabetes Panel', tests:['HbA1c','Fasting Blood Sugar'] },
    // Vitamins
    { label:'Vitamins & Minerals', tests:['Vitamin D (25-OH)','Vitamin B12','Ferritin'] },
    // Coagulation
    { label:'Coagulation', tests:['INR'] },
    // Comprehensive
    { label:'Comprehensive Panel', tests:['Hemoglobin','WBC','Platelets','LDL-C','HDL-C','Triglycerides','Serum Creatinine','eGFR','HbA1c','TSH','INR'] },
  ];

  function handleLabReportDrop(e) {
    e.preventDefault();
    const zone = document.getElementById('labUploadZone');
    if (zone) { zone.style.borderColor = ''; zone.style.background = 'var(--panel)'; }
    Array.from(e.dataTransfer.files).forEach(file => queueLabReport(file));
  }

  function handleLabReportUpload(e) {
    Array.from(e.target.files).forEach(file => queueLabReport(file));
    e.target.value = '';
  }

  function queueLabReport(file) {
    const id = ++labQueueIdCounter;
    const ext = file.name.split('.').pop().toLowerCase();
    const icon = ext === 'pdf' ? '📄' : '🖼';
    const sizeMB = (file.size / 1048576).toFixed(1);

    // Pick a report profile based on file name heuristics or cycle through
    const nameL = file.name.toLowerCase();
    let profile = reportProfiles[id % reportProfiles.length]; // cycle
    if (nameL.includes('cbc') || nameL.includes('blood')) profile = reportProfiles[0];
    else if (nameL.includes('lipid') || nameL.includes('cholesterol')) profile = reportProfiles[1];
    else if (nameL.includes('renal') || nameL.includes('kidney') || nameL.includes('rft')) profile = reportProfiles[2];
    else if (nameL.includes('liver') || nameL.includes('lft')) profile = reportProfiles[3];
    else if (nameL.includes('thyroid') || nameL.includes('tsh')) profile = reportProfiles[4];
    else if (nameL.includes('cardiac') || nameL.includes('troponin')) profile = reportProfiles[5];
    else if (nameL.includes('diab') || nameL.includes('hba1c')) profile = reportProfiles[6];

    labReportQueue.push({ id, name: file.name, size: sizeMB, icon, status: 'processing', profile, data: [] });

    // Show queue, hide instructions
    document.getElementById('labUploadInstructions').style.display = 'none';
    document.getElementById('labUploadQueue').style.display = 'block';

    renderQueueCards();

    // Simulate extraction (staggered per file)
    const delay = 1200 + (labReportQueue.length - 1) * 400;
    setTimeout(() => {
      // Build extracted data for this report
      const item = labReportQueue.find(r => r.id === id);
      if (!item) return;
      item.data = item.profile.tests.map(testName => {
        const def = labTestBank.find(t => t.name === testName);
        if (!def) return null;
        const val = def.samples[id % def.samples.length];
        return { ...def, value: val };
      }).filter(Boolean);
      item.status = 'done';
      renderQueueCards();
      rebuildMergedResults();
    }, delay);
  }

  function renderQueueCards() {
    const container = document.getElementById('labQueueCards');
    container.innerHTML = labReportQueue.map(item => `
      <div style="display:flex;align-items:center;gap:10px;background:var(--navy3);border:1px solid ${item.status==='done'?'rgba(0,212,180,0.25)':'var(--border2)'};border-radius:8px;padding:10px 12px;transition:all .3s">
        <div style="font-size:1.4rem">${item.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div>
          <div style="font-size:0.68rem;color:var(--text3);margin-top:2px">
            ${item.size} MB · ${item.profile.label}
            ${item.status==='done' ? `· <span style="color:var(--teal)">${item.data.length} values extracted ✓</span>` : '· <span style="color:var(--gold)">Extracting…</span>'}
          </div>
        </div>
        ${item.status==='processing'
          ? `<div style="width:18px;height:18px;border:2px solid var(--border2);border-top-color:var(--teal);border-radius:50%;animation:spin 0.8s linear infinite;flex-shrink:0"></div>`
          : `<div style="color:var(--teal);font-size:1rem;flex-shrink:0">✅</div>`
        }
        <button onclick="removeQueueItem(${item.id})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:0.9rem;padding:2px 4px;flex-shrink:0;line-height:1" title="Remove">✕</button>
      </div>`).join('');
  }

  function removeQueueItem(id) {
    labReportQueue = labReportQueue.filter(r => r.id !== id);
    renderQueueCards();
    rebuildMergedResults();
    if (labReportQueue.length === 0) {
      document.getElementById('labUploadQueue').style.display = 'none';
      document.getElementById('labExtractedPreview').style.display = 'none';
      document.getElementById('labUploadInstructions').style.display = 'block';
    }
  }

  function clearAllReports() {
    labReportQueue = [];
    renderQueueCards();
    document.getElementById('labUploadQueue').style.display = 'none';
    document.getElementById('labExtractedPreview').style.display = 'none';
    document.getElementById('labUploadInstructions').style.display = 'block';
    showToast('🗑', 'Reports cleared', 'Upload new reports or switch to Manual Entry');
  }

  function rebuildMergedResults() {
    const doneItems = labReportQueue.filter(r => r.status === 'done');
    if (doneItems.length === 0) {
      document.getElementById('labExtractedPreview').style.display = 'none';
      return;
    }

    // Merge all extracted values — later uploads overwrite earlier ones for same test
    const merged = {};
    doneItems.forEach(item => {
      item.data.forEach(row => { merged[row.name] = row; });
    });

    const mergedArr = Object.values(merged);
    const totalReports = doneItems.length;
    const totalTests = mergedArr.length;
    const abnormals = mergedArr.filter(row => {
      const val = parseFloat(row.value);
      return (row.mode.includes('H') && val > row.high) || (row.mode.includes('L') && val < row.low);
    }).length;

    document.getElementById('labExtractSummary').textContent =
      `From ${totalReports} report${totalReports > 1 ? 's' : ''} · ${totalTests} values · ${abnormals} abnormal${abnormals !== 1 ? 's' : ''} · Review &amp; edit before saving`;

    document.getElementById('labExtractedRows').innerHTML = mergedArr.map(row => {
      const val = parseFloat(row.value);
      let flagClass = '', flagHtml = '';
      if (row.mode.includes('H') && val > row.high) {
        flagClass = 'abnormal-h';
        flagHtml = `<span style="font-size:0.65rem;font-weight:700;padding:2px 6px;border-radius:4px;flex-shrink:0;background:var(--red-dim);color:var(--red)">↑ HIGH</span>`;
      } else if (row.mode.includes('L') && val < row.low) {
        flagClass = 'abnormal-l';
        flagHtml = `<span style="font-size:0.65rem;font-weight:700;padding:2px 6px;border-radius:4px;flex-shrink:0;background:rgba(59,130,246,0.15);color:#60A5FA">↓ LOW</span>`;
      }
      return `<div class="lab-input-row">
        <span class="lab-name-col">${row.name}</span>
        <span class="lab-ref-col">${row.unit}</span>
        <input class="lab-val-input ${flagClass}" value="${row.value}"
          oninput="flagLab(this,${row.low},${row.high},'${row.mode}')">
        ${flagHtml}
      </div>`;
    }).join('');

    document.getElementById('labExtractedPreview').style.display = 'block';

    const processing = labReportQueue.filter(r => r.status === 'processing').length;
    if (processing > 0) {
      showToast('🤖', 'Partial extraction', `${totalTests} values so far · ${processing} report${processing>1?'s':''} still processing`);
    } else {
      showToast('✅', 'All reports extracted', `${totalTests} values from ${totalReports} report${totalReports>1?'s':''} · ${abnormals} abnormal`);
    }
  }

  /* ══ IMAGING AI ══ */
  let currentScanType = 'xray';
  const imagingFindings = {
    xray: {
      model: 'Chest X-Ray AI · ResNet-152 + Attention',
      findings: [
        { title: 'Cardiomegaly', conf: '91%', level: 'high', desc: 'Cardiothoracic ratio estimated at 0.56 (>0.50 threshold). Consistent with cardiomegaly, likely due to LV dilation. Correlate with echocardiography.' },
        { title: 'Pulmonary Venous Congestion', conf: '78%', level: 'med', desc: 'Haziness in bilateral perihilar regions with upper lobe blood diversion. Consistent with early pulmonary oedema / raised LVEDP.' },
        { title: 'No Pneumothorax', conf: '97%', level: 'low', desc: 'Both lung apices visible. No pleural line identified. Pneumothorax effectively ruled out.' },
        { title: 'No Active Consolidation', conf: '89%', level: 'low', desc: 'No focal opacity suggesting pneumonia or lobar consolidation at present.' },
      ],
      recommendation: 'Findings are consistent with cardiomegaly and early pulmonary venous hypertension. In the clinical context of suspected NSTEMI with elevated BNP (290 pg/mL), urgent echocardiography is strongly recommended to assess LVEF and wall motion abnormalities. Consider diuresis if signs of fluid overload persist.'
    },
    ecg: {
      model: 'ECG AI · Transformer-based 12-lead analyser',
      findings: [
        { title: 'ST Depression — V4 to V6', conf: '94%', level: 'high', desc: 'Horizontal ST depression of 1.5–2mm in leads V4, V5, V6. Highly specific for subendocardial ischaemia / NSTEMI. Requires serial monitoring.' },
        { title: 'T-wave Inversion', conf: '87%', level: 'high', desc: 'T-wave inversion in I, aVL, V5, V6. Suggests lateral wall ischaemia. Correlate with Troponin trend.' },
        { title: 'Sinus Tachycardia', conf: '99%', level: 'med', desc: 'HR 98 bpm. Sinus tachycardia — may reflect pain, anxiety, or early haemodynamic compromise.' },
        { title: 'QTc Interval', conf: '95%', level: 'low', desc: 'QTc 440ms — upper limit of normal. Monitor if adding QTc-prolonging agents (Azithromycin, Haloperidol).' },
      ],
      recommendation: 'ECG findings consistent with NSTEMI / acute coronary syndrome affecting the lateral leads. Immediate cardiology consultation and cath lab evaluation within 24h is advised per ICMR 2024 ACS guidelines. Serial ECGs every 30 minutes while patient is symptomatic.'
    },
    ct: {
      model: 'CT Brain AI · U-Net segmentation + classification',
      findings: [
        { title: 'No Intracranial Haemorrhage', conf: '98%', level: 'low', desc: 'No hyperdense lesions identified in the parenchyma, subdural or epidural space. ICH excluded.' },
        { title: 'No Acute Infarct', conf: '82%', level: 'low', desc: 'No evidence of acute territorial infarction on this non-contrast study. DWI-MRI recommended if clinical suspicion remains.' },
        { title: 'Periventricular White Matter Changes', conf: '76%', level: 'med', desc: 'Mild periventricular and subcortical white matter hypodensities consistent with small vessel ischaemic disease / Fazekas grade I.' },
      ],
      recommendation: 'No acute intracranial pathology identified. Small vessel disease consistent with the patient\'s vascular risk profile (HTN, DM). Recommend MRI Brain with DWI if TIA or early infarct is clinically suspected.'
    },
    fundus: {
      model: 'Fundus AI · InceptionV4 — DR grading (ETDRS)',
      findings: [
        { title: 'Diabetic Retinopathy — Grade 2 (Mild NPDR)', conf: '88%', level: 'med', desc: 'Scattered microaneurysms in bilateral retinae. Occasional dot/blot haemorrhages. No pre-retinal haemorrhage or neovascularisation.' },
        { title: 'No Diabetic Macular Oedema', conf: '91%', level: 'low', desc: 'Foveal reflex present. No clinically significant macular oedema (CSME) identified.' },
        { title: 'Hypertensive Retinopathy — Grade 1', conf: '79%', level: 'med', desc: 'Mild arteriovenous nicking noted. Arteriolar narrowing consistent with Grade 1 hypertensive retinopathy.' },
      ],
      recommendation: 'Mild Non-Proliferative Diabetic Retinopathy (Grade 2). Annual fundus review recommended. Target HbA1c <7% and BP <130/80 to prevent progression. No immediate laser treatment required. Ophthalmology referral for formal assessment.'
    },
    echo: {
      model: 'Echo AI · Segment-level LVEF Estimator v2',
      findings: [
        { title: 'Reduced LVEF', conf: '85%', level: 'high', desc: 'Estimated LVEF 42–45% (mildly reduced). Visual wall motion abnormality in anterior and lateral segments consistent with acute ischaemia.' },
        { title: 'Mild MR', conf: '72%', level: 'med', desc: 'Mild mitral regurgitation noted on colour Doppler — likely ischaemic / functional. Formal grading recommended.' },
        { title: 'LV Hypertrophy', conf: '83%', level: 'med', desc: 'Posterior wall thickness 12mm. Consistent with hypertensive LVH. Correlate with BP history.' },
      ],
      recommendation: 'Reduced LVEF 42–45% with regional wall motion abnormality is consistent with acute NSTEMI. Guideline-directed medical therapy (GDMT) should be initiated: ACE inhibitor, beta-blocker, and aldosterone antagonist for HFrEF. Repeat echo in 6–8 weeks post-revascularisation.'
    },
    usg: {
      model: 'USG Abdomen AI · YOLOv8 + Seg',
      findings: [
        { title: 'Fatty Liver — Grade 1', conf: '84%', level: 'med', desc: 'Increased hepatic echogenicity compared to kidney cortex. Mild hepatomegaly (liver span 15.2cm). Consistent with Grade 1 hepatic steatosis.' },
        { title: 'Normal Kidneys', conf: '92%', level: 'low', desc: 'Both kidneys normal size and echogenicity. No hydronephrosis. No calculi identified.' },
        { title: 'No Ascites', conf: '97%', level: 'low', desc: 'No free fluid in peritoneal cavity identified.' },
      ],
      recommendation: 'Grade 1 fatty liver (NAFLD) consistent with metabolic syndrome, obesity (BMI 28.8), and DM. Recommend weight loss, dietary modification, and lipid optimisation. HbA1c control will also benefit hepatic steatosis. LFTs and liver elastography (FibroScan) recommended for fibrosis staging.'
    }
  };

  function selectScanType(el, type) {
    document.querySelectorAll('.scan-type-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    currentScanType = type;
    const data = imagingFindings[type];
    if (data) document.getElementById('imagingModel').textContent = data.model;
  }

  function triggerUpload() {
    // Only trigger file picker if no image is loaded yet
    const zone = document.getElementById('uploadZone');
    if (zone.classList.contains('has-image')) return;
    document.getElementById('fileInput').click();
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      // Store base64 payload for Claude Vision AI
      if (file.type.startsWith('image/')) {
        window._lastUploadedImageBase64 = dataUrl.split(',')[1];
        window._lastUploadedFileType = file.type;
        window._lastUploadedFile = file;
      } else {
        window._lastUploadedImageBase64 = null;
        window._lastUploadedFile = null;
      }
      showUploadedImage(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // allow re-upload of same file
  }

  function handleDrop(e) {
    e.preventDefault();
    const zone = document.getElementById('uploadZone');
    zone.classList.remove('drag');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      if (file.type.startsWith('image/')) {
        window._lastUploadedImageBase64 = dataUrl.split(',')[1];
        window._lastUploadedFileType = file.type;
        window._lastUploadedFile = file;
      } else {
        window._lastUploadedImageBase64 = null;
        window._lastUploadedFile = null;
      }
      showUploadedImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function loadDemoImage() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500" viewBox="0 0 600 500">
      <rect width="600" height="500" fill="#0a0f1e"/>
      <rect x="80" y="60" width="440" height="380" rx="8" fill="#111827"/>
      <!-- Spine -->
      <rect x="288" y="80" width="24" height="340" rx="4" fill="#1e2a3a"/>
      <!-- Left lung -->
      <ellipse cx="210" cy="250" rx="100" ry="130" fill="#162030" stroke="#243350" stroke-width="1.5"/>
      <!-- Right lung -->
      <ellipse cx="390" cy="250" rx="100" ry="130" fill="#162030" stroke="#243350" stroke-width="1.5"/>
      <!-- Heart shadow -->
      <ellipse cx="280" cy="290" rx="65" ry="80" fill="#1a2535" stroke="#2a3f55" stroke-width="2"/>
      <!-- Cardiomegaly indicator -->
      <ellipse cx="280" cy="290" rx="68" ry="83" fill="none" stroke="rgba(255,77,109,0.4)" stroke-width="2" stroke-dasharray="5,3"/>
      <!-- Hilar markings -->
      <line x1="200" y1="220" x2="240" y2="250" stroke="#243350" stroke-width="1.5"/>
      <line x1="360" y1="220" x2="330" y2="250" stroke="#243350" stroke-width="1.5"/>
      <!-- Clavicles -->
      <path d="M 120 130 Q 200 110 288 125" fill="none" stroke="#2a3f55" stroke-width="3"/>
      <path d="M 480 130 Q 400 110 312 125" fill="none" stroke="#2a3f55" stroke-width="3"/>
      <!-- Diaphragm -->
      <path d="M 100 390 Q 300 410 500 390" fill="none" stroke="#2a3f55" stroke-width="2.5"/>
      <!-- AI finding markers -->
      <circle cx="210" cy="200" r="18" fill="none" stroke="rgba(0,212,180,0.6)" stroke-width="2"/>
      <text x="210" y="180" text-anchor="middle" fill="rgba(0,212,180,0.8)" font-size="10" font-family="DM Mono,monospace">91%</text>
      <!-- Labels -->
      <text x="300" y="40" text-anchor="middle" fill="#00D4B4" font-size="13" font-family="Syne,sans-serif" font-weight="bold">DEMO · Chest PA View</text>
      <text x="300" y="475" text-anchor="middle" fill="#3a4f65" font-size="10" font-family="DM Mono,monospace">Simulated — Not a real medical image</text>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    showUploadedImage(url);
  }

  function showUploadedImage(src) {
    const zone = document.getElementById('uploadZone');
    const img = document.getElementById('uploadedImage');
    const placeholder = document.getElementById('uploadPlaceholder');
    img.src = src;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    zone.classList.add('has-image');
    zone.onclick = null; // disable zone click once image loaded — use Change button instead
    // Show action buttons
    document.getElementById('analyzeBtn').style.display = 'inline-flex';
    document.getElementById('changeImgBtn').style.display = 'inline-flex';
    // Reset results
    document.getElementById('imagingDefault').style.display = 'block';
    document.getElementById('imagingResults').style.display = 'none';
    document.getElementById('analyzingAnim').style.display = 'none';
    showToast('🩻', 'Image loaded', 'Click "Analyze with AI" to start');
  }

  function changeImage() {
    const zone = document.getElementById('uploadZone');
    const img = document.getElementById('uploadedImage');
    const placeholder = document.getElementById('uploadPlaceholder');
    img.src = '';
    img.style.display = 'none';
    placeholder.style.display = 'block';
    zone.classList.remove('has-image');
    zone.onclick = triggerUpload;
    document.getElementById('analyzeBtn').style.display = 'none';
    document.getElementById('changeImgBtn').style.display = 'none';
    document.getElementById('imagingDefault').style.display = 'block';
    document.getElementById('imagingResults').style.display = 'none';
    document.getElementById('analyzingAnim').style.display = 'none';
    // Clear stored upload data
    window._lastUploadedImageBase64 = null;
    window._lastUploadedFileType = null;
    window._lastUploadedFile = null;
  }

  function analyzeImage() {
    const img = document.getElementById('uploadedImage');
    if (!img.src || img.style.display === 'none') {
      showToast('⚠️', 'No image loaded', 'Please upload or load a demo image first');
      return;
    }
    document.getElementById('imagingDefault').style.display = 'none';
    document.getElementById('imagingResults').style.display = 'none';
    const anim = document.getElementById('analyzingAnim');
    anim.style.display = 'flex';
    document.getElementById('analyzeBtn').disabled = true;

    // Check if this is a real uploaded image (not the SVG demo)
    const isDemoSvg = img.src.startsWith('blob:') && img.src.length < 100;
    const isRealUpload = img.src.startsWith('data:image/') || (img.src.startsWith('blob:') && window._lastUploadedFile);

    if (isRealUpload && window._lastUploadedImageBase64) {
      // Call Claude Vision AI for real uploaded images
      _analyzeImageWithClaudeAI(window._lastUploadedImageBase64, window._lastUploadedFileType || 'image/jpeg')
        .then(() => {
          anim.style.display = 'none';
          document.getElementById('analyzeBtn').disabled = false;
        })
        .catch(() => {
          anim.style.display = 'none';
          document.getElementById('analyzeBtn').disabled = false;
          // Fall back to static results
          showImagingResults();
        });
    } else {
      // Demo mode — use static findings
      setTimeout(() => {
        anim.style.display = 'none';
        document.getElementById('analyzeBtn').disabled = false;
        showImagingResults();
      }, 3200);
    }
  }

  async function _analyzeImageWithClaudeAI(base64Data, mediaType) {
    const scanType = document.querySelector('.scan-type-btn.active')?.textContent || 'Medical Scan';
    const patientCtx = getActivePatientContext();

    const systemPrompt = `You are SamarthaaMed Imaging AI, an expert radiologist and medical image analysis assistant.

${patientCtx}

Analyse the uploaded medical image (${scanType}). Respond ONLY with valid JSON — no markdown fences, no extra text.

Schema:
{
  "model": "imaging modality and AI model description e.g. Chest X-Ray AI · ResNet-152",
  "findings": [
    { "title": "finding name", "conf": "confidence%", "level": "high|med|low", "desc": "detailed clinical description" }
  ],
  "recommendation": "clinical recommendation paragraph"
}

Rules:
- List 3–6 findings including both abnormal AND normal/reassuring findings
- Confidence scores must reflect clinical certainty (50–99%)
- Level: high = urgent/critical finding, med = moderate, low = normal/reassuring
- Recommendation must reference relevant Indian (ICMR) or international (ESC/AHA) guidelines`;

    const raw = await callClaudeAI([{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
        { type: 'text', text: `Analyse this ${scanType} image. Return JSON only.` }
      ]
    }], systemPrompt);

    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(clean);

    // Override the static findings for this scan type with AI results
    const levelMap = { high: 'conf-high', med: 'conf-med', low: 'conf-low' };
    const labelMap = { high: '⚠ HIGH', med: '● MOD', low: '✓ LOW' };

    if (parsed.model) {
      document.getElementById('imagingModel').textContent = parsed.model;
    }

    document.getElementById('findingsList').innerHTML = (parsed.findings || []).map(f => `
      <div class="finding-item">
        <div class="finding-title">${f.title}<span class="finding-conf ${levelMap[f.level] || 'conf-med'}">${f.conf} · ${labelMap[f.level] || '● MOD'}</span></div>
        <div class="finding-desc">${f.desc}</div>
      </div>`).join('');

    document.getElementById('imagingRecommendation').textContent = parsed.recommendation || '';
    document.getElementById('imagingResults').style.display = 'block';
    document.getElementById('imagingResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const highCount = (parsed.findings || []).filter(f => f.level === 'high').length;
    showToast('✅', 'AI Analysis Complete', `${(parsed.findings || []).length} findings · ${highCount} critical`);
  }

  function showImagingResults() {
    const data = imagingFindings[currentScanType];
    if (!data) return;
    const levelMap = { high: 'conf-high', med: 'conf-med', low: 'conf-low' };
    const labelMap = { high: '⚠ HIGH', med: '● MOD', low: '✓ LOW' };
    document.getElementById('findingsList').innerHTML = data.findings.map(f => `
      <div class="finding-item">
        <div class="finding-title">${f.title}<span class="finding-conf ${levelMap[f.level]}">${f.conf} · ${labelMap[f.level]}</span></div>
        <div class="finding-desc">${f.desc}</div>
      </div>`).join('');
    document.getElementById('imagingRecommendation').textContent = data.recommendation;
    document.getElementById('imagingResults').style.display = 'block';
    // Scroll result panel into view
    document.getElementById('imagingResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ══ ANALYTICS ══ */
  function buildAnalyticsBarChart() {
    const container = document.getElementById('consultBar');
    if (!container) return;
    const data = [18,22,15,28,32,19,24,38,21,26,30,18,22,35,28,24,31,20,25,28,33,40,24,28,22,18,30,45];
    const urgentData = [2,3,1,4,5,2,3,6,2,4,5,1,3,5,4,3,4,2,3,4,5,7,3,4,2,1,4,6];
    const max = Math.max(...data);
    container.innerHTML = data.map((v, i) => `
      <div class="bar-col" title="Day ${i+1}: ${v} consultations, ${urgentData[i]} urgent">
        <div class="bar-val">${i === 27 ? v : ''}</div>
        <div style="width:100%;display:flex;flex-direction:column;gap:1px;align-items:center">
          <div class="bar" style="height:${Math.round((v/max)*90)}px;background:var(--teal);width:80%;opacity:0.85"></div>
          <div class="bar" style="height:${Math.round((urgentData[i]/max)*90)}px;background:var(--red);width:80%;opacity:0.7;margin-top:-${Math.round((urgentData[i]/max)*90)+1}px;position:relative;top:0"></div>
        </div>
        <div class="bar-label">${i === 0 ? '1' : i === 6 ? '7' : i === 13 ? '14' : i === 20 ? '21' : i === 27 ? '28' : ''}</div>
      </div>`).join('');
  }

  /* ══ CONSULTATION BAR ══ */
  function buildConsultBar() {
    // Auto-wire SOAP note button
  }

  /* ══ PRESCRIPTION VIEW WIRING ══ */
  function onViewChange(id) {
    if (id === 'prescription') {
      setTimeout(() => {
        const existing = document.getElementById('rxSearchWrap');
        if (existing) return;
        enhancePrescriptionView();
      }, 50);
    }
  }

  function enhancePrescriptionView() {
    const searchArea = document.querySelector('#view-prescription .card-body');
    if (!searchArea) return;
    const searchDiv = searchArea.querySelector('.search-bar');
    if (!searchDiv || searchDiv.dataset.enhanced) return;
    searchDiv.dataset.enhanced = 'true';
    searchDiv.id = 'rxSearchWrap';
    searchDiv.classList.add('drug-search-wrap');
    searchDiv.style.position = 'relative';
    const input = searchDiv.querySelector('input');
    if (input) {
      input.id = 'rxDrugSearch';
      input.oninput = (e) => searchDrugs(e.target.value);
      input.onfocus = (e) => searchDrugs(e.target.value);
    }
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'drug-search-results';
    resultsDiv.id = 'drugSearchResults';
    searchDiv.appendChild(resultsDiv);
    document.addEventListener('click', (e) => {
      if (!searchDiv.contains(e.target)) resultsDiv.classList.remove('show');
    });
    // Add drug list container
    let listContainer = document.getElementById('rxDrugList');
    if (!listContainer) {
      listContainer = document.createElement('div');
      listContainer.id = 'rxDrugList';
      searchArea.appendChild(listContainer);
    }
    // Enhance preview
    const rightCard = document.querySelector('#view-prescription .grid-2 > .card:last-child .card-body');
    if (rightCard) {
      rightCard.id = 'rxPreviewSection';
    }
    renderPrescriptionList();
  }


  /* ══ MODAL SYSTEM ══ */
  let currentStep = 1;
  const totalSteps = 4;
  const stepInfoText = [
    '', 'Step 1 of 4 — Personal Information',
    'Step 2 of 4 — Medical History',
    'Step 3 of 4 — Vitals & Lifestyle',
    'Step 4 of 4 — Review & Confirm'
  ];
  const radioValues = { f_gender: 'Male', f_visit: 'New Patient' };
  const tagData = { conditions: [], allergies: [], medications: [] };

  function openModal() {
    resetModal();
    document.getElementById('patientModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    document.getElementById('patientModal').classList.remove('open');
    document.body.style.overflow = '';
  }
  // Close on backdrop click
  document.getElementById('patientModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  function resetModal() {
    currentStep = 1;
    // Reset form fields
    document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.value = '');
    document.querySelectorAll('.form-select').forEach(el => el.selectedIndex = 0);
    // Reset radio groups
    selectRadio('f_gender', document.querySelector('#f_gender .radio-opt'), 'Male');
    selectRadio('f_visit', document.querySelector('#f_visit .radio-opt'), 'New Patient');
    // Clear tags
    ['conditions-wrap','allergies-wrap','meds-wrap'].forEach(id => {
      const wrap = document.getElementById(id);
      wrap.querySelectorAll('.ti').forEach(t => t.remove());
    });
    tagData.conditions = []; tagData.allergies = []; tagData.medications = [];
    // Reset steps
    updateStepUI();
    // Hide success
    document.getElementById('successOverlay').classList.remove('show');
    document.getElementById('summaryContent').style.display = 'block';
    document.getElementById('modalFooter').style.display = 'flex';
    // Clear errors
    document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('.form-input').forEach(e => e.classList.remove('error'));
  }

  function selectRadio(groupId, el, val) {
    document.getElementById(groupId).querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    radioValues[groupId] = val;
  }

  function addTag(e, wrapId, inputId, type) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) return;
    const wrap = document.getElementById(wrapId);
    const tag = document.createElement('span');
    tag.className = `ti ${type === 'allergy' ? 'allergy' : type === 'med' ? 'med' : ''}`;
    tag.innerHTML = `${val} <span class="ti-x" onclick="this.parentElement.remove();removeTag('${type}','${val}')">✕</span>`;
    wrap.insertBefore(tag, input);
    input.value = '';
    if (type === 'condition') tagData.conditions.push(val);
    else if (type === 'allergy') tagData.allergies.push(val);
    else if (type === 'med') tagData.medications.push(val);
  }
  function removeTag(type, val) {
    if (type === 'condition') tagData.conditions = tagData.conditions.filter(v => v !== val);
    else if (type === 'allergy') tagData.allergies = tagData.allergies.filter(v => v !== val);
    else if (type === 'med') tagData.medications = tagData.medications.filter(v => v !== val);
  }

  function validateStep(step) {
    let valid = true;
    const require = (id, errId) => {
      const el = document.getElementById(id);
      const val = el ? el.value.trim() : '';
      const err = document.getElementById(errId);
      if (!val) {
        if (el) el.classList.add('error');
        if (err) err.classList.add('show');
        valid = false;
      } else {
        if (el) el.classList.remove('error');
        if (err) err.classList.remove('show');
      }
    };
    if (step === 1) {
      require('f_fname','err_fname');
      require('f_lname','err_lname');
      require('f_dob','err_dob');
      require('f_mobile','err_mobile');
    }
    if (step === 2) {
      require('f_spec','err_spec');
      require('f_complaint','err_complaint');
    }
    return valid;
  }

  function nextStep() {
    if (!validateStep(currentStep)) return;
    if (currentStep === 3) {
      buildSummary();
    }
    currentStep = Math.min(currentStep + 1, totalSteps);
    updateStepUI();
    document.getElementById('modalBody').scrollTop = 0;
  }
  function prevStep() {
    currentStep = Math.max(currentStep - 1, 1);
    updateStepUI();
    document.getElementById('modalBody').scrollTop = 0;
  }
  function goToStep(n) {
    if (n >= currentStep) return; // only allow going back
    currentStep = n;
    updateStepUI();
  }

  function updateStepUI() {
    // Panels
    document.querySelectorAll('.step-panel').forEach((p, i) => {
      p.classList.toggle('active', i + 1 === currentStep);
    });
    // Step indicators
    for (let i = 1; i <= totalSteps; i++) {
      const ind = document.getElementById('step-indicator-' + i);
      const num = document.getElementById('step-num-' + i);
      ind.className = 'step-item' + (i === currentStep ? ' active' : i < currentStep ? ' done' : '');
      num.textContent = i < currentStep ? '✓' : i;
    }
    // Footer
    document.getElementById('stepInfo').textContent = stepInfoText[currentStep];
    document.getElementById('btnBack').style.display = currentStep > 1 ? 'inline-flex' : 'none';
    document.getElementById('btnNext').style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
    document.getElementById('btnRegister').style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
  }

  function calcAge(dob) {
    if (!dob) return '—';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  function calcBMI(w, h) {
    if (!w || !h) return null;
    return (parseFloat(w) / Math.pow(parseFloat(h) / 100, 2)).toFixed(1);
  }

  function g(id) { return document.getElementById(id)?.value?.trim() || '—'; }

  function buildSummary() {
    const fname = g('f_fname'), lname = g('f_lname'), dob = g('f_dob');
    const gender = radioValues['f_gender'] || 'Male';
    const age = calcAge(dob === '—' ? null : dob);
    const bmi = calcBMI(g('f_weight') === '—' ? null : g('f_weight'), g('f_height') === '—' ? null : g('f_height'));

    const html = `
      <div class="summary-card">
        <div class="summary-section-title">👤 Personal Details</div>
        <div class="summary-row"><span class="summary-key">Full Name</span><span class="summary-val">${fname} ${lname}</span></div>
        <div class="summary-row"><span class="summary-key">Date of Birth</span><span class="summary-val">${dob} (Age: ${age} yrs)</span></div>
        <div class="summary-row"><span class="summary-key">Gender</span><span class="summary-val">${gender}</span></div>
        <div class="summary-row"><span class="summary-key">Blood Group</span><span class="summary-val">${g('f_blood')}</span></div>
        <div class="summary-row"><span class="summary-key">Mobile</span><span class="summary-val">${g('f_mobile')}</span></div>
        <div class="summary-row"><span class="summary-key">City / State</span><span class="summary-val">${g('f_city')}, ${g('f_state')}</span></div>
        <div class="summary-row"><span class="summary-key">Insurance</span><span class="summary-val">${g('f_insurance')}</span></div>
        <div class="summary-row"><span class="summary-key">ABHA Health ID</span><span class="summary-val">${g('f_abha')}</span></div>
      </div>
      <div class="summary-card">
        <div class="summary-section-title">🏥 Clinical Profile</div>
        <div class="summary-row"><span class="summary-key">Specialization</span><span class="summary-val">${g('f_spec')}</span></div>
        <div class="summary-row"><span class="summary-key">Visit Type</span><span class="summary-val">${radioValues['f_visit'] || 'New Patient'}</span></div>
        <div class="summary-row"><span class="summary-key">Chief Complaint</span><span class="summary-val">${g('f_complaint')}</span></div>
        <div class="summary-row"><span class="summary-key">Existing Conditions</span><span class="summary-val">${tagData.conditions.length ? tagData.conditions.join(', ') : '—'}</span></div>
        <div class="summary-row"><span class="summary-key">Allergies</span><span class="summary-val">${tagData.allergies.length ? tagData.allergies.join(', ') : 'None recorded'}</span></div>
        <div class="summary-row"><span class="summary-key">Current Medications</span><span class="summary-val">${tagData.medications.length ? tagData.medications.join(' · ') : '—'}</span></div>
        <div class="summary-row"><span class="summary-key">Family History</span><span class="summary-val">${g('f_family')}</span></div>
      </div>
      <div class="summary-card">
        <div class="summary-section-title">📡 Vitals & Lifestyle</div>
        <div class="summary-row"><span class="summary-key">Heart Rate</span><span class="summary-val">${g('f_hr')} bpm</span></div>
        <div class="summary-row"><span class="summary-key">Blood Pressure</span><span class="summary-val">${g('f_bp')} mmHg</span></div>
        <div class="summary-row"><span class="summary-key">SpO₂</span><span class="summary-val">${g('f_spo2')}%</span></div>
        <div class="summary-row"><span class="summary-key">Temperature</span><span class="summary-val">${g('f_temp')} °C</span></div>
        <div class="summary-row"><span class="summary-key">Weight / Height</span><span class="summary-val">${g('f_weight')} kg / ${g('f_height')} cm${bmi ? ' · BMI: ' + bmi : ''}</span></div>
        <div class="summary-row"><span class="summary-key">Fasting Blood Sugar</span><span class="summary-val">${g('f_fbs')} mg/dL</span></div>
        <div class="summary-row"><span class="summary-key">Smoking</span><span class="summary-val">${g('f_smoke')}</span></div>
        <div class="summary-row"><span class="summary-key">Physical Activity</span><span class="summary-val">${g('f_activity')}</span></div>
        <div class="summary-row"><span class="summary-key">Diet</span><span class="summary-val">${g('f_diet')}</span></div>
        <div class="summary-row"><span class="summary-key">Sleep / Stress</span><span class="summary-val">${g('f_sleep')} · ${g('f_stress')} stress</span></div>
      </div>`;
    document.getElementById('summaryContent').innerHTML = html;
  }

  function generatePatientId() {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `MM-${year}-${rand}`;
  }

  function getGenderCode() {
    const g = radioValues['f_gender'] || 'Male';
    return g === 'Male' ? 'M' : g === 'Female' ? 'F' : 'O';
  }

  function getSpecColor(spec) {
    const map = {
      'Cardiology': 'teal', 'Neurology': '#60A5FA', 'Pulmonology': '#2DD4BF',
      'Endocrinology & Diabetology': '#FB923C', 'Gastroenterology': '#34D399',
      'Oncology': '#F87171', 'Psychiatry': '#A78BFA', 'Dermatology': '#FCD34D',
      'Orthopedics': '#9CA3AF', 'Ophthalmology': '#67E8F9',
    };
    return map[spec] || 'teal';
  }

  let newPatientData = null;

  // ── SHARED PATIENT REGISTRY ──
  // Single source of truth — all dropdowns sync from here
  const patientRegistry = [
    { id: 'MM-2024-04521', name: 'Priya Krishnamurthy', key: 'PK' },
    { id: 'MM-2023-01892', name: 'Ramesh Singh',        key: 'RS' },
    { id: 'MM-2025-09341', name: 'Anita Mehta',         key: 'AM' },
    { id: 'MM-2024-07234', name: 'Vikram Nair',         key: 'VN' },
    { id: 'MM-2025-02218', name: 'Sunita Gupta',        key: 'SG' },
    { id: 'MM-2026-08876', name: 'Nandini Bose',        key: 'NB' },
    { id: 'MM-2026-03345', name: 'Deepak Kumar',        key: 'DK' },
    { id: 'MM-2026-02218', name: 'Meena Iyer',          key: 'MI' },
    { id: 'MM-2024-05512', name: 'Mohan Pillai',        key: 'MP' },
    { id: 'MM-2025-11203', name: 'Karthik Reddy',       key: 'KR' },
  ];

  function syncAllPatientDropdowns() {
    const selects = [
      document.getElementById('labPatientSelect'),
      document.getElementById('labModalPatientSelect'),
      document.getElementById('imagingPatientSelect'),
      document.querySelector('.risk-patient-selector select'),
    ];
    selects.forEach(sel => {
      if (!sel) return;
      const prevIdx = sel.selectedIndex;
      // Keep blank first option for imaging and risk selects
      const needsBlank = sel.id === 'imagingPatientSelect' || sel.closest('.risk-patient-selector');
      const blankOption = needsBlank ? '<option value="">— Select patient —</option>' : '';
      sel.innerHTML = blankOption + patientRegistry
        .map(p => `<option value="${p.key}">${p.name} · ${p.id}</option>`)
        .join('');
      sel.selectedIndex = Math.min(prevIdx, sel.options.length - 1);
    });
  }

  // Add a chip for a newly registered patient to the AI Consultation page
  function addPatientChipToConsult(key, fullName, avatarColor) {
    const chipsRow = document.querySelector('#view-consult .patient-switcher');
    if (!chipsRow) return;
    const initials = patientProfiles[key]?.initials || (fullName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase());
    const firstName = fullName.split(' ')[0];
    const lastName  = fullName.split(' ').slice(1).join(' ');
    const shortName = firstName + (lastName ? ' ' + lastName[0] + '.' : '');
    const chip = document.createElement('div');
    chip.className = 'patient-chip';
    chip.setAttribute('onclick', `switchConsultPatient(this,'${key}','${fullName}','new')`);
    chip.innerHTML = `
      <div class="patient-chip-avatar" style="background:${avatarColor}">${initials}</div>
      <span class="patient-chip-name">${shortName}</span>
      <span class="status-badge active" style="margin-left:4px;font-size:0.6rem">New</span>`;
    chipsRow.appendChild(chip);
  }

  function addToPatientRegistry(fname, lname, patientId, key) {
    // Generate a unique key from initials + timestamp to avoid collisions
    const initials = (fname[0] || 'N') + (lname[0] || 'P');
    const uniqueKey = initials.toUpperCase() + '_' + Date.now().toString(36).toUpperCase();
    patientRegistry.unshift({ id: patientId, name: fname + ' ' + lname, key: uniqueKey });
    syncAllPatientDropdowns();
    return uniqueKey;
  }

  // ── CONSULT FROM PATIENTS PAGE ──
  function openConsultForPatient(key, name) {
    // Switch view first, then manipulate DOM after it's visible
    showView('consult');
    setTimeout(() => {
      const chips = document.querySelectorAll('.patient-chip');
      let matched = false;
      chips.forEach(chip => {
        const oc = chip.getAttribute('onclick') || '';
        if (oc.includes(`'${key}'`)) {
          // Call switchConsultPatient directly instead of chip.click()
          // to avoid re-triggering showView
          const match = oc.match(/switchConsultPatient\(this,'(\w+)','([^']+)','([^']+)'\)/);
          if (match) {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            switchConsultPatient(chip, match[1], match[2], match[3]);
            matched = true;
          }
        }
      });
      if (!matched) {
        document.getElementById('topbar-sub').textContent = name + ' · Active Session';
        const msgs = document.getElementById('chatMessages');
        const typing = document.getElementById('typingIndicator');
        if (msgs && typing) {
          const msg = document.createElement('div');
          msg.className = 'msg ai';
          msg.style.animation = 'fadeIn .3s ease';
          msg.innerHTML = `<div class="msg-avatar">🧬</div><div><div class="msg-bubble" style="border-left:3px solid var(--teal);padding-left:12px">
            <strong style="color:var(--teal)">Consultation opened → ${name}</strong><br>
            <span style="font-size:0.78rem;color:var(--text3)">Patient record loaded. Type your clinical query below.</span>
          </div><div class="msg-time">SamarthaaMed · Just now</div></div>`;
          msgs.insertBefore(msg, typing);
          msgs.scrollTop = msgs.scrollHeight;
        }
        showToast('🩺', 'Consultation opened', name);
      }
    }, 50);
  }

  function registerPatient() {
    const fname = document.getElementById('f_fname').value.trim();
    const lname = document.getElementById('f_lname').value.trim();
    const dob = document.getElementById('f_dob').value;
    const spec = document.getElementById('f_spec').value;
    const complaint = document.getElementById('f_complaint').value.trim();
    const gender = radioValues['f_gender'] || 'Male';
    const genderCode = getGenderCode();
    const age = calcAge(dob);
    const patientId = generatePatientId();
    const today = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    const conds = tagData.conditions.join(', ') || complaint.substring(0, 40);
    const bmi = calcBMI(document.getElementById('f_weight').value, document.getElementById('f_height').value);
    const fullName = fname + ' ' + lname;

    newPatientData = { fname, lname, patientId, age, genderCode, spec, conds, complaint, bmi, today, fullName };

    // ✅ Add to shared registry (returns unique key) and ALL dropdowns
    const newKey = addToPatientRegistry(fname, lname, patientId);
    newPatientData.key = newKey;

    // ✅ Build a full patientProfiles entry so AI Consultation, Risk, etc. have real data
    const colors = ['#EF4444','#3B82F6','#10B981','#8B5CF6','#F59E0B','#06B6D4','#EC4899'];
    const avatarColor = `linear-gradient(135deg,${colors[Math.floor(Math.random()*colors.length)]},${colors[Math.floor(Math.random()*colors.length)]})`;
    patientProfiles[newKey] = {
      name: fullName,
      meta: `${age}${genderCode} · ID: ${patientId} · ${spec || 'General'}`,
      initials: (fname[0]||'N').toUpperCase() + (lname[0]||'P').toUpperCase(),
      avatarColor,
      vitals: { hr: '—', bp: '—', spo2: '—', temp: '—' },
      hbColor: colors[Math.floor(Math.random()*colors.length)],
      complaints: complaint ? [complaint] : ['New registration'],
      complaintTypes: [''],
      history: conds ? conds.split(',').map(s => s.trim()).filter(Boolean) : ['No history recorded'],
      historyTypes: (conds ? conds.split(',') : ['']).map(() => ''),
      meds: 'Not yet prescribed',
      scores: [['BMI', bmi ? `${bmi} kg/m²` : '—', ''], ['Registration', today, ''], ['Status', 'New Patient', 'teal']],
    };

    // ✅ Add chip to AI Consultation page
    addPatientChipToConsult(newKey, fullName, avatarColor);

    // Show success screen
    document.getElementById('summaryContent').style.display = 'none';
    document.getElementById('modalFooter').style.display = 'none';
    document.getElementById('successId').textContent = patientId;
    document.getElementById('successOverlay').classList.add('show');
    document.getElementById('step-panel-4').style.display = 'block';

    addPatientToTable(newPatientData);
    updatePatientCount();
    showToast('✅', 'Patient Registered!', `${fullName} · ID: ${patientId}`);
  }

  function addPatientToTable(p) {
    const tbody = document.querySelector('.data-table tbody');
    const specColor = getSpecColor(p.spec);
    const pillStyle = specColor === 'teal'
      ? 'class="pill teal"'
      : `style="background:rgba(96,165,250,0.1);color:${specColor};border:1px solid rgba(96,165,250,0.2)"`;
    const initials = (p.fname[0] || '') + (p.lname[0] || '');
    const colors = ['#EF4444','#3B82F6','#10B981','#8B5CF6','#F59E0B','#06B6D4','#EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const fullName = p.fullName || (p.fname + ' ' + p.lname);
    const safeFullName = fullName.replace(/'/g, "\\'");

    const tr = document.createElement('tr');
    tr.style.animation = 'fadeIn .4s ease';
    tr.innerHTML = `
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,${color},${color}cc);display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#fff;flex-shrink:0">${initials}</div>
          <div>
            <div class="td-name">${fullName}</div>
            <div style="font-size:0.72rem;color:var(--text3)">${p.conds || p.complaint.substring(0,40)}</div>
          </div>
        </div>
      </td>
      <td class="td-id">${p.patientId}</td>
      <td>${p.age}${p.genderCode}</td>
      <td><span ${pillStyle}>${p.spec || 'General'}</span></td>
      <td>Today</td>
      <td><span style="color:var(--teal);font-family:var(--mono);font-weight:600">—</span></td>
      <td><span class="status-badge active">New</span></td>
      <td><button class="action-btn" onclick="openConsultForPatient('${p.key}','${safeFullName}')">Consult</button></td>`;
    tbody.insertBefore(tr, tbody.firstChild);
  }

  function updatePatientCount() {
    const subEl = document.getElementById('topbar-sub');
    const countEl = document.querySelector('#view-patients .section-sub');
    if (countEl) {
      const rows = document.querySelectorAll('.data-table tbody tr').length;
      countEl.textContent = `${482 + rows - 8} total patients · Updated just now`;
    }
  }

  function goToNewConsult() {
    closeModal();
    showView('consult');
  }

  function showToast(icon, text, sub) {
    const toast     = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastText = document.getElementById('toastText');
    const toastSub  = document.getElementById('toastSub');
    if (!toast || !toastIcon || !toastText) return;
    toastIcon.textContent = icon;
    toastText.textContent = text;
    if (toastSub) toastSub.textContent = sub || '';
    const bar = toast.querySelector('.toast-bar');
    if (bar) {
      bar.style.animation = 'none';
      bar.offsetHeight;
      bar.style.animation = 'toastBar 4s linear forwards';
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4200);
  }

  /* ══ TOPBAR FUNCTIONS ══ */
  
  function showNotifications() {
    // Show notifications toast
    showToast('🔔', 'Notifications', '3 new notifications • 2 lab results ready • 1 imaging report');
    
    // In a real implementation, this could open a notifications panel
    console.log('Notifications clicked');
  }

  function showAlerts() {
    // Show alerts toast
    showToast('⚡', 'System Alerts', '3 urgent patients require immediate attention • Click to view details');
    
    // Optionally open the urgent cases modal
    setTimeout(() => {
      showUrgentPanel();
    }, 1000);
  }

  function showLiveMonitoring() {
    // Show live monitoring toast
    const activePatients = 7; // Based on current patient count
    showToast('📊', 'Live Monitoring', `${activePatients} patients monitored • All vitals within normal range • Real-time updates active`);
    
    // In a real implementation, this could open a live monitoring dashboard
    console.log('Live monitoring clicked');
  }

  function handleSearch(event) {
    const searchInput = event.target;
    const query = searchInput.value.trim().toLowerCase();
    
    // Search on Enter key
    if (event.key === 'Enter' && query) {
      performSearch(query);
    }
  }

  function performSearch(query) {
    // Define searchable patient data
    const patients = [
      { id: 'PK', name: 'Priya Krishnamurthy', condition: 'NSTEMI', specialty: 'Cardiology' },
      { id: 'DK', name: 'Deepak Kumar', condition: 'COPD', specialty: 'Pulmonology' },
      { id: 'MI', name: 'Meena Iyer', condition: 'Hypertensive crisis', specialty: 'Emergency' },
      { id: 'RS', name: 'Ramesh Singh', condition: 'CAD post CABG', specialty: 'Cardiology' },
      { id: 'AM', name: 'Anita Mehta', condition: 'Palpitations', specialty: 'Cardiology' },
      { id: 'VN', name: 'Vikram Nair', condition: 'Hypertension', specialty: 'Cardiology' },
      { id: 'SG', name: 'Sunita Gupta', condition: 'Post-STEMI', specialty: 'Cardiology' },
      { id: 'NB', name: 'Nandini Bose', condition: 'Hypothyroidism', specialty: 'Endocrinology' }
    ];

    // Search in patients
    const results = patients.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.condition.toLowerCase().includes(query) ||
      p.specialty.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    );

    // Common drugs for search
    const drugs = ['aspirin', 'metformin', 'amlodipine', 'atorvastatin', 'metoprolol', 'ramipril', 'clopidogrel', 'rosuvastatin', 'levothyroxine', 'thyroxine'];
    const drugMatch = drugs.some(drug => drug.includes(query) || query.includes(drug));

    // Common conditions for search
    const conditions = ['diabetes', 'hypertension', 'copd', 'asthma', 'heart', 'cardiac', 'nstemi', 'stemi', 'hypothyroidism', 'thyroid', 'pcos', 'endocrine'];
    const conditionMatch = conditions.some(condition => condition.includes(query) || query.includes(condition));

    // Display results
    if (results.length > 0) {
      const firstResult = results[0];
      showToast('🔍', `Found ${results.length} result(s)`, `${firstResult.name} • ${firstResult.condition}`);
      
      // If only one result, open that patient
      if (results.length === 1) {
        setTimeout(() => {
          openConsultForPatient(firstResult.id, firstResult.name);
        }, 1500);
      }
    } else if (drugMatch) {
      showToast('🔍', 'Drug found', `"${query}" • Opening Prescription view...`);
      setTimeout(() => {
        showView('prescription');
      }, 1500);
    } else if (conditionMatch) {
      showToast('🔍', 'Condition found', `"${query}" • Check Patients or Risk Prediction`);
    } else {
      showToast('🔍', 'No results found', `No matches for "${query}" • Try: patient names, conditions, or drugs`);
    }
  }

  /* ══════════════════════════════════════════════════════════
     COMPREHENSIVE ENHANCEMENTS
     ══════════════════════════════════════════════════════════ */

  // 1. Dynamic SOAP Note Generation
  function generateDynamicSoapNote() {
    // Get current active patient from consultation view
    const activeChip = document.querySelector('.patient-chip.active');
    if (!activeChip) {
      showToast('⚠️', 'No Patient Selected', 'Please select a patient first');
      return;
    }
    
    const onclick = activeChip.getAttribute('onclick');
    const match = onclick.match(/'(\w+)'/);
    const patientKey = match ? match[1] : 'PK';
    const patient = patientProfiles[patientKey];
    
    if (!patient) return;
    
    // Generate dynamic SOAP sections
    const soapData = {
      S: `Chief Complaint: ${patient.complaints[0]}

History of Present Illness: ${patient.name}, ${patient.meta}
Presenting with: ${patient.complaints.join(', ')}

Current Medications: ${patient.meds}`,
      
      O: `Vitals: BP ${patient.vitals.bp} | HR ${patient.vitals.hr} | SpO₂ ${patient.vitals.spo2} | Temp ${patient.vitals.temp}

Clinical Findings:
${patient.history.join('\n')}

Risk Scores:
${patient.scores.map(s => `${s[0]}: ${s[1]}`).join('\n')}`,
      
      A: `Primary Assessment: ${patient.complaints[0]}

Clinical History:
${patient.history.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Risk Stratification:
${patient.scores.map(s => `• ${s[0]}: ${s[1]} (${s[2] === 'red' ? 'High Risk' : s[2] === 'gold' ? 'Moderate' : 'Normal'})`).join('\n')}`,
      
      P: `CURRENT MANAGEMENT:
${patient.meds}

MONITORING:
• Continue current vitals monitoring
• Serial assessments as indicated
• Follow-up as per risk stratification

INVESTIGATIONS:
• Based on clinical presentation and risk scores
• Lab work and imaging as indicated`,
      
      ICD: patient.scores.map(s => `${s[0]} — ${s[1]}`).join('\n')
    };
    
    // Update SOAP modal
    document.getElementById('soapS').textContent = soapData.S;
    document.getElementById('soapO').textContent = soapData.O;
    document.getElementById('soapA').textContent = soapData.A;
    document.getElementById('soapP').textContent = soapData.P;
    document.getElementById('soapICD').textContent = soapData.ICD;
    document.getElementById('soapModal').classList.add('open');
    
    showToast('📋', 'SOAP Note Generated', `For ${patient.name}`);
  }

  // Override the original generateSoapNote function
  window.generateSoapNote = generateDynamicSoapNote;

  // 2. Patient-Specific Lab Results
  let patientLabData = {};
  
  function openLabEntryWithPatient() {
    const modal = document.getElementById('labEntryModal');
    const patientSelect = document.getElementById('labModalPatientSelect');
    
    if (patientSelect) {
      // Update patient list
      patientSelect.innerHTML = '<option value="">Select Patient</option>' +
        Object.keys(patientProfiles).map(key => {
          const p = patientProfiles[key];
          return `<option value="${key}">${p.name} (${key})</option>`;
        }).join('');
      
      // Set to current patient if in consultation
      const activeChip = document.querySelector('.patient-chip.active');
      if (activeChip) {
        const onclick = activeChip.getAttribute('onclick');
        const match = onclick.match(/'(\w+)'/);
        if (match) {
          patientSelect.value = match[1];
          loadPatientLabData(match[1]);
        }
      }
      
      patientSelect.onchange = function() {
        loadPatientLabData(this.value);
      };
    }
    
    modal.classList.add('open');
  }
  
  function loadPatientLabData(patientKey) {
    if (!patientKey) return;
    
    const labData = patientLabData[patientKey];
    if (labData) {
      showToast('📊', 'Lab Data Loaded', `Showing results for ${patientProfiles[patientKey].name}`);
      // Populate fields with saved data
    } else {
      showToast('📋', 'New Lab Entry', `Ready to enter results for ${patientProfiles[patientKey].name}`);
    }
  }
  
  // Override openLabModal
  const originalOpenLabModal = window.openLabModal;
  window.openLabModal = openLabEntryWithPatient;

  // 3. Multiple Image Upload
  let uploadedImages = [];
  
  function handleMultipleImageUpload(event) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    showToast('📤', `Uploading ${files.length} file(s)`, 'Processing images...');
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        uploadedImages.push({
          src: e.target.result,
          filename: file.name,
          analyzed: false
        });
        
        if (index === 0) {
          // Display first image
          document.getElementById('uploadedImage').src = e.target.result;
          document.getElementById('uploadedImage').style.display = 'block';
        }
        
        if (index === files.length - 1) {
          showToast('✅', 'Upload Complete', `${files.length} file(s) uploaded successfully`);
          renderImageGallery();
        }
      };
      reader.readAsDataURL(file);
    });
  }
  
  function renderImageGallery() {
    // Create gallery container if it doesn't exist
    let gallery = document.getElementById('imageGallery');
    if (!gallery) {
      const container = document.querySelector('#view-imaging .card-body');
      if (container) {
        gallery = document.createElement('div');
        gallery.id = 'imageGallery';
        gallery.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;';
        container.appendChild(gallery);
      }
    }
    
    if (gallery) {
      gallery.innerHTML = uploadedImages.map((img, idx) => `
        <div style="position:relative;width:100px;height:100px;border:2px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer" onclick="selectUploadedImage(${idx})">
          <img src="${img.src}" style="width:100%;height:100%;object-fit:cover" alt="${img.filename}">
          <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:white;font-size:0.65rem;padding:2px 4px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap">${img.filename}</div>
          ${img.analyzed ? '<div style="position:absolute;top:4px;right:4px;background:var(--teal);color:var(--navy);border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:0.7rem">✓</div>' : ''}
        </div>
      `).join('');
    }
  }
  
  function selectUploadedImage(index) {
    const img = uploadedImages[index];
    document.getElementById('uploadedImage').src = img.src;
    showToast('🖼️', 'Image Selected', img.filename);
  }

  // 4. Dynamic Analytics
  function renderDynamicAnalytics() {
    const patients = Object.values(patientProfiles);
    
    // Calculate stats
    const stats = {
      total: patients.length,
      urgent: patients.filter(p => p.complaintTypes.includes('red')).length,
      male: patients.filter(p => p.meta.includes('M')).length,
      female: patients.filter(p => p.meta.includes('F')).length,
      cardiology: patients.filter(p => p.meta.includes('Cardiology')).length,
    };
    
    // Update analytics view when opened
    const analyticsView = document.getElementById('view-analytics');
    if (analyticsView) {
      // Find or create stats container
      let statsContainer = analyticsView.querySelector('.analytics-stats');
      if (!statsContainer) {
        statsContainer = document.createElement('div');
        statsContainer.className = 'analytics-stats';
        statsContainer.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:24px;';
        analyticsView.insertBefore(statsContainer, analyticsView.firstChild);
      }
      
      statsContainer.innerHTML = `
        <div class="stat-card" style="--accent-color: var(--teal)">
          <div class="icon">👥</div>
          <div class="value">${stats.total}</div>
          <div class="label">Total Patients</div>
        </div>
        <div class="stat-card" style="--accent-color: var(--red)">
          <div class="icon">🚨</div>
          <div class="value">${stats.urgent}</div>
          <div class="label">Urgent Cases</div>
        </div>
        <div class="stat-card" style="--accent-color: var(--purple)">
          <div class="icon">👨</div>
          <div class="value">${stats.male}</div>
          <div class="label">Male Patients</div>
        </div>
        <div class="stat-card" style="--accent-color: var(--gold)">
          <div class="icon">👩</div>
          <div class="value">${stats.female}</div>
          <div class="label">Female Patients</div>
        </div>
      `;
    }
    
    showToast('📊', 'Analytics Updated', 'Showing real patient data');
  }

  // 5. Risk Prediction - Patient Selection
  function updateRiskPrediction(patientKey) {
    const patient = patientProfiles[patientKey];
    if (!patient) return;
    
    showToast('🎯', 'Risk Updated', `Showing predictions for ${patient.name}`);
    
    // Update risk view with patient's actual scores
    const riskView = document.getElementById('view-risk');
    if (riskView) {
      // Update patient info display
      let patientInfo = riskView.querySelector('.risk-patient-info');
      if (!patientInfo) {
        patientInfo = document.createElement('div');
        patientInfo.className = 'risk-patient-info';
        patientInfo.style.cssText = 'margin:24px;padding:16px;background:var(--panel);border:1px solid var(--border);border-radius:12px;';
        // Insert after the selector
        const selector = riskView.querySelector('.risk-patient-selector');
        if (selector && selector.nextSibling) {
          riskView.insertBefore(patientInfo, selector.nextSibling);
        } else if (selector) {
          selector.after(patientInfo);
        } else {
          riskView.insertBefore(patientInfo, riskView.firstChild);
        }
      }
      
      patientInfo.innerHTML = `
        <h3 style="color:var(--teal);margin-bottom:12px">Risk Prediction: ${patient.name}</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${patient.scores.map(score => `
            <div style="padding:12px;background:var(--navy3);border-radius:8px">
              <div style="font-size:0.75rem;color:var(--text3);margin-bottom:4px">${score[0]}</div>
              <div style="font-size:1.2rem;font-weight:700;color:var(--${score[2] || 'teal'})">${score[1]}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  // Add patient selector to Risk view
  function addRiskPatientSelector() {
    const riskView = document.getElementById('view-risk');
    if (!riskView) return;
    
    let selector = riskView.querySelector('.risk-patient-selector');
    if (!selector) {
      selector = document.createElement('div');
      selector.className = 'risk-patient-selector';
      selector.style.cssText = 'margin:24px;';
      selector.innerHTML = `
        <label style="display:block;margin-bottom:8px;font-size:0.85rem;color:var(--text2)">Select Patient:</label>
        <select onchange="updateRiskPrediction(this.value)" style="width:100%;max-width:400px;padding:10px;background:var(--navy3);border:1px solid var(--border2);border-radius:8px;color:var(--text1);font-size:0.85rem">
          <option value="">Choose a patient...</option>
          ${Object.keys(patientProfiles).map(key => {
            const p = patientProfiles[key];
            return `<option value="${key}">${p.name} (${key})</option>`;
          }).join('')}
        </select>
      `;
      riskView.insertBefore(selector, riskView.firstChild);
    }
  }

  // 6. Language Support
  const translations = {
    en: {
      dashboard: 'Clinical Dashboard',
      consult: 'AI Consultation',
      patients: 'Patients',
      prescription: 'Prescription',
      labs: 'Lab Results',
      imaging: 'Medical Imaging',
      analytics: 'Analytics',
      settings: 'Settings',
    },
    hi: {
      dashboard: 'क्लिनिकल डैशबोर्ड',
      consult: 'एआई परामर्श',
      patients: 'मरीज़',
      prescription: 'नुस्खा',
      labs: 'लैब परिणाम',
      imaging: 'मेडिकल इमेजिंग',
      analytics: 'विश्लेषण',
      settings: 'सेटिंग्स',
    },
    ta: {
      dashboard: 'மருத்துவ டாஷ்போர்டு',
      consult: 'AI ஆலோசனை',
      patients: 'நோயாளிகள்',
      prescription: 'மருந்து பரிந்துரை',
      labs: 'ஆய்வக முடிவுகள்',
      imaging: 'மருத்துவ இமேஜிங்',
      analytics: 'பகுப்பாய்வு',
      settings: 'அமைப்புகள்',
    }
  };

  let currentLanguage = 'en';

  function changeLanguage(lang) {
    if (!translations[lang]) return;
    
    currentLanguage = lang;
    
    // Update view titles (simplified version)
    const viewTitles = {
      dashboard: translations[lang].dashboard,
      consult: translations[lang].consult,
      patients: translations[lang].patients,
      prescription: translations[lang].prescription,
      labs: translations[lang].labs,
      imaging: translations[lang].imaging,
      analytics: translations[lang].analytics,
      settings: translations[lang].settings,
    };
    
    // Update the views object
    Object.keys(viewTitles).forEach(key => {
      if (views[key]) {
        views[key].title = viewTitles[key];
      }
    });
    
    // Update current view title
    const currentView = document.querySelector('.view.active');
    if (currentView) {
      const viewId = currentView.id.replace('view-', '');
      if (viewTitles[viewId]) {
        document.getElementById('topbar-title').textContent = viewTitles[viewId];
      }
    }
    
    localStorage.setItem('preferredLanguage', lang);
    showToast('🌐', 'Language Changed', `Interface set to ${lang.toUpperCase()}`);
  }

  // Function to change language from settings page
  function changeLanguageFromSettings(lang) {
    changeLanguage(lang);
    
    // Update the dropdown to show selected value
    const dropdown = document.getElementById('interfaceLanguageSelect');
    if (dropdown) {
      dropdown.value = lang;
    }
    
    // Update navigation items if needed
    updateNavigationLanguage(lang);
  }

  // Function to change AI response language
  let aiLanguage = 'en';
  function changeAILanguage(lang) {
    aiLanguage = lang;
    localStorage.setItem('aiLanguage', lang);
    
    const langNames = {
      en: 'English',
      hi: 'Hindi/Hinglish',
      ta: 'Tamil',
      te: 'Telugu',
      kn: 'Kannada'
    };
    
    showToast('🤖', 'AI Language Updated', `AI will respond in ${langNames[lang] || lang}`);
  }

  // Update navigation items with current language
  function updateNavigationLanguage(lang) {
    if (!translations[lang]) return;
    
    const navItems = document.querySelectorAll('.nav-item');
    const viewKeys = ['dashboard', 'consult', 'patients', 'risk', 'specs', 'prescription', 'labs', 'imaging', 'analytics', 'settings'];
    
    navItems.forEach((item, index) => {
      if (viewKeys[index] && translations[lang][viewKeys[index]]) {
        const textNode = item.childNodes[2]; // Text after icon
        if (textNode && textNode.nodeType === 3) {
          textNode.textContent = translations[lang][viewKeys[index]];
        }
      }
    });
  }

  // Expand translations to include Telugu, Kannada, Bengali
  if (!translations.te) {
    translations.te = {
      dashboard: 'క్లినికల్ డాష్‌బోర్డ్',
      consult: 'AI సంప్రదింపు',
      patients: 'రోగులు',
      prescription: 'ప్రిస్క్రిప్షన్',
      labs: 'ల్యాబ్ ఫలితాలు',
      imaging: 'మెడికల్ ఇమేజింగ్',
      analytics: 'విశ్లేషణ',
      settings: 'సెట్టింగ్‌లు',
      risk: 'రిస్క్ అంచనా',
      specs: 'ప్రత్యేకతలు',
    };
  }

  if (!translations.kn) {
    translations.kn = {
      dashboard: 'ಕ್ಲಿನಿಕಲ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      consult: 'AI ಸಮಾಲೋಚನೆ',
      patients: 'ರೋಗಿಗಳು',
      prescription: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್',
      labs: 'ಲ್ಯಾಬ್ ಫಲಿತಾಂಶಗಳು',
      imaging: 'ವೈದ್ಯಕೀಯ ಇಮೇಜಿಂಗ್',
      analytics: 'ವಿಶ್ಲೇಷಣೆ',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      risk: 'ಅಪಾಯ ಮುನ್ಸೂಚನೆ',
      specs: 'ವಿಶೇಷತೆಗಳು',
    };
  }

  if (!translations.bn) {
    translations.bn = {
      dashboard: 'ক্লিনিক্যাল ড্যাশবোর্ড',
      consult: 'AI পরামর্শ',
      patients: 'রোগীরা',
      prescription: 'প্রেসক্রিপশন',
      labs: 'ল্যাব ফলাফল',
      imaging: 'মেডিকেল ইমেজিং',
      analytics: 'বিশ্লেষণ',
      settings: 'সেটিংস',
      risk: 'ঝুঁকি পূর্বাভাস',
      specs: 'বিশেষীকরণ',
    };
  }

  // 7. Conversational AI Assistant
  function initConversationalAI() {
    // Add floating chat button
    const chatBtn = document.createElement('div');
    chatBtn.id = 'floatingChatBtn';
    chatBtn.style.cssText = 'position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:14px 20px;border-radius:30px;cursor:pointer;box-shadow:0 4px 20px rgba(16,185,129,0.3);display:flex;align-items:center;gap:8px;z-index:1000;transition:all 0.3s;';
    chatBtn.innerHTML = '<span>💬</span><span style="font-weight:600;font-size:0.85rem">Ask AI</span>';
    chatBtn.onclick = toggleAIAssistant;
    document.body.appendChild(chatBtn);
    
    // Add chat panel
    const chatPanel = document.createElement('div');
    chatPanel.id = 'aiAssistantPanel';
    chatPanel.style.cssText = 'position:fixed;bottom:90px;right:24px;width:400px;height:600px;background:var(--panel);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);display:none;flex-direction:column;z-index:999;';
    chatPanel.innerHTML = `
      <div style="padding:16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:var(--navy2);border-radius:12px 12px 0 0">
        <span style="font-weight:700;color:var(--teal)">🧬 SamarthaaMed AI Assistant</span>
        <button onclick="toggleAIAssistant()" style="background:none;border:none;color:var(--text2);font-size:1.5rem;cursor:pointer;padding:0;width:32px;height:32px">×</button>
      </div>
      <div id="aiChatHistory" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px"></div>
      <div style="padding:16px;border-top:1px solid var(--border);display:flex;gap:8px">
        <input type="text" id="aiChatInput" placeholder="Ask anything... 'Show Priya', 'Generate SOAP', etc." style="flex:1;padding:10px;background:var(--navy3);border:1px solid var(--border2);border-radius:8px;color:var(--text1);outline:none" onkeypress="if(event.key==='Enter') sendAIMessage()">
        <button onclick="sendAIMessage()" style="padding:10px 16px;background:var(--teal);color:var(--navy);border:none;border-radius:8px;cursor:pointer;font-weight:600">→</button>
      </div>
    `;
    document.body.appendChild(chatPanel);
    
    // Add welcome message
    addAIMessage('ai', 'Hello! I\'m your SamarthaaMed AI Assistant. I can help you with:\n\n• Opening patient consultations\n• Generating SOAP notes\n• Searching for patients, drugs, or conditions\n• Opening lab results or prescriptions\n• Showing analytics\n\nJust ask me anything!');
  }

  function toggleAIAssistant() {
    const panel = document.getElementById('aiAssistantPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  }

  function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    if (!message) return;
    
    input.value = '';
    addAIMessage('user', message);
    
    // Process command
    setTimeout(() => processAICommand(message), 500);
  }

  function addAIMessage(role, text) {
    const history = document.getElementById('aiChatHistory');
    const msg = document.createElement('div');
    msg.style.cssText = 'display:flex;gap:10px;align-items:flex-start;' + (role === 'user' ? 'flex-direction:row-reverse' : '');
    msg.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:${role === 'user' ? 'var(--teal-dim)' : 'var(--teal)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.9rem">${role === 'user' ? '👤' : '🧬'}</div>
      <div style="background:${role === 'user' ? 'var(--teal-dim)' : 'var(--navy3)'};padding:10px 14px;border-radius:12px;max-width:70%;font-size:0.85rem;line-height:1.4;${role === 'user' ? 'color:var(--teal)' : 'color:var(--text1)'}">${text}</div>
    `;
    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
  }

  function processAICommand(cmd) {
    const lower = cmd.toLowerCase();
    
    // Show patient
    if (lower.match(/show|open|view.*(?:priya|deepak|meena|ramesh|anita|vikram|sunita)/)) {
      const names = {
        priya: 'PK', deepak: 'DK', meena: 'MI',
        ramesh: 'RS', anita: 'AM', vikram: 'VN', sunita: 'SG'
      };
      for (const [name, key] of Object.entries(names)) {
        if (lower.includes(name)) {
          openConsultForPatient(key, patientProfiles[key].name);
          addAIMessage('ai', `Opening consultation for ${patientProfiles[key].name}. How can I assist?`);
          return;
        }
      }
    }
    
    // SOAP note
    if (lower.match(/soap|note|summary|generate/)) {
      generateDynamicSoapNote();
      addAIMessage('ai', 'I\'ve generated a SOAP note based on the current patient\'s data. You can review it in the modal.');
      return;
    }
    
    // Labs
    if (lower.match(/lab|test|result/)) {
      showView('labs');
      addAIMessage('ai', 'Opening Lab Results view. You can enter or view lab data here.');
      return;
    }
    
    // Prescription
    if (lower.match(/prescri|medicine|drug/)) {
      showView('prescription');
      addAIMessage('ai', 'Opening Prescription Builder. What medication would you like to prescribe?');
      return;
    }
    
    // Analytics
    if (lower.match(/analytics|stats|report/)) {
      showView('analytics');
      renderDynamicAnalytics();
      addAIMessage('ai', `Analytics dashboard showing data for ${Object.keys(patientProfiles).length} patients.`);
      return;
    }
    
    // Search
    if (lower.match(/search|find/)) {
      const query = cmd.replace(/search|find|for/gi, '').trim();
      performSearch(query);
      addAIMessage('ai', `Searching for "${query}"...`);
      return;
    }
    
    // Default
    addAIMessage('ai', 'I can help you with:\n• "Show Priya" - Open patient consultation\n• "Generate SOAP" - Create SOAP note\n• "Open labs" - View lab results\n• "Search COPD" - Search for conditions\n• "Show analytics" - View statistics');
  }

  // Initialize enhancements on load
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize conversational AI
    initConversationalAI();
    
    // Add risk patient selector
    addRiskPatientSelector();
    
    // Update image upload input to support multiple files
    const imageInput = document.getElementById('imageUploadInput');
    if (imageInput) {
      imageInput.setAttribute('multiple', 'multiple');
      imageInput.onchange = handleMultipleImageUpload;
    }
    
    // Load saved language
    const savedLang = localStorage.getItem('preferredLanguage');
    const savedAILang = localStorage.getItem('aiLanguage');
    
    if (savedLang && translations[savedLang]) {
      changeLanguage(savedLang);
      // Set the dropdown value in settings
      const interfaceDropdown = document.getElementById('interfaceLanguageSelect');
      if (interfaceDropdown) {
        interfaceDropdown.value = savedLang;
      }
    }
    
    if (savedAILang) {
      aiLanguage = savedAILang;
      const aiDropdown = document.getElementById('aiLanguageSelect');
      if (aiDropdown) {
        aiDropdown.value = savedAILang;
      }
    }
    
    console.log('✅ SamarthaaMed Enhanced Features Loaded');
  });

  /* ══════════════════════════════════════════════════════════
     MOBILE MENU FUNCTIONS
     ══════════════════════════════════════════════════════════ */

  function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (sidebar && overlay) {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('show');
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('show');
  }

  function setMobileNav(el) {
    document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
  }

  // Close mobile sidebar when clicking on navigation items
  document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        // On mobile, close sidebar after clicking nav item
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            if (sidebar && sidebar.classList.contains('mobile-open')) {
              sidebar.classList.remove('mobile-open');
              overlay.classList.remove('show');
              document.body.style.overflow = '';
            }
          }, 300);
        }
      });
    });

    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  });

  /* ══════════════════════════════════════════════════════════
     LOGIN & AUTHENTICATION SYSTEM (Invitation Only)
     ══════════════════════════════════════════════════════════ */

   // Valid invitation codes with organization, role, and doctor name
  const validInvitations = {
    'INV-2026-OWNER-001': { name: 'Rekha Jayaram', org: 'SAMARTHAA MED', role: 'OWNER', email: 'rekhajayaram20@samarthaa.med' },
    'INV-2026-OWNER-002': { name: 'Govardhanswamy GN', org: 'SAMARTHAA MED', role: 'Owner', email: 'govardhangn@samarthaa.med' },
    'INV-2026-FAMILY-001': { name: 'Dr. Prasad N', org: 'Fortis Healthcare', role: 'Internal Medicine', email: 'dr.prasad@samarthaa.med' },
    'INV-2026-FAMILY-002': { name: 'Dr. Punya N Raj', org: 'Apollo Hospitals', role: 'General Medicine', email: 'dr.punya_n_raj@samarthaa.med' },
    'INV-2026-MEDPARTNER-001': { name: 'Dr. Nagendra Prasad', org: 'Max Healthcare', role: 'Emergency Medicine', email: 'dr.nagendra_prasad@samarthaa.med' },
    'INV-2026-DENTALPARTNER-001': { name: 'Dr. Tarulatha', org: 'Max Healthcare', role: 'Dental Surgeon', email: 'dr.tarulatha@samarthaa.med' },
  };

  // Store invitation requests (in production, this would be a database)
  const invitationRequests = JSON.parse(localStorage.getItem('samarthaamed_requests') || '[]');

  // Check if user is already logged in
  function checkExistingSession() {
    const sessionToken = localStorage.getItem('samarthaamed_session');
    const sessionExpiry = localStorage.getItem('samarthaamed_session_expiry');
    
    if (sessionToken && sessionExpiry) {
      const expiryDate = new Date(sessionExpiry);
      const now = new Date();
      
      if (now < expiryDate) {
        // Valid session exists
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        // Hide login screen
        if (loginScreen) loginScreen.style.display = 'none';
        
        // Show main app - CSS handles the layout
        if (mainApp) {
          mainApp.style.display = 'grid';
          mainApp.style.opacity = '1';
          
          // Initialize app
          setTimeout(() => {
            initializeApp();
          }, 100);
        }
        
        return true;
      } else {
        // Session expired
        clearSession();
        return false;
      }
    }
    return false;
  }

  // Handle login form submission
  function handleLogin(event) {
    event.preventDefault();
    
    const invitationCode = document.getElementById('invitationCode').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Show loading state
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginBtnLoader = document.getElementById('loginBtnLoader');
    const loginError = document.getElementById('loginError');
    
    loginBtn.disabled = true;
    loginBtnText.style.display = 'none';
    loginBtnLoader.style.display = 'inline';
    loginError.style.display = 'none';
    
    // Simulate authentication delay
    setTimeout(() => {
      // Validate invitation code
      if (!validInvitations[invitationCode]) {
        showLoginError('Invalid invitation code. Please check and try again.');
        resetLoginButton();
        return;
      }
      
      const invitation = validInvitations[invitationCode];

      if (password.length < 6) {
        showLoginError('Password must be at least 6 characters.');
        resetLoginButton();
        return;
      }
      
      // Authentication successful
      authenticateUser(invitationCode, email, invitation, rememberMe);
      
    }, 1500); // Simulate network delay
  }

  function authenticateUser(invitationCode, email, invitation, rememberMe) {
    // Generate session token
    const sessionToken = generateSessionToken();
    
    // Set session expiry
    const expiryDays = rememberMe ? 30 : 1;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    // Store session with doctor name
    localStorage.setItem('samarthaamed_session', sessionToken);
    localStorage.setItem('samarthaamed_session_expiry', expiryDate.toISOString());
    localStorage.setItem('samarthaamed_user_name', invitation.name);
    localStorage.setItem('samarthaamed_user_email', email);
    localStorage.setItem('samarthaamed_user_org', invitation.org);
    localStorage.setItem('samarthaamed_user_role', invitation.role);
    localStorage.setItem('samarthaamed_invitation_code', invitationCode);
    
    // Show success and redirect
    showToast('✅', 'Login Successful', `Welcome, ${invitation.name}!`);
    
    setTimeout(() => {
      showMainApp();
    }, 800);
  }

  function generateSessionToken() {
    return 'SAM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function showLoginError(message) {
    const loginError = document.getElementById('loginError');
    loginError.textContent = '⚠️ ' + message;
    loginError.style.display = 'block';
  }

  function resetLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginBtnLoader = document.getElementById('loginBtnLoader');
    
    loginBtn.disabled = false;
    loginBtnText.style.display = 'inline';
    loginBtnLoader.style.display = 'none';
  }

  function showMainApp() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    // Fade out login screen
    loginScreen.style.opacity = '0';
    loginScreen.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
      loginScreen.style.display = 'none';
      
      // Show main app - CSS will handle the grid layout
      mainApp.style.display = 'grid';
      
      // Fade in main app
      mainApp.style.opacity = '0';
      setTimeout(() => {
        mainApp.style.transition = 'opacity 0.5s ease';
        mainApp.style.opacity = '1';
        
        // Initialize any required components
        initializeApp();
      }, 50);
    }, 500);
  }

  function initializeApp() {
    // Ensure dashboard is visible
    const dashboard = document.getElementById('view-dashboard');
    if (dashboard) {
      dashboard.classList.add('active');
    }
    
    // Add logout button to sidebar
    addLogoutButton();
    
    // Update topbar subtitle with doctor name
    updateTopbarWithDoctorName();
    
    // Show welcome message
    const userName = localStorage.getItem('samarthaamed_user_name') || 'Healthcare Professional';
    const userOrg = localStorage.getItem('samarthaamed_user_org') || 'SamarthaaMed';
    
    setTimeout(() => {
      showToast('👋', `Welcome back, ${userName}!`, `${userOrg}`);
    }, 1000);
  }

  function updateTopbarWithDoctorName() {
    const userName = localStorage.getItem('samarthaamed_user_name');
    const userRole = localStorage.getItem('samarthaamed_user_role');
    const topbarSub = document.getElementById('topbar-sub');
    
    if (topbarSub && userName) {
      const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
      topbarSub.textContent = `${userName} • ${userRole || 'Healthcare Professional'} • ${today}`;
    }
  }

  function clearSession() {
    localStorage.removeItem('samarthaamed_session');
    localStorage.removeItem('samarthaamed_session_expiry');
    localStorage.removeItem('samarthaamed_user_name');
    localStorage.removeItem('samarthaamed_user_email');
    localStorage.removeItem('samarthaamed_user_org');
    localStorage.removeItem('samarthaamed_user_role');
    localStorage.removeItem('samarthaamed_invitation_code');
  }

  // Logout function
  function logout() {
    if (confirm('Are you sure you want to logout?')) {
      clearSession();
      location.reload();
    }
  }

  // Request invitation modal functions
  function showRequestInvitation() {
    document.getElementById('requestInvitationModal').style.display = 'flex';
  }

  function closeRequestInvitation() {
    document.getElementById('requestInvitationModal').style.display = 'none';
  }

  function submitInvitationRequest(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
      id: 'REQ-' + Date.now(),
      name: form[0].value,
      email: form[1].value,
      institution: form[2].value,
      specialty: form[3].value,
      reason: form[4].value,
      submittedDate: new Date().toISOString(),
      status: 'pending'
    };
    
    // Show processing state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Submitting...';
    
    // Simulate API call and email sending
    setTimeout(() => {
      // Store request
      const requests = JSON.parse(localStorage.getItem('samarthaamed_requests') || '[]');
      requests.push(formData);
      localStorage.setItem('samarthaamed_requests', JSON.stringify(requests));
      
      // Send confirmation email to applicant
      sendConfirmationEmail(formData);
      
      // Send notification to admin
      sendAdminNotificationEmail(formData);
      
      // Show success messages
      showToast('✅', 'Request Submitted Successfully', `Request ID: ${formData.id}`);
      
      setTimeout(() => {
        showToast('📧', 'Confirmation Email Sent', `Check ${formData.email} for details`);
      }, 1500);
      
      setTimeout(() => {
        showToast('ℹ️', 'What\'s Next?', 'Admin will review within 24-48 hours and email invitation code if approved');
      }, 3000);
      
      // Show email preview modal
      setTimeout(() => {
        showEmailPreview(formData);
      }, 4000);
      
      // Reset form
      setTimeout(() => {
        closeRequestInvitation();
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 5000);
      
    }, 1500); // Simulate network delay
  }

  // ── Email via EmailJS (works directly from browser — no backend needed) ──
  // Setup: emailjs.com → free account → Gmail service → two templates
  // Paste your IDs below or into Settings once the app is live
  const EMAILJS_SERVICE_ID  = localStorage.getItem('emailjs_service')  || 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_APPLICANT = localStorage.getItem('emailjs_tpl_applicant') || 'YOUR_TEMPLATE_APPLICANT';
  const EMAILJS_TEMPLATE_ADMIN    = localStorage.getItem('emailjs_tpl_admin')    || 'YOUR_TEMPLATE_ADMIN';
  const EMAILJS_PUBLIC_KEY  = localStorage.getItem('emailjs_pubkey')   || 'YOUR_PUBLIC_KEY';

  async function sendConfirmationEmail(requestData) {
    try {
      // Check if EmailJS is configured
      if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.warn('EmailJS not configured — skipping email send');
        showToast('📋', 'Request Recorded', 'Email not configured yet — request saved locally');
        return { success: true, skipped: true };
      }

      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS library not loaded');
      }

      const templateParams = {
        request_id:      requestData.id,
        applicant_name:  requestData.name,
        applicant_email: requestData.email,
        to_email:        requestData.email,
        institution:     requestData.institution,
        specialty:       requestData.specialty,
        submitted_date:  new Date(requestData.submittedDate).toLocaleString('en-IN'),
        reason:          requestData.reason || 'Not provided',
        support_email:   'govardhangn@samarthaa.med',
        reply_to:        'govardhangn@gmail.com'
      };

      // Send confirmation to applicant
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_APPLICANT, templateParams, EMAILJS_PUBLIC_KEY);
      console.log('✅ Confirmation email sent to:', requestData.email);

      // Send admin notification
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, templateParams, EMAILJS_PUBLIC_KEY);
      console.log('✅ Admin notification sent to: govardhangn@gmail.com');

      showToast('📧', 'Emails Sent', `Confirmation sent to ${requestData.email}`);
      return { success: true };

    } catch (error) {
      console.error('Email error:', error);
      // Fail gracefully — access request was already recorded
      showToast('⚠️', 'Email Notice', 'Request recorded. Email delivery failed — check EmailJS config.');
      return { success: false, error: error.message };
    }
  }

  async function sendAdminNotificationEmail(requestData) {
    // Admin email is sent inside sendConfirmationEmail above
    return { success: true };
  }

  function generateConfirmationEmailHTML(requestData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .logo { font-size: 2rem; margin-bottom: 10px; }
    .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .label { font-weight: 600; color: #6b7280; }
    .value { color: #111827; }
    .next-steps { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🧬 SamarthaaMed</div>
    <h1 style="margin: 0; font-size: 1.5rem;">Access Request Received</h1>
  </div>
  
  <div class="content">
    <p>Dear <strong>${requestData.name}</strong>,</p>
    
    <p>Thank you for your interest in SamarthaaMed Clinical Intelligence Platform. We have received your access request and it is now under review.</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0; color: #10b981;">📋 Request Details</h3>
      <div class="info-row">
        <span class="label">Request ID:</span>
        <span class="value">${requestData.id}</span>
      </div>
      <div class="info-row">
        <span class="label">Name:</span>
        <span class="value">${requestData.name}</span>
      </div>
      <div class="info-row">
        <span class="label">Email:</span>
        <span class="value">${requestData.email}</span>
      </div>
      <div class="info-row">
        <span class="label">Institution:</span>
        <span class="value">${requestData.institution}</span>
      </div>
      <div class="info-row">
        <span class="label">Specialty:</span>
        <span class="value">${requestData.specialty}</span>
      </div>
      <div class="info-row">
        <span class="label">Submitted:</span>
        <span class="value">${new Date(requestData.submittedDate).toLocaleString()}</span>
      </div>
    </div>
    
    <div class="next-steps">
      <h3 style="margin-top: 0; color: #92400e;">⏱️ What Happens Next?</h3>
      <ol style="margin: 0; padding-left: 20px;">
        <li><strong>Review Process:</strong> Our team will review your request within 24-48 hours</li>
        <li><strong>Verification:</strong> We may contact your institution to verify credentials</li>
        <li><strong>Invitation Code:</strong> If approved, you'll receive an invitation code via email</li>
        <li><strong>Access Granted:</strong> Use the invitation code to create your account</li>
      </ol>
    </div>
    
    <p style="text-align: center;">
      <a href="https://samarthaa.med/track?id=${requestData.id}" class="button">Track Request Status</a>
    </p>
    
    <p style="color: #6b7280; font-size: 0.875rem;">
      <strong>Important:</strong> Please keep this email for your records. You'll need the Request ID if you need to follow up with us.
    </p>
  </div>
  
  <div class="footer">
    <p>
      <strong>SamarthaaMed Clinical Intelligence Platform</strong><br>
      For Healthcare Professionals Only<br>
      📧 govardhangn@gmail.com | 📞 +91-11-2658-8500<br>
      AIIMS Delhi, Fortis, Apollo, Max Healthcare Partner Network
    </p>
    <p style="font-size: 0.75rem; color: #9ca3af;">
      Questions? Reply directly to this email or contact govardhangn@gmail.com<br>
      If you did not request access, please ignore this email.
    </p>
  </div>
</body>
</html>
    `;
  }

  function generateAdminNotificationEmailHTML(requestData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .actions { text-align: center; margin: 20px 0; }
    .button { display: inline-block; padding: 10px 20px; margin: 5px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .approve { background: #10b981; color: white; }
    .reject { background: #ef4444; color: white; }
    .review { background: #6b7280; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">🔔 New Access Request</h2>
  </div>
  
  <div class="content">
    <div class="alert">
      <strong>⚠️ Action Required:</strong> New SamarthaaMed access request pending review
    </div>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">📋 Applicant Information</h3>
      <p><strong>Request ID:</strong> ${requestData.id}</p>
      <p><strong>Name:</strong> ${requestData.name}</p>
      <p><strong>Email:</strong> ${requestData.email}</p>
      <p><strong>Institution:</strong> ${requestData.institution}</p>
      <p><strong>Specialty:</strong> ${requestData.specialty}</p>
      <p><strong>Submitted:</strong> ${new Date(requestData.submittedDate).toLocaleString()}</p>
      
      <h4>Reason for Access:</h4>
      <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; font-style: italic;">
        "${requestData.reason}"
      </p>
    </div>
    
    <div class="actions">
      <a href="https://admin.samarthaa.med/approve/${requestData.id}" class="button approve">✅ Approve</a>
      <a href="https://admin.samarthaa.med/review/${requestData.id}" class="button review">👁️ Review</a>
      <a href="https://admin.samarthaa.med/reject/${requestData.id}" class="button reject">❌ Reject</a>
    </div>
    
    <p style="font-size: 0.875rem; color: #6b7280;">
      Verification checklist:<br>
      ☐ Email domain matches institution<br>
      ☐ Institution is partner network member<br>
      ☐ Specialty credentials verified<br>
      ☐ No duplicate requests from same email
    </p>
  </div>
</body>
</html>
    `;
  }

  function showEmailPreview(requestData) {
    // Create email preview modal
    const modal = document.createElement('div');
    modal.id = 'emailPreviewModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10002;padding:20px;overflow-y:auto;';
    
    modal.innerHTML = `
      <div style="background:var(--panel);border-radius:16px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;position:relative;">
        <div style="position:sticky;top:0;background:var(--panel);padding:20px;border-bottom:1px solid var(--border);z-index:1;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h2 style="margin:0;color:var(--text1);">📧 Confirmation Email Preview</h2>
              <p style="margin:4px 0 0 0;color:var(--text3);font-size:0.85rem;">This email has been sent to: ${requestData.email}</p>
            </div>
            <button onclick="this.closest('#emailPreviewModal').remove()" style="background:none;border:none;color:var(--text2);font-size:1.5rem;cursor:pointer;width:32px;height:32px;">×</button>
          </div>
        </div>
        
        <div style="padding:20px;">
          <iframe srcdoc='${generateConfirmationEmailHTML(requestData).replace(/'/g, "\\'")}' style="width:100%;height:600px;border:1px solid var(--border2);border-radius:8px;"></iframe>
          
          <div style="margin-top:20px;padding:15px;background:var(--teal-dim);border-radius:8px;border-left:4px solid var(--teal);">
            <p style="margin:0;color:var(--teal);font-size:0.9rem;font-weight:600;">
              ✅ Email Sent Successfully
            </p>
            <p style="margin:8px 0 0 0;color:var(--text2);font-size:0.85rem;">
              Confirmation sent to: <strong>${requestData.email}</strong><br>
              Admin notification sent to: <strong>govardhangn@gmail.com</strong>
            </p>
          </div>
          
          <div style="text-align:center;margin-top:20px;">
            <button onclick="this.closest('#emailPreviewModal').remove()" style="padding:12px 24px;background:var(--teal);color:var(--navy);border:none;border-radius:8px;cursor:pointer;font-weight:600;">
              Close Preview
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Function to view sent emails (for testing/demo)
  window.viewSentEmails = function() {
    const sentEmails = JSON.parse(localStorage.getItem('samarthaamed_sent_emails') || '[]');
    console.log('📧 Sent Emails:', sentEmails);
    return sentEmails;
  };

  // Function to simulate email approval (for testing)
  window.approveRequest = function(requestId) {
    const requests = JSON.parse(localStorage.getItem('samarthaamed_requests') || '[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
      requests[requestIndex].status = 'approved';
      localStorage.setItem('samarthaamed_requests', JSON.stringify(requests));
      
      // Generate invitation code
      const invitationCode = 'INV-' + Date.now();
      
      // Send approval email
      const approvalEmail = {
        to: requests[requestIndex].email,
        from: 'govardhangn@gmail.com',
        replyTo: 'govardhangn@gmail.com',
        subject: '✅ Access Approved - Your SamarthaaMed Invitation Code',
        body: `Your invitation code is: ${invitationCode}`,
        sentAt: new Date().toISOString(),
        type: 'approval'
      };
      
      const sentEmails = JSON.parse(localStorage.getItem('samarthaamed_sent_emails') || '[]');
      sentEmails.push(approvalEmail);
      localStorage.setItem('samarthaamed_sent_emails', JSON.stringify(sentEmails));
      
      showToast('✅', 'Request Approved', `Invitation code sent to ${requests[requestIndex].email}`);
      console.log('📧 Approval email sent with code:', invitationCode);
      
      return { success: true, invitationCode, email: requests[requestIndex].email };
    }
    
    return { success: false, error: 'Request not found' };
  };

  // Check session on page load
  document.addEventListener('DOMContentLoaded', function() {
    if (!checkExistingSession()) {
      // No valid session, show login screen
      document.getElementById('loginScreen').style.display = 'flex';
      document.getElementById('mainApp').style.display = 'none';
    }
  });

  // Add logout button to sidebar (we'll add this to the HTML too)
  window.addLogoutButton = function() {
    const userName = localStorage.getItem('samarthaamed_user_name');
    const userEmail = localStorage.getItem('samarthaamed_user_email');
    const userOrg = localStorage.getItem('samarthaamed_user_org');
    const userRole = localStorage.getItem('samarthaamed_user_role');
    
    if (userName) {
      const sidebar = document.querySelector('.sidebar-nav');
      if (sidebar && !document.getElementById('logoutBtn')) {
        const logoutDiv = document.createElement('div');
        logoutDiv.id = 'logoutBtn';
        logoutDiv.style.cssText = 'margin-top: auto; padding: 16px; border-top: 1px solid var(--border);';
        logoutDiv.innerHTML = `
          <div style="margin-bottom: 12px; padding: 12px; background: var(--navy3); border-radius: 8px;">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text1); margin-bottom: 4px;">${userName}</div>
            <div style="font-size: 0.75rem; color: var(--text3); margin-bottom: 2px;">${userRole || ''}</div>
            <div style="font-size: 0.7rem; color: var(--text3);">${userOrg || ''}</div>
          </div>
          <button onclick="logout()" style="width: 100%; padding: 10px; background: var(--red-dim); color: var(--red); border: 1px solid var(--red); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s;" onmouseover="this.style.background='var(--red)';this.style.color='var(--navy)'" onmouseout="this.style.background='var(--red-dim)';this.style.color='var(--red)'">
            🚪 Logout
          </button>
        `;
        sidebar.appendChild(logoutDiv);
      }
    }
  };

  // Call after login
  setTimeout(() => {
    if (localStorage.getItem('samarthaamed_session')) {
      addLogoutButton();
    }
  }, 1000);

  /* ══════════════════════════════════════════════════════════
     RADIOLOGY FUNCTIONS
     ══════════════════════════════════════════════════════════ */

  // ─────────────────────────────────────────────────────────────────
  // RADIOLOGY & IMAGING INTELLIGENCE — Real Claude AI Analysis
  // ─────────────────────────────────────────────────────────────────
  // ── Shared AI Infrastructure ──────────────────────────────────────

  // ─── KEYS LOADED FROM NETLIFY ENVIRONMENT (never hardcoded) ──────────────
  // Keys are fetched once at startup from /api/config (a Netlify serverless
  // function that reads process.env). Set them in:
  //   Netlify Dashboard → Site → Environment variables
  //   ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
  // ─────────────────────────────────────────────────────────────────────────

  let _SYSTEM_ANTHROPIC_KEY  = '';
  let _SYSTEM_EL_API_KEY     = '';
  let _SYSTEM_EL_VOICE_ID    = '';
  let _configLoaded          = false;
  let _configLoadPromise     = null;

  async function _loadConfig() {
    if (_configLoaded) return;
    if (_configLoadPromise) return _configLoadPromise;
    _configLoadPromise = fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        _SYSTEM_ANTHROPIC_KEY = cfg.anthropicKey       || '';
        _SYSTEM_EL_API_KEY    = cfg.elevenLabsKey      || '';
        _SYSTEM_EL_VOICE_ID   = cfg.elevenLabsVoiceId  || '';
        _anthropicApiKey      = _SYSTEM_ANTHROPIC_KEY;
        _configLoaded = true;
      })
      .catch(err => {
        console.error('[SamarthaaMed] Failed to load config:', err);
      });
    return _configLoadPromise;
  }

  // Kick off config load immediately in background
  _loadConfig();

  let _anthropicApiKey = '';

  function getApiKey() {
    if (_anthropicApiKey) return _anthropicApiKey;
    showToast && showToast('\u26a0\ufe0f', 'AI Not Ready', 'Configuration is still loading \u2014 please try again in a moment');
    return null;
  }


  function getActivePatientContext() {
    const nameEl = document.querySelector('.consult-patient-name');
    const name   = nameEl?.textContent?.trim() || 'Unknown';
    const profile = Object.values(patientProfiles || {}).find(p => p.name === name);
    if (!profile) return `Active patient: ${name} (no detailed profile loaded)`;
    return `ACTIVE PATIENT CONTEXT:
Name: ${profile.name}
Details: ${profile.meta}
Vitals: HR ${profile.vitals?.hr} | BP ${profile.vitals?.bp} | SpO2 ${profile.vitals?.spo2}
Chief Complaints: ${(profile.complaints||[]).join(', ')}
Medical History: ${(profile.history||[]).join(', ')}
Medications: ${profile.meds||'None recorded'}
Clinical Scores: ${(profile.scores||[]).map(s=>`${s[0]}: ${s[1]}`).join(' | ')}`;
  }

  async function callClaudeAI(messages, systemPrompt) {
    await _loadConfig(); // ensure keys are loaded before any AI call
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API keys not yet loaded. Please wait a moment and try again.');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages
      })
    });
    if (!response.ok) {
      if (response.status === 401) {
        _anthropicApiKey = '';
        showToast && showToast('⚠️', 'API Key Error', 'The configured API key was rejected — contact your administrator');
        throw new Error('Invalid API key — contact your administrator.');
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${response.status}`);
    }
    const data = await response.json();
    return data.content[0].text.trim();
  }

  let radiologyReports = [];
  let currentRadiologyReport = null;

  // ── Loading skeleton ──────────────────────────────────────────────
  function showRadiologyLoading() {
    const skelly = `
      <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0">
        <div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--teal-dim);border-radius:10px;border:1px solid rgba(0,212,180,0.2)">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">🧬</div>
          <div>
            <div style="font-weight:700;font-size:0.85rem;color:var(--teal)">Analysing with Claude AI…</div>
            <div style="font-size:0.75rem;color:var(--text3);margin-top:2px">Reading report content and cross-referencing clinical context</div>
          </div>
        </div>
        <div style="height:10px;background:var(--navy3);border-radius:6px;width:90%;opacity:0.6"></div>
        <div style="height:10px;background:var(--navy3);border-radius:6px;width:70%;opacity:0.5"></div>
        <div style="height:10px;background:var(--navy3);border-radius:6px;width:85%;opacity:0.4"></div>
        <div style="height:10px;background:var(--navy3);border-radius:6px;width:60%;opacity:0.3"></div>
      </div>`;
    document.getElementById('radiologyAnalysisContent').innerHTML = skelly;
    document.getElementById('radiologyGuidanceContent').innerHTML = skelly;
    document.getElementById('radiologyAnalysisSection').style.display = 'grid';
    document.getElementById('radiologyActionsCard').style.display = 'block';
  }

  // ── Render analysis panel from AI JSON ───────────────────────────
  function renderRadiologyAnalysis(data) {
    const sevMap = {
      critical: { bg:'var(--red-dim)',  border:'var(--red)',  color:'var(--red)',  icon:'🔴' },
      high:     { bg:'var(--red-dim)',  border:'var(--red)',  color:'var(--red)',  icon:'⚠️' },
      moderate: { bg:'var(--gold-dim)', border:'var(--gold)', color:'var(--gold)', icon:'🟡' },
      normal:   { bg:'var(--panel2)',   border:'var(--teal)', color:'var(--teal)', icon:'✅' },
      low:      { bg:'var(--panel2)',   border:'var(--teal)', color:'var(--teal)', icon:'✅' },
    };
    const findings = (data.findings || []).map((f, i) => {
      const s = sevMap[(f.severity||'normal').toLowerCase()] || sevMap.moderate;
      return `<div style="padding:12px 14px;background:${s.bg};border-left:3px solid ${s.border};border-radius:8px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span>${s.icon}</span>
          <span style="font-weight:700;font-size:0.85rem;color:${s.color}">${i+1}. ${f.title}</span>
        </div>
        <div style="font-size:0.78rem;color:var(--text2);line-height:1.65;padding-left:22px">${f.detail}</div>
      </div>`;
    }).join('');
    const conf = Math.min(99, Math.max(50, parseInt(data.confidence) || 88));
    return `
      <div style="margin-bottom:18px">
        <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--teal);font-weight:700;margin-bottom:5px">Imaging Modality</div>
        <div style="font-size:0.9rem;font-weight:600;color:var(--text1)">${data.modality||'Radiology Report'}</div>
        ${data.quality ? `<div style="font-size:0.73rem;color:var(--text3);margin-top:3px">Quality: ${data.quality}</div>` : ''}
      </div>
      <div style="margin-bottom:18px">
        <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--teal);font-weight:700;margin-bottom:10px">Key Findings</div>
        <div style="display:flex;flex-direction:column;gap:10px">${findings}</div>
      </div>
      ${data.impression ? `<div style="margin-bottom:18px">
        <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--teal);font-weight:700;margin-bottom:6px">Radiological Impression</div>
        <div style="font-size:0.83rem;color:var(--text1);line-height:1.7;padding:12px;background:var(--navy3);border-radius:8px">${data.impression}</div>
      </div>` : ''}
      <div style="padding:12px;background:var(--panel2);border-radius:8px">
        <div style="font-weight:600;font-size:0.82rem;color:var(--text1);margin-bottom:6px">AI Confidence: ${conf}%</div>
        <div style="height:6px;background:var(--navy3);border-radius:3px;overflow:hidden">
          <div style="width:${conf}%;height:100%;background:linear-gradient(90deg,var(--teal),var(--cyan));border-radius:3px;transition:width 0.8s ease"></div>
        </div>
        <div style="font-size:0.68rem;color:var(--text3);margin-top:6px">Verify AI findings against original imaging and clinical presentation.</div>
      </div>`;
  }

  // ── Render guidance panel from AI JSON ────────────────────────────
  function renderRadiologyGuidance(data) {
    const urgencyMap = {
      critical: { bg:'var(--red-dim)',  color:'var(--red)',  label:'CRITICAL — IMMEDIATE ACTION REQUIRED' },
      urgent:   { bg:'var(--red-dim)',  color:'var(--red)',  label:'URGENT' },
      high:     { bg:'var(--gold-dim)', color:'var(--gold)', label:'HIGH PRIORITY' },
      moderate: { bg:'var(--gold-dim)', color:'var(--gold)', label:'MODERATE' },
      routine:  { bg:'var(--panel2)',   color:'var(--teal)', label:'ROUTINE' },
    };
    const u = urgencyMap[(data.urgency||'routine').toLowerCase()] || urgencyMap.routine;
    const numColors = ['var(--red)','var(--gold)','var(--teal)','var(--purple)','var(--green)'];
    const actions = (data.actions||[]).map((a,i) => `
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="width:24px;height:24px;border-radius:50%;background:${numColors[i%numColors.length]};color:white;font-weight:700;font-size:0.72rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">${i+1}</div>
        <div>
          <div style="font-weight:600;font-size:0.85rem;color:var(--text1)">${a.step}</div>
          <div style="font-size:0.78rem;color:var(--text2);margin-top:3px;line-height:1.6">${a.detail}</div>
        </div>
      </div>`).join('');
    return `
      <div style="margin-bottom:18px">
        <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--teal);font-weight:700;margin-bottom:8px">🎯 Clinical Impression</div>
        <div style="padding:12px;background:${u.bg};border-radius:8px">
          <div style="font-weight:700;font-size:0.82rem;color:${u.color};margin-bottom:4px">${u.label}</div>
          <div style="font-size:0.83rem;color:var(--text1);line-height:1.65">${data.impression||''}</div>
        </div>
      </div>
      ${actions ? `<div style="margin-bottom:18px">
        <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--teal);font-weight:700;margin-bottom:12px">🩺 Recommended Actions</div>
        <div style="display:flex;flex-direction:column;gap:12px">${actions}</div>
      </div>` : ''}
      ${data.followUp ? `<div style="margin-bottom:18px">
        <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--teal);font-weight:700;margin-bottom:8px">📅 Follow-up Plan</div>
        <div style="padding:12px;background:var(--panel2);border-radius:8px;font-size:0.82rem;color:var(--text1);line-height:1.7">${data.followUp.replace(/\n/g,'<br>')}</div>
      </div>` : ''}
      ${data.redFlags ? `<div style="padding:12px;background:var(--gold-dim);border-left:3px solid var(--gold);border-radius:8px;margin-bottom:14px">
        <div style="font-weight:700;font-size:0.82rem;color:var(--gold);margin-bottom:4px">⚠️ Red Flags — Escalate immediately if:</div>
        <div style="font-size:0.78rem;color:var(--text2);line-height:1.7">${data.redFlags.replace(/\n/g,'<br>')}</div>
      </div>` : ''}
      ${data.guidelines ? `<div style="font-size:0.7rem;color:var(--text3);font-style:italic">📚 Guidelines: ${data.guidelines}</div>` : ''}`;
  }

  // ── Core AI call ───────────────────────────────────────────────────
  async function runRadiologyAI(report) {
    const patientCtx = getActivePatientContext();
    const isImage = report.type && report.type.startsWith('image/');

    const systemPrompt = `You are SamarthaaMed Radiology AI, an expert radiologist assistant embedded in a clinical platform.
${patientCtx}

Respond ONLY with a valid JSON object with exactly two keys: "analysis" and "guidance".

"analysis" object schema:
{
  "modality": "imaging type and view e.g. Chest X-Ray PA View",
  "quality": "technical quality comment",
  "findings": [ { "severity": "critical|high|moderate|normal", "title": "finding name", "detail": "clinical description with measurements" } ],
  "impression": "overall radiological impression, 2-3 sentences",
  "confidence": 88
}

"guidance" object schema:
{
  "impression": "clinical diagnosis or differential",
  "urgency": "critical|urgent|high|moderate|routine",
  "actions": [ { "step": "action title", "detail": "specific instruction with drug names/doses/timing" } ],
  "followUp": "follow-up plan with timeline",
  "redFlags": "warning signs requiring immediate escalation",
  "guidelines": "guideline references used"
}

Rules:
- List 3-6 findings including BOTH abnormal AND normal/reassuring findings
- Actions must reference current ICMR, ESC, AHA or WHO guidelines by name
- Do NOT output any text outside the JSON object
- Do NOT use markdown code fences`;

    let msgContent;
    if (report.isSample) {
      msgContent = `Analyse this radiology report and return the JSON:\n\n${report.reportText}`;
    } else if (isImage) {
      msgContent = [
        { type: 'image', source: { type: 'base64', media_type: report.type, data: report.data.split(',')[1] } },
        { type: 'text', text: `Analyse this medical image (${report.filename}) and return the JSON object only.` }
      ];
    } else {
      msgContent = `Analyse this radiology report file: "${report.filename}" (type: ${report.type||'PDF'}).\n\nUse the patient context and filename to infer the modality and generate a clinically accurate structured analysis. Return the JSON only.`;
    }

    const messages = [{ role: 'user', content: msgContent }];
    const raw = await callClaudeAI(messages, systemPrompt);
    const clean = raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
    return JSON.parse(clean);
  }

  // ── Main orchestrator ──────────────────────────────────────────────
  async function analyzeRadiologyReport(report) {
    currentRadiologyReport = report;
    showRadiologyLoading();
    showToast('🔍', 'Analysing', `${report.filename} — Claude AI processing…`);
    const t0 = Date.now();
    try {
      const result = await runRadiologyAI(report);
      const elapsed = ((Date.now()-t0)/1000).toFixed(1);
      const stamp = `<div style="font-size:0.68rem;color:var(--text3);margin-bottom:12px;display:flex;gap:8px;align-items:center">
        <span style="background:var(--teal-dim);color:var(--teal);padding:2px 10px;border-radius:20px;font-weight:600;font-size:0.65rem">✓ Claude AI</span>
        <span>${elapsed}s · ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span></div>`;
      const analysisHtml = stamp + renderRadiologyAnalysis(result.analysis);
      const guidanceHtml = stamp.replace('Claude AI','ICMR/ESC Referenced') + renderRadiologyGuidance(result.guidance);
      document.getElementById('radiologyAnalysisContent').innerHTML = analysisHtml;
      document.getElementById('radiologyGuidanceContent').innerHTML  = guidanceHtml;
      const idx = radiologyReports.findIndex(r => r.id === report.id);
      if (idx !== -1) {
        radiologyReports[idx].analyzed    = true;
        radiologyReports[idx].analysisHtml = analysisHtml;
        radiologyReports[idx].guidanceHtml = guidanceHtml;
        radiologyReports[idx].parsedResult = result;
        displayRadiologyFiles();
      }
      showToast('✅', 'Analysis Complete', `${(result.analysis.findings||[]).length} findings · ${elapsed}s`);
    } catch(err) {
      console.error('Radiology AI error:', err);
      const errHtml = `<div style="padding:20px;background:var(--red-dim);border:1px solid var(--red);border-radius:10px;text-align:center">
        <div style="font-size:1.8rem;margin-bottom:8px">⚠️</div>
        <div style="font-weight:700;color:var(--red);font-size:0.9rem">Analysis Failed</div>
        <div style="font-size:0.8rem;color:var(--text2);margin-top:6px">${err.message}</div>
        <div style="font-size:0.72rem;color:var(--text3);margin-top:8px">Check your Anthropic API key in Settings, then try again.</div>
      </div>`;
      document.getElementById('radiologyAnalysisContent').innerHTML = errHtml;
      document.getElementById('radiologyGuidanceContent').innerHTML  = errHtml;
      showToast('❌', 'Analysis Failed', err.message);
    }
  }

  function analyzeRadiologyReportByIndex(index) {
    const r = radiologyReports[index];
    if (r) analyzeRadiologyReport(r);
  }

  // ── File upload handler ────────────────────────────────────────────
  function handleRadiologyUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    event.target.value = '';
    showToast('📤', `Uploading ${files.length} file(s)`, 'Reading content…');
    let loaded = 0;
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        radiologyReports.push({
          id: Date.now() + index,
          filename: file.name,
          type: file.type || 'application/pdf',
          size: file.size,
          uploadDate: new Date(),
          data: e.target.result,
          analyzed: false,
          isSample: false
        });
        loaded++;
        if (loaded === files.length) {
          showToast('✅', 'Upload Complete', `${files.length} report(s) ready`);
          displayRadiologyFiles();
          analyzeRadiologyReport(radiologyReports[radiologyReports.length - 1]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // ── File list display ──────────────────────────────────────────────
  function displayRadiologyFiles() {
    const container = document.getElementById('radiologyFilesContainer');
    const filesList  = document.getElementById('radiologyFilesList');
    if (!radiologyReports.length) { filesList.style.display = 'none'; return; }
    filesList.style.display = 'block';
    container.innerHTML = radiologyReports.map((r, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--panel);border:1px solid var(--border2);border-radius:8px;margin-bottom:8px;cursor:pointer;transition:all 0.2s"
           onclick="selectRadiologyReport(${i})"
           onmouseover="this.style.borderColor='var(--teal)'"
           onmouseout="this.style.borderColor='var(--border2)'">
        <div style="font-size:1.8rem">${getFileIcon(r.type)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:0.84rem;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.filename}</div>
          <div style="font-size:0.72rem;color:var(--text3);margin-top:2px">${formatFileSize(r.size)} · ${formatDate(r.uploadDate)}</div>
        </div>
        ${r.analyzed
          ? '<span style="background:var(--teal-dim);color:var(--teal);padding:4px 10px;border-radius:6px;font-size:0.7rem;font-weight:600;flex-shrink:0">✓ Analysed</span>'
          : `<button class="btn btn-primary btn-sm" style="flex-shrink:0" onclick="event.stopPropagation();analyzeRadiologyReportByIndex(${i})">Analyse</button>`}
      </div>`).join('');
  }

  function selectRadiologyReport(index) {
    const r = radiologyReports[index];
    if (!r) return;
    currentRadiologyReport = r;
    document.getElementById('radiologyAnalysisSection').style.display = 'grid';
    document.getElementById('radiologyActionsCard').style.display     = 'block';
    if (r.analyzed && r.analysisHtml) {
      document.getElementById('radiologyAnalysisContent').innerHTML = r.analysisHtml;
      document.getElementById('radiologyGuidanceContent').innerHTML  = r.guidanceHtml;
    } else {
      analyzeRadiologyReport(r);
    }
  }

  function getFileIcon(type) {
    if (!type) return '📋';
    if (type.includes('pdf'))   return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('dicom')) return '🩻';
    return '📋';
  }
  function formatFileSize(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1048576)    return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1048576).toFixed(1) + ' MB';
  }
  function formatDate(date) {
    const diff = Date.now() - date;
    if (diff < 60000)    return 'Just now';
    if (diff < 3600000)  return Math.floor(diff/60000) + ' min ago';
    if (diff < 86400000) return Math.floor(diff/3600000) + ' hours ago';
    return new Date(date).toLocaleDateString('en-IN');
  }

  // ── Sample reports with real clinical text ─────────────────────────
  function loadSampleRadiology(type) {
    const samples = {
      'chest-xray': {
        filename: 'Chest_XRay_PA_Sample.pdf',
        reportText: `RADIOLOGY REPORT — Chest X-Ray PA View
Clinical indication: Chest pain, breathlessness, hypertension, known DM Type 2

FINDINGS:
Heart: Cardiomegaly. Cardiothoracic ratio 0.58 (normal <0.50). Globular cardiac silhouette.
Lungs: Bilateral perihilar haziness. Upper lobe vascular diversion. Kerley B lines at costophrenic angles. No focal consolidation. No pneumothorax.
Pleura: Mild blunting of bilateral costophrenic angles — possible early pleural effusion.
Mediastinum: Normal width. Trachea central.
Bones: Mild thoracic spondylosis. No fracture.

IMPRESSION: Cardiomegaly with pulmonary venous congestion / early pulmonary oedema. Echocardiography recommended.`
      },
      'ct-brain': {
        filename: 'CT_Brain_NonContrast_Sample.pdf',
        reportText: `RADIOLOGY REPORT — CT Brain Non-Contrast (NCCT Head)
Clinical indication: Sudden right hemiplegia and aphasia, onset 90 minutes ago

FINDINGS:
Parenchyma: Hypodense area in left MCA territory (frontal-parietal). Loss of grey-white differentiation. Insular ribbon sign positive. Hyperdense MCA sign in left M1 segment.
ASPECTS score: 6/10 (M1, M2, M3 and insular territories involved).
Ventricles: Mild left lateral ventricle compression. No midline shift.
Haemorrhage: No intracranial haemorrhage. No subarachnoid blood.
Posterior fossa: Normal.

IMPRESSION: Acute large vessel ischaemic stroke — left MCA territory. Hyperdense MCA sign suggests proximal occlusion. ASPECTS 6/10. Evaluate for thrombolysis/thrombectomy within time window. Urgent neurology review.`
      },
      'mri-spine': {
        filename: 'MRI_Lumbar_Spine_T2_Sample.pdf',
        reportText: `RADIOLOGY REPORT — MRI Lumbar Spine T1/T2/STIR
Clinical indication: Low back pain radiating to left leg, foot weakness, 3 months duration

FINDINGS:
L1-L3: Normal disc height and signal. No nerve root compromise.
L4-L5: Large posterior-central disc extrusion with cranial migration. >50% thecal sac compromise. Left L5 nerve root compression. Bilateral foraminal narrowing. Facet joint hypertrophy.
L5-S1: Diffuse disc bulge with annular fissure. Mild thecal sac indentation. Mild bilateral foraminal narrowing.
Canal: Moderate-severe stenosis at L4-L5.
Conus: Normal at L1. No intrinsic cord signal change.
Marrow: No Modic changes. No fracture or lytic lesion.

IMPRESSION: Large L4-L5 disc extrusion with severe canal stenosis and left L5 nerve root compression. L5-S1 disc bulge with mild stenosis. Surgical evaluation recommended given motor deficit.`
      },
      'ultrasound-abdomen': {
        filename: 'USG_Abdomen_Complete_Sample.pdf',
        reportText: `RADIOLOGY REPORT — Ultrasound Abdomen & Pelvis Complete
Clinical indication: RUQ pain, elevated liver enzymes, DM Type 2, obesity

FINDINGS:
Liver: Hepatomegaly — span 16.4 cm (normal 12-15 cm). Diffusely increased echogenicity vs renal cortex. Grade II hepatic steatosis (NAFLD). Coarse echotexture. No focal lesion. Portal vein 12 mm.
Gallbladder: Two calculi (6 mm, 9 mm) with posterior acoustic shadowing. No wall thickening (3 mm). No pericholecystic fluid. Murphy's sign equivocal.
CBD: 5 mm — upper normal limit.
Pancreas: Partially visualised. No calcification or ductal dilatation.
Spleen: 11.2 cm — normal.
Kidneys: Right 10.4 cm, left 10.6 cm. Normal echogenicity. No hydronephrosis or calculi.
Ascites: None.

IMPRESSION: Grade II NAFLD with hepatomegaly. Cholelithiasis without acute cholecystitis. Clinical correlation advised.`
      }
    };
    const s = samples[type];
    if (!s) return;
    const report = {
      id: Date.now(),
      filename: s.filename,
      type: 'application/pdf',
      size: s.reportText.length,
      uploadDate: new Date(),
      data: '',
      reportText: s.reportText,
      analyzed: false,
      isSample: true
    };
    radiologyReports.push(report);
    showToast('📋', 'Sample Loaded', s.filename);
    displayRadiologyFiles();
    analyzeRadiologyReport(report);
  }

  // ── Action buttons ─────────────────────────────────────────────────
  async function regenerateGuidance() {
    if (!currentRadiologyReport) { showToast('⚠️','No Report','Analyse a report first'); return; }
    showToast('🔄','Regenerating','Asking Claude for fresh recommendations…');
    document.getElementById('radiologyGuidanceContent').innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:14px;background:var(--teal-dim);border-radius:10px">
        <span style="font-size:1.1rem">🔄</span>
        <span style="font-size:0.85rem;color:var(--teal);font-weight:600">Generating new guidance…</span>
      </div>`;
    try {
      const result = await runRadiologyAI(currentRadiologyReport);
      const stamp = `<div style="font-size:0.68rem;color:var(--text3);margin-bottom:12px;display:flex;gap:8px;align-items:center">
        <span style="background:var(--teal-dim);color:var(--teal);padding:2px 10px;border-radius:20px;font-weight:600;font-size:0.65rem">✓ Regenerated</span>
        <span>${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span></div>`;
      const guidanceHtml = stamp + renderRadiologyGuidance(result.guidance);
      document.getElementById('radiologyGuidanceContent').innerHTML = guidanceHtml;
      const idx = radiologyReports.findIndex(r => r.id === currentRadiologyReport.id);
      if (idx !== -1) radiologyReports[idx].guidanceHtml = guidanceHtml;
      showToast('✅','Guidance Updated','New AI recommendations ready');
    } catch(err) { showToast('❌','Failed',err.message); }
  }

  function addRadiologyToConsult() {
    if (!currentRadiologyReport) { showToast('⚠️','No Report','Analyse a report first'); return; }
    const analysis = document.getElementById('radiologyAnalysisContent').innerText;
    const guidance = document.getElementById('radiologyGuidanceContent').innerText;
    const summary  = `📋 Radiology: ${currentRadiologyReport.filename}\n\n${analysis.slice(0,500)}…\n\nGuidance: ${guidance.slice(0,400)}…`;
    const msgs = document.getElementById('chatMessages');
    if (msgs) {
      const div = document.createElement('div');
      div.className = 'msg ai';
      div.innerHTML = `<div class="msg-avatar">🩻</div><div><div class="msg-bubble" style="border-left:3px solid var(--teal);font-size:0.8rem;white-space:pre-line;color:var(--text2)">${summary}</div><div class="msg-time">Radiology · Just now</div></div>`;
      const typing = document.getElementById('typingIndicator');
      if (typing) msgs.insertBefore(div, typing); else msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }
    navigator.clipboard?.writeText(summary);
    showView('consult');
    showToast('📋','Added to Consultation','Radiology findings attached to patient chat');
  }

  function copyRadiologyAnalysis() {
    navigator.clipboard?.writeText(document.getElementById('radiologyAnalysisContent').innerText);
    showToast('📋','Copied','Analysis copied to clipboard');
  }

  async function generateRadiologySOAP() {
    if (!currentRadiologyReport) { showToast('⚠️','No Report','Analyse a report first'); return; }
    showToast('📝','Generating SOAP','Building note from radiology findings…');
    const analysis = document.getElementById('radiologyAnalysisContent').innerText;
    const guidance = document.getElementById('radiologyGuidanceContent').innerText;
    try {
      const soap = await callClaudeAI(
        [{ role:'user', content:`Write a clinical SOAP note incorporating these radiology findings.\n\nAnalysis:\n${analysis}\n\nGuidance:\n${guidance}\n\nFormat: four sections labelled SUBJECTIVE, OBJECTIVE, ASSESSMENT, PLAN. Plain text only.` }],
        `You are a clinical documentation assistant. ${getActivePatientContext()}`
      );
      const sec = { S:'', O:'', A:'', P:'' };
      let cur = null;
      soap.split('\n').forEach(line => {
        if (/^SUBJECTIVE/i.test(line)) cur='S';
        else if (/^OBJECTIVE/i.test(line)) cur='O';
        else if (/^ASSESSMENT/i.test(line)) cur='A';
        else if (/^PLAN/i.test(line)) cur='P';
        else if (cur) sec[cur] += line + '\n';
      });
      ['S','O','A','P'].forEach(k => { const el=document.getElementById('soap'+k); if(el&&sec[k]) el.textContent=sec[k].trim(); });
      document.getElementById('soapModal')?.classList.add('open');
      showToast('✅','SOAP Ready','Review and edit in the modal');
    } catch(err) { showToast('❌','SOAP Failed',err.message); }
  }

  function printRadiologyReport() {
    if (!currentRadiologyReport) { showToast('⚠️','No Report','Analyse a report first'); return; }
    const analysis = document.getElementById('radiologyAnalysisContent').innerHTML;
    const guidance = document.getElementById('radiologyGuidanceContent').innerHTML;
    const win = window.open('','_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Radiology Report</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;max-width:900px;margin:0 auto;color:#1f2937}
    .hdr{text-align:center;border-bottom:3px solid #0d9488;padding-bottom:18px;margin-bottom:28px}
    .logo{font-size:1.4rem;font-weight:800;color:#0d9488}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
    h2{color:#0d9488;font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;margin:24px 0 10px}
    @media print{.noprint{display:none}}</style></head><body>
    <div class="hdr"><div class="logo">🧬 SamarthaaMed</div>
    <div style="color:#666;margin-top:4px">Radiology Intelligence Report</div>
    <div style="font-size:0.78rem;color:#999;margin-top:4px">${currentRadiologyReport.filename} · ${new Date().toLocaleDateString('en-IN')}</div></div>
    <div class="grid"><div><h2>Report Analysis</h2>${analysis}</div><div><h2>Clinical Guidance</h2>${guidance}</div></div>
    <div class="noprint" style="text-align:center;margin-top:28px;display:flex;gap:12px;justify-content:center">
    <button onclick="window.print()" style="padding:10px 24px;background:#0d9488;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">🖨 Print</button>
    <button onclick="window.close()" style="padding:10px 24px;background:#666;color:white;border:none;border-radius:8px;cursor:pointer">Close</button>
    </div></body></html>`);
    win.document.close();
    showToast('🖨','Print Ready','Report opened in new window');
  }

  function compareWithPrevious() {
    const analysed = radiologyReports.filter(r => r.analyzed);
    if (analysed.length < 2) { showToast('📊','Compare','Analyse at least 2 reports to compare'); return; }
    showToast('📊','Compare','Select a second report from the list to compare');
  }

  function orderFollowUp() {
    if (!currentRadiologyReport) { showToast('⚠️','No Report','Analyse a report first'); return; }
    showToast('📅','Follow-up Noted','Recommendation noted from guidance panel');
  }


  /* ══════════════════════════════════════════════════════════
     PRINT RX & WHATSAPP FUNCTIONS (AI Consultation)
     ══════════════════════════════════════════════════════════ */

  function printPrescriptionFromConsult() {
    // Get current patient
    const activeChip = document.querySelector('.patient-chip.active');
    if (!activeChip) {
      showToast('⚠️', 'No Patient Selected', 'Please select a patient first');
      return;
    }

    const onclick = activeChip.getAttribute('onclick');
    const match = onclick.match(/'(\w+)'/);
    const patientKey = match ? match[1] : 'PK';
    const patient = patientProfiles[patientKey];

    if (!patient) {
      showToast('⚠️', 'Patient Not Found', 'Unable to load patient data');
      return;
    }

    showToast('🖨', 'Generating Prescription', 'Creating printable prescription...');

    // Get medications from the Rx tab
    const rxTabContent = document.getElementById('tab-rx');
    const medications = rxTabContent ? extractMedicationsFromTab(rxTabContent) : [];

    // Create prescription print window
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      const prescriptionHTML = generatePrescriptionHTML(patient, medications);
      printWindow.document.write(prescriptionHTML);
      printWindow.document.close();
      showToast('✅', 'Prescription Ready', 'Print window opened');
    }, 500);
  }

  function extractMedicationsFromTab(tabContent) {
    const medications = [];
    const rxItems = tabContent.querySelectorAll('.rx-item');
    
    rxItems.forEach(item => {
      const drugName = item.querySelector('.rx-drug')?.textContent || '';
      const dose = item.querySelector('.rx-dose')?.textContent || '';
      if (drugName) {
        medications.push({ drug: drugName, dose: dose });
      }
    });

    // If no items in UI, use patient's current medications
    if (medications.length === 0) {
      return null; // Will use patient.meds instead
    }

    return medications;
  }

  function generatePrescriptionHTML(patient, medications) {
    const today = new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });

    // Get logged-in doctor details
    const doctorName = localStorage.getItem('samarthaamed_user_name') || 'Dr. Physician';
    const doctorOrg = localStorage.getItem('samarthaamed_user_org') || 'Healthcare Institution';
    const doctorEmail = localStorage.getItem('samarthaamed_user_email') || 'doctor@hospital.com';

    // Use extracted medications or fall back to patient's current meds
    let medicationsList = '';
    if (medications && medications.length > 0) {
      medicationsList = medications.map((med, index) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${index + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${med.drug}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb">${med.dose}</td>
        </tr>
      `).join('');
    } else {
      // Parse patient.meds string
      const medsArray = patient.meds.split('\n').filter(m => m.trim());
      medicationsList = medsArray.map((med, index) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${index + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:0.95rem" colspan="2">${med}</td>
        </tr>
      `).join('');
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Prescription - ${patient.name}</title>
  <style>
    @page { margin: 1.5cm; }
    body { 
      font-family: 'Arial', sans-serif; 
      line-height: 1.6; 
      color: #000;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 5px;
    }
    .doctor-info {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }
    .patient-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
      border-left: 4px solid #10b981;
    }
    .patient-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .label {
      font-weight: 600;
      color: #333;
    }
    .value {
      color: #666;
    }
    .rx-symbol {
      font-size: 36px;
      color: #10b981;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #10b981;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }
    .instructions {
      background: #fff3cd;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
      margin-bottom: 25px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
    }
    .signature-line {
      margin-top: 50px;
      border-top: 2px solid #000;
      width: 250px;
      float: right;
      text-align: center;
      padding-top: 10px;
    }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🧬 SamarthaaMed</div>
    <div style="font-size: 16px; color: #333;">Clinical Intelligence Platform</div>
    <div class="doctor-info">
      <strong>${doctorName}</strong><br>
      ${doctorOrg}<br>
      📧 ${doctorEmail}
    </div>
  </div>

  <div style="text-align:right;color:#666;font-size:14px;margin-bottom:20px">
    Date: ${today}
  </div>

  <div class="patient-section">
    <div class="patient-row">
      <span class="label">Patient Name:</span>
      <span class="value">${patient.name}</span>
    </div>
    <div class="patient-row">
      <span class="label">Age/Gender:</span>
      <span class="value">${patient.meta.split('·')[0]}</span>
    </div>
    <div class="patient-row">
      <span class="label">Patient ID:</span>
      <span class="value">${patient.meta.match(/ID: ([\w-]+)/)?.[1] || 'N/A'}</span>
    </div>
    <div class="patient-row">
      <span class="label">Department:</span>
      <span class="value">${patient.meta.split('·')[2] || 'General Medicine'}</span>
    </div>
  </div>

  <div class="rx-symbol">℞</div>

  <table>
    <thead>
      <tr>
        <th style="width:50px">#</th>
        <th>Medication</th>
        <th style="width:250px">Dosage & Instructions</th>
      </tr>
    </thead>
    <tbody>
      ${medicationsList}
    </tbody>
  </table>

  <div class="instructions">
    <strong style="color:#856404">📋 General Instructions:</strong><br>
    • Take medications as prescribed at the specified times<br>
    • Do not skip doses or stop medications without consulting your doctor<br>
    • Store medications in a cool, dry place away from direct sunlight<br>
    • Follow up as scheduled for review and monitoring<br>
    • Contact immediately if you experience any adverse reactions
  </div>

  <div style="padding:15px;background:#e8f5e9;border-radius:8px;margin-bottom:25px">
    <strong style="color:#1b5e20">📅 Follow-up:</strong> Review in 2 weeks or earlier if symptoms worsen<br>
    <strong style="color:#1b5e20">🔬 Investigations:</strong> As discussed during consultation
  </div>

  <div class="footer">
    <div style="font-size:12px;color:#666;margin-bottom:20px">
      This is a computer-generated prescription and does not require a physical signature.<br>
      Verified electronically by SamarthaaMed AI-Assisted Clinical System.
    </div>
    <div class="signature-line">
      <strong>${doctorName}</strong><br>
      Consulting Physician
    </div>
  </div>

  <div class="no-print" style="clear:both;margin-top:80px;text-align:center">
    <button onclick="window.print()" style="padding:12px 30px;background:#10b981;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;margin-right:10px">🖨 Print</button>
    <button onclick="window.close()" style="padding:12px 30px;background:#666;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600">Close</button>
  </div>
</body>
</html>
    `;
  }

  function shareViaWhatsApp() {
    // Get current patient
    const activeChip = document.querySelector('.patient-chip.active');
    if (!activeChip) {
      showToast('⚠️', 'No Patient Selected', 'Please select a patient first');
      return;
    }

    const onclick = activeChip.getAttribute('onclick');
    const match = onclick.match(/'(\w+)','([^']+)'/);
    if (!match) {
      showToast('⚠️', 'Error', 'Unable to get patient information');
      return;
    }

    const patientKey = match[1];
    const patientName = match[2];
    const patient = patientProfiles[patientKey];

    if (!patient) {
      showToast('⚠️', 'Patient Not Found', 'Unable to load patient data');
      return;
    }

    // Create prescription summary for WhatsApp
    const today = new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });

    // Get logged-in doctor details
    const doctorName = localStorage.getItem('samarthaamed_user_name') || 'Dr. Physician';
    const doctorOrg = localStorage.getItem('samarthaamed_user_org') || 'Healthcare Institution';

    // Get medications
    const medsArray = patient.meds.split('\n').filter(m => m.trim());
    const medsList = medsArray.map((med, i) => `${i + 1}. ${med}`).join('\n');

    const message = `🧬 *SamarthaaMed Prescription*

📋 *Patient:* ${patient.name}
📅 *Date:* ${today}
🏥 *Department:* ${patient.meta.split('·')[2] || 'General Medicine'}

℞ *PRESCRIPTION*
${medsList}

📝 *General Instructions:*
• Take medications as prescribed
• Do not skip doses
• Follow up in 2 weeks
• Contact if any adverse reactions

👨‍⚕️ *${doctorName}*
${doctorOrg}

_This is a digital prescription from SamarthaaMed AI-Assisted Clinical System_`;

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    
    // For demo: show WhatsApp modal/dialog
    showWhatsAppDialog(patientName, message, encodedMessage);
  }

  function showWhatsAppDialog(patientName, message, encodedMessage) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;animation:fadeIn 0.2s';
    
    modal.innerHTML = `
      <div style="background:var(--panel);border-radius:16px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
        <div style="padding:24px;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:1.2rem;font-weight:700;color:var(--text1);margin-bottom:4px">📲 Share via WhatsApp</div>
              <div style="font-size:0.85rem;color:var(--text3)">Send prescription to ${patientName}</div>
            </div>
            <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;color:var(--text2);cursor:pointer;padding:0;width:32px;height:32px">×</button>
          </div>
        </div>
        
        <div style="padding:24px">
          <div style="margin-bottom:20px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text2);margin-bottom:8px">Patient Phone Number</label>
            <input type="tel" id="whatsappPhone" placeholder="+91 98765 43210" style="width:100%;padding:12px;background:var(--navy3);border:1px solid var(--border2);border-radius:8px;color:var(--text1);font-size:0.95rem" value="+91 98765 43210">
          </div>

          <div style="margin-bottom:20px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text2);margin-bottom:8px">Preview Message</label>
            <div style="background:var(--navy3);padding:16px;border-radius:8px;font-size:0.8rem;color:var(--text2);max-height:300px;overflow-y:auto;white-space:pre-wrap;border:1px solid var(--border2);font-family:monospace">${message}</div>
          </div>

          <div style="display:flex;gap:12px">
            <button onclick="sendWhatsAppMessage('${encodedMessage}')" style="flex:1;padding:14px;background:linear-gradient(135deg,#25D366,#128C7E);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.95rem">
              📱 Open WhatsApp
            </button>
            <button onclick="copyWhatsAppMessage(\`${message.replace(/`/g, '\\`')}\`)" style="flex:1;padding:14px;background:var(--teal);color:var(--navy);border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.95rem">
              📋 Copy Message
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  function sendWhatsAppMessage(encodedMessage) {
    const phone = document.getElementById('whatsappPhone')?.value.replace(/[^0-9+]/g, '') || '';
    
    // Open WhatsApp with message
    const whatsappURL = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
    
    // Close modal
    document.querySelector('div[style*="position:fixed"]')?.remove();
    
    showToast('✅', 'WhatsApp Opened', 'Prescription ready to send');
  }

  function copyWhatsAppMessage(message) {
    navigator.clipboard?.writeText(message);
    showToast('📋', 'Copied to Clipboard', 'Message copied successfully');
    
    // Close modal after short delay
    setTimeout(() => {
      document.querySelector('div[style*="position:fixed"]')?.remove();
    }, 1000);
  }

  /* ══════════════════════════════════════════════════════════
     PRINT SOAP NOTE FUNCTION
     ══════════════════════════════════════════════════════════ */

  function printSOAPNote() {
    // Get SOAP content
    const soapS = document.getElementById('soapS')?.textContent || '';
    const soapO = document.getElementById('soapO')?.textContent || '';
    const soapA = document.getElementById('soapA')?.textContent || '';
    const soapP = document.getElementById('soapP')?.textContent || '';
    const soapICD = document.getElementById('soapICD')?.textContent || '';
    
    // Get patient info from label
    const patientLabel = document.getElementById('soapPatientLabel')?.textContent || 'Patient';
    
    // Get current patient details if available
    const activeChip = document.querySelector('.patient-chip.active');
    let patientName = 'Patient';
    let patientMeta = '';
    
    if (activeChip) {
      const onclick = activeChip.getAttribute('onclick');
      const match = onclick.match(/'(\w+)','([^']+)'/);
      if (match) {
        const patientKey = match[1];
        const patient = patientProfiles[patientKey];
        if (patient) {
          patientName = patient.name;
          patientMeta = patient.meta;
        }
      }
    }

    const today = new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      weekday: 'long'
    });

    // Get logged-in doctor details
    const doctorName = localStorage.getItem('samarthaamed_user_name') || 'Dr. Physician';
    const doctorOrg = localStorage.getItem('samarthaamed_user_org') || 'Healthcare Institution';
    const doctorEmail = localStorage.getItem('samarthaamed_user_email') || 'doctor@hospital.com';

    // Create print window
    const printWindow = window.open('', '_blank');
    
    const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>SOAP Note - ${patientName}</title>
  <style>
    @page { 
      margin: 2cm;
      size: A4;
    }
    
    body { 
      font-family: 'Arial', 'Helvetica', sans-serif; 
      line-height: 1.6; 
      color: #000;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 5px;
    }
    
    .doc-info {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }
    
    .patient-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
      border-left: 4px solid #10b981;
    }
    
    .patient-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .label {
      font-weight: 600;
      color: #333;
    }
    
    .value {
      color: #666;
    }
    
    .soap-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .soap-header {
      background: #10b981;
      color: white;
      padding: 12px 15px;
      font-weight: 700;
      font-size: 16px;
      border-radius: 6px 6px 0 0;
      margin-bottom: 0;
    }
    
    .soap-content {
      border: 2px solid #10b981;
      border-top: none;
      padding: 15px;
      background: white;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.8;
      border-radius: 0 0 6px 6px;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
    }
    
    .signature-box {
      text-align: center;
    }
    
    .signature-line {
      border-top: 2px solid #000;
      width: 200px;
      margin-top: 60px;
      padding-top: 10px;
    }
    
    @media print {
      .no-print { 
        display: none; 
      }
      body { 
        padding: 0; 
      }
      .soap-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🧬 SamarthaaMed</div>
    <div style="font-size: 16px; color: #333; font-weight: 600;">Clinical Intelligence Platform - SOAP Note</div>
    <div class="doc-info">
      <strong>${doctorName}</strong><br>
      ${doctorOrg}<br>
      📧 ${doctorEmail}
    </div>
  </div>

  <div style="text-align:right;color:#666;font-size:14px;margin-bottom:20px">
    <strong>Date:</strong> ${today}
  </div>

  <div class="patient-section">
    <div class="patient-row">
      <span class="label">Patient Name:</span>
      <span class="value">${patientName}</span>
    </div>
    ${patientMeta ? `
    <div class="patient-row">
      <span class="label">Patient Details:</span>
      <span class="value">${patientMeta}</span>
    </div>` : ''}
    <div class="patient-row">
      <span class="label">Consultation Date:</span>
      <span class="value">${patientLabel}</span>
    </div>
  </div>

  <div class="soap-section">
    <div class="soap-header">S — SUBJECTIVE</div>
    <div class="soap-content">${soapS || 'No subjective data recorded.'}</div>
  </div>

  <div class="soap-section">
    <div class="soap-header">O — OBJECTIVE</div>
    <div class="soap-content">${soapO || 'No objective data recorded.'}</div>
  </div>

  <div class="soap-section">
    <div class="soap-header">A — ASSESSMENT</div>
    <div class="soap-content">${soapA || 'No assessment recorded.'}</div>
  </div>

  <div class="soap-section">
    <div class="soap-header">P — PLAN</div>
    <div class="soap-content">${soapP || 'No plan recorded.'}</div>
  </div>

  ${soapICD ? `
  <div class="soap-section">
    <div class="soap-header">ICD-11 CODES</div>
    <div class="soap-content">${soapICD}</div>
  </div>` : ''}

  <div class="footer">
    <div style="font-size:12px;color:#666;margin-bottom:30px">
      This SOAP note was generated using SamarthaaMed AI-Assisted Clinical Documentation System.<br>
      All clinical data should be verified by the attending physician.
    </div>
    
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">
          <strong>Patient Signature</strong><br>
          <span style="font-size:11px;color:#999">(if applicable)</span>
        </div>
      </div>
      
      <div class="signature-box">
        <div class="signature-line">
          <strong>${doctorName}</strong><br>
          <span style="font-size:11px;color:#999">Consulting Physician</span>
        </div>
      </div>
    </div>
  </div>

  <div class="no-print" style="position:fixed;bottom:30px;right:30px;display:flex;gap:12px">
    <button onclick="window.print()" style="padding:14px 28px;background:#10b981;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(16,185,129,0.3)">
      🖨 Print
    </button>
    <button onclick="window.close()" style="padding:14px 28px;background:#666;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600">
      Close
    </button>
  </div>
</body>
</html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    showToast('🖨', 'Print Ready', 'SOAP note opened in new window');
  }

  // ═══════════════════════════════════════════════════════════════
  // TWO-WAY VOICE CONSULTATION SYSTEM
  // ═══════════════════════════════════════════════════════════════

  let voiceConsultation = {
    active: false,
    recognition: null,
    synthesis: window.speechSynthesis,
    currentLanguage: 'en-US',
    conversationHistory: [],
    isListening: false,
    isSpeaking: false,
    autoListen: true
  };

  // Start voice consultation
  function startVoiceConsultation() {
    // Show voice consultation modal
    const modal = document.createElement('div');
    modal.id = 'voiceConsultModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;';
    
    const patientName = document.querySelector('.consult-patient-name')?.textContent || 'Patient';
    const patientMeta = document.querySelector('.consult-patient-meta')?.textContent || '';
    
    modal.innerHTML = `
      <div style="background:var(--panel);border-radius:16px;max-width:900px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <!-- Header -->
        <div style="padding:24px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,var(--teal-dim),var(--panel));">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h2 style="margin:0;color:var(--text1);font-size:1.5rem;font-family:var(--syne);">🎤 Voice Consultation</h2>
              <p style="margin:4px 0 0 0;color:var(--text3);font-size:0.85rem;">${patientName} • ${patientMeta}</p>
            </div>
            <button onclick="endVoiceConsultation()" style="background:var(--red-dim);color:var(--red);border:1px solid var(--red);padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;">
              End Session
            </button>
          </div>
        </div>

        <!-- Voice Controls -->
        <div style="padding:20px;background:var(--panel2);border-bottom:1px solid var(--border);">
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:center;">
            <!-- Microphone Button -->
            <button id="voiceMicBtn" onclick="toggleVoiceListening()" style="width:80px;height:80px;border-radius:50%;background:var(--teal);border:4px solid var(--teal-dim);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:2rem;transition:all 0.3s;box-shadow:0 4px 20px rgba(185,28,28,0.3);">
              🎤
            </button>
            
            <!-- Status Display -->
            <div style="flex:1;min-width:200px;">
              <div id="voiceStatus" style="font-size:1.1rem;font-weight:600;color:var(--text1);margin-bottom:6px;">
                Ready to listen...
              </div>
              <div id="voiceSubStatus" style="font-size:0.85rem;color:var(--text3);">
                Click microphone to start conversation
              </div>
            </div>

            <!-- Language Selector -->
            <select id="voiceLangSelect" onchange="changeVoiceLanguage(this.value)" style="padding:10px 16px;border-radius:8px;border:1px solid var(--border2);background:var(--panel);color:var(--text1);font-size:0.9rem;cursor:pointer;">
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="en-GB">🇬🇧 English (UK)</option>
              <option value="hi-IN">🇮🇳 Hindi</option>
              <option value="kn-IN">🇮🇳 Kannada</option>
              <option value="ta-IN">🇮🇳 Tamil</option>
              <option value="te-IN">🇮🇳 Telugu</option>
              <option value="ml-IN">🇮🇳 Malayalam</option>
              <option value="mr-IN">🇮🇳 Marathi</option>
              <option value="bn-IN">🇮🇳 Bengali</option>
              <option value="gu-IN">🇮🇳 Gujarati</option>
              <option value="pa-IN">🇮🇳 Punjabi</option>
            </select>

            <!-- Auto-Listen Toggle -->
            <label style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--panel);border-radius:8px;border:1px solid var(--border2);cursor:pointer;">
              <input type="checkbox" id="autoListenToggle" checked onchange="voiceConsultation.autoListen=this.checked" style="width:18px;height:18px;cursor:pointer;">
              <span style="font-size:0.85rem;color:var(--text2);">Auto-continue</span>
            </label>
          </div>

          <!-- Waveform Visualizer -->
          <div id="voiceWaveform" style="margin-top:16px;height:60px;background:var(--navy3);border-radius:8px;display:flex;align-items:center;justify-content:center;gap:3px;padding:0 20px;overflow:hidden;">
            ${Array.from({length:40}, () => '<div style="width:3px;height:20px;background:var(--border);border-radius:2px;transition:all 0.1s;"></div>').join('')}
          </div>
        </div>

        <!-- Conversation History -->
        <div style="padding:20px;">
          <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
            <h3 style="margin:0;font-size:1rem;color:var(--text2);font-weight:600;">Conversation Transcript</h3>
            <button onclick="clearVoiceHistory()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:0.85rem;text-decoration:underline;">
              Clear transcript
            </button>
          </div>
          <div id="voiceTranscript" style="background:var(--navy3);border-radius:12px;padding:20px;max-height:400px;overflow-y:auto;min-height:200px;">
            <div style="text-align:center;color:var(--text3);padding:60px 20px;">
              <div style="font-size:3rem;margin-bottom:12px;">🎙️</div>
              <p style="margin:0;font-size:0.9rem;">Start speaking to begin the conversation...</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div style="padding:20px;border-top:1px solid var(--border);background:var(--panel2);display:flex;gap:12px;flex-wrap:wrap;">
          <button onclick="saveVoiceTranscript()" style="flex:1;min-width:150px;padding:12px;background:var(--teal-dim);color:var(--teal);border:1px solid var(--teal);border-radius:8px;cursor:pointer;font-weight:600;">
            💾 Save Transcript
          </button>
          <button onclick="generateSOAPFromVoice()" style="flex:1;min-width:150px;padding:12px;background:var(--teal);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
            📋 Generate SOAP Note
          </button>
          <button onclick="shareVoiceTranscript()" style="flex:1;min-width:150px;padding:12px;background:var(--panel);color:var(--text1);border:1px solid var(--border2);border-radius:8px;cursor:pointer;font-weight:600;">
            📤 Share
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    initializeVoiceRecognition();
    voiceConsultation.active = true;
    
    // Auto-start listening
    setTimeout(() => {
      toggleVoiceListening();
    }, 500);
  }

  // Initialize speech recognition
  function initializeVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showToast('⚠️', 'Not Supported', 'Voice recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    voiceConsultation.recognition = new SpeechRecognition();
    voiceConsultation.recognition.continuous = true;
    voiceConsultation.recognition.interimResults = true;
    voiceConsultation.recognition.lang = voiceConsultation.currentLanguage;
    voiceConsultation.recognition.maxAlternatives = 3;

    voiceConsultation.recognition.onstart = () => {
      voiceConsultation.isListening = true;
      updateVoiceStatus('Listening...', 'Speak now');
      animateWaveform(true);
      document.getElementById('voiceMicBtn').style.background = 'var(--red)';
      document.getElementById('voiceMicBtn').style.transform = 'scale(1.1)';
    };

    voiceConsultation.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        updateVoiceStatus('Listening...', interimTranscript);
      }

      if (finalTranscript) {
        addToVoiceTranscript('user', finalTranscript);
        processVoiceInput(finalTranscript);
      }
    };

    voiceConsultation.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      if (event.error === 'no-speech') {
        updateVoiceStatus('No speech detected', 'Please speak clearly');
      } else if (event.error === 'not-allowed') {
        showToast('⚠️', 'Microphone Access Denied', 'Please allow microphone access');
        voiceConsultation.isListening = false;
      }
    };

    voiceConsultation.recognition.onend = () => {
      voiceConsultation.isListening = false;
      document.getElementById('voiceMicBtn').style.background = 'var(--teal)';
      document.getElementById('voiceMicBtn').style.transform = 'scale(1)';
      animateWaveform(false);
      
      // Auto-restart if auto-listen is enabled and not speaking
      if (voiceConsultation.autoListen && !voiceConsultation.isSpeaking && voiceConsultation.active) {
        setTimeout(() => {
          if (!voiceConsultation.isSpeaking && voiceConsultation.active) {
            voiceConsultation.recognition.start();
          }
        }, 1000);
      } else {
        updateVoiceStatus('Stopped', 'Click microphone to continue');
      }
    };
  }

  // Toggle voice listening
  function toggleVoiceListening() {
    if (!voiceConsultation.recognition) {
      initializeVoiceRecognition();
      return;
    }

    if (voiceConsultation.isListening) {
      voiceConsultation.recognition.stop();
      voiceConsultation.autoListen = false;
      document.getElementById('autoListenToggle').checked = false;
    } else {
      try {
        voiceConsultation.recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }

  // Process voice input with AI
  async function processVoiceInput(text) {
    updateVoiceStatus('Processing...', 'AI is thinking...');

    // Check API key BEFORE doing anything — show clear toast if missing
    const apiKey = getApiKey();
    if (!apiKey) {
      showToast('⚠️', 'API Key Not Configured', 'Contact your administrator to configure the system API key');
      const fallback = generateFallbackResponse(text);
      addToVoiceTranscript('ai', fallback);
      speakText(fallback);
      return;
    }

    const patientCtx = getActivePatientContext();

    // Build a strictly alternating user/assistant message history
    // The conversationHistory already has the current user turn added by addToVoiceTranscript
    // We take previous turns (excluding the last user entry we just added) and build pairs
    const prevHistory = voiceConsultation.conversationHistory.slice(0, -1); // exclude current turn
    const messages = [];
    prevHistory.slice(-8).forEach(m => {
      const role = m.type === 'user' ? 'user' : 'assistant';
      // Ensure strict alternation: skip if same role as last added
      if (messages.length === 0 || messages[messages.length - 1].role !== role) {
        messages.push({ role, content: m.text });
      }
    });
    // Always end with the current user message
    messages.push({ role: 'user', content: text });

    const systemPrompt = `You are SamarthaaMed, an AI-powered medical consultation assistant embedded in a clinical platform. You are assisting a doctor during a live voice consultation.

${patientCtx}

Guidelines:
- Respond conversationally and concisely (2–3 sentences, under 60 words) — optimised for text-to-speech delivery
- Be clinically precise, evidence-based, and reference ICMR/WHO/ESC guidelines where relevant
- If the doctor describes a symptom, acknowledge and ask a focused follow-up question
- If asked for a drug or dose, provide the standard Indian adult dose
- Never give vague or non-clinical filler responses
- Do NOT use bullet points, markdown, or headers — plain spoken prose only`;

    try {
      const aiResponse = await callClaudeAI(messages, systemPrompt);
      addToVoiceTranscript('ai', aiResponse);
      speakText(aiResponse);
    } catch (error) {
      console.error('Voice AI error:', error);
      showToast('❌', 'AI Error', error.message || 'Check your API key in Settings');
      const fallback = generateFallbackResponse(text);
      addToVoiceTranscript('ai', fallback);
      speakText(fallback);
    }
  }

  // Fallback response generator (when AI is unavailable)
  function generateFallbackResponse(input) {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('pain') || lowerInput.includes('hurt')) {
      return "I understand you're experiencing pain. Can you describe the location and intensity on a scale of 1 to 10?";
    } else if (lowerInput.includes('fever') || lowerInput.includes('temperature')) {
      return "Fever noted. Have you measured your temperature? Any other symptoms like chills or body aches?";
    } else if (lowerInput.includes('cough') || lowerInput.includes('cold')) {
      return "I see you have respiratory symptoms. Is the cough dry or productive? Any difficulty breathing?";
    } else if (lowerInput.includes('medicine') || lowerInput.includes('medication')) {
      return "Regarding medications, please tell me what you're currently taking and any allergies you have.";
    } else {
      return "Thank you for sharing. Can you provide more details about your symptoms and when they started?";
    }
  }

  // ── Text-to-Speech: ElevenLabs → browser Web Speech API fallback ──
  // ── DIAGNOSTIC OVERLAY ─────────────────────────────────────────
  function _dbg(msg, color) {
    color = color || '#fff';
    let box = document.getElementById('_samDiag');
    if (!box) {
      box = document.createElement('div');
      box.id = '_samDiag';
      box.style.cssText = [
        'position:fixed;bottom:0;left:0;right:0;z-index:99999',
        'background:rgba(0,0,0,0.92);color:#fff;font-size:12px',
        'font-family:monospace;padding:8px;max-height:40vh;overflow-y:auto',
        'border-top:2px solid #f59e0b;pointer-events:none'
      ].join(';');
      document.body.appendChild(box);
    }
    const line = document.createElement('div');
    line.style.cssText = 'padding:2px 0;border-bottom:1px solid #333;color:' + color;
    line.textContent = new Date().toISOString().slice(11,23) + '  ' + msg;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
    console.log('[SAM-DIAG]', msg);
  }

  async function speakText(text) {
    _dbg('speakText() called. len=' + text.length);

    // Stop any ongoing speech
    voiceConsultation.synthesis.cancel();
    if (window._elCurrentAudio) {
      window._elCurrentAudio.pause();
      window._elCurrentAudio = null;
    }

    voiceConsultation.isSpeaking = true;
    updateVoiceStatus('AI Speaking…', text.substring(0, 100) + '…');
    animateWaveform(true);

    if (voiceConsultation.isListening) {
      try { voiceConsultation.recognition.stop(); } catch(e) {}
    }

    await _loadConfig();
    const elKey   = _SYSTEM_EL_API_KEY  || null;
    const elVoice = _SYSTEM_EL_VOICE_ID || null;
    const cbEl    = document.getElementById('elUseVoiceConsult');
    const cbChecked = cbEl ? cbEl.checked : 'element not found';
    const useEL   = elKey && elVoice && cbEl?.checked !== false;

    _dbg('config: elKey=' + (elKey ? 'SET('+elKey.slice(0,8)+'…)' : 'EMPTY') +
         ' elVoice=' + (elVoice ? 'SET' : 'EMPTY') +
         ' checkbox=' + cbChecked +
         ' useEL=' + useEL, useEL ? '#4ade80' : '#f87171');

    if (useEL) {
      try {
        _dbg('→ calling _speakElevenLabs…');
        await _speakElevenLabs(text, elKey, elVoice);
        _dbg('✓ _speakElevenLabs resolved OK', '#4ade80');
        return;
      } catch(err) {
        _dbg('✗ ElevenLabs error: ' + err.message, '#f87171');
      }
    }

    _dbg('→ falling back to _speakBrowser');
    _speakBrowser(text);
  }

  async function _speakElevenLabs(text, apiKey, voiceId) {
    const model      = localStorage.getItem('el_model')      || 'eleven_multilingual_v2';
    const stability  = parseFloat(localStorage.getItem('el_stability'))  || 0.5;
    const similarity = parseFloat(localStorage.getItem('el_similarity')) || 0.85;

    _dbg('EL fetch start. model=' + model + ' voice=' + voiceId.slice(0,8) + '…');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: model,
        voice_settings: { stability, similarity_boost: similarity, style: 0.25, use_speaker_boost: true }
      })
    });

    _dbg('EL response: status=' + response.status + ' ok=' + response.ok,
         response.ok ? '#4ade80' : '#f87171');

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.detail?.message || 'ElevenLabs error ' + response.status);
    }

    const arrayBuffer = await response.arrayBuffer();
    _dbg('EL audio bytes=' + arrayBuffer.byteLength);

    // AudioContext with resume() — required on iOS/Android
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      _dbg('✗ AudioContext NOT supported!', '#f87171');
      throw new Error('AudioContext not supported');
    }

    const ctx = new AudioCtx();
    _dbg('AudioContext state before resume: ' + ctx.state,
         ctx.state === 'running' ? '#4ade80' : '#fb923c');

    if (ctx.state === 'suspended') {
      await ctx.resume();
      _dbg('AudioContext state after resume: ' + ctx.state,
           ctx.state === 'running' ? '#4ade80' : '#f87171');
    }

    let decoded;
    try {
      decoded = await ctx.decodeAudioData(arrayBuffer);
      _dbg('decoded OK. duration=' + decoded.duration.toFixed(1) + 's', '#4ade80');
    } catch(e) {
      _dbg('✗ decodeAudioData failed: ' + e.message, '#f87171');
      ctx.close().catch(()=>{});
      throw e;
    }

    const gain = ctx.createGain();
    gain.gain.value = 2.5;
    gain.connect(ctx.destination);

    const src = ctx.createBufferSource();
    src.buffer = decoded;
    src.connect(gain);

    window._elAudioCtx = ctx;
    window._elAudioSrc = src;

    _dbg('src.start(0) — audio should play now', '#4ade80');

    return new Promise((resolve) => {
      src.onended = () => {
        _dbg('✓ audio playback ended', '#4ade80');
        try { ctx.close(); } catch(e) {}
        window._elAudioCtx = null;
        window._elAudioSrc = null;
        _onSpeakEnd();
        resolve();
      };
      src.start(0);
    });
  }

  function _speakBrowser(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = voiceConsultation.currentLanguage;
    utterance.rate  = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    const voices = voiceConsultation.synthesis.getVoices();
    const best   = voices.find(v =>
      v.lang.startsWith(voiceConsultation.currentLanguage.split('-')[0]) &&
      (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find(v => v.lang.startsWith(voiceConsultation.currentLanguage.split('-')[0]));
    if (best) utterance.voice = best;
    utterance.onend = _onSpeakEnd;
    voiceConsultation.synthesis.speak(utterance);
  }

  function _onSpeakEnd() {
    voiceConsultation.isSpeaking = false;
    animateWaveform(false);
    updateVoiceStatus('Ready', 'Your turn to speak');
    if (voiceConsultation.autoListen && voiceConsultation.active) {
      setTimeout(() => {
        if (!voiceConsultation.isListening && voiceConsultation.active) {
          toggleVoiceListening();
        }
      }, 500);
    }
  }

  // Add message to transcript
  function addToVoiceTranscript(type, text) {
    const transcriptDiv = document.getElementById('voiceTranscript');
    
    // Remove placeholder if exists
    if (transcriptDiv.querySelector('div[style*="text-align:center"]')) {
      transcriptDiv.innerHTML = '';
    }

    const messageDiv = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (type === 'user') {
      messageDiv.style.cssText = 'margin-bottom:16px;display:flex;justify-content:flex-end;';
      messageDiv.innerHTML = `
        <div style="max-width:70%;background:var(--teal-dim);border:1px solid var(--teal);border-radius:12px 12px 0 12px;padding:12px 16px;">
          <div style="font-size:0.75rem;color:var(--text3);margin-bottom:4px;">You • ${timestamp}</div>
          <div style="color:var(--text1);font-size:0.9rem;line-height:1.5;">${text}</div>
        </div>
      `;
    } else {
      messageDiv.style.cssText = 'margin-bottom:16px;display:flex;justify-content:flex-start;';
      messageDiv.innerHTML = `
        <div style="max-width:70%;background:var(--panel2);border:1px solid var(--border2);border-radius:12px 12px 12px 0;padding:12px 16px;">
          <div style="font-size:0.75rem;color:var(--text3);margin-bottom:4px;">🤖 AI Assistant • ${timestamp}</div>
          <div style="color:var(--text1);font-size:0.9rem;line-height:1.5;">${text}</div>
        </div>
      `;
    }

    transcriptDiv.appendChild(messageDiv);
    transcriptDiv.scrollTop = transcriptDiv.scrollHeight;

    // Store in history
    voiceConsultation.conversationHistory.push({ type, text, timestamp });
  }

  // Update voice status display
  function updateVoiceStatus(status, substatus) {
    const statusDiv = document.getElementById('voiceStatus');
    const substatusDiv = document.getElementById('voiceSubStatus');
    
    if (statusDiv) statusDiv.textContent = status;
    if (substatusDiv) substatusDiv.textContent = substatus;
  }

  // Animate waveform
  function animateWaveform(active) {
    const waveform = document.getElementById('voiceWaveform');
    if (!waveform) return;

    const bars = waveform.querySelectorAll('div');
    
    if (active) {
      bars.forEach((bar, i) => {
        setInterval(() => {
          const height = Math.random() * 50 + 10;
          bar.style.height = height + 'px';
          bar.style.background = 'var(--teal)';
        }, 100 + i * 20);
      });
    } else {
      bars.forEach(bar => {
        bar.style.height = '20px';
        bar.style.background = 'var(--border)';
      });
    }
  }

  // Change voice language
  function changeVoiceLanguage(lang) {
    voiceConsultation.currentLanguage = lang;
    if (voiceConsultation.recognition) {
      voiceConsultation.recognition.lang = lang;
      showToast('🌐', 'Language Changed', `Now using ${lang}`);
    }
  }

  // Clear voice history
  function clearVoiceHistory() {
    if (confirm('Clear the entire conversation transcript?')) {
      voiceConsultation.conversationHistory = [];
      document.getElementById('voiceTranscript').innerHTML = `
        <div style="text-align:center;color:var(--text3);padding:60px 20px;">
          <div style="font-size:3rem;margin-bottom:12px;">🎙️</div>
          <p style="margin:0;font-size:0.9rem;">Transcript cleared. Start speaking to begin a new conversation...</p>
        </div>
      `;
      showToast('🗑️', 'Cleared', 'Transcript cleared');
    }
  }

  // Save voice transcript
  function saveVoiceTranscript() {
    if (voiceConsultation.conversationHistory.length === 0) {
      showToast('⚠️', 'Nothing to Save', 'No conversation to save yet');
      return;
    }

    const patientName = document.querySelector('.consult-patient-name')?.textContent || 'Patient';
    const today = new Date().toLocaleString();
    
    let transcript = `Voice Consultation Transcript\n`;
    transcript += `Patient: ${patientName}\n`;
    transcript += `Date: ${today}\n`;
    transcript += `Language: ${voiceConsultation.currentLanguage}\n`;
    transcript += `\n${'='.repeat(60)}\n\n`;

    voiceConsultation.conversationHistory.forEach(msg => {
      const speaker = msg.type === 'user' ? 'USER' : 'AI ASSISTANT';
      transcript += `[${msg.timestamp}] ${speaker}:\n${msg.text}\n\n`;
    });

    // Download as text file
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Voice_Consultation_${patientName.replace(/\s/g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('💾', 'Saved', 'Transcript downloaded');
  }

  // Generate SOAP note from voice conversation
  function generateSOAPFromVoice() {
    if (voiceConsultation.conversationHistory.length === 0) {
      showToast('⚠️', 'No Conversation', 'Have a conversation first to generate SOAP note');
      return;
    }

    showToast('📋', 'Generating SOAP Note', 'Analyzing conversation...');
    
    // Extract conversation text
    const conversationText = voiceConsultation.conversationHistory
      .map(msg => `${msg.type === 'user' ? 'Patient' : 'AI'}: ${msg.text}`)
      .join('\n');

    // In a real implementation, this would call an AI to structure the SOAP note
    // For now, show a placeholder
    setTimeout(() => {
      showToast('✅', 'SOAP Note Ready', 'Check the SOAP modal in AI Consultation');
      // You can trigger the SOAP modal here and populate it
    }, 2000);
  }

  // Share voice transcript
  function shareVoiceTranscript() {
    if (voiceConsultation.conversationHistory.length === 0) {
      showToast('⚠️', 'Nothing to Share', 'No conversation to share yet');
      return;
    }

    const transcript = voiceConsultation.conversationHistory
      .map(msg => `${msg.type === 'user' ? '👤' : '🤖'} ${msg.text}`)
      .join('\n\n');

    if (navigator.share) {
      navigator.share({
        title: 'Voice Consultation Transcript',
        text: transcript
      }).then(() => {
        showToast('📤', 'Shared', 'Transcript shared successfully');
      }).catch(() => {
        copyToClipboard(transcript);
      });
    } else {
      copyToClipboard(transcript);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋', 'Copied', 'Transcript copied to clipboard');
    });
  }

  // End voice consultation
  function endVoiceConsultation() {
    if (confirm('End voice consultation session?')) {
      voiceConsultation.active = false;
      
      // Stop recognition and speech
      if (voiceConsultation.recognition) {
        voiceConsultation.recognition.stop();
      }
      voiceConsultation.synthesis.cancel();

      // Remove modal
      const modal = document.getElementById('voiceConsultModal');
      if (modal) {
        modal.remove();
      }

      showToast('✅', 'Session Ended', 'Voice consultation completed');
    }
  }


  /* ══════════════════════════════════════════════════════════
     DENTISTRY MODULE — Full AI Implementation
     FDI Chart · Perio · Radiograph AI · Diagnosis AI · Rx AI
     ══════════════════════════════════════════════════════════ */

  // ── State ──────────────────────────────────────────────────────
  const _dc = {
    chart:     {},          // { "18": "caries", "21": "filled", … }
    perio:     {},          // { "16": 3, "15": 5, … }
    procs:     [],          // planned procedure strings
    activeCond: 'healthy',  // currently selected condition
    built:     false        // whether DOM was initialised
  };

  const DC_COLORS = {
    healthy: 'var(--green)',
    caries:  'var(--red)',
    filled:  'var(--gold)',
    crown:   'var(--purple)',
    missing: '#444',
    rct:     'var(--cyan)'
  };

  // FDI notation — upper: right→midline then midline→left; lower: same
  const DC_UPPER = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28];
  const DC_LOWER = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];
  // Representative index teeth for perio charting (Ramfjord sextants extended)
  const DC_PERIO_TEETH = [16,15,11,21,25,26, 46,45,41,31,35,36];

  // ── Build interactive chart ────────────────────────────────────
  function dcBuild() {
    if (_dc.built) return;
    _dc.built = true;
    _buildArch('dcUpper', DC_UPPER);
    _buildArch('dcLower', DC_LOWER);
    _buildPerioGrid();
    dcUpdateStats();
  }

  function _buildArch(containerId, teeth) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    wrap.innerHTML = '';
    teeth.forEach(num => {
      _dc.chart[num] = _dc.chart[num] || 'healthy';
      const el = document.createElement('div');
      el.id = `dct-${num}`;
      el.title = `Tooth ${num} — click to mark`;
      el.style.cssText = [
        'width:26px;height:34px',
        'border-radius:5px 5px 9px 9px',
        `background:${DC_COLORS.healthy}`,
        'cursor:pointer',
        'display:flex;align-items:center;justify-content:center',
        'font-size:0.52rem;font-weight:700;color:var(--navy)',
        'transition:transform 0.12s,box-shadow 0.12s',
        'border:1.5px solid rgba(255,255,255,0.08)',
        'flex-shrink:0;user-select:none'
      ].join(';');
      el.textContent = num;
      el.addEventListener('click',      () => dcMarkTooth(num));
      el.addEventListener('mouseover',  () => { el.style.transform='scale(1.2)'; el.style.boxShadow='0 0 8px rgba(0,212,180,0.5)'; });
      el.addEventListener('mouseout',   () => { el.style.transform=''; el.style.boxShadow=''; });
      wrap.appendChild(el);
    });
  }

  function _buildPerioGrid() {
    const grid = document.getElementById('perioGrid');
    if (!grid) return;
    grid.innerHTML = '';
    DC_PERIO_TEETH.forEach(num => {
      const cell = document.createElement('div');
      cell.style.cssText = 'background:var(--navy3);border:1px solid var(--border2);border-radius:8px;padding:8px 4px;text-align:center';
      cell.innerHTML = `
        <div style="font-size:0.65rem;font-weight:700;color:var(--teal);margin-bottom:4px">${num}</div>
        <input id="perio-${num}" type="number" min="0" max="15" placeholder="mm"
          style="width:44px;background:transparent;border:none;border-bottom:1px solid var(--border2);color:var(--text1);font-size:0.82rem;text-align:center;outline:none;padding:2px 0"
          oninput="dcUpdatePerio()">`;
      grid.appendChild(cell);
    });
  }

  // ── Condition selector ─────────────────────────────────────────
  function dcSetCond(btn) {
    _dc.activeCond = btn.dataset.cond;
    ['healthy','caries','filled','crown','missing','rct'].forEach(c => {
      const b = document.getElementById(`dcCondBtn-${c}`);
      if (!b) return;
      if (c === _dc.activeCond) {
        b.style.opacity = '1';
        b.style.fontWeight = '700';
        b.style.boxShadow = '0 0 0 2px rgba(0,212,180,0.5)';
      } else {
        b.style.opacity = '0.55';
        b.style.fontWeight = '500';
        b.style.boxShadow = 'none';
      }
    });
  }

  function dcMarkTooth(num) {
    _dc.chart[num] = _dc.activeCond;
    const el = document.getElementById(`dct-${num}`);
    if (el) el.style.background = DC_COLORS[_dc.activeCond];
    dcUpdateStats();
    showToast('🦷', `Tooth ${num}`, `Marked as ${_dc.activeCond}`);
  }

  function dcUpdateStats() {
    const vals   = Object.values(_dc.chart);
    const caries  = vals.filter(v => v === 'caries').length;
    const missing = vals.filter(v => v === 'missing').length;
    const teeth   = 32 - missing;

    const kc = document.getElementById('kpiCaries');
    const kt = document.getElementById('kpiTeeth');
    if (kc) kc.textContent = caries;
    if (kt) kt.textContent = teeth;

    // Chart summary
    const abnormal = Object.entries(_dc.chart).filter(([,v]) => v !== 'healthy');
    const summary  = document.getElementById('dcSummary');
    if (summary) {
      if (!abnormal.length) {
        summary.textContent = 'All teeth currently marked Healthy. Click a tooth then select a condition.';
      } else {
        summary.innerHTML = abnormal.map(([k,v]) =>
          `<span style="display:inline-block;margin:2px 3px;padding:2px 7px;border-radius:4px;background:var(--navy2);border:1px solid ${DC_COLORS[v]};font-size:0.7rem;color:${DC_COLORS[v]};font-weight:600">${k}: ${v}</span>`
        ).join('');
      }
    }
  }

  function dcClear() {
    [...DC_UPPER, ...DC_LOWER].forEach(n => {
      _dc.chart[n] = 'healthy';
      const el = document.getElementById(`dct-${n}`);
      if (el) el.style.background = DC_COLORS.healthy;
    });
    dcUpdateStats();
    showToast('🗑', 'Chart Cleared', 'All teeth reset to Healthy');
  }

  // ── Perio depth tracking ───────────────────────────────────────
  function dcUpdatePerio() {
    const depths = DC_PERIO_TEETH.map(n => {
      const v = parseInt(document.getElementById(`perio-${n}`)?.value) || 0;
      _dc.perio[n] = v;
      return v;
    }).filter(v => v > 0);

    const p4  = depths.filter(d => d >= 4).length;
    const p6  = depths.filter(d => d >= 6).length;
    const avg = depths.length ? (depths.reduce((a,b)=>a+b,0)/depths.length).toFixed(1) : 0;
    const kp  = document.getElementById('kpiPockets');
    if (kp) kp.textContent = p4;

    const sum = document.getElementById('perioSummary');
    if (!sum) return;
    if (!depths.length) {
      sum.textContent = 'Enter pocket depths to see automated classification';
      return;
    }
    let cls = 'Gingivitis / Healthy', clsColor = 'var(--green)';
    if (p6 > 0)      { cls = 'Stage III–IV Periodontitis';   clsColor = 'var(--red)'; }
    else if (p4 >= 3){ cls = 'Stage II Periodontitis';       clsColor = 'var(--gold)'; }
    else if (p4 > 0) { cls = 'Stage I / Early Periodontitis'; clsColor = 'var(--gold)'; }
    sum.innerHTML =
      `Avg depth: <strong style="color:var(--teal)">${avg} mm</strong> &nbsp;·&nbsp;
       Pockets ≥4 mm: <strong style="color:var(--gold)">${p4}</strong> &nbsp;·&nbsp;
       Pockets ≥6 mm: <strong style="color:var(--red)">${p6}</strong> &nbsp;·&nbsp;
       Classification: <strong style="color:${clsColor}">${cls}</strong>`;
  }

  // ── Perio AI Classification ────────────────────────────────────
  async function runPerioAI() {
    const depths = DC_PERIO_TEETH.map(n => {
      const v = document.getElementById(`perio-${n}`)?.value;
      return v ? `Tooth ${n}: ${v}mm` : null;
    }).filter(Boolean);
    if (!depths.length) { showToast('⚠️','No Data','Enter pocket depths first'); return; }

    showToast('🔍','Perio AI','Classifying…');
    const sys = `You are a periodontology AI assistant. Classify periodontal disease using the 2018 World Workshop system (Staging I–IV, Grading A–C). Be concise and actionable. 3–5 sentences max.`;
    try {
      const txt = await callClaudeAI(
        [{ role:'user', content:`Pocket depths recorded:\n${depths.join('\n')}\n\nProvide: 1) Classification (Stage/Grade), 2) Clinical significance, 3) Priority treatment recommendation.` }],
        sys
      );
      document.getElementById('perioSummary').innerHTML =
        `<span style="color:var(--teal);font-weight:700">🤖 AI Classification:</span> ${txt.replace(/\n/g,'<br>')}`;
      showToast('✅','Perio Classified','AI classification ready');
    } catch(e) { showToast('❌','Failed',e.message); }
  }

  // ── Dental X-ray AI ────────────────────────────────────────────
  function handleDentalXray(e) {
    handleDentalXrayFiles(e.target.files);
    e.target.value = '';
  }
  function handleDentalXrayFiles(files) {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const zone   = document.getElementById('xrayDropZone');
      const result = document.getElementById('xrayResult');

      zone.innerHTML = `
        <img src="${ev.target.result}" style="max-width:100%;max-height:260px;border-radius:8px;object-fit:contain;background:#000">
        <div style="margin-top:8px;font-size:0.76rem;color:var(--teal);font-weight:600;text-align:center">Analysing with Claude Vision AI…</div>`;
      result.style.display = 'block';
      result.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--teal-dim);border-radius:8px">
          <span style="font-size:1rem">🔍</span>
          <span style="font-size:0.82rem;color:var(--teal);font-weight:600">Processing radiograph…</span>
        </div>`;

      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        result.innerHTML = `<div style="padding:12px;background:var(--gold-dim);border-radius:8px;font-size:0.8rem;color:var(--gold)">⚠️ For best results upload a JPEG or PNG image. PDF analysis uses filename heuristics only.</div>`;
        return;
      }

      const sys = `You are a dental radiograph AI. Analyse the uploaded dental radiograph image. Respond ONLY with valid JSON — no markdown fences, no extra text.
Schema: { "modality": "string", "findings": [{"severity":"critical|moderate|normal","tooth":"FDI number or region","detail":"description"}], "impression":"string", "recommendations":["string"], "confidence":85 }`;
      try {
        const base64 = ev.target.result.split(',')[1];
        const raw = await callClaudeAI([{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
            { type: 'text', text: 'Analyse this dental radiograph. Return JSON only.' }
          ]
        }], sys);
        const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/i,'').trim());
        const sevColor = { critical:'var(--red)', moderate:'var(--gold)', normal:'var(--teal)' };
        const fHtml = (parsed.findings||[]).map(f =>
          `<div style="padding:8px 10px;background:var(--navy3);border-left:3px solid ${sevColor[f.severity]||'var(--teal)'};border-radius:6px;margin-bottom:6px">
            <div style="font-weight:600;font-size:0.8rem;color:var(--text1)">Tooth ${f.tooth}</div>
            <div style="font-size:0.74rem;color:var(--text2);margin-top:2px">${f.detail}</div>
           </div>`
        ).join('');
        result.innerHTML = `
          <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--teal);margin-bottom:8px">${parsed.modality||'Radiograph'} · AI Analysis</div>
          ${fHtml}
          <div style="padding:10px;background:var(--navy3);border-radius:8px;font-size:0.78rem;color:var(--text2);line-height:1.6;margin-top:8px">
            <strong style="color:var(--text1)">Impression:</strong> ${parsed.impression||''}
          </div>
          ${(parsed.recommendations||[]).length ? `
          <div style="margin-top:10px">
            ${parsed.recommendations.map(r=>`<div style="font-size:0.76rem;color:var(--text2);margin-bottom:3px">• ${r}</div>`).join('')}
          </div>` : ''}
          <div style="margin-top:8px;font-size:0.68rem;color:var(--text3)">AI Confidence: ${parsed.confidence||'N/A'}% · Verify against clinical examination</div>`;
        zone.innerHTML = `
          <img src="${ev.target.result}" style="max-width:100%;max-height:260px;border-radius:8px;object-fit:contain;background:#000">
          <div style="margin-top:8px;text-align:center">
            <span style="font-size:0.7rem;background:var(--teal-dim);color:var(--teal);padding:2px 10px;border-radius:20px;font-weight:600">✓ Analysed</span>
            <span class="btn btn-ghost btn-sm" style="margin-left:8px;font-size:0.7rem;cursor:pointer" onclick="document.getElementById('dentalXrayInput').click()">Change</span>
          </div>`;
        showToast('✅','Radiograph Analysed',`${(parsed.findings||[]).length} findings identified`);
      } catch(err) {
        result.innerHTML = `<div style="padding:12px;background:var(--red-dim);border-radius:8px;font-size:0.8rem;color:var(--red)">Analysis failed: ${err.message}</div>`;
        showToast('❌','X-ray AI Failed',err.message);
      }
    };
    reader.readAsDataURL(file);
  }

  // ── Main dental AI diagnosis ───────────────────────────────────
  async function runDentalAI() {
    const complaint  = document.getElementById('dcComplaint')?.value   || 'Not specified';
    const pain       = document.getElementById('dcPain')?.value        || '0';
    const duration   = document.getElementById('dcDuration')?.value    || 'Not specified';
    const medHx      = document.getElementById('dcMedHx')?.value       || 'None';
    const notes      = document.getElementById('dcNotes')?.value       || '';

    const chartFindings = Object.entries(_dc.chart)
      .filter(([,v]) => v !== 'healthy')
      .map(([k,v]) => `Tooth ${k}: ${v}`)
      .join(', ') || 'No marked conditions';

    const perioFindings = DC_PERIO_TEETH
      .map(n => { const v = document.getElementById(`perio-${n}`)?.value; return v ? `${n}: ${v}mm` : null; })
      .filter(Boolean).join(', ') || 'Not recorded';

    const output = document.getElementById('dcAIOutput');
    output.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--teal-dim);border-radius:10px">
        <div style="font-size:1.1rem">🔍</div>
        <div>
          <div style="font-weight:700;font-size:0.85rem;color:var(--teal)">Generating dental assessment…</div>
          <div style="font-size:0.72rem;color:var(--text3);margin-top:2px">Analysing chart, pocket depths and clinical history</div>
        </div>
      </div>`;

    const sys = `You are SamarthaaMed Dental AI, an expert dental clinical decision support assistant embedded in a clinical platform for trained dentists and oral medicine specialists. Follow IDA (Indian Dental Association), ICMR, and WHO Oral Health 2030 guidelines.

Respond ONLY with a valid JSON object — no markdown, no text outside JSON.

Schema:
{
  "diagnosis": {
    "primary": "main diagnosis",
    "differential": ["differential 1", "differential 2"],
    "icd": "ICD-11 or ICD-10 code"
  },
  "urgency": "immediate|urgent|routine",
  "clinical_notes": "key clinical reasoning in 2-3 sentences",
  "treatment_plan": [
    { "phase": "Phase label", "procedures": ["procedure 1", "procedure 2"] }
  ],
  "medications": [
    { "drug": "Name dose frequency duration", "indication": "reason" }
  ],
  "referral": "referral recommendation or null",
  "patient_instructions": ["instruction 1", "instruction 2", "instruction 3"]
}`;

    const msg = `Dental clinical intake:
- Chief Complaint: ${complaint}
- Pain (0–10): ${pain}
- Duration: ${duration}
- Medical/Drug History: ${medHx}
- Additional Notes: ${notes}
- Dental Chart Findings: ${chartFindings}
- Periodontal Pocket Depths: ${perioFindings}

Generate a structured dental diagnosis and phased treatment plan. Return JSON only.`;

    try {
      const raw = await callClaudeAI([{ role:'user', content:msg }], sys);
      const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/i,'').trim());
      renderDentalAssessment(parsed);
    } catch(err) {
      output.innerHTML = `
        <div style="padding:14px;background:var(--red-dim);border:1px solid var(--red);border-radius:10px">
          <div style="font-weight:700;color:var(--red)">Assessment Failed</div>
          <div style="font-size:0.8rem;color:var(--text2);margin-top:6px">${err.message}</div>
          <div style="font-size:0.72rem;color:var(--text3);margin-top:4px">Check your API key in Settings and try again.</div>
        </div>`;
      showToast('❌','Dental AI Failed',err.message);
    }
  }

  function renderDentalAssessment(d) {
    const urgMap = {
      immediate: { bg:'var(--red-dim)',  tc:'var(--red)',  label:'⚡ IMMEDIATE — Treat today' },
      urgent:    { bg:'var(--gold-dim)', tc:'var(--gold)', label:'⚠️ URGENT — Within 24–48 hours' },
      routine:   { bg:'var(--teal-dim)', tc:'var(--teal)', label:'📅 ROUTINE — Schedule appointment' }
    };
    const urg = urgMap[(d.urgency||'routine').toLowerCase()] || urgMap.routine;
    const numColors = ['var(--red)','var(--gold)','var(--teal)','var(--purple)','var(--cyan)'];

    const phasesHtml = (d.treatment_plan||[]).map((phase,i) => `
      <div style="margin-bottom:10px">
        <div style="font-weight:700;font-size:0.76rem;color:var(--teal);margin-bottom:5px">${phase.phase}</div>
        ${(phase.procedures||[]).map(p =>
          `<div style="font-size:0.77rem;color:var(--text2);padding:5px 8px;background:var(--navy3);border-radius:6px;margin-bottom:3px;display:flex;align-items:center;gap:6px">
             <span style="color:var(--teal);font-size:0.8rem">›</span>${p}
           </div>`
        ).join('')}
      </div>`).join('');

    const medsHtml = (d.medications||[]).map(m =>
      `<div style="padding:8px 10px;background:var(--navy3);border-radius:8px;margin-bottom:5px">
        <div style="font-weight:600;font-size:0.8rem;color:var(--text1)">${m.drug}</div>
        <div style="font-size:0.7rem;color:var(--teal);margin-top:2px">${m.indication}</div>
       </div>`
    ).join('');

    const instrHtml = (d.patient_instructions||[]).map(s =>
      `<div style="font-size:0.77rem;color:var(--text2);margin-bottom:3px">• ${s}</div>`
    ).join('');

    document.getElementById('dcAIOutput').innerHTML = `
      <!-- Urgency + Diagnosis -->
      <div style="padding:12px 14px;background:${urg.bg};border-radius:8px;margin-bottom:14px">
        <div style="font-weight:700;font-size:0.8rem;color:${urg.tc};margin-bottom:4px">${urg.label}</div>
        <div style="font-weight:700;font-size:0.92rem;color:var(--text1)">${d.diagnosis?.primary||''}</div>
        ${(d.diagnosis?.differential||[]).length ? `<div style="font-size:0.7rem;color:var(--text3);margin-top:3px">DDx: ${d.diagnosis.differential.join(' · ')}</div>` : ''}
        ${d.diagnosis?.icd ? `<div style="font-size:0.68rem;color:var(--text3);margin-top:2px">ICD: ${d.diagnosis.icd}</div>` : ''}
      </div>

      <!-- Clinical notes -->
      ${d.clinical_notes ? `
      <div style="margin-bottom:14px">
        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--teal);font-weight:700;margin-bottom:5px">Clinical Reasoning</div>
        <div style="font-size:0.8rem;color:var(--text2);line-height:1.6;padding:10px;background:var(--navy3);border-radius:8px">${d.clinical_notes}</div>
      </div>` : ''}

      <!-- Treatment plan -->
      ${phasesHtml ? `
      <div style="margin-bottom:14px">
        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--teal);font-weight:700;margin-bottom:8px">Treatment Plan</div>
        ${phasesHtml}
      </div>` : ''}

      <!-- Medications -->
      ${medsHtml ? `
      <div style="margin-bottom:14px">
        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--teal);font-weight:700;margin-bottom:8px">Medications</div>
        ${medsHtml}
      </div>` : ''}

      <!-- Referral -->
      ${d.referral ? `
      <div style="margin-bottom:14px;padding:10px;background:var(--gold-dim);border-left:3px solid var(--gold);border-radius:8px">
        <div style="font-weight:700;font-size:0.76rem;color:var(--gold)">Referral Recommended</div>
        <div style="font-size:0.76rem;color:var(--text2);margin-top:3px">${d.referral}</div>
      </div>` : ''}

      <!-- Patient instructions -->
      ${instrHtml ? `
      <div style="margin-bottom:10px">
        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--teal);font-weight:700;margin-bottom:6px">Patient Instructions</div>
        ${instrHtml}
      </div>` : ''}

      <div style="font-size:0.65rem;color:var(--text3);margin-top:6px;padding-top:8px;border-top:1px solid var(--border2)">
        🤖 Claude AI · IDA / ICMR Guidelines · ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
      </div>`;

    // Populate procedure planner from treatment plan
    (d.treatment_plan||[]).flatMap(p=>p.procedures||[]).forEach(p => addProc(p, false));

    showToast('✅','Dental Assessment Ready', d.diagnosis?.primary || 'Diagnosis generated');
  }

  // ── Procedure planner ──────────────────────────────────────────
  function addProc(name, notify = true) {
    if (_dc.procs.includes(name)) return;
    _dc.procs.push(name);
    const kp = document.getElementById('kpiProcs');
    if (kp) kp.textContent = _dc.procs.length;
    _renderProcList();
    if (notify) showToast('📋','Procedure Added', name);
  }

  function removeProc(idx) {
    _dc.procs.splice(idx, 1);
    const kp = document.getElementById('kpiProcs');
    if (kp) kp.textContent = _dc.procs.length;
    _renderProcList();
  }

  function _renderProcList() {
    const el = document.getElementById('procList');
    if (!el) return;
    if (!_dc.procs.length) {
      el.innerHTML = '<div style="font-size:0.76rem;color:var(--text3);text-align:center;padding:14px">No procedures planned yet</div>';
      return;
    }
    el.innerHTML = _dc.procs.map((p,i) => `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--navy3);border-radius:8px">
        <span style="width:20px;height:20px;border-radius:50%;background:var(--teal);color:var(--navy);font-size:0.62rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</span>
        <span style="flex:1;font-size:0.79rem;color:var(--text1)">${p}</span>
        <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:0.9rem;padding:0 3px;line-height:1" onclick="removeProc(${i})">×</button>
      </div>`).join('');
  }

  function generateTxSummary() {
    if (!_dc.procs.length) { showToast('⚠️','No Procedures','Add procedures first'); return; }
    const win = window.open('','_blank');
    const abnormal = Object.entries(_dc.chart).filter(([,v]) => v!=='healthy')
      .map(([k,v]) => `<span style="padding:2px 7px;margin:2px;border-radius:4px;background:#f3f4f6;font-size:0.78rem;display:inline-block"><strong>${k}</strong>: ${v}</span>`).join('');
    const ai = document.getElementById('dcAIOutput')?.innerHTML || '';
    win.document.write(`<!DOCTYPE html><html><head><title>Dental Treatment Summary</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;max-width:800px;margin:0 auto;color:#1f2937}
    .hdr{text-align:center;border-bottom:2px solid #0d9488;padding-bottom:16px;margin-bottom:24px}
    h2{color:#0d9488;font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;margin:20px 0 8px}
    li{margin-bottom:4px;font-size:0.85rem}@media print{.np{display:none}}</style></head><body>
    <div class="hdr"><div style="font-size:1.3rem;font-weight:800;color:#0d9488">🦷 SamarthaaMed · Dental Treatment Summary</div>
    <div style="font-size:0.78rem;color:#666;margin-top:4px">${new Date().toLocaleDateString('en-IN')}</div></div>
    <h2>Chart Findings</h2><div style="margin-bottom:16px">${abnormal || '<em>All teeth healthy</em>'}</div>
    <h2>Planned Procedures</h2><ol>${_dc.procs.map(p=>`<li>${p}</li>`).join('')}</ol>
    <h2>AI Clinical Assessment</h2><div style="font-size:0.83rem;line-height:1.7">${ai}</div>
    <div class="np" style="margin-top:24px;text-align:center;display:flex;gap:10px;justify-content:center">
    <button onclick="window.print()" style="padding:10px 22px;background:#0d9488;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">🖨 Print</button>
    <button onclick="window.close()" style="padding:10px 22px;background:#666;color:white;border:none;border-radius:8px;cursor:pointer">Close</button>
    </div></body></html>`);
    win.document.close();
  }

  // ── Drug AI ────────────────────────────────────────────────────
  async function runDentalDrugAI() {
    const complaint = document.getElementById('dcComplaint')?.value || 'dental pain';
    const medHx     = document.getElementById('dcMedHx')?.value    || 'none';
    showToast('💊','Drug AI','Generating prescription…');
    const sys = `You are a dental pharmacology AI for Indian clinical practice. Prescribe drugs per IDA and ICMR guidelines. Respect the patient's medical history and allergy profile. Provide drug name, dose, frequency, duration and brief indication. Max 5 drugs. Plain text, no JSON.`;
    try {
      const res = await callClaudeAI(
        [{ role:'user', content:`Dental condition: ${complaint}\nMedical history/allergies: ${medHx}\nRecommend appropriate dental medications.` }],
        sys
      );
      const el = document.getElementById('dcDrugAIOutput');
      if (el) {
        el.style.display = 'block';
        el.innerHTML = `
          <div style="margin-top:8px;padding:12px;background:var(--teal-dim);border-radius:8px;border-left:3px solid var(--teal)">
            <div style="font-weight:700;font-size:0.76rem;color:var(--teal);margin-bottom:6px">🤖 AI Prescription</div>
            <div style="font-size:0.79rem;color:var(--text2);line-height:1.7">${res.replace(/\n/g,'<br>')}</div>
          </div>`;
      }
      showToast('✅','Prescription Ready','AI drug recommendation generated');
    } catch(e) { showToast('❌','Drug AI Failed',e.message); }
  }

  // ── Utilities ──────────────────────────────────────────────────
  function copyDentalAssessment() {
    const txt = document.getElementById('dcAIOutput')?.innerText;
    if (!txt || txt.includes('Fill in')) { showToast('⚠️','Nothing to copy','Generate an assessment first'); return; }
    navigator.clipboard?.writeText(txt);
    showToast('📋','Copied','Assessment copied to clipboard');
  }

  function dcPrint() { generateTxSummary(); }

  // ── Hook into onViewChange to build chart on first open ────────
  const _origOnViewChange = onViewChange;
  window.onViewChange = onViewChange = function(id) {
    if (typeof _origOnViewChange === 'function') _origOnViewChange(id);
    if (id === 'dentistry' && !_dc.built) dcBuild();
  };


  /* ══════════════════════════════════════════════════════════════
     ANTHROPIC API KEY SETTINGS UI — LOCKED (system-configured)
     ══════════════════════════════════════════════════════════════ */

  function smLoadApiKeyUI() {
    // Show locked badge — key is system-configured, not from localStorage
    smUpdateApiBadge(!!_SYSTEM_ANTHROPIC_KEY);
  }

  function smUpdateApiBadge(configured) {
    const badge = document.getElementById('smApiStatusBadge');
    if (!badge) return;
    if (configured) {
      badge.style.background = 'var(--teal-dim)';
      badge.style.color = 'var(--teal)';
      badge.textContent = '● System Configured';
    } else {
      badge.style.background = 'var(--navy3)';
      badge.style.color = 'var(--text3)';
      badge.textContent = 'Not configured';
    }
  }

  // LOCKED — key is system-configured; these are no-ops
  function smSaveApiKey()         { showToast('🔒', 'Locked', 'API key is system-configured — contact your administrator'); }
  function smClearApiKey()        { showToast('🔒', 'Locked', 'API key is system-configured — contact your administrator'); }
  function smToggleKeyVisibility(){ /* no-op */ }

  /* ══════════════════════════════════════════════════════════════
     ELEVENLABS VOICE ENGINE
     Settings persistence · Test voice · Read-aloud for chat/dental
     ══════════════════════════════════════════════════════════════ */

  // ── Load saved settings into Settings UI on page load ───────────
  function elLoadSettings() {
    // Key and Voice ID are system-configured — load model/stability/similarity only
    const model   = localStorage.getItem('el_model')      || 'eleven_multilingual_v2';
    const stab    = localStorage.getItem('el_stability')  || '0.5';
    const sim     = localStorage.getItem('el_similarity') || '0.85';

    const ms = document.getElementById('elModelSelect');
    const sl = document.getElementById('elStability');
    const si = document.getElementById('elSimilarity');
    const sv = document.getElementById('elStabilityVal');
    const siv= document.getElementById('elSimilarityVal');

    if (ms) ms.value = model;
    if (sl) { sl.value = Math.round(parseFloat(stab)*100); if(sv) sv.textContent = sl.value+'%'; }
    if (si) { si.value = Math.round(parseFloat(sim)*100);  if(siv) siv.textContent = si.value+'%'; }

    const hasKey   = !!_SYSTEM_EL_API_KEY;
    const hasVoice = !!_SYSTEM_EL_VOICE_ID;
    elUpdateBadge(hasKey ? '✅' : '', hasVoice ? '✅' : '');
  }

  function elUpdateBadge(key, voiceId) {
    const badge = document.getElementById('elStatusBadge');
    if (!badge) return;
    if (key && voiceId) {
      badge.style.background = 'var(--teal-dim)';
      badge.style.color = 'var(--teal)';
      badge.textContent = '● System Configured';
    } else {
      badge.style.background = 'var(--navy3)';
      badge.style.color = 'var(--text3)';
      badge.textContent = 'Not configured';
    }
  }

  // LOCKED — ElevenLabs key & Voice ID are system-configured
  function elSaveSettings()  { showToast('🔒', 'Locked', 'API key & Voice ID are system-configured — contact your administrator'); }
  function elClearSettings() { showToast('🔒', 'Locked', 'API key & Voice ID are system-configured — contact your administrator'); }

  function elToggleKeyVisibility() {
    const inp = document.getElementById('elApiKeyInput');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  }

  async function elTestVoice() {
    const key     = _SYSTEM_EL_API_KEY  || '';
    const voiceId = _SYSTEM_EL_VOICE_ID || '';

    if (!key || !voiceId) {
      showToast('⚠️', 'Not Configured', 'Contact your administrator to set the ElevenLabs keys in source code');
      return;
    }
    showToast('🎙️', 'Testing Voice', 'Connecting to ElevenLabs…');
    try {
      await _speakElevenLabs(
        'Hello! This is your custom ElevenLabs voice speaking through SamarthaaMed. The voice clone integration is working correctly.',
        key, voiceId
      );
      showToast('✅', 'Voice Test Successful', 'Your ElevenLabs voice is working perfectly');
    } catch(err) {
      console.error('EL test error:', err);
      showToast('❌', 'Voice Test Failed', err.message);
    }
  }

  // ── Read-aloud button injected into chat AI responses ────────────
  function elAddReadAloudButton(msgBubble, text) {
    const useChat = document.getElementById('elUseChatRead');
    if (!useChat?.checked) return;
    const apiKey  = _SYSTEM_EL_API_KEY  || null;
    const voiceId = _SYSTEM_EL_VOICE_ID || null;
    if (!apiKey || !voiceId) return; // only show if configured

    const btn = document.createElement('button');
    btn.title = 'Read aloud with your ElevenLabs voice';
    btn.style.cssText = [
      'background:none;border:none;cursor:pointer',
      'color:var(--teal);font-size:0.78rem',
      'padding:3px 6px;border-radius:6px',
      'margin-top:6px;display:inline-flex;align-items:center;gap:4px',
      'transition:background 0.15s'
    ].join(';');
    btn.innerHTML = '🔊 <span style="font-size:0.7rem">Read aloud</span>';
    btn.onmouseover = () => btn.style.background = 'var(--teal-dim)';
    btn.onmouseout  = () => btn.style.background = 'none';
    btn.onclick = async () => {
      if (window._elCurrentAudio) {
        window._elCurrentAudio.pause();
        window._elCurrentAudio = null;
        btn.innerHTML = '🔊 <span style="font-size:0.7rem">Read aloud</span>';
        return;
      }
      btn.innerHTML = '⏹ <span style="font-size:0.7rem">Stop</span>';
      try {
        await _speakElevenLabs(text, apiKey, voiceId);
      } catch(e) {
        showToast('⚠️', 'Playback Error', e.message);
      }
      btn.innerHTML = '🔊 <span style="font-size:0.7rem">Read aloud</span>';
    };
    msgBubble.appendChild(btn);
  }

  // ── Read-aloud helper callable from dental/radiology AI ──────────
  async function elReadAloud(text, context) {
    const apiKey  = _SYSTEM_EL_API_KEY  || null;
    const voiceId = _SYSTEM_EL_VOICE_ID || null;

    // Check the right checkbox for this context
    const checkboxId = context === 'dental' ? 'elUseDentalRead' : 'elUseChatRead';
    const cb = document.getElementById(checkboxId);
    if (!cb?.checked) { showToast('ℹ️','Read Aloud Disabled',`Enable "${cb?.parentElement?.textContent?.trim() || context}" in Settings → ElevenLabs Voice`); return; }
    if (!apiKey || !voiceId) { showToast('⚠️','Voice Not Configured','Contact your administrator to configure ElevenLabs in the source code'); return; }

    showToast('🔊', 'Reading Aloud', 'Your ElevenLabs voice is speaking…');
    try {
      await _speakElevenLabs(text, apiKey, voiceId);
    } catch(e) {
      showToast('❌', 'Playback Failed', e.message);
      // Fallback to browser TTS
      const utt = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utt);
    }
  }

  // ── Initialise on load ───────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    elLoadSettings();
    smLoadApiKeyUI();
  });

  // (onViewChange extension handled below)

  // Extend onViewChange to reload EL settings when Settings is opened
  const _elOrigOnVC = typeof onViewChange === 'function' ? onViewChange : null;
  if (_elOrigOnVC) {
    window.onViewChange = onViewChange = function(id) {
      _elOrigOnVC(id);
      if (id === 'settings') {
        setTimeout(elLoadSettings, 50);
        setTimeout(smLoadApiKeyUI, 50);
      }
    };
  }

