const ALLOWED_ORIGIN = 'https://steamaccforme1983-lang.github.io';
const randomSecret = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2,'0')).join('');
const digest = async (s: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
Deno.serve(async (req: Request) => {
 const headers: Record<string,string> = {'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Headers':'content-type,authorization','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 const reply=(data: unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(req.headers.get('origin') && req.headers.get('origin')!==ALLOWED_ORIGIN)return reply({error:'Origin not allowed.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'Use POST.'},405);
 try {
  const url=Deno.env.get('SUPABASE_URL');
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
  if(!url||!key)return reply({error:'Account service is not configured.'},503);
  const rpc=async(action: string,args: unknown)=>{
   const r=await fetch(`${url}/rest/v1/rpc/cq_account_api`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`},body:JSON.stringify({p_action:action,p_args:args}),signal:AbortSignal.timeout(12000)});
   if(!r.ok)throw new Error('database');return await r.json();
  };
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
  const limit=await rpc('throttle',{key:await digest(ip)});
  if(!limit.allowed){headers['Retry-After']='60';return reply({error:'Too many requests. Try again in a minute.',retryAfter:60},429);}
  const body=await req.text();if(body.length>200000)return reply({error:'Request too large.'},413);
  const input=JSON.parse(body);
  if(!input||typeof input!=='object'||!['signup','login','recover','logout','progress'].includes(input.action))return reply({error:'Unknown action.'},400);
  const action=input.action;
  const args: Record<string,unknown>={};
  if(['signup','login','recover'].includes(action)) {
   if(typeof input.email!=='string'||typeof input.password!=='string')return reply({error:'Email and password are required.'},400);
   args.email=input.email;args.password=input.password;args.newToken=randomSecret();
   if(action==='signup')args.recovery=randomSecret();
   if(action==='recover'){if(typeof input.recovery!=='string')return reply({error:'Enter your recovery code.'},400);args.recovery=input.recovery.trim();args.newRecovery=randomSecret();}
  } else {
   args.token=req.headers.get('authorization')?.replace(/^Bearer /i,'')||'';
   if(action==='progress' && 'progress' in input){args.progress=input.progress;args.revision=input.revision;}
  }
  const result=await rpc(action,args);
  if(result.error){if(result.retryAfter)headers['Retry-After']=String(result.retryAfter);return reply(result,result.status||400);}
  if(['signup','login','recover'].includes(action))result.token=args.newToken;
  if(action==='signup')result.recoveryCode=args.recovery;
  if(action==='recover')result.recoveryCode=args.newRecovery;
  return reply(result);
 }catch {return reply({error:'Account service could not complete the request. Please try again.'},503);}
});
