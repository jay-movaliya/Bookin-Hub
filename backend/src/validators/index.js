export const validateRequiredFields = (fields, data) => {
    const missing = [];
    for (const field of fields) {
        if (!data[field]) {
            missing.push(field);
        }
    }
    return missing;
};
