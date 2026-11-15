const DB_NAME='NCERT_Interactive_DB', DB_VERSION=1;
const fallback={books:new Map(),lessons:new Map(),progress:{id:'user',xp:0,streak:0,completedCards:[],hints:{},weak_topics:[],lastStudy:null}};
let dbPromise;
function openDB(){if(dbPromise)return dbPromise;dbPromise=new Promise(resolve=>{if(!('indexedDB'in window)){resolve(null);return}const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;['books','lessons','progress'].forEach(s=>{if(!db.objectStoreNames.contains(s))db.createObjectStore(s,{keyPath:'id'})})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null)});return dbPromise}
function base64FromBlob(blob){return new Promise((resolve,reject)=>{if(!blob){resolve(null);return}const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=reject;r.readAsDataURL(blob)})}
function blobFromBase64(base64,type='application/pdf'){const bytes=atob(base64);const out=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)out[i]=bytes.charCodeAt(i);return new Blob([out],{type})}
export const DB={
 async put(store,value){if(store==='progress')fallback.progress=value;else fallback[store].set(value.id,value);const db=await openDB();if(!db)return value;return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).put(value);t.oncomplete=()=>resolve(value);t.onerror=()=>reject(t.error)})},
 async get(store,id){const db=await openDB();if(!db)return store==='progress'?fallback.progress:fallback[store].get(id);return new Promise(resolve=>{const r=db.transaction(store).objectStore(store).get(id);r.onsuccess=()=>resolve(r.result??(store==='progress'?fallback.progress:undefined));r.onerror=()=>resolve(undefined)})},
 async all(store){const db=await openDB();if(!db)return store==='progress'?[fallback.progress]:[...fallback[store].values()];return new Promise(resolve=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>resolve([])})},
 async progress(){return (await this.get('progress','user'))||{...fallback.progress}},
 async updateProgress(patch){const p={...(await this.progress()),...patch,id:'user'};await this.put('progress',p);return p},
 async saveBook(file,role,meta={}){return this.put('books',{id:role,role,name:file.name,size:file.size,type:file.type,blob:file,meta,storedAt:Date.now()})},
 async saveLesson(key,lesson,meta={}){return this.put('lessons',{id:key,...meta,lesson,cachedAt:Date.now()})},
 async getLesson(key){const item=await this.get('lessons',key);return item?.lesson||null},
 async exportAll(){const [rawBooks,lessons,progress]=await Promise.all([this.all('books'),this.all('lessons'),this.progress()]);const books=[];for(const b of rawBooks){books.push({...b,blob:await base64FromBlob(b.blob),blobType:b.type||'application/pdf'})}return {version:2,exportedAt:new Date().toISOString(),books,lessons,progress}},
 async importAll(data){if(!data||typeof data!=='object')throw new Error('Invalid backup');if(data.progress)await this.put('progress',{...data.progress,id:'user'});for(const l of data.lessons||[])await this.put('lessons',l);for(const b of data.books||[]){const blob=b.blob?blobFromBase64(b.blob,b.blobType||b.type):null;if(blob)await this.put('books',{...b,blob})}return true},
 async seedDemo(){await this.progress()}
};
export function downloadText(name,text,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
export async function exportMarkdown(){const p=await DB.progress();const lessons=await DB.all('lessons');const books=await DB.all('books');return `# NCERT Lab Study Summary\n\nGenerated: ${new Date().toLocaleString()}\n\n## Progress\n- XP: ${p.xp}\n- Streak: ${p.streak} days\n- Completed cards: ${p.completedCards.length}\n- Weak topics: ${(p.weak_topics||[]).join(', ')||'None logged'}\n\n## Local library\n- Books stored: ${books.length}\n- Cached lessons: ${lessons.length}\n\n## Cached lessons\n${lessons.map(l=>`- ${l.title||l.lesson?.title||l.id}`).join('\n')||'- Demo lesson available in the app'}\n`}
