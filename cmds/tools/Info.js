const Bio = require('../../models/UserBio');
const GuildModel = require('../../models/GuildData');
const Discord = module.require('discord.js');
const { MessageEmbed } = module.require('discord.js');
const config = module.require('../../config.json');

module.exports.run = async (bot, msg, args) => {
	let user = msg.mentions.members.first();

	function calcActivity() {
		const presenceArr = [];

		// from  u/flyerzrule with my modifications
		msg.guild.presences.cache.array().forEach(r => {
			if (r.activities.length > 0) {
				if(r.activities[0].name != 'Custom Status' && !r.user.bot) {
					presenceArr.push(r.activities[0].name);
				}

			}
		});
		// from u/flyerzrule ^

		const finArr = [];
		let used = false;
		for(let i = 0;i < presenceArr.length;i++) {
			for(let k = 0;k < finArr.length;k++) {
				if(finArr[k] == presenceArr[i]) {
					used = true;
				}
			}
			if(!used) {
				finArr.push(presenceArr[i]);
				used = false;
			}
		}
		if(finArr.length == 0) {
			return 'N/A';
		}
		let max = 0;
		let top = finArr[0];
		for(let i = 0;i < finArr.length;i++) {
			let count = 0;
			for(let k = 0;k < presenceArr.length;k++) {
				if(presenceArr[k] == finArr[i]) {
					count++;
				}
			}
			if(count >= max) {
				max = count;
				top = finArr[i];
			}
		}
		return top;
	}
	function calcDate(date1, date2) {
		const diff = Math.floor(date1.getTime() - date2.getTime());
		const day = 1000 * 60 * 60 * 24;
		let message = '';
		const days = Math.floor(diff / day);
		if(days < 31) {
			return days + ' days ';
		}
		const months = Math.floor(days / 31);
		if(months < 12) {
			const daysLeft = days - months * 31;
			message += months + ' months and ';
			message += daysLeft + ' days ';
			return message;
		}
		const years = Math.floor(months / 12);
		const monthsLeft = months - years * 12;
		const daysLeft = days - months * 31;
		message += years + ' years, ';
		message += monthsLeft + ' months and ';
		message += daysLeft + ' days ';
		return message;
	}
	if(args[0] == 'bio') {
		/* This is the problem child, idk what this was supposed to acheive
		const strings = args.join(' ').substring(9);
		const bioarray = (strings.map(function(f) { return f.substring(f.indexOf(' ') + 1);}).join(' '));
		*/ 
		const bioarray = args.filter((_, i) => i != 0).join(" ")

		if(bioarray.length > 150) return require('../../util/errMsg').run(bot, msg, true, 'Server bio can not be longer than 150 characters');
		const req = await Bio.findOne({ id: msg.author.id });

		if(!req) {
			const doc = new Bio({ id: msg.author.id, bio: bioarray });
			await doc.save();
			console.log('User Bio Created');
		}
		const userbioembed = new Discord.MessageEmbed({
			title: 'Bio Updated!',
			description: `${bioarray}`,
			color: msg.member.displayHexColor,
			footer: {
				'text': msg.author.username,
				'icon_url': msg.author.displayAvatarURL(),
			},
			timestamp: Date.now(),
		});
		await Bio.findOneAndUpdate({ id: msg.author.id }, { $set: { bio: `${bioarray}` } });
		return msg.channel.send(userbioembed);

	}
	if(args[0] == 'server') {
		if(args[1] == 'bio') {
			// const strings = args.join(' ').substring(16);
			const serverbioarray = args.filter((_, i) => i > 1).join(" ") // (strings.map(function(f) { return f.substring(f.indexOf(' ') + 1);}).join(' '));
			if(!msg.member.hasPermission('ADMINISTRATOR')) return require('../../util/errMsg').run(bot, msg, false, 'You do not have proper premissions.');
			if(serverbioarray.length > 150) return require('../../util/errMsg').run(bot, msg, true, 'Server bio can not be longer than 150 characters');
			const req = await GuildModel.findOne({ id: msg.guild.id });

			if(!req) {
				const doc = new GuildModel({ id: msg.guild.id });
				await doc.save();
				console.log('Doc Created');
			}

			const serverbioembed = new Discord.MessageEmbed({
				title: 'New server Bio!',
				description: `${serverbioarray}`,
				color: msg.member.displayHexColor,
				footer: {
					'text': msg.author.username,
					'icon_url': msg.author.displayAvatarURL(),
				},
				timestamp: Date.now(),
			});
			await GuildModel.findOneAndUpdate({ id: msg.guild.id }, { $set: { serverbio: `${serverbioarray}` } }, { new: true });
			return msg.channel.send(serverbioembed);
		}
		else {
			// function roleList() {
			// 	let roleMsg = msg.guild.roles.cache.array().length + ': ' + msg.guild.roles.cache.array().join(' ');
			// 	if(roleMsg.length > 1024) {
			// 		const roles = msg.guild.roles.cache.array();
			// 		const count = 0;
			// 		roleMsg = msg.guild.roles.cache.array().length + ': ';
			// 		roles.forEach(r => {
			// 			if(r.mentionable) {
			// 				roleMsg += r + ' ';
			// 			}
			// 		});
			// 	}
			// 	return roleMsg;
			// }
			const past = msg.guild.createdAt;
			const creation = calcDate(new Date(), past);
			const server = msg.guild;
			const req = await GuildModel.findOne({ id: server.id });

			const embed = new MessageEmbed({
				color: msg.member.displayHexColor,
				author: { name: server.name },
				thumbnail: {
					url: server.iconURL(),
				},
				fields: [
					{
						name: '📑 General',
						value: `\`\`\`MIPS\nID:\n${server.id}\nCreated:\n${creation} ago\nOwner:\n${msg.guild.owner.user.tag}\nRegion:\n${msg.guild.region}\`\`\``,
						inline: true,
					},
					{
						name: '<:clnklist1:720049449023307787> Channels',
						value: `\`\`\`javascript\nText: ${server.channels.cache.filter(channel => channel.type == 'text').size}\nVoice: ${server.channels.cache.filter(channel => channel.type == 'voice').size}\nStore: ${server.channels.cache.filter(channel => channel.type == 'store').size}\nNews: ${server.channels.cache.filter(channel => channel.type == 'news').size}\n\nCategories: ${server.channels.cache.filter(channel => channel.type == 'category').size}\n\`\`\``,
						inline: true,
					},
					{
						name: '📊 Statistics',
						value: `\`\`\`javascript\nMembers: ${server.members.cache.size}\nHumans: ${server.members.cache.filter(member => !member.user.bot).size}\nBots: ${server.members.cache.filter(member => member.user.bot).size}\nRoles: ${server.roles.cache.size}\n\`\`\``,
						inline: true,
					},
					{
						name: '😀 Emojis',
						value: `\`\`\`javascript\nEmojis: ${server.emojis.cache.filter(emoji => !emoji.animated).size}\nAnimojis: ${server.emojis.cache.filter(emoji => emoji.animated).size}\n\`\`\``,
						inline: true,
					},
					{
						name: '<:clnkboost:720057574631669851> Server Boosting',
						value: `\`\`\`javascript\nTotal Boosts: ${server.premiumSubscriptionCount}\nServer Level: ${server.premiumTier}\n\`\`\``,
						inline: true,
					},
					{
						name: '🕹️ Most Common Activity',
						value: `\`\`\`${calcActivity()}\`\`\``,
						inline:true,
					},
					{
						name: 'Server Bio',
						value: `\`\`\`${req.serverbio}\`\`\``,
						inline: true,
					},
				],
				timestamp: new Date(),
				footer: {
					text: `${msg.author.username}`,
					icon_url: `${msg.author.displayAvatarURL()}`,
				},
			});
			msg.channel.send(embed);
		}
	}
	else {
		
		if(!user) user = msg.member;
		const req = await Bio.findOne({ id: user.id });
		if(!req) {
			const doc = new Bio({ id: user.id });
			await doc.save();
			console.log('Doc Created');
		} else if(!req && user) return msg.channel.send('TEST');

		let req2 = await Bio.findOne({ id: user.id });

		const embed = await new MessageEmbed({
			color: msg.member.displayHexColor,
			author: { name: user.user.name },
			thumbnail: {
				url: user.user.displayAvatarURL(),
			},
			description: 'User: ',
			fields: [
				{
					name: '📑 General:',
					value: `\`\`\`MIPS\nID: ${user.user.id}\nTag: ${user.user.tag}\n\`\`\``,
					inline: true,
				},
				{
					name: 'Created:',
					value: `\`\`\`javascript\n${calcDate(new Date(), user.user.createdAt)}ago\`\`\``,
					inline: true,
				},
				{
					name: 'Joined :',
					value: `\`\`\`javascript\n${calcDate(new Date(), user.joinedAt)}ago\`\`\``,
					inline: true,
				},
				{
					name: 'Status:',
					value: `\`\`\`javascript\n${user.user.presence.status}\`\`\``,
					inline: true,
				},
				{
					name: 'User Bio:',
					value: `\`\`\`${req2.bio}\`\`\``,
					inline: false,
				}
			],
			timestamp: new Date(),
			footer: {
				text: `${msg.author.username}`,
				icon_url: `${msg.author.displayAvatarURL()}`,
			},
		});
		msg.channel.send(embed)
	}
};

module.exports.help = {
	name: 'info',
	category: 'Tools',
	reqPerms: [],
	description: 'Posts a list of information about either the message author, a provided user, or the server. You can also set a bio for yourself or your server that will appear in the command',
	usage: `${config.pref}info${config.suff} || ${config.pref}info [user-mention]${config.suff} || ${config.pref}info bio [bio]${config.suff} || ${config.pref}info server${config.suff} || ${config.pref}info server bio [bio]${config.suff}`,
	aliases: [],
};
