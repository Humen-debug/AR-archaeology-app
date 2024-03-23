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

export const toMatrix = (v: Vector) => {
  const row = v.length;
  let result: number[][] = [];
  for (let i = 0; i < row; i++) {
    result[i] = [v[i]];
  }
  return result;
};
