/* Kanbrain resource allocations: date-only, Monday–Friday inclusive.
   Allocations are stored per-card in Trello PRIVATE Power-Up storage, scoped
   to the signed-in member. Other board users, including admins, cannot read them.
   Pre-migration shared allocations are copied then deleted on first admin load. */
(function(){
'use strict';
var t=TrelloPowerUp.iframe({appKey:'526d48a7eb9050082ce280fe0ac1a67f',appName:'Kanbrain'});
var query=new URLSearchParams(location.search), mode=query.get('mode')==='card'?'card':'board';
var boardId,cardId,token,members=[],cards=[],assignments=[],editing=null,anchor=new Date();
function $(id){return document.getElementById(id);}
function message(s,error){$('message').textContent=s||'';$('message').className=error?'error':'success';}
function localDate(s){return new Date(s+'T12:00:00');}
function iso(d){var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day;}
function plusDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
function workdays(a,b){if(!/^\d{4}-\d\d-\d\d$/.test(a)||!/^\d{4}-\d\d-\d\d$/.test(b)||a>b)return 0;
 var n=0;for(var d=localDate(a),end=localDate(b);d<=end;d=plusDays(d,1)){if(d.getDay()!==0&&d.getDay()!==6)n++;}return n;}
function valid(row){return row&&typeof row.memberId==='string'&&/^\d{4}-\d\d-\d\d$/.test(row.start)&&/^\d{4}-\d\d-\d\d$/.test(row.end)&&row.start<=row.end;}
var ALLOC_KEY='kbResourceAllocations';
function saveAlloc(id,rows){return t.set(id,'private',ALLOC_KEY,rows);}
// Migrate previously shared allocations for the CURRENT member only.
// Never delete shared records unless private save succeeded; propagate errors
// instead of pretending migration completed. Board view visits every open card.
function getAlloc(id){
 return t.get(id,'private',ALLOC_KEY).then(function(privateRows){
   return t.get(id,'shared',ALLOC_KEY).then(function(sharedRows){
     var legacy=Array.isArray(sharedRows)?sharedRows.filter(valid):[];
     if(!legacy.length)return Array.isArray(privateRows)?privateRows.filter(valid):[];
     var existing=Array.isArray(privateRows)?privateRows.filter(valid):[];
     var combined=existing.slice();
     legacy.forEach(function(row){
       if(!combined.some(function(x){return x.id&&x.id===row.id||
         x.memberId===row.memberId&&x.start===row.start&&x.end===row.end;}))combined.push(row);
     });
     return saveAlloc(id,combined).then(function(){
       return t.remove(id,'shared',ALLOC_KEY).then(function(){return combined;});
     });
   });
 });
}
function api(path){return fetch('https://api.trello.com/1'+path+(path.includes('?')?'&':'?')+'key=526d48a7eb9050082ce280fe0ac1a67f&token='+encodeURIComponent(token)).then(function(r){if(!r.ok)throw Error('Trello API '+r.status);return r.json();});}
function memberName(id){var m=members.find(function(m){return m.id===id;});return m?(m.fullName||m.username):'Unknown member';}
function addOption(select,value,label){var o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o);}
function cell(tr,text){var td=document.createElement('td');td.textContent=text;tr.appendChild(td);return td;}
function button(label,fn,cls){var b=document.createElement('button');b.type='button';b.textContent=label;if(cls)b.className=cls;b.onclick=fn;return b;}
function resetEditor(){editing=null;$('allocationForm').reset();$('save').textContent='Add assignment';$('cancel').hidden=true;}
function renderCard(){
 $('allocations').replaceChildren();
 assignments.forEach(function(a,i){var tr=document.createElement('tr');cell(tr,memberName(a.memberId));cell(tr,a.start);cell(tr,a.end);cell(tr,String(workdays(a.start,a.end)));
 var td=cell(tr,'');td.appendChild(button('Edit',function(){$('member').value=a.memberId;$('start').value=a.start;$('end').value=a.end;editing=i;$('save').textContent='Save changes';$('cancel').hidden=false;} ,'secondary'));
 td.appendChild(document.createTextNode(' '));td.appendChild(button('Delete',function(){if(!confirm('Remove this assignment?'))return;
 var next=assignments.filter(function(_,j){return j!==i;});saveAlloc(cardId,next).then(function(){assignments=next;resetEditor();renderCard();message('Assignment removed');}).catch(function(e){message(e.message,true);});},'danger'));
 $('allocations').appendChild(tr);});
}
function startCard(){cardId=query.get('cardId');if(!cardId)return message('Missing card ID',true);
 var card=cards.find(function(c){return c.id===cardId;});$('cardTitle').textContent=card?card.name:'Task allocation';
 $('editor').hidden=false;getAlloc(cardId).then(function(a){assignments=a;renderCard();message('');}).catch(function(e){message('Could not load or migrate allocations: '+e.message,true);});}
$('allocationForm').onsubmit=function(e){e.preventDefault();var row={memberId:$('member').value,start:$('start').value,end:$('end').value};
 if(!valid(row))return message('Choose a member and valid dates.',true);
 var next=assignments.slice();if(editing===null){row.id='a'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);next.push(row);}
 else {row.id=next[editing].id;next[editing]=row;}
 $('save').disabled=true;saveAlloc(cardId,next).then(function(){assignments=next;resetEditor();renderCard();message('Saved');}).catch(function(e){message('Could not save: '+e.message,true);}).finally(function(){$('save').disabled=false;});
};
$('cancel').onclick=resetEditor;
function activeDates(){var start=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate());
 if($('view').value==='month'){start=new Date(anchor.getFullYear(),anchor.getMonth(),1);}
 else {start=plusDays(start,-((start.getDay()+6)%7));}
 var end=$('view').value==='month'?new Date(start.getFullYear(),start.getMonth()+1,0):plusDays(start,6);
 var days=[];for(var d=start;d<=end;d=plusDays(d,1))days.push(iso(d));
 $('period').textContent=iso(start)+' — '+iso(end);return days;}
