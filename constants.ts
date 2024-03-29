enum RANK {
  RANK_A,
  RANK_2,
  RANK_3,
  RANK_4,
  RANK_5,
  RANK_6,
  RANK_7,
  RANK_8,
  RANK_9,
  RANK_10,
  RANK_J,
  RANK_Q,
  RANK_K,
  RANK_COUNT,
};

enum SUIT {
  HEART,
  DIAMOND,
  CLUB,
  SPADE,
  SUIT_COUNT,
};

enum MOVES {
  DRAW,
  MOVE,
};

enum TARGETS {
  STOCKPILE,
  WASTE,
  PILE1,
  PILE2,
  PILE3,
  PILE4,
  PILE5,
  PILE6,
  PILE7,
  FOUNDATION1,
  FOUNDATION2,
  FOUNDATION3,
  FOUNDATION4,
};

const colors = {
  red: '\x1b[31m',
  black: '\x1b[30m'
}

const errors = {
  invalidMove: Error('That was not a valid move.'),
};

// const originalDeck: Card[] = [
//   'A♥', 'A♦', 'A♣', 'A♠',
//   '2♥', '2♦', '2♣', '2♠',
//   '3♥', '3♦', '3♣', '3♠',
//   '4♥', '4♦', '4♣', '4♠',
//   '5♥', '5♦', '5♣', '5♠',
//   '6♥', '6♦', '6♣', '6♠',
//   '7♥', '7♦', '7♣', '7♠',
//   '8♥', '8♦', '8♣', '8♠',
//   '9♥', '9♦', '9♣', '9♠',
//   '10♥', '10♦', '10♣', '10♠',
//   'J♥', 'J♦', 'J♣', 'J♠',
//   'Q♥', 'Q♦', 'Q♣', 'Q♠',
//   'K♥', 'K♦', 'K♣', 'K♠',
// ];

export {
  RANK,
  SUIT,
  MOVES,
  TARGETS,
  colors,
  errors,
}