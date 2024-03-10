import { RANK, SUIT } from './constants';

type Card = {
  rank: RANK;
  suit: SUIT;
}

type Node = {
  prev: Node | null;
  next: Node | null;
  data: string; //This may change later, most likely to { card, position }
};

export {
  Card,
  Node,
}