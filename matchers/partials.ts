/* eslint-disable @typescript-eslint/no-explicit-any */
import { PASS as pass, result } from './result';

function toMatchArrayPartially(actualObjectsArray: any[], expectedObjectsArray: any[]) {
  expect(expectedObjectsArray.length).toBeGreaterThan(0);
  expect(actualObjectsArray.length).toBeGreaterThan(0);

  expect(actualObjectsArray).toEqual(expect.arrayContaining(expectedObjectsArray));

  return result({
    check: pass,
    message: 'Destination array is atleast a subset of the source array',
    expected: expectedObjectsArray,
    actual: actualObjectsArray
  });
}

function toMatchArray(actualObjectsArray: any[], expectedObjectsArray: any[]) {
  expect(actualObjectsArray.length).toEqual(expectedObjectsArray.length);

  return toMatchArrayPartially(actualObjectsArray, expectedObjectsArray);
}

function arrayOfObjectsToHavePartialObject(arrayOfObjects: any[], partialObject: any) {
  expect(arrayOfObjects).toEqual(expect.arrayContaining([expect.objectContaining(partialObject)]));

  return result({
    check: pass,
    message: 'Array of objects has the partial object'
  });
}

expect.extend({
  arrayOfObjectsToHavePartialObject,
  toMatchArrayPartially,
  toMatchArray
});
