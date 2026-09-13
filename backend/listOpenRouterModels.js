const axios = require("axios");

(async () => {
  try {
    const res = await axios.get("https://openrouter.ai/api/v1/models");

    const freeModels = res.data.data
      .filter(m => m.id.endsWith(":free"))
      .map(m => m.id);

    console.log(freeModels);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
})();