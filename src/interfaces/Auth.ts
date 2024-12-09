export default interface Auth {
    email: string,
    verificationCode?: string,
    password: string,
    passwordConfirmation?: string
}