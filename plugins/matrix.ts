import { deg2rad } from "./geolocation";

/**
 * @link
 * https://codereview.stackexchange.com/questions/237674/matrix-multiplication-in-typescript
 */
type Matrix = number[][];

export const columnLengthOf = (a: Matrix) => a[0].length;
export const rowLengthOf = (a: Matrix) => a.length;
export const areValid = (a: Matrix, b: Matrix) => columnLengthOf(a) === rowLengthOf(b);

export const dotProduct = (a: number[], b: number[]) => {
  return a.map((value, i) => value * b[i]).reduce((acc, val) => acc + val, 0);
};
export const generateEmptyMatrix = (rows: number, cols: number): Matrix => {
  return [...Array(rows)].fill(0).map(() => [...Array(cols)].fill(0));
};

export const multiply = (a: Matrix | undefined, b: Matrix | undefined): Matrix => {
  if (a && b && areValid(a, b)) {
    const rows = rowLengthOf(a);
    const cols = columnLengthOf(b);
    return generateEmptyMatrix(rows, cols).map((resultRow, i) =>
      resultRow.map((element: number, j: number) => {
        const column = b.map((row) => row[j]);
        const row = a[i];
        return dotProduct(row, column);
      })
    );
  }
  throw new Error("Matrix sizes of a and b are not valid");
};

export const toVector = (m: Matrix) => {
  if (columnLengthOf(m) < 1) throw new Error("Matrix cannot be empty");
  const row = rowLengthOf(m);
  let result: number[] = [];
  for (let i = 0; i < row; i++) {
    result.push(m[i][0]);
  }
  return result;
};

export const subtract = (...matrices: Matrix[]) => {
  if (matrices.length < 2) return;

  let result = matrices[0];
  for (let i = 1; i < matrices.length; i++) {
    let cur = matrices[i];
    if (rowLengthOf(result) !== rowLengthOf(cur) || columnLengthOf(result) !== columnLengthOf(cur)) {
      return;
    }
    result = result.map((resultRow, i) => resultRow.map((value, j) => value - cur[i][j]));
  }
  return result;
};

export const add = (...matrices: Matrix[]) => {
  if (matrices.length < 2) return;

  let result = matrices[0];
  for (let i = 1; i < matrices.length; i++) {
    let cur = matrices[i];
    if (rowLengthOf(result) !== rowLengthOf(cur) || columnLengthOf(result) !== columnLengthOf(cur)) {
      return;
    }
    result = result.map((resultRow, i) => resultRow.map((value, j) => value + cur[i][j]));
  }
  return result;
};

export const rotate = (m: Matrix, degree: number) => multiply(rotation(degree), m);

export const clockwiseRotate = (m: Matrix, degree: number) => multiply(clockwiseRotation(degree), m);

export const rotate3D = (m: Matrix, degree: number, axis: "x" | "y" | "z" = "y", isInverse: boolean = false) => {
  var rotation: number[][];
  switch (axis) {
    case "x":
      rotation = rotation3X(degree);
      break;
    case "y":
      rotation = rotation3Y(degree);
      break;
    default:
      rotation = rotation3Z(degree);
      break;
  }
  if (isInverse) rotation = inverse(rotation) as Matrix;
  return multiply(rotation, m);
};

/**
 * The vector is initially aligned with x-axis.If a standard right-handed Cartesian coordinate system is used, with the x-axis to the right and the y-axis up,
 * the rotation R(θ) is counterclockwise.
 * @param degree The counterclockwise angle θ from x-axis to y-axis.
 * @returns A standard rotation matrix in two dimensions.
 */
const rotation = (degree: number) => {
  const cos = Math.cos(deg2rad(degree));
  const sin = Math.sin(deg2rad(degree));
  return [
    [cos, -sin],
    [sin, cos],
  ];
};

/**
 * @param degree The clockwise angle θ.
 * @returns Matrix represents a rotation of the **axes clockwise** through an angle θ.
 */
const clockwiseRotation = (degree: number) => {
  const cos = Math.cos(deg2rad(degree));
  const sin = Math.sin(deg2rad(degree));
  return [
    [cos, sin],
    [-sin, cos],
  ];
};

