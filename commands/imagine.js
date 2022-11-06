const axios = require('axios')
const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagine')
        .setDescription(`Permet de generer une image avec NovelAI(beta)`),

    async execute(interaction) {

        const AIModal = new ModalBuilder()
            .setCustomId('ModalImageAI')
            .setTitle('Inputs pour la generation');

        const PositifPrompt = new TextInputBuilder()
			.setCustomId('PositifPrompt')
			.setLabel("Les prompts positif")
            .setPlaceholder('Exemple : masterpiece, highres ...')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        const NegativPrompt = new TextInputBuilder()
			.setCustomId('NegativPrompt')
			.setLabel("Les prompts negatif")
            .setPlaceholder('Exemple : blurr, cropped, malformed ...')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph);

        const PremierRow = new ActionRowBuilder().addComponents(PositifPrompt);
        const SecondRow = new ActionRowBuilder().addComponents(NegativPrompt);
        
        AIModal.addComponents(PremierRow, SecondRow);

        interaction.showModal(AIModal)
    
    }

}

//const url = `http://127.0.0.1:7860/config`
//
//http.get(url , res => {
//
//    let Alldata = [];
//
//    res.on('data', data => {
//    
//        Alldata += data.toString();
//
//    }).on('error', e => {
//
//        res.sendStatus(500);
//
//    }).on('close', () => {
//    
//        //console.log(JSON.parse(Alldata))
//        const data = JSON.parse(Alldata)
//        console.log(data.version, data.mode, data.components[1]?.props?.choices)
//        fs.writeFile(`${__dirname}/reponse.json`, JSON.stringify(data), (err) => {
//            if(err) console.log(err)
//            console.log('oui sa a marché')
//        })
//    
//    })
//})