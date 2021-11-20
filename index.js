const core = require('@actions/core');
const github = require('@actions/github');
const sdk = require('api')('@miro-ea/v1.11#1kqt1tkw4yylxx');

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