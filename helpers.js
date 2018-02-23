import axios from 'axios';
const request = require('request');

//handle team list
const handleTeamList = (teams) => {
    let teamList = [], table;
    teams.forEach((team) => {
       table = {
            "tiitle": `Position ${team.position}: ${team.teamName} `,
            "subtitle": `Matches played: ${team.playedGames} \n Points: ${team.points} `,
            "image_url": team.crestURI,
            "buttons": [
                {
                    "title": "more details",
                    "type": "postback",
                    "payload": `league-table-position-${team.position}-more-details-postback`
                }
            ]
        };
        teamList.push(table);
    })
    return teamList
}

const showTeams = () => {
    return axios.get('http://api.football-data.org/v1/competitions/445/leagueTable')
    .then((response) => {
        if(response) {
            const standings = response.data.standing.slice(0, 4);
            return {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
                        "top_element_style": "compact",
                        "elements": handleTeamList(standings)
                    }
                }
            }
        } else {
            console.log("something went wrong")
        }
    })
    .catch((error) => {
        console.log("error error error", error)
        return { error }
    });
}

// handle message type
export const handleFeedback = (message) => {
  let responseFeedback, standings, teams;
  if("message" in message) {
      return {
          "attachment":{
              "type":"template",
              "payload":{
                  "template_type":"button",
                  "text":"What do you want to do?",
                  "buttons":[
                      {
                          "type":"postback", 
                          "title":"View match schedules",
                          "payload":"match schedules"
                          
                      },
                      {
                          "type":"postback",
                          "title":"View Highlights",
                          "payload":"league highlights"
                      }, 
                      {
                          "type":"postback",
                          "title":"View league table",
                          "payload":"league table"
                      }
                  ]
              }
          }
      };
  } else if ("postback" in message) {
      console.log("payload =>>>", message.postback.payload)
    //   if(message.postback.payload === 'league table') {
          return showTeams();
        // } else {
        //    return {
        //         text: `${message.postback.payload} - is coming soon.`
        //     };
        // }
  }
};

export const sendTextMessage = (recipientId, messageFeedback) => {
    console.log(messageFeedback)
    // we package the bot response in FB required format
    const messageData = {
      "recipient": {
        "id": recipientId
      },
      "message": messageFeedback
    };

    // We send off the response to FB
    return request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData
    
      }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            console.log("Successfully sent message");
        } else {
          console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
      });
}
