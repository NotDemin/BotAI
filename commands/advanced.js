const axios = require('axios')
const { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('advanced')
        .setDescription(`Permet de generer une image avec NovelAI(beta), version avancée`)
        .addStringOption(option =>
	    	option.setName('positifprompt')
	    		.setDescription('Les prompts positif')
                .setMaxLength(4000)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('negatifprompt')
                .setDescription('Les prompts negatif')
                .setMaxLength(4000)
        )
        .addIntegerOption(option =>
            option.setName('samplingsteps')
                .setDescription('Permet de choisir le nombre de steps de sampling, defaut a 30')
                .setMinValue(1)
                .setMaxValue(150)
        )
        .addNumberOption(option =>
            option.setName('cfgscale')
                .setDescription('Permet de choisir le cfg scale, les nombres doivent etre du type X,0 ou du type X,5, defaut a 12')
                .setMinValue(1)
                .setMaxValue(30)
        )
        .addIntegerOption(option =>
            option.setName('seed')
                .setDescription('Permet de choisir la seed de la generation, laisser vite pour aléatoire')
                .setMinValue(0)
        )
        .addIntegerOption(option =>
            option.setName('height')
                .setDescription('Permet de choisir la hauteur de l\'image, defaut a 512')
                .addChoices(
                    { name: "512", value: 512},
                    { name: "576", value: 576},
                    { name: "640", value: 640},
                    { name: "704", value: 704},
                    { name: "768", value: 768},
                    { name: "832", value: 832},
                    { name: "896", value: 896},
                    { name: "960", value: 960},
                    { name: "1024", value: 1024},
                    { name: "1088", value: 1088},
                    { name: "1152", value: 1152},
                    { name: "1216", value: 1216},
                )
        )
        .addIntegerOption(option =>
            option.setName('width')
                .setDescription('Permet de choisir la largeur de l\'image, defaut a 512')
                .addChoices(
                    { name: "512", value: 512},
                    { name: "576", value: 576},
                    { name: "640", value: 640},
                    { name: "704", value: 704},
                    { name: "768", value: 768},
                    { name: "832", value: 832},
                    { name: "896", value: 896},
                    { name: "960", value: 960},
                    { name: "1024", value: 1024},
                    { name: "1088", value: 1088},
                    { name: "1152", value: 1152},
                    { name: "1216", value: 1216},
                )
        )
        .addStringOption(option => 
            option.setName('samplingmethod')
                .setDescription('Permet de choisir la sampling method, defaut a Euler')
                .addChoices(
                    { name: "EulerA", value: "Euler a"},
                    { name: "Euler", value: "Euler"},
                    { name: "LMS", value: "LMS"},
                    { name: "Heun", value: "Heun"},
                    { name: "DPM2", value: "DPM2"},
                    { name: "DPM2A", value: "DPM2 a"},
                    { name: "DPM2Fast", value: "DPM2 fast"},
                    { name: "DPMAdaptive", value: "DPM adaptive"},
                    { name: "LMSKarras", value: "LMS Karras"},
                    { name: "DPM2Karras", value: "DPM2 Karras"},
                    { name: "DPM2AKarras", value: "DPM2 a Karras"},
                    { name: "DDIM", value: "DDIM"},
                    { name: "PLMS", value: "PLMS"}
                )
        ),

        async execute(interaction) {

            await interaction.deferReply()

            const Positif = interaction.options.getString('positifprompt') ?? 'wtf'
            const Negatif = interaction.options.getString('negatifprompt') ?? 'Pas de prompt négatifs'
            const Steps = interaction.options.getInteger('samplingsteps') ?? '30'
            const SamplingMethod = interaction.options.getString('samplingmethod') ?? 'Euler'
            const Scale = interaction.options.getNumber('cfgscale') ?? '12'
            const Seed = interaction.options.getInteger('seed') ?? '-1'
            const Height = interaction.options.getInteger('height') ?? 512
            const Width = interaction.options.getInteger('width') ?? 512

            fs.readFile(`./datatemplate.json`, (err, data) => {

                if(err) throw err

                data = JSON.parse(data)

                data.data[0] = `${Positif}`
                data.data[1] = `${Negatif}`
                data.data[4] = parseInt(Steps, 10)
                data.data[5] = `${SamplingMethod}`                
                data.data[10] = parseFloat(Scale)
                data.data[11] = parseInt(Seed, 10)
                data.data[17] = parseInt(Height, 10)
                data.data[18] = parseInt(Width, 10)

                axios.post('http://127.0.0.1:7860/api/predict', data)
                    .then( async (res) => {
                    
                        const Data = res.data?.data
                    
                        const output = Data?.[0]?.[0]?.name
                        if(output === undefined) return await interaction.editReply('sa a pas marcher lol')

                        const outputAttachment = new AttachmentBuilder(`${output}`, { name: `output.png`})

                        const OutputEmbed = new EmbedBuilder()
                            .setColor('DarkAqua')
                            .setTitle(`Resultat de generation pour "${Positif}"`)
                            .setDescription(`Prompt négatifs : "${Negatif}"`)
                            .addFields(
                                { name: 'Sampling steps', value: `${Steps}`},
                                { name: 'CFG Scale', value: `${Scale}`},
                                { name: 'Sampling method', value: `${SamplingMethod}`},
                                { name: 'Seed', value: Seed === "-1" ? "Seed aléatoire" : `${Seed}`}
                            )
                            .setImage('attachment://output.png')
                        
                        return await interaction.editReply({ 
                        
                            embeds: [OutputEmbed], files: [outputAttachment]

                            /*
                            files: [{
                                attachment: output,
                                name: output,
                              }]
                            */
                          
                        }).catch(console.error)
                    
                    }).catch((err) => {
                        console.error(err);
                })
            })
        
        }

}