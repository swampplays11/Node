const Discord = module.require('discord.js')
const config = module.require("../../config.json");
module.exports.run = async (client, msg, args) => {

    if(!args[0]) return require('../../util/errMsg.js').run(bot, msg, true, "Please provide a bet");

    const randomnumber = Math.floor(Math.random() * 38) + 1;
    const strings = args.join(" ")

    console.log(`Random Number = ${randomnumber}`) // red 1 - 18 green 19 - 20 black 21 - 38
    console.log(`${args[0]}`)

    if(randomnumber <= 18) redblackgreen = 'Red';
    if(randomnumber >= 19 && randomnumber <= 20) redblackgreen = 'Green';
    if(randomnumber >= 21) redblackgreen = 'Black';

    //betting on green
    if(args[1] == 19) return msg.channel.send('If you wish to bet on 19 or 20 please bet on green');
    if(args[1] == 20) return msg.channel.send('If you wish to bet on 19 or 20 please bet on green');

    //Win result for Red
    if(redblackgreen == 'Red' && args[0] == 'red') winresult = 'Win';
    if(redblackgreen !== 'Red' && args[0] == 'red') winresult = 'Lose';

    //Win result for green
    if(redblackgreen == 'Green' && args[0] == 'green') winresult = 'Win';
    if(redblackgreen !== 'Green' && args[0] == 'green') winresult = 'Lose';

    //Win result for Black
    if(redblackgreen == 'Black' && args[0] == 'black') winresult = 'Win';
    if(redblackgreen !== 'Black' && args[0] == 'black') winresult = 'Lose';

    //Win result for number
    if(args[0] == 'number' && args[1] == randomnumber) winresult = 'Win';
    if(args[0] == 'number' && args[1] !== randomnumber) winresult = 'Lose';

    //Embed color dependent on role
    if(redblackgreen == 'Red') rollcolor = '#D71616'
    if(redblackgreen == 'Green') rollcolor = '#00C021'
    if(redblackgreen == 'Black') rollcolor = '#000000'


    let oddsembed = new Discord.MessageEmbed()
    .setTitle('Odds')
    .addField(`Red/Black`, `47.4%`)
    .addField(`Green`, `5.5%`)
    .addField(`Single Number`, `2.6%`)
    .setDescription(`The game is provably fair using only a random number Generator`)
    if(args[0] == 'odds') return msg.channel.send(oddsembed);

    let embed = new Discord.MessageEmbed()
    .setTitle('Roulette')
    .setDescription(`Your Results`)
    .addField(`Your Bet`, `You bet on ${strings}`, true)
    .addField(`Number Result`, `${randomnumber}`, true)
    .addField(`Red, Black, or Green`, `${redblackgreen}`, true)
    .addField('Result', `You ${winresult}`, true)
    .setColor(rollcolor)

    msg.channel.send(embed)
    
    console.log(`-- ${winresult} --`)

    //console.log(`roulette command Logged: ${msg.author.id}`)

}

module.exports.help = {
    name: "roulette",
    reqPerms: [],
    description: "Roll the Dice with a game of roulette",
    usage: `${config.pref}roulette [green|-|number|-|red|-|black|-|odds] [*1-36*]${config.suff}`,
    aliases: ['roll']
}