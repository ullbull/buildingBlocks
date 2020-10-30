async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    // console.log('in getData, data = ', data);
    return data;
  }
  
  async function sendData(url, data) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    };
  
    // Send data to server
    const response = await fetch(url, options);
  
    // Wait for response from server
    const json = await response.json();
  
    return json;
  }
  
  async function deleteBlockFromServer(blockID) {
    const obj = {blockID}
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj),
    };
  
    // Send data to server
    const response = await fetch('/api', options);
  
    // Wait for response from server
    const json = await response.json();
  
    return json;
  }
  
  async function getWorkers() {
    g_workers = await getData('/workers');
  }
  
  export {
    getData,
    sendData,
    deleteBlockFromServer,
  };