import { RANK, SUIT } from '../constants';

type Card = {
  rank: RANK;
  suit: SUIT;
  isVisible: boolean;
};

type Foundations = {
  f1: Card[];
  f2: Card[];
  f3: Card[];
  f4: Card[];
};

type GameState = {
  stockpile: Card[];
  waste: Card[];
  foundations: Foundations;
  piles: Card[][];
  warning: string;
}

export type {
  Card,
  Foundations,
  GameState,
}