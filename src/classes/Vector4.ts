export class Vector4 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
    public w: number = 0,
  ) {}

  static fromArray(arr: number[]): Vector4 {
    return new Vector4(arr[0], arr[1], arr[2], arr[3]);
  }

  toArray(): number[] {
    return [this.x, this.y, this.z, this.w];
  }

  magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
  }

  add(other: Vector4): Vector4 {
    return new Vector4(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z,
      this.w + other.w,
    );
  }

  subtract(other: Vector4): Vector4 {
    return new Vector4(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z,
      this.w - other.w,
    );
  }

  scale(scalar: number): Vector4 {
    return new Vector4(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar,
      this.w * scalar,
    );
  }

  dot(other: Vector4): number {
    return (
      this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w
    );
  }

  normalize(): Vector4 {
    const mag = this.magnitude();
    if (mag === 0) return new Vector4(0, 0, 0, 0);
    return new Vector4(this.x / mag, this.y / mag, this.z / mag, this.w / mag);
  }

  toString(): string {
    return `Vector4(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
  }

  static zero(): Vector4 {
    return new Vector4(0, 0, 0, 0);
  }

  static one(): Vector4 {
    return new Vector4(1, 1, 1, 1);
  }
}
