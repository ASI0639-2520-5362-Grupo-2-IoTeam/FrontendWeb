export class SignInResponse {
    public id: string;
    public email: string;
    public token: string;
    public role: string;

    constructor(id: string, email: string, token: string, role: string) {
        this.id = id;
        this.email = email;
        this.token = token;
        this.role = role;
    }
}
