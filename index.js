require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

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

    if (!msg.content.startsWith(process.env.PREFIX) || msg.author.bot) {
        return;
    }

    switch (command) {
        case 'mkcol':
            MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) { throw err; }

                var dbo = db.db(process.env.MONGO_DB_NAME);

                dbo.listCollections({name: serverid}).next(function(err, collinfo) {
                    if (collinfo) {
                        msg.channel.send({embed: {
                            color: 15158332, 
                            fields: [{
                                name: "**ERROR**",
                                value: "Collection for this sid already exists",
                            }],
                        }});
                    } else {
                        dbo.createCollection(serverid, function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                msg.channel.send({embed: {
                                    color: 3066993, 
                                    fields: [{
                                        name: "**SUCCESS**",
                                        value: "Collection for `" + serverid + "` created",
                                    }],
                                }});
                                console.log("Collection /" + serverid + "/ created at " + date);
                            }
                            db.close(); 
                        });
                    }
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
                        msg.channel.send({embed: {
                            color: 15158332, 
                            fields: [{
                                name: "**DELETING COLLECTION**",
                                value: "You have deleted the entire collection. Make a new one with $mkcol",
                            }],
                        }});
                        console.log("Collection /" + serverid + "/ deleted at " + date);
                    }
                    db.close();
                });
            });
            break;

        case 'add':
            var title = args[0];
            var url = args[1];
            var lengthy = args[2];

            if (url === undefined) {
                msg.channel.send({embed: {
                    color: 15158332, 
                    fields: [{
                        name: "**ERROR**",
                        value: "Second parameter required",
                    }],
                }});
            } else if (title.length > 20 || url.length > 180) {
                 msg.channel.send({embed: {
                    color: 15158332, 
                    fields: [{
                        name: "**ERROR**",
                        value: "Char length must be within $add [20] [180]",
                    }],
                }});
            } else if (url != undefined && lengthy != undefined) {
                msg.channel.send({embed: {
                    color: 15158332, 
                    fields: [{
                        name: "**ERROR**",
                        value: "Too many parameters ",
                    }],
                }});           
            } else if (url != undefined) {
                MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                    if (err) {
                        msg.channel.send({embed: {
                            color: 15158332, 
                            fields: [{
                                name: "**ERROR**",
                                value: "Entry failed to be added",
                            }],
                        }});
                    }

                    var dbo = db.db(process.env.MONGO_DB_NAME);

                    dbo.listCollections({name: serverid}).next(function(err, collinfo) {
                        if (collinfo) {
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
                                            console.log("Errors at add");
                                        } else {
                                            msg.channel.send({embed: {
                                                color: 3066993, 
                                                    fields: [{
                                                        name: "Assigning **" + url + "** as",
                                                        value: "`" + title + "`",
                                                }],
                                            }});
                                        }
                                        db.close();
                                    });
                                } else if (counter != 0) {
                                    if (title === found[index].name) {
                                        msg.channel.send({embed: {
                                            color: 15158332, 
                                            fields: [{
                                                name: "**ERROR**",
                                                value: "Entry title already in use",
                                            }],
                                        }});
                                    } else {
                                        dbo.collection(serverid).insertOne(insertObject, function (err, res) {
                                            if (err) { 
                                                throw err; 
                                            } else {
                                                msg.channel.send({embed: {
                                                    color: 3066993, 
                                                    fields: [{
                                                        name: "Assigning `" + url + "` as",
                                                        value: "**" + title + "**",
                                                    }],
                                                }});
                                            }
                                        db.close();
                                    });
                                }   
                            }
                        });
                        } else {
                            msg.channel.send({embed: {
                                color: 15158332, 
                                fields: [{
                                    name: "**ERROR**",
                                    value: "Please make a collection first",
                                }],
                            }});
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

                dbo.listCollections({name: serverid}).next(function(err, collinfo) {
                    if (collinfo) {
                        dbo.collection(serverid).find({}, {projection: { _id: 0 }}).toArray(function (err, res) {
                            if (err) {
                                throw err;
                            }

                            if (res.length === 0) {
                                msg.channel.send({embed: {
                                color: 15158332, 
                                fields: [{
                                    name: "**ERROR**",
                                    value: "This collection is empty",
                                }],
                            }});
                                db.close();
                            }

                            if (args[0] === undefined || args[0] === 1) {
                                page = 0;
                            } else {
                                page = args[0];
                            }

                            let combined = "";
                            let start = 0 + (10*page);
                            let end = start + 10;
                            var exist = false;
                            let totalpages = Math.floor((res.length / 10));


                            if (res[start] === undefined) {
                                msg.channel.send({embed: {
                                color: 15158332, 
                                fields: [{
                                    name: "**ERROR**",
                                    value: "No contents exist for this page or invalid",
                                }],
                            }});
                                db.close();
                            }
                            for (start; start < end; start++) {
                                if (res[start] === undefined) {
                                    break;
                                } else {
                                    exist = true;
                                    combined += "**" + res[start].name + "**\n" + res[start].url + "\n";
                                }
                            }
                            if (exist === true) {
                                msg.channel.send({embed: {
                                    color: 3447003,
                                    fields: [{
                                        name: "Page [" + page + "] of [" + totalpages + "]",
                                        value: combined,
                                    }],
                                    }
                                });
                            }
                            db.close();
                        });
                    } else {
                        dbo.createCollection(serverid, function (err, res) {
                            msg.channel.send({embed: {
                                color: 15158332, 
                                fields: [{
                                    name: "**ERROR**",
                                    value: "Please make a collection first",
                                }],
                            }});
                            db.close(); 
                        });
                    }
                });
            });
            break;

        case 'grep':
            var item = args[0];
            var decline = args[1];

            if (decline != undefined) {
               msg.channel.send({embed: {
                    color: 15158332, 
                    fields: [{
                        name: "**ERROR**",
                        value: "Too many parameters",
                    }],
                }});
            } else {
                MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
                    if (err) { throw err; }

                    let query = item;

                    var dbo = db.db(process.env.MONGO_DB_NAME);
                    dbo.collection(serverid).find({'name': {'$regex': query,'$options':'i'}}).toArray(function (err, res) {
                        if (err) { throw err; }

                        let combined = "";
                        if (res.length === 0) {
                            msg.channel.send({embed: {
                                color: 15158332,
                                fields: [{
                                    name:  "**Query :** `" + query + "`",
                                    value: "No results",
                                }],
                            }});
                            db.close();
                        } else if (res.length > 10) {
                            msg.channel.send({embed: {
                                color: 15158332,
                                fields: [{
                                    name:  "**ERROR**",
                                    value: "Please narrow results. Due to Form.size, I am restricted to at most 10 results",
                                }],
                            }});
                            db.close();
                        } else {
                            for (index in res) {
                                combined += "**" + res[index].name + "**\n" + res[index].url + "\n";
                            }

                            msg.channel.send({embed: {
                            color: 15105570,
                            fields: [{
                                name:  "**Query :** `" + query + "`",
                                value: combined,
                                }],
                            }});
                        }

                        db.close();
                    });
                });
            }
            break;

        case 'rm':
            var tag = args[0];
            var long = args[1];
            var title = args[0];

            if (args[1] != undefined) {
                msg.channel.send({embed: {
                    color: 15158332, 
                        fields: [{
                            name: "**ERROR**",
                            value: "Too many parameters",
                        }],
                    }
                });
            } else {
                MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
                    if (err) { throw err; }

                    var deleteObject = { name: tag }

                    var dbo = db.db(process.env.MONGO_DB_NAME);
                    var counter = 0;

                    dbo.collection(serverid).find(title).toArray(function (err, found) {
                        for (index in found) {
                            counter++;
                        }

                        if (counter === 0) {
                                msg.channel.send({embed: {
                                    color: 15158332, 
                                    fields: [{
                                        name: "**ERROR**",
                                        value: "**" + tag + "**" + " does not exist",
                                    }],
                                }}); 
                            db.close();
                        } if (counter != 0) {
                            if (title === found[index].name) {
                                dbo.collection(serverid).deleteOne(deleteObject, function(err, obj) {
                                    if (err) { 
                                        msg.channel.send({embed: {
                                            color: 15158332, 
                                            fields: [{
                                                name: "**ERROR**",
                                                value: "**" + tag + "**" + " could not be deleted",
                                            }],
                                        }});
                                    } else {
                                        msg.channel.send({embed: {
                                            color: 3066993, 
                                            fields: [{
                                                name: "Deletion successful for:",
                                                value: "**" + tag + "**",
                                            }],
                                        }});                        
                                    }
                                db.close();
                                });
                            } else {
                                msg.channel.send({embed: {
                                    color: 15158332, 
                                    fields: [{
                                        name: "**ERROR**",
                                        value: "**" + tag + "**" + " does not exist",
                                    }],
                                }}); 
                            db.close();
                            }
                        }
                    });
                });
            }
            
            break;
                
        case 'sid':
            msg.channel.send({embed: {
                color: 15105570,
                fields: [{
                    name: "Channel id:",
                    value: "**" + serverid + "**",
                }],
            }});
            break;

        case 'help':
            msg.channel.send({embed: {
                color: 3447003, 
                fields: [{
                    name: "Commands are:",
                    value: "**mkcol\nadd [title] [contents]\nls [page]\ngrep [contents]\nrm [title]\nrmcol\nsid\nhelp**",
                }],
            }});  
        break;

        default: 
            break;
    }
});

client.login(process.env.BOT_TOKEN);