declare enum RANK {
    RANK_A = 0,
    RANK_2 = 1,
    RANK_3 = 2,
    RANK_4 = 3,
    RANK_5 = 4,
    RANK_6 = 5,
    RANK_7 = 6,
    RANK_8 = 7,
    RANK_9 = 8,
    RANK_10 = 9,
    RANK_J = 10,
    RANK_Q = 11,
    RANK_K = 12
}
declare enum SUIT {
    HEART = 0,
    DIAMOND = 1,
    CLUB = 2,
    SPADE = 3
}
declare const colors: {
    red: string;
    black: string;
};
declare const errors: {
    invalidMove: Error;
};
export { RANK, SUIT, colors, errors, };
