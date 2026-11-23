import {renderProvenance} from './provenance.mjs';
import {icons} from './icons.mjs';
export function createCardPreview(api){
 const $=id=>document.getElementById(id),dialog=$('card-preview');let card=null,answer=false,origin=null,scroll=0;
 function actions(){const state=api.state(),favorite=state.favorites.includes(card.n),archived=(state.archived||[]).includes(card.n);$('preview-favorite').innerHTML=icons.star;const label=document.createElement('span');label.textContent=favorite?'Favorilerimde':'Favorilere ekle';$('preview-favorite').append(label);$('preview-favorite').setAttribute('aria-pressed',String(favorite));$('preview-archive').textContent=archived?'Arşivden çıkar':'Arşive kaldır';$('preview-archived').hidden=!archived}
 function face(){ $('preview-answer').hidden=!answer;$('preview-answer').textContent=card.answer;$('preview-reveal').textContent=answer?'Soruyu göster':'Cevabı göster';const src=answer?(card.back||card.front):card.front;const img=$('preview-image');img.hidden=!src;if(src)img.src=src;else img.removeAttribute('src');img.alt=answer?'Cevaplı özgün vaka kutusu':'Cevabı gizlenmiş vaka bulguları';$('preview-image-error').hidden=true;$('preview-source').hidden=!answer;$('preview-provenance').hidden=true;$('preview-provenance').replaceChildren();if(answer){$('preview-source').textContent=card.source||`Pediatri · PDF sayfa ${card.page} · Vaka ${card.n}`;renderProvenance(card,$('preview-provenance'))}dialog.classList.toggle('shows-answer',answer)}
 function close(){dialog.close()}
 dialog.addEventListener('close',()=>{document.body.classList.remove('preview-open');card=null;const target=origin?.isConnected?origin:document.querySelector(`[data-preview-id="${origin?.dataset.previewId}"]`)||document.getElementById('search');target?.focus({preventScroll:true});window.scrollTo({top:scroll,behavior:'instant'})});
 let backdrop=false;dialog.addEventListener('pointerdown',e=>{backdrop=e.target===dialog});dialog.addEventListener('click',e=>{if(backdrop&&e.target===dialog)close();backdrop=false});
 $('preview-close').onclick=close;$('preview-reveal').onclick=()=>{answer=!answer;face()};
 $('preview-favorite').onclick=()=>{api.favorite(card.n);actions()};
 $('preview-archive').onclick=()=>{api.archive(card.n,!(api.state().archived||[]).includes(card.n));actions()};
 $('preview-undo').onclick=()=>{api.archive(card.n,false);actions()};
 $('preview-image').onerror=()=>{$('preview-image').hidden=true;$('preview-image-error').hidden=false};
 return {open(c,trigger){card=c;origin=trigger;answer=false;scroll=window.scrollY;$('preview-topic').textContent=`${c.course} · ${c.subject}`;$('preview-number').textContent=`KART ${c.n} · ÖNİZLEME`;$('preview-question').textContent=c.question;face();actions();document.body.classList.add('preview-open');dialog.showModal();$('preview-content').scrollTop=0;$('preview-close').focus({preventScroll:true})},close};
}