const rotation3X = (degree: number) => {
  const cos = Math.cos(deg2rad(degree));
  const sin = Math.sin(deg2rad(degree));
  return [
    [1, 0, 0],
    [0, cos, -sin],
    [0, sin, cos],
  ];
};

/**
 * For column vectors, each of these basic vector rotations appears counterclockwise when the axis about which they occur points toward the observer,
 * the coordinate system is right-handed, and the angle θ is positive.
 *
 * @example
 * Ry, for instance, would rotate away the z-axis a vector aligned with the x-axis, as can easily be checked by operating with Ry on the vector (1,0,0):
 * Rz(90˚)[1,0,0]^T = [0,0,-1]^T
 *
 * @param degree
 * @returns The 3D rotation matrix along y-axis.
 */
const rotation3Y = (degree: number) => {
  const cos = Math.cos(deg2rad(degree));
  const sin = Math.sin(deg2rad(degree));
  return [
    [cos, 0, sin],
    [0, 1, 0],
    [-sin, 0, cos],
  ];
};

/**
 * For column vectors, each of these basic vector rotations appears counterclockwise when the axis about which they occur points toward the observer,
 * the coordinate system is right-handed, and the angle θ is positive.
 *
 * @example
 * Rz, for instance, would rotate toward the y-axis a vector aligned with the x-axis, as can easily be checked by operating with Rz on the vector (1,0,0):
 * Rz(90˚)[1,0,0]^T = [0,1,0]^T
 *
 * @param degree
 * @returns The 3D rotation matrix along z axis.
 */
const rotation3Z = (degree: number) => {
  const cos = Math.cos(deg2rad(degree));
  const sin = Math.sin(deg2rad(degree));
  return [
    [cos, -sin, 0],
    [sin, cos, 0],
    [0, 0, 1],
  ];
};

/**
 * To get confactor of the matrix m in matrix temp
 * @param m
 * @param temp
 * @param p
 * @param q
 * @param n Current dimension of m
 */
const cofactor = (m: Matrix, temp: Matrix, p: number, q: number, n: number) => {
  let i = 0,
    j = 0;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      // Copying into temporary matrix only those element
      // which are not in given row and column
      if (row !== p && col !== q) {
        temp[i][j++] = m[row][col];
        // Row is filled, so increase row index and
        // reset col index
        if (j === n - 1) {
          j = 0;
          i++;
        }
      }
    }
  }
};

/**
 * Recursive function for finding determinant of matrix.
 * @param m A matrix to compute determinant
 * @param N Origin dimension of matrix m
 * @param n Current dimension of matrix m
 * @returns The determinant of matrix m
 */
const determinant = (m: Matrix, N: number, n: number): number => {
  let D = 0;
  if (n === 1) return m[0][0];
  let temp: Matrix = new Array(N);
  for (let i = 0; i < N; i++) {
    temp[i] = new Array(N);
  }
  let sign = 1;
  for (let f = 0; f < n; f++) {
    cofactor(m, temp, 0, f, n);
    D += sign * m[0][f] * determinant(temp, N, n - 1);
    sign = -sign;
  }

  return D;
};

const adjoint = (m: Matrix, adj: Matrix) => {
  if (areValid(m, adj)) {
    const N = rowLengthOf(m);
    if (N === 1) {
      adj[0][0] = 1;
      return;
    }

    let sign = 1;
    let i = 0,
      j = 0;
    let temp: Matrix = new Array(N);
    for (i = 0; i < N; i++) {
      temp[i] = new Array(N);
    }

    for (i = 0; i < N; i++) {
      for (j = 0; j < N; j++) {
        cofactor(m, temp, i, j, N);
        sign = (i + j) % 2 === 0 ? 1 : -1;
        adj[j][i] = sign * determinant(temp, N, N - 1);
      }
    }
  }
};

export const inverse = (m: Matrix) => {
  if (columnLengthOf(m) === rowLengthOf(m)) {
    const n = rowLengthOf(m);
    const det = determinant(m, n, n);
    if (det === 0) return undefined;
    let i = 0;
    let adj = new Array(n);
    for (i = 0; i < n; i++) {
      adj[i] = new Array(n);
    }
    adjoint(m, adj);

    let inverse = generateEmptyMatrix(n, n);
    for (i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        inverse[i][j] = adj[i][j] / det;
      }
    }
    return inverse;
  }
};
