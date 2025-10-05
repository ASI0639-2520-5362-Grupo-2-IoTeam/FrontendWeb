export class SignUpRequest {
    public email: string;
    public password: string;
    public role: string;

    constructor(email: string, password: string, role: string = 'USER') {
        this.email = email;
        this.password = password;
        this.role = role;
    }
}