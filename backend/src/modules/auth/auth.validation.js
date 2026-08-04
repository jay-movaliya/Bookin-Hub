export const validateAuthInput = (data) => {
    if (!data.email) {
        return { isValid: false, message: "Email is required" };
    }
    return { isValid: true };
};
