/* Static beta: metadata filtering only. No AI calls or live SEC retrieval. */
(() => {
  'use strict';
  const categories = ['Compensation & Benefits','Financing & Credit','Employment & Separation','Commercial Supply & Services','Capital Projects & Facilities','Acquisitions & Divestitures','Technology & Intellectual Property','Strategic Partnerships','Other / Unclassified'];
  const years = [2021,2023,2025];
  const state = {records:[],release:null,industry:'',year:'',form:'',category:'',search:'',page:0,pageSize:10};
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const countBy = (rows,key) => rows.reduce((counts,row) => (counts[row[key]]=(counts[row[key]]||0)+1,counts),{});
  const sourceUrl = value => {try {const url=new URL(value);return url.protocol==='https:'&&url.hostname==='www.sec.gov'&&url.pathname.startsWith('/Archives/edgar/data/')?url.href:null;}catch{return null;}};
  const friendlyDate = iso => new Date(iso+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
  function selection(){const q=state.search.trim().toLocaleLowerCase();return state.records.filter(r => (!state.industry||r.industry===state.industry)&&(!state.year||r.filing_year===Number(state.year))&&(!state.form||r.filing_form===state.form)&&(!state.category||r.primary_category===state.category)&&(!q||[r.company,r.document_title,r.classification_reason].join(' ').toLocaleLowerCase().includes(q)));}
  function setOptions(id,values){const select=$(id);values.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;select.append(option);});}
  function render(){
    const rows=selection(),counts=countBy(rows,'primary_category'),yearCounts=countBy(rows,'filing_year');
    $('metric-records').textContent=rows.length;
    $('metric-issuers').textContent=new Set(rows.map(r=>r.cik)).size;
    $('metric-categorized').textContent=rows.length-(counts['Other / Unclassified']||0);
    $('metric-review').textContent=rows.filter(r=>r.confidence==='medium').length;
    $('selection-caption').textContent=`${rows.length} of ${state.records.length} exhibit records · ${state.industry||'All five industries'} · ${state.year||'2021, 2023 & 2025'} · ${state.form||'All filing forms'}${state.category?' · '+state.category:''}${state.search.trim()?' · Search: '+state.search.trim():''}`;
    const ordered=[...categories].sort((a,b)=>(counts[b]||0)-(counts[a]||0));
    $('category-chart').innerHTML=ordered.map(category=>{const count=counts[category]||0;const percentage=rows.length?Math.round(count/rows.length*100):0;return `<button type="button" class="category-row" data-category="${esc(category)}" aria-pressed="${state.category===category}" aria-label="${esc(category)}: ${count} exhibits, ${percentage} percent of selection. ${state.category===category?'Clear this category filter':'Filter to this category'}"><span class="bar-caption"><span>${esc(category)}</span><span class="bar-number">${count} · ${percentage}%</span></span><span class="bar-track"><span class="bar-fill" style="width:${rows.length?count/rows.length*100:0}%"></span></span></button>`;}).join('');
    const maxYear=Math.max(1,...Object.values(yearCounts));
    $('year-chart').innerHTML=years.map(year=>`<button type="button" class="year-column" data-year="${year}" aria-pressed="${state.year===String(year)}" aria-label="${year}: ${yearCounts[year]||0} exhibits. ${state.year===String(year)?'Clear year filter':'Filter to this filing year'}"><span>${yearCounts[year]||0}</span><span class="year-mark" style="height:${(yearCounts[year]||0)/maxYear*128}px"></span><span class="year-label">${year}</span></button>`).join('');
    const pages=Math.max(1,Math.ceil(rows.length/state.pageSize));state.page=Math.min(state.page,pages-1);
    const start=state.page*state.pageSize;const shown=rows.slice(start,start+state.pageSize);
    $('records').innerHTML=shown.length?shown.map(r=>`<tr><td><span class="document-company">${esc(r.company)}</span><span class="document-title">${esc(r.document_title)}</span></td><td>${esc(r.primary_category)}${r.confidence==='medium'?'<br><span class="review-tag">Review with care</span>':''}</td><td><span class="record-date">${esc(friendlyDate(r.filing_date))}</span><span class="record-form">${esc(r.filing_form)}</span></td><td><div class="row-actions"><button type="button" data-detail="${esc(r.id)}" aria-label="View details for ${esc(r.document_title)}">Details</button><a href="${esc(sourceUrl(r.source_url)||'#')}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(r.document_title)} on SEC.gov in a new tab">SEC ↗</a></div></td></tr>`).join(''):'<tr><td class="empty" colspan="4"><strong>No records match this selection.</strong>Try another filter or clear your search.<br><button type="button" class="button" data-reset>Reset filters</button></td></tr>';
    $('page-summary').textContent=rows.length?`Showing ${start+1}–${start+shown.length} of ${rows.length} · Page ${state.page+1} of ${pages}`:'0 matching exhibits';
    $('previous').disabled=state.page===0||!rows.length;$('next').disabled=state.page>=pages-1||!rows.length;$('download').disabled=!rows.length;
  }
  function reset(){for(const key of ['industry','year','form','category','search']){state[key]='';$(key).value='';}state.page=0;render();}
  const flagDescriptions={
    filing_acceptance_year_mismatch:'The SEC-published filing year differs from its acceptance/accession year.',
    source_response_hash_differs_from_initial_study:'Later source-response bytes differed from the initial study; this does not establish a change in legal substance.',
    additional_response_bytes_varied_previous_evidence_unchanged:'Previously reviewed normalized evidence matched despite a later response-byte variation.',
    category_boundary_review:'This record sits near a category boundary and warrants additional judgment.',
    primary_judgment_review:'The primary category requires judgment; consider the secondary context.',
    bundled_plans:'The attachment contains terms for more than one plan.',
    bundled_modifications:'The attachment includes multiple contract modifications.',
    bundled_change_orders:'The attachment includes multiple change orders.',
    bundled_related_terms:'Related terms or documents are included in the same attachment.',
    partial_document_review:'The classification uses selected evidence, not a full legal review.',
    amendment_or_related_instrument:'This is an amendment, addendum, modification or change order; do not assume it is a new deal.',
    restatement_not_assumed_new_deal:'This restates an existing arrangement; it is not automatically a new deal.',
    form_not_individual_deal:'This is a form or award document, not evidence of a unique new transaction.',
    intentional_other:'The purpose is outside a clear substantive bucket in the current taxonomy.',
    taxonomy_other:'The purpose is outside a clear substantive bucket in the current taxonomy.',
    transaction_related_ancillary:'This document is ancillary to a corporate transaction.',
    agreement_family_unresolved:'Related agreement-family linkage has not been completely resolved.',
    research_and_development_services:'The procured services concern clinical research and development.',
    employment_transition_context:'The service provider is transitioning from an employment relationship.',
    lease_assignment:'This assigns existing lease rights rather than creating a new construction project.',
    redacted_source:'The public source contains redactions; omitted terms were not inferred.'
  };
  function showDetail(id){const r=state.records.find(record=>record.id===id);if(!r)return;$('detail-id').textContent=`SOURCE RECORD · ${r.id}`;$('detail-title').textContent=r.document_title;$('detail-company').textContent=`${r.company} · ${friendlyDate(r.filing_date)} · ${r.filing_form}`;
    const flags=[...new Set(r.review_flags.map(flag=>flagDescriptions[flag]).filter(Boolean))];
    $('detail-content').innerHTML=`<section><h3>Classification reason</h3><p>${esc(r.classification_reason)}</p></section><dl><dt>Primary category</dt><dd>${esc(r.primary_category)}</dd><dt>Secondary categories</dt><dd>${r.secondary_categories.length?r.secondary_categories.map(esc).join(', '):'None assigned'}</dd><dt>Instrument type</dt><dd>${esc(r.instrument_type)}</dd><dt>Industry</dt><dd>${esc(r.industry)}</dd><dt>AI confidence</dt><dd>${esc(r.confidence)} — ordinal judgment, not a probability</dd><dt>Classification date</dt><dd>${esc(friendlyDate(r.classified_date))}</dd></dl>${flags.length?`<section><h3>Interpretation notes</h3><ul>${flags.map(flag=>`<li>${esc(flag)}</li>`).join('')}</ul></section>`:''}`;
    $('detail-links').innerHTML=`<a class="button primary" target="_blank" rel="noopener noreferrer" href="${esc(sourceUrl(r.source_url))}">Read original SEC exhibit ↗</a><a class="button" target="_blank" rel="noopener noreferrer" href="${esc(sourceUrl(r.filing_index_url))}">Filing index ↗</a>`;
    $('detail').showModal();
  }
  function download(){const rows=selection();if(!rows.length)return;const fields=[['Research notice',()=>state.release.disclaimer],['Company',r=>r.company],['Industry',r=>r.industry],['Filing date',r=>r.filing_date],['Form',r=>r.filing_form],['Document',r=>r.document_title],['Primary category',r=>r.primary_category],['Secondary categories',r=>r.secondary_categories.join('; ')],['Instrument type',r=>r.instrument_type],['Classification reason',r=>r.classification_reason],['AI confidence',r=>r.confidence],['Source URL',r=>r.source_url]];
    const quote=value=>{let s=String(value??'');if(/^[=+@-]/.test(s)||/^[\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    const csv='\uFEFF'+[fields.map(([name])=>quote(name)).join(','),...rows.map(r=>fields.map(([,get])=>quote(get(r))).join(','))].join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`sec-disclosure-selection-${rows.length}-records.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function load(){
    $('error').hidden=true;$('selection-caption').textContent='Loading the fixed research sample…';
    try{const response=await fetch('./data/dataset.json',{credentials:'same-origin'});if(!response.ok)throw new Error('Data request failed');const data=await response.json();if(!Array.isArray(data.records)||data.records.length!==114)throw new Error('Unexpected research release');if(data.records.some(r=>!sourceUrl(r.source_url)||!sourceUrl(r.filing_index_url)||!categories.includes(r.primary_category)))throw new Error('Invalid source or category');state.release=data;state.records=data.records;
      if($('industry').options.length===1){setOptions('industry',[...new Set(state.records.map(r=>r.industry))].sort());setOptions('year',years);setOptions('form',['10-K','10-Q','8-K']);setOptions('category',categories);}
      document.querySelectorAll('.filter-panel select,.filter-panel button,#search').forEach(el=>el.disabled=false);render();
    }catch(error){$('error').hidden=false;$('selection-caption').textContent='Data unavailable — try reloading or download the research release.';$('records').innerHTML='<tr><td colspan="4" class="empty">The dataset could not be loaded.</td></tr>';}
  }
  for(const key of ['industry','year','form','category'])$(key).addEventListener('change',event=>{state[key]=event.target.value;state.page=0;render();});
  $('search').addEventListener('input',event=>{state.search=event.target.value;state.page=0;render();});
  $('reset').addEventListener('click',reset);$('previous').addEventListener('click',()=>{state.page=Math.max(0,state.page-1);render();});$('next').addEventListener('click',()=>{state.page++;render();});$('download').addEventListener('click',download);$('retry').addEventListener('click',load);
  $('category-chart').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(button){state.category=state.category===button.dataset.category?'':button.dataset.category;$('category').value=state.category;state.page=0;render();}});
  $('year-chart').addEventListener('click',event=>{const button=event.target.closest('[data-year]');if(button){state.year=state.year===button.dataset.year?'':button.dataset.year;$('year').value=state.year;state.page=0;render();}});
  $('records').addEventListener('click',event=>{const button=event.target.closest('[data-detail]');if(button)showDetail(button.dataset.detail);if(event.target.closest('[data-reset]'))reset();});
  $('close-detail').addEventListener('click',()=>$('detail').close());$('detail').addEventListener('click',event=>{if(event.target===$('detail')){const r=$('detail').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('detail').close();}});
  document.querySelectorAll('.nav-inner a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('.nav-inner a').forEach(a=>a.classList.toggle('active',a===link));}));
  load();
})();
