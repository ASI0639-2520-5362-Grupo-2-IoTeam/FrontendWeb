export class SignUpResponse {
    public id: string;
    public email: string;
    public role: string;

    constructor(id: string, email: string, role: string) {
        this.id = id;
        this.email = email;
        this.role = role;
    }
}
