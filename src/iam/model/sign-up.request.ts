export class SignUpRequest {
    public username: string;
    public email: string;
    public password: string;
    public role: string;

    constructor(username: string, email: string, password: string, role: string = 'USER') {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}