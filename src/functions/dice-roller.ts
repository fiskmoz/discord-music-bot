export class Dice {
  constructor() {}

  public getDieRoll(max: number) {
    return (
      (Math.floor(Math.pow(10, 14) * Math.random() * Math.random()) %
        (max - 1 + 1)) +
      1
    );
  }
}
