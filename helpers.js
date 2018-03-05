import axios from "axios";
const request = require("request");

let feedback, standings;
//handle team list
export const handleTeamList = (teams) => {
  let teamList = [],
    table;
  teams.forEach(team => {
    table = {
      title: `Position ${team.position}: ${team.teamName} `,
      subtitle: `Matches played: ${team.playedGames} \n Points: ${
        team.points
      } `,
      image_url: team.crestURI,
      buttons: [
        {
          title: "more details",
          type: "postback",
          payload: `league-table-position-${
            team.position
          }-more-details-postback`
        }
      ]
    };
    teamList.push(table);
  });
  return teamList;
};

const getTable = (done) => {
  request(
    "http://api.football-data.org/v1/competitions/445/leagueTable",
    function(error, response, body) {
      if (error) {
        console.log("error:", error); // Print the error if one occurred
        return done(err);
      } else {
        console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
        return done(null, response, JSON.parse(body));
      }
    }
  );

}
// handle message type
export const handleFeedback = (message) => {
  if ("message" in message) {
    return {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "What do you want to do?",
          buttons: [
            {
              type: "postback",
              title: "View match schedules",
              payload: "match schedules"
            },
            {
              type: "postback",
              title: "View Highlights",
              payload: "league highlights"
            },
            {
              type: "postback",
              title: "View league table",
              payload: "league table"
            }
          ]
        }
      }
    };
  } else if ("postback" in message) {
      if (message.postback.payload === 'league table') {
        console.log("payload =>>>", message.postback.payload);
        getTable((err, response, body) => {
          standings = body.standing.slice(0, 4);
          feedback = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "list",
                "top_element_style": "compact",
                "elements": handleTeamList(standings)
              }
            }
          }; 
          console.log(feedback)
        })
        return feedback
        //  axios.get('http://api.football-data.org/v1/competitions/445/leagueTable')
        //       .then((response) => {
        //           standings = JSON.parse(response.data).standing.slice(0, 4);
        //               responseFeedback = {
        //                   "attachment": {
        //                       "type": "template",
        //                       "payload": {
        //                       "template_type": "list",
        //                       "top_element_style": "compact",
        //                       "elements": handleTeamList(standings)
        //                       }
        //                   }
        //               };
        //               console.log("I got here first", responseFeedback)
        //       })
        //       .catch((error) => {
        //           return { error }
        //       });
      } else {
        return {
          text: `${message.postback.payload} coming soon`
        }
      }
  }
};

export const sendTextMessage = (recipientId, messageFeedback) => {
  console.log(messageFeedback);
  // we package the bot response in FB required format
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: messageFeedback
  };

  // We send off the response to FB
  return request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageData
    },
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        console.log("Successfully sent message");
      } else {
        console.error(
          "Failed calling Send API",
          response.statusCode,
          response.statusMessage,
          body.error
        );
      }
    }
  );
};
