(function() {
  const id = new URLSearchParams(window.location.search).get("id") || "";
  const script = document.createElement("script");

  if (id.startsWith("tsmnt_"))      script.src = "TSMNTQuiz.js";
  else if (id.startsWith("ncse_"))   script.src = "NCSEQuiz.js";
  else if (id.startsWith("mc_"))     script.src = "MediacorpQuiz.js";
  else                               script.src = "VRLQuiz.js";

  document.head.appendChild(script);
})();
(function(){
    var main=document.getElementById("mainContent");
    var p = new URLSearchParams(window.location.search);
    var cid  = p.get("id") || "m1";
    var cidx = modules.findIndex(function(x){ return x.id === cid; });
    var cmod = modules[cidx];

    if(!cmod){
      document.getElementById("mainContent").innerHTML =
        '<div class="content-card" style="text-align:center;padding:3rem;color:#dc2626;">Module not found.</div>';
      return;
    }

    document.title = cmod.title + " — LTA-VRL";
    document.getElementById("modTitle").textContent  = cmod.title;
    document.getElementById("modLabel").textContent  = "Module "+(cidx+1)+" of "+modules.length;
    document.getElementById("bcMod").textContent     = cmod.title;

    var pb = document.getElementById("prevBtn");
    var nb = document.getElementById("nextBtn");
    pb.disabled = cidx === 0;
    nb.disabled = cidx === modules.length-1;
    pb.onclick = function(){ if(cidx>0) location.href="module.html?id="+modules[cidx-1].id; };
    nb.onclick = function(){ if(cidx<modules.length-1) location.href="module.html?id="+modules[cidx+1].id; };

    function toBullets(text){
      var lines=(text||"").trim().split("\n");
      var out=[];
      lines.forEach(function(l){
        l=l.trim();
        if(l.startsWith("- ")) out.push("<li>"+l.slice(2).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")+"</li>");
      });
      return "<ul>"+out.join("")+"</ul>";
    }

    async function render(){

      if(cmod.mcqCsv && (!cmod.mcqData||cmod.mcqData.length===0)){
        try{ var r=await loadCsv(cmod.mcqCsv); cmod.mcqData=toMcq(r); }catch(e){console.error(e);}
      }
      if(cmod.summaryCsv && !cmod.summary){
        try{ var sr=await loadCsv(cmod.summaryCsv); cmod.summary=buildSummaryFromCsv(sr); }catch(e){console.error(e);}
        
      }
      // ← THIS LINE MUST BE HERE:
       if(cmod.mcq2Csv && (!cmod.mcqData2||cmod.mcqData2.length===0)){
         try{ var r2=await loadCsv(cmod.mcq2Csv); cmod.mcqData2=toMcq(r2); }catch(e){console.error(e);}
      }

       showStep(0);
    }

    var currentStep = 0;
    var mcqScore = 0;        
    var mcqTotal = 0;        
    var blanksScore = 0;    
    var blanksTotal = 0; 

    document.getElementById("prevBtn").onclick = function() {
      if (currentStep > 0) { currentStep--; showStep(currentStep); }
    };
    document.getElementById("nextBtn").onclick = function() {
      if (currentStep < 3) { currentStep++; showStep(currentStep); }
    };

    function showStep(n) {

      currentStep = n;
      main.innerHTML = " ";

      if (n == 0) renderLesson() ;
      if (n == 1) renderMCQ() ;
      if (n == 2) cmod.mcqData2 ? renderMCQ2() : renderBlanks();
      if (n === 3) renderResults(); 
    }

    function renderLesson() {
      var lc=document.createElement("div"); lc.className="content-card";
      if(cmod.sections && cmod.sections.length>0){
        var di=parseInt(sessionStorage.getItem("deck_"+cmod.id)||"0");
        if(isNaN(di)||di<0) di=0;
        if(di>=cmod.sections.length) di=cmod.sections.length-1;
        lc.innerHTML='<div class="sec-div">Lesson Content</div>'+
          '<div style="margin-top:1rem;">'+
          '<div class="deck-nav">'+
          '<button class="deck-btn" id="dp"><i class="bi bi-arrow-left"></i></button>'+
          '<span class="deck-counter" id="dc"></span>'+
          '<button class="deck-btn" id="dn"><i class="bi bi-arrow-right"></i></button>'+
          '</div><div class="deck-card" id="dcard"></div></div>';
        main.appendChild(lc);
        var dc=document.getElementById("dc"),dcard=document.getElementById("dcard"),
            dp=document.getElementById("dp"),dn=document.getElementById("dn");
        function showDeck(){
          var s=cmod.sections[di];
          dc.textContent=(di+1)+" / "+cmod.sections.length;
          dcard.innerHTML="<h3>"+s.title+"</h3><ul>"+(s.points||[]).map(function(p){return"<li>"+p+"</li>";}).join("")+"</ul>";
          dp.disabled=di===0; dn.disabled=di===cmod.sections.length-1;
          sessionStorage.setItem("deck_"+cmod.id,String(di));
        }
        dp.onclick=function(){if(di>0){di--;showDeck();}};
        dn.onclick=function(){if(di<cmod.sections.length-1){di++;showDeck();}};
        showDeck();
      } else {
        lc.innerHTML='<div class="sec-div">Lesson Notes</div><div class="notes-card">'+toBullets(cmod.notes||"")+'</div>';
        main.appendChild(lc);
      }

      //next button at the bottom of page
      nextBtn.onclick = function() { currentStep++; showStep(currentStep); }

    }

    function renderMCQ() {
      var qs=cmod.mcqData||[];
      if(qs.length>0){
        var qc=document.createElement("div"); qc.className="content-card";
        var qh="";
        qs.forEach(function(q,i){
          qh+='<div class="quiz-q"><div class="quiz-q-text">Q'+(i+1)+'. '+q.Question+'</div>'+
            ["A","B","C","D"].map(function(l){
              return '<label class="mcq-option"><input type="radio" name="'+cmod.id+'_q'+i+'" value="'+l+'" class="mcq-radio">'+
                '<span class="mcq-letter">'+l+'</span><span>'+q["Option"+l]+'</span></label>';
            }).join("")+'<div id="exp_'+i+'" class="explanation"></div></div>';
        });
        qc.innerHTML='<div class="sec-div">Knowledge Check</div>'+
          '<h3 style="margin-top:0.5rem;font-size:0.95rem;margin-bottom:1rem;">'+cmod.title+' Quiz</h3>'+
          qh+'<div class="quiz-actions">'+
          '<button class="btn-submit" id="subQuiz">Submit Answers</button>'+
          '<span id="qResult"></span></div>';
        main.appendChild(qc);

        if(cmod.classificationData && Array.isArray(cmod.classificationData)) doClassification(cmod.classificationData,main);

        document.getElementById("subQuiz").onclick=async function(){
          var score=0;
          qs.forEach(function(q,i){
            var sel=document.querySelector('input[name="'+cmod.id+'_q'+i+'"]:checked');
            var ex=document.getElementById("exp_"+i);
            if(sel&&sel.value===q.CorrectAnswer) score++;
            if(ex){var ok=sel&&sel.value===q.CorrectAnswer;ex.style.display="block";
              ex.className="explanation "+(ok?"correct":"wrong");
              ex.innerHTML="<b>"+(ok?"✅ Correct":"❌ Incorrect")+"</b> — "+q.Reason;}
          });
          mcqScore = score;
          mcqTotal = qs.length;

          var passed=cmod.passScore===0||score>=cmod.passScore;
          document.getElementById("qResult").innerHTML=
            '<span class="result-badge '+(passed?"result-pass":"result-fail")+'">'+
            '<i class="bi '+(passed?"bi-check-circle":"bi-x-circle")+'"></i>'+
            (passed?"Passed":"Not Passed")+" — "+score+"/"+qs.length+'</span>';
          try{
            var cu=JSON.parse(localStorage.getItem("portalUser"))||{};
            var uid=cu.userID||cu.email||"test-user";
            await fetch(API_BASE+"/progress",{method:"POST",headers:{"Content-Type":"application/json"},
              body:JSON.stringify({userID:uid,moduleID:cmod.id,score:score,totalQuestions:qs.length,completed:passed})});
          }catch(e){console.error(e);}
          if(passed){var pg=loadProgress();pg[cmod.id]={completed:true};saveProgress(pg);}
        };
      }
    }

    function renderBlanks() {
      if(cmod.summary){
        var sc=document.createElement("div"); sc.className="content-card";
        var SLS=cmod.summary.lsKey, sv={};
        try{sv=JSON.parse(localStorage.getItem(SLS))||{};}catch(e){}
        sc.innerHTML='<div class="sec-div">Fill in the Blanks</div>'+
          '<h3 style="margin-top:0.5rem;font-size:0.95rem;">'+cmod.summary.title+'</h3>'+
          '<ol class="blank-list" id="bList"></ol>'+
          '<div class="quiz-actions">'+
          '<button class="btn-submit" id="chkBlanks">Check Answers</button>'+
          '<button class="btn-nav" id="clrBlanks">Clear</button>'+
          '<span id="blankMsg" style="font-size:0.85rem;color:var(--text-muted);"></span></div>';
        main.appendChild(sc);
        var ol=document.getElementById("bList"),bi=0;
        cmod.summary.sentences.forEach(function(parts){
          var li=document.createElement("li"); li.dataset.answers="";
          parts.forEach(function(pt){
            if(pt.t){ li.append(document.createTextNode(pt.t)); }
            else{
              var k="b"+bi, inp=document.createElement("input");
              inp.type="text"; inp.className="blank-input"; inp.value=sv[k]||"";
              inp.dataset.answer=(pt.b||"").trim().toLowerCase(); inp.dataset.key=k;
              li.dataset.answers+=(li.dataset.answers?", ":"")+pt.b;
              inp.addEventListener("input",function(){sv[k]=inp.value;localStorage.setItem(SLS,JSON.stringify(sv));});
              li.append(inp); bi++;
            }
          });
          var h=document.createElement("div"); h.className="answer-hint";
          h.textContent="Correct: "+li.dataset.answers; li.append(h); ol.append(li);
        });
        document.getElementById("chkBlanks").onclick=function(){
          var ins=ol.querySelectorAll(".blank-input"),cor=0;
          ins.forEach(function(inp){
            var h=inp.closest("li").querySelector(".answer-hint");
            inp.classList.remove("ok","bad"); if(h) h.style.display="none";
            if(!inp.value.trim()) return;
            if(inp.value.trim().toLowerCase()===inp.dataset.answer){inp.classList.add("ok");cor++;}
            else{inp.classList.add("bad");if(h) h.style.display="block";}
          });
           blanksScore = cor;
           blanksTotal = ins.length;
          document.getElementById("blankMsg").textContent=cor+"/"+ins.length+" correct";
        };
      }

      if(cmod.quiz && Array.isArray(cmod.quiz)) doKeyword(cmod.quiz,main);
    }

    function renderResults() {
  var total = mcqTotal + blanksTotal;
  var score = mcqScore + blanksScore;
  var pct   = total > 0 ? Math.round((score / total) * 100) : 0;
  var passed = pct >= 70;

  var rc = document.createElement("div");
  rc.className = "content-card";
  rc.innerHTML =
    '<div class="sec-div">Module Results</div>' +
    '<div style="text-align:center;padding:2rem 1rem;">' +

      // Big score display
      '<div style="font-size:3.5rem;font-weight:700;color:'+(passed?'var(--green)':'#dc2626')+';">'+pct+'%</div>' +
      '<div style="font-size:1rem;color:var(--text-muted);margin-bottom:1.5rem;">'+score+' / '+total+' correct</div>' +

      // Pass / Fail badge
      '<div style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;color:'+(passed?'var(--green)':'#dc2626')+'">' +
        (passed ? '✅ Passed!' : '❌ Not Passed') +
      '</div>' +
      '<div style="font-size:0.875rem;color:var(--text-muted);margin-bottom:2rem;">' +
        (passed
          ? 'Well done! You have completed this module.'
          : 'You need 70% to pass. Please redo the module before retaking.') +
      '</div>' +

      // Breakdown
      '<div style="background:var(--bg);border-radius:10px;padding:1rem;text-align:left;margin-bottom:1.5rem;">' +
        '<div style="font-size:0.8rem;font-weight:700;color:var(--text-faint);text-transform:uppercase;margin-bottom:0.75rem;">Score Breakdown</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:0.875rem;padding:0.4rem 0;border-bottom:1px solid var(--border);">'+
          '<span>MCQ Quiz</span><span style="font-weight:600;">'+mcqScore+' / '+mcqTotal+'</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:0.875rem;padding:0.4rem 0;">'+
          '<div>Fill in the Blanks</div><span style="font-weight:600;">'+blanksScore+' / '+blanksTotal+'</span></div>' +
      '</div>' +

      // Buttons
      (passed
        ? '<a href="VRLQuiz.html" class="btn-nav primary" style="display:inline-flex;">Back to All Modules</a>'
        : '<button class="btn-nav" onclick="showStep(0)" style="margin-right:0.5rem;">↺ Redo Module</button>') +
    '</div>';

  main.appendChild(rc);
}

    function doClassification(data,container){
      var card=document.createElement("div"); card.className="content-card";
      var locs=["VRL-AO","VRL-ESA","VRL-EA","VRL-GA","VRL-HVPO","VRL-LTA"];
      var rh=data.map(function(item,i){
        return '<div class="quiz-q"><div class="quiz-q-text">'+(i+1)+'. '+item.characteristic+'</div>'+
          '<select class="class-select" data-correct="'+item.correctLocation+'">'+
          '<option value="">Select VRL Location</option>'+
          locs.map(function(l){return'<option value="'+l+'">'+l+'</option>';}).join("")+
          '</select><div class="class-feedback" style="font-size:0.8rem;margin-top:4px;"></div></div>';
      }).join("");
      card.innerHTML='<div class="sec-div">Classification Exercise</div>'+
        '<h3 style="margin-top:0.5rem;font-size:0.95rem;margin-bottom:1rem;">VRL Location Matching</h3>'+
        rh+'<div class="quiz-actions"><button class="btn-submit" id="clsSub">Check Answers</button><span id="clsRes"></span></div>';
      container.appendChild(card);
      document.getElementById("clsSub").onclick=function(){
        var sels=card.querySelectorAll(".class-select"),sc=0;
        sels.forEach(function(s){
          var fb=s.parentElement.querySelector(".class-feedback");
          if(s.value===s.dataset.correct){sc++;fb.innerHTML='<span style="color:var(--green);">✅ Correct</span>';}
          else{fb.innerHTML='<span style="color:#dc2626;">❌ Correct: '+s.dataset.correct+'</span>';}
        });
        document.getElementById("clsRes").innerHTML=
          '<span class="result-badge result-pass"><i class="bi bi-check-circle"></i> '+sc+'/'+sels.length+'</span>';
      };
    }

    function doKeyword(quiz,container){
      var card=document.createElement("div"); card.className="content-card";
      var qh=quiz.map(function(q,i){
        return '<div class="quiz-q"><div class="quiz-q-text">Q'+(i+1)+'. '+q.q+'</div>'+
          '<input type="text" class="blank-input" style="width:100%;margin-top:0;" placeholder="Type your answer..." '+
          'data-keywords=\''+JSON.stringify(q.keywords)+'\' data-index="'+i+'">'+
          '<div id="kw_'+i+'" style="font-size:0.8rem;margin-top:6px;"></div></div>';
      }).join("");
      card.innerHTML='<div class="sec-div">Short Answer Quiz</div>'+
        '<h3 style="margin-top:0.5rem;font-size:0.95rem;margin-bottom:1rem;">Check Your Understanding</h3>'+
        qh+'<div class="quiz-actions"><button class="btn-submit" id="kwSub">Check Answers</button><span id="kwRes"></span></div>';
      container.appendChild(card);
      document.getElementById("kwSub").onclick=function(){
        var ins=card.querySelectorAll("input[data-keywords]"),sc=0;
        ins.forEach(function(inp,i){
          var val=inp.value.toLowerCase(),kws=JSON.parse(inp.dataset.keywords);
          var matched=kws.filter(function(k){return val.includes(k);});
          var fb=document.getElementById("kw_"+i);
          if(matched.length>0){sc++;fb.innerHTML='<span style="color:var(--green);">✅ Keywords: '+matched.join(", ")+'</span>';}
          else{fb.innerHTML='<span style="color:#dc2626;">❌ Try: '+kws.slice(0,3).join(", ")+'</span>';}
        });
        document.getElementById("kwRes").innerHTML=
          '<span class="result-badge '+(sc>=(cmod.passScore||0)?"result-pass":"result-fail")+'">'+
          '<i class="bi bi-check-circle"></i> '+sc+'/'+ins.length+'</span>';
        if(sc>=(cmod.passScore||0)){var pg=loadProgress();pg[cmod.id]={completed:true};saveProgress(pg);}
      };
    }

    render();
  })();