type Vector = number[];

export const add = (...vectors: Vector[]) => {
  let result = vectors[0];
  if (vectors.length < 2) {
    return result;
  }

  for (let i = 1; i < vectors.length; i++) {
    let cur = vectors[i];
    if (result.length !== cur.length) throw new Error("vectors addition must have all vector equal size.");
    result = result.map((val, i) => val + cur[i]);
  }
  return result;
};

export const subtract = (...vectors: Vector[]) => {
  let result = vectors[0];
  if (vectors.length < 2) {
    return result;
  }

  for (let i = 1; i < vectors.length; i++) {
    let cur = vectors[i];
    if (result.length !== cur.length) throw new Error("vectors addition must have all vector equal size.");
    result = result.map((val, i) => val - cur[i]);
  }
  return result;
};

export const distance = (v1: Vector, v2: Vector) => {
  return Math.hypot(...subtract(v1, v2));
};

export const equal = (v1: Vector, v2: Vector) => {
  if (v1.length != v2.length) return false;
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] !== v2[i]) return false;
  }
  return true;
};

export const toMatrix = (v: Vector) => {
  const row = v.length;
  let result: number[][] = [];
  for (let i = 0; i < row; i++) {
    result[i] = [v[i]];
  }
  return result;
};
