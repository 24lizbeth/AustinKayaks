const Airtable = require('airtable');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const table = base('BlockedRanges');
    
    if (event.httpMethod === 'GET') {
        try {
            const records = await table.select().all();
            const blockedRanges = records.map(rec => ({
                id: rec.id,
                start: rec.fields.startDate,
                end: rec.fields.endDate,
                reason: rec.fields.reason
            }));
            return { statusCode: 200, body: JSON.stringify({ blockedRanges }) };
        } catch(err) {
            return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
        }
    }
    
    if (event.httpMethod === 'POST') {
        // Admin only: add a new blocked range (requires a secret key in header)
        const { start, end, reason } = JSON.parse(event.body);
        const adminKey = event.headers['x-admin-key'];
        if (adminKey !== process.env.ADMIN_SECRET) {
            return { statusCode: 403, body: 'Forbidden' };
        }
        try {
            const record = await table.create({
                startDate: start,
                endDate: end,
                reason: reason || 'Admin blocked'
            });
            return { statusCode: 200, body: JSON.stringify({ success: true, id: record.id }) };
        } catch(err) {
            return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
        }
    }
};
