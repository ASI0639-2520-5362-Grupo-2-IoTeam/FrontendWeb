/**
 * Model class for Google SignIn Request
 */
export class GoogleSignInRequest {
    public googleToken: string;

    /**
     * Constructor for GoogleSignInRequest
     * @param googleToken The Google ID token
     */
    constructor(googleToken: string) {
        this.googleToken = googleToken;
    }
}