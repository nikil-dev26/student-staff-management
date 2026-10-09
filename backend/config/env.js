const requiredEnv = [
    "MONGO_URI",
    "JWT_SECRET",
    "CLIENT_URL"
];

export const validateEnv = () => {
    const missingEnv = requiredEnv.filter(
        (key) => !process.env[key]
    );

    if (missingEnv.length > 0) {
        throw new Error(
            `Missing environment variables: ${missingEnv.join(", ")}`
        );
    }
};