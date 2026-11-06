import week01 from './week01.js';
import week02 from './week02.js';
import week03 from './week03.js';
import week04 from './week04.js';
import week05 from './week05.js';
import week06 from './week06.js';
import week07 from './week07.js';
import week08 from './week08.js';
import week09 from './week09.js';
import week10 from './week10.js';
import week11 from './week11.js';
import week12 from './week12.js';

export const weeks = [
  week01,
  week02,
  week03,
  week04,
  week05,
  week06,
  week07,
  week08,
  week09,
  week10,
  week11,
  week12,
];

export const getWeek = (n) => weeks[n - 1];
