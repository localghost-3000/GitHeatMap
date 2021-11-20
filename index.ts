const core = require('@actions/core');
const github = require('@actions/github');
const sdk = require('api')('@miro-ea/v1.11#1kqt1tkw4yylxx');
/*
try {
  te = core.getInput('test_secret')
  console.log(te)
  sdk.auth(`${core.getInput('secret_key')}`);
  sdk['rest-api-create-shape']({
    data: {
      content: 'Action shape',
      shapeType: 'rectangle'
    },
    style: {
      backgroundColor: '#fff9b1',
      backgroundOpacity: '1.0',
      fontFamily: 'arial',
      fontSize: '14',
      borderColor: '#1a1a1a',
      borderWidth: '2.0',
      borderOpacity: '1.0',
      borderStyle: 'normal',
      textAlign: 'center'
    },
    geometry: {
      x: '0.0',
      y: '0.0',
      width: '200',
      height: '200',
      rotation: '0'
    }
  }, {board_id: `${core.getInput('board_id')}`})
    .then(res => console.log(res))
    .catch(err => console.error(err));

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
} catch (error) {
  core.setFailed(error.message);
}
*/

const print_all_files = () => {
  console.log('test secret', core.getInput('test_secret'))
  const modified = core.getInput('modified_files')
  const added = core.getInput('added_files')
  console.log(modified)
  console.log(added)
}

const createCard = (x,y, title) => {
  const data = {
    data:{
      title: title,
      description: "sample",
      dueDate: "2023-10-12T22:00:55Z"
    },
    style: {
          cardTheme: "#2d9bf0"
     },
     geometry: {
          x: x,
          y: y,
          width: "320.0",
          height: "94.0",
          rotation: "0.0"
     }
  }
  return data
}

const createNewCardsFromFiles = async () => {
  // TEST
  const modified = await core.getInput('modified_files')
  .split(" ")
  .map((title, index) => createCard(index*100,0,title))
  return modified
 
}


const createCards = async (boardId) => {
  const requestUrl = `https://api.miro.com/v2/boards/${boardId}/cards`
  const data = await createNewCardsFromFiles()
  console.log(data)
  const result = await Promise.all( data.map(async (x) => {
    const res = await post(requestUrl, x);
    return res
  }))
  console.log(result)
}

const post = async (url, data) => {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${core.getInput('secret_key')}`
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data),
  });

  return response.json()
}

const getBoardContents = async (boardId) => {
  const requestUrl = `https://api.miro.com/v2/boards/${boardId}/widgets`
  const result = await get(requestUrl)
  console.log(result)
}

const get = async (url) => {
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${core.getInput('secret_key')}`
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });

  return response.json()
}
print_all_files()

createCards(`${core.getInput('board_id')}`)