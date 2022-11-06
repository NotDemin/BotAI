const axios = require('axios')
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {

    name: 'interactionCreate',

    async execute(interaction) {

        if (interaction.isModalSubmit()){

            if(interaction.customId === "ModalImageAI"){
                //console.log(interaction)
                await interaction.deferReply()

                const PositivPrompt = interaction.fields.getTextInputValue('PositifPrompt');
                const NegativPrompt = interaction.fields.getTextInputValue('NegativPrompt');

                fs.readFile(`./datatemplate.json`, (err, data) => {
                    if(err) throw err
                    data = JSON.parse(data)
                    data.data[0] = `${PositivPrompt}`
                    data.data[1] = `${NegativPrompt}`
                    axios.post('http://127.0.0.1:7860/api/predict', data)
                    .then( async (res) => {
                    
                        const Data = res.data?.data
                    
                        const output = Data?.[0]?.[0]?.name
                        if(output === undefined) return await interaction.editReply('sa a pas marcher lol')

                        const outputAttachment = new AttachmentBuilder(`${output}`, { name: `output.png`})

                        const OutputEmbed = new EmbedBuilder()
                            .setColor('DarkAqua')
                            .setTitle(`Resultat de generation pour "${PositivPrompt}"`)
                            .setDescription(`Prompt négatifs : "${NegativPrompt}"`)
                            .setImage('attachment://output.png')
                    
                        return await interaction.editReply({ 
                        
                            embeds: [OutputEmbed], files: [outputAttachment]
                          
                        }).catch(console.error)
                    
                    }).catch((err) => {
                        console.error(err);
                    })
                })
                
            }
        }
        else if(interaction.isButton()) {


        }
        
    }
}

/*

const data = {
                    "fn_index": 50,"data": [
                        `${PositivPrompt}`,
                        `${NegativPrompt}`,
                        "None",
                        "None",
                        30,
                        "Euler",
                        false,
                        false,
                        1,
                        1,
                        12.0,
                        -1.0,
                        -1.0,
                        0.0,
                        0,
                        0,
                        false,
                        512,
                        512,
                        false,
                        0.7,
                        0,
                        0,
                        "None",
                        false,
                        false,
                        null,
                        "",
                        "Seed",
                        "",
                        "Nothing",
                        "",
                        true,
                        false,
                        false,
                        [],
                        "",
                        ""
                      ],"session_hash":"2cjkjxmatxe"
                }

*/