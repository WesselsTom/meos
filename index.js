import 'dotenv/config';
import {Client,GatewayIntentBits,AttachmentBuilder,MessageFlags} from 'discord.js';
import mysql from 'mysql2/promise';
import {createVog} from './pdf.js';
const db=mysql.createPool({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,connectionLimit:5,dateStrings:true,ssl:process.env.MYSQL_SSL==='true'?{}:undefined});
const bot=new Client({intents:[GatewayIntentBits.Guilds]});
const justice=i=>Boolean(process.env.JUSTICE_ROLE_ID&&i.member?.roles?.cache?.has(process.env.JUSTICE_ROLE_ID));
bot.on('interactionCreate',async i=>{
 if(!i.isChatInputCommand())return;
 await i.deferReply({flags:MessageFlags.Ephemeral});
 try{
  if(i.commandName==='vog-demo'){
   const records=[
    {incident_date:'2026-02-14',offense:'Winkeloverval met geweld',article:'Overval met geweld'},
    {incident_date:'2026-06-03',offense:'Poging tot moord op een ambtenaar in functie',article:'Poging tot moord / geweld tegen ambtenaar'},
    {incident_date:'2026-08-21',offense:'Vernieling van een overheidsvoertuig',article:'Vernieling van overheidseigendom'}
   ];
   const pdf=await createVog({full_name:'Jan Beuken',birth_date:'1998-03-14',gender:'Man',nationality:'Nederlands',residence:'Inwoner Exodus Roleplay'},records,18743);
   const message={content:'📄 **Uw VOG is gereed — DEMO**\n\nBeste Jan Beuken,\n\nHierbij ontvangt u uw **Verklaring Omtrent het Gedrag (VOG)**.\n\n🔴 **Status:** Niet blanco\n📁 **Dossiernummer:** VOG-ER-0018743\n🏛️ **Uitgegeven door:** Dienst Justitie | Exodus Roleplay\n\nIn de bijlage vindt u uw VOG als PDF.\n\n*Dit is een fictief demonstratiedocument, uitsluitend voor roleplay. Niet juridisch geldig.*',files:[new AttachmentBuilder(pdf,{name:'VOG_Jan_Beuken_Niet_Blanco_DEMO.pdf'})]};
   try {await i.user.send(message);return i.editReply('📩 De demo-VOG is naar je privéberichten gestuurd.');}
   catch(e){console.error('DM geblokkeerd:',e);return i.editReply('Ik kan je geen DM sturen. Sta privéberichten van serverleden toe en probeer /vog-demo opnieuw.');}
  }
  if(i.commandName==='vog'){
   const [[link]]=await db.execute('SELECT citizen_identifier FROM exodus_meos_discord_links WHERE discord_id=?',[i.user.id]);
   if(!link)return i.editReply('Je Discord-account is nog niet gekoppeld. Vraag Dienst Justitie om /koppel.');
   const [[u]]=await db.execute('SELECT identifier,firstname,lastname,dateofbirth,sex FROM users WHERE identifier=? LIMIT 1',[link.citizen_identifier]);
   if(!u)return i.editReply('Geen ESX-personage gevonden.');
   const [records]=await db.execute('SELECT created_at AS incident_date,offense,article FROM exodus_meos_records WHERE citizen_identifier=? ORDER BY created_at DESC',[u.identifier]);
   const [insert]=await db.execute('INSERT INTO exodus_meos_vog_requests(citizen_identifier,discord_id,record_count) VALUES(?,?,?)',[u.identifier,i.user.id,records.length]);
   const pdf=await createVog({full_name:`${u.firstname} ${u.lastname}`,birth_date:u.dateofbirth,gender:u.sex,nationality:'Exodus Roleplay',residence:'Exodus'},records,insert.insertId);
   return i.editReply({content:`VOG: **${records.length?'Niet blanco':'Blanco'}**. Uitsluitend voor roleplay.`,files:[new AttachmentBuilder(pdf,{name:`VOG-${insert.insertId}.pdf`})]});
  }
  if(!justice(i))return i.editReply('Je hebt de Justitie-rol nodig.');
  if(i.commandName==='koppel'){
   const id=i.options.getString('identifier'),user=i.options.getUser('gebruiker');
   const [[exists]]=await db.execute('SELECT identifier FROM users WHERE identifier=? LIMIT 1',[id]);if(!exists)return i.editReply('ESX-burger niet gevonden.');
   await db.execute('INSERT INTO exodus_meos_discord_links(discord_id,citizen_identifier) VALUES(?,?) ON DUPLICATE KEY UPDATE citizen_identifier=VALUES(citizen_identifier)',[user.id,id]);
   return i.editReply('Discord-account gekoppeld.');
  }
  if(i.commandName==='strafblad'){
   const id=i.options.getString('identifier'),feit=i.options.getString('feit'),artikel=i.options.getString('artikel'),datum=i.options.getString('datum');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(datum)||Number.isNaN(Date.parse(datum)))return i.editReply('Datum moet YYYY-MM-DD zijn.');
   const [[exists]]=await db.execute('SELECT identifier FROM users WHERE identifier=? LIMIT 1',[id]);if(!exists)return i.editReply('Burger niet gevonden.');
   await db.execute('INSERT INTO exodus_meos_records(citizen_identifier,offense,article,notes,officer_name,created_at) VALUES(?,?,?,?,?,?)',[id,feit,artikel,'Via Discord',i.user.username,`${datum} 12:00:00`]);
   return i.editReply('Feit geregistreerd in MEOS.');
  }
 }catch(e){console.error(e);return i.editReply('Database- of botfout. Bekijk de Railway-logs.');}
});
bot.once('ready',()=>console.log(`Exodus bot online: ${bot.user.tag}`));
await bot.login(process.env.DISCORD_TOKEN);
