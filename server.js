const express=require("express"),WebSocket=require("ws"),path=require("path");
const app=express(),PORT=process.env.PORT||3000;app.use(express.static(path.join(__dirname,"public")));
const URL="wss://api.derivws.com/trading/v1/options/ws/public";
const TF=[60,120,180,240,300,360,600,720,900,1200,1800,3600,7200,10800,14400,21600,28800,43200];
const LABEL={60:"M1",120:"M2",180:"M3",240:"M4",300:"M5",360:"M6",600:"M10",720:"M12",900:"M15",1200:"M20",1800:"M30",3600:"H1",7200:"H2",10800:"H3",14400:"H4",21600:"H6",28800:"H8",43200:"H12"};
let ws,connected=false,error="",symbols=[],ticks=new Map(),signals=new Map(),seen=new Set(),clients=new Set(),lastUpdate=null;
function send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))}
function snap(){let d=JSON.stringify({connected,error,symbolCount:symbols.length,lastUpdate,timeframes:Object.values(LABEL),signals:[...signals.values()].slice(-500)});for(let c of clients)if(c.readyState===1)c.send(d)}
function connect(){ws=new WebSocket(URL);ws.on("open",()=>{connected=true;error="";send({active_symbols:"brief",req_id:1});snap()});
ws.on("message",raw=>{let m;try{m=JSON.parse(raw)}catch{return}if(m.error){error=m.error.message||"API error";snap();return}
if(m.msg_type==="active_symbols"){symbols=(m.active_symbols||[]).filter(x=>x.symbol);let i=0;function batch(){if(!connected)return;for(let s of symbols.slice(i,i+10))send({ticks:s.symbol,subscribe:1});i+=10;if(i<symbols.length)setTimeout(batch,1500)}batch()}
if(m.msg_type==="tick"&&m.tick){let t=m.tick,arr=ticks.get(t.symbol)||[];arr.push({time:+t.epoch,p:+t.quote});let cutoff=+t.epoch-50*86400;while(arr.length&&arr[0].time<cutoff)arr.shift();ticks.set(t.symbol,arr);evaluate(t.symbol,arr,+t.quote,+t.epoch);lastUpdate=new Date(+t.epoch*1000).toISOString();snap()}});
ws.on("close",()=>{connected=false;snap();setTimeout(connect,5000)});ws.on("error",e=>{error=e.message; snap()})}
function bars(arr,sec,now){let map=new Map();for(let t of arr){let k=Math.floor(t.time/sec)*sec,b=map.get(k);if(!b)map.set(k,b={time:k,o:t.p,h:t.p,l:t.p,c:t.p});else{b.h=Math.max(b.h,t.p);b.l=Math.min(b.l,t.p);b.c=t.p}}return [...map.values()].filter(b=>b.time+sec<=now).sort((a,b)=>a.time-b.time)}
function lo(b){return Math.min(b.o,b.c)-b.l} function up(b){return b.h-Math.max(b.o,b.c)}
function evaluate(sym,arr,price,now){for(let sec of TF){let b=bars(arr,sec,now);if(b.length<3)continue;let a=b[b.length-3],c=b[b.length-2],d=b[b.length-1];let dir=null,level,stop;
if(lo(a)>up(a)&&up(c)>lo(c)&&lo(d)>up(d)){dir="BUY";level=d.h;stop=a.l}
else if(up(a)>lo(a)&&lo(c)>up(c)&&up(d)>lo(d)){dir="SELL";level=d.l;stop=a.h}
if(!dir||(dir==="BUY"?price<=level:price>=level))continue;
let id=[sym,sec,dir,d.time].join("|");if(seen.has(id))continue;seen.add(id);
signals.set(id,{id,symbol:sym,display:(symbols.find(x=>x.symbol===sym)||{}).display_name||sym,timeframe:LABEL[sec],direction:dir,entry:price,stop,time:now,note:"Experimental tick-built candle signal; verify against MT5."})}}
app.get("/api/status",(q,r)=>r.json({connected,error,symbolCount:symbols.length,lastUpdate,signals:[...signals.values()]}));
const server=app.listen(PORT,()=>console.log("Listening on "+PORT));const wss=new WebSocket.Server({server,path:"/stream"});wss.on("connection",c=>{clients.add(c);c.send(JSON.stringify({connected,error,symbolCount:symbols.length,lastUpdate,timeframes:Object.values(LABEL),signals:[...signals.values()]}));c.on("close",()=>clients.delete(c))});connect();
