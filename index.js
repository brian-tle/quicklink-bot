require('dotenv').config();
const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client();
fs.readdir('./events/', (err, files) => {})

const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URL;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    var serverid = msg.guild.id;
    var date = Date();

    const args = msg.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!msg.content.indexOf(process.env.PREFIX !== 0) || msg.author.bot) {
        return;
    }

/*
REQUIRE COLLECTION TO EXIST IN EVERY CASE
*/
    switch (command) {
        case 'mkcol':
            msg.channel.send("> Creating collection for : " + serverid);
            MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                    if (err) { throw err; }

                    var dbo = db.db(process.env.MONGO_DB_NAME);

                    dbo.listCollections({name: serverid}).next(function(err, collinfo) {
                        if (collinfo) {
                            msg.channel.send("> ERROR: Collection already exists. Could not create");
                        } else {
                            dbo.createCollection(serverid, function (err, res) {
                                if (err) {
                                    throw err;
                                } else {
                                    console.log("> Collection /" + serverid + "/ created at " + date);
                                    msg.channel.send("Collection for server /" + serverid + "/created at " + date + "!");
                                }
                                db.close(); 
                            });
                        }
                    });
                });
            break;

        case 'add':
            var title = args[0];
            var url = args[1];
            var lengthy = args[2];

            if (url === undefined) {
                msg.channel.send("> ERROR: A second parameter is required");
            } else if (url != undefined && lengthy != undefined) {
                msg.channel.send("> ERROR: Too many parameters");                
            } else if (url != undefined) {
                MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                        if (err) {
                            msg.channel.send("> ERROR: Item failed to be added to database");
                        }

                        var dbo = db.db(process.env.MONGO_DB_NAME);
                        var insertObject = {
                            name: title,
                            url: url
                        }

                        var counter = 0;
                        dbo.collection(serverid).find(title).toArray(function (err, found) {
                            for (index in found) {
                                counter++;
                            }

                            if (counter === 0) {
                                dbo.collection(serverid).insertOne(insertObject, function (err, res) {
                                    if (err) { 
                                        throw err; 
                                    } else {
                                        msg.channel.send("> Assigning /" + url + "/ as **" + title + "**");
                                    }
                                    db.close();
                                });
                            } else if (counter != 0) {
                                if (title === found[index].name) {
                                    msg.channel.send("> ERROR: This name already is in use");
                                } else {
                                    dbo.collection(serverid).insertOne(insertObject, function (err, res) {
                                        if (err) { 
                                            throw err; 
                                        } else {
                                            msg.channel.send("> Assigning /" + url + "/ as " + title);
                                        }
                                    db.close();
                                });
                            }
                        }
                    });
                });
            } 

            break;

        case 'ls':
            var page = args[0];
            var errored = args[1];
            MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
                    if (err) { throw err; }

                    var dbo = db.db(process.env.MONGO_DB_NAME);
                    dbo.collection(serverid).find({}, {projection: { _id: 0 }}).toArray(function (err, res) {
                        if (err) {
                            throw err;
                        }

                        if (res.length === 0) {
                            msg.channel.send("> This collection is empty");
                            db.close();
                        }
                        if (args[0] === undefined) {
                            page = 0;
                        } else {
                            page = args[0];
                        }

                        let combined = "";
                        let x = 0;

                        for (x; x < 20; x++) {
                            if (res[x] === undefined) {
                                break;
                            } else {
                                combined += "**" + res[x].name + "**" + "\n" + res[x].url + "\n";
                            }
                        }
                        msg.channel.send({embed: {
                                color: 15105570,
                                fields: [{
                                    name:  combined ,
                                    value: msg.author + "\t\t" + date,
                                }],
                            }
                        });
                        db.close();
                    });
                });
            break;

        case 'rm':
            var tag = args[0];
            MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
                    if (err) { throw err; }

                    var deleteObject = {
                        name: tag
                    }

                    var dbo = db.db(process.env.MONGO_DB_NAME);

                    dbo.collection(serverid).deleteOne(deleteObject, function(err, obj) {
                        if (err) { 
                            msg.channel.send("> " + tag + " could not be deleted");
                            throw err; 
                        }
                        msg.channel.send("> " + tag + " is now deleted from /" + serverid + "/ collection");
                        db.close();
                    });
                });
            break;

        case 'rmcol':
            MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
                    if (err) { throw err; }

                    var dbo = db.db(process.env.MONGO_DB_NAME);

                    dbo.collection(serverid).drop(function(err, delOK) {
                        if (err) { throw err; }
                        if (delOK) {
                            msg.channel.send("```You have deleted the entire collection. Make a new one with $mkcol```");
                            console.log("Collection /" + serverid + "/ deleted at " + date);
                        }
                        db.close();
                    });
                });
                break;

        case 'sid':
            msg.channel.send("> This channel's id is /" + serverid + "/");
            break;

        case 'grep':
            var item = args[0];
            var decline = args[1];

            if (decline != undefined) {
                msg.channel.send("> no more params"); //Edit to look better later
            } else {
                MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
                        if (err) { throw err; }

                        let query = item;

                        var dbo = db.db(process.env.MONGO_DB_NAME);
                        dbo.collection(serverid).find({'name': {'$regex': query,'$options':'i'}}).toArray(function (err, res) {
                            if (err) { throw err; }

                            let combined = "";
                            if (res.length === 0) {
                                msg.channel.send("> No matches");
                                db.close();
                            } else {
                                for (index in res) {
                                    combined += "**" + res[index].name + "**" + "\n" + res[index].url + "\n";
                                }
                                
                                msg.channel.send({embed: {
                                color: 15105570,
                                fields: [{
                                    name:  combined,
                                    value: msg.author + "\t\t" + date,
                                    }],
                                }});
                            }

                            db.close();
                        });
                    });
                }
            break;
                
        case 'help':
            msg.channel.send("Commands are: \n> mkcol | add | ls | sid | rm | rmcol | grep");
            break;

        default: 
            break;
    }
});

client.login(process.env.BOT_TOKEN);
