// SMS service module
export const sendSms = async ({ phoneNumber, message }) => {
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    return { success: true };
};
