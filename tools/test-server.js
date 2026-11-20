const http=require('http'),fs=require('fs'),path=require('path');
const [root,port,cors]=[process.argv[2],+process.argv[3],process.argv[4]==='cors'];
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.webp':'image/webp','.jpg':'image/jpeg'};
http.createServer((q,r)=>{
  if(cors){r.setHeader('Access-Control-Allow-Origin','*');r.setHeader('Access-Control-Allow-Headers','Range');r.setHeader('Access-Control-Expose-Headers','Content-Range, Content-Length');}
  if(q.method==='OPTIONS'){r.writeHead(204);return r.end();}
  let u=decodeURIComponent(q.url.split(/[?#]/)[0]); if(u.endsWith('/')) u+='index.html'; const f=path.join(root,u);
  fs.stat(f,(e,st)=>{ if(e||!st.isFile()){r.writeHead(404);return r.end();}
    r.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');r.setHeader('Accept-Ranges','bytes');
    const m=/bytes=(\d+)-(\d*)/.exec(q.headers.range||'');
    if(m){const a=+m[1],b=m[2]?+m[2]:st.size-1;r.writeHead(206,{'Content-Range':`bytes ${a}-${b}/${st.size}`,'Content-Length':b-a+1});fs.createReadStream(f,{start:a,end:b}).pipe(r);}
    else{r.writeHead(200,{'Content-Length':st.size});fs.createReadStream(f).pipe(r);}
  });
}).listen(port);
