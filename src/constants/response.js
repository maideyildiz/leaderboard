export const ERRORS = {
    USER_NOT_FOUND: 'User not found',
    USERNAME_PASSWORD_REQUIRED:'Username and password are required',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USERNAME_ALREADY_IN_USE: 'Username already in use',
    ACCESS_DENIED: 'Access denied. No token provided.',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Token expired',
    ENDPOINT_NOT_FOUND: 'Endpoint not found',
    TOO_MANY_REQUESTS: 'Too many requests from this IP, please try again later.',
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    FAILED_TO_CONNECT:'Failed to connect to databases:',
    USER_ID_REQUIRED :'User ID is required.',
    SCORE_INVALID: 'Score should be an integer',
    GAME_ID_INVALID: 'Game ID should be a string',
    PLAYER_NOT_FOUND: 'Player not found',
    INVALID_LIMIT_OR_PAGE:'Invalid limit or page parameter',
    NO_LEADERBOARD_DATA :'No leaderboard data found in the database.',
    USERNAME_REQUIRED :'Username is required.',
    PLAYER_RANK_NOT_FOUND:'Player rank not found'
};

export const SUCCESS = {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'User logged in successfully',
    SCORE_SUBMITTED: 'Score submitted successfully',
    PLAYER_ADDED: 'Player added successfully',
    PLAYER_UPDATED: 'Player updated successfully',
    USER_UPDATED: 'User updated successfully',
    PLAYER_REMOVED: 'Player removed successfully',
    USERS_FETCHED: 'Users fetched successfully',
    PLAYER_FETCHED: 'Player fetched successfully',
    SCORE_SAME :'Score is the same, or less than the existing score. No update made.',
    SCORE_UPDATED :'Score updated' ,
};
