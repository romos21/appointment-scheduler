import * as moment from 'moment';

const defineTimeOfDate = (date: string | Date) => {
  return moment(date).format('HH:mm');
};

const compareTime = (dateA: string | Date, dateB: string | Date): boolean => {
  const timeA = defineTimeOfDate(dateA);
  const timeB = defineTimeOfDate(dateB);
  return timeA > timeB;
};

export const isTimeAfter = (dateA: string | Date, dateB: string | Date) =>
  compareTime(dateA, dateB);

export const isTimeBefore = (dateA: string | Date, dateB: string | Date) =>
  !compareTime(dateA, dateB);
