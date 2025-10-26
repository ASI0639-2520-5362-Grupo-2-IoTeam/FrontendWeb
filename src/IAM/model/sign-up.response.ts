export class SignUpResponse {
    public id: string;
    public username: string;
    public email: string;
    public role: string;

    constructor(id: string, username: string, email: string, role: string) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }
}
