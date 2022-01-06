
## Description

Automatically generate `ldif` files for users, groups, and group membership to be loaded into a Mattermost install for testing only. This will automatically add a random number of users to each group created.


## Setup

Update the `config.json` with the correct values

```jsonc
{
    "apiKey" : "", // api key for your Mattermost environment. This needs to be a System Admin
    "siteURL" : "", // Site URL for your Mattermost environment. Ex: http://127.0.0.1:8065
    "numUsers" : 10000, // total number of users for Mattermost / LDAP
    "numGroups" : 500 // Total number of groups for Mattermost / LDAP. 
}
```

## Usage

1. Start the openLDAP docker container

    ```bash
    docker run -d --rm -p 10389:10389 -p 10636:10636 rroemhild/test-openldap
    ```

2. Run the addUsers script

    ```bash
    node src/addusers.js
    ```

3. Add the new users to the LDAP file.

Note this process can take some time depending on the total number of groups and users you define.

```
ldapmodify -a -x -c -D "cn=admin,dc=planetexpress,dc=com" -H ldap://localhost:10389 -x -w GoodNewsEveryone -f generated/add-users.ldif 
ldapmodify -a -x -c -D "cn=admin,dc=planetexpress,dc=com" -H ldap://localhost:10389 -x -w GoodNewsEveryone -f generated/add-groups.ldif
ldapmodify -a -x -c -D "cn=admin,dc=planetexpress,dc=com" -H ldap://localhost:10389 -x -w GoodNewsEveryone -f generated/group-membership.ldif
```

4. Log all the users into Mattermost

    ```bash
    node src/loginUsers.js
    ```

## Debugging

### Search for LDAP user

```
ldapsearch -H ldap://localhost:10389 -x -b "ou=people,dc=planetexpress,dc=com" -D "cn=admin,dc=planetexpress,dc=com" -w GoodNewsEveryone "(uid=frankhoney96708)"
```