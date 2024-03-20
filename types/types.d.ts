import { RANK, SUIT } from '../constants';

type Card = {
  rank: RANK;
  suit: SUIT;
  isVisible: boolean;
};

type Foundations = {
  foundation1: Card[];
  foundation2: Card[];
  foundation3: Card[];
  foundation4: Card[];
};

type GameState = {
  stockpile: Card[];
  waste: Card[];
  foundations: {
    f1: Card[];
    f2: Card[];
    f3: Card[];
    f4: Card[];
  };
  piles: Card[][];
}

export type {
  Card,
  Foundations,
  GameState,
}