import { compare } from 'bcrypt';
import { DocumentData } from 'firebase-admin/firestore';

export const passwordMatches = async (
    password: string,
    userRecord: DocumentData
) => {
    if (userRecord.password) {
        return await compare(password, userRecord.password);
    }
    return false;
};

export const checkPassword = (password: string, confirmPassword?: string) => {
    // Check if the password and confirmPassword fields match
    if (confirmPassword && password !== confirmPassword) {
        return {
            isValid: false,
            error: {
                code: 'password_match_error',
                message: 'As senhas não coincidem',
            },
        };
    }

    // Check if the password is at least 8 characters long
    if (password.length < 8) {
        return {
            isValid: false,
            error: {
                code: 'min_length_error',
                message: 'A senha deve conter pelo menos 8 caracteres',
            },
        };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            error: {
                code: 'lowercase_error',
                message: 'A senha deve conter pelo menos uma letra minúscula',
            },
        };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            error: {
                code: 'uppercase_error',
                message: 'A senha deve conter pelo menos uma letra maiúscula',
            },
        };
    }

    // Check for at least one digit
    if (!/\d/.test(password)) {
        return {
            isValid: false,
            error: {
                code: 'digit_error',
                message: 'A senha deve conter pelo menos um número',
            },
        };
    }

    // Check for at least one special character
    if (!/[@$!%*?&]/.test(password)) {
        return {
            isValid: false,
            error: {
                code: 'special_character_error',
                message: 'A senha deve conter pelo menos um caracter especial',
            },
        };
    }

    // If all conditions are met, return valid
    return { isValid: true, error: null };
};
