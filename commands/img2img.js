const axios = require('axios')
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('img2img')
        .setDescription(`Permet de generer une image avec une autre image`)
        .addStringOption(option =>
	    	option.setName('positifprompt')
	    		.setDescription('Les prompts positif')
                .setMaxLength(4000)
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('image de base')
                .setRequired(true)    
        )
        .addStringOption(option =>
            option.setName('negatifprompt')
                .setDescription('Les prompts negatif')
                .setMaxLength(4000)
        ),

    async execute(interaction) {

        await interaction.deferReply()

        const Positif = interaction.options.getString('positifprompt') ?? 'wtf'
        const Negatif = interaction.options.getString('negatifprompt') ?? 'Pas de prompt négatifs'
        const InputImage = interaction.options.getAttachment('image') ?? 'wtf'

        let image = await axios.get(InputImage.attachment, {responseType: 'arraybuffer'})
        let returnedB64 = `data:image/jpeg;base64,${Buffer.from(image.data).toString('base64')}`

        fs.readFile(`./img2imgTemplate.json`, (err, data) => {
            if(err) throw err
            data = JSON.parse(data)
            data.data[1] = `${Positif}`
            data.data[2] = `${Negatif}`
            data.data[5] = returnedB64
            axios.post('http://127.0.0.1:7860/api/predict', data)
            .then( async (res) => {
            
                const Data = res.data?.data
            
                const input = InputImage.attachment
                const output = Data?.[0]?.[0]?.name
                if(output === undefined) return await interaction.editReply('sa a pas marcher lol')

                const inputAttachment = new AttachmentBuilder(`${input}`, { name: `input.png`})
                const outputAttachment = new AttachmentBuilder(`${output}`, { name: `output.png`})

                const InputEmbed = new EmbedBuilder()
                    .setColor('DarkAqua')
                    .setTitle(`Input image pour generation img2img`)
                    .setImage('attachment://input.png')

                const OutputEmbed = new EmbedBuilder()
                    .setColor('DarkAqua')
                    .setTitle(`Resultat de generation pour img2img "${Positif}"`)
                    .setDescription(`Prompt négatifs : "${Negatif}"`)
                    .setImage('attachment://output.png')
            
                return await interaction.editReply({ 
                
                    embeds: [InputEmbed, OutputEmbed], files: [inputAttachment, outputAttachment]
                  
                }).catch(console.error)
            
            }).catch((err) => {
                console.error(err);
            })
        })

    
    }

}