function renderBoard(){
 var days=activeDates(),tbl=$('timeline');tbl.replaceChildren();var head=document.createElement('tr');cell(head,'Member / Task');
 days.forEach(function(d){var td=cell(head,d.slice(8));td.className='day'+([0,6].includes(localDate(d).getDay())?' weekend':'');td.title=d;});
 var thead=document.createElement('thead');thead.appendChild(head);tbl.appendChild(thead);
 var tbody=document.createElement('tbody');tbl.appendChild(tbody);
 var chosen=$('filter').value;var grouped={};
 assignments.filter(function(a){return !chosen||a.memberId===chosen;}).forEach(function(a){
 (grouped[a.memberId]||(grouped[a.memberId]=[])).push(a);
 });
 Object.keys(grouped).sort(function(a,b){return memberName(a).localeCompare(memberName(b));}).forEach(function(id){
 var rows=grouped[id],heading=document.createElement('tr');var header=cell(heading,memberName(id)+' · '+rows.length+' assignment(s)');header.colSpan=days.length+1;header.style.fontWeight='bold';header.style.background='#f1f3f6';tbody.appendChild(heading);
 rows.forEach(function(a){var tr=document.createElement('tr'),c=cards.find(function(c){return c.id===a.cardId;});
 var link=document.createElement('a');link.href='#';link.textContent=c?c.name:a.cardId;link.onclick=function(e){e.preventDefault();t.showCard(a.cardId);};
 var first=cell(tr,'');first.appendChild(link);days.forEach(function(day){var td=cell(tr,'');if(localDate(day).getDay()===0||localDate(day).getDay()===6){td.className='weekend';return;}
 if(day>=a.start&&day<=a.end){td.textContent='●';td.className='day cell';td.title=(c?c.name:a.cardId)+' ('+a.start+' – '+a.end+')';td.onclick=function(){t.showCard(a.cardId);};
 var overlaps=rows.filter(function(x){return day>=x.start&&day<=x.end;}).length;if(overlaps>1){td.className+=' overlap';td.title+=' · Overlapping allocations: '+overlaps;}}
 });tbody.appendChild(tr);});
 });
 if(!Object.keys(grouped).length){var tr=document.createElement('tr'),td=cell(tr,'No assignments found. Open a card and assign members.');td.colSpan=days.length+1;tbody.appendChild(tr);}
}
function startBoard(){$('board').hidden=false;message('Loading task allocations…');
 // Card-shared storage is authoritative. Read each board card to avoid a central size limit.
 return Promise.all(cards.map(function(c){return getAlloc(c.id).then(function(rows){return rows.map(function(a){return Object.assign({cardId:c.id},a);});});}))
 .then(function(all){assignments=[].concat.apply([],all);renderBoard();message('');}).catch(function(e){message(e.message,true);});}
$('filter').onchange=renderBoard;$('view').onchange=renderBoard;
$('previous').onclick=function(){anchor=$('view').value==='month'?new Date(anchor.getFullYear(),anchor.getMonth()-1,1):plusDays(anchor,-7);renderBoard();};
$('next').onclick=function(){anchor=$('view').value==='month'?new Date(anchor.getFullYear(),anchor.getMonth()+1,1):plusDays(anchor,7);renderBoard();};
Promise.all([t.board('id'),t.member('id'),t.getRestApi().getToken(),t.cards('id','name','idShort')]).then(function(r){
 boardId=r[0].id;var me=r[1].id;token=r[2];cards=r[3]||[];if(!token)throw Error('Connect your Trello account before using Resource Planning.');
 return Promise.all([api('/boards/'+boardId+'/memberships'),api('/boards/'+boardId+'/members?fields=fullName,username')]).then(function(res){
 var mine=res[0].find(function(m){return m.idMember===me;});if(!mine||mine.memberType!=='admin')throw Error('Resource Planning is available to board admins only.');
 members=res[1];members.forEach(function(m){addOption($('member'),m.id,m.fullName||m.username);addOption($('filter'),m.id,m.fullName||m.username);});
 $('app').hidden=false;return mode==='card'?startCard():startBoard();
 });
}).catch(function(e){message(e.message,true);});
})();