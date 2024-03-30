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
  invalidTarget: Error('That was not a valid target.'),
  invalidDest: Error('That was not a valid destination.'),
  invalidIndex: Error('That was not a valid index'),
  suitNotMatching: Error('Suit does not match'),
  notInSequence: Error('Cards are not in sequence'),
  notAlternatingColor: Error('Can\'t move a card onto another card if they share a color'),
  notVisibleError: Error('Can\'t move a card that has not been revealed yet'),
  emptyFoundationError: Error('Can\'t move a card that\'s not an Ace onto an empty foundation'),
  emptyWasteError: Error('Can\'t move from an empty waste'),
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