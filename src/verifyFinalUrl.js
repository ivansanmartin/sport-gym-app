let localURL = process.env.LOCAL_URL;
let prodURL = process.env.PRODUCTION_URL;
let production = process.env.IS_PRODUCTION === "ENABLE" ? true : false;
let finalURL = production ? prodURL : localURL;

module.exports = finalURL;
