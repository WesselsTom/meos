import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
const commands = [
 new SlashCommandBuilder().setName('vog').setDescription('Vraag je VOG aan als PDF'),
 new SlashCommandBuilder().setName('vog-demo').setDescription('Ontvang een voorbeeld van een niet-blanco VOG via DM'),
 new SlashCommandBuilder().setName('koppel').setDescription('Koppel een FiveM-burger aan een Discord-account (Justitie)')
  .addStringOption(o=>o.setName('identifier').setDescription('FiveM citizen identifier').setRequired(true))
  .addUserOption(o=>o.setName('gebruiker').setDescription('Discord-gebruiker').setRequired(true)),
 new SlashCommandBuilder().setName('strafblad').setDescription('Registreer een strafbaar feit (Justitie)')
  .addStringOption(o=>o.setName('identifier').setDescription('Burger identifier').setRequired(true))
  .addStringOption(o=>o.setName('feit').setDescription('Omschrijving').setRequired(true))
  .addStringOption(o=>o.setName('artikel').setDescription('Wetsartikel').setRequired(true))
  .addStringOption(o=>o.setName('datum').setDescription('YYYY-MM-DD').setRequired(true))
].map(c=>c.toJSON());
await new REST({version:'10'}).setToken(process.env.DISCORD_TOKEN).put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID,process.env.DISCORD_GUILD_ID),{body:commands});
console.log('Commands geregistreerd');
