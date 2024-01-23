const express = require('express');
const JiraClient = require("jira-connector");

const app = express();

app.use(express.json());

app.post('/', (req, res) => {
    console.log(req.body.text);
    const tag = req.body.fulfillmentInfo ? req.body.fulfillmentInfo.tag : null;
    let message = 'Hello from the webhook!';

    const issueKey = req.body.text;

    getJiraIssueDetails(issueKey, (error, issue) => {
        if (error) {
            console.log("Couldn't find and send to the client");
            message = `Couldn't fetch issue details: ${error}`; // Include the error message
        } else {
            console.log("Issue found and send to the client");
            message = `${issue.key}: ${issue.fields.summary}\n${issue.fields.description}\n${issue.fields.status.name}`;
        }

        const jsonResponse = {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: [message],
                        },
                    },
                ],
            },
        };

        res.status(200).send(jsonResponse);
    });
});

function getJiraIssueDetails(issueKey, callback) {
    const jira = new JiraClient({
        host: "ku-ecakir20.atlassian.net",
        basic_auth: {
            email: "ecakir20@ku.edu.tr",
            api_token: "ATATT3xFfGF0GGmmVcjAw0IEgmBHp5d_5jc6vqMC03zf62bxXtAWqAwf8EJ0x81zZr90tf-U9ain8AqxbgWrbtcGj4XFzHb70Cim5sWt5wNpi9zTF2bSWakq4DSLe-ZP_aoAxwD5U9D1fYA_mMl12fy3DoeHaBmXwz0RWbzp79FYtjf93UGPW5c=66120A4D",
        },
    });

    jira.issue.getIssue({ issueKey }, (error, issue) => {
        if (error) {
            console.error("Error:", error);
            callback(error, null);
        } else {
            callback(null, issue);
        }
    });
}

app.listen(3000, () => console.log("[ChatBot] Webhook is listening"));
