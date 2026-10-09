export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPassword = (password) => {
    return typeof password === "string" && password.length >= 6;
};

export const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};