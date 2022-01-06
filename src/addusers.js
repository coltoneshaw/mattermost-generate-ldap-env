import { readConfig, getRandomInt, generateName, writeFile } from './utilities.js';
const {numUsers, numGroups} = await readConfig();


const returnUserLDIF = () => {
    const {fname, lname} = generateName();
    const uid = fname + lname + getRandomInt(0, 100000)
    const mail = `${uid}@planetexpress.com`

    const text = `

dn: cn=${fname} ${lname},ou=people,dc=planetexpress,dc=com
changetype: add
objectClass: inetOrgPerson
cn: ${fname} ${lname}
sn: ${lname}
uid: ${uid}
userPassword: ${uid}
givenName: ${fname}
mail: ${mail}
`

    return {
        text,
        dn: `cn=${fname} ${lname},ou=people,dc=planetexpress,dc=com`,
        userObject: {mail, uid, password: uid}
    }
}

const returnGroupLDIF = () => {
    const {fname, lname} = generateName();
    const text = `

dn: cn=${fname}_${lname},ou=people,dc=planetexpress,dc=com
changetype: add
objectClass: Group
cn: ${fname}_${lname}
objectClass: top
groupType: 2147483650
`

    return {
        text,
        dn: `cn=${fname}_${lname},ou=people,dc=planetexpress,dc=com`
    }
}

const returnLDIF = (type) => {
    if(type === 'group') return returnGroupLDIF()
    if(type === 'user') return returnUserLDIF();
}

const generateFile = (total, fileName, type) => {

    let string = '';
    let dataArray = []
    let dataObject = []

    for(let i = 0 ; i < total ; i++) {
        const {dn, text, userObject} = returnLDIF(type);

        if(type === 'user') dataObject.push(userObject)
        string += text
        dataArray.push(dn)
    }
    writeFile( './generated/' + fileName, string)
    if (type === 'user') return {dataObject, dataArray}
    return dataArray
}

const generateUserMembershipFile = (users, groups) => {

    let groupMembershipString = '';

    for( let group of groups) {
        let tempUsers = [...users]
        const numberOfMembers = getRandomInt(1, users.length);
        let memberString = '';

        for (let i = 0; i < numberOfMembers; i++){
            const tempIndex = getRandomInt(0, tempUsers.length - 1)
            const tempUser = tempUsers[tempIndex]
            memberString += `member: ${tempUser}
`
            tempUsers = tempUsers.splice(tempIndex, 1)
        }

        try {
            groupMembershipString += `

dn: ${group}
changetype: modify
add: member
${memberString}
`
        } catch (error) {
            console.error(error)
            console.log(memberString)
        }
    }

    writeFile('./generated/group-membership.ldif', groupMembershipString)
}


const generateLDAPEnvironment = (totalUsers, totalGroups) => {
    const {dataObject, dataArray: users} = generateFile(totalUsers, 'add-users.ldif', 'user');
    const groups = generateFile(totalGroups, 'add-groups.ldif', 'group');
    generateUserMembershipFile(users, groups)

    writeFile('./generated/users-object.json', JSON.stringify(dataObject))

}

generateLDAPEnvironment(numUsers,numGroups)

