import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const apiKey = process.env.TWILIO_API_KEY;
// const apiSecret = process.env.TWILIO_API_SECRET;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
// const client = twilio(apiKey, apiSecret, { accountSid: accountSid });
const client = twilio(accountSid, authToken);


export const sendSms = async ({ phoneNumber, message }) => {

    // console.log('Sending to: ' + phoneNumber)
    // console.log('Message: ' + message)

    if (!client) {
        console.warn(`[TWILIO DISABLED] Did not send actual SMS. Proceeding in dev mode.`);
        return { success: true };
    }

    try {
        const response = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber
        });
        console.log(`Twilio SMS sent to ${phoneNumber} (SID: ${response.sid})`);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.log({
            code: error.code,
            message: error.message
        });
        throw error;
    }
};
