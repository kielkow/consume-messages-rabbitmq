const request = require('@linkapi.solutions/nodejs-sdk/request');

module.exports = async (data) => {
  try {
    const { response } = await request({
      method: 'POST',
      url: '',
      queryString: {},
      headers: {},
      body: data,
      fetchWithFullResponse: true
    });

    return response;
  } catch (error) {
    throw error;
  }
};
