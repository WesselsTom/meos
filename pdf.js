import PDFDocument from 'pdfkit';
const NAVY='#142346';
const dateNL = v => { const s=String(v||''); const iso=s.match(/^(\d{4})-(\d{2})-(\d{2})/); const d=iso?new Date(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00Z`):new Date(v); return Number.isNaN(d.getTime())?'Onbekend':d.toLocaleDateString('nl-NL',{day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'}); };
function security(doc,blank){
 const ink=blank?'#86b6a3':'#b69bab'; const paper=blank?'#eaf7ec':'#fae9eb';
 doc.rect(0,0,595,842).fill(paper);
 doc.save().opacity(.22).lineWidth(.35).strokeColor(ink);
 for(let k=0;k<28;k++){doc.ellipse(300,405,80+k*8,105+k*7).stroke();}
 for(let x=10;x<595;x+=12){doc.moveTo(x,0).bezierCurveTo(x+30,250,x-20,590,x+12,842).stroke();}
 for(let k=0;k<16;k++){doc.ellipse(38,425,13+k*1.7,410-k*11).stroke();}
 doc.restore();
 doc.save().opacity(.13).fillColor(blank?'#4b8d73':'#ac758c').font('Helvetica-Bold').fontSize(85).rotate(-34,{origin:[290,420]}).text('EXODUS RP',80,360,{width:510,align:'center'}).restore();
 doc.save().opacity(.25).strokeColor('#54769e');for(let i=0;i<9;i++){doc.ellipse(548,789,10+i*3,18+i*2).stroke();}doc.restore();
 doc.rect(12,0,17,842).fill(blank?'#b7dcca':'#d6bfd0');
 doc.save().opacity(.3).strokeColor('#507ba4');for(let y=8;y<842;y+=16){doc.ellipse(21,y,6,10).stroke();}doc.restore();
}
function text(doc,t,x,y,size=10,bold=false,width){doc.fillColor(NAVY).font(bold?'Helvetica-Bold':'Helvetica').fontSize(size).text(String(t),x,y,{width:width||520,lineBreak:false});}
function bar(doc,t,y){doc.save().opacity(.55).rect(110,y,438,19).fill('#a7b4c4').restore();text(doc,t,120,y+3,10,true);}
function field(doc,k,v,y){text(doc,k,120,y,10);text(doc,':  '+String(v),272,y,10,true,268);}
function base(doc,citizen,requestId,blank){security(doc,blank);
 doc.rect(284,30,38,64).fill('#123762');text(doc,'♛',295,42,23,true,35);
 doc.fillColor('#d4a82b').font('Helvetica-Bold').fontSize(39).text('E',107,33);text(doc,'EXODUS',151,45,21,true,130);text(doc,'R O L E P L A Y',152,70,8,true,130);
 text(doc,'Dienst Justitie',336,43,12,true,160);text(doc,'Ministerie van Justitie en Veiligheid',336,61,8,false,220);
 text(doc,`VOG-ER-${String(requestId).padStart(7,'0')}`,459,21,9,true,115);
 doc.moveTo(108,108).lineTo(555,108).strokeColor('#7186a6').stroke();
 text(doc,'Verklaring Omtrent het Gedrag',110,120,23,true,445);text(doc,'Certificate of Conduct',110,151,15,false,445);
 doc.moveTo(110,180).lineTo(555,180).stroke();
 text(doc,'De Dienst Justitie van Exodus Roleplay verklaart dat uit het justitieel informatiesysteem van de Politie Exodus Roleplay de onderstaande gegevens naar voren zijn gekomen.',110,192,10,false,442);
 bar(doc,'Persoonsgegevens',238);field(doc,'Volledige naam',citizen.full_name,267);field(doc,'Geboortedatum',dateNL(citizen.birth_date),284);field(doc,'Geslacht',citizen.gender,301);field(doc,'Nationaliteit',citizen.nationality,318);field(doc,'Woonplaats',citizen.residence,335);
 bar(doc,'Aanvraaggegevens',365);field(doc,'Datum aanvraag VOG',dateNL(new Date()),395);field(doc,'Dossiernummer',`VOG-ER-${String(requestId).padStart(7,'0')}`,413);
 bar(doc,'Geregistreerde feiten (Justitieel Informatiesysteem)',445);
}
function footer(doc){
 text(doc,'Bovenstaande gegevens zijn afkomstig uit het justitieel informatiesysteem van de Politie Exodus Roleplay.',110,644,9,false,440);
 text(doc,'Namens de Dienst Justitie van Exodus Roleplay,',110,678,10);
 doc.save().strokeColor('#285c99').lineWidth(1.5).moveTo(117,735).bezierCurveTo(155,682,169,758,220,710).stroke().restore();
 text(doc,'M. de Ruiter',110,743,10,true);text(doc,'Hoofd Dienst Justitie',110,759,9);
 doc.save().strokeColor('#58749d').lineWidth(2).circle(486,718,43).stroke().circle(486,718,37).stroke().restore();
 text(doc,'DIENST JUSTITIE',449,704,8,true,78);text(doc,'EXODUS RP',460,725,8,true,60);
 doc.moveTo(107,785).lineTo(556,785).strokeColor('#627c9e').stroke();
 text(doc,'LET OP: UITSLUITEND VOOR ROLEPLAY',110,795,9,true,400);
 text(doc,'Dit document is fictief en heeft uitsluitend geldigheid binnen Exodus Roleplay.',110,810,8,false,445);
}
export function createVog(citizen,records,requestId){return new Promise((resolve,reject)=>{
 const doc=new PDFDocument({size:'A4',margin:0,bufferPages:true});const chunks=[];
 doc.on('data',c=>chunks.push(c));doc.on('error',reject);doc.on('end',()=>resolve(Buffer.concat(chunks)));
 const blank=records.length===0;base(doc,citizen,requestId,blank);
 if(blank){doc.save().opacity(.65).roundedRect(110,475,440,91,5).fill('#c9e7d2').restore();text(doc,'GEEN GEREGISTREERDE STRAFBARE FEITEN',128,496,15,true,405);text(doc,'Voor deze burger zijn geen strafbare feiten geregistreerd.',129,528,10,false,399);}
 else {text(doc,'Datum van feit',120,476,9,true,130);text(doc,'Omschrijving feit',245,476,9,true,290);
 let y=496;for(const r of records.slice(0,3)){text(doc,dateNL(r.incident_date),120,y,9,false,125);text(doc,r.offense,245,y,9,true,296);text(doc,`Artikel: ${r.article}`,245,y+16,8,false,296);doc.moveTo(111,y+42).lineTo(548,y+42).strokeColor('#c6aebb').stroke();y+=46;}
 if(records.length>3)text(doc,`+ ${records.length-3} aanvullende feiten op de bijlage`,120,625,9,true,420);
 }
 footer(doc);
 if(records.length>3){doc.addPage();security(doc,false);text(doc,'EXODUS ROLEPLAY — BIJLAGE VOG',65,55,18,true);text(doc,`Dossiernummer: VOG-ER-${String(requestId).padStart(7,'0')}`,65,90,11);let y=130;for(const r of records.slice(3)){if(y>730){doc.addPage();security(doc,false);y=80;}text(doc,dateNL(r.incident_date),65,y,10,true,110);text(doc,r.offense,185,y,10,true,350);text(doc,`Artikel: ${r.article}`,185,y+18,9,false,350);y+=54;}text(doc,'UITSLUITEND VOOR ROLEPLAY',65,780,9,true);}
 doc.end();});}
