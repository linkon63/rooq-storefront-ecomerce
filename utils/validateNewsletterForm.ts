import { emailRegex } from "@/utils/regex";

export const validateNewsletterForm = (email: string, agreed: boolean = true) => {

    if (!email) {
        return { success: false, message: "Email is required.", status: 400 };
    }

    if (!emailRegex.test(email)) {
        return { success: false, message: "Please enter a valid email address.", status: 400 };
    }

    if (!agreed) {
        return { success: false, message: "Please agree to the privacy policy.", status: 400 };
    }
    return { success: true, message: "", status: 200 };
};