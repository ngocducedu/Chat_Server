# Chat_Server

git clone https://github.com/ngocducedu/Chat_Server.git

cd Chat_Server

code .

npm install

npm i -D

===
-> run in develop inveroment
npm run dev

==== 
-> build js file and run product
npm run build
npm start

=======
Go http://localhost:4000/

Example PlayGround:

* regist account 

mutation {
  register(userName: "ngocduc", email:"email@gamil.com", password:"123") {
    id
    userName
  }
}

* login 

mutation {
  login(userName: "ngocduc", password:"123") {
    token
    user{
      id
      email
      hashedPassword
    }
  }
}


* create messages
mutation {
  createMessage(user: {userName: "ngocduc", email:"email@gamil.com"},
    					roomName: "chatroom",
    					message: "Xin chao") {
    userName
		message
  }
}


* listen room chat
subscription {
  newMessage(roomName:"chatroom") {
    id
    userName
    message
  }
}

========
Example headers token
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVmNGNkODZkNTc2YTkwMjYyMDU5MGFkYyIsInVzZXJOYW1lIjoibmdvY2R1YyIsImVtYWlsIjoiZW1haWwiLCJoYXNoZWRQYXNzd29yZCI6IiQyYiQxMCQudXppSUNrcllBT0hCU3UzQ3hlZFIubUIuMFFwMlhIRTliZmlwbC9MeXpFUVRQS2tETG5SSyIsImNyZWF0ZWQiOiIyMDIwLTA4LTMxVDExOjAxOjAxLjU4NFoiLCJfX3YiOjB9LCJpYXQiOjE1OTg4NzMwODQsImV4cCI6MTU5ODg3Mzk4NH0.kkAIya4JBHnN3A-VIlglSFwDlqbBSuDgSQcCWdKJXIo"
  }
