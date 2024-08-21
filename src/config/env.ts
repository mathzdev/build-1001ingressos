// Parsing the env file.
// dotenv.config({ path: path.resolve(__dirname, '../../.env'), debug: true });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
    NEXTAUTH_SECRET: string | undefined;
    NEXTAUTH_URL: string | undefined;
    NEXTAUTH_PUBLIC_API_URL: string | undefined;
    GOOGLE_AUTH_ID: string | undefined;
    GOOGLE_AUTH_SECRET: string | undefined;
    APPLE_AUTH_ID: string | undefined;
    APPLE_AUTH_SECRET: string | undefined;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string | undefined;
    FIREBASE_CLIENT_EMAIL: string | undefined;
    FIREBASE_PRIVATE_KEY: string | undefined;
    NEXT_PUBLIC_FIREBASE_API_KEY: string | undefined;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string | undefined;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string | undefined;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string | undefined;
    NEXT_PUBLIC_FIREBASE_APP_ID: string | undefined;
    ASAAS_API_MODE: string | undefined;
    ASAAS_API_KEY: string | undefined;
    NEXT_PUBLIC_MP_PUBLIC_KEY: string | undefined;
    MP_ACCESS_TOKEN: string | undefined;
    MP_CLIENT_ID: string | undefined;
    MP_CLIENT_SECRET: string | undefined;
    EMAIL_HOST: string | undefined;
    EMAIL_PORT: number | undefined;
    EMAIL_USER: string | undefined;
    EMAIL_PASSWORD: string | undefined;
    EMAIL_FROM: string | undefined;
    EMAIL_SUBJECT: string | undefined;
}

interface Config {
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_PUBLIC_API_URL: string;
    GOOGLE_AUTH_ID: string;
    GOOGLE_AUTH_SECRET: string;
    APPLE_AUTH_ID: string;
    APPLE_AUTH_SECRET: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    ASAAS_API_MODE: 'SANDBOX' | 'PRODUCTION';
    ASAAS_API_KEY: string;
    NEXT_PUBLIC_MP_PUBLIC_KEY: string;
    MP_ACCESS_TOKEN: string;
    MP_CLIENT_ID: string;
    MP_CLIENT_SECRET: string;
    EMAIL_HOST: string;
    EMAIL_PORT: number;
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
    EMAIL_FROM: string;
    EMAIL_SUBJECT: string;
}

export class EnvError extends Error {
    missingKey: string;

    constructor(missingKey: string) {
        super(`Missing key ${missingKey} in .env`);
        this.missingKey = missingKey;
        this.name = 'EnvError';
    }
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
    return {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_PUBLIC_API_URL: process.env.NEXTAUTH_PUBLIC_API_URL,
        GOOGLE_AUTH_ID: process.env.GOOGLE_AUTH_ID,
        GOOGLE_AUTH_SECRET: process.env.GOOGLE_AUTH_SECRET,
        APPLE_AUTH_ID: process.env.APPLE_AUTH_ID,
        APPLE_AUTH_SECRET: process.env.APPLE_AUTH_SECRET,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID:
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
            process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        ASAAS_API_MODE: process.env.ASAAS_API_MODE,
        ASAAS_API_KEY: process.env.ASAAS_API_KEY,
        NEXT_PUBLIC_MP_PUBLIC_KEY: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
        MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
        MP_CLIENT_ID: process.env.MP_CLIENT_ID,
        MP_CLIENT_SECRET: process.env.MP_CLIENT_SECRET,
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: Number(process.env.EMAIL_PORT),
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
        EMAIL_FROM: process.env.EMAIL_FROM,
        EMAIL_SUBJECT: process.env.EMAIL_SUBJECT,
    };
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new EnvError(key);
        }
    }
    return config as Config;
};

const config = getConfig();

const sanitizedEnv = getSanitzedConfig(config);

export default sanitizedEnv;
