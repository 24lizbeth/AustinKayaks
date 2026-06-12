const fetch = require('node-fetch');

exports.handler = async (event) => {
    const token = process.env.NETLIFY_API_TOKEN;
    const siteId = process.env.SITE_ID; // set in Netlify env
    const formId = process.env.FORM_ID;  // find form ID in Netlify UI
    
    const url = `https://api.netlify.com/api/v1/forms/${formId}/submissions`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const submissions = await res.json();
    return { statusCode: 200, body: JSON.stringify(submissions) };
};
