export const POINTS = { gold: 5, silver: 3, bronze: 1 }

export const computeScore = (gold, silver, bronze) =>
  gold * POINTS.gold + silver * POINTS.silver + bronze * POINTS.bronze
