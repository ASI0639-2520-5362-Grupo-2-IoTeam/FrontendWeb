export class SignUpResponse {
    public id: number;
    public username: string;
    public roles: string[];

    constructor(id: number, username: string, roles: string[]) {
        this.id = id;
        this.username = username;
        this.roles = roles;
    }
}
