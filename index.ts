const core = require('@actions/core');
const github = require('@actions/github');
const sdk = require('api')('@miro-ea/v1.11#1kqt1tkw4yylxx');

const print_all_files = () => {
  console.log('test secret', core.getInput('test_secret'))
  const modified = core.getInput('modified_files')
  const added = core.getInput('added_files')
  console.log(modified)
  console.log(added)
}

const LightenDarkenColor = (col, amt) => {
  col = parseInt(col, 16);
  return (((col & 0x0000FF) + amt) | ((((col >> 8) & 0x00FF) + amt) << 8) | (((col >> 16) + amt) << 16)).toString(16);
}

const generateDescription = () => {
    return `last updated: ${new Date().toISOString()}`
}

const createCard = (x,y, title) => {
  const data = {
    data:{
      title: title,
      description: generateDescription(),
      dueDate: new Date().toISOString(),
    },
    metadata: `${title}123123`,
    style: {
          cardTheme: "#FF3B10"
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

const getUpdateCard = () => {
  const res = {
    data:{
      description: generateDescription(),
    },
  }
  return res 
}

const getAllFiles= async () => {
  const modified = await core.getInput('modified_files').split(" ")
  const added = await core.getInput('added_files').split(" ")
  return modified.concat(added).filter(x => x)
}

const createNewCardsFromAdded = async () => {
  const modified = await core.getInput('added_files')
  .split(" ")
  .map((title, index) => createCard(0,index*100,title))
  return modified
}

const updateCards = async () => {
  const exsistingItems = await getCards(`${core.getInput('board_id')}`)

  const titlesAndId = exsistingItems.data.map(x => {
    return {
      title: x.data.title,
      id: x.id,
      color: x.style.cardTheme
    }
  })
  .filter(x => /.*\.[a-z]{2,4}$/.test(x.title))

  console.log("titles: ",titlesAndId)
  const exsistingTitles = titlesAndId.map(x => x.title)

  const allFiles = await getAllFiles()

  const exsistingFiles = titlesAndId.filter(x => allFiles.includes(x.title))
  const newFiles = allFiles.filter(x => !exsistingTitles.includes(x))

  console.log("exsisting: ",exsistingFiles)
  console.log("new: ",newFiles)

  const startingIndex = titlesAndId.length

  const newCards = newFiles.map((x, index) => createCard(0,(startingIndex+index)*100, x))
  if (newCards.length !== 0){
    postNewCards(`${core.getInput('board_id')}`,newCards)
  }

  const updateData = exsistingFiles.map(x => {
     return {
      id: x.id,
      data: getUpdateCard(),
     }
  })

  if (updateData.length !== 0) {
    patchCards(`${core.getInput('board_id')}`,updateData)
  }

}


const postNewCards = async (boardId, cards) => {
  const requestUrl = `https://api.miro.com/v2/boards/${boardId}/cards`
  const result = await Promise.all( cards.map(async (x) => {
    const res = await post(requestUrl, x);
    return res
  }))
  console.log("POST: ",result)
}

const createCards = async (boardId) => {
  const requestUrl = `https://api.miro.com/v2/boards/${boardId}/cards`
  const data = await createNewCardsFromAdded()
  console.log(data)
  const result = await Promise.all( data.map(async (x) => {
    const res = await post(requestUrl, x);
    return res
  }))
  console.log("POST: ",result)
}

const patchCards = async (boardId, data) => {
  const requestUrl = `https://api.miro.com/v2/boards/${boardId}/cards/`
  console.log("data: ",data)
  console.log("data: ",data[0])
  const result = await Promise.all( data.map(async (x) => {
    const res = await patch(`${requestUrl}${x.id}`, x.data);
    return res
  }))
  console.log("PATCH: ",result)
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

const patch= async (url, data) => {
  const response = await fetch(url, {
    method: 'PATCH',
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
  return result
}

const getCards = async (boardId) => {
  const requestUrl = `https://api.miro.com/v2/boards/${boardId}/widgets?type=card`
  const result = await get(requestUrl)
  console.log(result)
  return result
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

updateCards()