const { PubSub, withFilter } = require("apollo-server")
const { User, Message, Room } = require('./models')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const uri = "mongodb+srv://admin:silotech@cluster0.ulm8l.mongodb.net/chat_app?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});


const pubsub = new PubSub()


module.exports = {
    Query: {
        users: () => User.find(),
        messages: () => Message.find(),
        currentUser: (... context : any) => {
            // this if statement is our authentication check
            if (!context.user) {
                throw new Error('KO au Authen')
            }
            console.log(context.user.user);
            return context.user.user
        }
    },

    User: {
        // messages: async ({ email }) => {
        //     return Message.find({ senderMail: email })
        // }
    },

    Room: {
        messages: async ({ roomName } : { roomName: any}) => {
            return Room.find({ roomName: roomName })
        }
    },

    Mutation: {
        register: async (_: any, { userName, email, password } : { userName : any, email :any , password : any}) => {
            const hashedPassword = await bcrypt.hash(password, 10)
            // create user, compare password in put with passhashed in database
            const user = new User({ userName, email, hashedPassword })
            await user.save()
            pubsub.publish("newUser", { newUser: user })
            return user
        },
 
        login: async(_:any, { userName, password } : { userName : any, password: any }) => {
            const user = await User.findOne({userName}, function (err:any, user:any){
                // doc is a Document
                
                if(err) throw err
                if(!user) {
                    throw new Error('User doesn\'t exist')
                } else if (user){
                    console.log('userName la: ', user.userName);
                    if(!user.comparePassword(password)) {
                        throw new Error('Wrong Password')                      
                    }
                } 
                
                 
            });
            const token = jwt.sign(
                {
                    user
                },
                'secret',
                {
                    expiresIn: 900
                }
            ) 
            return {
                token,
                user
            } 
        },

        createMessage: async (
            _:any,
            { user, roomName , message } : { user :any, roomName: any , message:any }, context:any
        ) => {  
                // create authen, need token when we want to acceess
                if (!context.user) {
                    throw new Error('Authen. Need Login')
                }

                await Room.countDocuments({roomName}, (err:any, count: any) => {
                    console.log(count);
                    if(count > 0) {
                         Room.findOneAndUpdate(
                            { roomName },
                            {
                                $push: {
                                    messages: {"userName": user.userName, message}
                                }   ,
                            }, function (err:any, doc:any){
                                // doc is a Document
                                
                                // const room = { "createMessage" : {
                                //     roomName: doc.roomName,
                                //     messages: doc.messages
                                // }}
                                
                                console.log('push ok');
                            }
                        )
                    } else {
                         Room.create(
                            {
                                roomName,   
                                messages : { "userName": user.userName, message }
                            }, function (err:any, doc:any){
                                // doc is a Document                               
                                console.log('create ok');
                                
                            }
                        )
                        
                    }
                }) 

                const messRom = await Room.findOne({ roomName}, function (err:any, doc:any){
                    // doc is a Document
                   
                })
                pubsub.publish("newMessage", {
                    newMessage: messRom.messages[messRom.messages.length -1],
                    roomName
                })
                
                return messRom.messages
        },

        getMessage: async(_: any, {roomName} : {roomName: any}, context: any) => {
            // create authen, need token when we want to acceess
            if (!context.user) {
                throw new Error('Authen. Need Login')
            }
            const messRom = await Room.findOne({ roomName}, function (err:any, doc:any){
                // doc is a Document
                console.log(doc.messages);
            })
            
            return messRom.messages
        },

        updateUser: async (_: any, { id, name } : { id: any, name: any }) => {
            const user = await User.findOneAndUpdate(
                { _id: id },
                { name },
                { new: true }
            );
            return user
        },

        deleteUser: async (_:any, {email} : {email: String} ) => {
            await Promise.all([
                User.findOneAndDelete({email: email}),
                Message.deleteMany({ senderMail: email})
            ])
            pubsub.publish("oldUser", { oldUser: email })
            return true
        },

        userTyping: (_: any, { email, receiverMail } : { email : any, receiverMail: any }) => {
            pubsub.publish("userTyping", { userTyping: email, receiverMail })   
            return true
        },


        updateMessage: async (_: any, {id , message} : {id : any, message : any}) => {
            const userText = await Message.findOneAndUpdate(
                { _id: id },
                { message },
                { new: true }
            )
            return userText
        },

        deleteMessage: async (_: any, {id} : {id : any}) => {
            await Message.findOneAndDelete({ _id: id })
            return true
        }
    },

    Subscription: {
        newMessage: {
            subscribe: withFilter(
                () => pubsub.asyncIterator("newMessage"),
                (payload : any, variables: any) => {
                    return payload.roomName === variables.roomName
                }
            )
        },


        newUser: {
            subscribe: (_: any, {}, { pubsub } : { pubsub : any}) => {
                return pubsub.asyncIterator("newUser")
            }
        },

        oldUser: {
            subscribe: (_: any, {}, { pubsub } : { pubsub : any}) => {
                return pubsub.asyncIterator("oldUser")
            }
        },

        userTyping: {
            subscribe: withFilter(
                () => pubsub.asyncIterator("userTyping"),
                (payload : any, variables: any) => {
                    return payload.receiverMail === variables.receiverMail
                }
            )
        }
    }
}


