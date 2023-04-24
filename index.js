const Discord = require("discord.js")
var cooldown = new Set()
const { Client, Intents } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const client = new Client({ intents:[Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_BANS,Intents.FLAGS.GUILD_MEMBERS,Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,Intents.FLAGS.GUILD_INTEGRATIONS,Intents.FLAGS.GUILD_WEBHOOKS,Intents.FLAGS.GUILD_INVITES,Intents.FLAGS.GUILD_VOICE_STATES,Intents.FLAGS.GUILD_PRESENCES,Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MESSAGE_REACTIONS,Intents.FLAGS.GUILD_MESSAGE_TYPING,Intents.FLAGS.DIRECT_MESSAGES,Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  client.on('messageCreate', (message) => {
    if (message.content ==='ticket') {
   
      const embed = new MessageEmbed()
        .setTitle('Support Ticket')
        .setDescription('Click the button below to create a support ticket.')
        .setColor('#00FF00')
      const button = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('PRIMARY')
        .setLabel('Create Ticket')
        .setCustomId('create_ticket')
        .setEmoji("🎟️")
      )
      message.channel.send({ embeds: [embed], components: [button] });
    }
  
  });
  const fs = require('fs');

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  let ticketCount = 0;
  try {
    const data = fs.readFileSync('ticketCount.json');
    const jsonData = JSON.parse(data);
    ticketCount = jsonData.ticketCount;
  } catch (error) {
    console.error(error);
  }
  const ticketCategoryID = '1098592881800925235';
  const adminRoleID = '1078731649682001941';
  let idserver = '1076467404718219314'
  const ticketChannelName = `ticket-${ticketCount}`;

  if (interaction.customId === 'create_ticket') {
    const guild = client.guilds.cache.get(idserver);
    const adminRole = guild.roles.cache.get(adminRoleID);
    const ticketCategory = guild.channels.cache.get(ticketCategoryID);
    const ticketChannel = await guild.channels.create(ticketChannelName, {
      parent: ticketCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: interaction.user.id,
          allow: ['VIEW_CHANNEL']
        },
        {
          id: adminRole.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    });
    
    const ticketEmbed = {
      title: 'Support Ticket',
      description: 'Please wait for an administrator to assist you.',
      color: '#ff0000'
    };
    const ticketMessage = await ticketChannel.send({ embeds: [ticketEmbed] });

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('receive_ticket')
        .setLabel('Claim Ticket')
        .setEmoji('🔗')
        .setStyle('PRIMARY'),
        new MessageButton()
        .setCustomId('delete_ticket')
        .setLabel('Delete Ticket')
        .setStyle('DANGER')
        .setEmoji('🗑️')

    );

    await ticketMessage.edit({ components: [buttonRow] });

    await interaction.reply({
      content: `Your ticket has been created! Please check ${ticketChannel} for assistance.`,
      ephemeral: true
    });
    ticketCount++;

    const jsonData = { ticketCount };
    fs.writeFile('ticketCount.json', JSON.stringify(jsonData), (error) => {
      if (error) console.error(error);
    });   
  } else if (interaction.customId === 'receive_ticket') {
    const ticketChannel = interaction.channel;
    const adminRole = interaction.guild.roles.cache.get(adminRoleID);
    if (!interaction.member.roles.cache.some(e=> e.id === adminRole.id)){
      await interaction.reply({ content: "Only users with the admin role can claim tickets.", ephemeral: true });
      return;
    }
    
    const claimedButton = 
    new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('receive_ticket')
      .setLabel(`Claimed by ${interaction.user.tag}`)
      .setStyle('SUCCESS')
      .setDisabled(true),
      //
      new MessageButton()
      .setCustomId('delete_ticket')
      .setLabel('Delete Ticket')
      .setStyle('DANGER')
      .setEmoji('🗑️')
    )
    const buttonRow = new MessageActionRow().addComponents(claimedButton)
    await interaction.update({ components: [claimedButton] });

    await interaction.followUp({
      content: `You have claimed the ticket for ${interaction.channel}`,
      ephemeral: true
    });
  } else if (interaction.customId === 'delete_ticket') {
    //await interaction.deferReply();
    const adminRole = interaction.guild.roles.cache.get(adminRoleID);
    if (!interaction.member.roles.cache.some(e=> e.id === adminRole.id)){
      await interaction.reply({ content: "Only users with the admin role can claim tickets.", ephemeral: true });
      return;
    }
    const ticketChannel = interaction.channel;
    interaction.channel.send({content:"Ticket will be deleted in 5 seconds"})
    setTimeout(async() => {
      await ticketChannel.delete();
    }, 5000);
  }

});
  client.login(process.env.token);

