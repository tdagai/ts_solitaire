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

type Node = {
  prev: Node | null;
  next: Node | null;
  data: string; //This may change later, most likely to { card, position }
};

export type {
  Card,
  Node,
  Foundations,
}