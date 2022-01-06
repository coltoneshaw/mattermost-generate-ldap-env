// create user
// docs - https://api.mattermost.com/#operation/CreateUser

import fetch from 'node-fetch';
import { readConfig, readFile } from './utilities.js';

const {siteURL, apiKey} = await readConfig();

const baseURL = await siteURL + '/api/v4'

const importUsers = async () => JSON.parse( await readFile('../generated/users-object.json') );


const loginUser = async (mail, uid) => {

    const body = {
        "email": mail,
        "username": uid,
        "auth_data": uid,
        "auth_service": "ldap",
      }

    const options = { 
        method: 'POST', 
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + apiKey 
        }
     }

    return await fetch(baseURL + '/users', options)
        .then(res => res.json());
}

const loginAllUsers = async () => {

    const usersPayload = await importUsers()
    for(let i = 0; i < usersPayload.length; i++){
        let {mail, uid} = usersPayload[i]
        const res = await loginUser(mail, uid)
        console.log(res)
    }
    
}

loginAllUsers()